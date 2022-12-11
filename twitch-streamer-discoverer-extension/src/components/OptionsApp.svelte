<script lang="ts">
  import {storage} from '../storage'
  import {onMount} from 'svelte'
  import TailwindCss from './TailwindCSS.svelte'

  let developerMode: boolean = false

  let clientId: string = ''
  let clientSecret: string = ''

  onMount(async () => {
    const setOptionsFromStorage = async () => {
      const storedOptions = await storage.get()

      if (storedOptions.developerMode) developerMode = true
      if (storedOptions.clientId) clientId = storedOptions.clientId
      if (storedOptions.clientSecret) clientSecret = storedOptions.clientSecret
    }
    setOptionsFromStorage()
  })
</script>

<TailwindCss />
<main class="flex flex-col bg-neutral-900 p-4">
  <div class="mx-auto">
    <span class="text-md text-center font-bold text-gray-200"
      >Developer Mode</span
    >
    <input
      type="checkbox"
      bind:checked={developerMode}
      on:change={() => storage.set({developerMode})}
    />
  </div>

  {#if developerMode}
    <div class="mx-auto mt-5 flex w-full max-w-md items-center justify-center">
      <input
        type="password"
        placeholder="Client ID"
        bind:value={clientId}
        on:input={() => storage.set({clientId})}
        class="w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100
        placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent
        focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
      <input
        type="password"
        placeholder="Client Secret"
        bind:value={clientSecret}
        on:input={() => storage.set({clientSecret})}
        class="ml-1 w-full rounded-md border border-neutral-700 bg-black px-2 py-1 text-neutral-100
        placeholder-gray-500 transition duration-300 ease-in-out focus:border-transparent
        focus:outline-none focus:ring-1 focus:ring-violet-500"
      />
    </div>
  {/if}
</main>
