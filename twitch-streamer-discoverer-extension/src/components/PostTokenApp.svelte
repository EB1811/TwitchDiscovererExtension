<script lang="ts">
  import {storage} from '../storage'
  import {onMount} from 'svelte'
  import CategorySelect from './CategorySelect.svelte'
  import getRandomStream from './functions/getRandomStream'
  import type {ApiCategoryItem} from './functions/getApiCategoriesByName'
  import getCategoryFromChromeUrl from './functions/getCategoryFromChromeUrl'
  import type {ApiStreamItem} from './functions/getApiStreams'
  import type {ApiClipItem} from './functions/getRandomUserClip'
  import getRandomStreamClip from './functions/getRandomStreamClip'
  import getRandomStreamHighlight from './functions/getRandomStreamHighlight'
  import type {ApiHighlightItem} from './functions/getRandomUserHighlight'

  // This got complicated 😂
  // TODO: Refactor to use stores, smaller components, more functional, ect.

  export let isAuthorized: boolean

  let isLoading: boolean = false
  let errorMessage: string = ''

  let showAdvancedOptions: boolean = false
  let mode: 'LINK' | 'GOTO' | 'TIMER_GOTO' = 'TIMER_GOTO'
  let viewersMin: number | undefined
  let viewersMax: number | undefined
  let wantedCountdownTime: number = 30

  let chosenCategories: ApiCategoryItem[] = []

  const linkTypeOrder: ('STREAM' | 'CLIP' | 'HIGHLIGHT')[] = [
    'STREAM',
    'CLIP',
    'HIGHLIGHT'
  ]
  let linkType: 'STREAM' | 'CLIP' | 'HIGHLIGHT' = 'STREAM'

  let randomUrl: string = ''

  let countdownSeconds: number
  let newStreamTimer: ReturnType<typeof setTimeout> | undefined

  // ? Put this in a function.
  onMount(async () => {
    const setOptionsFromStorage = async () => {
      const storedOptions = await storage.get()

      if (storedOptions.chosenCategories)
        chosenCategories = [
          ...chosenCategories,
          ...storedOptions.chosenCategories
        ]
      if (storedOptions.showAdvancedOptions) showAdvancedOptions = true
      if (storedOptions.mode) mode = storedOptions.mode
      if (storedOptions.viewersMin) viewersMin = storedOptions.viewersMin
      if (storedOptions.viewersMax) viewersMax = storedOptions.viewersMax
      if (storedOptions.wantedCountdownTime)
        wantedCountdownTime = storedOptions.wantedCountdownTime
      if (storedOptions.linkType) linkType = storedOptions.linkType
    }
    setOptionsFromStorage()
  })

  onMount(() => {
    const addCategoryFromUrl = async () => {
      withHandle(async bearerToken => {
        const {chosenCategories: storedCategories} = await storage.get()

        const urlCategory: ApiCategoryItem | undefined =
          await getCategoryFromChromeUrl(bearerToken, storedCategories)

        if (
          urlCategory &&
          !chosenCategories.find(category => category.id === urlCategory.id)
        ) {
          chosenCategories = [...chosenCategories, urlCategory]
          storage.set({chosenCategories})
        }
      })
    }
    addCategoryFromUrl()
  })

  const advanceLinkType = (): void => {
    const currentLinkTypeIndex = linkTypeOrder.indexOf(linkType)
    const nextLinkTypeIndex =
      currentLinkTypeIndex + 1 >= linkTypeOrder.length
        ? 0
        : currentLinkTypeIndex + 1
    linkType = linkTypeOrder[nextLinkTypeIndex]
    storage.set({linkType})
  }

  const getRandomUrlFunction = (): (() => Promise<void>) =>
    linkType === 'STREAM'
      ? getRandomStreamUrl
      : linkType === 'CLIP'
      ? getRandomClipUrl
      : linkType === 'HIGHLIGHT'
      ? getRandomHighlightUrl
      : getRandomStreamUrl

  // TODO: Put timer in own component
  const startFindStreamCountdown = (): void => {
    resetNewStreamIntervalLoop()
    randomUrl = ''

    const randomUrlFunc = getRandomUrlFunction()
    randomUrlFunc()

    newStreamTimer = setTimeout(
      () => startNewStreamIntervalLoop(randomUrlFunc),
      1000
    )
  }

  const extendFindStreamCountdown = (): void => {
    if (countdownSeconds < 10000) countdownSeconds += wantedCountdownTime
  }

  const startNewStreamIntervalLoop = async (
    randomUrlFunc: () => Promise<void>
  ): Promise<void> => {
    if (errorMessage) return

    countdownSeconds -= 1

    if (countdownSeconds > 0) {
      newStreamTimer = setTimeout(
        () => startNewStreamIntervalLoop(randomUrlFunc),
        1000
      )
    } else {
      randomUrlFunc()
      countdownSeconds = wantedCountdownTime
      newStreamTimer = setTimeout(
        () => startNewStreamIntervalLoop(randomUrlFunc),
        1000
      )
    }
  }

  const pauseResumeNewStreamIntervalLoop = (): void => {
    if (newStreamTimer) {
      clearTimeout(newStreamTimer)
      newStreamTimer = undefined
    } else {
      newStreamTimer = setTimeout(
        () => startNewStreamIntervalLoop(getRandomUrlFunction()),
        1000
      )
    }
  }

  const resetNewStreamIntervalLoop = (): void => {
    countdownSeconds = wantedCountdownTime
    if (newStreamTimer) clearTimeout(newStreamTimer)
  }

  const validate = (): void => {
    if (chosenCategories.length <= 0) {
      errorMessage = 'Select at least one category'
      randomUrl = ''
      return
    }
    errorMessage = ''
  }

  const withHandle = async (
    fn: (bearerToken: string) => Promise<void>
  ): Promise<void> => {
    try {
      const {bearerToken} = await storage.get()
      if (!bearerToken) {
        isAuthorized = false
        return
      }

      isLoading = true
      await fn(bearerToken)
    } catch (error) {
      console.log('new ERROR', error)
      errorMessage =
        error instanceof Error ? error.message : 'Error from server'
      randomUrl = ''
    }

    isLoading = false
  }

  const getRandomStreamUrl = async (): Promise<void> => {
    withHandle(async bearerToken => {
      validate()
      if (errorMessage) return

      const randomStream: ApiStreamItem = await getRandomStream({
        bearerToken,
        viewersMin,
        viewersMax,
        categories: chosenCategories
          .filter(category => category.id)
          .map(category => category.id!),
        languages: ['en']
      })

      if (mode.includes('LINK'))
        randomUrl = `https://twitch.tv/${randomStream.user_login}`
      if (mode.includes('GOTO'))
        chrome.tabs.update({
          url: `https://twitch.tv/${randomStream.user_login}`
        })
    })
  }

  const getRandomClipUrl = async (): Promise<void> => {
    withHandle(async bearerToken => {
      validate()
      if (errorMessage) return

      const randomClip: ApiClipItem | undefined = await getRandomStreamClip({
        bearerToken,
        randomStreamParams: {
          bearerToken,
          viewersMin,
          viewersMax,
          categories: chosenCategories
            .filter(category => category.id)
            .map(category => category.id!),
          languages: ['en']
        }
      })

      if (mode.includes('LINK'))
        randomUrl = `https://twitch.tv/${randomClip.broadcaster_name}/clip/${randomClip.id}`
      if (mode.includes('GOTO'))
        chrome.tabs.update({
          url: `https://twitch.tv/${randomClip.broadcaster_name}/clip/${randomClip.id}`
        })
    })
  }

  const getRandomHighlightUrl = async (): Promise<void> => {
    withHandle(async bearerToken => {
      validate()
      if (errorMessage) return

      const randomHighlight: ApiHighlightItem | undefined =
        await getRandomStreamHighlight({
          bearerToken,
          randomStreamParams: {
            bearerToken,
            viewersMin,
            viewersMax,
            categories: chosenCategories
              .filter(category => category.id)
              .map(category => category.id!),
            languages: ['en']
          }
        })

      if (mode.includes('LINK'))
        randomUrl = `https://twitch.tv/videos/${randomHighlight.id}`
      if (mode.includes('GOTO'))
        chrome.tabs.update({
          url: `https://twitch.tv/videos/${randomHighlight.id}`
        })
    })
  }
