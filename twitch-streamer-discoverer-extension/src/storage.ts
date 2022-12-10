import type {ApiCategoryItem} from './components/functions/getApiCategoriesByName'

type IStorage = {
  bearerToken?: string
  showAdvancedOptions?: boolean
  mode?: 'LINK' | 'GOTO' | 'TIMER_GOTO' | ''
  viewersMin?: number
  viewersMax?: number
  wantedCountdownTime?: number
  chosenCategories?: ApiCategoryItem[]
  developerMode?: boolean
  clientId?: string
  clientSecret?: string
}

const defaultStorage: IStorage = {
  bearerToken: '',
  showAdvancedOptions: false,
  mode: '',
  viewersMin: 0,
  viewersMax: 0,
  wantedCountdownTime: 0,
  chosenCategories: [],
  developerMode: false,
  clientId: '',
  clientSecret: ''
}

export const storage = {
  get: (): Promise<IStorage> =>
    chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
  set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value)
}
