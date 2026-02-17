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

## History 密碼鎖驗證（手動）

為了避免只改數量沒按「生成」導致沒有歷史資料，請用以下流程驗證：

1. 打開工作區 `/`，先在商品欄位填數量。
2. 按下「生成」（`.yoichi-order-send`）建立訂單。
3. 切到歷史頁 `/history`，應先出現密碼鎖遮罩。
4. 輸入密碼 `11806` 解鎖後，確認：
   - 上方有剛建立的訂單卡片。
   - 下方日期區會出現當天日期（來自 `dateRecords`）。
5. 切到其他頁籤或其他分頁，再切回歷史頁，應重新要求輸入密碼。
