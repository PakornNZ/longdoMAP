"use client"

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        longdo: any
    }
}

let longdo: any;
let map: any;

export interface LongdoMapProps {
    id: string;
    mapKey: string;
    callback?: () => void;
}

export default function LongdoMap({ id, mapKey, callback }: LongdoMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadScript = () => {
            if (!document.getElementById("longdoMapScript")) {
                const script = document.createElement("script");
                script.src = `https://api.longdo.com/map/?key=${mapKey}`;
                script.id = "longdoMapScript";
                document.body.appendChild(script);

                script.onload = () => {
                    longdo = window.longdo;
                    map = new longdo.Map({ placeholder: mapRef.current, language: "en" });

                    if (callback) callback();
                };
            } else {
                longdo = window.longdo;
                map = new longdo.Map({ placeholder: mapRef.current });

                if (callback) callback();
            }
        };

        loadScript();
    }, [mapKey, callback]);

    return <div id={id} ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}

export { longdo, map };
