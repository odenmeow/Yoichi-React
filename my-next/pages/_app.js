import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap CSS
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
