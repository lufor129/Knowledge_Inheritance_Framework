---
name: kb-change
description: 修改、刪除或合併已有的簡報頁或手冊小節並開變更提案，所有引用一起改；也處理補出處。也處理修正勘誤 issue，以及照維護者在變更提案上的意見修改。使用者說某一頁或某一節要改、要刪、要合併、要補出處，要修正勘誤 #N，或說「照維護者的意見改」時使用。
allowed-tools: Bash(git push:*), Bash(gh pr create:*), Bash(gh pr edit:*), Bash(gh pr comment:*), Bash(gh issue comment:*), Bash(gh issue reopen:*)
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
2. **找出要動的頁或小節**：`python3 framework/tools/index.py <知識庫>` 和 `git grep`。說不清楚是哪一頁、哪一節就問使用者。
3. **列出所有引用**：`git grep -n "<id>" -- kb/ framework/paths.md`，清單給使用者看。
   - 小節：常見問題的「相關：」、頁序 deck/order.md、其他小節、其他知識庫（寫成 `<知識庫>/<id>`）。
   - 簡報頁：頁序（也看章節列的第一頁）、自我檢查的「相關：」、頁碼引用 `[[頁:<id>]]`、角色路徑 framework/paths.md、它的互動圖（`Fig.add('<id>'`）。
   刪除或合併時，也查這一節當初是不是為了回答某個 issue 才加的：`git log --oneline -S '<a name="<id>">' -- kb/` 找到加入它的提案（commit 訊息結尾的 #N），`gh pr view <N> --json body` 看說明有沒有 Closes。有的話，內容刪了，那個問題又沒有答案了：寫進清單，問使用者要不要重新打開（`gh issue reopen <N>`，留言說明為什麼）。刪掉常見問題時也一樣。
4. **改**：
   - **修改**：改內容，id 不動，因為別的地方用 id 指到它。數字附出處；修正勘誤、補出處時，新的出處一起補上。簡報頁和對應的小節一樣重要：改了一邊，看另一邊要不要跟著改，說法要一致。
   - **刪除**：刪掉頁或小節，引用一個一個處理：改指到別的頁或小節、跟著刪、或從頁序拿掉這個對應。每個小節都要有簡報頁講到，所以刪頁之前，先把它講的小節接到別的頁。刪掉的頁，互動圖沒有別的頁用就一起刪。刪掉的內容 Git 歷史找得回來。
   - **合併**：把 B 併進 A，保留 A 的 id；所有指向 B 的引用改成 A，再刪掉 B。舊 id 不留。
5. **傳承者確認**：用白話講改了什麼、哪些引用一起改了；改到簡報頁時，打開給傳承者看：`python3 framework/tools/get.py <知識庫> deck --here --open --page <頁id>`。傳承者明確說好才往下走。
6. **檢查**：`python3 framework/tools/check.py <知識庫>`，到沒有 ✗ 為止；被點名的頁和小節照 framework/guide/deck.md 處理。
7. **讀者測試**：照 framework/guide/reader-test.md（改過的簡報章和手冊章都要測）。刪除時也要做：受影響的常見問題和自我檢查要還答得出來。
8. **開變更提案**：commit 之後跑 `python3 framework/tools/proposal.py <知識庫> --source <研究|整理|訪談> --reader <n/n>`；修正勘誤時加 `--closes <N>`。來歷照新內容怎麼來的。草稿 `.kif/tmp/proposal.md` 會列出改了的小節、簡報頁和一起改的檔案；把「（……）」換成你的話，照它印出的指令推分支、開提案，再做「開好之後」那一步。

完成：提案開好了，`git grep -n "<刪掉或併掉的 id>" -- kb/ framework/paths.md` 什麼都找不到，使用者知道提案編號和在等誰審。
