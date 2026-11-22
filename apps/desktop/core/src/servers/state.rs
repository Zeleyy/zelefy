use std::sync::{
    PoisonError, RwLock,
    atomic::{AtomicBool, Ordering},
};

use rusqlite::Connection;

use crate::{
    db::repository::servers,
    models::servers::{NewServer, Server},
    services::errors::CoreError,
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

    pub fn switch(&self, conn: &mut Connection, server_id: i64) -> Result<Server, CoreError> {
        if self.switching.swap(true, Ordering::SeqCst) {
            return Err(CoreError::Conflict(
                "Server switch already in progress".to_string(),
            ));
        }
        let _guard = SwitchGuard(&self.switching);

        let tx = conn.transaction()?;

        if !servers::set_active(&tx, server_id)? {
            return Err(CoreError::NotFound(server_id));
        }
        let server = servers::get_active(&tx)?.ok_or(CoreError::Conflict(
            "Active server missing after switch".to_string(),
        ))?;

        tx.commit()?;

        *self.active.write().unwrap_or_else(PoisonError::into_inner) = server.clone();
        Ok(server)
    }

    pub fn remove(&self, conn: &Connection, server_id: i64) -> Result<bool, CoreError> {
        if self.active().server_id == server_id {
            return Err(CoreError::Conflict(
                "Cannot delete the active server".to_string(),
            ));
        }
        Ok(servers::delete(conn, server_id)?)
    }

    pub fn reset(&self, conn: &mut Connection) -> Result<Server, CoreError> {
        if self.switching.swap(true, Ordering::SeqCst) {
            return Err(CoreError::Conflict(
                "Server switch already in progress".to_string(),
            ));
        }
        let _guard = SwitchGuard(&self.switching);

        let tx = conn.transaction()?;

        let id = match servers::get_by_url(&tx, DEFAULT_SERVER_URL)? {
            Some(s) => {
                servers::set_name(&tx, s.server_id, DEFAULT_SERVER_NAME)?;
                s.server_id
            }
            None => servers::create(
                &tx,
                NewServer {
                    server_name: DEFAULT_SERVER_NAME.into(),
                    server_url: DEFAULT_SERVER_URL.into(),
                },
            )?,
        };

        servers::set_active(&tx, id)?;

        let server = servers::get_active(&tx)?
            .ok_or_else(|| CoreError::Conflict("Active server missing after reset".to_string()))?;

        tx.commit()?;

        *self.active.write().unwrap_or_else(PoisonError::into_inner) = server.clone();
        Ok(server)
    }
}
