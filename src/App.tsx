import StatusBar from "./StatusBar.tsx";
import Editor from "./Editor.tsx";

/*--------------------
  TODO:
- Extract Editor to its own area
- Develop out Editor
- Develop Panels/Panel selector
- Persisting/loading panels/collections
- Button action types (navigation/press/toggle)
- Labels
- Variables (journal extractor on backend)
- Dynamic Font loading
- Improved error-handling in Rust code
- Logger that logs to both file and Desktop UI
- Sync viewport size button (when clients are attached)
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
