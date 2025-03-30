import { useRef, useEffect, useMemo } from "react"
import { PRECIPITATION_COLOR, TEMPERATURE_COLOR } from "@/constants"
import { ItemData } from "@/types"

interface CanvasProps {
  temperature: ItemData[]
  precipitation: ItemData[]
  isTempEnabled: boolean
  isPrecEnabled: boolean
  minValue: number
  maxValue: number
  fromYear: number
  toYear: number
  isLoading: boolean
}

const CANVAS_WIDTH = 1000
const CANVAS_HEIGHT = 600
const LINES_GAP = 10

/**
 * Draws horizontal grid lines on a canvas at specified y-values.
 */
const drawXGrid = (
  ctx: CanvasRenderingContext2D,
  values: number[],
  heightRate: number
): void => {
  for (let ix = 1; ix < values.length - 1; ix++) {
    const y = values[ix] * heightRate + CANVAS_HEIGHT / 2
    ctx.beginPath()
    ctx.setLineDash(y === CANVAS_HEIGHT / 2 ? [] : [10, 15])
    ctx.moveTo(0, y)
    ctx.lineTo(CANVAS_WIDTH, y)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
    ctx.stroke()
    ctx.closePath()
  }
}

/**
 * Draws vertical grid lines on a canvas at specified y-values.
 */
const drawYGrid = (ctx: CanvasRenderingContext2D, years: number): void => {
  ctx.setLineDash([])
  for (let ix = 1; ix < years; ix++) {
    const x = (ix / years) * CANVAS_WIDTH
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, CANVAS_HEIGHT)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.stroke()
    ctx.closePath()
  }
}

/**
 * Draws a chart of temperature data on a canvas.
 */
const drawTemperatureChart = (
  ctx: CanvasRenderingContext2D,
  temperature: ItemData[],
  heightRate: number,
  tempRateX: number
): void => {
  let moveToX = 0
  for (let ix = 0; ix < temperature.length - 1; ix++) {
    ctx.beginPath()
    ctx.moveTo(
      moveToX * tempRateX,
      temperature[ix].v * -1 * heightRate + CANVAS_HEIGHT / 2
    )
    ctx.lineTo(
      (moveToX + 1) * tempRateX,
      temperature[ix + 1].v * -1 * heightRate + CANVAS_HEIGHT / 2
    )
    ctx.strokeStyle = TEMPERATURE_COLOR
    ctx.stroke()
    ctx.closePath()
    moveToX++
  }
}

/**
 * Draws a chart of precipitation data on a canvas.
 */
const drawPrecipitationsChart = (
  ctx: CanvasRenderingContext2D,
  precipitation: ItemData[],
  heightRate: number,
  precRateX: number
): void => {
  let moveToX = 0
  for (let ix = 0; ix < precipitation.length - 1; ix++) {
    ctx.beginPath()
    ctx.moveTo(
      moveToX * precRateX,
      precipitation[ix].v * -1 * heightRate + CANVAS_HEIGHT / 2
    )
    ctx.lineTo(
      (moveToX + 1) * precRateX,
      precipitation[ix + 1].v * -1 * heightRate + CANVAS_HEIGHT / 2
    )
    ctx.strokeStyle = PRECIPITATION_COLOR
    ctx.stroke()
    ctx.closePath()
    moveToX++
  }
}

export const Canvas = ({
  temperature,
  precipitation,
  isTempEnabled,
  isPrecEnabled,
  minValue,
  maxValue,
  fromYear,
  toYear,
  isLoading,
}: CanvasProps) => {
  const canvas = useRef<HTMLCanvasElement>(null)
  // Calculate and memorize chart height rate depending on max value
  const heightRate = useMemo(() => {
    let max = Math.max(Math.abs(minValue), Math.abs(maxValue))
    const rest = max % LINES_GAP
    if (rest > 0) {
      max = (Math.floor(max / LINES_GAP) + 1) * LINES_GAP
    }
    return max === 0 ? 1 : CANVAS_HEIGHT / 2 / max
  }, [minValue, maxValue])

  // Calculate and memorize chart Y values
  const valuesY = useMemo(() => {
    let max = Math.max(Math.abs(minValue), Math.abs(maxValue))
    const rest = max % LINES_GAP
    if (rest > 0) {
      max = (Math.floor(max / LINES_GAP) + 1) * LINES_GAP
    }

    const values: number[] = []
    for (let num = max * -1; num <= max; num += LINES_GAP) {
      values.push(num)
    }
    return values.reverse()
  }, [minValue, maxValue])

  // Calculate and memorize chart X values
  const valuesX = useMemo(() => {
    // Show only first and last choosen years if user selected more than 20 years
    if (toYear - fromYear > 20) {
      return [fromYear, "...", toYear]
    }

    // Prepare all years values
    const values: number[] = []
    for (let year = fromYear; year <= toYear; year++) {
      values.push(year)
    }
    return values
  }, [fromYear, toYear])

  // Draw chart on temperature and precipitation changes
  useEffect(() => {
    if (!canvas.current) return

    const ctx = canvas.current.getContext("2d")
    if (!ctx) return

    // Clean Canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Calculate rates for temperature and precipitation
    const length = Math.max(temperature.length, precipitation.length)
    const tempRateX = length === 0 ? 1 : CANVAS_WIDTH / length
    const precRateX = length === 0 ? 1 : CANVAS_WIDTH / length
    const years = toYear - fromYear + 1

    drawXGrid(ctx, valuesY, heightRate)
    drawYGrid(ctx, years)

    if (isTempEnabled) {
      drawTemperatureChart(ctx, temperature, heightRate, tempRateX)
    }
    if (isPrecEnabled) {
      drawPrecipitationsChart(ctx, precipitation, heightRate, precRateX)
    }
  }, [temperature, precipitation, isTempEnabled, isPrecEnabled])

  return (
    <div className="relative flex flex-col justify-center items-center py-4 px-8 h-full w-full border border-gray-300 rounded-sm bg-gray-50/20">
      {isPrecEnabled || isTempEnabled ? (
        isLoading ? (
          <div className="w-full text-center">
            <span>Please wait while data is being loaded</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center w-full">
              <ul className="flex flex-col h-[626px] justify-between items-end pr-2">
                {valuesY.map((value) => (
                  <li key={value}>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
              <canvas
                ref={canvas}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-gray-300 bg-white"
              />
            </div>
            <ul className="flex justify-evenly pt-2 font-semibold w-[1016px]">
              {valuesX.map((value) => (
                <li key={value}>
                  <span>{value}</span>
                </li>
              ))}
            </ul>
          </>
        )
      ) : (
        <div className="w-full text-center">
          <span>
            Press "Temperature" or/and "Precipitations" button to show data
          </span>
        </div>
      )}
    </div>
  )
}
