import {Size, Widget} from "../widgets/widget.ts";
import {
  MdAdd,
  MdClose,
  MdPhoneAndroid,
} from "react-icons/md";
import {ChangeEvent} from "react";
import Popup from "reactjs-popup";
import {useDevices} from "../hooks/useDevices.tsx";

export type ToolbarProps = {
  dimensions: Size;
  onAddWidget: (widget: Widget) => void;
  onDimensionsChange: (size: Size) => void;
};

export function Toolbar({ dimensions, onDimensionsChange }: ToolbarProps) {
  const { devices } = useDevices();

  const handleWidthChange = (evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    const width = Number.parseInt(evt.target.value);
    if (!isNaN(width)) {
      onDimensionsChange({ ...dimensions, width });
    }
  };

  const handleHeightChange = (evt: ChangeEvent<HTMLInputElement>) => {
    console.log(evt.target.value);
    const height = Number.parseInt(evt.target.value);
    if (!isNaN(height)) {
      onDimensionsChange({ ...dimensions, height });
    }
  };

  return (
    <div className="toolbar relative">
      <button style={{ paddingLeft: 12 }}>
        <div className="row align-center" style={{ gap: 4 }}><MdAdd size={15} /> Add</div>
      </button>
      <div
        className="fill-y row align-center"
        style={{
          gap: 4,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)"
      }}>
        <input
          style={{ width: 50 }}
          value={dimensions.width}
          type="number"
          min={0}
          onChange={handleWidthChange}
        />
        <MdClose size={12} />
        <input
          style={{ width: 50 }}
          value={dimensions.height}
          type="number"
          min={0}
          onChange={handleHeightChange}
        />
        <Popup
          trigger={
            <MdPhoneAndroid
              style={{
                cursor: devices.length ? "pointer" : undefined,
                color: devices.length ? "var(--gradient-stop1)" : "#666"
            }}
            />
          }
          disabled={!devices.length}
          position="bottom center"
        >
          {devices.map(device => (
            <div key={device.ipAddr}>
              {device.ipAddr} - {device.viewportWidth}x{device.viewportHeight}
            </div>
          ))}
        </Popup>

      </div>
    </div>
  );
}