const SESSION_USERNAME = "name";
const SESSION_TOKEN = "token";
const SESSION_EXPIRE = "expire";
const STORAGE_REMEMBER = "name-remember";

function pushToStorage(key, value) {
  window.localStorage.setItem(key, value);
}

function getFromStorage(key, value) {
  return window.localStorage.getItem(key, value);
}

function pushToSession(key, value) {
  window.sessionStorage.setItem(key, value);
}

function getFromSession(key, value) {
  return window.sessionStorage.getItem(key, value);
}

function removeFromStorage(key) {
  window.localStorage.removeItem(key);
}

function removeFromSession(key) {
  window.sessionStorage.removeItem(key);
}

function getSessionUsername() {
  return getFromSession(SESSION_USERNAME);
}

function getSessionToken() {
  return getFromSession(SESSION_TOKEN);
}

function getSessionExpire() {
  return getFromSession(SESSION_EXPIRE);
}

function getSessionData() {
  return {
    [SESSION_USERNAME]: getSessionUsername(),
    [SESSION_TOKEN]: getSessionToken(),
    [SESSION_EXPIRE]: getSessionExpire(),
  };
}

function getRememberedName() {
  return getFromStorage(STORAGE_REMEMBER);
}

function setRememberedName(val) {
  pushToStorage(STORAGE_REMEMBER, val);
}

function setSessionInfo({ name, token, expire }) {
  pushToSession(SESSION_USERNAME, name);
  pushToSession(SESSION_TOKEN, token);
  pushToSession(SESSION_EXPIRE, expire);
}

function setSessionUsername(val) {
  pushToSession(SESSION_USERNAME, val);
}

function setSessionToken(val) {
  pushToSession(SESSION_TOKEN, val);
}

function setSessionExpire(val) {
  pushToSession(SESSION_EXPIRE, val);
}

function removeSessionData() {
  removeFromSession(SESSION_USERNAME);
  removeFromSession(SESSION_TOKEN);
  removeFromSession(SESSION_EXPIRE);
}

function removeRememberedName() {
  removeFromStorage(STORAGE_REMEMBER);
}

function isLoggedIn() {
  const [name, token] = [getSessionUsername(), getSessionToken()];
  return !name || name == "null" || !token || token == "null";
}

export {
  pushToStorage,
  getFromStorage,
  pushToSession,
  getFromSession,
  removeFromStorage,
  removeFromSession,
  getSessionUsername,
  getSessionToken,
  getSessionExpire,
  getSessionData,
  getRememberedName,
  setRememberedName,
  setSessionInfo,
  setSessionUsername,
  setSessionToken,
  setSessionExpire,
  removeSessionData,
  removeRememberedName,
  isLoggedIn,
};
