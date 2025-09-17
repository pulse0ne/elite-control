use serde::Deserialize;
use crate::widget::Widget;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaneSize {
    pub width: u64,
    pub height: u64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Pane {
    pub id: String,
    pub name: String,
    pub background_color: String,
    pub size: PaneSize,
    pub widgets: Vec<Widget>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PaneSet {
    pub id: String,
    pub name: String,
    pub panes: Vec<Pane>,
}
