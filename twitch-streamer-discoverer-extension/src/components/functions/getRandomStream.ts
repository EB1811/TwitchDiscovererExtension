import getRandomFilteredStreams from './getApiFilteredStreams'
import type {ApiStreamItem} from './getApiStreams'

export type GetRandomStream = {
  bearerToken: string
  viewersMin?: number
  viewersMax?: number
  categories?: string[]
  languages?: string[]
}

const getRandomStream = async (
  params: GetRandomStream
): Promise<ApiStreamItem> => {
  const filteredStreams: ApiStreamItem[] = await getRandomFilteredStreams(
    params
  )
  console.log('filteredStreams', filteredStreams)

  const randomStreamItem: ApiStreamItem | undefined =
    filteredStreams[Math.floor(Math.random() * filteredStreams.length)]
  console.log('randomStreamItem', randomStreamItem)

  if (!randomStreamItem) throw new Error('No stream found')

  return randomStreamItem
}

export default getRandomStream
