import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import QRCode from "qrcode";
import useTauriListen from "./hooks/useTauriListen.tsx";

type ClientCountEvent = {
    count: number;
};

export default function StatusBar() {
    const [ serverIp, setServerIp ] = useState("");
    const [ qrCodeOpen, setQrCodeOpen ] = useState(false);

    const { lastEvent, unlisten } = useTauriListen<ClientCountEvent>("client-count");

    useEffect(() => {
        invoke("get_mobile_client_server_address").then(v => setServerIp(v as string));
    }, []);

    useEffect(() => {
        return () => {
            unlisten();
        }
    }, []);

    return (
        <div className="status-bar">
            <div>{lastEvent?.count ?? 0} client(s) connected</div>
            <div>http://{serverIp}:8787 (<a href="#" onClick={() => setQrCodeOpen(true)}>click me for QR code</a>)</div>
            {qrCodeOpen && <QRCodeContainer serverIp={serverIp} onClose={() => setQrCodeOpen(false)}/>}
        </div>
    );
}

type QRCodeContainerProps = {
    serverIp: string;
    onClose: () => void
};

function QRCodeContainer({ serverIp, onClose }: QRCodeContainerProps) {
    const url = `http://${serverIp}:8787`;
    useEffect(() => {
        const canvas = document.getElementById("qr-code");
        if (canvas) {
            QRCode.toCanvas(canvas, url, { width: 200, color: { dark: "#fff", light: "#000" } });
        }
    }, [serverIp]);

    if (!serverIp) return null;
    return (
        <div className="qr-code-container">
            <div style={{ fontSize: "0.75em" }}>{url}</div>
            <canvas id="qr-code"></canvas>
            <button onClick={onClose}>Close</button>
        </div>
    );
}
