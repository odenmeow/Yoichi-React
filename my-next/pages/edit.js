import Head from "next/head";

import Script from "next/script";
import { useEffect } from "react";
// import myScript from "../public/app";
import "popper.js";
import Link from "next/link";
import LZString from "lz-string";
import myEditScript from "../public/edit";
export default function Edit() {
  useEffect(() => {
    const bootstrapFallback = { Popover: class {} };
    let initialized = false;
    const initializePage = () => {
      if (initialized) return;
      initialized = true;
      myEditScript(LZString, window.bootstrap || bootstrapFallback);
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
      window.__yoichiEditScriptInitialized = false;
      document.body.removeChild(script);
    };
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
            功能編輯
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link"
            href="/member"
          >
            會員專區
          </Link>
        </nav>
      </header>
      <main>
        <div
          className="modal fade"
          id="Modal-add-product"
          tabIndex="-1"
          aria-labelledby="Modal-add-productLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="Modal-add-productLabel">
                  新增商品
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form action="" id="yoichi-product-add">
                  <label htmlFor="yoichi-p-add-setName">產品名稱</label>
                  <input
                    type="text"
                    id="yoichi-p-add-setName"
                    name="yoichi-p-add-setName"
                  />
                  <label htmlFor="yoichi-p-add-setPrice">售價</label>
                  <input
                    type="text"
                    id="yoichi-p-add-setPrice"
                    name="yoichi-p-add-setPrice"
                  />
                  <label htmlFor="yoichi-p-add-setDiscountQty">折扣數量</label>
                  <input
                    type="text"
                    id="yoichi-p-add-setDiscountQty"
                    name="yoichi-p-add-setDiscountQty"
                  />
                  <label htmlFor="yoichi-p-add-setDiscountAmount">
                    折扣金額
                  </label>
                  <input
                    type="text"
                    id="yoichi-p-add-setDiscountAmount"
                    name="yoichi-p-add-setDiscountAmount"
                  />
                  <label htmlFor="yoichi-p-add-setTextColor">文字顏色</label>
                  <input
                    type="color"
                    id="yoichi-p-add-setTextColor"
                    name="yoichi-p-add-setTextColor"
                    defaultValue="#ff0000"
                  />
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button
                  id="yoichi-p-addSave"
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="Modal-edit-product"
          tabIndex="-1"
          aria-labelledby="Modal-edit-productLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="Modal-edit-productLabel">
                  編輯商品
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form action="" id="yoichi-product-edit">
                  <label htmlFor="yoichi-p-edit-setName">商品名稱</label>
                  <input
                    type="text"
                    id="yoichi-p-edit-setName"
                    name="yoichi-p-edit-setName"
                  />
                  <label htmlFor="yoichi-p-edit-setPrice">售價</label>
                  <input
                    type="text"
                    id="yoichi-p-edit-setPrice"
                    name="yoichi-p-edit-setPrice"
                  />
                  <label htmlFor="yoichi-p-edit-setDiscountQty">折扣數量</label>
                  <input
                    type="text"
                    id="yoichi-p-edit-setDiscountQty"
                    name="yoichi-p-edit-setDiscountQty"
                  />
                  <label htmlFor="yoichi-p-edit-setDiscountAmount">
                    折扣金額
                  </label>
                  <input
                    type="text"
                    id="yoichi-p-edit-setDiscountAmount"
                    name="yoichi-p-edit-setDiscountAmount"
                  />
                  <label htmlFor="yoichi-p-edit-setTextColor">文字顏色</label>
                  <input
                    type="color"
                    id="yoichi-p-edit-setTextColor"
                    name="yoichi-p-edit-setTextColor"
                    defaultValue="#ff0000"
                  />
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-dismiss="modal"
                  id="yoichi-p-delete"
                >
                  刪除
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                >
                  取消
                </button>
                <button
                  id="yoichi-p-editSave"
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
        <section className="show-products">
          <div className="yoichi-theme-switcher" role="group" aria-label="UI風格切換">
            <button type="button" className="btn btn-outline-primary yoichi-theme-btn" data-theme="classic">
              經典
            </button>
            <button type="button" className="btn btn-outline-secondary yoichi-theme-btn" data-theme="soft">
              柔和
            </button>
            <button type="button" className="btn btn-outline-dark yoichi-theme-btn" data-theme="contrast">
              高對比
            </button>
            <button
              type="button"
              className="btn btn-outline-success yoichi-summary-toggle-btn"
              data-feature="work-summary"
            >
              口味個人化設定
            </button>
          </div>
          <div className="yoichi-p-shows">
            <div className="yoichi-p-show-name">商品資料（4列）</div>
            <div className="yoichi-p-show-edit-title"></div>
          </div>
        </section>
      </main>
      <aside className="floating-element">
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#Modal-add-product"
        >
          +
        </button>
      </aside>
    </div>
  );
}
