import type {ApiCategoryItem} from './components/functions/getApiCategories'

type IStorage = {
  viewersMin?: number
  viewersMax?: number
  chosenCategories?: ApiCategoryItem[]
}

const defaultStorage: IStorage = {
  viewersMin: 0,
  viewersMax: 0,
  chosenCategories: []
}

export const storage = {
  get: (): Promise<IStorage> =>
    chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
  set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value)
}
