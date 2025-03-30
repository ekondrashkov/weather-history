import { useContext, useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DBContext } from "@/components/App"
import { getDefaultOptions } from "@/utils"
import type { GeoPosition, ItemData } from "@/types"

const options = getDefaultOptions()

interface SelectsProps {
  fromYear: number
  toYear: number
  setFromYear: (year: number) => void
  setToYear: (year: number) => void
  setTemperature: (data: ItemData[]) => void
  setPrecipitation: (data: ItemData[]) => void
  geoposition: GeoPosition | null
}

export const Selects = ({
  fromYear,
  toYear,
  setFromYear,
  setToYear,
  setTemperature,
  setPrecipitation,
  geoposition,
}: SelectsProps) => {
  const db = useContext(DBContext)

  const [fromOptions, setFromOptions] = useState(options)
  const [toOptions, setToOptions] = useState(options)

  /**
   * Change options when "from" or "to" value changes
   * Get data from DB and update states
   */
  useEffect(() => {
    setFromOptions(options.filter((option) => option <= toYear))
    setToOptions(options.filter((option) => option >= fromYear))
  }, [fromYear, toYear])

  /**
   * Handles the change event for the "from" year select input.
   * Updates the state with the selected year value.
   */
  const onFromSelectChange = (value: string) => {
    setFromYear(Number(value))
    updateData(Number(value), toYear)
  }

  /**
   * Handles the change event for the "to" year select input.
   * Updates the state with the selected year value.
   */
  const onToSelectChange = (value: string) => {
    setToYear(Number(value))
    updateData(fromYear, Number(value))
  }

  /**
   * Updates the temperature and precipitation data based "from" or "to" year changes
   * Retrieves the data from the IndexedDB database and updates the state with the received data
   */
  const updateData = (from: number, to: number): void => {
    ;(async () => {
      if (!geoposition) return
      try {
        const temperature = await db.getData(
          "temperature",
          from,
          to,
          geoposition.lat,
          geoposition.lon
        )
        const precipitation = await db.getData(
          "precipitation",
          from,
          to,
          geoposition.lat,
          geoposition.lon
        )
        setTemperature(temperature)
        setPrecipitation(precipitation)
      } catch (error) {
        console.error(error)
      }
    })()
  }

  return (
    <div className="flex flex-col gap-2">
      <Select
        onValueChange={onFromSelectChange}
        defaultValue={String(fromYear)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="From Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {fromOptions.map((option) => (
            <SelectItem value={String(option)} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select onValueChange={onToSelectChange} defaultValue={String(toYear)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="To Year" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {toOptions.map((option) => (
            <SelectItem value={String(option)} key={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
