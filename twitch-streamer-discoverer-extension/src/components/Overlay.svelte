<script lang="ts">
  import ExtensionApp from './ExtensionApp.svelte'
</script>

<div class="overlay">
  <ExtensionApp />
</div>

<style>
  .overlay {
    position: fixed;
    top: 16px;
    left: 16px;
    background-color: white;
    border: 1px solid black;
    padding: 4px;
  }
</style>
