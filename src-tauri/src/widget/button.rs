use serde::{Deserialize, Serialize};
use crate::widget::base::{Attributes, WidgetBase};

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum ButtonType {
    #[default]
    Action,
    Toggle,
    Navigation,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ButtonAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    pub button_type: ButtonType,
    pub nav_target: Option<String>,
    pub primary: Attributes,
    pub pressed: Attributes,
}
