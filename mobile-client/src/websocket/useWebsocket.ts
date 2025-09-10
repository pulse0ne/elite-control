import { useEffect, useRef, useState, useCallback } from "react";

export function useWebsocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (socketRef.current) {
      // TODO: something's wrong here
      console.log('existing ref');
      return;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onclose = () => setIsConnected(false);
    socket.onerror = () => setIsConnected(false);
    socket.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        setLastMessage(event.data);
      }
    };
  }, [url]);

  useEffect(() => {
    connect();

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        connect();
      }
    };
    // document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      socketRef.current?.close();
    };
  }, [connect, isConnected]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { isConnected, lastMessage, sendMessage, reconnect: connect };
}
