import { useEffect, useState } from "react"
import { GeoPosition } from "../types"
import { WeatherDB } from "../database/db"

const THEME_STORAGE_KEY = "weather-history-geoposition"

/**
 * Returns a default GeoPosition object with the coordinates of St. Petersburg, Russia.
 * This is used as a fallback when the user's geolocation is not available or
 * geolocation access is denied.
 *
 * @returns A GeoPosition object with the default coordinates.
 */
export const getDefaultGeooposition = (): GeoPosition => {
  return { lat: 59.57, lon: 30.19 }
}

/**
 * Custom hook that retrieves and manages the user's current geographical position.
 * It uses the Geolocation API to get the user's current latitude and longitude and stores it
 * in the localStorage. If the stored position changes or is not available, the database is cleared.
 * If geolocation access is denied or an error occurs, the hook defaults to a predetermined position St. Petersburg, Russia.
 *
 * @param db The WeatherDB instance used for clearing the database when the location changes.
 * @returns An array containing the current GeoPosition or null if not available.
 */
export const useGeoposition = (db: WeatherDB): [GeoPosition | null] => {
  const [geoposition, setGeoposition] = useState<GeoPosition | null>(null)

  const stored = localStorage.getItem(THEME_STORAGE_KEY)
  const parsed = stored ? JSON.parse(stored) : null

  const successCallback = async (
    position: GeolocationPosition
  ): Promise<void> => {
    const lat = position.coords.latitude
    const lon = position.coords.longitude
    if (!parsed || parsed.lat !== lat || parsed.lon !== lon) {
      await db.clearDatabase()
    }
    const stringToStore = JSON.stringify({ lat: lat, lon: lon })
    localStorage.setItem(THEME_STORAGE_KEY, stringToStore)
    setGeoposition({ lat: lat, lon: lon })
  }

  const errorCallback = async (
    error: GeolocationPositionError
  ): Promise<void> => {
    const defaultGeo = getDefaultGeooposition()
    if (
      !parsed ||
      parsed.lat !== defaultGeo.lat ||
      parsed.lon !== defaultGeo.lon
    ) {
      await db.clearDatabase()
    }
    const stringToStore = JSON.stringify(defaultGeo)
    localStorage.setItem(THEME_STORAGE_KEY, stringToStore)
    setGeoposition(defaultGeo)
    console.log(error)
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback)
  }, [])

  return [geoposition]
}
