import {Attributes, Widget} from "./widget.ts";

export type LabelAttributes = Widget & Attributes & {
    usesVariables: boolean;
};


