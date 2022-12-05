const validateAuthToken = async (authToken: string): Promise<boolean> => {
  console.log('validating auth token')
  const url = `https://id.twitch.tv/oauth2/validate`
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `OAuth ${authToken}`
    }
  })

  if (res.status === 200) return true

  return false
}

export default validateAuthToken
