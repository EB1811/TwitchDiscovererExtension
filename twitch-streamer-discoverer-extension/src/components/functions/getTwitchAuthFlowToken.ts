const getTwitchAuthFlowToken = async (interactive: boolean): Promise<string> =>
  new Promise((resolve, reject) => {
    console.log('getting twitch auth flow token')
    const url = `https://id.twitch.tv/oauth2/authorize`

    const randomState = Math.random().toString(36).substring(2, 15)
    const authParams: {readonly [key: string]: string} = {
      client_id: import.meta.env.VITE_TWITCH_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_TWITCH_REDIRECT_URI,
      response_type: 'token id_token',
      scope: 'openid',
      state: randomState
    }
    const urlWithParams = `${url}?${Object.keys(authParams)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(authParams[k])}`)
      .join('&')}`

    chrome.identity.launchWebAuthFlow(
      {
        url: urlWithParams,
        interactive
      },
      redirectUrl => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message)
          reject('Not Authorized')
        }

        console.log('redirectUrl', redirectUrl)
        console.log('stringify redirectUrl', JSON.stringify(redirectUrl))

        const accessToken = redirectUrl?.substring(
          redirectUrl?.indexOf('#access_token=') + 14,
          redirectUrl?.indexOf('&')
        )
        console.log('accessToken', accessToken)

        if (accessToken) resolve(accessToken)
        else reject('Not Authorized')
      }
    )
  })

export default getTwitchAuthFlowToken
