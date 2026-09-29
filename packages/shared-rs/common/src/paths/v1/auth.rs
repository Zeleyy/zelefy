use const_format::concatcp;

use crate::paths::API_V1;

pub const LOGIN: &str = "/public/auth/login";
pub const REGISTER: &str = "/public/auth/register";
pub const REFRESH: &str = "/public/auth/refresh";
pub const LOGOUT: &str = "/auth/logout";
pub const LOGOUT_ALL: &str = "/auth/logout-all";

pub const LOGIN_FULL: &str = concatcp!(API_V1, LOGIN);
pub const REGISTER_FULL: &str = concatcp!(API_V1, REGISTER);
pub const REFRESH_FULL: &str = concatcp!(API_V1, REFRESH);
pub const LOGOUT_FULL: &str = concatcp!(API_V1, LOGOUT);
pub const LOGOUT_ALL_FULL: &str = concatcp!(API_V1, LOGOUT_ALL);
