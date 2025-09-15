import {Attributes, Position, Size, Widget} from "./widget.ts";
import {Group, Rect, Text, Transformer} from "react-konva";
import {KonvaEventObject} from "konva/lib/Node";
import {useCallback, useEffect, useRef} from "react";
import {Shape} from "konva/lib/Shape";

export type ButtonAttributes = Widget & {
  isToggle: boolean;
  primary: Attributes;
  pressed: Attributes;
};

export type ButtonProps = {
  attr: ButtonAttributes;
  state: "primary" | "pressed";
  onSelect: () => void;
  onUpdate: (sizePos: Size & Position) => void;
  isSelected?: boolean;
};

function extractAttr<K extends keyof Attributes>(attrs: ButtonAttributes, state: ButtonProps["state"], key: K): Attributes[K] {
  if (state === "primary") {
    return attrs.primary[key];
  }
  return attrs.pressed[key] ?? attrs.primary[key];
}

export default function Button({
  attr,
  state,
  onSelect,
  onUpdate,
  isSelected = false
}: ButtonProps) {
  const groupRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  const extract = useCallback(function _<K extends keyof Attributes>(key: K): Attributes[K] {
    return extractAttr(attr, state, key);
  }, [attr, state]);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    const shape = evt.target as Shape;
    onUpdate({ x: shape.x(), y: shape.y(), width: attr.width, height: attr.height });
  };

  const handleTransform = () => {
    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);

    onUpdate({ x: node.x(), y: node.y(), width: node.width() * scaleX, height: node.height() * scaleY });
  };

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  console.log("rerender Button");

  return (
    <>
      <Group
        ref={groupRef}
        x={attr.x}
        y={attr.y}
        width={attr.width}
        height={attr.height}
        draggable
        onClick={onSelect}
        onMouseDown={onSelect}
        onDragEnd={handleReposition}
        onTransformEnd={handleTransform}
      >
        <Rect
          width={attr.width}
          height={attr.height}
          fill={extract("fill") ?? undefined}
          stroke={extract("stroke") ?? undefined}
          strokeWidth={extract("strokeWidth")}
          cornerRadius={extract("cornerRadius")}
        />
        <Text
          width={attr.width}
          height={attr.height}
          verticalAlign={extract("textAlignmentV")}
          align={extract("textAlignmentH")}
          text={extract("text") ?? undefined}
          fontFamily={extract("font") ?? undefined}
          fontSize={extract("fontSize")}
          fill={extract("fontColor")}
        />
      </Group>
      {isSelected && <Transformer ref={trRef} rotateEnabled={false} />}
    </>
  );
}
