import App from '../components/App.svelte'
import {storage} from '../storage'

const target = document.getElementById('app')

function render() {
  storage.get().then(() => {
    // @ts-ignore
    new App({target})
  })
}

document.addEventListener('DOMContentLoaded', render)
