import fetchWithError from './fetchWIthError'

export type ApiResultData<T> = {
  data?: T[]
  pagination?: {
    cursor?: string
  }
}

const getApiItems = async <T>(
  bearerToken: string,
  url: string,
  params?: string,
  cursor?: string
): Promise<T[]> => {
  const paramsWithCursor = cursor
    ? params + (params ? '&' : '') + `after=${cursor}`
    : params
  const urlWithParams =
    `${url}` + (paramsWithCursor ? `?${paramsWithCursor}` : '')

  const res = await fetchWithError<ApiResultData<T>>(urlWithParams, {
    method: 'GET',
    headers: {
      'Client-ID': import.meta.env.VITE_TWITCH_CLIENT_ID,
      Authorization: `Bearer ${bearerToken}`
    }
  })

  return res.pagination?.cursor && (res.data?.length ?? 0) >= 90
    ? [
        ...(res.data ?? []),
        ...(await getApiItems<T>(
          bearerToken,
          url,
          params,
          res.pagination?.cursor
        ))
      ]
    : res.data ?? []
}

export default getApiItems
