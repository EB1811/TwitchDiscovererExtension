import fetchWithError from './fetchWIthError'
import getApiItems from './getApiItems'
import getStreamsParams from './getStreamsParams'

export type ApiStreamItem = {
  id?: string
  user_id?: string
  user_login?: string
  user_name?: string
  game_id?: string
  game_name?: string
  type?: string
  title?: string
  viewer_count?: number
  started_at?: string
  language?: string
  thumbnail_url?: string
  tag_ids?: string[]
  is_mature?: boolean
}

const getApiStreams = async (
  bearerToken: string,
  categories?: string[],
  languages?: string[],
  cursor?: string
): Promise<ApiStreamItem[]> => {
  console.log('getting api streams')

  const apiCategories = await getApiItems<ApiStreamItem>(
    bearerToken,
    `https://api.twitch.tv/helix/streams`,
    getStreamsParams(categories, languages)
  )

  return apiCategories
}

export default getApiStreams
