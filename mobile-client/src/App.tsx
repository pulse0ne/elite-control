import {useAppWebsocket, WebsocketProvider} from "./websocket/WebsocketContext.tsx";

// const baseurl = `${window.location.hostname}:${window.location.port}`;
//
// function connectWebsocket() : WebSocket {
//   let ws = new WebSocket(`ws://${baseurl}/ws`);
//   ws.onopen = () => {console.log("opened")};
//   return ws;
// }
//
// type WebsocketContext = {
//   websocket: WebSocket
// };
//
// const websocketContext: WebsocketContext = {
//   websocket: connectWebsocket()
// };
//
//
// document.addEventListener("visibilitychange", function () {
//   if (document.visibilityState === "visible" && websocketContext.websocket.readyState === WebSocket.CLOSED) {
//     websocketContext.websocket = connectWebsocket();
//   }
// });

function App() {

  // function testSend(i: number) {
  //   websocketContext.websocket.send(JSON.stringify({ Press: { button: i, duration: 100 }}));
  // }

  console.log('App');

  return (
    <WebsocketProvider>
      {/*{testList.map(i => <button key={i} onClick={() => testSend(i)}>Send message {i}</button>)}*/}
      <Dummy />
    </WebsocketProvider>
  );
}

function Dummy() {
  const { sendMessage } = useAppWebsocket();
  console.log('Dummy');
  return <button onClick={() => sendMessage(JSON.stringify({ Press: { button: 1, duration: 100 }}))}>Test</button>
}

export default App;
