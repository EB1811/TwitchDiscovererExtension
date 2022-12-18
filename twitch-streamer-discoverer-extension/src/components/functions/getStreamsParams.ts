const getStreamsParams = (
  categories?: string[],
  languages?: string[]
): string => {
  const basicParams: {readonly [key: string]: string} = {
    first: '100',
    type: 'live'
  }
  const basicParamsString: string = Object.keys(basicParams)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(basicParams[k])}`)
    .join('&')

  const gameIdsParams: string =
    categories
      ?.map(
        catId => `${encodeURIComponent('game_id')}=${encodeURIComponent(catId)}`
      )
      .join('&') ?? ''
  const languageParams: string =
    languages
      ?.map(
        langId =>
          `${encodeURIComponent('language')}=${encodeURIComponent(langId)}`
      )
      .join('&') ?? ''

  return (
    basicParamsString +
    (gameIdsParams ? '&' + gameIdsParams : '') +
    (languageParams ? '&' + languageParams : '')
  )
}

export default getStreamsParams
