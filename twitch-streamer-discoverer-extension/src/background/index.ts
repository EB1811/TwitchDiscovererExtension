import {storage} from '../storage'

chrome.alarms.create('validateToken', {
  delayInMinutes: 59,
  periodInMinutes: 59
})

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === 'validateToken') {
    console.log('Background - alarm triggered')
    const {bearerToken, clientSecret} = await storage.get()

    if (bearerToken && !clientSecret) {
      console.log('Background - validating token')
      const url = `https://id.twitch.tv/oauth2/validate`
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `OAuth ${bearerToken}`
        }
      })
      console.log('res', res)

      if (res.status !== 200) {
        storage.set({bearerToken: ''})
      }
    }
  }
})
