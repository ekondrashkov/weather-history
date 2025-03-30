/** one element in data */
export type ItemData = {
  /** time */
  t: string
  /** value */
  v: number
  /** year */
  y?: number
}

export interface WeatherRequestParams {
  start_date: string
  end_date: string
  latitude: number
  longitude: number
  daily: string
}

export interface WeatherResponse {
  latitude?: number
  longitude?: number
  generationtime_ms?: number
  utc_offset_seconds?: number
  timezone?: string
  timezone_abbreviation?: string
  elevation?: number
  daily_units?: {
    time?: string
    temperature_2m_max?: string
    precipitation_sum?: string
  }
  daily?: {
    time?: string[]
    temperature_2m_max?: number[]
    precipitation_sum?: number[]
  }
}

export interface WeatherData {
  temperature: ItemData[]
  precipitation: ItemData[]
}

export interface GeoPosition {
  lat: number
  lon: number
}

export interface AddressResponse {
  place_id?: number
  licence?: string
  osm_type?: string
  osm_id?: number
  lat?: string
  lon?: string
  display_name?: string
  address?: {
    road?: string
    suburb?: string
    city?: string
    city_district?: string
    county?: string
    state?: string
    ISO3166_2_lvl4?: string
    postcode?: string
    country?: string
    country_code?: string
    tourism?: string
    neighbourhood?: string
  }
  boundingbox?: string[]
  error?: string
}
