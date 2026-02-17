import { useEffect, useMemo, useState } from "react";
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

export default function History() {
  const router = useRouter();
  const fromMember = useMemo(() => router.query.from === "member", [router.query.from]);

  const [allowed, setAllowed] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const member = getCurrentMember();
    if (member && fromMember) {
      setAllowed(true);
      return;
    }
    setAllowed(false);
  }, [fromMember]);

  useEffect(() => {
    if (!allowed) return;

    const bootstrapFallback = { Popover: class {} };
    let initialized = false;
    const initializePage = () => {
      if (initialized) return;
      initialized = true;
      myHistoryScript(LZString, window.bootstrap || bootstrapFallback);
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
      setAllowed(true);
      router.replace("/history?from=member");
    }
  };

  const handleBackToMember = () => {
    logoutMember();
    router.replace("/member");
  };

  return (
    <div>
      <header>
        <nav className="nav nav-pills flex-column flex-sm-row">
          <Link className="flex-sm-fill text-sm-center nav-link" href="/">
            工作區
          </Link>
          <Link className="flex-sm-fill text-sm-center nav-link" href="/edit">
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
                <button type="button" className="btn btn-outline-secondary" onClick={handleBackToMember}>
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
