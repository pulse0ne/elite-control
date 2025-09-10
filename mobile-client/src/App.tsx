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

const testList: number[] = [];
for (let i = 1; i < 11; i++) {
  testList.push(i);
}

function App() {

  function testSend(i: number) {
    ws.send(JSON.stringify({ Press: { button: i, duration: 100 }}));
  }

  return (
    <>
      {testList.map(i => <button key={i} onClick={() => testSend(i)}>Send message {i}</button>)}
    </>
  );
}

export default App;
