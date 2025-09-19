import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {QrCodeOverlay} from "./QrCodeOverlay.tsx";
import "./statusbar.css";
import {LogsOverlay} from "./LogsOverlay.tsx";
import {useDevices} from "../hooks/useDevices.tsx";

type OverlayType = "qr" | "logs";

export default function StatusBar() {
    const [ serverIp, setServerIp ] = useState("");
    const [ overlay, setOverlay ] = useState<OverlayType|null>(null);
    const devices = useDevices();

    useEffect(() => {
        invoke("get_mobile_client_server_address").then(v => setServerIp(v as string));
    }, []);

    return (
      <>
          <div className="status-bar relative">
              <div>
                  {devices.length} client(s) connected
              </div>
              <div>
                  http://{serverIp}:11011 (<a href="#" onClick={() => setOverlay("qr")}>click me for QR code</a>)
              </div>

              <div className="row justify-center align-center" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
                  <a href="#" onClick={() => setOverlay("logs")}>Logs</a>
              </div>
          </div>
          <QrCodeOverlay
            open={overlay === "qr"}
            serverIp={serverIp}
            onClose={() => setOverlay(null)}
          />
          <LogsOverlay
            open={overlay === "logs"}
            onClose={() => setOverlay(null)}
          />
      </>
    );
}
