import {Attributes, Widget} from "./widget.ts";
import {Group, Rect, Text} from "react-konva";
import {KonvaEventObject} from "konva/lib/Node";
import {useCallback} from "react";
import {Shape} from "konva/lib/Shape";
import {Vector2d} from "konva/lib/types";

export type ButtonAttributes = Widget & {
  isToggle: boolean;
  primary: Attributes;
  pressed: Attributes;
};

export type ButtonProps = {
  attr: ButtonAttributes;
  state: "primary" | "pressed";
  onChangePosition: (pos: Vector2d) => void;
};

function extractAttr<K extends keyof Attributes>(attrs: ButtonAttributes, state: ButtonProps["state"], key: K): Attributes[K] {
  if (state === "primary") {
    return attrs.primary[key];
  }
  return attrs.pressed[key] ?? attrs.primary[key];
}

export default function Button({ attr, state, onChangePosition }: ButtonProps) {

  const extract = useCallback(function _<K extends keyof Attributes>(key: K): Attributes[K] {
    return extractAttr(attr, state, key);
  }, [attr, state]);

  const handleReposition = (evt: KonvaEventObject<DragEvent>) => {
    // console.log(evt);
    const shape = evt.target as Shape;
    console.log(`${shape.x()}, ${shape.y()}`);
    onChangePosition({ x: shape.x(), y: shape.y() });
  };

  // const isIcon = Boolean(attr[state].icon);

  console.log("rerender");

  return (
    <Group
      x={attr.x}
      y={attr.y}
      draggable
      onDragEnd={handleReposition}
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
        fontSize={extract("fontSize")}
        fill={extract("fontColor")}
      />
    </Group>
  );
}
