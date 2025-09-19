use std::{env, fs};
use std::path::PathBuf;
use chrono::Local;
use log4rs::append::Append;
use log4rs::append::console::ConsoleAppender;
use log4rs::append::rolling_file::policy::compound::CompoundPolicy;
use log4rs::append::rolling_file::policy::compound::roll::fixed_window::FixedWindowRoller;
use log4rs::append::rolling_file::policy::compound::trigger::size::SizeTrigger;
use log4rs::append::rolling_file::RollingFileAppender;
use log4rs::Config;
use log4rs::config::{Appender, Root};
use log::{debug, info, LevelFilter};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Debug)]
pub struct ApplicationAppender {
    app_handle: AppHandle,
}

impl ApplicationAppender {
    fn new(app_handle: AppHandle) -> Self {
        ApplicationAppender { app_handle }
    }
}

impl Append for ApplicationAppender {
    fn append(&self, record: &log::Record) -> anyhow::Result<()> {
        let msg = LogMessage::from_record(record);
        self.app_handle.emit("log-event", &msg)?;
        Ok(())
    }

    fn flush(&self) {}
}

#[derive(Serialize)]
struct LogMessage {
    level: String,
    timestamp: String,
    message: String,
}

impl LogMessage {
    fn from_record(record: &log::Record) -> Self {
        LogMessage {
            level: record.level().to_string(),
            timestamp: Local::now().to_rfc3339(),
            message: record.args().to_string(),
        }
    }
}

fn make_rolling_file_appender() -> RollingFileAppender {
    let data_dir = dirs::data_local_dir().unwrap_or_default();
    let ec_dir = data_dir.join("elite-control");
    
    if !ec_dir.exists() {
        let _ = fs::create_dir(&ec_dir);
    }
    
    let trigger = SizeTrigger::new(10 * 1024 * 1024);

    let roller = FixedWindowRoller::builder()
        .build("elite-control.{}.log", 5)
        .unwrap();

    let policy = CompoundPolicy::new(Box::new(trigger), Box::new(roller));
    
    RollingFileAppender::builder()
        .build(ec_dir.join("elite-control.log"), Box::new(policy))
        .unwrap()
}

pub fn setup_logging(app_handle: AppHandle) {
    let log_level = env::var("ELITE_CONTROL_LOG_LEVEL")
        .ok()
        .and_then(|lvl| lvl.parse::<LevelFilter>().ok())
        .unwrap_or(LevelFilter::Debug);
    
    let file_log = make_rolling_file_appender();
    let app_log = ApplicationAppender::new(app_handle.clone());
    
    #[cfg(debug_assertions)]
    let stdout = ConsoleAppender::builder().build();

    let mut builder = Config::builder()
        .appender(
            Appender::builder()
                .filter(Box::new(log4rs::filter::threshold::ThresholdFilter::new(LevelFilter::Debug)))
                .build("file_log", Box::new(file_log)),
        )
        .appender(
            Appender::builder()
                .filter(Box::new(log4rs::filter::threshold::ThresholdFilter::new(LevelFilter::Info)))
                .build("app_log", Box::new(app_log)),
        );

    #[cfg(debug_assertions)]
    {
        builder = builder.appender(
            Appender::builder()
                .filter(Box::new(log4rs::filter::threshold::ThresholdFilter::new(LevelFilter::Debug)))
                .build("stdout", Box::new(stdout)),
        );
    }
    
    let root = {
        let mut root_builder = Root::builder()
            .appender("file_log")
            .appender("app_log");
        
        #[cfg(debug_assertions)]
        {
            root_builder = root_builder.appender("stdout");
        }
        
        root_builder.build(log_level)
    };

    let config = builder.build(root).unwrap();

    log4rs::init_config(config).unwrap();
    debug!("Logging initialized");
}
