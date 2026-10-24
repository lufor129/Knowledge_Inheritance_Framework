/* 手冊網站（手冊模式）：在瀏覽器裡把內嵌的 Markdown 轉成網頁。
   資料由 build.py 放在 window.HB：{ kb: {name, title, intro, maintainers, bigpicture}, parts: [{title, readme, chapters: [{slug, title, overview, ids, md}]}], terms } */
(function () {
  const HB = window.HB;
  const md = window.markdownit({ html: true, linkify: false, typographer: false }).use(window.markdownitFootnote);
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, i, opts, env, self) =>
    tokens[i].info.trim() === 'mermaid' ? `<pre class="mermaid">${md.utils.escapeHtml(tokens[i].content)}</pre>` : fence(tokens, i, opts, env, self);
  if (window.mermaid) window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' });

  const chapters = HB.parts.flatMap(p => p.chapters.map(c => Object.assign(c, { part: p })));
  const owner = {};
  chapters.forEach(c => c.ids.forEach(id => { owner[id] = c; }));
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  function nav(cur) {
    const items = HB.parts.map(p => `<div class="nav-part">${esc(p.title)}</div>` +
      p.chapters.map(c => `<a class="nav-ch${c === cur ? ' on' : ''}" href="#/c/${c.slug}">${esc(c.title)}</a>`).join('')).join('');
    $('#nav').innerHTML = `<a class="nav-kb${cur === 'home' ? ' on' : ''}" href="#/">${esc(HB.kb.title)}</a>
      <a class="nav-ch${cur === 'home' ? ' on' : ''}" href="#/">全景圖與速覽</a>${items}
      <div class="nav-part">其他</div><a class="nav-ch${cur === 'terms' ? ' on' : ''}" href="#/terms">術語表</a>`;
  }

  function show(html, cur, anchor) {
    nav(cur);
    const main = $('#main');
    main.innerHTML = html;
    if (window.mermaid) window.mermaid.run({ nodes: main.querySelectorAll('pre.mermaid') }).catch(e => console.error(e));
    const t = anchor && (document.getElementById(anchor) || main.querySelector(`a[name="${CSS.escape(anchor)}"]`));
    if (t) t.scrollIntoView(); else window.scrollTo(0, 0);
    document.title = `${cur && cur.title ? cur.title + ' · ' : ''}${HB.kb.title} · 手冊`;
  }

  function home() {
    const who = HB.kb.maintainers.map(esc).join('、') || '（還沒有）';
    const big = HB.kb.bigpicture ? `<h2>全景圖</h2><pre class="mermaid">${esc(HB.kb.bigpicture)}</pre>` : '';
    const parts = HB.parts.map(p => `<h3>${esc(p.title)}</h3>` + (p.chapters.length
      ? p.chapters.map(c => `<a class="card" href="#/c/${c.slug}"><b>${esc(c.title)}</b>${c.overview ? `<span>${esc(c.overview)}</span>` : ''}</a>`).join('')
      : '<p class="muted">這個部分還沒有內容。</p>')).join('');
    show(`<h1>${esc(HB.kb.title)}</h1><p class="lead">${esc(HB.kb.intro)}</p><p class="muted">維護者：${who}</p>${big}<h2>各章速覽</h2>${parts}`, 'home');
  }

  function chapter(c, anchor) {
    const i = chapters.indexOf(c), prev = chapters[i - 1], next = chapters[i + 1];
    const pager = `<nav class="pager">${prev ? `<a href="#/c/${prev.slug}">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#/c/${next.slug}">${esc(next.title)} →</a>` : ''}</nav>`;
    show(`<div class="crumb">${esc(c.part.title)}</div>${md.render(c.md)}${pager}`, c, anchor);
  }

  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    // 同一頁裡的錨點（例如出處註腳）：直接捲過去
    const here = h && (document.getElementById(h) || $('#main').querySelector(`a[name="${CSS.escape(h)}"]`));
    if (here && !owner[h]) { here.scrollIntoView(); return; }
    if (h.startsWith('/c/')) { const c = chapters.find(x => x.slug === h.slice(3)); if (c) return chapter(c); }
    if (h === '/terms') return show(md.render(HB.terms || '# 術語表\n\n（還沒有術語。）'), 'terms');
    if (owner[h]) return chapter(owner[h], h);
    home();
  }

  window.addEventListener('hashchange', route);
  route();
})();
