import axios from "axios"
import {
  ItemData,
  WeatherData,
  WeatherRequestParams,
  WeatherResponse,
} from "@/types"

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

let controller: AbortController | null = null

export const getWetherData = async (
  from: number,
  to: number,
  lat: number,
  lon: number
): Promise<Readonly<WeatherData>> => {
  const params: WeatherRequestParams = {
    latitude: lat,
    longitude: lon,
    start_date: `${from}-01-01`,
    end_date: `${to}-12-31`,
    daily: "temperature_2m_max,precipitation_sum",
  }

  if (controller) {
    controller.abort()
  }

  controller = new AbortController()
  const signal = controller.signal

  try {
    const res = await axios.get(ARCHIVE_URL, {
      params,
      signal,
    })
    const data = res.data as WeatherResponse

    const dates = data.daily?.time ?? []
    const temperatures = data.daily?.temperature_2m_max ?? []
    const precipitations = data.daily?.precipitation_sum ?? []

    const temperature: ItemData[] = []
    const precipitation: ItemData[] = []

    for (let ix = 0; ix < dates.length; ix++) {
      if (temperatures[ix] !== undefined) {
        temperature.push({ t: dates[ix], v: temperatures[ix] })
      }
      if (precipitations[ix] !== undefined) {
        precipitation.push({ t: dates[ix], v: precipitations[ix] })
      }
    }

    return { temperature, precipitation }
  } catch (error) {
    throw error
  }
}
