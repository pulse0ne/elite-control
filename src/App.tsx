import StatusBar from "./StatusBar.tsx";
import Editor from "./Editor.tsx";
import {useEffect, useState} from "react";
import useTauriListen from "./hooks/useTauriListen.tsx";

/*--------------------
  TODO:
- Develop out Editor
- Develop Panels/Panel selector
- Persisting/loading panels/collections
- Labels
- Dynamic Font loading (hook front-end up to it)
- Improved error-handling in Rust code
- Sync viewport size button (when clients are attached)
- Audio/haptic feedback?
---------------------*/

type LogEntry = {
  level: string;
  timestamp: string;
  message: string;
};

function App() {
  const [ log, setLog ] = useState<LogEntry[]>([]);

  const { lastEvent, unlisten } = useTauriListen<LogEntry>("log-event");

  useEffect(() => {
    console.log(lastEvent);
    if (lastEvent) {
      setLog(ov => [...ov, lastEvent]);
    }
  }, [lastEvent]);

  useEffect(() => {
    return () => {
      unlisten();
    };
  }, []);

  return (
    <main>
      <div className="main-container">
        <Editor />
      </div>
      <StatusBar />
      {/* TODO: component for this */}
      {log.map(l => <div key={l.timestamp}>{l.level} - {l.message}</div>)}
    </main>
  );
}

export default App;
