import getRandomFilteredStreams from './getApiFilteredStreams'
import type {ApiStreamItem} from './getApiStreams'
import type {GetRandomStream} from './getRandomStream'
import type {ApiHighlightItem} from './getRandomUserHighlight'
import getRandomUserHighlight from './getRandomUserHighlight'

export type GetRandomStreamHighlight = {
  bearerToken: string
  randomStreamParams: GetRandomStream
  remainingStreams?: ApiStreamItem[]
}

const getRandomStreamHighlight = async ({
  bearerToken,
  randomStreamParams,
  remainingStreams
}: GetRandomStreamHighlight): Promise<ApiHighlightItem> => {
  if (remainingStreams && remainingStreams.length === 0)
    throw new Error('No Highlight found')

  const randomStreams: ApiStreamItem[] =
    remainingStreams ?? (await getRandomFilteredStreams(randomStreamParams))
  console.log('filteredStreams', randomStreams)

  const randomStreamItem: ApiStreamItem | undefined =
    randomStreams[Math.floor(Math.random() * randomStreams.length)]
  if (!randomStreamItem) throw new Error('No stream found')
  console.log('randomStreamItem', randomStreamItem)

  const randomHighlightItem: ApiHighlightItem | undefined =
    await getRandomUserHighlight(bearerToken, randomStreamItem.user_id ?? '')
  if (!randomHighlightItem)
    return getRandomStreamHighlight({
      bearerToken,
      randomStreamParams,
      remainingStreams: randomStreams.filter(
        stream => stream.user_id !== randomStreamItem.user_id
      )
    })
  console.log('randomHighlightItem', randomHighlightItem)

  return randomHighlightItem
}

export default getRandomStreamHighlight
