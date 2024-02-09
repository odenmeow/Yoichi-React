import Head from "next/head";

import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap CSS
import Script from "next/script";
import { useEffect } from "react";
// import myScript from "../public/app";
import "popper.js";
import Link from "next/link";
import LZString from "lz-string";
import myEditScript from "../public/edit";
export default function Edit() {
  useEffect(() => {
    console.log("所以是?", bootstrap);
    myEditScript(LZString);
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
            className="flex-sm-fill text-sm-center nav-link"
            href="./history"
          >
            歷史紀錄
          </Link>
          <Link
            className="flex-sm-fill text-sm-center nav-link active"
            href="#"
          >
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
          <div className="yoichi-p-shows">
            <div className="yoichi-p-show-name">產品名稱</div>
            <div className="yoichi-p-show-price">價格</div>
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
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></Script>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.5.0/lz-string.min.js"
        integrity="sha512-qtX0GLM3qX8rxJN1gyDfcnMFFrKvixfoEOwbBib9VafR5vbChV5LeE5wSI/x+IlCkTY5ZFddFDCCfaVJJNnuKQ=="
        crossorigin="anonymous"
        referrerpolicy="no-referrer"
      ></Script>
      <Script src=""></Script>
    </div>
  );
}
