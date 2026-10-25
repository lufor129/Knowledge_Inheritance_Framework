/* 頁面的額外設定：所有頁面都註冊完才執行（標題旁的標籤寫在各頁 Markdown 的「標籤：」） */
(function () {
  // 沉積、磊晶與摻雜、閘極各頁：標題旁加「⌂ 全貌」按鈕，跳回薄膜全貌頁
  ['depo1', 'depo2', 'asd', 'depo3', 'dope1', 'dope3', 'hk1'].forEach(id => { const s = Deck.slides.find(x => x.id === id); if (s) s.hub = 'depo4'; });
})();
