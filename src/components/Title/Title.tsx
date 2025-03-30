import { memo } from "react"
import { useTitle } from "@/hooks/useTitle"
import { getDefaultGeooposition } from "@/hooks/useGeoposition"
import type { GeoPosition } from "@/types"

interface TitleProps {
  geoposition: GeoPosition | null
}

const defaultPosition = getDefaultGeooposition()

export const Title = memo(function Title({ geoposition }: TitleProps) {
  const [title] = useTitle(geoposition)
  const isDefault =
    !!geoposition &&
    geoposition.lat === defaultPosition.lat &&
    geoposition.lon === defaultPosition.lon

  return (
    <h1 className="p-8 text-2xl border-b shadow-xs bg-gray-100/20">
      <span className="font-semibold">Weather History for: </span>
      <span>{`${title || ""} ${
        title ? `(${isDefault ? "Default location" : "Current location"})` : ""
      }`}</span>
    </h1>
  )
})
