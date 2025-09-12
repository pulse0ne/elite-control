export type Attributes = {
    icon?: string | null;
    text?: string | null;
    font?: string | null;
    fontSize: number;
    fontColor: string;
    textAlignmentH: "left" | "center" | "right";
    textAlignmentV: "top" | "middle" | "bottom";
    fill?: string | null;
    stroke?: string | null;
    strokeWidth: number;
    cornerRadius: number;
};

export type Size = {
    width: number;
    height: number;
};

export type Position = {
    x: number;
    y: number;
};

export type Widget = Size & Position;

