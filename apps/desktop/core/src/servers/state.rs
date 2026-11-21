use std::sync::{
    PoisonError, RwLock,
    atomic::{AtomicBool, Ordering},
};

use rusqlite::Connection;

use crate::{
    db::repository::servers,
    models::servers::{NewServer, Server},
};

pub const DEFAULT_SERVER_URL: &str = "api.zelefy.zeleyy.com";
pub const DEFAULT_SERVER_NAME: &str = "Zelefy";

pub struct AppServers {
    active: RwLock<Server>,
    switching: AtomicBool,
}

struct SwitchGuard<'a>(&'a AtomicBool);

impl Drop for SwitchGuard<'_> {
    fn drop(&mut self) {
        self.0.store(false, Ordering::SeqCst);
    }
}

impl AppServers {
    pub fn init(conn: &mut Connection) -> rusqlite::Result<Self> {
        let active = match servers::get_active(conn)? {
            Some(s) => s,
            None => Self::recover_active(conn)?,
        };

        Ok(Self {
            active: RwLock::new(active),
            switching: AtomicBool::new(false),
        })
    }

    fn recover_active(conn: &mut Connection) -> rusqlite::Result<Server> {
        let tx = conn.transaction()?;

        let id = match servers::get_all(&tx)?.into_iter().next() {
            Some(s) => s.server_id,
            None => servers::create(
                &tx,
                NewServer {
                    server_name: DEFAULT_SERVER_NAME.into(),
                    server_url: DEFAULT_SERVER_URL.into(),
                },
            )?,
        };

        servers::set_active(&tx, id)?;
        let active = servers::get_active(&tx)?.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        tx.commit()?;
        Ok(active)
    }

    pub fn active(&self) -> Server {
        self.active
            .read()
            .unwrap_or_else(PoisonError::into_inner)
            .clone()
    }

    pub fn active_url(&self) -> String {
        self.active
            .read()
            .unwrap_or_else(PoisonError::into_inner)
            .server_url
            .clone()
    }

    pub fn is_switching(&self) -> bool {
        self.switching.load(Ordering::SeqCst)
    }

    pub fn switch(&self, conn: &mut Connection, server_id: i64) -> Result<Server, String> {
        if self.switching.swap(true, Ordering::SeqCst) {
            return Err("Server switch already in progress".into());
        }
        let _guard = SwitchGuard(&self.switching);

        let tx = conn.transaction().map_err(|e| e.to_string())?;

        if !servers::set_active(&tx, server_id).map_err(|e| e.to_string())? {
            return Err("Server not found".into());
        }
        let server = servers::get_active(&tx)
            .map_err(|e| e.to_string())?
            .ok_or("Active server missing after switch")?;

        tx.commit().map_err(|e| e.to_string())?;

        *self.active.write().unwrap_or_else(PoisonError::into_inner) = server.clone();
        Ok(server)
    }

    pub fn add(&self, conn: &Connection, new: NewServer) -> Result<i64, String> {
        servers::create(conn, new).map_err(|e| e.to_string())
    }

    pub fn remove(&self, conn: &Connection, server_id: i64) -> Result<bool, String> {
        if self.active().server_id == server_id {
            return Err("Cannot delete the active server".into());
        }
        servers::delete(conn, server_id).map_err(|e| e.to_string())
    }
}
