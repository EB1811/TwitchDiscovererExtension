import {storage} from '../storage'

// chrome.alarms.create('validateToken', {
//   delayInMinutes: 0.05,
//   periodInMinutes: 0.05
// })

// chrome.alarms.onAlarm.addListener(async alarm => {
//   if (alarm.name === 'validateToken') {
//     const {bearerToken} = await storage.get()

//     if (bearerToken) {
//       console.log('Background - validating token')
//       const url = `https://id.twitch.tv/oauth2/validate`
//       const res = await fetch(url, {
//         method: 'GET',
//         headers: {
//           Authorization: `OAuth ${bearerToken}`
//         }
//       })
//       console.log('res', res)

//       if (res.status !== 200) {
//         storage.set({bearerToken: ''})
//       }
//     }
//   }
// })
