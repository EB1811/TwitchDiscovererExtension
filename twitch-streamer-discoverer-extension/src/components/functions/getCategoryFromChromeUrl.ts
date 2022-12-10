import type {ApiCategoryItem} from './getApiCategoriesByName'
import getApiCategoriesByName from './getApiCategoriesByName'

const getCategoryFromChromeUrl = async (
  bearerToken: string,
  currentCategories?: ApiCategoryItem[]
): Promise<ApiCategoryItem | undefined> => {
  console.log('getting category from chrome url')

  const tabUrl: string | undefined = (
    await chrome.tabs.query({active: true, lastFocusedWindow: true})
  )[0]?.url
  if (!tabUrl?.includes('twitch.tv/directory/game/')) return

  const categoryName: string = decodeURIComponent(
    tabUrl.split('twitch.tv/directory/game/')[1]?.split('?')[0] ?? ''
  )
  if (!categoryName) return
  console.log('categoryName', categoryName)

  if (
    currentCategories &&
    currentCategories.find(
      (category: ApiCategoryItem) => category.name === categoryName
    )
  )
    return

  const category: ApiCategoryItem | undefined = (
    await getApiCategoriesByName(bearerToken, categoryName)
  ).find((category: ApiCategoryItem) => category.name === categoryName)

  return category
}

export default getCategoryFromChromeUrl
