<script lang="ts">
  import {storage} from '../storage'
  import {onMount} from 'svelte'
  import CategorySelect from './CategorySelect.svelte'
  import getRandomStreamUrl from './functions/getRandomStreamUrl'
  import type {ApiCategoryItem} from './functions/getApiCategoriesByName'
  import getCategoryFromChromeUrl from './functions/getCategoryFromChromeUrl'

  // This got complicated 😂
  // TODO: Refactor to use stores, smaller components, more functional, ect.

  export let isAuthorized: boolean

  let randomStreamUrl: string = ''

  let chosenCategories: ApiCategoryItem[] = []

  let showAdvancedOptions: boolean = false
  let mode: 'LINK' | 'GOTO' | 'TIMER_GOTO' = 'TIMER_GOTO'
  let viewersMin: number | undefined
  let viewersMax: number | undefined
  let wantedCountdownTime: number = 30

  let errorMessage: string = ''

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
    }
    setOptionsFromStorage()
  })

  onMount(() => {
    const addCategoryFromUrl = async () => {
      try {
        const {bearerToken, chosenCategories: storedCategories} =
          await storage.get()
        if (!bearerToken) {
          isAuthorized = false
          return
        }

        const urlCategory: ApiCategoryItem | undefined =
          await getCategoryFromChromeUrl(bearerToken, storedCategories)

        if (
          urlCategory &&
          !chosenCategories.find(category => category.id === urlCategory.id)
        ) {
          chosenCategories = [...chosenCategories, urlCategory]
          storage.set({chosenCategories})
        }
      } catch (error) {
        console.log(error)
        errorMessage =
          error instanceof Error ? error.message : 'Error from server'
      }
    }
    addCategoryFromUrl()
  })

  const validate = (): void => {
    if (chosenCategories.length <= 0) {
      errorMessage = 'Select at least one category'
      randomStreamUrl = ''
      return
    }
    errorMessage = ''
  }

  // TODO: Put timer in own component
  const startFindStreamCountdown = (): void => {
    resetNewStreamIntervalLoop()
    randomStreamUrl = ''
    setRandomStreamUrl()
    newStreamTimer = setTimeout(startNewStreamIntervalLoop, 1000)
  }

  const extendFindStreamCountdown = (): void => {
    if (countdownSeconds < 10000) countdownSeconds += wantedCountdownTime
  }

  const startNewStreamIntervalLoop = async (): Promise<void> => {
    if (errorMessage) return

    countdownSeconds -= 1

    if (countdownSeconds > 0) {
      newStreamTimer = setTimeout(startNewStreamIntervalLoop, 1000)
    } else {
      setRandomStreamUrl()
      countdownSeconds = 10
      newStreamTimer = setTimeout(startNewStreamIntervalLoop, 1000)
    }
  }

  const pauseResumeNewStreamIntervalLoop = (): void => {
    if (newStreamTimer) {
      clearTimeout(newStreamTimer)
      newStreamTimer = undefined
    } else {
      newStreamTimer = setTimeout(startNewStreamIntervalLoop, 1000)
    }
  }

  const resetNewStreamIntervalLoop = (): void => {
    countdownSeconds = wantedCountdownTime
    if (newStreamTimer) clearTimeout(newStreamTimer)
  }

  const setRandomStreamUrl = async (): Promise<void> => {
    validate()
    if (errorMessage) return

    try {
      const {bearerToken} = await storage.get()
      if (!bearerToken) {
        isAuthorized = false
        return
      }

      const streamUrl = await getRandomStreamUrl({
        bearerToken,
        viewersMin,
        viewersMax,
        categories: chosenCategories
          .filter(category => category.id)
          .map(category => category.id!),
        languages: ['en']
      })

      if (mode.includes('LINK')) randomStreamUrl = streamUrl
      if (mode.includes('GOTO'))
        chrome.tabs.update({
          url: streamUrl
        })
    } catch (error) {
      console.log('new ERROR', error)
      errorMessage =
        error instanceof Error ? error.message : 'Error from server'
      randomStreamUrl = ''
    }
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
    <button
      class="rounded bg-violet-600 py-2 px-4 font-bold text-white transition-all duration-100
       hover:bg-violet-700"
      on:click={mode.includes('TIMER')
        ? startFindStreamCountdown
        : setRandomStreamUrl}>Get Random Stream</button
    >
    <div class="mt-1 h-6">
      {#if errorMessage}
        <div class="text-lg font-bold text-red-500">{errorMessage}</div>
      {:else if randomStreamUrl}
        <h1 class="text-lg font-bold">
          <a
            class="text-blue-500 hover:text-blue-700"
            href={randomStreamUrl}
            target="_blank"
            rel="noopener noreferrer">{randomStreamUrl}</a
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
