import { getAddress } from "@/api/getAddress"
import { GeoPosition } from "@/types"
import { useEffect, useState } from "react"

const getGeopositionAddress = (geoposition: GeoPosition) => {
  return `${geoposition.lat.toFixed(2)}, ${geoposition.lon.toFixed(2)}`
}

/**
 * Retrieves the title for the current geoposition and returns it.
 *
 * The title is either the city, state or country for the geoposition
 * or the geoposition itself in the format "lat, lon" if no address
 * information is available.
 *
 * @param geoposition the geoposition to retrieve the title for
 * @returns an array containing the title
 */
export const useTitle = (geoposition: GeoPosition | null): [string] => {
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (!geoposition) return

    getAddress(geoposition.lat, geoposition.lon)
      .then((address) => {
        const parts: string[] = []

        const city =
          address.address?.city ??
          address.address?.city_district ??
          address.address?.state
        if (city) parts.push(city)

        const country = address.address?.country
        if (country) parts.push(country)

        setTitle(parts.join(", ") || getGeopositionAddress(geoposition))
      })
      .catch((error) => {
        console.error("Error fetching address:", error)
        setTitle(getGeopositionAddress(geoposition))
      })
  }, [geoposition])

  return [title]
}
