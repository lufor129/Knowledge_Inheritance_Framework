# Git 主機

`framework/config.json` 的 `host` 決定怎麼做：`github` 用 gh，`gitlab` 用 glab（見最後的對照），`manual` 是手動模式。下面以 GitHub 為例。

## 誰是誰

- 使用者的帳號：`gh api user --jq .login`。
- 知識庫的維護者：`kb/<知識庫>/README.md` 的「維護者」，括號裡是帳號。
- 框架維護者：根目錄 README.md 的「框架維護者」。
- 提案作者就是維護者本人時，是「自己的提案」：自己審、檢查過了就自己合併。

## 分支

- 每個變更提案一個分支，從最新的 main 開：`git fetch origin && git switch -c <分支> origin/main`
- 分支名稱：`kb/<知識庫>/<簡短英文>`（例如 `kb/semiconductor/high-na`）；改框架用 `framework/<簡短英文>`。
- commit 訊息用中文寫改了什麼。

## 標籤

| 標籤 | 貼在 | 意思 |
|---|---|---|
| 待回答 | issue | 手冊沒寫到的問題 |
| 勘誤 | issue | 手冊可能寫錯 |
| kb:<知識庫> | issue、提案 | 屬於哪個知識庫 |
| 來歷:研究、來歷:整理、來歷:訪談 | 提案 | 內容怎麼來的 |

缺標籤就建：`gh label create "kb:cv" --color 1f4fb5 --description "電腦視覺"`

## Agent 寫的內容

issue 內文、提案說明、留言，第一行都是「🤖 由 Agent 產生」。替人轉達意見時寫「🤖 由 Agent 代 <名字> 發出」，接著是那個人的意見。

## issue

- 查重複：`gh issue list --state all --label <待回答|勘誤> --search "<關鍵字>"`，換兩三組關鍵字。
- 開：`gh issue create --title "<題目>" --label 待回答 --label kb:<知識庫> --body-file <檔案>`
  - 待回答的內文：問題、新人當時在讀哪一章（猜的就寫「猜的」）、誰問的。
  - 勘誤的內文：小節 id、那一句原文、為什麼覺得不對、依據。
- 列出某些知識庫的 issue：`gh issue list --state open --label kb:<知識庫> --json number,title,labels,assignees`
- 認領：`gh issue edit <N> --add-assignee @me`，再留言「<名字> 認領」。
- 「我也想知道」：在原本的 issue 留言。

## 變更提案

1. 推分支：`git push -u origin <分支>`
2. 開提案：`gh pr create --base main --title "<知識庫名稱>：<改了什麼>" --label kb:<知識庫> --label 來歷:<研究|整理|訪談> --body-file <檔案>`
   - 標題開頭用知識庫 README 的標題，例如「半導體製程：補強 High-NA 小節」；改框架寫「框架：……」，不貼 kb: 和來歷標籤。
3. 說明照這個格式：

   ```
   🤖 由 Agent 產生

   ## 改了什麼
   - 新增／修改／刪除的小節：id＋標題＋一句話

   ## 來歷
   研究／整理／訪談：內容從哪裡來

   ## 影響
   - 簡報頁：重看了哪些、改了哪些
   - 常見問題、其他知識庫的引用：一起改了哪些
   - 讀者測試：n/n 題答對

   Closes #12
   ```

   回答待回答或修正勘誤時才寫 `Closes #N`，合併後那個 issue 會自動關閉。
4. 開好之後：
   - 使用者不是這個知識庫的維護者：`gh pr edit <N> --add-reviewer <維護者帳號>`，告訴他提案在等維護者審。
   - 使用者就是維護者（自己的提案）：等 CI 通過（`gh pr checks <N> --watch`），把研究來的段落列出來讓他再看一眼，他說好就合併。

## 審核與合併

- 看檢查：`gh pr checks <N>`；要等就加 `--watch`。
- 核准：`gh pr review <N> --approve --body "<意見>"`。GitHub 不讓核准自己帳號開的提案，這時改成留言，內容以「✅ 核准」開頭。
- 退回（要求修改）：`gh pr review <N> --request-changes --body "<逐條意見>"`；自己帳號開的提案改成留言，內容以「↩ 要求修改」開頭。提案留著，等傳承者照意見改。
- 合併：`gh pr merge <N> --squash --delete-branch`。
  - CI 沒過就不合併。
  - 別人的提案要先有維護者核准（approve，或維護者的「✅ 核准」留言）；還沒有就提醒使用者，先不合併。
- 合併之後：CI 會建置手冊網站和簡報，發布到 Release；說明裡寫了 Closes 的 issue 會自動關閉。

## 下載手冊網站和簡報

`gh release download --pattern "<知識庫>-deck.html" --dir .kif/downloads --clobber`（手冊網站是 `<知識庫>-handbook.html`），再用 `open` 打開。

## GitLab

還沒有實測。指令對照：`gh issue` → `glab issue`；`gh pr create --base` → `glab mr create --target-branch`，說明用 `--description`；核准是 `glab mr approve`；合併是 `glab mr merge --squash --remove-source-branch`；下載是 `glab release download`。

## 手動模式

沒有 Git 主機時：

- 變更提案：推上分支（或請使用者把分支交給維護者），產生一段訊息（格式同上面的說明）讓使用者貼給維護者；由維護者合併。
- 待回答：寫進那一章的常見問題，`<summary>【待回答】題目</summary>`，答案寫「還沒有答案」，走一般的變更提案。
- 勘誤：直接用 kb-change 開變更提案修正。
- 手冊網站和簡報：`python3 framework/tools/build.py <知識庫>`，打開 `kb/<知識庫>/dist/`。
