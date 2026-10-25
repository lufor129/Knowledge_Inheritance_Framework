---
name: kb-review
description: 維護者審核變更提案：白話整理改了什麼、逐段列出研究來的說法和出處、核准合併或退回附逐條意見。
argument-hint: "[提案編號]"
disable-model-invocation: true
allowed-tools: Bash(gh pr review:*), Bash(gh pr comment:*), Bash(git push:*)
---

# 審核變更提案

步驟多，開始前用 TodoWrite 列出下面八步，做完一步勾一步。

1. **找提案**：使用者給了編號就用；沒給就 `gh pr list --state open --json number,title,labels,author`，列出和使用者維護的知識庫有關的，請使用者挑。
2. **確認身分**：`python3 framework/tools/who.py <知識庫>`（改框架或新增知識庫的提案用 `who.py`，看「框架維護者」）。
   - 使用者不是維護者：告訴使用者，只幫忙整理內容，不送出核准。
   - 提案作者就是使用者：這是自己的提案，自己審、自己合併。
3. **看檢查**：`gh pr checks <N>`。沒過就用白話解釋錯在哪，請提出的人修；這次審核停在這裡，因為檢查沒過的內容不能合併。
4. **白話整理**：讀 `gh pr view <N>` 和 `gh pr diff <N>`，寫給使用者看：
   - 改了什麼：一節一句話（新增／修改／刪除＋小節 id＋標題）
   - 來歷：研究／整理／訪談
   - 影響：哪些簡報頁、常見問題、其他知識庫的引用跟著改；讀者測試的結果
5. **要仔細看的段落**：來歷是研究時，把 Agent 寫的說法一段一段列出來，每段附上它的出處，沒有出處的數字特別標出來；研究來的內容沒有人親身確認過，維護者是最後一關。其他來歷也標出沒有出處的數字。
6. **等使用者決定**：核准，或退回。退回時請使用者說要改什麼，整理成逐條意見給使用者確認。
7. **送出**：
   - **核准**：`gh pr review <N> --approve --body "🤖 由 Agent 代 <名字> 發出…"`。自己帳號開的提案 GitHub 不讓核准，改成 `gh pr comment`，內容以「✅ 核准」開頭。CI 通過就合併：`gh pr merge <N> --squash --delete-branch`。別人的提案要先有維護者核准才合併。
   - **退回**：`gh pr review <N> --request-changes --body-file .kif/tmp/review.md`，內容是逐條意見；自己帳號開的提案改成留言，以「↩ 要求修改」開頭。提案留著，等傳承者照意見改。真的不要的提案，請提出的人自己撤回。
   - **小修改**：維護者已經確定怎麼改的小地方（補出處註腳、錯字、標籤），可以直接改在提案的分支上（`gh pr checkout <N>`），跑過 check.py 再 `git push`，留言逐條寫改了什麼。內容要調整的，一律退回，因為內容要由傳承者確認。
   - 改到 framework/ 的提案：CI 會建置每個知識庫，全部成功才合併。
8. **收尾**：合併之後告訴使用者：哪些 issue 會自動關閉（說明裡寫了 Closes 的），CI 會重新建置手冊網站和簡報。

GitLab 和手動模式的指令對照見 framework/guide/host.md。

完成：提案已合併、已退回附逐條意見，或使用者決定先不處理。
