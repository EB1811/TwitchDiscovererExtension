<script lang="ts">
  import {storage} from '../storage'
  import type {ApiCategoryItem} from './functions/getApiCategories'
  import getApiCategoriesByName from './functions/getApiCategoriesByName'

  // import type {ApiCategoryItem} from './functions/getApiCategories'
  // import getApiCategoriesByName from './functions/getApiCategoriesByName'

  export let bearerToken: string
  export let chosenCategories: ApiCategoryItem[] = []

  let searchTerm: string = ''
  let waitingForApi: boolean = false
  let suggestedCategories: ApiCategoryItem[] = []

  let suggestionsTimer: ReturnType<typeof setTimeout>

  const setSuggestionsFromApi = async (): Promise<void> => {
    if (!waitingForApi && searchTerm.length > 3) {
      clearTimeout(suggestionsTimer)
      suggestionsTimer = setTimeout(async () => {
        console.log('searching for categories')
        waitingForApi = true
        suggestedCategories = (
          await getApiCategoriesByName(bearerToken, searchTerm)
        ).filter(
          category =>
            !chosenCategories.find(
              chosenCategory => chosenCategory.id === category.id
            )
        )
        waitingForApi = false
      }, 300)
    }
    if (searchTerm.length < 3) {
      suggestedCategories = []
    }
  }

  const addCategory = (suggestion: ApiCategoryItem): void => {
    if (
      suggestion.id &&
      !chosenCategories.find(category => category.id === suggestion.id)
    ) {
      chosenCategories = [...chosenCategories, suggestion]
      storage.set({chosenCategories})

      // suggestedCategories = suggestedCategories.filter(
      //   category => category.id !== suggestion.id
      // )
      // setSuggestionsFromApi()
      searchTerm = ''
      suggestedCategories = []
    }
  }
</script>

<div class="mx-auto flex w-full max-w-md flex-col justify-center py-1">
  <div class="relative w-full">
    <div class="">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          /></svg
        >
      </div>
      <label for="search" class="sr-only">Search</label>
      <input
        id="search"
        type="text"
        placeholder="Search for a category"
        class="block w-full rounded-md border border-neutral-700 bg-black py-2 pl-10 pr-3 leading-5 text-white placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 sm:text-sm"
        bind:value={searchTerm}
        on:input={setSuggestionsFromApi}
      />
      {#if searchTerm.length > 0}
        <button
          class="absolute inset-y-0 right-0 mr-3"
          on:click={() => {
            searchTerm = ''
            suggestedCategories = []
          }}
        >
          <svg
            class="h-3 w-3 text-violet-200 dark:text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 21 21"
            xmlns="http://www.w3.org/2000/svg"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M6 18L18 6M6 6l12 12"
            /></svg
          >
        </button>
      {/if}
    </div>
    <div
      class="absolute z-10 mt-1 max-h-28 w-full overflow-y-auto rounded-lg bg-neutral-800 shadow"
    >
      {#each suggestedCategories as suggestion}
        <button class="w-full" on:click={() => addCategory(suggestion)}>
          <div
            class="flex items-center justify-between bg-neutral-900 p-2 transition-colors duration-100 ease-in-out hover:bg-gray-800"
          >
            <span class="w-full text-left text-xs font-bold text-white"
              >{suggestion.name}
            </span>
          </div>
        </button>
      {/each}
    </div>
  </div>
  <div
    class="mt-2 max-h-20 overflow-y-auto overflow-x-hidden rounded-md lg:max-h-40"
    id="category-scroll"
  >
    {#if chosenCategories.length < 1}
      <div class="h-8" />
    {/if}
    {#each chosenCategories as chosenCategory}
      <div class="my-1 mx-1 inline-flex">
        <button
          on:click={() => (
            (chosenCategories = chosenCategories.filter(
              category => category.id !== chosenCategory.id
            )),
            storage.set({chosenCategories})
          )}
        >
          <div
            class="inline-flex items-center rounded-full bg-violet-600 px-2 py-1 text-xs font-semibold text-gray-50 transition-all duration-100 hover:bg-violet-700"
          >
            <span>{chosenCategory.name}</span>
            <span class="ml-1">
              <svg
                class="h-3 w-3 text-violet-200 dark:text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 21 21"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M6 18L18 6M6 6l12 12"
                /></svg
              >
            </span>
          </div>
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  #category-scroll::-webkit-scrollbar {
    width: 4px;
    cursor: pointer;
    /*background-color: rgba(229, 231, 235, var(--bg-opacity));*/
  }
  #category-scroll::-webkit-scrollbar-track {
    background-color: rgba(229, 231, 235, var(--bg-opacity));
    cursor: pointer;
    /*background: red;*/
  }
  #category-scroll::-webkit-scrollbar-thumb {
    cursor: pointer;
    background-color: #a0aec0;
    /*outline: 1px solid slategrey;*/
  }
</style>
