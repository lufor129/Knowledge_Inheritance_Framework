/* 給新人的按鈕和進度：旁白、看詳細和出處、問 Agent；記住看過哪些頁（入口網站讀同一份紀錄）；點註腳小標號看出處。
   進度存在瀏覽器的 localStorage：kif.<知識庫>.seen（看過的頁 id）、kif.<知識庫>.last（最後看的頁 id）。 */
(function () {
  const CFG = window.DECK_CONFIG || {};
  const KB = CFG.kb || { name: 'deck', title: document.title };
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const strip = s => String(s || '').replace(/<[^>]+>/g, '');
  const href = (kb, file, id) => (CFG.links ? CFG.links[file].replace('{kb}', kb) : file + '.html') + (id ? '#' + id : '');

  /* ---------- 進度 ---------- */
  const key = k => `kif.${KB.name}.${k}`;
  const load = k => { try { return JSON.parse(localStorage.getItem(key(k)) || 'null'); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem(key(k), JSON.stringify(v)); } catch (e) { /* 私密視窗或封鎖儲存：不記進度 */ } };
  const seen = new Set(load('seen') || []);
  Deck.onGo.push(s => {
    if (s.generated) return; // 自我檢查、出處這些自動產生的頁不算進度
    seen.add(s.id); save('seen', [...seen]); save('last', s.id);
  });

  /* ---------- 按鈕列 ---------- */
  let bar, pop;
  function closePop() { if (pop) pop.hidden = true; }
  function openPop(html, anchor) {
    pop.innerHTML = html; pop.hidden = false;
    const r = anchor.getBoundingClientRect(), w = Math.min(520, innerWidth - 24);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + 'px';
    pop.style.bottom = (innerHeight - r.top + 10) + 'px'; pop.style.top = 'auto';
  }

  function maps(s) { return (CFG.maps || {})[s.id] || []; }

  function askText(s) {
    return `我在看〈${KB.title}〉簡報的〈${strip(s.title)}〉這一頁（頁 id：${s.id}），想問：`;
  }
  function copy(text, done) {
    const fallback = () => {
      const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      t.remove(); done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  }

  function update(s) {
    if (!bar) return;
    bar.querySelector('[data-b=src]').hidden = !maps(s).length;
    bar.querySelector('[data-b=narr]').classList.toggle('on', Deck.notesOpen() === 'narr');
    closePop();
  }
  Deck.onGo.push(update);

  function makeBar() {
    bar = document.createElement('div'); bar.id = 'learn';
    bar.innerHTML = `<button type="button" data-b="narr" title="打開或收起這一頁的解說">旁白</button>
      <button type="button" data-b="src" title="打開手冊網站裡對應的小節">看詳細和出處</button>
      <button type="button" data-b="ask" title="複製這一頁的位置，貼到 Claude Code 接著問">問 Agent</button>`;
    pop = document.createElement('div'); pop.id = 'learn-pop'; pop.hidden = true;
    document.body.append(bar, pop);
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      const s = Deck.slides[Deck.cur];
      if (b.dataset.b === 'narr') { closePop(); Deck.toggleNotes('narr'); return; }
      if (!pop.hidden && pop.dataset.for === b.dataset.b) { closePop(); return; }
      pop.dataset.for = b.dataset.b;
      if (b.dataset.b === 'src') {
        openPop(`<div class="lp-h">手冊網站裡對應的小節</div>${maps(s).map(([kb, id, t, ch]) =>
          `<a class="lp-item" href="${href(kb, 'handbook', id)}" target="_blank" rel="noopener">${esc(t)}<span>${esc(ch)} › ${esc(id)}</span></a>`).join('')}`, b);
      }
      if (b.dataset.b === 'ask') {
        const text = askText(s);
        copy(text, ok => openPop(`<div class="lp-h">${ok ? '已複製。貼到 Claude Code，接著打你的問題。' : '複製不了，請選取下面這段文字自己複製：'}</div>
          <div class="lp-copy">${esc(text)}</div>`, b));
      }
    });
    document.addEventListener('click', e => { if (pop && !pop.hidden && !e.target.closest('#learn, #learn-pop, .fn')) closePop(); });
  }

  /* ---------- 註腳：點小標號看出處 ---------- */
  document.addEventListener('click', e => {
    const f = e.target.closest('#stage .fn'); if (!f || !pop) return;
    const s = Deck.slides[Deck.cur], fn = ((s.md && s.md.fns) || []).find(x => x[1] === f.dataset.fn);
    if (!fn) return;
    pop.dataset.for = 'fn';
    openPop(`<div class="lp-h">出處 [${fn[0]}]</div><div class="lp-src">${fn[2]}</div>`, f);
  });

  // 按 N 或「講稿」切到講稿時，「旁白」按鈕也要跟著熄掉
  const toggleNotes = Deck.toggleNotes;
  Deck.toggleNotes = function (mode) {
    const open = toggleNotes.call(Deck, mode);
    if (bar) bar.querySelector('[data-b=narr]').classList.toggle('on', Deck.notesOpen() === 'narr');
    return open;
  };

  const start = Deck.start;
  Deck.start = function () {
    makeBar();
    start.apply(this, arguments);
    const help = document.getElementById('help');
    if (help && !/旁白/.test(help.textContent)) help.textContent = '←/→ 翻頁 · 下面的按鈕：旁白、看詳細、問 Agent · O 總覽 · N 講稿 · P 講者視窗 · F 全螢幕';
  };
})();
