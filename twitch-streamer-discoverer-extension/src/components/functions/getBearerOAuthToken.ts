const getBearerOAuthToken = async (
  clientId: string = import.meta.env.VITE_TWITCH_CLIENT_ID,
  clientSecret: string = import.meta.env.VITE_TWITCH_CLIENT_SECRET
): Promise<string> => {
  console.log('getting bearer token')
  const url = `https://id.twitch.tv/oauth2/token`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
  })
  const data = await res.json()
  return data.access_token as string
}

export default getBearerOAuthToken
