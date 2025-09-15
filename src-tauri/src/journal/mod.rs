mod bounded_fifo_vec;

use std::fs::File;
use std::io::{BufRead, BufReader, Error};
use serde::{Deserialize, Serialize};
use crate::journal::bounded_fifo_vec::BoundedFifoVec;

pub struct Journal {
    journal_path: String,
    offset: usize,
    log: BoundedFifoVec<String>,
}

impl Journal {
    pub fn new(journal_path: String) -> Self {
        Journal {
            journal_path,
            offset: 0,
            log: BoundedFifoVec::new(128),
        }
    }

    pub fn change_path(&mut self, journal_path: String) {
        self.journal_path = journal_path;
        self.offset = 0;
    }

    pub fn preread(&mut self) {
        self.log.clear();
        self.offset = 0;
        self.read();
    }

    pub fn read(&mut self) {
        let results = read_journal(self.journal_path.as_str(), 0);
        match results {
            Ok(entries) => {
                self.offset += entries.len();
                self.log.push_all(entries);
            },
            _ => {},
        }
    }

    pub fn entries(&self) -> Vec<String> {
        self.log.snapshot()
    }
}

fn read_journal(journal_path: &str, seek_lines: usize) -> Result<Vec<String>, Error> {
    let journal_handle = File::open(journal_path)?;
    let newlines: Vec<String> = BufReader::new(journal_handle)
        .lines()
        .skip(seek_lines)
        .filter(|line| line.is_ok() && !line.as_ref().unwrap().trim().is_empty())
        .map(|line| line.unwrap())
        .collect();
    Ok(newlines)
}

#[test]
fn test_read_journal() {
    let journal_path = "tests/fixtures/journal.log";
    let raw_lines_count = BufReader::new(File::open(journal_path).unwrap()).lines().count();
    let seek_lines = 0;
    let journal = read_journal(journal_path, seek_lines).unwrap();
    assert_eq!(journal.len(), raw_lines_count);

    let journal2 = read_journal(journal_path, seek_lines + 1).unwrap();
    assert_eq!(journal2.len(), raw_lines_count - 1);
}
