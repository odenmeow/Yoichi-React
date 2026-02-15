import Head from "next/head";
import Link from "next/link";

export default function GitHubDemo() {
  return (
    <>
      <Head>
        <title>GitHub Next.js Demo</title>
        <meta
          name="description"
          content="A simple Next.js page created from the repository state"
        />
      </Head>

      <main style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
        <h1>Next.js 網站已建立 🎉</h1>
        <p>這個頁面是依照目前 GitHub repository 狀態新增的 Demo 頁。</p>

        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 10,
            padding: 20,
            marginTop: 20,
            background: "#fafafa",
          }}
        >
          <h2>你現在可以做的事</h2>
          <ul>
            <li>編輯 <code>pages/github-demo.js</code> 立即看到畫面變更</li>
            <li>在本機執行 <code>npm run dev</code> 預覽</li>
            <li>推送到 GitHub 後部署到 Vercel</li>
          </ul>
        </section>

        <p style={{ marginTop: 24 }}>
          <Link href="/">← 回到首頁</Link>
        </p>
      </main>
    </>
  );
}
