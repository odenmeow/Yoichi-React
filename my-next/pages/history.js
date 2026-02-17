import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";
import {
  getCurrentMember,
  loginMember,
  logoutMember,
  logoutWhenHidden,
} from "../lib/memberAuth";

const HISTORY_ENTRY_FLAG = "yoichi-history-entry-from-member";

const normalizeHistoryView = () => {
  const oldLocks = Array.from(document.querySelectorAll("body *")).filter((el) => {
    const text = (el.textContent || "").trim();
    return text.includes("請輸入密碼觀看歷史紀錄") || text === "解鎖";
  });

  oldLocks.forEach((node) => {
    const wrap = node.closest("form, section, div");
    if (wrap) wrap.remove();
  });

  document.body.classList.remove("modal-open");
  document.documentElement.style.removeProperty("overflow");
  document.body.style.removeProperty("overflow");
  document.body.style.removeProperty("pointer-events");
  document.body.style.removeProperty("filter");

  const appRoot = document.getElementById("__next");
  if (appRoot) {
    appRoot.style.filter = "none";
    appRoot.style.pointerEvents = "auto";
    appRoot.style.opacity = "1";
  }

  document
    .querySelectorAll("main, section, .presentation-Area, .presentation-Area.date-block")
    .forEach((el) => {
      el.style.filter = "none";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
    });
};

export default function History() {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    normalizeHistoryView();
    const timer = setInterval(normalizeHistoryView, 700);
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

    normalizeHistoryView();

    const bootstrapFallback = { Popover: class {} };
    let initialized = false;
    const initializePage = () => {
      if (initialized) return;
      initialized = true;
      myHistoryScript(LZString, window.bootstrap || bootstrapFallback);
      normalizeHistoryView();
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
