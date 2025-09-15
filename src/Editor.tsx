import {Layer, Rect, Stage} from "react-konva";
import {useEffect, useRef, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import Button, {ButtonAttributes} from "./widgets/Button.tsx";
import {Position, Size} from "./widgets/widget.ts";
import {KonvaEventObject} from "konva/lib/Node";
import {Konva} from "konva/lib/_FullInternals";

const TEST: ButtonAttributes = {
  width: 200,
  height: 100,
  x: 100,
  y: 100,
  isToggle: false,
  primary: {
    fill: "lime",
    text: "Hello",
    fontSize: 12,
    fontColor: "black",
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

type FontSpec = {
  name: string;
  postscriptName: string;
};

export default function Editor() {
  const [ testObj, setTestObj ] = useState(TEST);
  const [ selectedItem, setSelectedItem ] = useState<number|null>(null);
  const [ workspaceSize, _setWorkspaceSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stageSize, setStageSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stagePosition, setStagePosition ] = useState<Position>({ x: 600, y: 400 });
  const [ stageScale, _setStageScale ] = useState<number>(1.0);
  const stageContainerRef = useRef<HTMLDivElement|null>(null);
  const stageRef = useRef<any>(null);

  useEffect(() => {
    function handleResize() {
      console.log('handling resize');
      setStageSize({
        width: stageContainerRef.current?.offsetWidth ?? 1200,
        height: stageContainerRef.current?.offsetHeight ?? 800
      });
    }

    handleResize();

    setStagePosition({
      x: (stageContainerRef.current?.offsetWidth ?? 1200) / 2.0 - workspaceSize.width / 2.0,
      y: (stageContainerRef.current?.offsetHeight ?? 800) / 2.0 - workspaceSize.height / 2.0
    });

    console.log("registering resize listener");
    window.addEventListener("resize", handleResize);

    return () => {
      console.log("unregistering resize listener");
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleUpdate = ({ x, y, width, height }: Size & Position) => {
    setTestObj(ov => Object.assign({}, ov, { x, y, width, height }));
  };

  const handleDeselect = (evt: KonvaEventObject<MouseEvent>) => {
    if (evt.target instanceof Konva.Stage) {
      setSelectedItem(null);
    }
  };

  const handleStageDrag = (evt: KonvaEventObject<MouseEvent>)=> {
    if (evt.target instanceof Konva.Stage) {
      const evtPos = evt.target.position();
      setStagePosition({x: evtPos.x, y: evtPos.y});
    }
  };

  return (
    <div className="editor-container fill-y">
      <TopBar />
      <div className="col fill no-overflow relative">
        <div className="stage-container flex-grow" ref={stageContainerRef}>
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={stageScale}
            scaleY={stageScale}
            x={stagePosition.x}
            y={stagePosition.y}
            draggable
            onClick={handleDeselect}
            onDragEnd={handleStageDrag}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={workspaceSize.width}
                height={workspaceSize.height}
                fill="#000"
              />
            </Layer>
            <Layer>
              {/* TODO: add real components here */}
              <Button
                attr={testObj}
                state="primary"
                isSelected={selectedItem === 1}
                onSelect={() => setSelectedItem(1)}
                onUpdate={handleUpdate}
              />
            </Layer>
          </Stage>
        </div>
        <AttributesPanel />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="topbar">
      <button>+ Add</button>
    </div>
  );
}

function AttributesPanel() {
  const [ _fonts, setFonts ] = useState<FontSpec[]>([]);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  return (
    <div className="attributes-panel fill-y">
      TODO
    </div>
  );
}
