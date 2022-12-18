import getApiItems from './getApiItems'

export type ApiCategoryItem = {
  id?: string
  name?: string
  box_art_url?: string
}

const getApiCategoriesByName = async (
  bearerToken: string,
  name: string
): Promise<ApiCategoryItem[]> => {
  console.log('getting api categories by name')

  const apiCategories = await getApiItems<ApiCategoryItem>(
    bearerToken,
    `https://api.twitch.tv/helix/search/categories`,
    `query=${name}`
  )

  return apiCategories
}

export default getApiCategoriesByName
