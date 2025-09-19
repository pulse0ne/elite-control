import {createContext, PropsWithChildren, useContext, useEffect, useState} from "react";
import {ClientInfo} from "../statusbar/types.ts";
import useTauriListen from "./useTauriListen.tsx";

type DevicesContextValue = ClientInfo[];

const DevicesContext = createContext<DevicesContextValue>([]);

export function DevicesProvider({ children }: PropsWithChildren<{}>) {
  const [ devices, setDevices ] = useState<DevicesContextValue>([]);
  const { lastEvent, unListen } = useTauriListen<DevicesContextValue>("clients-updated-event");

  useEffect(() => {
    if (lastEvent) {
      lastEvent.sort((a, b) => a.ipAddr.localeCompare(b.ipAddr));
      setDevices(lastEvent);
    }
  }, [lastEvent]);

  useEffect(() => {
    return () => {
      unListen();
    };
  }, []);

  return (
    <DevicesContext.Provider value={devices}>
      {children}
    </DevicesContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DevicesContext);
  if (!ctx) {
    throw new Error("useDevices must be used inside DevicesProvider");
  }
  return ctx;
}
