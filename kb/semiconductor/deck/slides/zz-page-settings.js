/* 頁面的額外設定（檔名排在最後，所有頁面都註冊完才執行） */
(function () {
  // 沉積、磊晶與摻雜、閘極各頁：標題旁加「⌂ 全貌」按鈕，跳回薄膜全貌頁
  ['depo1', 'depo2', 'asd', 'depo3', 'dope1', 'dope3', 'hk1'].forEach(id => { const s = Deck.slides.find(x => x.id === id); if (s) s.hub = 'depo4'; });
  // 標題旁的橘色標籤：2 nm 世代才導入的新技術、A16 起才有的背面供電、其他新技術、未來技術
  const BADGE = {
    gaaflow: '2 nm 世代新技術', litho5: '新技術', asd: '2 nm 世代新技術',
    bsx: 'A16 起新技術', bs2: 'A16 起新技術', bs4: 'A16 起新技術', bs3: 'A16 起新技術',
    etch4: '新技術', pkg3: '新技術', cfet: '未來技術', cmask: '2 nm 世代新技術', cowcmp: '新技術', glass: '新技術', cpo: '新技術'
  };
  Object.entries(BADGE).forEach(([id, b]) => { const s = Deck.slides.find(x => x.id === id); if (s) s.badge = b; });
})();
