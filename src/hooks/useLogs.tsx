import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {LogEntry} from "../statusbar/types.ts";
import useTauriListen from "./useTauriListen.tsx";

const MAX_LOGS = 5000;

export type LogsContextValue = { logs: LogEntry[] };

const LogsContext = createContext<LogsContextValue>({ logs: [] });

function clamp(entries: LogEntry[]): LogEntry[] {
  while (entries.length > MAX_LOGS) {
    entries.shift();
  }
  return entries;
}

export function LogsProvider({ children }: PropsWithChildren<{}>) {
  const [ logs, setLogs ] = useState<LogsContextValue>({ logs: [] });
  const { lastEvent, unListen } = useTauriListen<LogEntry>("log-event")

  useEffect(() => {
    if (lastEvent) {
      setLogs(ov => ({ logs: clamp([...ov.logs, lastEvent]) }));
    }
  }, [lastEvent]);

  useEffect(() => {
    return () => {
      unListen();
    };
  }, []);

  return (
    <LogsContext.Provider value={logs}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) {
    throw new Error("useLogs must be used inside LogsProvider");
  }
  return ctx;
}