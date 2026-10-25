# 情境測試

用全新的 Claude Code 跑 docs/design.md 的 14 個情境（加上「刪除小節」），由另一個模型扮演使用者回話，最後評分。改了 skill、AGENTS.md 或 framework/guide/ 之後跑一次，看行為有沒有變好或變壞。

## 怎麼跑

```
python3 framework/tests/run.py --ref main --config with_skill --iteration .kif/test-results/iteration-1
```

- `--ref`：要測哪一版框架（分支、tag 或 commit）。比較新舊兩版時，跑兩次，`--config` 分別寫 `old_skill`、`new_skill`。
- `--only s02-ask,s03-gap`：只跑幾個情境。
- `--model`：Agent 用的模型；例如 `--model sonnet` 看中階模型夠不夠用。
- 其他選項見 run.py 開頭。

一個情境大約 2 到 15 分鐘，全部跑完一兩個小時。研究類的情境（s07、s11）最花錢。

## 會發生什麼

1. **重置測試 repo**：把要測的那一版框架推到 framework/tests/sandbox.json 指定的測試 repo，關掉所有 issue 和提案、刪掉其他分支。
   - 推送用的是一般推送：測試 repo 的歷史會一直變長，但內容每次都是乾淨的。
   - 指定成正式 repo 會直接拒絕。
2. **建立前置狀態**：照情境的 `setup` 開 issue、開分支和提案、留言、合併。
3. **對話**：在測試 repo 的一份新複本裡跑 `claude -p`。
   - 只載入 repo 自己的設定，不載入個人的 hook 和外掛。
   - 扮演使用者的模型照 `persona` 和 `goal` 回話，直到它說「（結束）」或到達 `max_turns`。
4. **評分**：`checks` 用程式檢查測試 repo 的結果；`judge` 交給評分模型看對話判斷。

結果放在 `--iteration` 指定的資料夾，格式和 skill-creator 一樣：每個情境一個 `eval-<id>/<config>/run-1/`，裡面有：

- `outputs/transcript.md`：對話，和 Agent 用了哪些工具
- `outputs/state.md`：測試 repo 的結果（issue、提案、留言）
- `outputs/tools.json`：每一次工具呼叫的完整內容
- `outputs/metrics.json`：工具次數、花費，以及 `approvals`：照被測版本的 `.claude/settings.json`，估計同仁實際用的時候要按幾次「允許」（測試時這些指令是預先允許的，所以要另外估）
- `grading.json`：每一條的對錯和證據
- `timing.json`：時間、token、花費

## 看結果

skill-creator 的工具可以彙整和產生檢視頁面：

```
python3 -m scripts.aggregate_benchmark <iteration 資料夾> --skill-name kb-framework   # 在 skill-creator 資料夾裡執行
python3 <skill-creator>/eval-viewer/generate_review.py <iteration 資料夾> --skill-name kb-framework --static review.html
```

## 情境檔

`scenarios/<id>.json`：

| 欄位 | 意思 |
|---|---|
| `setup` | 前置步驟：`issue`、`branch`（`edits` 改檔、`run` 跑指令、`pr` 開提案）、`comment`、`merge`、`wait_release` |
| `local` | 寫進 `.kif/local.json` 的使用者偏好（扮演哪個人的電腦） |
| `sessions` | 一段或多段對話：`first` 第一句話、`persona` 人物設定、`goal` 想完成的事、`max_turns`、`after: newest_pr`（把最新的提案編號存成 `{pr_new}`） |
| `checks` | 程式檢查，種類見 grade.py 的 `check()` |
| `judge` | 交給評分模型的標準 |

`{issue_pm}` 這類寫法會換成前置步驟產生的編號。
