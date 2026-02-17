import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";
import { getCurrentMember, logoutWhenHidden } from "../lib/memberAuth";

export default function History() {
  const [allowed, setAllowed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const member = getCurrentMember();
    if (!member) {
      setAllowed(false);
      router.replace("/member");
      return;
    }
    setAllowed(true);

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
  }, [router]);

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
        {!allowed ? null : (
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
