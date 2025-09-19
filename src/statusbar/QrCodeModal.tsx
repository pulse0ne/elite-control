import {useEffect} from "react";
import QRCode from "qrcode";
import Popup from "reactjs-popup";

export type QrCodeModalProps = {
  open: boolean;
  serverIp: string;
  onClose: () => void;
};

export function QrCodeModal({ open, serverIp, onClose }: QrCodeModalProps) {
  const url = `http://${serverIp}:11011`;

  return (
    <Popup
      modal
      open={open}
      onClose={onClose}
      contentStyle={{ border: "var(--border-light)", overflow: "hidden" }}
      overlayStyle={{
        backgroundColor: "rgba(55, 55, 55, 0.2)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div className="qr-modal-root col align-center justify-center">
        <div style={{ fontSize: "0.75em" }}>{url}</div>
        <QrCode serverAddress={url} />
        <button onClick={onClose}>Close</button>
      </div>
    </Popup>
  );
}

type QrCodeProps = {
  serverAddress: string;
};

function QrCode({ serverAddress }: QrCodeProps) {
  useEffect(() => {
    const canvas = document.getElementById("qr-code");
    if (canvas) {
      QRCode.toCanvas(canvas, serverAddress, { width: 200, color: { dark: "#fff", light: "#000" } });
    }
  }, []);
  return <canvas id="qr-code"></canvas>;
}
