# 知識傳承框架

老手的經驗，變成新人看得懂的簡報；新增、修改、查找、刪除，跟 Agent 說就好。每一次變更都記在 Git 上，經過檢查和維護者審核才算數。

## 第一天

1. **打開入口網站**：在下面「知識庫清單」下載 portal.zip，解開後用 Chrome 或 Edge 打開 index.html，離線也能看。照最上面的三個步驟：挑一個知識庫，照學習路徑由上往下看簡報（每章有一段速覽，標了先修的建議先看）；簡報下面有「旁白」「看深入」「問 Agent」，比較長的說明在深入頁，按「看深入」才會進去，每章最後有自我檢查。看過哪些頁會記在你的瀏覽器裡。
2. **想問問題、想補充知識**：
   1. 安裝 [Claude Code](https://claude.com/claude-code) 和 [GitHub CLI](https://cli.github.com/)，登入：`gh auth login`
      - 模型：Sonnet 和 Opus 都用情境測試（framework/tests/）測過，結果差不多；Sonnet 的花費大約是 Opus 的三分之一，日常用 Sonnet 就夠。
   2. `gh repo clone lufor129/Knowledge_Inheritance_Framework`，在資料夾裡打開 Claude Code
   3. 直接用中文說，例如：
      - 「OPC 是什麼？跟光罩有什麼關係？」
      - 「hk1 這一句好像寫錯了」
      - 「有什麼待回答是我可以回答的？」
      - 「幫我研究 High-NA EUV，放進微影那章」
3. **看不懂的詞**：入口網站的主題索引，或那個知識庫的術語表（`kb/<名稱>/terms.md`）。

## 知識庫清單

<!-- 知識庫清單：由 build.py --readme 產生，請勿手改 -->
**入口網站**：[下載 portal.zip](https://github.com/lufor129/Knowledge_Inheritance_Framework/releases/latest/download/portal.zip)，解開後用 Chrome 或 Edge 打開裡面的 index.html。所有知識庫的簡報、全景圖、學習路徑、主題索引和搜尋都在裡面。

| 知識庫 | 介紹 | 維護者 | 簡報 | 單一檔案 |
|---|---|---|---|---|
| [電腦視覺](kb/cv/) | 給剛進團隊、會寫 Python 但沒做過電腦視覺專案的工程師與研究生：讀完能依任務選方法、讀懂主流模型架構，並從資料準備、訓練、評估做到部署。 | lufor129 | 還沒有 | 還沒有 |
| [半導體製程](kb/semiconductor/) | 給半導體新人的知識庫：從電晶體結構演進、十章製程與量產，到先進封裝與背面供電。 | lufor129 | 有 | [簡報](https://github.com/lufor129/Knowledge_Inheritance_Framework/releases/latest/download/semiconductor-deck.html) |
<!-- 知識庫清單結束 -->

## 四種角色

角色看你當下在做什麼，不看資歷：

- **新人**：從入口網站看簡報、問 Agent、回報沒寫或寫錯。
- **傳承者**：透過 Agent 新增、修改、刪除知識。
- **維護者**：每個知識庫至少一位，審核變更提案（`/kb-review`）。
- **框架維護者**：管規則、引擎和新知識庫（新知識庫用 `/kb-new` 建立）。

## 框架維護者

- lufor129（GitHub: lufor129）

## 設計文件

- [設計共識](docs/design.md)、[用語表](GLOSSARY.md)、[決策紀錄](docs/adr/)
- 互動說明簡報：`docs/design-deck/dist/index.html`
