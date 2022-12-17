import getRandomFilteredStreams from './getApiFilteredStreams'
import type {ApiStreamItem} from './getApiStreams'
import type {GetRandomStream} from './getRandomStream'
import type {ApiClipItem} from './getRandomUserClip'
import getRandomUserClip from './getRandomUserClip'

export type GetRandomStreamClip = {
  bearerToken: string
  randomStreamParams: GetRandomStream
  remainingStreams?: ApiStreamItem[]
}

const getRandomStreamClip = async ({
  bearerToken,
  randomStreamParams,
  remainingStreams
}: GetRandomStreamClip): Promise<ApiClipItem> => {
  if (remainingStreams && remainingStreams.length === 0)
    throw new Error('No clip found')

  const randomStreams: ApiStreamItem[] =
    remainingStreams ?? (await getRandomFilteredStreams(randomStreamParams))
  console.log('filteredStreams', randomStreams)

  const randomStreamItem: ApiStreamItem | undefined =
    randomStreams[Math.floor(Math.random() * randomStreams.length)]
  if (!randomStreamItem) throw new Error('No stream found')
  console.log('randomStreamItem', randomStreamItem)

  const randomClipItem: ApiClipItem | undefined = await getRandomUserClip(
    bearerToken,
    randomStreamItem.user_id ?? ''
  )
  if (!randomClipItem)
    return getRandomStreamClip({
      bearerToken,
      randomStreamParams,
      remainingStreams: randomStreams.filter(
        stream => stream.user_id !== randomStreamItem.user_id
      )
    })
  console.log('randomClipItem', randomClipItem)

  return randomClipItem
}

export default getRandomStreamClip

// * Functional version. Might result in a stack overflow however 😭
// const randomStreamItem: ApiStreamItem | undefined =
// randomStreams[Math.floor(Math.random() * randomStreams.length)]
// if (!randomStreamItem) throw new Error('No stream found')

// const randomClip: ApiClipItem | undefined = await getRandomUserClip(
// bearerToken,
// randomStreamItem.user_id ?? ''
// )
// if (!randomClip)
// return getRandomStreamClip({
//   bearerToken,
//   randomStreamParams,
//   remainingStreams: randomStreams.filter(
//     stream => stream.user_id !== randomStreamItem.user_id
//   )
// })
