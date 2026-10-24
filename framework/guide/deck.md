# 簡報

簡報是選配，可以用自己的文字，但說法以手冊為準。頁序 `kb/<知識庫>/deck/order.md` 記錄每一頁對應哪些小節，以及那些小節的指紋。

## 小節改了之後：簡報頁要跟上

check.py 會點名「對應的小節改過了」的簡報頁。每一頁都要：

1. 在 `deck/slides/` 找到那一頁（`grep -n "id: '<頁id>'" kb/<知識庫>/deck/slides/*.js`），和改過的小節對照。
2. 說法不一致時，照手冊改簡報頁的文字：標題、thesis、重點、數字卡、比喻卡、講稿。一致就不用改。
3. 改好或確認之後更新指紋：`python3 framework/tools/check.py --fp <知識庫> <頁id …>`

指紋的意思是「有人對照過這一頁」，所以一定先看過頁面，再跑 `--fp`。

## 新增對應

新的小節有簡報頁在講時，在 order.md 那一頁後面加上 `→ <小節id>`（已經有對應就用逗號接在後面），再跑 `--fp`。

## 做新的簡報頁

照半導體範例的樣子：

- 每頁講一個概念；標題下面一句話講結論（thesis）。
- 右邊依序是重點（三到四點）、數字卡（出自對應小節的一個數字；沒有好數字就放一句話重點）、比喻卡。
- 左邊建議放可以操作的互動元件。
- 講稿寫在 `notes`，只存在簡報裡。

頁面寫在 `deck/slides/*.js`，用 `Deck.add({ id, part, chap, title, thesis, render, init, notes })` 註冊；版面輔助函式在 `framework/engine/widgets/core.js`（`U.side`、`U.seg`、`U.stepper`……）。加進 order.md 才會播放。
