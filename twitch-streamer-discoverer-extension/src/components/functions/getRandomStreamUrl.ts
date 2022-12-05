import getApiStreams, {type ApiStreamItem} from './getApiStreams'

export type GetRandomStreamUrl = {
  bearerToken: string
  viewersMin?: number
  viewersMax?: number
  categories?: string[]
  languages?: string[]
}

const getRandomStreamUrl = async ({
  bearerToken,
  viewersMin,
  viewersMax,
  categories,
  languages
}: GetRandomStreamUrl): Promise<string> => {
  const apiStreams: ApiStreamItem[] = await getApiStreams(
    bearerToken,
    categories,
    languages
  )

  const filteredStreams: ApiStreamItem[] =
    apiStreams.filter(
      stream =>
        stream.viewer_count &&
        stream.viewer_count >= (viewersMin ?? 0) &&
        (!viewersMax || stream.viewer_count <= viewersMax)
    ) ?? []
  console.log('filteredStreams', filteredStreams)

  const randomStreamItem: ApiStreamItem | undefined =
    filteredStreams[Math.floor(Math.random() * filteredStreams.length)]
  console.log('randomStreamItem', randomStreamItem)

  if (!randomStreamItem) throw new Error('No stream found')

  return `https://twitch.tv/${randomStreamItem.user_login}`
}

export default getRandomStreamUrl
