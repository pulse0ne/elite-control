import {useEffect} from "react";
import QRCode from "qrcode";

export type QrCodeOverlayProps = {
  open: boolean;
  serverIp: string;
  onClose: () => void;
};

export function QrCodeOverlay({ open, serverIp, onClose }: QrCodeOverlayProps) {
  const url = `http://${serverIp}:11011`;
  useEffect(() => {
    const canvas = document.getElementById("qr-code");
    if (canvas) {
      QRCode.toCanvas(canvas, url, { width: 200, color: { dark: "#fff", light: "#000" } });
    }
  }, [serverIp]);

  if (!open) return null;
  return (
    <div className="overlay-container">
      <div style={{ fontSize: "0.75em" }}>{url}</div>
      <canvas id="qr-code"></canvas>
      <button onClick={onClose}>Close</button>
    </div>
  );
}