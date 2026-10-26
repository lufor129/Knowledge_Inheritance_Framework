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
   - 大概分哪幾個部分，每個部分有哪幾章：章名、一句到三句的速覽（學完會知道什麼、為什麼排在這裡），以及真的要先看過的章（先修，沒有就不寫）
   - 誰當維護者（名字和 Git 主機帳號；發起人預設是第一位，帳號用 `python3 framework/tools/who.py` 查）
   - 手上有沒有現成的資料（舊簡報、文件）
   - 知識庫的英文短名，當資料夾名稱（例如 `cv`）

   有不清楚的就再問一輪，發起人全部確認了才往下走。骨架定了之後，部分和章的結構很難再大改。
2. **開分支**：`git fetch origin && git switch -c kb/<短名>/skeleton origin/main`。
3. **建骨架**：把訪談結果寫成 `.kif/tmp/new-kb.json`（格式寫在 framework/tools/new_kb.py 開頭：名稱、介紹、維護者、部分和章（含速覽、先修、圖示：照章的內容從 framework/guide/deck.md 的圖示表挑一個）、術語），再跑 `python3 framework/tools/new_kb.py .kif/tmp/new-kb.json`。它照 framework/templates/ 建好 README、術語表、簡報的頁序和每一章的章檔（章名、速覽、先修）、圖片清單，也更新首頁的知識庫清單；每次建出來的結構都一樣，檢查才過得了。全景圖不用畫：入口網站照部分和章自動排，先修畫成箭頭，還沒有頁的章用虛線框列出來。
4. **檢查**：`python3 framework/tools/check.py`，到沒有 ✗ 為止。
5. **建標籤**：`gh label create "kb:<短名>" --color 1f4fb5 --description "<名稱>"`，issue 和提案才分得出是哪個知識庫的。
6. **開變更提案**：commit、`git push -u origin kb/<短名>/skeleton`，再開提案：標題「新增知識庫：<名稱>」，只貼 `kb:<短名>` 標籤，說明寫進 `.kif/tmp/proposal.md`（第一行「🤖 由 Agent 產生」，接著是訪談結果的摘要），`gh pr create --base main --title "新增知識庫：<名稱>" --label "kb:<短名>" --body-file .kif/tmp/proposal.md`。發起人不是框架維護者時，`gh pr edit <N> --add-reviewer <框架維護者帳號>`。
7. **收尾**：告訴發起人：框架維護者核准合併之後，知識庫就成立了，首頁清單和入口網站會多一個知識庫；之後用 kb-add 一章一章補內容，先做成簡報頁。現成的資料可以整批整理，但一章一個變更提案。

GitLab 和手動模式的指令對照見 framework/guide/host.md。
