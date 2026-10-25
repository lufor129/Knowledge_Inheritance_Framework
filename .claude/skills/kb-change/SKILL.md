---
name: kb-change
description: 修改、刪除或合併手冊裡已有的小節並開變更提案，所有引用一起改。也處理修正勘誤 issue，以及照維護者在變更提案上的意見修改。使用者說某一節要改、要刪、要和另一節合併，要修正勘誤 #N，或說「照維護者的意見改」時使用。
allowed-tools: Bash(git push:*), Bash(gh pr create:*), Bash(gh pr edit:*), Bash(gh pr comment:*), Bash(gh issue comment:*)
---

# 修改、刪除、合併

## 照維護者的意見改

使用者說「照維護者的意見改」這類話時：

1. **找提案、讀意見**：提案是目前的分支，或問使用者編號。`gh pr view <N> --comments` 讀留言和審查意見；以「↩ 要求修改」開頭的留言也是維護者的意見。
2. **改**：`gh pr checkout <N>`，照意見逐條改。看不懂或不同意的意見，先問使用者。
3. **檢查、讀者測試**：跑下面的第 6、7 步，commit、`git push`。同一個提案繼續用，不開新的，維護者才看得到前後對照。
4. **回覆**：在提案上留言（`gh pr comment <N> --body-file .kif/tmp/reply.md`，第一行「🤖 由 Agent 產生」），逐條說明每個意見怎麼處理的。

完成：每一條意見都改了，或在回覆裡說明為什麼沒改。

## 修改、刪除、合併

步驟多，開始前用 TodoWrite 列出下面八步，做完一步勾一步。

1. **開分支**：`git fetch origin && git switch -c kb/<知識庫>/<簡短英文> origin/main`。修正勘誤時先讀 issue（`gh issue view <N>`），確認是哪一節、哪一句、依據是什麼。
2. **找出要動的小節**：`python3 framework/tools/index.py <知識庫>` 和 `git grep`。說不清楚是哪一節就問使用者。
3. **列出所有引用**：`git grep -n "<id>" -- kb/`：常見問題的「相關：」、頁序 deck/order.md、其他小節、其他知識庫（寫成 `<知識庫>/<id>`）。清單給使用者看。
4. **改**：
   - **修改**：改內容，id 不動，因為別的地方用 id 指到這一節。數字附出處；修正勘誤時，新的出處一起補上。
   - **刪除**：刪掉小節，引用一個一個處理：改指到別的小節、跟著刪、或從簡報頁拿掉這個對應。刪掉的內容 Git 歷史找得回來。
   - **合併**：把 B 併進 A，保留 A 的 id；所有指向 B 的引用改成 A，再刪掉 B。舊 id 不留。
5. **傳承者確認**：用白話講改了什麼、哪些引用一起改了。傳承者明確說好才往下走。
6. **檢查**：`python3 framework/tools/check.py <知識庫>`，到沒有 ✗ 為止；被點名的簡報頁照 framework/guide/deck.md 處理。
7. **讀者測試**：照 framework/guide/reader-test.md。刪除時也要做：受影響的常見問題要還答得出來。
8. **開變更提案**：commit 之後跑 `python3 framework/tools/proposal.py <知識庫> --source <研究|整理|訪談> --reader <n/n>`；修正勘誤時加 `--closes <N>`。來歷照新內容怎麼來的。草稿 `.kif/tmp/proposal.md` 會列出改了的小節、簡報頁和一起改的檔案；把「（……）」換成你的話，照它印出的指令推分支、開提案，再做「開好之後」那一步。

完成：提案開好了，`git grep -n "<刪掉或併掉的 id>" -- kb/` 什麼都找不到，使用者知道提案編號和在等誰審。
