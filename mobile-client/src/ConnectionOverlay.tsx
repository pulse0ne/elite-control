import {useAppWebsocket} from "./websocket/WebsocketContext.tsx";
import {MdOutlineWifiOff} from "react-icons/md";
import {useEffect, useState} from "react";

export default function ConnectionOverlay () {
    const [ showing, setShowing ] = useState(false);
    const { isConnected, reconnect } = useAppWebsocket();

    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;
        if (!isConnected) {
            timer = setTimeout(() => {
                setShowing(true);
            }, 2500);
        } else {
            setShowing(false);
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [isConnected]);

    if (!showing) return null;

    return (
        <div className="disconnection-bg">
            <MdOutlineWifiOff size={64} />
            <button onClick={reconnect}>Reconnect</button>
        </div>
    );
}