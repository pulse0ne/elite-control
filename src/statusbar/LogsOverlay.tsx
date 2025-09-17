import useTauriListen from "../hooks/useTauriListen.tsx";
import {LogEntry} from "./types.ts";
import {useEffect, useState} from "react";

export type LogsOverlayProps = {
  open: boolean;
  onClose: () => void;
};

export function LogsOverlay({ open, onClose }: LogsOverlayProps) {
  const [ logs, setLogs ] = useState<LogEntry[]>([]);

  const { lastEvent: lastLogEvent, unListen: unListenLog } = useTauriListen<LogEntry>("log-event");

  useEffect(() => {
    if (lastLogEvent) {
      setLogs(ov => [...ov, lastLogEvent]);
    }
  }, [lastLogEvent]);

  useEffect(() => {
    return () => {
      console.log("unlistening to log-event");
      unListenLog();
    };
  }, []);

  if (!open) return null;
  return (
    <div className="overlay-container logs-overlay col no-overflow">
      <div className="logs-container flex-grow fill-x">
        {logs.length === 0 && "No logs"}
        {logs.map(entry => <LogLine key={entry.timestamp} entry={entry} />)}
      </div>
      <div style={{ margin: 16 }}>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
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
