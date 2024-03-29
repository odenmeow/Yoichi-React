import Head from "next/head";

import Script from "next/script";
import LZString from "lz-string";
import { useEffect } from "react";
import myWorkScript from "../public/app";
import Link from "next/link";
export default function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js";
    script.async = true;

    script.onload = () => {
      // Bootstrap script has loaded
      myWorkScript(LZString, window.bootstrap);
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup if necessary
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/opendGo.png" />
      </Head>
      <header>
        <nav className="nav nav-pills flex-column flex-sm-row">
          <Link
            className="flex-sm-fill text-sm-center nav-link active"
            aria-current="page"
            href="#"
          >
            工作區
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="./history"
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
        <section className="cal-Area">
          <form action="">
            <section className="yoichi-block yoichi-block-title">
              <div className="yoichi-p-name">商品名稱</div>
              <div className="yoichi-p-number">數量</div>
              <div className="yoichi-p-btns">操作</div>
            </section>
          </form>
          <section className="totalize">
            <div className="yoichi-order">
              <div className="yoichi-orderTime">
                <p>time</p>
              </div>
              <div className="yoichi-orderNumber">
                <p>No.110</p>
              </div>
            </div>
            <div className="yoichi-calculating">
              <div className="yoichi-subtotalArea">
                <div className="yoichi-subtotal">
                  <p>小記</p>
                </div>
                <div className="yoichi-subtotalValue"></div>
              </div>
              <div className="yoichi-discountArea">
                <div className="yoichi-discount">
                  <p>折扣</p>
                </div>
                <div className="yoichi-discountValue"></div>
              </div>
              <div className="yoichi-totalArea">
                <div className="yoichi-total">
                  <p>總價</p>
                </div>
                <div className="yoichi-totalValue"></div>
              </div>
            </div>
            <div className="yoichi-split">
              <div className="yoichi-tiptool">
                <p>模擬鎖</p>
              </div>
              <div className="yoichi-generate">
                <button className="yoichi-order-create yoichi-order-send btn btn-secondary">
                  送出
                </button>
              </div>
            </div>
          </section>
        </section>
        <section className="presentation-Area"></section>
      </main>
      <aside className="floating-element">
        <button
          type="button"
          className="newOrderBtn btn btn-primary"
          data-bs-target="#Modal-add-product"
        >
          +
        </button>
      </aside>
      {/* <Script src="./app.js"></Script> */}

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
