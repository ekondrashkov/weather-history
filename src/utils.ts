import { MAX_YEAR, MIN_YEAR } from "@/constants"
import { ItemData } from "@/types"

/**
 * Get default options for year select
 * @returns array of years
 */
export const getDefaultOptions = (): number[] => {
  return Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, i) => i + MIN_YEAR)
}

/**
 * Calculates minimum and maximum values from temperature and precipitation
 * @param data array of ItemData objects
 * @returns an object with min and max values
 */
export const getMinMaxValues = (
  data: ItemData[]
): { min: number; max: number } => {
  const values = data.map((item) => item.v)

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}
