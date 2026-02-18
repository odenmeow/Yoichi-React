import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  createMemberBySuper,
  getCurrentMember,
  getRememberedAccount,
  loginMember,
  logoutMember,
  logoutWhenHidden,
  setRememberedAccount,
} from "../lib/memberAuth";
import { normalizeAppInteraction } from "../lib/viewCleanup";

const cardStyle = {
  maxWidth: 700,
  margin: "2rem auto",
  padding: "1.4rem",
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.12)",
};

const HISTORY_ENTRY_FLAG = "yoichi-history-entry-from-member";

export default function Member() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [newAccount, setNewAccount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [member, setMember] = useState(null);
  const [rememberAccount, setRememberAccount] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    normalizeAppInteraction();
    const remembered = getRememberedAccount();
    if (remembered) {
      setAccount(remembered);
      setRememberAccount(true);
    }
    setMember(getCurrentMember());
    const cleanupHidden = logoutWhenHidden();

    const syncMemberState = () => {
      normalizeAppInteraction();
      setMember(getCurrentMember());
    };
    document.addEventListener("visibilitychange", syncMemberState);
    const timer = setInterval(normalizeAppInteraction, 700);

    return () => {
      clearInterval(timer);
      cleanupHidden();
      document.removeEventListener("visibilitychange", syncMemberState);
    };
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();
    const result = loginMember(account, password);
    setMessage(result.message);
    if (result.ok) {
      if (rememberAccount) {
        setRememberedAccount(account);
      } else {
        setRememberedAccount("");
      }
      setMember(getCurrentMember());
      setPassword("");
    }
  };

  const handleCreateMember = (event) => {
    event.preventDefault();
    const result = createMemberBySuper(member, newAccount, newPassword);
    setMessage(result.message);
    if (result.ok) {
      setNewAccount("");
      setNewPassword("");
    }
  };

  const handleLogout = () => {
    logoutMember();
    setMember(null);
    setMessage("已登出");
  };

  const handleEnterHistory = () => {
    sessionStorage.setItem(HISTORY_ENTRY_FLAG, "1");
    router.push("/history");
  };

  const handleLeaveMemberArea = () => {
    logoutMember();
    setMember(null);
    sessionStorage.removeItem(HISTORY_ENTRY_FLAG);
  };

  return (
    <div>
      <Head>
        <title>會員專區</title>
      </Head>
      <header>
        <nav className="nav nav-pills flex-column flex-sm-row">
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="/"
            onClick={handleLeaveMemberArea}
          >
            工作區
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="/edit"
            onClick={handleLeaveMemberArea}
          >
            功能編輯
          </Link>
          <Link className="flex-sm-fill text-sm-center nav-link active" href="#">
            會員專區
          </Link>
        </nav>
      </header>

      <main style={{ minHeight: "78vh", padding: "0 1rem" }}>
        <section style={cardStyle}>
          <h2 style={{ marginBottom: "0.25rem" }}>會員專區</h2>
          <p style={{ color: "#657083", marginBottom: "1rem" }}>
            切換頁籤會自動要求重新登入。
          </p>

          {!member ? (
            <form style={{ display: "grid", gap: "0.75rem" }}>
              <input
                className="form-control"
                placeholder="帳號"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
              <input
                type="password"
                className="form-control"
                placeholder="密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: 0 }}>
                <input
                  type="checkbox"
                  checked={rememberAccount}
                  onChange={(e) => setRememberAccount(e.target.checked)}
                />
                記住帳號
              </label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-primary" onClick={handleLogin}>
                  登入
                </button>
              </div>
            </form>
          ) : (
            <section style={{ display: "grid", gap: "0.9rem" }}>
              <div
                style={{
                  background: "#f3f8ff",
                  border: "1px solid #d5e4ff",
                  borderRadius: "12px",
                  padding: "0.75rem 0.85rem",
                }}
              >
                目前登入：<b>{member.id}</b>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="btn btn-primary" type="button" onClick={handleEnterHistory}>
                  前往後臺
                </button>
                <button className="btn btn-outline-danger" onClick={handleLogout}>
                  登出
                </button>
              </div>

              {member.role === "super" ? (
                <form
                  style={{
                    marginTop: "0.35rem",
                    paddingTop: "0.8rem",
                    borderTop: "1px solid #e5e7eb",
                    display: "grid",
                    gap: "0.65rem",
                  }}
                >
                  <h5 style={{ margin: 0 }}>新增帳號</h5>
                  <input
                    className="form-control"
                    placeholder="新帳號"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                  />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="新密碼"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div>
                    <button className="btn btn-outline-primary" onClick={handleCreateMember}>
                      建立帳號
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          )}

          {message ? (
            <p
              style={{
                marginTop: "1rem",
                marginBottom: 0,
                color: message.includes("成功") ? "#0f766e" : "#b91c1c",
              }}
            >
              {message}
            </p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
