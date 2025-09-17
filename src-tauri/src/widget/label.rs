use serde::{Deserialize, Serialize};
use crate::widget::base::WidgetBase;

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LabelAttributes {
    #[serde(flatten)]
    pub widget: WidgetBase,
    // TODO: usesVariables?
}
