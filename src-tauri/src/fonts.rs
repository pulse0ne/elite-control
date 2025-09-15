use std::collections::HashSet;
use std::io::{Error, ErrorKind};
use std::path::PathBuf;
use font_kit::handle::Handle;
use font_kit::source::SystemSource;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Hash, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct FontSpec {
    pub name: String,
    pub format: String,
    pub postscript_name: String,
}

impl FontSpec {
    pub fn from_handle(handle: &Handle) -> Option<FontSpec> {
        let format = match handle {
            Handle::Path { path, .. } => path.extension().unwrap().to_str().unwrap().to_owned().to_lowercase(),
            _ => panic!(),
        };
        if format.ends_with("c") { // filter out collections
            return None;
        }
        let font = handle.load().unwrap();
        Some(
            FontSpec {
                name: font.full_name(),
                format,
                postscript_name: font.postscript_name().unwrap()
            }
        )
    }
}

pub fn list_fonts() -> Vec<FontSpec> {
    let source = SystemSource::new();
    let mut fonts: Vec<FontSpec> = source.all_fonts()
        .unwrap()
        .into_iter()
        .filter_map(|fh| {
            match fh {
                Handle::Path { path: _, font_index: _ } => FontSpec::from_handle(&fh),
                _ => None
            }
        })
        .collect::<HashSet<FontSpec>>()
        .into_iter()
        .collect();
    fonts.sort_by(|a, b| a.name.cmp(&b.name));
    fonts
}

pub fn get_font_path(raw: &str) -> Result<PathBuf, Error> {
    let source = SystemSource::new();
    let font_handle = source.select_by_postscript_name(&raw).map_err(|_e| Error::new(ErrorKind::Other, "Not found"))?;
    match font_handle {
        Handle::Path { path, .. } => Ok(path),
        _ => Err(Error::new(ErrorKind::Other, "Not a file-based font"))
    }
}
