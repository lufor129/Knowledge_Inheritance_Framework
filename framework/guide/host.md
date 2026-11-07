# Git 主機

`framework/config.json` 的 `host` 決定怎麼做：`github` 用 gh，`gitlab` 用 glab，`manual` 是沒有 Git 主機的手動模式。skill 裡寫的是 GitHub 的指令；GitLab 和手動模式照這份換。

who.py、get.py、proposal.py 會自己照 `host` 換指令，不用換。

## 分支

- 每個變更提案一個分支，從最新的 main 開：`git fetch origin && git switch -c <分支> origin/main`
- 分支名稱：`kb/<知識庫>/<簡短英文>`（例如 `kb/semiconductor/high-na`）；改框架用 `framework/<簡短英文>`。
- commit 訊息用中文寫改了什麼。

## 標籤

| 標籤 | 貼在 | 意思 |
|---|---|---|
| 待回答 | issue | 簡報沒寫到的問題 |
| 勘誤 | issue | 簡報可能寫錯 |
| kb:<知識庫> | issue、提案 | 屬於哪個知識庫 |
| 來歷:研究、來歷:整理、來歷:訪談 | 提案 | 內容怎麼來的；改框架的提案不貼 |

缺標籤就建：`gh label create "kb:cv" --color 1f4fb5 --description "電腦視覺"`

## 合併的規矩

- CI 沒過就不合併。
- 別人的提案要先有維護者核准（approve，或維護者的「✅ 核准」留言）才合併。
- 自己的提案（作者就是那個知識庫的維護者）：可以在同一次對話裡自己審，CI 通過、使用者說好就合併，不一定要跑 /kb-review。GitHub 不讓核准自己帳號開的提案，所以核准和退回都改成留言，以「✅ 核准」「↩ 要求修改」開頭。
- 每個合併都要留紀錄，日後才查得到是誰看過、看了什麼。提案上沒有維護者的核准、也沒有以「✅ 核准」開頭的留言，hook 會擋下 `gh pr merge`。

審核紀錄的寫法。看過哪些頁、有沒有不該公開的內容，要維護者自己說過才能寫；維護者只說「看過了」時，先問這兩件事，不能代填。留言和合併分成兩個指令送：hook 在指令執行之前檢查，連在一起會被擋下。

```
🤖 由 Agent 代 <名字> 發出
✅ 核准
看過的頁：<頁 id>、<頁 id>
來歷：<研究／整理／訪談>；研究來的說法已逐條列給維護者看
有沒有不該公開的內容：沒有（公司參數、客戶、事故細節）
圖片授權：<都有寫／這次沒有加圖>
```

改框架的提案沒有頁：「看過的頁」寫看了哪些檔案，來歷和圖片授權省略。

## GitLab

還沒有實測。指令對照：

| GitHub | GitLab |
|---|---|
| `gh issue …` | `glab issue …` |
| `gh pr create --base main --body-file <檔>` | `glab mr create --target-branch main --description "$(cat <檔>)"` |
| `gh pr view`、`gh pr diff`、`gh pr checkout` | `glab mr view`、`glab mr diff`、`glab mr checkout` |
| `gh pr review --approve` | `glab mr approve`（hook 只看 GitHub；GitLab 要自己記得留紀錄） |
| `gh pr review --request-changes`、`gh pr comment` | `glab mr note` |
| `gh pr merge --squash --delete-branch` | `glab mr merge --squash --remove-source-branch` |
| `gh pr checks` | `glab ci status` |

## 手動模式

沒有 Git 主機時：

- 變更提案：推上分支（或請使用者把分支交給維護者），`proposal.py` 產生的說明讓使用者貼給維護者；由維護者合併。
- 待回答：寫進那一章的自我檢查，`<summary>【待回答】題目</summary>`，答案寫「還沒有答案」，走一般的變更提案。
- 勘誤：直接用 kb-change 開變更提案修正。
- 入口網站和簡報：`get.py` 會自動改在本機建置。
