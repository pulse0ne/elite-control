import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import useTauriListen from "../hooks/useTauriListen.tsx";
import {ClientsUpdatedEvent} from "./types.ts";
import {QrCodeOverlay} from "./QrCodeOverlay.tsx";
import "./statusbar.css";
import {LogsOverlay} from "./LogsOverlay.tsx";

type OverlayType = "qr" | "logs";

export default function StatusBar() {
    const [ serverIp, setServerIp ] = useState("");
    const [ overlay, setOverlay ] = useState<OverlayType|null>(null);

    const { lastEvent: lastClientsUpdatedEvent, unListen: unListenClientsUpdated } = useTauriListen<ClientsUpdatedEvent>("clients-updated-event");

    useEffect(() => {
        invoke("get_mobile_client_server_address").then(v => setServerIp(v as string));
    }, []);

    useEffect(() => {
        return () => {
            unListenClientsUpdated();
        }
    }, []);

    return (
      <>
          <div className="status-bar relative">
              <div>
                  {lastClientsUpdatedEvent?.length ?? 0} client(s) connected
              </div>
              <div>
                  http://{serverIp}:11011 (<a href="#" onClick={() => setOverlay("qr")}>click me for QR code</a>)
              </div>

              <div className="row justify-center align-center" style={{ position: "absolute", left: "50%" }}>
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
