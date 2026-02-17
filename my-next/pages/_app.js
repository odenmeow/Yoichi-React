import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap CSS
import "../styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { normalizeAppInteraction } from "../lib/viewCleanup";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const runNormalize = () => normalizeAppInteraction();

    runNormalize();
    router.events.on("routeChangeComplete", runNormalize);
    const timer = setInterval(runNormalize, 700);

    return () => {
      router.events.off("routeChangeComplete", runNormalize);
      clearInterval(timer);
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}

export default MyApp;
