/* 入口網站：知識庫卡片、全景圖（每章的速覽、先修）、學習路徑、主題索引、角色路徑、看到哪裡、跨知識庫搜尋。
   資料由 build.py 放在 window.PORTAL：{ built, commit, latest, kbs: [{name, title, intro, maintainers, deck, sections, pages, minutes, deep, parts,
   path: [{key, part, chap, name, pages, minutes, deep, deepMinutes, last, overview, pre: [[知識庫, key, 章名]]}], topics: [{zh, en, desc, pages: [[頁 id, 標題, 是不是深入頁]]}],
   updated}], roles: [{name, intro, steps: [[知識庫, 頁 id, 說明]]}], index: [[種類, 知識庫, id, 標題, 內文]] }
   全景圖照部分和章自動排，先修畫成箭頭；先修只提醒、不擋。學習路徑的時間和進度只算主頁，深入頁另外標「選看」。
   進度讀簡報存在瀏覽器的紀錄（learn.js）：kif.<知識庫>.seen、kif.<知識庫>.last。 */
(function () {
  const P = window.PORTAL;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const KIND = { 頁: '簡報頁', 深: '深入頁', 節: '手冊小節', 詞: '術語' };
  const byName = Object.fromEntries(P.kbs.map(k => [k.name, k]));
  const hm = m => m >= 60 ? `${Math.floor(m / 60)} 小時${m % 60 ? ` ${Math.round(m % 60)} 分` : ''}` : `${Math.round(m)} 分`;

  function load(kb, k) { try { return JSON.parse(localStorage.getItem(`kif.${kb}.${k}`) || 'null'); } catch (e) { return null; } }
  const seenOf = kb => new Set(load(kb, 'seen') || []);
  const deckHref = (kb, id) => `${kb}/deck.html${id ? '#' + encodeURIComponent(id) : ''}`;

  let sel = (P.kbs.find(k => k.deck) || P.kbs[0] || {}).name;
  let chapSel = null, topicSel = 0;   // 全景圖選到的章（學習路徑的第幾組）、主題索引選到的術語

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

  /* ---------- 全景圖：照部分和章自動排，先修畫成箭頭 ---------- */
  const shortName = n => String(n).replace(/^第.+?部分\s*·\s*/, '');
  const groupsOf = (k, key) => k.path.filter(g => g.key === key);
  function chapDone(kbName, key) {
    const k = byName[kbName], gs = k ? groupsOf(k, key) : [];
    if (!gs.length) return false;
    const seen = seenOf(kbName);
    return gs.every(g => g.pages.every(id => seen.has(id)));
  }
  function map() {
    const k = byName[sel];
    if (!k || !k.deck) return '';
    const seen = seenOf(k.name), cols = [];
    k.path.forEach((g, i) => { if (!cols.length || cols[cols.length - 1].part !== g.part) cols.push({ part: g.part, items: [] }); cols[cols.length - 1].items.push([g, i]); });
    return `<div class="map" id="map-box"><svg class="arrows" aria-hidden="true"></svg><div class="cols">${cols.map(c => `<div class="col">
        <div class="ph">${esc(String(k.parts[c.part] || '').split(' · ')[0])}</div>
        <div class="boxes${c.items.length > 6 ? ' two' : ''}"${c.items.length > 6 ? ` style="grid-template-rows:repeat(${Math.ceil(c.items.length / 2)},auto)"` : ''}>${c.items.map(([g, i]) => {
          const st = rowState(k, g, seen), far = (g.pre || []).some(p => p[0] !== k.name);
          return `<button type="button" class="node ${st.done ? 'done' : st.part ? 'half' : ''}${i === chapSel ? ' on' : ''}" data-i="${i}" data-key="${g.key}">
            <span class="nm">${esc(shortName(g.name))}${far ? ' <span class="far" title="先修有別的知識庫的章">↗</span>' : ''}</span>
            ${g.deep && g.deep.length ? `<span class="dp">另有 ${g.deep.length} 頁深入</span>` : ''}</button>`;
        }).join('')}</div></div>`).join('')}</div></div>
      <p class="sub" style="margin-top:6px">綠色是看完的章；<span class="lg-arrow">橘色箭頭</span>是先修：箭頭指向的章，建議先看完箭頭出發的那一章。點一章看它在講什麼。</p>`;
  }
  function drawArrows() {
    const box = $('#map-box'), k = byName[sel];
    if (!box || !k) return;
    const svg = box.querySelector('svg'), R = box.getBoundingClientRect();
    svg.setAttribute('width', R.width); svg.setAttribute('height', R.height);
    const rect = el => { const r = el.getBoundingClientRect(); return { l: r.left - R.left, r: r.right - R.left, t: r.top - R.top, b: r.bottom - R.top, cx: (r.left + r.right) / 2 - R.left, cy: (r.top + r.bottom) / 2 - R.top, w: r.width }; };
    let out = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#b3541e"/></marker></defs>';
    k.path.forEach((g, i) => (g.pre || []).filter(p => p[0] === k.name).forEach(p => {
      const from = box.querySelector(`.node[data-key="${p[1]}"]`), to = box.querySelector(`.node[data-i="${i}"]`);
      if (!from || !to) return;
      const a = rect(from), b = rect(to), on = chapSel === i || +from.dataset.i === chapSel;
      let d;
      if (Math.abs(a.cx - b.cx) < a.w / 2) { // 同一欄：從左邊繞過去
        const x = Math.min(a.l, b.l);
        d = `M${a.l},${a.cy} C${x - 34},${a.cy} ${x - 34},${b.cy} ${b.l - 2},${b.cy}`;
      } else {
        const [sx, ex] = a.cx < b.cx ? [a.r, b.l - 2] : [a.l, b.r + 2], mx = (sx + ex) / 2;
        d = `M${sx},${a.cy} C${mx},${a.cy} ${mx},${b.cy} ${ex},${b.cy}`;
      }
      out += `<path d="${d}" class="${on ? 'on' : ''}" marker-end="url(#ah)"/>`;
    }));
    svg.innerHTML = out;
  }
  function chapter() {
    const k = byName[sel], g = k && k.path[chapSel];
    if (!g) return '';
    const st = rowState(k, g, seenOf(k.name));
    const pre = (g.pre || []).map(([kb, key, name]) => ({ kb, key, name, done: chapDone(kb, key), far: kb !== k.name, title: (byName[kb] || {}).title || kb }));
    const miss = pre.filter(p => !p.done);
    const preLink = p => p.far
      ? `<a href="${deckHref(p.kb, (groupsOf(byName[p.kb], p.key)[0] || {}).pages?.[0] || '')}" target="_blank" rel="noopener">${esc(p.title)} › ${esc(p.name)}</a>`
      : `<button type="button" class="lk" data-go="${k.path.findIndex(x => x.key === p.key)}">${esc(p.name)}</button>`;
    return `<div class="chap">
      <div class="ch-h"><h3>${esc(g.name)}</h3><span class="m">${g.pages.length} 頁 · 約 ${hm(g.minutes)}${g.deep && g.deep.length ? ` · 另有 ${g.deep.length} 頁深入（選看，約 ${hm(g.deepMinutes)}）` : ''}</span></div>
      ${g.overview ? `<p class="ov">${esc(g.overview)}</p>` : ''}
      ${pre.length ? `<p class="pre">先修：${pre.map(p => `${preLink(p)} ${p.done ? '<span class="ok">✓ 看完了</span>' : '<span class="no">還沒看完</span>'}`).join('、')}</p>` : ''}
      ${miss.length ? `<p class="warn">建議先看完 ${miss.map(p => esc(p.name)).join('、')}；想先看這一章也可以直接打開。</p>` : ''}
      <div class="acts"><a class="btn primary" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">${st.done ? '再看一次' : st.n ? '接著看這一章' : '打開這一章'}</a></div>
    </div>`;
  }

  /* ---------- 主題索引：術語表的每個術語，點了看講到它的頁 ---------- */
  function topics() {
    const k = byName[sel];
    if (!k || !k.deck) return '';
    if (!k.topics.length) return '<p class="empty">術語表還是空的。傳承者新增知識時，新的術語會加進術語表，這裡就會出現。</p>';
    const t = k.topics[topicSel] || k.topics[0];
    return `<p class="sub">從術語表自動產生：術語的中文、英文或縮寫出現在哪幾頁。第一次出現的頁排最前，深入頁排在後面。</p>
      <div class="chips">${k.topics.map((x, i) => `<button type="button" class="chip${x === t ? ' on' : ''}" data-t="${i}">${esc(x.zh)}</button>`).join('')}</div>
      <div class="topic"><h3>${esc(t.zh)}${t.en ? ` <small>${esc(t.en)}</small>` : ''}</h3>${t.desc ? `<p>${esc(t.desc)}</p>` : ''}
        ${t.pages.length ? `<div class="tp">${t.pages.map(([id, title, deep], i) => `<a class="row" href="${deckHref(k.name, id)}" target="_blank" rel="noopener">
          <span class="tg">${i === 0 && t.pages.length ? '第一次出現' : deep ? '深入頁' : '簡報頁'}</span><span class="nm">${esc(title)}</span><span class="m">${esc(id)}</span></a>`).join('')}</div>`
          : '<p class="empty">簡報裡還沒有講到這個詞。</p>'}</div>`;
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
    const link = h => h.kind === '頁' || h.kind === '深' ? deckHref(h.kb, h.id) : `${h.kb}/handbook.html#${h.kind === '詞' ? '/terms' : encodeURIComponent(h.id)}`;
    if (!hits.length) return `<p class="empty">找不到「${esc(q)}」。換個說法、英文或縮寫試試看；手冊和簡報都沒寫的，可以請 Agent 記成待回答。</p>`;
    return `<p class="sub">找到 ${hits.length} 筆${hits.length > 30 ? '，先列出最相關的 30 筆' : ''}</p><div class="hits">${hits.slice(0, 30).map(h => `
      <a class="hit" href="${link(h)}" target="_blank" rel="noopener"><span class="k k-${h.kind}">${KIND[h.kind]}</span>
        <span class="t">${mark(h.title)}<small>${esc((byName[h.kb] || {}).title || h.kb)}${h.kind === '詞' ? '' : ' · ' + esc(h.id)}</small></span>
        ${h.text ? `<span class="x">${mark(snip(h.text))}</span>` : ''}</a>`).join('')}</div>`;
  }

  function render() {
    $('#cards').innerHTML = cards();
    const k = byName[sel];
    if (k && (chapSel == null || !k.path[chapSel])) { // 預設選第一個還沒看完的章
      const seen = seenOf(k.name), i = k.path.findIndex(g => g.pages.length && !rowState(k, g, seen).done);
      chapSel = i < 0 ? 0 : i;
    }
    $('#path-h').textContent = k ? `學習路徑：${k.title}` : '學習路徑';
    $('#map').innerHTML = map();
    $('#chap').innerHTML = chapter();
    $('#path').innerHTML = path();
    $('#topics-h').textContent = k ? `主題索引：${k.title}` : '主題索引';
    $('#topics').innerHTML = topics();
    $('#roles').innerHTML = roles();
    drawArrows();
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
      <section><h2 id="path-h">學習路徑</h2><div id="map"></div><div id="chap"></div><div id="path"></div></section>
      <section><h2 id="topics-h">主題索引</h2><div id="topics"></div></section>
      <section><h2>角色路徑</h2><div id="roles"></div></section>
    </main>`;
  let t = null;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { $('#hits').innerHTML = search(e.target.value.trim()); }, 120); });
  $('#cards').addEventListener('click', e => { const b = e.target.closest('.pick'); if (b && b.dataset.kb !== sel) { sel = b.dataset.kb; chapSel = null; topicSel = 0; render(); } });
  $('#map').addEventListener('click', e => { const b = e.target.closest('.node'); if (b) { chapSel = +b.dataset.i; render(); } });
  $('#chap').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b && +b.dataset.go >= 0) { chapSel = +b.dataset.go; render(); } });
  $('#topics').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { topicSel = +b.dataset.t; render(); } });
  window.addEventListener('resize', drawArrows);
  // 從簡報回到這一頁時，重新讀進度
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('focus', render);
  window.addEventListener('storage', render);
  render();
})();
