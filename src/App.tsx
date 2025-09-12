import StatusBar from "./StatusBar.tsx";
import {Layer, Stage} from "react-konva";
import {useEffect, useRef, useState} from "react";
import Button, {ButtonAttributes} from "./widgets/Button.tsx";
import {Vector2d} from "konva/lib/types";
import {buttonSerializer} from "./widgets/serialization/buttonSerializer.ts";
import {invoke} from "@tauri-apps/api/core";

const TEST: ButtonAttributes = {
  width: 200,
  height: 100,
  x: 100,
  y: 100,
  isToggle: false,
  primary: {
    fill: "black",
    text: "Hello",
    fontSize: 12,
    fontColor: "white",
    textAlignmentH: "center",
    textAlignmentV: "middle",
    strokeWidth: 0,
    cornerRadius: 0
  },
  pressed: {
    fontSize: 12,
    fontColor: "white",
    textAlignmentH: "center",
    textAlignmentV: "middle",
    strokeWidth: 0,
    cornerRadius: 0
  }
};

function App() {
  const [ testObj, setTestObj ] = useState(TEST);
  const [ fonts, setFonts ] = useState<string[]>([]);
  const stageContainerRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    invoke<string[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  const handlePositionChange = ({ x, y }: Vector2d) => {
    setTestObj(ov => Object.assign({}, ov, { x, y }));
  };

  return (
    <main>
      <div className="main-container">
        {/*<div>*/}
        {/*  {fonts.map(f => <div key={f} style={{ fontFamily: f }}>{f}</div>)}*/}
        {/*</div>*/}
        <div className="stage-container" ref={stageContainerRef}>
          <Stage width={window.innerWidth} height={Math.max(stageContainerRef?.current?.offsetHeight ?? 0, 500)}>
            <Layer>
              <Button attr={testObj} state="primary" onChangePosition={handlePositionChange} />
            </Layer>
          </Stage>
        </div>
      </div>
      {/*<button onClick={() => console.log(testObj)}>Print</button>*/}
      {/*<input*/}
      {/*  onChange={(evt) => setTestObj(ov => Object.assign({}, ov, { width: Number.parseInt(evt.target.value) }))}*/}
      {/*  value={testObj.width}*/}
      {/*  type="range"*/}
      {/*  min={0}*/}
      {/*  max={1000}*/}
      {/*/>*/}
      {/*<input*/}
      {/*  onChange={(evt) => setTestObj(ov => Object.assign({}, ov, { x: Number.parseInt(evt.target.value) }))}*/}
      {/*  value={testObj.x}*/}
      {/*  type="range"*/}
      {/*  min={0}*/}
      {/*  max={1000}*/}
      {/*/>*/}
      <button onClick={() => console.log(buttonSerializer(testObj))}>Serialize</button>
      <StatusBar />
    </main>
  );
}

export default App;
