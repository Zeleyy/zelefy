#[repr(u8)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StorageType {
    Cache = 0,
    Library = 1,
}
