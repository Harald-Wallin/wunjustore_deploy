
// TIMEOUT AND ERRORS – the common requirement in Labb 5:
//   - The request gives up after 5 s, and a status that isn't 2xx or an unexpected answer → we throw
//   - The routes catch it and answer 502. The customer can still order with home delivery.

import {z} from 'zod'

const API_KEY = process.env.POSTNORD_API_KEY ?? ''
// The sandbox. In production: https://api2.postnord.com/...
const URL = 'https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress'

if (!API_KEY) {
  throw new Error('PostNord is not configured, fill in POSTNORD_API_KEY')
}


//PROMPT #1 (läs README Labb 5)
const PostNordAnswer = z.object({
  servicePointInformationResponse: z.object({
    servicePoints: z.array(
      z.object({
        servicePointId: z.string(),
        name: z.string(),
        visitingAddress: z.object({
          streetName: z.string(),
          streetNumber: z.string(),
          postalCode: z.string(),
          city: z.string(),
        }),
      })
    ),
  }),
})


//PROMPT #2
/* --- The 5 service points nearest a postal code --- */
export async function findServicePoints(postalCode){
  const params = new URLSearchParams({
    apikey: API_KEY, // PostNord takes the key in the URL – never log the URL
    returnType: 'json',
    countryCode: 'SE',
    postalCode: postalCode,
    numberOfServicePoints: '5',
  })

  // TIMEOUT: fetch has no timeout of its own – give up after 5 s
  const response = await fetch(`${URL}?${params}`, { signal: AbortSignal.timeout(5_000) })
  if (!response.ok) {
    throw new Error(`PostNord answered ${response.status}`)
  }

  const answer = PostNordAnswer.safeParse(await response.json())
  if (!answer.success) {
    throw new Error(`Unexpected answer from PostNord: ${z.prettifyError(answer.error)}`)
  }

  // PostNord's format → OUR model
  const servicePoints = answer.data.servicePointInformationResponse.servicePoints.map((point) => ({
    id: point.servicePointId,
    name: point.name,
    address: `${point.visitingAddress.streetName} ${point.visitingAddress.streetNumber}, ${point.visitingAddress.city}`,
  }))
  console.log(`\n[POSTNORD] ${servicePoints.length} service points near ${postalCode}`)
  console.log(`\n[POSTNORD] JSON answer: ${JSON.stringify(servicePoints, null, 2)}`)
  return servicePoints
}