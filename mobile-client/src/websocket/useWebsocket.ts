import { useEffect, useRef, useState, useCallback } from "react";

const msgBuffer: string[] = [];

export function useWebsocket(url: string) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  const connect = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      if (msgBuffer.length) {
        msgBuffer.forEach(msg => socket.send(msg));
      }
    };
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

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      // socketRef.current?.close();
    };
  }, [connect, isConnected]);

  const sendMessage = useCallback((msg: any) => {
    const payload = JSON.stringify(msg);
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
    } else {
      console.log("not connected...buffering message");
      msgBuffer.push(payload);
    }
  }, []);

  return { isConnected, lastMessage, sendMessage, reconnect: connect };
}
