/* 附錄：Q&A（資料在 js/qa-data.js，由 gen-qa.py 產生） */
(function () {
  const QA = window.QA || [];
  const total = QA.reduce((a, g) => a + g.items.length, 0);
  // 跳去別頁再按 B 回來時，還原主題、搜尋字、展開的題目和捲動位置
  const st = { sel: -1, q: '', open: new Set(), scroll: 0 };
  Deck.add({
    id: 'qa', part: 9, minutes: 0, short: '附錄：Q&A',
    title: '附錄：現場可能被問的問題', en: 'Q&A',
    thesis: `共 ${total} 題。左邊選主題或搜尋，<b>點問題看建議回答</b>；按「→ 第幾頁」跳去相關投影片，看完按 <b>B</b> 回到這裡。`,
    render: () => `<div class="s-body" style="grid-template-columns:300px 1fr">
      <div class="col" style="min-height:0;gap:10px">
        <input id="qa-s" type="search" placeholder="搜尋關鍵字，例如 EUV、良率" autocomplete="off"
          style="font:inherit;font-size:18px;padding:9px 12px;border:1px solid var(--line-strong);border-radius:4px;width:100%;box-sizing:border-box">
        <div id="qa-t" style="flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:4px"></div>
      </div>
      <div class="col" style="min-height:0;gap:8px">
        <div style="display:flex;align-items:center;gap:10px"><div id="qa-h" style="font-size:20px;font-weight:700;flex:1"></div>
          <button class="btn" id="qa-x" type="button">全部展開</button></div>
        <div id="qa-l" style="flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:6px"></div>
      </div></div>`,
    init(el) {
      const tl = U.$(el, '#qa-t'), list = U.$(el, '#qa-l'), head = U.$(el, '#qa-h'), inp = U.$(el, '#qa-s'), xb = U.$(el, '#qa-x');
      const pageOf = id => Deck.slides.findIndex(s => s.id === id) + 1;
      let sel = st.sel; // -1＝全部
      inp.value = st.q;
      // 主題清單：依部分分組
      let html = `<button type="button" class="btn${sel < 0 ? ' primary' : ''}" data-t="-1" style="justify-content:space-between;display:flex"><span>全部</span><span>${total}</span></button>`, lastPart = '';
      QA.forEach((g, i) => {
        if (g.part !== lastPart) { lastPart = g.part; html += `<div class="gloss" style="margin:8px 0 0;font-weight:700;color:var(--accent-2)">${g.part}</div>`; }
        html += `<button type="button" class="btn${sel === i ? ' primary' : ''}" data-t="${i}" style="display:flex;justify-content:space-between;text-align:left;font-size:16px"><span>${g.topic}</span><span style="color:var(--ink-3)">${g.items.length}</span></button>`;
      });
      tl.innerHTML = html;
      const draw = () => {
        const q = inp.value.trim().toLowerCase();
        const rows = [];
        QA.forEach((g, i) => { if (sel >= 0 && i !== sel) return; g.items.forEach(it => { if (!q || (it.q + it.a + g.topic).toLowerCase().includes(q)) rows.push([g, it]); }); });
        head.textContent = (sel >= 0 ? `${QA[sel].part} · ${QA[sel].topic}` : '全部主題') + (q ? `　搜尋「${inp.value.trim()}」` : '') + `：${rows.length} 題`;
        list.innerHTML = rows.length ? rows.map(([g, it]) => `<details class="card" data-n="${it.n}" style="padding:10px 14px"${st.open.has(it.n) ? ' open' : ''}>
          <summary style="cursor:pointer;font-size:19px;font-weight:700;line-height:1.4"><span class="mono" style="color:var(--ink-3);font-weight:400;margin-right:8px">${it.n}</span>${it.q}${sel < 0 ? `<span class="gloss" style="font-weight:400;margin-left:10px;font-size:14px">${g.topic}</span>` : ''}</summary>
          <div style="font-size:18px;line-height:1.6;margin:8px 0 4px">${it.a}</div>
          ${it.go.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap">${it.go.map(id => `<button type="button" class="btn" data-go="${id}" style="font-size:14px;padding:3px 10px">→ 第 ${pageOf(id)} 頁</button>`).join('')}</div>` : ''}
        </details>`).join('') : '<p class="gloss">找不到符合的問題，換個關鍵字試試。</p>';
        xb.textContent = U.$$(list, 'details').some(d => !d.open) ? '全部展開' : '全部收合';
      };
      tl.onclick = e => { const b = e.target.closest('[data-t]'); if (!b) return; sel = st.sel = +b.dataset.t; U.$$(tl, '[data-t]').forEach(x => x.classList.toggle('primary', x === b)); list.scrollTop = 0; draw(); };
      list.onclick = e => { const b = e.target.closest('[data-go]'); if (b) { st.scroll = list.scrollTop; Deck.goId(b.dataset.go); } };
      list.addEventListener('toggle', e => { const n = +e.target.dataset.n; if (e.target.open) st.open.add(n); else st.open.delete(n); }, true);
      inp.oninput = () => { st.q = inp.value; list.scrollTop = 0; draw(); };
      xb.onclick = () => { const open = xb.textContent === '全部展開'; U.$$(list, 'details').forEach(d => d.open = open); xb.textContent = open ? '全部收合' : '全部展開'; };
      // 打字時不要觸發翻頁、備註等快捷鍵；在問題上按空白鍵／Enter 是展開，不是翻頁
      inp.addEventListener('keydown', e => { if (e.key !== 'Escape') e.stopPropagation(); else inp.blur(); });
      list.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && e.target.tagName === 'SUMMARY') e.stopPropagation(); });
      draw();
      list.scrollTop = st.scroll;
    },
    notes: `附錄：問答時用。左邊可以選主題或直接搜尋關鍵字，點問題就會展開建議回答；需要畫面輔助時，按「→ 第幾頁」跳過去講，講完按 B 鍵回到這一頁。題目和 docs/qa-by-topic.md 同步。`
  });
})();
