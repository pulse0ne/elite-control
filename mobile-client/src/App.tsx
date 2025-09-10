import {useAppWebsocket, WebsocketProvider} from "./websocket/WebsocketContext.tsx";
import ConnectionOverlay from "./ConnectionOverlay.tsx";

function App() {
  return (
    <WebsocketProvider>
      <Dummy />
      <ConnectionOverlay />
    </WebsocketProvider>
  );
}

function Dummy() {
  const { sendMessage } = useAppWebsocket();
  return <button onClick={() => sendMessage({ press: { button: 1, duration: 100 }})}>Test</button>
}

export default App;
