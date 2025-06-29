"use client"

import { useEffect, useState } from "react"
import LongdoMap, { longdo, map } from "@/components/longdo-map/LongdoMap"
import "@/styles/style-Homepage.css"
import { MapPin, MapPinned } from 'lucide-react'

interface BoundProps {
    lon: number,
    lat: number
}

interface DeviceProps {
    device_id: number,
    location: string,
    point: {
        lon: number,
        lat: number
    },
    detail: {
        area: string,
        location: string,
        address: string
    }
}

interface MapProps {
    DeviceSelect?: (deviceId_now: number) => void
}

export default function Map({ DeviceSelect }: MapProps) {

    const [working, setWorking] = useState<boolean>(false)

    const boundingBox: BoundProps[] = []
    const [device, setDevice] = useState<DeviceProps[]>([])
    const [selectedDevice, setSelectedDevice] = useState<DeviceProps | null>(null)

    useEffect(() => {
        fetchDevices()

        if (working) {
            if (DeviceSelect) {
                DeviceSelect(selectedDevice?.device_id || 3)
            }
        }
    }, [working])

    const fetchDevices = async () => {
        try {
            const res = await fetch('/api/devices')
            const resData = await res.json()
            
            if (resData.status == 1) {
                setDevice(resData.data)
                setSelectedDevice(resData.data[0])
            }
        } catch (error) {
            console.error(error)
        } finally {
            setWorking(true)
        }
    }

    const initMap = () => {
        if (map && longdo && working) {
            // map.Layers.setBase(longdo.Layers.NORMAL)
            map.zoom(9, true)
            map.zoomRange({ min: 9, max: 20 })
            map.Ui.Toolbar.visible(false)
            map.Ui.Scale.visible(false)
            map.Ui.Tooltip.visible(false)
            map.Ui.Zoombar.visible(false)
            map.Ui.Geolocation.visible(false)
            map.Ui.Fullscreen.visible(false)
            map.Ui.ContextMenu.visible(false)


            device.forEach((e) => {
                const devicePoint = { lon: e.point.lon, lat: e.point.lat }

                const overlayHtml = `
                        <div style="transform: translateY(60%); filter: drop-shadow(0 0 3px #2b2b2b3a); background: #eeeeff; padding: 10px; border-radius: 8px; white-space: nowrap; position: relative;">
                            <button id="closePopupButton-${e.device_id}" style="all: unset; position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; background: #f0f0f0; border-radius: 50%; cursor: pointer; font-size: 14px; font-weight: bold; color: #555;">
                                ✕
                            </button>
                            <h1 style="margin: 0; margin-bottom: 5px; font-size: 14px;">${e.detail.area}</h1>
                            <p style="margin-bottom: 5px;">${e.detail.location}<br></p>
                            <span style="margin: 0;">ที่อยู่: ${e.detail.address}</span>
                            <div style="display: flex; justify-content: center; ">
                                <button id="ecpButton-${e.device_id}" style="all: unset; font-size: 12px; margin-top: 10px; padding: 5px 20px; background: #1353ca; color: white; border-radius: 5px; cursor: pointer;">
                                    เลือกข้อมูล
                                </button>
                            </div>
                        </div>
                        `

                const marker = new longdo.Marker(devicePoint, {
                    title: e.detail.area,
                    visibleRange: { min: 5, max: 20 },
                    clickable: true,
                    draggable: false,
                    popup: { html: overlayHtml }
                })
                map.Overlays.add(marker)
                boundingBox.push(devicePoint)

                map.Event.bind('overlayClick', function (overlay: any) {
                    if (overlay === marker) {
                        map.location(devicePoint, true)
                    }
                    setTimeout(() => {
                        const ecpButton = document.getElementById(`ecpButton-${e.device_id}`)
                        if (ecpButton) {
                            ecpButton.addEventListener('click', function (event: MouseEvent) {
                                handleSelectDevice(e.device_id)
                                event.stopPropagation()
                            })
                        }

                        const closeButton = document.getElementById(`closePopupButton-${e.device_id}`)
                        if (closeButton) {
                            closeButton.addEventListener('click', function (event: MouseEvent) {
                                map.Overlays.remove(marker)
                                map.Overlays.add(marker)
                                event.stopPropagation()
                            })
                        }
                    }, 100)
                })
            })
            handleWatchAll()
        }
    }

    const handleSelectDevice = (selectedDeviceId: number) => {
        const deviceData = device.find(d => d.device_id == selectedDeviceId)
        if (deviceData) {
            setSelectedDevice(deviceData)
            handleMove()

            if (DeviceSelect) {
                DeviceSelect(selectedDeviceId)
            }
        }
    }

    const handleWatchAll = () => {
        const boundValue = longdo.Util.locationBound(boundingBox)
        map.bound(boundValue)
    }

    const [move, setMove] = useState(false)
    const handleMove = () => {
        setMove(prev => !prev)
    }

    return (
        <>
            {/* <section>
                <button type="button" onClick={handleMove}><MapPin /></button>
                <span className={`location ${move ? "move" : ""}`}>{ working ? (selectedDevice?.detail.area) : "กำลังโหลด. ." }</span>
            </section> */}
            <div className={`map-bg ${move ? "move" : ""}`}>
                <div className={`map ${move ? "move" : ""}`}>
                    <div className="location-bt">
                        <button type="button" onClick={handleWatchAll}><MapPinned />ภาพรวม</button>
                    </div>
                    <LongdoMap id="longdo-map" mapKey="ใส่key api หรือจะดึงมา .env" callback={initMap} />
                </div>
            </div>
        </>
    )
}
