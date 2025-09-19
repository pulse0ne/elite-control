import {LogEntry} from "./types.ts";
import {useLogs} from "../hooks/useLogs.tsx";
import Popup from "reactjs-popup";

export type LogsOverlayProps = {
  open: boolean,
  onClose: () => void;
};

export function LogsModal({ open, onClose }: LogsOverlayProps) {
  const { logs } = useLogs();
  return (
    <Popup
      modal
      open={open}
      onClose={onClose}
      contentStyle={{
        border: "var(--border-light)",
        overflow: "hidden",
        width: "80%",
        maxHeight: "80%",
        minHeight: "25%"
      }}
      overlayStyle={{
        backgroundColor: "rgba(55, 55, 55, 0.2)",
        backdropFilter: "blur(6px)"
      }}
    >
      <div className="logs-modal-root fill-y col no-overflow">
        <div className="logs-container flex-grow fill-x">
          {logs.length === 0 && "No logs"}
          {logs.map(entry => <LogLine key={entry.timestamp} entry={entry} />)}
        </div>
        <div className="row justify-center align-center" style={{ margin: 16 }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </Popup>
  );
}

const colorMap: Record<string, string> = {
  ERROR: "#ff4646",
  WARN: "#ffda56",
  INFO: "#00c4ff"
};

type LogLineProps = { entry: LogEntry };

function LogLine({ entry }: LogLineProps) {
  return (
    <div className="log-line">
      <span style={{ color: colorMap[entry.level] ?? "white" }}>[{entry.level}] - {entry.message}</span>
    </div>
  );
}
