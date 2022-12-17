import type {ApiStreamItem} from './getApiStreams'
import getApiStreams from './getApiStreams'
import type {GetRandomStream} from './getRandomStream'

const getRandomFilteredStreams = async ({
  bearerToken,
  viewersMin,
  viewersMax,
  categories,
  languages
}: GetRandomStream): Promise<ApiStreamItem[]> =>
  (await getApiStreams(bearerToken, categories, languages)).filter(
    stream =>
      stream.viewer_count &&
      stream.viewer_count >= (viewersMin ?? 0) &&
      (!viewersMax || stream.viewer_count <= viewersMax)
  ) ?? []

export default getRandomFilteredStreams