</script>

<div class="mt-1">
  <div class="">
    <button
      class="relative w-full border-t border-gray-600 p-1 transition-colors duration-100
       hover:border-violet-500"
      on:click={() => {
        {
          showAdvancedOptions = !showAdvancedOptions
          storage.set({showAdvancedOptions})
        }
      }}
    >
      {#if !showAdvancedOptions}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="absolute left-0 right-0 top-0 m-auto h-3 w-3 rounded-lg text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="absolute left-0 right-0 top-0 m-auto h-3 w-3 rounded-lg text-gray-400"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M4.5 15.75l7.5-7.5 7.5 7.5"
          />
        </svg>
      {/if}
    </button>
  </div>
  {#if showAdvancedOptions}
    <div class="">
      <div class="my-1 flex">
        <select
          bind:value={mode}
          on:change={() => storage.set({mode})}
          class="flex-1 rounded-md border border-neutral-700 bg-black px-2 py-1 text-gray-100 
          transition duration-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
        >
          <option value="LINK">Show link to new stream</option>
          <option value="GOTO">Go to new stream</option>
          <option value="TIMER_GOTO">Go to new stream with timer</option>
        </select>
        {#if mode === 'TIMER_GOTO'}
          <div class="relative">
            <input
              type="number"
              min="0"
              placeholder="Time"
              bind:value={wantedCountdownTime}
              on:input={() => storage.set({wantedCountdownTime})}
              class="w-full rounded-md border border-neutral-700 bg-black py-1 pl-2 pr-7 text-neutral-100
               placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent
                focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            {#if wantedCountdownTime}
              <div
                class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-neutral-500"
              >
                sec
              </div>
            {/if}
          </div>
        {/if}
      </div>
      <div class="mx-auto flex w-full max-w-md items-center justify-center">
        <input
          type="number"
          min="0"
          placeholder="Min viewers"
          bind:value={viewersMin}
          on:input={() => storage.set({viewersMin})}
          class="w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100
           placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent focus:outline-none
            focus:ring-1
           focus:ring-violet-500 "
        />
        <input
          type="number"
          min="0"
          placeholder="Max viewers"
          bind:value={viewersMax}
          on:input={() => storage.set({viewersMax})}
          class="ml-1 w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100
           placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent focus:outline-none
            focus:ring-1 focus:ring-violet-500"
        />
      </div>
    </div>
  {/if}
  <CategorySelect bind:isAuthorized bind:errorMessage bind:chosenCategories />

  <div
    class="mt-5 flex flex-grow flex-col items-center justify-center py-2 lg:mt-6"
  >
    <div class="relative flex w-full">
      <button class="absolute left-10 h-full " on:click={advanceLinkType}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          stroke="currentColor"
          class="h-3 w-3 fill-gray-400 transition-colors duration-100 hover:fill-violet-500"
        >
          <path
            d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96H320v32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32V64H160C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96H192V352c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6V448H352c88.4 0 160-71.6 160-160z"
          />
        </svg>
      </button>
      {#if linkType === 'STREAM'}
        <button
          class="mx-auto w-36 rounded bg-violet-600 py-2 font-bold text-white transition-all duration-100
       hover:bg-violet-700"
          on:click={mode.includes('TIMER')
            ? startFindStreamCountdown
            : getRandomStreamUrl}>Get Random Stream</button
        >
      {:else if linkType === 'CLIP'}
        <button
          class="mx-auto w-36 rounded bg-violet-600 py-2 font-bold text-white transition-all duration-100
     hover:bg-violet-700"
          on:click={mode.includes('TIMER')
            ? startFindStreamCountdown
            : getRandomClipUrl}>Get Random Clip</button
        >
      {:else if linkType === 'HIGHLIGHT'}
        <button
          class="mx-auto w-36 rounded bg-violet-600 py-2 font-bold text-white transition-all duration-100
     hover:bg-violet-700"
          on:click={mode.includes('TIMER')
            ? startFindStreamCountdown
            : getRandomHighlightUrl}>Get Random Highlight</button
        >
      {/if}
    </div>
    <div class="mt-1 flex h-6 max-w-xs justify-center px-6">
      {#if isLoading}
        <div class="mt-2">
          <svg
            class="mx-auto inline h-5 w-5 animate-spin fill-violet-600 text-gray-200"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span class="sr-only">Loading...</span>
        </div>
      {:else if errorMessage}
        <div class="text-lg font-bold text-red-500">{errorMessage}</div>
      {:else if randomUrl}
        <h1
          class="overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-bold text-blue-500 "
        >
          <a
            class="text-blue-500 hover:text-blue-600"
            href={randomUrl}
            target="_blank"
            rel="noopener noreferrer">{randomUrl.split('https://')[1]}</a
          >
        </h1>
      {:else if countdownSeconds}
        <div class="relative">
          <button
            on:click={pauseResumeNewStreamIntervalLoop}
            class="text-lg font-bold text-gray-50 transition-colors duration-100 hover:text-blue-200"
          >
            {countdownSeconds}
          </button>
          <button
            on:click={extendFindStreamCountdown}
            class="absolute ml-1 text-lg font-bold text-gray-300 transition-colors duration-100
             hover:text-blue-200"
          >
            +
          </button>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
</style>
