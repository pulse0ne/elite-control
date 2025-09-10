import {useCallback, useState} from "react";
import {listen} from "@tauri-apps/api/event";

export default function useTauriListen<T>(eventType: string) {
    const [ lastEvent, setLastEvent ] = useState<T|null>(null);

    const unlisten = useCallback(() => listen<T>(eventType, (event) => {
        setLastEvent(event.payload);
    }), [eventType]);

    return { lastEvent, unlisten };
}