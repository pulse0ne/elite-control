import StatusBar from "./StatusBar.tsx";
import {Group, Layer, Rect, Stage, Text} from "react-konva";
import {useRef} from "react";

type ButtonAttributes = {
  icon: string | null;
  text: string | null;
  font: string | null;
  fontSize: number;
  fontColor: string;
  fill: string | null;
  stroke: string | null;
  cornerRadius: number;
};

type Size = {
  width: number;
  height: number;
};

type Position = {
  x: number;
  y: number;
};

type Button = Size & Position & {
  primary: ButtonAttributes;
  pressed: ButtonAttributes;
};

function App() {
  const stageContainerRef = useRef<HTMLDivElement|null>(null);
  return (
    <main>
      <div className="main-container">
        <div ref={stageContainerRef}>
          <Stage width={window.innerWidth} height={stageContainerRef?.current?.offsetHeight}>
            <Layer>
              <Group
                draggable
                onDragEnd={evt => console.log(evt)}
              >
                <Rect
                  width={100}
                  height={50}
                  fill="rgba(0, 255, 0, 0.1)"
                  stroke="lime"
                  strokeWidth={2}
                  cornerRadius={4}
                />
                <Text
                  width={100}
                  height={50}
                  verticalAlign="middle"
                  align="center"
                  text="Button"
                  fontSize={12}
                  fill="lime"
                />
              </Group>
            </Layer>
          </Stage>
        </div>
      </div>
      <StatusBar />
    </main>
  );
}

export default App;
