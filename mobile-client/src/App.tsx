import "./App.css";

const baseurl = `${window.location.hostname}:${window.location.port}`;

function connectWebsocket() : WebSocket {
  let ws = new WebSocket(`ws://${baseurl}/ws`);
  ws.onopen = () => {console.log("opened")};
  return ws;
}

let ws = connectWebsocket();

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible" && ws.readyState === WebSocket.CLOSED) {
    ws = connectWebsocket();
  }
});

function App() {

  function testSend() {
    ws.send(JSON.stringify({ Press: { button: 1, duration: 100 }}));
  }

  return (
    <>
      <button onClick={testSend}>Send message</button>
    </>
  );
}

export default App;
