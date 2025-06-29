"use client"

import { useEffect, useState } from "react"
import Map from "@/components/map"
// import { SpinnerBorderExample } from "@/components/loading"

interface DataAVGProps {
  temperature: number
  humidity: number
  pm_25: number
  pm_10: number
  aqi: number
}

interface HistoryAqiProps {
  aqi_data: number
  aqi_date: string
  aqi_time: string
}

export default function Home() {
  const [deviceID, setDeviceID] = useState<number | null>(null)
  const handleDeviceSelect = (deviceId_now: number) => {
    if (deviceID != deviceId_now) {
      setDeviceID(deviceId_now)
    }
  }


  // * ดึงข้อมูลล่าสุดของ Sensors จาก INFLUXDB
  const [dataAVG, setDataAVG] = useState<DataAVGProps | null>(null)
  const fetchData_AVG = async () => {
    try {
      const res = await fetch(`api/fetchData_AVG?deviceID=${deviceID}`)
      const resData = await res.json()
      if (resData.status == 1) {
        setDataAVG(resData.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  // * ดึงประวัติค่า AOI จาก Database
  const [historyAqi, setHistoryAqi] = useState<HistoryAqiProps[]>([])
  const fetchHistory_AQI = async () => {
    try {
      const res = await fetch(`api/fetchHistory_AQI?deviceID=${deviceID}`)
      const resData = await res.json()
      if (resData.status == 1) {
        setHistoryAqi(resData.data)
      } 
    } catch (error) {
      console.error(error)
    }
  }


  // * useEffect
  useEffect(() => {
    if (deviceID) {
      fetchData_AVG()
      fetchHistory_AQI()
    }
  }, [deviceID])

  useEffect(() => {
    if (!deviceID) return

    const interval_data_AVG = setInterval(() => {
      fetchData_AVG()
    }, 3600000)

    const dateNow = new Date()
    const midnight = new Date()
    midnight.setHours(0, 0, 10, 0)
    midnight.setDate(midnight.getDate() + 1)
    const timeUntilMidnight = midnight.getTime() - dateNow.getTime()

    let dailyInterval: NodeJS.Timeout
    const timeoutMidnight = setTimeout(() => {
      fetchHistory_AQI()
      dailyInterval = setInterval(fetchHistory_AQI, 24 * 60 * 60 * 1000)
    }, timeUntilMidnight)

    return () => {
      clearInterval(interval_data_AVG)
      clearTimeout(timeoutMidnight)
      clearInterval(dailyInterval)
    }
  }, [deviceID])  


  return (
    <>
      {/* <SpinnerBorderExample /> */}
      <Map DeviceSelect={handleDeviceSelect}/>
    </>
  )
}