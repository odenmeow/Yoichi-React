import { useEffect, useState } from "react";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";
import { getCurrentMember, logoutMember } from "../lib/memberAuth";
import { normalizeAppInteraction } from "../lib/viewCleanup";

const HISTORY_ENTRY_FLAG = "yoichi-history-entry-from-member";

export default function History() {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    normalizeAppInteraction();
    const timer = setInterval(normalizeAppInteraction, 700);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const member = getCurrentMember();
    const fromMember = sessionStorage.getItem(HISTORY_ENTRY_FLAG) === "1";
    setShowStats(Boolean(member && fromMember));

    normalizeAppInteraction();

    const bootstrapFallback = { Popover: class {} };
    let initialized = false;
    const initializePage = () => {
      if (initialized) return;
      initialized = true;
      myHistoryScript(LZString, window.bootstrap || bootstrapFallback, {
        showStats: Boolean(member && fromMember),
      });
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

    return () => {
      clearTimeout(fallbackTimer);
      window.__yoichiHistoryScriptInitialized = false;
      if (typeof window.__yoichiHistoryCleanup === "function") {
        window.__yoichiHistoryCleanup();
      }
      document.body.removeChild(script);
    };
  }, []);

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
          <Link className="flex-sm-fill text-sm-center nav-link" href="/member">
            會員專區
          </Link>
          <Link className="flex-sm-fill text-sm-center nav-link active" href="#">
            歷史紀錄
          </Link>
        </nav>
      </header>

      <main>
        {!showStats ? (
          <p style={{ margin: "0.9rem 1rem 0", color: "#64748b" }}>
            目前為一般模式：可查看歷史並取消完成，統計資料（數量、金額）僅在會員專區進入時顯示。
          </p>
        ) : null}
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
        <a href="mailto:qw28425382694@gmail.com" title="qw28425382694@gmail.com">
          Oni
        </a>
      </footer>
    </div>
  );
}
