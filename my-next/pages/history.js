import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";
import {
  getCurrentMember,
  getRememberedAccount,
  loginMember,
  logoutMember,
  logoutWhenHidden,
  setRememberedAccount,
} from "../lib/memberAuth";
import { normalizeAppInteraction } from "../lib/viewCleanup";

const HISTORY_ENTRY_FLAG = "yoichi-history-entry-from-member";

export default function History() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [rememberAccount, setRememberAccount] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    normalizeAppInteraction();
    const remembered = getRememberedAccount();
    if (remembered) {
      setAccount(remembered);
      setRememberAccount(true);
    }
    const timer = setInterval(normalizeAppInteraction, 700);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const member = getCurrentMember();
    const fromMember = sessionStorage.getItem(HISTORY_ENTRY_FLAG) === "1";

    if (member && fromMember) {
      setAllowed(true);
      return;
    }

    setAllowed(false);
    sessionStorage.removeItem(HISTORY_ENTRY_FLAG);
  }, []);

  useEffect(() => {
    if (!allowed) return;

    normalizeAppInteraction();

    const bootstrapFallback = { Popover: class {} };
    let initialized = false;
    const initializePage = () => {
      if (initialized) return;
      initialized = true;
      myHistoryScript(LZString, window.bootstrap || bootstrapFallback);
      normalizeAppInteraction();
    };

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
    script.async = true;
    script.onload = initializePage;
    script.onerror = initializePage;
    const fallbackTimer = setTimeout(initializePage, 1500);
    document.body.appendChild(script);

    const cleanupHidden = logoutWhenHidden();
    const syncSession = () => {
      if (!getCurrentMember()) {
        setAllowed(false);
        sessionStorage.removeItem(HISTORY_ENTRY_FLAG);
        router.replace("/member");
      }
    };
    document.addEventListener("visibilitychange", syncSession);

    return () => {
      clearTimeout(fallbackTimer);
      cleanupHidden();
      document.removeEventListener("visibilitychange", syncSession);
      window.__yoichiHistoryScriptInitialized = false;
      document.body.removeChild(script);
    };
  }, [allowed, router]);

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
      setPassword("");
      sessionStorage.setItem(HISTORY_ENTRY_FLAG, "1");
      setAllowed(true);
    }
  };

  const handleBackToMember = () => {
    logoutMember();
    sessionStorage.removeItem(HISTORY_ENTRY_FLAG);
    router.replace("/member");
  };

  const handleLeaveHistory = () => {
    logoutMember();
    sessionStorage.removeItem(HISTORY_ENTRY_FLAG);
  };

  return (
    <div>
      <header>
        <nav className="nav nav-pills flex-column flex-sm-row">
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="/"
            onClick={handleLeaveHistory}
          >
            工作區
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="/edit"
            onClick={handleLeaveHistory}
          >
            功能編輯
          </Link>
          <Link className="flex-sm-fill text-sm-center nav-link active" href="/member">
            歷史紀錄
          </Link>
        </nav>
      </header>

      <main>
        {!allowed ? (
          <section style={{ maxWidth: 560, margin: "2rem auto", padding: "0 1rem" }}>
            <form style={{ display: "grid", gap: "0.75rem" }}>
              <h3 style={{ marginBottom: "0.25rem" }}>登入後才能查看歷史紀錄</h3>
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
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={handleLogin}>
                  登入並查看
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleBackToMember}
                >
                  回會員專區
                </button>
              </div>
              {message ? (
                <p style={{ margin: 0, color: message.includes("成功") ? "#0f766e" : "#b91c1c" }}>
                  {message}
                </p>
              ) : null}
            </form>
          </section>
        ) : (
          <>
            <section
              className="presentation-Area"
              style={{ height: "65vh", marginTop: "1rem" }}
            ></section>
            <section
              className="presentation-Area date-block"
              style={{ height: "20vh", marginTop: "1rem" }}
            ></section>
          </>
        )}
      </main>

      <footer>
        &copy; Made By
        <a href="mailto:qw28425382694@gmail.com" title="qw28425382694@gmail.com">
          Oni
        </a>
      </footer>
    </div>
  );
}
