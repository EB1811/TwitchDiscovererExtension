import OptionsApp from '../components/OptionsApp.svelte'
import {storage} from '../storage'

const target = document.getElementById('app')

function render() {
  storage.get().then(() => {
    // @ts-ignore
    new OptionsApp({target})
  })
}

document.addEventListener('DOMContentLoaded', render)
