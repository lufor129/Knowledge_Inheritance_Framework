---
name: kb-new
description: 建立新的知識庫：訪談發起人、建骨架、開變更提案給框架維護者核准。
argument-hint: "[領域]"
disable-model-invocation: true
allowed-tools: Bash(git push:*), Bash(gh label create:*), Bash(gh pr create:*), Bash(gh pr edit:*)
---

# 建立新知識庫

格式照 framework/guide/writing.md。

1. **訪談發起人**：一輪問完下面這些，每題附上你的建議答案，讓發起人確認或改正：
   - 領域是什麼；和現有的知識庫（`ls kb/`）有沒有重疊
   - 讀者是誰，讀完要會什麼
   - 大概分哪幾個部分，每個部分有哪幾章（只要章名）
   - 誰當維護者（名字和 Git 主機帳號；發起人預設是第一位，帳號用 `python3 framework/tools/who.py` 查）
   - 手上有沒有現成的資料（舊簡報、文件）
   - 知識庫的英文短名，當資料夾名稱（例如 `cv`）

   有不清楚的就再問一輪，發起人全部確認了才往下走。骨架定了之後，部分和章的結構很難再大改。
2. **開分支**：`git fetch origin && git switch -c kb/<短名>/skeleton origin/main`。
3. **建骨架**，用 framework/templates/：
   - `kb/<短名>/README.md`：名稱、一句話介紹、維護者、全景圖草稿（Mermaid，畫出部分和章之間的關係）
   - `kb/<短名>/terms.md`：訪談裡出現的術語先列進去
   - `kb/<短名>/handbook/<n>-<英文>/README.md`：每個部分一個
   - 每一章一個檔案（`<兩位數字>-<英文>.md`），只有「# 章名」一行
   - `kb/<短名>/assets/SOURCES.md`

   簡報（deck/）等要上課時再做。
4. **更新首頁的知識庫清單**：`python3 framework/tools/build.py --readme`
5. **檢查**：`python3 framework/tools/check.py`，到沒有 ✗ 為止。
6. **建標籤**：`gh label create "kb:<短名>" --color 1f4fb5 --description "<名稱>"`，issue 和提案才分得出是哪個知識庫的。
7. **開變更提案**：commit、`git push -u origin kb/<短名>/skeleton`，再開提案：標題「新增知識庫：<名稱>」，只貼 `kb:<短名>` 標籤，說明寫進 `.kif/tmp/proposal.md`（第一行「🤖 由 Agent 產生」，接著是訪談結果的摘要），`gh pr create --base main --title "新增知識庫：<名稱>" --label "kb:<短名>" --body-file .kif/tmp/proposal.md`。發起人不是框架維護者時，`gh pr edit <N> --add-reviewer <框架維護者帳號>`。
8. **收尾**：告訴發起人：框架維護者核准合併之後，知識庫就成立了，首頁清單會多一列；之後用 kb-add 一章一章補內容，現成的資料可以整批整理，但一章一個變更提案。

GitLab 和手動模式的指令對照見 framework/guide/host.md。
