import getApiItems from './getApiItems'

export type ApiHighlightItem = {
  id?: string
  stream_id?: string
  user_id?: string
  user_login?: string
  user_name?: string
  title?: string
  description?: string
  created_at?: string
  published_at?: string
  url?: string
  thumbnail_url?: string
  viewable?: string
  view_count?: number
  language?: string
  type?: string
  duration?: string
  muted_segments?: object[]
}

const getRandomUserHighlight = async (
  bearerToken: string,
  userId: string
): Promise<ApiHighlightItem> => {
  console.log('getting highlights by user id')

  const apiHighlights = await getApiItems<ApiHighlightItem>(
    bearerToken,
    `https://api.twitch.tv/helix/videos`,
    `first=100&user_id=${userId}&period=month&type=highlight`
  )

  return apiHighlights[Math.floor(Math.random() * apiHighlights.length)]
}

export default getRandomUserHighlight
