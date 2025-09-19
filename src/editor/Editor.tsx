import {Layer, Rect, Stage} from "react-konva";
import {useEffect, useRef, useState} from "react";
import Button, {ButtonAttributes} from "../widgets/Button.tsx";
import {Position, Size} from "../widgets/widget.ts";
import {KonvaEventObject} from "konva/lib/Node";
import {Konva} from "konva/lib/_FullInternals";
import "./editor.css";
import {AttributesPanel} from "./AttributesPanel.tsx";

const TEST: ButtonAttributes = {
  type: "button",
  width: 200,
  height: 100,
  x: 0,
  y: 0,
  buttonType: "action",
  navTarget: null,
  primary: {
    fill: "rgba(0, 201, 102, 0.7)",
    text: "Hello",
    fontSize: 16,
    fontColor: "black",
    textAlignmentH: "center",
    textAlignmentV: "middle",
    strokeWidth: 2,
    cornerRadius: 8,
    icon: null,
    font: null,
    stroke: "rgb(0, 201, 102)"
  },
  pressed: {
    fontSize: 16,
    fontColor: "white",
    textAlignmentH: "center",
    textAlignmentV: "middle",
    strokeWidth: 0,
    cornerRadius: 0,
    icon: null,
    text: null,
    font: null,
    fill: null,
    stroke: null
  }
};

const SCALE_FACTOR = 1.01;

export default function Editor() {
  const [ testObj, setTestObj ] = useState(TEST);
  const [ selectedItem, setSelectedItem ] = useState<number|null>(null);
  const [ workspaceSize, _setWorkspaceSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stageSize, setStageSize ] = useState<Size>({ width: 1200, height: 800 });
  const [ stagePosition, setStagePosition ] = useState<Position>({ x: 600, y: 400 });
  const [ stageScale, setStageScale ] = useState<number>(1.0);
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
    if (evt.target instanceof Konva.Stage || evt.target.id() === "bg") {
      setSelectedItem(null);
    }
  };

  const handleStageDrag = (evt: KonvaEventObject<MouseEvent>)=> {
    if (evt.target instanceof Konva.Stage) {
      const evtPos = evt.target.position();
      setStagePosition({x: evtPos.x, y: evtPos.y});
    }
  };

  const handleWheel = (evt: KonvaEventObject<WheelEvent>) => {
    evt.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    const direction = evt.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * SCALE_FACTOR : oldScale / SCALE_FACTOR;

    setStageScale(newScale);

    setStagePosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
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
            onMouseDown={handleDeselect}
            onDragEnd={handleStageDrag}
            onWheel={handleWheel}
          >
            <Layer>
              <Rect
                id="bg"
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
        <AttributesPanel onPrint={() => console.log(testObj)} />
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

