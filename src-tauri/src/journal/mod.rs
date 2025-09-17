mod bounded_fifo_vec;

use std::fs::File;
use std::io::{BufRead, BufReader, Error};
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::mpsc as std_mpsc;
use notify::{Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;
use anyhow::Result;
use log::{error, info};
use crate::journal::bounded_fifo_vec::BoundedFifoVec;

#[derive(Clone)]
pub struct Journal {
    journal_path: PathBuf,
    offset: usize,
    log: BoundedFifoVec<String>,
}

impl Journal {
    pub fn new<P: Into<PathBuf>>(journal_path: P) -> Self {
        let mut journal = Journal {
            journal_path: journal_path.into(),
            offset: 0,
            log: BoundedFifoVec::new(512),
        };
        journal.preread();
        journal
    }

    pub fn change_path<P: Into<PathBuf>>(&mut self, journal_path: P) {
        self.journal_path = journal_path.into();
        self.offset = 0;
    }

    pub fn preread(&mut self) {
        self.log.clear();
        self.offset = 0;
        self.read();
    }

    pub fn read(&mut self) -> Vec<String> {
        if let Ok(entries) = read_journal(&self.journal_path, self.offset) {
            self.offset += entries.len();
            self.log.push_all(entries.clone());
            entries
        } else {
            vec![]
        }
    }

    pub fn entries(&self) -> Vec<String> {
        self.log.snapshot()
    }
}

pub async fn watch_journal(
    journal: Arc<Mutex<Journal>>,
    tx: Sender<Vec<String>>,
) -> Result<RecommendedWatcher> {
    let journal_path = journal.lock().await.journal_path.clone();
    info!("watching journal: {}", journal_path.display());

    let (sync_tx, sync_rx) = std_mpsc::channel::<()>();

    {
        let journal = Arc::clone(&journal);
        let tx = tx.clone();
        tokio::task::spawn_blocking(move || {
            for _ in sync_rx.iter() {
                let journal = Arc::clone(&journal);
                let tx = tx.clone();
                
                tokio::spawn(async move {
                    let journal = Arc::clone(&journal);
                    let tx = tx.clone();
                    tokio::spawn(async move {
                        let mut journal = journal.lock().await;
                        let entries = journal.read();
                        if !entries.is_empty() {
                            let _ = tx.send(entries.clone()).await;
                        }
                    });
                });
            }
        });
    }
    
    let mut watcher = notify::recommended_watcher(move |res: notify::Result<Event>| {
        match res {
            Ok(event) => {
                if matches!(event.kind, EventKind::Modify(..)) {
                    let _ = sync_tx.send(());
                }
            }
            Err(e) => error!("watch error: {:?}", e),
        }
    })?;

    watcher.watch(&journal_path, RecursiveMode::NonRecursive)?;
    Ok(watcher)
}

fn read_journal(path: &Path, seek_lines: usize) -> Result<Vec<String>, Error> {
    let journal_handle = File::open(path)?;
    let newlines = BufReader::new(journal_handle)
        .lines()
        .skip(seek_lines)
        .filter_map(Result::ok)
        .map(|line| line.trim().to_string())
        .filter(|line| !line.is_empty())
        .collect();
    Ok(newlines)
}

#[test]
fn test_read_journal() {
    let manifest_dir = env!("CARGO_MANIFEST_DIR");
    let journal_path = Path::new(manifest_dir).join("tests/fixtures/journal.log");

    let raw_lines_count = BufReader::new(File::open(&journal_path).unwrap())
        .lines()
        .count();

    let journal = read_journal(&journal_path, 0).unwrap();
    assert_eq!(journal.len(), raw_lines_count);

    let journal2 = read_journal(&journal_path, 1).unwrap();
    assert_eq!(journal2.len(), raw_lines_count - 1);
}
