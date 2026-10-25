/* Markdown 寫的簡報頁，和自動產生的頁（章末自我檢查、出處）。
   建置時把 deck/<部分>/<章>.md 轉成 window.DECK_MD；互動圖用 Fig.add(名稱, { render(頁) -> html, init(el, ctx, 頁), meters, layout, side }) 註冊。
   版面跟程式頁一樣：左邊是「圖：」指定的互動圖、圖片或影片；右邊依序是重點、數字卡、比喻卡。
   版面特別的頁，互動圖寫 body: true，render 回傳整個內容區，右欄用 U.pageSide({ top, meters, extra }) 放這一頁的文字；
   raw: true 連標題都自己畫。cls、eyebrow、back、hub、hubShort、footL 這些頁面設定也可以寫在互動圖裡。 */
(function () {
  const CFG = window.DECK_CONFIG || {};
  const CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳';
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  const Fig = { list: {}, add(name, f) { this.list[name] = f; } };
  window.Fig = Fig;

  /* 圖片、影片：圖框上方寫說明 */
  const media = p => ({
    render: () => `<div class="fig grow"><div class="fig-title"><span>${p.cap || ''}</span></div><div class="fig-canvas fig-media">${p.figKind === 'video'
      ? U.video(p.fig, { alt: p.cap || '' }) : `<img src="${p.fig}" alt="${esc(p.cap || '')}">`}</div></div>`
  });
  const missing = p => ({
    render: () => `<div class="fig grow"><div class="fig-title"><span>找不到互動圖</span></div><p class="caption">「圖：${esc(p.fig || '（沒寫）')}」沒有註冊。互動圖寫在 deck/figures/*.js，用 Fig.add('${esc(p.fig)}', …) 註冊。</p></div>`
  });
  const figFor = p => p.figKind === 'name' ? Fig.list[p.fig] || missing(p) : p.figKind ? media(p) : missing(p);
  const PASS = ['raw', 'cls', 'eyebrow', 'back', 'hub', 'hubShort', 'footL'];

  /* 這一頁 Markdown 的重點、數字卡、比喻卡，加上互動圖自己的東西（top、meters、extra），排成右欄 */
  const sideOf = (p, extra) => U.side(Object.assign({
    points: p.points.length ? p.points : null,
    fact: p.fact ? { v: p.fact[0], d: p.fact[1] } : null,
    analogy: p.analogy ? { icon: p.analogy[0], t: p.analogy[2] || '比喻', p: p.analogy[1] } : null
  }, extra || {}));
  U.pageSide = extra => { const s = Deck.slides[Deck.cur]; return s && s.md ? sideOf(s.md, extra) : U.side(extra || {}); };

  /* 頁首的小字：章裡的頁寫「第二部分 · ⑤ 閘極」，部分的開場直接寫部分名稱 */
  function eyebrow(p) {
    const part = (Deck.PARTS[p.part] || '').split(' · ')[0];
    if (!p.chap) return Deck.PARTS[p.part] || '';
    const ch = (Deck.CHAPS.find(c => c[0] === p.chap && (c[3] === undefined || c[3] === p.part)) || [])[1] || '';
    return `${part} · ${CIRC[p.chap - 1] || p.chap} ${ch}`;
  }

  Deck.addMarkdown = function (list) {
    (list || []).forEach(p => {
      const f = figFor(p);
      const s = {
        id: p.id, part: p.part, chap: p.chap || undefined, minutes: p.minutes, short: p.short, title: p.title, en: p.en,
        thesis: p.thesis, notes: p.notes, badge: p.badge || undefined, src: p.src || undefined, eyebrow: eyebrow(p), md: p,
        render: i => {
          if (f.body || f.raw) return f.render(p, i);
          const side = f.side === false ? '' : sideOf(p, { meters: f.meters });
          return `<div class="s-body ${f.layout || ''}"><div class="col">${f.render ? f.render(p, i) : ''}</div>${side}</div>`;
        },
        init: f.init ? (el, ctx) => f.init(el, ctx, p) : null
      };
      PASS.forEach(k => { if (f[k] !== undefined) s[k] = f[k]; });
      Deck.add(s);
    });
  };

  /* ---------- 自動產生的頁 ---------- */
  const href = (kb, file, id) => (CFG.links ? CFG.links[file].replace('{kb}', kb) : file + '.html') + (id ? '#' + id : '');

  /* 章末自我檢查：這一章的題目（手冊的常見問題，或簡報章檔的「## 自我檢查」）；先想，再展開答案 */
  function checkPage(g, qs) {
    return {
      id: 'check-' + g.key, part: g.part, chap: g.chap || undefined, minutes: 0, generated: true,
      short: '自我檢查：' + g.name, title: '自我檢查：' + g.name, en: 'Self-check',
      thesis: '先自己想，<b>再展開答案</b>；答不出來的，點「回到那一頁」再看一次。',
      notes: '這一頁是自動產生的：題目來自這一章的常見問題。先自己想，再展開答案。',
      render: () => `<div class="s-body full"><div class="col checks">${qs.map(q => `<details class="ck">
          <summary>${q.deep ? '<span class="tag w">深入</span> ' : ''}${q.q}</summary>
          <div class="ans">${q.a}</div>
          <div class="ck-go">${q.pages.map(([id, t]) => `<button type="button" class="btn" data-go="${id}">↩ 回到那一頁：${t}</button>`).join('')}${q.secs.map(([kb, id, t]) => `<a class="btn" href="${href(kb, 'handbook', id)}" target="_blank" rel="noopener">手冊：${t}</a>`).join('')}</div>
        </details>`).join('')}</div></div>`,
      init(el) { el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go)); }
    };
  }

  /* 出處：所有 Markdown 頁的註腳，照頁排好 */
  function refsPage(pages) {
    return {
      id: 'refs-auto', part: pages[pages.length - 1].part, minutes: 0, generated: true,
      short: '出處', title: '出處', en: 'Sources',
      thesis: '每一頁的數字和說法，出處都在這裡；在頁面上點數字後面的小標號也看得到。',
      render: () => `<div class="s-body full"><div class="col refs">${pages.map(s => `<div class="rf-page"><button type="button" class="rf-t" data-go="${s.id}">${s.title}</button>
          <ol>${s.md.fns.map(([n, , t]) => `<li value="${n}">${t}</li>`).join('')}</ol></div>`).join('')}</div></div>`,
      init(el) { el.querySelectorAll('[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go)); }
    };
  }

  Deck.addGenerated = function () {
    const groups = CFG.groups || [], checks = CFG.checks || {};
    // 從後面往前插，前面的位置才不會跑掉
    groups.map(g => ({ g, qs: checks[g.key], last: g.pages[g.pages.length - 1] }))
      .filter(x => x.qs && x.qs.length && !groups.some(o => o.key === x.g.key && o !== x.g && groups.indexOf(o) < groups.indexOf(x.g)))
      .map(x => Object.assign(x, { at: Deck.slides.findIndex(s => s.id === x.last) }))
      .filter(x => x.at >= 0).sort((a, b) => b.at - a.at)
      .forEach(x => Deck.slides.splice(x.at + 1, 0, checkPage(x.g, x.qs)));
    const withFns = Deck.slides.filter(s => s.md && s.md.fns && s.md.fns.length);
    if (withFns.length) Deck.slides.push(refsPage(withFns));
  };
})();
