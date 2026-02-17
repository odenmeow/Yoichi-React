const STORAGE_USERS_KEY = "yoichi-member-users-v1";
const STORAGE_SESSION_KEY = "yoichi-member-session-v1";
const SECRET = "yoichi-member-secret-11806";

const SUPER_ACCOUNT = {
  id: "11806",
  pwd: "ya11806ya",
};

const safeGet = (key) => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn("localStorage read error", key, error);
    return null;
  }
};

const safeSet = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn("localStorage write error", key, error);
    return false;
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("localStorage remove error", key, error);
  }
};

const xorString = (input, key) => {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    out += String.fromCharCode(code);
  }
  return out;
};

const encode = (plain) => {
  try {
    return btoa(unescape(encodeURIComponent(xorString(plain, SECRET))));
  } catch {
    return "";
  }
};

const decode = (cipher) => {
  try {
    const text = decodeURIComponent(escape(atob(cipher)));
    return xorString(text, SECRET);
  } catch {
    return "";
  }
};

const readUsers = () => {
  const raw = safeGet(STORAGE_USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(decode(raw));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (user) => user && typeof user.id === "string" && typeof user.pwd === "string"
    );
  } catch {
    return [];
  }
};

const writeUsers = (users) => safeSet(STORAGE_USERS_KEY, encode(JSON.stringify(users)));

const normalizeCred = (id, pwd) => ({
  id: String(id || "").trim(),
  pwd: String(pwd || "").trim(),
});

const isSuperCredential = (id, pwd) => id === SUPER_ACCOUNT.id && pwd === SUPER_ACCOUNT.pwd;

export const createMemberBySuper = (currentMember, id, pwd) => {
  if (!currentMember || currentMember.role !== "super") {
    return { ok: false, message: "只有管理員可建立帳號" };
  }

  const next = normalizeCred(id, pwd);
  if (!next.id || !next.pwd) {
    return { ok: false, message: "帳號密碼不可為空" };
  }

  if (next.id === SUPER_ACCOUNT.id) {
    return { ok: false, message: "此帳號不可建立" };
  }

  const users = readUsers();
  if (users.some((user) => user.id === next.id)) {
    return { ok: false, message: "帳號已存在" };
  }

  users.push({ id: next.id, pwd: next.pwd });
  writeUsers(users);
  return { ok: true, message: "建立帳號成功" };
};

export const loginMember = (id, pwd) => {
  const safe = normalizeCred(id, pwd);
  const isSuper = isSuperCredential(safe.id, safe.pwd);
  const users = readUsers();
  const isMember = users.some((user) => user.id === safe.id && user.pwd === safe.pwd);

  if (!isSuper && !isMember) {
    return { ok: false, message: "帳號或密碼錯誤" };
  }

  safeSet(
    STORAGE_SESSION_KEY,
    encode(JSON.stringify({ id: safe.id, loggedAt: Date.now() }))
  );
  return { ok: true, message: "登入成功" };
};

export const logoutMember = () => {
  safeRemove(STORAGE_SESSION_KEY);
};

export const getCurrentMember = () => {
  const raw = safeGet(STORAGE_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(decode(raw));
    if (!session || typeof session.id !== "string") return null;

    if (session.id === SUPER_ACCOUNT.id) {
      return { id: session.id, role: "super" };
    }

    const users = readUsers();
    if (users.some((u) => u.id === session.id)) {
      return { id: session.id, role: "member" };
    }
    return null;
  } catch {
    return null;
  }
};

export const requireMember = () => getCurrentMember() != null;

export const logoutWhenHidden = () => {
  const onHidden = () => {
    if (document.hidden) {
      logoutMember();
    }
  };
  document.addEventListener("visibilitychange", onHidden);
  return () => document.removeEventListener("visibilitychange", onHidden);
};
