import {Attributes} from "../widget.ts";
import {ButtonAttributes} from "../Button.tsx";

export function buttonSerializer(input: ButtonAttributes): ButtonAttributes {
  const copy = JSON.parse(JSON.stringify(input)) as ButtonAttributes;
  for (const key in copy.primary) {
    const k = key as keyof Attributes;
    const v = copy.pressed[k];
    if (v === null || v === undefined) {
      copy.pressed[k] = copy.primary[k];
    }
  }
  return copy;
}