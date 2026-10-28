# 知識傳承框架：主管報告版（30 分鐘）

`docs/design-deck/` 的精簡版，給主管的 20 分鐘報告＋10 分鐘討論。原本的 design-deck 沒有改動。

- 主頁 9 頁，約 18 分鐘：封面 → 為什麼 → 給主管的總覽 → 誰用 → 寫進去 → 品質把關 → 新人怎麼學 → 真實畫面（含一筆勘誤在 GitHub 上走一次）→ 上線前要驗證的三件事
- 合併頁右上角可以切換分頁（例如「① 三種方式 ② 送審流程 ③ GitHub 實際紀錄」），各分頁的互動元件都保留
- 「GitHub 實際紀錄」是用 GitHub API 抓 lufor129/Knowledge_Inheritance_Framework 的 issue、提案、CI、Release 重畫的卡片（環境擋了 GitHub 的樣式網域，截不到圖）；這些是情境測試留下的紀錄
- 附錄（第 10 頁起，含前一版的成果、試點、決策頁）不計時：附錄目錄點卡片跳過去，按 B 回來
- 講稿：按 N，或「講者視窗」另開一個視窗

改動都在 `js/slides/x-30min.js`（合併、新頁、頁序、講稿）、`css/deck.css` 最後一段，和 `assets/img/` 的截圖；其他檔案從 design-deck 複製，只改了封面卡片、總覽的「現況」分頁和浮水印。

建置單一檔案：

```bash
python3 docs/design-deck-30min/build.py
```

產出 `docs/design-deck-30min/dist/index.html`，離線就能開。
