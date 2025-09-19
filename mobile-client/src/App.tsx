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

const lastViewportSize = { width: 0, height: 0 };

function ViewportReporter() {
  const { sendMessage } = useAppWebsocket();

  useEffect(() => {
    function sendViewportReport() {
      const { clientWidth: width, clientHeight: height } = document.documentElement;
      if (lastViewportSize.width !== width || lastViewportSize.height !== height) {
        sendMessage({ viewportReport: { width, height } });
        lastViewportSize.width = width;
        lastViewportSize.height = height;
      }
    }
    console.log("sending initial viewport dimensions");
    sendViewportReport();

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    if (mediaQuery.matches) {
      console.log("portrait mode");
    } else {
      console.log("landscape mode");
    }

    function resizeWatcher() {
      console.log("got resize event");
      sendViewportReport();
    }

    window.addEventListener("resize", resizeWatcher);

    return () => {
      document.removeEventListener("resize", resizeWatcher);
    };
  }, []);

  return <></>;
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
