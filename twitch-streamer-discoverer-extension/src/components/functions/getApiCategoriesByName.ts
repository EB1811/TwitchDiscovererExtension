import fetchWithError from './FetchWIthError'

export type ApiCategoryItem = {
  id?: string
  name?: string
  box_art_url?: string
}

export type ApiGetCategoriesData = {
  data?: ApiCategoryItem[]
  pagination?: {
    cursor?: string
  }
}

const getApiCategoriesByName = async (
  bearerToken: string,
  name: string
): Promise<ApiCategoryItem[]> => {
  console.log('getting api categories by name')
  const url = `https://api.twitch.tv/helix/search/categories`

  const urlWithQuery = `${url}?query=${name}`
  const res = await fetchWithError<ApiGetCategoriesData>(urlWithQuery, {
    method: 'GET',
    headers: {
      'Client-ID': import.meta.env.VITE_TWITCH_CLIENT_ID,
      Authorization: `Bearer ${bearerToken}`
    }
  })

  return res.data ?? []
}

export default getApiCategoriesByName
