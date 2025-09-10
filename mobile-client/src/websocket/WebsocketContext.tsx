import React, { createContext, useContext } from "react";
import { useWebsocket } from "./useWebsocket";

type WebsocketContextValue = ReturnType<typeof useWebsocket>;

const WebsocketContext = createContext<WebsocketContextValue | null>(null);

const url = `ws://${window.location.hostname}:${window.location.port}/ws`;

export const WebsocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ws = useWebsocket(url);

  return (
    <WebsocketContext.Provider value={ws}>
      {children}
    </WebsocketContext.Provider>
  );
};

export function useAppWebsocket() {
  const ctx = useContext(WebsocketContext);
  if (!ctx) {
    throw new Error("useAppWebsocket must be used inside WebsocketProvider");
  }
  return ctx;
}
