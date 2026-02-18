# 記得安裝一下這些 (my-next) 路徑

npx create-next-app@13.0.0 my-next && cd my-next && npm install next@13.0.0
npm install react-bootstrap bootstrap

```batch
    YoichiReact\my-next> npm list react-bootstrap
    >>
    my-next@0.1.0 C:\CodeSForGit\YoichiReact\my-next
    └── react-bootstrap@2.10.0
```

"devDependencies": {
"eslint": "8.26.0",
"eslint-config-next": "13.0.0"
}
npm install lz-string
npm install bootstrap
npm install popper.js

# 以下為內建的訊息

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## 目前正確的歷史驗證流程（會員帳密版）

> 歷史頁不再使用固定密碼 11806 解鎖遮罩；改成會員帳號/密碼登入。

1. 打開工作區 `/`。
2. 先按商品數量（例如按 `+1`），再按「送出 / 生成」（`.yoichi-order-send`）建立訂單。
3. 前往 `/history`。
4. 如果不是從會員後台帶入，會看到「帳號 / 密碼」登入表單。
5. 登入成功後應看到：
   - 上方歷史訂單卡片。
   - 下方日期區塊（`dateRecords`）。

## 記住帳號功能

- 會員頁 `/member` 與歷史頁 `/history` 的登入表單都有 `記住帳號`。
- 勾選後登入，下次會自動帶入上次帳號。
- 取消勾選後登入，會清除已記住帳號。

## 衝突後自我檢查（避免選錯 current/incoming）

如果你剛解過 merge conflict，請在 `my-next` 目錄確認：

```bash
git grep -n "記住帳號\|getRememberedAccount\|setRememberedAccount\|normalizeAppInteraction"
```

至少要看到這幾個檔案有命中：
- `pages/member.js`
- `pages/history.js`
- `lib/memberAuth.js`
- `pages/_app.js`
- `lib/viewCleanup.js`

如果缺少其中任一個，通常代表衝突解決時有段落被覆蓋，請改回 incoming（或手動合併後保留這些功能）。
