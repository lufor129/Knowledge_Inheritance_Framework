/* 入口網站：知識庫卡片、學習路徑、角色路徑、看到哪裡、跨知識庫搜尋。
   資料由 build.py 放在 window.PORTAL：{ built, commit, latest, kbs: [{name, title, intro, maintainers, deck, sections, pages, minutes,
   path: [{key, name, pages, minutes}], updated}], roles: [{name, intro, steps: [[知識庫, 頁 id, 說明]]}], index: [[種類, 知識庫, id, 標題, 內文]] }
   進度讀簡報存在瀏覽器的紀錄（learn.js）：kif.<知識庫>.seen、kif.<知識庫>.last。 */
(function () {
  const P = window.PORTAL;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const KIND = { 頁: '簡報頁', 節: '手冊小節', 詞: '術語' };
  const byName = Object.fromEntries(P.kbs.map(k => [k.name, k]));
  const hm = m => m >= 60 ? `${Math.floor(m / 60)} 小時${m % 60 ? ` ${Math.round(m % 60)} 分` : ''}` : `${Math.round(m)} 分`;

  function load(kb, k) { try { return JSON.parse(localStorage.getItem(`kif.${kb}.${k}`) || 'null'); } catch (e) { return null; } }
  const seenOf = kb => new Set(load(kb, 'seen') || []);
  const deckHref = (kb, id) => `${kb}/deck.html${id ? '#' + encodeURIComponent(id) : ''}`;

  let sel = (P.kbs.find(k => k.deck) || P.kbs[0] || {}).name;

  /* 一章的狀態：每頁都看過＝看完；看過一部分＝看到一半，連結接著看第一個還沒看的頁 */
  function rowState(k, g, seen) {
    const n = g.pages.filter(id => seen.has(id)).length;
    const next = g.pages.find(id => !seen.has(id)) || g.pages[0];
    return { n, done: n === g.pages.length, part: n > 0 && n < g.pages.length, next };
  }
  function row(k, g, seen, label) {
    const st = rowState(k, g, seen);
    return `<a class="row ${st.done ? 'done' : st.part ? 'half' : ''}" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">
      <span class="ck" aria-label="${st.done ? '看完了' : st.part ? `看了 ${st.n} 頁` : '還沒看'}"></span>
      <span class="nm">${label || ''}${esc(g.name)}</span><span class="m">${g.pages.length} 頁 · ${hm(g.minutes)}</span></a>`;
  }

  function cards() {
    return P.kbs.map(k => {
      const seen = seenOf(k.name), n = k.path.reduce((a, g) => a + g.pages.filter(id => seen.has(id)).length, 0);
      const last = load(k.name, 'last');
      const go = k.deck ? `<a class="btn primary" href="${deckHref(k.name, n ? last : '')}" target="_blank" rel="noopener">${n ? '繼續看簡報' : '開始看簡報'}</a>` : '';
      const meta = k.deck ? `${k.pages} 頁 · 約 ${hm(k.minutes)}` : (k.sections ? `簡報還沒做 · 手冊 ${k.sections} 個小節` : '簡報和手冊都還在準備');
      return `<article class="card ${k.name === sel ? 'on' : ''}" data-kb="${k.name}">
        <button type="button" class="pick" data-kb="${k.name}"><h3>${esc(k.title)}</h3><p>${esc(k.intro)}</p></button>
        <div class="meta">${meta}${k.maintainers.length ? ` · 維護者：${esc(k.maintainers.join('、'))}` : ''}</div>
        ${k.updated ? `<div class="meta">最近更新 ${esc(k.updated.date)}：${esc(k.updated.subject)}</div>` : ''}
        ${k.deck ? `<div class="pbar" title="看過 ${n} / ${k.pages} 頁"><i style="width:${(n / k.pages * 100).toFixed(1)}%"></i></div><div class="meta">看過 ${n} / ${k.pages} 頁</div>` : ''}
        <div class="acts">${go}<a class="btn" href="${k.name}/handbook.html" target="_blank" rel="noopener">手冊網站</a></div>
      </article>`;
    }).join('');
  }

  function path() {
    const k = byName[sel];
    if (!k) return '';
    if (!k.deck) return `<p class="empty">${esc(k.title)}還沒有簡報。傳承者新增第一筆知識時，Agent 會一起做簡報頁，這裡就會出現學習路徑。</p>`;
    const seen = seenOf(k.name);
    return `<p class="sub">照簡報的章排；時間是每頁建議時間加起來。一章每頁都翻過，就會打勾。點一章從還沒看的頁接著看。</p>
      <div class="rows">${k.path.map(g => row(k, g, seen)).join('')}</div>`;
  }

  function roles() {
    if (!P.roles.length) return `<p class="empty">還沒有角色路徑。框架維護者可以在 <code>framework/paths.md</code> 加，例如「新進製程工程師第一週看哪幾章」，照一般的變更提案加進來。</p>`;
    return P.roles.map(r => {
      const steps = r.steps.map(([kb, id, note]) => {
        const k = byName[kb], g = k && k.path.find(x => x.pages.includes(id));
        if (!g) return `<div class="row bad">找不到：${esc(kb || '')}/${esc(id)}</div>`;
        return row(k, g, seenOf(kb), `<b>${esc(k.title)}</b> · `) + (note ? `<div class="note">${esc(note)}</div>` : '');
      }).join('');
      return `<section class="role"><h3>${esc(r.name)}</h3>${r.intro ? `<p class="sub">${esc(r.intro)}</p>` : ''}<div class="rows">${steps}</div></section>`;
    }).join('');
  }

  /* ---------- 搜尋：所有知識庫的簡報頁、手冊小節、術語 ---------- */
  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return '';
    const hits = [];
    P.index.forEach(([kind, kb, id, title, text]) => {
      const t = title.toLowerCase(), x = (text || '').toLowerCase();
      if (!terms.every(w => t.includes(w) || x.includes(w))) return;
      hits.push({ kind, kb, id, title, text: text || '', score: terms.filter(w => t.includes(w)).length * 10 + (kind === '詞' ? 3 : kind === '頁' ? 2 : 1) });
    });
    hits.sort((a, b) => b.score - a.score);
    const mark = s => { let h = esc(s); terms.forEach(w => { h = h.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => `<mark>${m}</mark>`); }); return h; };
    const snip = s => { const i = s.toLowerCase().indexOf(terms[0]); if (i < 0) return s.slice(0, 90); const a = Math.max(0, i - 40); return (a ? '…' : '') + s.slice(a, i + 60) + '…'; };
    const link = h => h.kind === '頁' ? deckHref(h.kb, h.id) : `${h.kb}/handbook.html#${h.kind === '詞' ? '/terms' : encodeURIComponent(h.id)}`;
    if (!hits.length) return `<p class="empty">找不到「${esc(q)}」。換個說法、英文或縮寫試試看；手冊和簡報都沒寫的，可以請 Agent 記成待回答。</p>`;
    return `<p class="sub">找到 ${hits.length} 筆${hits.length > 30 ? '，先列出最相關的 30 筆' : ''}</p><div class="hits">${hits.slice(0, 30).map(h => `
      <a class="hit" href="${link(h)}" target="_blank" rel="noopener"><span class="k k-${h.kind}">${KIND[h.kind]}</span>
        <span class="t">${mark(h.title)}<small>${esc((byName[h.kb] || {}).title || h.kb)}${h.kind === '詞' ? '' : ' · ' + esc(h.id)}</small></span>
        ${h.text ? `<span class="x">${mark(snip(h.text))}</span>` : ''}</a>`).join('')}</div>`;
  }

  function render() {
    $('#cards').innerHTML = cards();
    const k = byName[sel];
    $('#path-h').textContent = k ? `學習路徑：${k.title}` : '學習路徑';
    $('#path').innerHTML = path();
    $('#roles').innerHTML = roles();
  }

  $('#app').innerHTML = `
    <header class="top"><div class="wrap">
      <h1>知識傳承入口</h1>
      <p class="lead">挑一個知識庫，照學習路徑看簡報；看不懂就按簡報下面的「問 Agent」。</p>
      <p class="ver">這一份建置於 ${esc(P.built)}${P.commit ? `（${esc(P.commit)}）` : ''}。${P.latest ? `<a href="${P.latest}" target="_blank" rel="noopener">下載最新版</a>` : ''}</p>
      <label class="search"><span>搜尋</span><input id="q" type="search" placeholder="所有知識庫的簡報頁、手冊小節、術語：例如 EUV、穿隧、OCD" autocomplete="off"></label>
      <div id="hits"></div>
    </div></header>
    <main class="wrap">
      <section><h2>知識庫</h2><div id="cards" class="cards"></div></section>
      <section><h2 id="path-h">學習路徑</h2><div id="path"></div></section>
      <section><h2>角色路徑</h2><div id="roles"></div></section>
    </main>`;
  let t = null;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { $('#hits').innerHTML = search(e.target.value.trim()); }, 120); });
  $('#cards').addEventListener('click', e => { const b = e.target.closest('.pick'); if (b) { sel = b.dataset.kb; render(); } });
  // 從簡報回到這一頁時，重新讀進度
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('focus', render);
  window.addEventListener('storage', render);
  render();
})();
