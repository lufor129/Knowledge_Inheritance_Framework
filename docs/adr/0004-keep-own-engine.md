# 保留自寫引擎，加上手冊模式，不改用現成的網站或簡報工具

手冊網站必須是單一 HTML 檔：離線能打開，看的人不用安裝任何東西。研究過的主流工具都做不到這一點（見 docs/research/existing-approaches.md）：Quarto 網站模式、MkDocs Material、Docusaurus、Astro Starlight 要嘛輸出一整個資料夾，要嘛需要伺服器，Slidev 也需要伺服器。所以我們沿用半導體範例的自寫簡報引擎，加上手冊模式：單一 HTML 裡內嵌 markdown-it，在瀏覽器裡轉換 Markdown；全景圖用 Mermaid；互動元件沿用現有的 `init(el, ctx)` 介面；建置仍然只用 Python 標準函式庫。

## Considered Options

- **Quarto（單一文件＋revealjs）**：可以從同一份 Markdown 產出單一文件和簡報，但半導體的 89 頁簡報要整份重寫，建置的人也要另外安裝 Quarto CLI。列為備案。
- **MkDocs Material、Docusaurus、Starlight、Slidev、Marp**：不能輸出單一、離線可開的 HTML。MkDocs Material 也已經進入維護模式。
