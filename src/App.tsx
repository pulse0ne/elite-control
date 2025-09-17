import StatusBar from "./statusbar/StatusBar.tsx";
import Editor from "./Editor.tsx";

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

function App() {
  return (
    <main>
      <div className="main-container">
        <Editor />
      </div>
      <StatusBar />
    </main>
  );
}

export default App;
