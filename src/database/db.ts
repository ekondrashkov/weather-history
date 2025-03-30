import { getWetherData } from "@/api/getWeatherData"
import { DB_NAME, PRECIPITATION_TABLE, TEMPERATURE_TABLE } from "@/constants"
import type { ItemData } from "@/types"

type TableType = "temperature" | "precipitation"

export interface WeatherDB {
  createDatabase: () => Promise<boolean>
  addData: (table: TableType, data: ItemData[]) => Promise<boolean>
  getData: (
    table: TableType,
    from: number,
    to: number,
    lat: number,
    lon: number
  ) => Promise<ItemData[]>
  clearDatabase: () => Promise<boolean>
}

/**
 * Create an instance of the IndexedDB database
 * @returns an interface with the following methods:
 *   - createDatabase - create/connect the IndexedDB database
 *   - addData - add data to the IndexedDB database
 *   - getData - get data from the IndexedDB database
 */
export function dataDase(): WeatherDB {
  const dbSupported = !!window.indexedDB
  let db: IDBDatabase | null = null

  /**
   * Create the IndexedDB database
   * If DB was already created, then connect
   */
  const createDatabase = async (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!dbSupported) {
        reject("DB: Your browser does not support IndexedDB")
        return
      }

      if (db) {
        resolve(true)
        console.info("DB: Database already created")
        return
      }

      const request = window.indexedDB.open(DB_NAME, 1)

      request.onerror = (e) => {
        reject(request.error)
      }

      request.onsuccess = (e) => {
        console.info("DB: connected")
        db = request.result
        resolve(true)
      }

      request.onupgradeneeded = (e) => {
        db = request.result

        if (!db.objectStoreNames.contains(TEMPERATURE_TABLE)) {
          const temperatureStore = db.createObjectStore(TEMPERATURE_TABLE, {
            keyPath: "t",
          })
          temperatureStore.createIndex("yearIndex", "y", { unique: false })
        }

        if (!db.objectStoreNames.contains(PRECIPITATION_TABLE)) {
          const precipitationStore = db.createObjectStore(PRECIPITATION_TABLE, {
            keyPath: "t",
          })
          precipitationStore.createIndex("yearIndex", "y", { unique: false })
        }

        console.info("DB: created")
      }
    })
  }

  /**
   * Add data to the IndexedDB database
   * @param table the name of the table to add the data to
   * @param data an array of data items to add
   * @returns a promise that resolves to true if the data was successfully added,
   *   or rejects with an error if there was an error
   */
  const addData = async (
    table: TableType,
    data: readonly Readonly<ItemData>[]
  ): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      if (!dbSupported) {
        reject("DB: Your browser does not support IndexedDB")
        return
      }

      if (!db) {
        reject("DB: Database not created")
        return
      }

      const transaction = db.transaction(table, "readwrite")
      transaction.oncomplete = (e) => {
        console.info(
          `DB: ${data.length} items successfully added to '${table}'`
        )
        resolve(true)
      }

      transaction.onerror = (e) => {
        console.error("DB: Error adding data")
        reject(e)
      }

      const store = transaction.objectStore(table)

      for (const item of data) {
        const year = item.y ?? Number(item.t.split("-")[0])
        store.add({
          t: item.t,
          y: year,
          v: item.v,
        })
      }
    })
  }

  /**
   * Retrieves data from the IndexedDB database for a specified table and date range.
   * If some years within the range are not found in the database, it fetches the missing data from the server,
   * adds it to the database, and then returns the complete sorted by date dataset.
   * @param table The name of the table to retrieve data from, either "temperature" or "precipitation".
   * @param from The starting year of the date range.
   * @param to The ending year of the date range.
   * @returns A promise that resolves to an array of ItemData objects for the specified table and date range.
   *          If any data is missing, it is fetched from the server before resolving. Or rejects with an error
   */
  const getData = async (
    table: TableType,
    from: number,
    to: number,
    lat: number,
    lon: number
  ): Promise<ItemData[]> => {
    return new Promise((resolve, reject) => {
      if (!dbSupported) {
        reject("DB: Your browser does not support IndexedDB")
        return
      }

      if (!db) {
        reject("DB: Database not created")
        return
      }

      const transaction = db.transaction(table, "readonly")
      const store = transaction.objectStore(table)
      const index = store.index("yearIndex")

      const request = index.getAll(IDBKeyRange.bound(from, to))
      request.onsuccess = async (e) => {
        console.info(
          `DB: Data received for: ${table} from ${from} to ${to}: ${request.result.length} items`
        )
        const yearsToLoad = new Set<number>()
        let result = request.result as ItemData[]

        // Check which years are missing
        for (let year = from; year <= to; year++) {
          if (!result.some((item) => item.y === year)) {
            yearsToLoad.add(year)
          }
        }

        // If some years are missing, fetch them from the server
        if (yearsToLoad.size > 0) {
          const { precipitation, temperature } = await getWetherData(
            from,
            to,
            lat,
            lon
          )
          if (table === TEMPERATURE_TABLE) {
            const filteredData = temperature.filter((item) => {
              const year = Number(item.t.split("-")[0])
              if (year < from || year > to || !yearsToLoad.has(year)) {
                return false
              }
              return true
            })

            await addData(table, filteredData)
            result = result.concat(filteredData)
          } else if (table === PRECIPITATION_TABLE) {
            const filteredData = precipitation.filter((item) => {
              const year = Number(item.t.split("-")[0])
              if (year < from || year > to || !yearsToLoad.has(year)) {
                return false
              }
              return true
            })
            await addData(table, filteredData)
            result = result.concat(filteredData)
          }
        }

        result.sort((a, b) => a.t.localeCompare(b.t))

        resolve(result)
      }

      request.onerror = (e) => {
        reject(e)
      }
    })
  }

  const clearDatabase = async (): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
      if (!dbSupported) {
        reject("DB: Your browser does not support IndexedDB")
        return
      }

      if (!db) {
        await createDatabase()
      }

      if (!db) {
        reject("DB: Database not created")
        return
      }

      const transaction = db.transaction(
        [TEMPERATURE_TABLE, PRECIPITATION_TABLE],
        "readwrite"
      )
      const tempStore = transaction.objectStore(TEMPERATURE_TABLE)
      const tempStoreRequest = tempStore.clear()

      const precStore = transaction.objectStore(PRECIPITATION_TABLE)
      const precStoreRequest = precStore.clear()

      transaction.oncomplete = (e) => {
        console.info("DB: Database cleared")
        resolve(true)
      }

      transaction.onerror = (e) => {
        console.error("DB: Database clear error")
        reject(e)
      }

      tempStoreRequest.onsuccess = (e) => {
        console.info("DB: Temperature table cleared")
      }

      precStoreRequest.onsuccess = (e) => {
        console.info("DB: Temperature table cleared")
      }
    })
  }

  return { createDatabase, addData, getData, clearDatabase }
}
