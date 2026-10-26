/* 入口網站：新人的起點。上面是三個步驟和搜尋；下面依序是知識庫卡片、學習路徑（一條由上往下的路線，每章有速覽和先修）、
   收起來的全景圖、主題索引、角色路徑（有才顯示）；建置日期、維護者放在頁尾。給開發者看的東西（修改紀錄、頁 id、檔案路徑）不放上來。
   資料由 build.py 放在 window.PORTAL：{ built, commit, latest, kbs: [{name, title, intro, maintainers, deck, sections, pages, minutes, deep, parts,
   path: [{key, part, chap, name, pages, minutes, deep, deepMinutes, last, overview, pre: [[知識庫, key, 章名]]}], topics: [{zh, en, desc, pages: [[頁 id, 標題, 是不是深入頁]]}],
   updated}], roles: [{name, intro, steps: [[知識庫, 頁 id, 說明]]}], index: [[種類, 知識庫, id, 標題, 內文]] }
   全景圖照部分和章自動排，先修畫成箭頭；先修只提醒、不擋。學習路徑的時間和進度只算主頁，深入頁另外標「選看」。
   用詞照 GLOSSARY（先修、深入、主題索引），第一次出現的地方附一句白話解釋。
   進度讀簡報存在瀏覽器的紀錄（learn.js）：kif.<知識庫>.seen、kif.<知識庫>.last。 */
