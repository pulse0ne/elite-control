import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import "./statusbar.css";
import {useDevices} from "../hooks/useDevices.tsx";
import {MdOutlineQrCode2} from "react-icons/md";
import {QrCodeModal} from "./QrCodeModal.tsx";
import {LogsModal} from "./LogsModal.tsx";
import {LogsProvider} from "../hooks/useLogs.tsx";

type ModalType = "qr" | "logs";

export default function StatusBar() {
    const [ serverIp, setServerIp ] = useState("");
    const [ modal, setModal ] = useState<ModalType|null>(null);
    const { devices } = useDevices();

    useEffect(() => {
        invoke<string>("get_mobile_client_server_address").then(v => setServerIp(v));
    }, []);

    return (
      <LogsProvider>
        <div className="status-bar row justify-space-between relative">
          <div>
            {devices.length} client(s) connected
          </div>
          <div className="row align-center gap-16">
            <span>http://{serverIp}:11011</span>
            <MdOutlineQrCode2 size={20} onClick={() => setModal("qr")} style={{ cursor: "pointer", color: "var(--gradient-stop1)" }}/>
          </div>

          <div className="row justify-center align-center" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
              <a href="#" onClick={() => setModal("logs")}>Logs</a>
          </div>
        </div>
        <QrCodeModal open={modal === "qr"} serverIp={serverIp} onClose={() => setModal(null)} />
        <LogsModal open={modal === "logs"} onClose={() => setModal(null)} />
      </LogsProvider>
    );
}
