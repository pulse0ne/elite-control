// import {useEffect, useState} from "react";
// import QRCode from "qrcode";
// import {invoke} from "@tauri-apps/api/core";
import StatusBar from "./StatusBar.tsx";

function App() {
  // const [ serverIp, setServerIp ] = useState("");
  //
  // useEffect(() => {
  //   invoke("get_mobile_client_server_address").then(v => setServerIp(v as string));
  // }, []);

  // useEffect(() => {
  //   const canvas = document.getElementById("qrcode");
  //   QRCode.toCanvas(canvas, `http://${serverIp}:8787`);
  // }, [serverIp]);

  return (
    <main>
      <div className="main-container"></div>
      <StatusBar />
    </main>
  );
}

export default App;
