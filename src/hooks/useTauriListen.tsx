import {useCallback, useState} from "react";
import {listen} from "@tauri-apps/api/event";

export default function useTauriListen<T>(eventType: string) {
    const [ lastEvent, setLastEvent ] = useState<T|null>(null);

    const unListen = useCallback(() => listen<T>(eventType, (event) => {
        console.log(`got message: ${JSON.stringify(event.payload)}`);
        setLastEvent(event.payload);
    }), [eventType]);

    return { lastEvent, unListen };
}