type ServerError = {
  readonly status?: number
  readonly error?: string
  readonly message?: string
}

const fetchWithError = async <T>(
  url: string,
  options: RequestInit
): Promise<T> => {
  const res = await fetch(url, options)
  const resJson: T | ServerError = await res.json()
  console.log('resJson', resJson)

  if (!res.ok) throw new Error((resJson as ServerError).error ?? 'Server Error')

  return resJson as T
}

export default fetchWithError
