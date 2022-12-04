<script lang="ts">
  import {storage} from '../storage'
  import {onMount} from 'svelte'
  import TailwindCss from './TailwindCSS.svelte'
  // import Board from './lib/Board.svelte'
  import CategorySelect from './CategorySelect.svelte'
  import getBearerOAuthToken from './functions/getBearerOAuthToken'
  import getRandomStreamUrl from './functions/getRandomStreamUrl'
  import type {ApiCategoryItem} from './functions/getApiCategories'
  import getCategoryFromChromeUrl from './functions/getCategoryFromChromeUrl'
  import getTwitchAuthFlowToken from './functions/getTwitchAuthFlowToken'

  let randomStreamUrl: string = ''
  export let bearerToken: string
  let chosenCategories: ApiCategoryItem[] = []
  let viewersMin: number | undefined
  let viewersMax: number | undefined

  let errorMessage: string = ''

  // ? Put this in a function.
  onMount(async () => {
    const setOptionsFromStorage = async () => {
      const storedOptions = await storage.get()
      console.log('storedOptions', storedOptions)
      if (storedOptions.chosenCategories)
        chosenCategories = [
          ...chosenCategories,
          ...storedOptions.chosenCategories
        ]
      if (storedOptions.viewersMin) viewersMin = storedOptions.viewersMin
      if (storedOptions.viewersMax) viewersMax = storedOptions.viewersMax
    }
    setOptionsFromStorage()
  })

  onMount(() => {
    const addCategoryFromUrl = async () => {
      const urlCategory: ApiCategoryItem | undefined =
        await getCategoryFromChromeUrl(bearerToken)

      if (
        urlCategory &&
        !chosenCategories.find(category => category.id === urlCategory.id)
      ) {
        chosenCategories = [...chosenCategories, urlCategory]
        storage.set({chosenCategories})
      }
    }
    addCategoryFromUrl()
  })

  const setRandomStreamUrl = async (): Promise<void> => {
    if (chosenCategories.length <= 0) {
      errorMessage = 'Select at least one category'
      randomStreamUrl = ''
      return
    }
    errorMessage = ''

    try {
      randomStreamUrl = await getRandomStreamUrl({
        bearerToken,
        viewersMin,
        viewersMax,
        categories: chosenCategories
          .filter(category => category.id)
          .map(category => category.id!),
        languages: ['en']
      })
      // getApiCategoriesByName(bearerToken, 'pokemon')
      // getApiCategories(bearerToken)
    } catch (error) {
      console.log(error)
      errorMessage =
        error instanceof Error ? error.message : 'Error from server'
      randomStreamUrl = ''
    }
  }
</script>

<div>
  <div class="mx-auto flex w-full max-w-md items-center justify-center">
    <input
      type="number"
      min="0"
      placeholder="Min viewers"
      bind:value={viewersMin}
      on:input={() => storage.set({viewersMin})}
      class="w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100 placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent focus:outline-none focus:ring-1 focus:ring-violet-500"
    />
    <input
      type="number"
      min="0"
      placeholder="Max viewers"
      bind:value={viewersMax}
      on:input={() => storage.set({viewersMax})}
      class="ml-1 w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100 placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent focus:outline-none focus:ring-1 focus:ring-violet-500"
    />
  </div>
  <CategorySelect {bearerToken} bind:chosenCategories />

  <div
    class="mt-5 flex flex-grow flex-col items-center justify-center py-2 lg:mt-6"
  >
    <button
      class="rounded bg-violet-600 py-2 px-4 font-bold text-white transition-all duration-100 hover:bg-violet-700"
      on:click={setRandomStreamUrl}>Get Random Stream</button
    >
    <div class="mt-1 h-6">
      {#if errorMessage}
        <div class="text-lg font-bold text-red-500">{errorMessage}</div>
      {/if}
      <h1 class="text-lg font-bold text-gray-300">
        <a
          class="text-blue-500 hover:text-blue-700"
          href={randomStreamUrl}
          target="_blank"
          rel="noopener noreferrer">{randomStreamUrl}</a
        >
      </h1>
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
