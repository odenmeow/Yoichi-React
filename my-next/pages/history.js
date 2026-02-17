import Head from "next/head";

import { useEffect, useState } from "react";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";
export default function History() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const lockPage = () => {
      setIsUnlocked(false);
      setPasswordInput("");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lockPage();
      }
    };

    window.addEventListener("blur", lockPage);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", lockPage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;

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

    return () => {
      // Cleanup if necessary
      clearTimeout(fallbackTimer);
      window.__yoichiHistoryScriptInitialized = false;
      document.body.removeChild(script);
    };
  }, [isUnlocked]);

  const handleUnlock = (event) => {
    event.preventDefault();
    if (passwordInput === "11806") {
      setIsUnlocked(true);
      return;
    }

    alert("密碼錯誤");
    setPasswordInput("");
  };

  return (
    <div>
      <header>
        <nav className="nav nav-pills flex-column flex-sm-row">
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            aria-current="page"
            href="/"
          >
            工作區
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link active"
            href="#"
          >
            歷史紀錄
          </Link>
          <Link className="flex-sm-fill text-sm-center nav-link" href="./edit">
            功能編輯
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link disabled"
            aria-disabled="true"
            href="#"
          >
            會員專區
          </Link>
        </nav>
      </header>
      <main>
        {!isUnlocked && (
          <section
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 3000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <form
              onSubmit={handleUnlock}
              style={{
                width: "min(90vw, 420px)",
                background: "#fff",
                borderRadius: "12px",
                padding: "1.25rem",
                display: "grid",
                gap: "0.75rem",
              }}
            >
              <h3 style={{ margin: 0 }}>請輸入密碼觀看歷史紀錄</h3>
              <input
                type="password"
                className="form-control"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">
                解鎖
              </button>
            </form>
          </section>
        )}
        <section
          className="presentation-Area"
          style={{ height: "65vh", marginTop: "1rem" }}
        ></section>
        <section
          className="presentation-Area date-block"
          style={{ height: "20vh", marginTop: "1rem" }}
        ></section>
      </main>

      <footer>
        &copy; Made By
        <a
          href="mailto:qw28425382694@gmail.com"
          title="qw28425382694@gmail.com"
        >
          Oni
        </a>
      </footer>
    </div>
  );
}
