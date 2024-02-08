import Head from "next/head";

import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap CSS
import { useEffect } from "react";
import "popper.js";
import LZString from "lz-string";
import myHistoryScript from "../public/history";
import Link from "next/link";

export default function History() {
  useEffect(() => {
    myHistoryScript(LZString);
  }, []);

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
