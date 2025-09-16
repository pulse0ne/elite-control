use std::collections::VecDeque;

#[derive(Clone)]
pub struct BoundedFifoVec<T: Clone> {
    data: VecDeque<T>,
    capacity: usize,
}

impl<T: Clone> BoundedFifoVec<T> {
    pub fn new(capacity: usize) -> Self {
        BoundedFifoVec {
            data: VecDeque::with_capacity(capacity),
            capacity,
        }
    }

    pub fn push(&mut self, item: T) {
        if self.data.len() == self.capacity {
            self.data.pop_front();
        }
        self.data.push_back(item);
    }

    pub fn push_all(&mut self, items: Vec<T>) {
        for item in items { self.push(item); } // TODO: optimize
    }

    pub fn clear(&mut self) {
        self.data.clear();
    }

    pub fn snapshot(&self) -> Vec<T> {
        self.data.iter().map(|item| item.clone().into()).collect()
    }
}
