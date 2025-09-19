import {useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

export type FontSpec = {
  name: string;
  postscriptName: string;
};

export type AttributesPanelProps = {
  onPrint: () => void;
};

export function AttributesPanel({ onPrint }: AttributesPanelProps) {
  const [ _fonts, setFonts ] = useState<FontSpec[]>([]);

  useEffect(() => {
    invoke<FontSpec[]>("list_system_fonts").then(fonts => setFonts(fonts));
  }, []);

  return (
    <div className="attributes-panel fill-y">
      <div>TODO</div>
      <button onClick={onPrint}>Print</button>
    </div>
  );
}