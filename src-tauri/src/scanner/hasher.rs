use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::Path;

use thiserror::Error;

#[derive(Error, Debug)]
pub enum HashError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("File too small for prehash")]
    TooSmall,
}

/// BLAKE3-based file hasher with prehash (head+tail) optimization
pub struct FileHasher {
    chunk_size: usize,
}

impl FileHasher {
    /// Default chunk size is 64KB for optimal BLAKE3 performance
    pub fn new(chunk_size: Option<usize>) -> Self {
        Self {
            chunk_size: chunk_size.unwrap_or(65536),
        }
    }

    /// Prehash: Hash the first and last 4KB of the file
    /// This is a fast way to detect files that are definitely NOT duplicates
    pub fn prehash(&self, path: &Path) -> Result<String, HashError> {
        let mut file = File::open(path)?;
        let file_size = file.metadata()?.len();

        let prehash_size: u64 = 4096; // 4KB from head and tail
        let mut hasher = blake3::Hasher::new();

        // Read head
        let head_size = std::cmp::min(prehash_size, file_size);
        let mut head_buf = vec![0u8; head_size as usize];
        file.read_exact(&mut head_buf)?;
        hasher.update(&head_buf);

        // Read tail (if file is larger than 2x prehash_size)
        if file_size > prehash_size * 2 {
            file.seek(SeekFrom::End(-(prehash_size as i64)))?;
            let mut tail_buf = vec![0u8; prehash_size as usize];
            file.read_exact(&mut tail_buf)?;
            hasher.update(&tail_buf);
        }

        // Also include file size in prehash for better discrimination
        hasher.update(&file_size.to_le_bytes());

        Ok(hasher.finalize().to_hex().to_string())
    }

    /// Full BLAKE3 hash of the entire file contents using streaming reads
    pub fn full_hash(&self, path: &Path) -> Result<String, HashError> {
        let mut file = File::open(path)?;
        let mut hasher = blake3::Hasher::new();
        let mut buffer = vec![0u8; self.chunk_size];

        loop {
            let bytes_read = file.read(&mut buffer)?;
            if bytes_read == 0 {
                break;
            }
            hasher.update(&buffer[..bytes_read]);
        }

        Ok(hasher.finalize().to_hex().to_string())
    }
}
