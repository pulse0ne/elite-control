import StatusBar from "./statusbar/StatusBar.tsx";
import Editor from "./editor/Editor.tsx";
import {DevicesProvider} from "./hooks/useDevices.tsx";

/*--------------------
  TODO:
- Develop out Editor
- Need to add Send Back/Forward (controls widget ordering)
- Develop Panels/Panel selector
- Persisting/loading panes/pane sets
- Labels
- Dynamic Font loading (hook front-end up to it)
- Improved error-handling in Rust code
- Undo/Redo
- Duplication
- Sync viewport size button (when clients are attached)
- Custom images/svgs
- Audio/haptic feedback?
- Better UI theme
- Pane themes?
---------------------*/

function App() {
  return (
    <main>
      <DevicesProvider>
        <div className="main-container">
          <Editor />
        </div>
        <StatusBar />
      </DevicesProvider>
    </main>
  );
}

export default App;
