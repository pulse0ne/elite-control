use serde::{Deserialize, Serialize};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum VerticalAlignment {
    Top,
    #[default]
    Middle,
    Bottom,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum HorizontalAlignment {
    Left,
    #[default]
    Center,
    Right,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Attributes {
    pub icon: Option<String>,
    pub text: Option<String>,
    pub font: Option<String>,
    pub font_size: u64,
    pub font_color: String,
    pub text_alignment_h: HorizontalAlignment,
    pub text_alignment_v: VerticalAlignment,
    pub fill: Option<String>,
    pub stroke: Option<String>,
    pub stroke_width: u64,
    pub corner_radius: u64,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Size {
    pub width: u64,
    pub height: u64,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Position {
    pub x: u64,
    pub y: u64,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WidgetBase {
    #[serde(flatten)]
    pub size: Size,
    #[serde(flatten)]
    pub position: Position,
}
