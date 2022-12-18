import getApiItems from './getApiItems'

export type ApiClipItem = {
  id?: string
  url?: string
  embed_url?: string
  broadcaster_id?: string
  broadcaster_name?: string
  creator_id?: string
  creator_name?: string
  video_id?: string
  game_id?: string
  language?: string
  title?: string
  view_count?: number
  created_at?: string
  thumbnail_url?: string
  duration?: number
  vod_offset?: number
}

const getRandomUserClip = async (
  bearerToken: string,
  broadcasterId: string
): Promise<ApiClipItem | undefined> => {
  console.log('getting clips by broadcaster id')

  const lastMonthDate = new Date(new Date().setDate(new Date().getDate() - 30))

  const apiClips = await getApiItems<ApiClipItem>(
    bearerToken,
    `https://api.twitch.tv/helix/clips`,
    `first=100&broadcaster_id=${broadcasterId}&started_at=${lastMonthDate.toISOString()}&ended_at=${new Date().toISOString()}`
  )

  return apiClips[Math.floor(Math.random() * apiClips.length)]
}

export default getRandomUserClip