(function () {
  const P = window.PORTAL;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const KIND = { 頁: '簡報頁', 深: '深入頁', 詞: '術語' };
  const byName = Object.fromEntries(P.kbs.map(k => [k.name, k]));
  const hm = m => m >= 60 ? `${Math.floor(m / 60)} 小時${m % 60 ? ` ${Math.round(m % 60)} 分` : ''}` : `${Math.round(m)} 分`;

  function load(kb, k) { try { return JSON.parse(localStorage.getItem(`kif.${kb}.${k}`) || 'null'); } catch (e) { return null; } }
  const seenOf = kb => new Set(load(kb, 'seen') || []);
  const deckHref = (kb, id) => `${kb}/deck.html${id ? '#' + encodeURIComponent(id) : ''}`;

  let sel = (P.kbs.find(k => k.deck) || P.kbs[0] || {}).name;
  let chapSel = null, topicSel = 0, allTopics = false;   // 學習路徑打開的章（第幾組）、主題索引選到的術語、術語全部列出來了沒
  const TOPIC_FIRST = 16;   // 主題索引先列這麼多個詞，其他的按「還有 N 個詞」才出現

  /* 一章的狀態：每頁都看過＝看完；看過一部分＝看到一半，連結接著看第一個還沒看的頁 */
  function rowState(k, g, seen) {
    const n = g.pages.filter(id => seen.has(id)).length;
    const next = g.pages.find(id => !seen.has(id)) || g.pages[0];
    return { n, done: g.pages.length > 0 && n === g.pages.length, part: n > 0 && n < g.pages.length, next };
  }
  function row(k, g, seen, label) {   // 角色路徑的一列：點了從還沒看的頁接著看
    const st = rowState(k, g, seen);
    return `<a class="row ${st.done ? 'done' : st.part ? 'half' : ''}" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">
      <span class="ck" aria-label="${st.done ? '看完了' : st.part ? `看了 ${st.n} 頁` : '還沒看'}"></span>
      <span class="nm">${label || ''}${esc(g.name)}</span><span class="m">${g.pages.length} 頁 · ${hm(g.minutes)}</span></a>`;
  }

  function cards() {
    return P.kbs.map(k => {
      const seen = seenOf(k.name), n = k.path.reduce((a, g) => a + g.pages.filter(id => seen.has(id)).length, 0);
      const last = load(k.name, 'last');
      const go = k.deck ? `<a class="btn primary" href="${deckHref(k.name, n ? last : '')}" target="_blank" rel="noopener">${n ? '接著上次看' : '從第一章開始'}</a>` : '';
      const meta = k.deck ? `${k.pages} 頁 · 約 ${hm(k.minutes)}` : k.path.length ? `規劃了 ${k.path.length} 章，還沒有簡報頁` : '簡報還在準備';
      return `<article class="card ${k.name === sel ? 'on' : ''}" data-kb="${k.name}">
        <button type="button" class="pick" data-kb="${k.name}"><h3>${esc(k.title)}</h3><p>${esc(k.intro)}</p></button>
        <div class="meta">${meta}</div>
        ${k.deck ? `<div class="pbar" title="看過 ${n} / ${k.pages} 頁"><i style="width:${(n / k.pages * 100).toFixed(1)}%"></i></div><div class="meta">看過 ${n} / ${k.pages} 頁</div>` : ''}
        <div class="acts">${go}${k.name === sel ? '<span class="here">↓ 下面是它的學習路徑</span>' : `<button type="button" class="btn pick" data-kb="${k.name}">看學習路徑</button>`}</div>
      </article>`;
    }).join('');
  }

  /* ---------- 全景圖：照部分和章自動排，先修畫成箭頭 ---------- */
  const shortName = n => String(n).replace(/^第.+?部分\s*·\s*/, '');
  const groupsOf = (k, key) => k.path.filter(g => g.key === key);
  function chapDone(kbName, key) {   // 看完了：true；還沒：false；那一章還沒有頁：null
    const k = byName[kbName], gs = k ? groupsOf(k, key) : [];
    if (!gs.some(g => g.pages.length)) return null;
    const seen = seenOf(kbName);
    return gs.every(g => g.pages.every(id => seen.has(id)));
  }
  function map() {
    const k = byName[sel];
    if (!k || !k.path.length) return '';
    const seen = seenOf(k.name), cols = [];
    k.path.forEach((g, i) => { if (!cols.length || cols[cols.length - 1].part !== g.part) cols.push({ part: g.part, items: [] }); cols[cols.length - 1].items.push([g, i]); });
    return `<div class="map" id="map-box"><svg class="arrows" aria-hidden="true"></svg><div class="cols">${cols.map(c => `<div class="col">
        <div class="ph">${esc(String(k.parts[c.part] || '').split(' · ')[0])}</div>
        <div class="boxes${c.items.length > 6 ? ' two' : ''}"${c.items.length > 6 ? ` style="grid-template-rows:repeat(${Math.ceil(c.items.length / 2)},auto)"` : ''}>${c.items.map(([g, i]) => {
          const st = rowState(k, g, seen), far = (g.pre || []).some(p => p[0] !== k.name);
          return `<button type="button" class="node ${!g.pages.length ? 'empty' : st.done ? 'done' : st.part ? 'half' : ''}${i === chapSel ? ' on' : ''}" data-i="${i}" data-key="${g.key}">
            <span class="nm">${esc(shortName(g.name))}${far ? ' <span class="far" title="先修有別的知識庫的章">↗</span>' : ''}</span>
            ${g.deep && g.deep.length ? `<span class="dp">另有 ${g.deep.length} 頁深入</span>` : ''}</button>`;
        }).join('')}</div></div>`).join('')}</div></div>
      <p class="sub" style="margin-top:6px">綠色是看完的章，虛線是還沒有頁的章；<span class="lg-arrow">橘色箭頭</span>是先修：箭頭指向的章，建議先看完箭頭出發的那一章。點一章，打開學習路徑上的那一章。</p>`;
  }
  function drawArrows() {
    const box = $('#map-box'), k = byName[sel];
    if (!box || !k || !$('#mapbox').open) return;   // 全景圖收起來時量不到大小，打開才畫
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
  /* ---------- 學習路徑：一條由上往下的路線。照部分分段，每章一列：速覽、先修、頁數和時間、看完了沒；點一章打開 ---------- */
  function preOf(k, g) {
    return (g.pre || []).map(([kb, key, name]) => ({ kb, key, name, done: chapDone(kb, key), far: kb !== k.name, title: (byName[kb] || {}).title || kb }));
  }
  function step(k, g, i, seen, label) {
    const st = rowState(k, g, seen), open = i === chapSel, pre = preOf(k, g), miss = pre.filter(p => p.done === false);
    const cls = !g.pages.length ? 'empty' : st.done ? 'done' : st.part ? 'half' : '';
    const status = !g.pages.length ? '還沒有頁' : st.done ? '看完了' : st.part ? `看了 ${st.n} / ${g.pages.length} 頁` : '';
    const preLink = p => p.far
      ? `<a href="${deckHref(p.kb, (groupsOf(byName[p.kb], p.key)[0] || {}).pages?.[0] || '')}" target="_blank" rel="noopener">${esc(p.title)} › ${esc(p.name)}</a>`
      : `<button type="button" class="lk" data-go="${k.path.findIndex(x => x.key === p.key)}">${esc(p.name)}</button>`;
    const preMark = p => p.done ? ' <span class="ok">✓</span>' : p.done === null ? ' <span class="m">（還沒有頁）</span>' : '';
    return `<div class="step ${cls}${open ? ' open' : ''}" data-i="${i}">
      <button type="button" class="sh" data-i="${i}" aria-expanded="${open}">
        <span class="ck" aria-hidden="true"></span><span class="nm">${label || esc(g.name)}</span>
        <span class="m">${g.pages.length ? `${g.pages.length} 頁 · ${hm(g.minutes)}` : ''}${status ? `<em>${status}</em>` : ''}</span></button>
      ${g.overview ? `<p class="ov">${esc(g.overview)}</p>` : ''}
      ${pre.length ? `<p class="pre">先修：${pre.map(p => preLink(p) + preMark(p)).join('、')}</p>` : ''}
      ${open ? `<div class="more">
        ${miss.length ? `<p class="warn">建議先看完 ${miss.map(p => esc(p.name)).join('、')}；想先看這一章也可以直接打開。</p>` : ''}
        ${g.deep && g.deep.length ? `<p class="dp">另有 ${g.deep.length} 頁深入（選看，約 ${hm(g.deepMinutes)}）：在簡報上按「看深入」才看得到。</p>` : ''}
        ${g.pages.length ? `<div class="acts"><a class="btn primary" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">${st.done ? '再看一次' : st.n ? '接著看這一章' : '打開這一章'}</a></div>`
          : '<p class="empty">這一章還沒有頁。傳承者新增這一章的知識時，Agent 會一起做簡報頁。</p>'}
      </div>` : ''}
    </div>`;
  }
  function path() {
    const k = byName[sel];
    if (!k) return '';
    if (!k.path.length) return `<p class="empty">${esc(k.title)}還沒有簡報頁。傳承者新增第一筆知識時，Agent 會一起做簡報頁，這裡就會出現學習路徑。</p>`;
    const seen = seenOf(k.name), parts = [];
    k.path.forEach((g, i) => { if (!parts.length || parts[parts.length - 1].part !== g.part) parts.push({ part: g.part, items: [] }); parts[parts.length - 1].items.push([g, i]); });
    const hasPre = k.path.some(g => (g.pre || []).length), hasDeep = k.path.some(g => g.deep && g.deep.length);
    const intro = k.deck
      ? `由上往下照順序看。點一章看它在講什麼，再打開簡報；看過的章會打勾，下次回來接著看。${hasPre ? '<b>先修</b>是建議先看完的章，沒看完也可以直接打開。' : ''}${hasDeep ? '<b>深入</b>是比較長的補充說明，平常翻頁不會經過，在簡報上按「看深入」才看得到。' : ''}`
      : '還沒有簡報頁；下面是規劃好的章，點一章看它要講什麼。傳承者新增知識時，Agent 會一起做簡報頁。';
    return `<p class="sub">${intro}</p><div class="route">${parts.map(c => {
      const pn = String(k.parts[c.part] || '');
      if (c.items.length === 1) return step(k, c.items[0][0], c.items[0][1], seen);
      return `<div class="part"><div class="ph">${esc(pn)}</div>${c.items.map(([g, i], j) => step(k, g, i, seen, !g.chap && j === 0 ? '導讀' : '')).join('')}</div>`;
    }).join('')}</div>`;
  }

  /* ---------- 主題索引：術語表的每個術語，點了看講到它的頁 ---------- */
  function topics() {
    const k = byName[sel];
    if (!k || !k.path.length) return '';
    if (!k.topics.length) return '<p class="empty">術語表還是空的。傳承者新增知識時，新的術語會加進術語表，這裡就會出現。</p>';
    const t = k.topics[topicSel] || k.topics[0];
    const shown = allTopics ? k.topics : k.topics.slice(0, Math.max(TOPIC_FIRST, topicSel + 1)), rest = k.topics.length - shown.length;
    return `<p class="sub">這個領域常用的詞。點一個詞，看它的意思，和講到它的簡報頁。</p>
      <div class="chips">${shown.map((x, i) => `<button type="button" class="chip${x === t ? ' on' : ''}" data-t="${i}">${esc(x.zh)}</button>`).join('')}${rest > 0 ? `<button type="button" class="chip more" data-all="1">還有 ${rest} 個詞 ▾</button>` : ''}</div>
      <div class="topic"><h3>${esc(t.zh)}${t.en ? ` <small>${esc(t.en)}</small>` : ''}</h3>${t.desc ? `<p>${esc(t.desc)}</p>` : ''}
        ${t.pages.length ? `<div class="tp">${t.pages.map(([id, title, deep], i) => `<a class="row" href="${deckHref(k.name, id)}" target="_blank" rel="noopener">
          <span class="tg">${i === 0 && t.pages.length ? '第一次出現' : deep ? '深入' : '簡報頁'}</span><span class="nm">${esc(title)}</span></a>`).join('')}</div>`
          : '<p class="empty">簡報裡還沒有講到這個詞。</p>'}</div>`;
  }

  function roles() {
    if (!P.roles.length) return '';   // 還沒有角色路徑就不顯示這一段（框架維護者寫在 framework/paths.md）
    return P.roles.map(r => {
      const steps = r.steps.map(([kb, id, note]) => {
        const k = byName[kb], g = k && k.path.find(x => x.pages.includes(id));
        if (!g) return `<div class="row bad">找不到：${esc(kb || '')}/${esc(id)}</div>`;
        return row(k, g, seenOf(kb), `<b>${esc(k.title)}</b> · `) + (note ? `<div class="note">${esc(note)}</div>` : '');
      }).join('');
      return `<section class="role"><h3>${esc(r.name)}</h3>${r.intro ? `<p class="sub">${esc(r.intro)}</p>` : ''}<div class="rows">${steps}</div></section>`;
    }).join('');
  }

  /* ---------- 搜尋：所有知識庫的簡報頁、深入頁、術語 ---------- */
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
    const firstPage = (kb, term) => { const t = ((byName[kb] || {}).topics || []).find(x => term.startsWith(x.zh)); return t && t.pages.length ? t.pages[0][0] : ''; };
    const link = h => deckHref(h.kb, h.kind === '詞' ? firstPage(h.kb, h.title) : h.id);   // 術語連到它第一次出現的頁
    if (!hits.length) return `<p class="empty">找不到「${esc(q)}」。換個說法、英文或縮寫試試看；簡報沒寫的，可以請 Agent 記成待回答。</p>`;
    return `<p class="sub">找到 ${hits.length} 筆${hits.length > 30 ? '，先列出最相關的 30 筆' : ''}</p><div class="hits">${hits.slice(0, 30).map(h => `
      <a class="hit" href="${link(h)}" target="_blank" rel="noopener"><span class="k k-${h.kind}">${KIND[h.kind]}</span>
        <span class="t">${mark(h.title)}<small>${esc((byName[h.kb] || {}).title || h.kb)}</small></span>
        ${h.text ? `<span class="x">${mark(snip(h.text))}</span>` : ''}</a>`).join('')}</div>`;
  }

  function foot() {
    const kb = P.kbs.map(k => `${esc(k.title)}：維護者 ${esc(k.maintainers.join('、') || '（還沒有）')}${k.updated ? `，最近更新 ${esc(k.updated.date)}` : ''}`).join('；');
    return `<p>內容有問題、或簡報沒寫到，跟 Agent 說一聲就好，它會轉給維護者。${kb}。</p>
      <p>這一份入口網站建置於 ${esc(P.built)}${P.commit ? `（${esc(P.commit)}）` : ''}。${P.latest ? `<a href="${P.latest}" target="_blank" rel="noopener">下載最新版</a>` : ''}</p>`;
  }

  function render() {
    $('#cards').innerHTML = cards();
    const k = byName[sel];
    if (k && (chapSel == null || (chapSel >= 0 && !k.path[chapSel]))) { // 預設打開第一個還沒看完的章；-1 是使用者把它收起來了
      const seen = seenOf(k.name), i = k.path.findIndex(g => g.pages.length && !rowState(k, g, seen).done);
      chapSel = i < 0 ? 0 : i;
    }
    $('#path-h').textContent = k ? `② 學習路徑：${k.title}` : '② 學習路徑';
    const seen = k ? seenOf(k.name) : new Set(), n = k ? k.path.reduce((a, g) => a + g.pages.filter(id => seen.has(id)).length, 0) : 0;
    $('#path-n').textContent = k && k.deck ? `看過 ${n} / ${k.pages} 頁` : '';
    $('#path').innerHTML = path();
    $('#mapbox').hidden = !(k && k.path.length);
    $('#map').innerHTML = map();
    $('#topics-s').hidden = !(k && k.path.length);
    $('#topics-h').textContent = k ? `主題索引：${k.title}` : '主題索引';
    $('#topics').innerHTML = topics();
    $('#roles').innerHTML = roles();
    $('#roles-s').hidden = !P.roles.length;
    $('#foot').innerHTML = foot();
    drawArrows();
  }

  $('#app').innerHTML = `
    <header class="top"><div class="wrap">
      <h1>知識傳承入口</h1>
      <p class="lead">老手的經驗，整理成一份份簡報。第一次來，照這三步：</p>
      <ol class="steps">
        <li><b>挑一個知識庫</b><span>每張卡片是一個領域，點了，下面就換成它的學習路徑。</span></li>
        <li><b>照學習路徑看簡報</b><span>從第一章由上往下看；看過的頁會自動打勾，下次接著看。</span></li>
        <li><b>看不懂就問 Agent</b><span>簡報每頁下面按「問 Agent」，貼到 Claude Code 接著問。</span></li>
      </ol>
      <label class="search"><span>搜尋</span><input id="q" type="search" placeholder="找一個詞，例如 EUV、穿隧、OCD" autocomplete="off"></label>
      <div id="hits"></div>
    </div></header>
    <main class="wrap">
      <section><h2>① 知識庫</h2><div id="cards" class="cards"></div></section>
      <section><div class="h2row"><h2 id="path-h">② 學習路徑</h2><span id="path-n"></span></div><div id="path"></div>
        <details id="mapbox" class="mapbox"><summary>看章節關係圖（全景圖）：每個部分有哪些章、哪一章建議先看</summary><div id="map"></div></details></section>
      <section id="topics-s"><h2 id="topics-h">主題索引</h2><div id="topics"></div></section>
      <section id="roles-s"><h2>角色路徑</h2><div id="roles"></div></section>
    </main>
    <footer class="foot"><div class="wrap" id="foot"></div></footer>`;
  let t = null;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { $('#hits').innerHTML = search(e.target.value.trim()); }, 120); });
  $('#cards').addEventListener('click', e => { const b = e.target.closest('.pick'); if (b && b.dataset.kb !== sel) { sel = b.dataset.kb; chapSel = null; topicSel = 0; allTopics = false; render(); } });
  const openStep = (i, scroll) => { chapSel = i; render(); if (scroll) document.querySelector(`.step[data-i="${i}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  $('#path').addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { if (+g.dataset.go >= 0) openStep(+g.dataset.go, true); return; }
    const b = e.target.closest('.sh'); if (b) { chapSel = +b.dataset.i === chapSel ? -1 : +b.dataset.i; render(); }
  });
  $('#map').addEventListener('click', e => { const b = e.target.closest('.node'); if (b) openStep(+b.dataset.i, true); });
  $('#mapbox').addEventListener('toggle', drawArrows);
  $('#topics').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { topicSel = +b.dataset.t; render(); return; } if (e.target.closest('[data-all]')) { allTopics = true; render(); } });
  window.addEventListener('resize', drawArrows);
  // 從簡報回到這一頁時，重新讀進度
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('focus', render);
  window.addEventListener('storage', render);
  render();
})();
