import { useState, useEffect, createContext } from "react"
import { NavBar } from "@/components/NavBar/NavBar"
import { Selects } from "@/components/Selects/Selects"
import { Canvas } from "@/components/Canvas/Canvas"
import { Title } from "@/components/Title/Title"
import { Separator } from "@/components/ui/separator"
import { useGeoposition } from "@/hooks/useGeoposition"
import { getMinMaxValues } from "@/utils"
import { MIN_YEAR, MAX_YEAR } from "@/constants"
import { dataDase } from "@/database/db"
import type { ItemData } from "@/types"

const db = dataDase()
export const DBContext = createContext(db)

const App = () => {
  const [temperature, setTemperature] = useState<ItemData[]>([])
  const [precipitation, setPrecipitation] = useState<ItemData[]>([])

  const [isTemperatureEnabled, setIsTemperatureEnabled] = useState(true)
  const [isPrecipitationEnabled, setIsPrecipitationEnabled] = useState(false)

  const [minValue, setMinValue] = useState(0)
  const [maxValue, setMaxValue] = useState(0)

  const [fromYear, setFromYear] = useState(MIN_YEAR)
  const [toYear, setToYear] = useState(MAX_YEAR)

  const [isLoading, setIsLoading] = useState(true)

  const [geoposition] = useGeoposition(db)

  /**
   * Get initial temperature and precipitation data
   * Update states
   */
  useEffect(() => {
    ;(async () => {
      if (!geoposition) {
        return
      }

      try {
        await db.createDatabase()
        setIsLoading(true)
        const temp = await db.getData(
          "temperature",
          fromYear,
          toYear,
          geoposition.lat,
          geoposition.lon
        )
        const prec = await db.getData(
          "precipitation",
          fromYear,
          toYear,
          geoposition.lat,
          geoposition.lon
        )

        const { min, max } = getMinMaxValues([...temp, ...prec])
        setMinValue(min)
        setMaxValue(max)
        setTemperature(temp)
        setPrecipitation(prec)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [geoposition])

  return (
    <div className="h-screen flex flex-col">
      <Title geoposition={geoposition} />
      <DBContext.Provider value={db}>
        <div className="flex flex-nowrap h-full">
          <aside className="flex flex-col gap-4 min-w-[300px] p-8 border-r bg-gray-50/20">
            <NavBar
              isPrecEnabled={isPrecipitationEnabled}
              isTempEnabled={isTemperatureEnabled}
              onPrecClicked={setIsPrecipitationEnabled}
              onTempClicked={setIsTemperatureEnabled}
            />
            <Separator />
            <Selects
              fromYear={fromYear}
              toYear={toYear}
              setFromYear={setFromYear}
              setToYear={setToYear}
              setTemperature={setTemperature}
              setPrecipitation={setPrecipitation}
              geoposition={geoposition}
            />
          </aside>

          <div className="p-8 w-full">
            <Canvas
              temperature={temperature}
              precipitation={precipitation}
              isTempEnabled={isTemperatureEnabled}
              isPrecEnabled={isPrecipitationEnabled}
              minValue={minValue}
              maxValue={maxValue}
              fromYear={fromYear}
              toYear={toYear}
              isLoading={isLoading}
            />
          </div>
        </div>
      </DBContext.Provider>
    </div>
  )
}

export default App
