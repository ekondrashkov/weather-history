import axios from "axios"
import { AddressResponse } from "@/types"

const GEOCODE_URL = "https://geocode.maps.co/reverse"
const GEOCODE_KEY = import.meta.env.VITE_API_KEY

export const getAddress = async (
  lat: number,
  lon: number
): Promise<Readonly<AddressResponse>> => {
  try {
    const { data } = await axios.get(GEOCODE_URL, {
      params: {
        lat,
        lon,
        api_key: GEOCODE_KEY,
      },
    })
    if (data.error) {
      throw new Error(data.error)
    }

    return data as AddressResponse
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "An unknown error occurred"
    )
  }
}
