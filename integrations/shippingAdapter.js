
// TIMEOUT AND ERRORS – the common requirement in Labb 5:
//   - The request gives up after 5 s, and a status that isn't 2xx or an unexpected answer → we throw
//   - The routes catch it and answer 502. The customer can still order with home delivery.

import {z} from 'zod'

const API_KEY = process.env.POSTNORD_API_KEY ?? ''
// The sandbox. In production: https://api2.postnord.com/...
const URL = 'https://atapi2.postnord.com/rest/businesslocation/v5/servicepoints/nearest/byaddress'
const TRANSIT_TIME_URL = 'https://atapi2.postnord.com/rest/transport/v2/transittime/addresstoaddress'

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

//PROMPT 11
const TransitTimeResult = z.object({
  service: z.object({
    basicServiceCode: z.union([z.string(), z.number()]),
    name: z.string().min(1),
  }),
  estimatedTimeOfArrival: z.object({
    timeOfArrival: z.string().min(1),
  }).optional(),
  isSupported: z.boolean(),
  isBookable: z.boolean(),
  errorMessage: z.string().optional(),
})

export async function getDeliveryEstimate({
  serviceCode,
  originPostalCode,
  destinationPostalCode,
  startTime,
}) {
  const params = new URLSearchParams({
    apikey: API_KEY,
    startTime,
    serviceCodes: String(serviceCode),
    originPostalCode,
    originCountryCode: 'SE',
    destinationPostalCode,
    destinationCountryCode: 'SE',
  })

  let response
  try {
    response = await fetch(`${TRANSIT_TIME_URL}?${params}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5_000),
    })
  } catch (error) {
    throw new Error(`PostNord transit time request failed: ${error.message}`)
  }

  if (!response.ok) {
    throw new Error(`PostNord transit time answered ${response.status}`)
  }

  let payload
  try {
    payload = await response.json()
  } catch (error) {
    throw new Error(`Invalid JSON from PostNord transit time: ${error.message}`)
  }

  const answer = z.array(TransitTimeResult).safeParse(payload)
  if (!answer.success) {
    throw new Error(`Unexpected transit time answer from PostNord: ${z.prettifyError(answer.error)}`)
  }

  const usableResults = answer.data.filter((result) =>
    result.isSupported
    && result.isBookable
    && String(result.service.basicServiceCode) === String(serviceCode)
    && isValidArrivalTime(result.estimatedTimeOfArrival?.timeOfArrival)
  )

  if (usableResults.length === 0) {
    return null
  }

  const selectedResult = usableResults
    .sort((left, right) => {
      const leftPriority = serviceCode === 19
        && left.service.name === 'PostNord Service Point' ? 0 : 1
      const rightPriority = serviceCode === 19
        && right.service.name === 'PostNord Service Point' ? 0 : 1

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority
      }

      return left.estimatedTimeOfArrival.timeOfArrival
        .localeCompare(right.estimatedTimeOfArrival.timeOfArrival)
    })[0]

  const estimatedDeliveryTime = selectedResult.estimatedTimeOfArrival.timeOfArrival
  return {
    estimatedDeliveryDate: estimatedDeliveryTime.slice(0, 10),
    estimatedDeliveryTime: estimatedDeliveryTime.slice(0, 16),
    serviceName: selectedResult.service.name,
  }
}

function isValidArrivalTime(value) {
  if (typeof value !== 'string') {
    return false
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::\d{2})?$/.exec(value)
  if (!match) {
    return false
  }

  const [, year, month, day, hour, minute] = match
  const date = new Date(Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute)
  ))

  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day)
    && date.getUTCHours() === Number(hour)
    && date.getUTCMinutes() === Number(minute)
}