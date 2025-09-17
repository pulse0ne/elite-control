import {useAppWebsocket, WebsocketProvider} from "./websocket/WebsocketContext.tsx";
import ConnectionOverlay from "./ConnectionOverlay.tsx";
import {useEffect} from "react";

function App() {
  return (
    <WebsocketProvider>
      <Dummy />
      <ConnectionOverlay />
      <ViewportReporter />
    </WebsocketProvider>
  );
}

function ViewportReporter() {
  const { sendMessage } = useAppWebsocket();

  useEffect(() => {
    const { clientWidth, clientHeight } = document.documentElement;
    console.log("sending viewport dimensions");
    sendMessage({ viewportReport: { width: clientWidth, height: clientHeight }});
  }, []);

  return null;
}

function Dummy() {
  const { sendMessage, lastMessage } = useAppWebsocket();
  useEffect(() => {
    const variableMap: Record<string, any> = {};
    // console.log(lastMessage);
    if (lastMessage?.hasOwnProperty("allJournalEntries")) {
      // console.log(lastMessage.allJournalEntries.entries);
      lastMessage.allJournalEntries.entries.forEach((entry: string) => {
        // console.log(entry);
        const payload = JSON.parse(entry);
        const eventType = payload.event;
        Object.entries(payload).forEach(([field, value]) => {
          const valueType = typeof value;
          if (valueType !== "object") {
            const key = `${eventType}.${field}`;
            variableMap[key] = value;
          }
        });
        console.log(payload);
      });
    }

    console.log(variableMap);
  }, [lastMessage]);
  return <button onClick={() => sendMessage({ press: { button: 1, duration: 100 }})}>Test</button>
}

export default App;
