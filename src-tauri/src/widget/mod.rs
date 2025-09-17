use serde::{Deserialize, Serialize};

pub mod base;
pub mod button;
pub mod label;
pub mod panel;
pub mod pane_set;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum Widget {
    Button(button::ButtonAttributes),
    Label(label::LabelAttributes),
    Panel(panel::PanelAttributes),
}
