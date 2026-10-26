/* 入口網站：依角色分三頁（網址 #learn、#contribute、#review）。每一頁上面是一條流程時間軸（點一站看示意動畫），下面是卡片。
   新人（#learn）：「怎麼學」五站和搜尋；下面依序是知識庫卡片、
   學習路徑（每章一張圖示卡片：速覽、看了多少、先修和深入；點了翻面看細節）、收起來的全景圖、主題索引、角色路徑（有才顯示）；
   建置日期、維護者放在頁尾。給開發者看的東西（修改紀錄、頁 id、檔案路徑）不放上來。
   章的圖示寫在章檔開頭的「- 圖示：」，圖示本身在 icons.js（window.KIF_ICONS）；沒寫就顯示章的編號。
   傳承者（#contribute）：「一筆知識怎麼進來」七站、可以做的事（動作卡片，翻面看跟 Agent 怎麼說）、現在可以做的事（還沒附出處的頁、待回答和勘誤的連結）。
   維護者（#review）：「審核一個變更提案」六站、要做的事（動作卡片；框架維護者的事放最後）。
   資料由 build.py 放在 window.PORTAL：{ built, commit, latest, kbs: [{name, title, intro, maintainers, deck, sections, pages, minutes, deep, parts,
   path: [{key, part, chap, name, pages, minutes, deep, deepMinutes, last, overview, icon, pre: [[知識庫, key, 章名]]}], topics: [{zh, en, desc, pages: [[頁 id, 標題, 是不是深入頁]]}],
   updated, todo: [[頁 id, 標題, 章名, 沒出處的那一句, 是不是深入頁]], issues: {待回答: 網址, 勘誤: 網址}}], roles: [{name, intro, steps: [[知識庫, 頁 id, 說明]]}], index: [[種類, 知識庫, id, 標題, 內文]] }
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
  let chapSel = null, topicSel = 0, allTopics = false;   // 學習路徑翻面的章（第幾組）、主題索引選到的術語、術語全部列出來了沒
  const ICONS = window.KIF_ICONS || {};
  const icon = (n, size = 24) => `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${ICONS[n] || ''}"/></svg>`;
  const COLORS = ['#1f4fb5', '#b3541e', '#1f7a4d', '#6a4bb5', '#0e7490', '#a8660a'];   // 每個部分一個顏色
  const colorOf = (k, g) => COLORS[[...new Set(k.path.map(x => x.part))].indexOf(g.part) % COLORS.length];
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
      <p class="sub" style="margin-top:6px">綠色是看完的章，虛線是還沒有頁的章；<span class="lg-arrow">橘色箭頭</span>是先修：箭頭指向的章，建議先看完箭頭出發的那一章。點一章，翻開學習路徑上那一章的卡片。</p>`;
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
  /* ---------- 學習路徑：每章一張圖示卡片，照順序由左到右、由上到下。點卡片翻面看細節 ---------- */
  function preOf(k, g) {
    return (g.pre || []).map(([kb, key, name]) => ({ kb, key, name, done: chapDone(kb, key), far: kb !== k.name, title: (byName[kb] || {}).title || kb }));
  }
  function label(k, g) {   // 卡片上的章名：部分只有一段時拿掉「第一部分 · 」；部分的開頭那一段叫「導讀」
    if (g.chap) return g.name;
    const same = k.path.filter(x => x.part === g.part);
    if (same.length > 1) return same[0] === g ? '導讀' : g.name;
    return shortName(g.name);
  }
  const partOf = (k, g) => String(k.parts[g.part] || '').split(' · ')[0];
  const nextOf = (k, seen) => k.path.findIndex(g => g.pages.length && !rowState(k, g, seen).done);
  function face(k, g) {   // 圖示；沒寫圖示就顯示章的編號（導讀、開場這類顯示第一個字）
    return g.icon && ICONS[g.icon] ? icon(g.icon, 40) : `<span class="fb">${g.chap || esc(label(k, g).slice(0, 1))}</span>`;
  }
  function back(k, g, i) {
    const st = rowState(k, g, seenOf(k.name)), pre = preOf(k, g), miss = pre.filter(p => p.done === false);
    const preLink = p => p.far
      ? `<a href="${deckHref(p.kb, (groupsOf(byName[p.kb], p.key)[0] || {}).pages?.[0] || '')}" target="_blank" rel="noopener">${esc(p.title)} › ${esc(p.name)}</a>`
      : `<button type="button" class="lk" data-go="${k.path.findIndex(x => x.key === p.key)}">${esc(p.name)}</button>`;
    const preMark = p => p.done ? ' <span class="ok">✓</span>' : p.done === null ? ' <span class="m">（還沒有頁）</span>' : '';
    return `<div class="bk-h"><b>${esc(label(k, g))}</b><span class="m">${g.pages.length ? `${g.pages.length} 頁 · 約 ${hm(g.minutes)}` : '還沒有頁'}</span></div>
      ${g.overview ? `<p class="ov">${esc(g.overview)}</p>` : ''}
      ${pre.length ? `<p class="pre">先修：${pre.map(p => preLink(p) + preMark(p)).join('、')}</p>` : ''}
      ${miss.length ? `<p class="warn">建議先看完 ${miss.map(p => esc(p.name)).join('、')}；想先看這一章也可以直接打開。</p>` : ''}
      ${g.deep && g.deep.length ? `<p class="dp">另有 ${g.deep.length} 頁深入（選看，約 ${hm(g.deepMinutes)}）：在簡報上按「看深入」才看得到。</p>` : ''}
      <div class="acts">${g.pages.length ? `<a class="btn primary" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">${st.done ? '再看一次' : st.n ? '接著看這一章' : '打開這一章'}</a>`
        : '<span class="m">這一章還沒有頁；傳承者新增知識時，Agent 會一起做簡報頁。</span>'}<button type="button" class="lk turn" data-turn="${i}">翻回去</button></div>`;
  }
  function chapCard(k, g, i, seen, nx) {
    const st = rowState(k, g, seen), c = colorOf(k, g), pre = preOf(k, g), p = g.pages.length ? st.n / g.pages.length : 0;
    const cls = !g.pages.length ? ' empty' : st.done ? ' done' : st.part ? ' half' : '';
    return `<div class="cc${cls}${i === chapSel ? ' flip' : ''}" data-i="${i}" data-key="${g.key}" style="--c:${c}"><div class="cc-in">
      <button type="button" class="cc-f" data-i="${i}" aria-label="${esc(label(k, g))}：看細節">
        <span class="cc-pt">${esc(partOf(k, g))}${i === nx ? '<em class="cc-next">接著看</em>' : ''}</span>
        <span class="cc-ic">${face(k, g)}</span><b>${esc(label(k, g))}</b>
        ${g.overview ? `<span class="cc-ov">${esc(g.overview)}</span>` : ''}
        <span class="cc-ft">${g.pages.length ? `<span class="rg" title="${st.done ? '看完了' : `看了 ${st.n} / ${g.pages.length} 頁`}"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="v" cx="18" cy="18" r="15" stroke-dasharray="${(p * 94.2).toFixed(1)} 94.2"/></svg><i>${st.done ? '✓' : Math.round(p * 100) + '%'}</i></span>${g.pages.length} 頁 · ${hm(g.minutes)}` : '還沒有頁'}
          ${pre.length ? `<em title="先修：建議先看的章">先修 ${pre.length}</em>` : ''}${g.deep && g.deep.length ? `<em class="dp" title="深入：選看的補充說明">深入 ${g.deep.length}</em>` : ''}</span></button>
      <div class="cc-b">${i === chapSel ? back(k, g, i) : ''}</div></div></div>`;
  }
  function path() {
    const k = byName[sel];
    if (!k) return '';
    if (!k.path.length) return `<p class="empty">${esc(k.title)}還沒有簡報頁。傳承者新增第一筆知識時，Agent 會一起做簡報頁，這裡就會出現學習路徑。</p>`;
    const seen = seenOf(k.name), nx = nextOf(k, seen);
    const hasPre = k.path.some(g => (g.pre || []).length), hasDeep = k.path.some(g => g.deep && g.deep.length);
    const intro = k.deck
      ? `一張卡片是一章，照順序由左到右、由上到下；卡片上方的顏色是部分，圓圈是看了多少。點卡片翻面，看它在講什麼、再打開簡報。${hasPre ? '<b>先修</b>是建議先看完的章，沒看完也可以直接打開。' : ''}${hasDeep ? '<b>深入</b>是比較長的補充說明，平常翻頁不會經過，在簡報上按「看深入」才看得到。' : ''}`
      : '還沒有簡報頁；下面是規劃好的章，點卡片看它要講什麼。傳承者新增知識時，Agent 會一起做簡報頁。';
    return `<p class="sub">${intro}</p><div class="ccs">${k.path.map((g, i) => chapCard(k, g, i, seen, nx)).join('')}</div>`;
  }
  function turn(i) {   // 翻面不重畫整頁，翻的動畫才看得到
    const k = byName[sel];
    chapSel = i;
    document.querySelectorAll('#path .cc').forEach(c => { const on = +c.dataset.i === i; c.classList.toggle('flip', on); c.querySelector('.cc-b').innerHTML = on ? back(k, k.path[i], i) : ''; });
    document.querySelectorAll('#map .node').forEach(n => n.classList.toggle('on', +n.dataset.i === i));
    drawArrows();
  }

  /* ---------- 怎麼學：五站時間軸，點一站看示意動畫（畫面上的標題取自選到的知識庫） ---------- */
  const FLOW = [
    { k: 'pick', ic: 'map', t: '挑一個知識庫', d: '每張卡片是一個領域。點了，下面就換成它的學習路徑：照順序排好的每一章。' },
    { k: 'deck', ic: 'slides', t: '照順序看簡報', d: '一頁講一個概念，左邊的圖可以動手玩；按「旁白」聽這一頁的講解。' },
    { k: 'deep', ic: 'doc', t: '想多知道：看深入', d: '比較長的說明放在深入頁，平常翻頁不會經過；在主頁按「看深入」才進去。' },
    { k: 'ask', ic: 'chat', t: '看不懂：問 Agent', d: '按「問 Agent」複製這一頁的位置，貼到 Claude Code 接著問；答案一定附出處。' },
    { k: 'check', ic: 'check', t: '章末自我檢查', d: '每章最後有幾題，先自己想再打開答案；看完的章會打勾，下次接著看。' }
  ];
  const flowSel = { learn: null, contribute: null, review: null };   // 每一頁打開的那一站；null＝收著（第一次來、還沒有進度時，新人頁預設打開第一站）
  function sample(k) {   // 示意畫面用的文字：第一章的第一頁、有深入頁的那一章
    const T = id => ((P.index.find(x => x[1] === k.name && x[2] === id) || [])[3]) || '';
    const g1 = k.path.find(g => g.chap && g.pages.length) || k.path.find(g => g.pages.length);
    const gd = k.path.find(g => g.deep && g.deep.length);
    return { kb: k.title, ch: g1 ? shortName(g1.name).replace(/^[①-⑳]\s*/, '') : '第一章', page: (g1 && T(g1.pages[0])) || '第一頁的標題',
      main: (gd && T(gd.pages[0])) || '主頁的標題', deep: (gd && T(gd.deep[0])) || '深入頁的標題' };
  }
  function scene(key, x) {
    const other = (P.kbs.find(k => k.name !== sel) || {}).title || '其他知識庫';
    if (key === 'pick') return `<div class="mi mi-pick"><div class="mc"><b>${esc(x.kb)}</b><i></i><i></i></div><div class="mc"><b>${esc(other)}</b><i></i><i></i></div><div class="mi-path"><span></span><span></span><span></span><span></span></div></div>`;
    if (key === 'deck') return `<div class="mi mi-deck"><div class="sl"><div class="sl-h">${esc(x.page)}</div><div class="sl-b"><div class="sl-fig"><i></i></div><div class="sl-pts"><i></i><i></i><i></i></div></div>
      <div class="sl-btns"><span class="hot">旁白</span><span>看深入</span><span>問 Agent</span></div><div class="sl-narr">旁白：這一頁在講……</div></div><div class="mi-nav">◀　▶</div></div>`;
    if (key === 'deep') return `<div class="mi mi-deep"><div class="sl main"><div class="sl-h">${esc(x.main)}</div><div class="sl-b"><div class="sl-fig"><i></i></div><div class="sl-pts"><i></i><i></i></div></div><div class="sl-btns"><span>旁白</span><span class="hot">看深入</span><span>問 Agent</span></div></div>
      <div class="sl deep"><div class="sl-h">${esc(x.deep)} <em>深入</em></div><div class="sl-more">說明：推導、表格、出處都放在這裡……</div></div></div>`;
    if (key === 'ask') return `<div class="mi mi-ask"><div class="sl"><div class="sl-h">${esc(x.page)}</div><div class="sl-btns"><span>旁白</span><span>看深入</span><span class="hot">問 Agent</span></div><div class="toast">已複製這一頁的位置</div></div>
      <div class="term"><div class="t1">› 我在看〈${esc(x.kb)}〉簡報的〈${esc(x.page)}〉這一頁，想問：……</div><div class="t2">（Agent 根據簡報回答）……<br><span>出處：${esc(x.kb)} › 簡報 › ${esc(x.ch)} › 〈${esc(x.page)}〉</span></div></div></div>`;
    return `<div class="mi mi-check"><div class="sl"><div class="sl-h">自我檢查：${esc(x.ch)}</div><div class="qa"><b>第 1 題</b><span class="ans">答案：……<em>回到那一頁 ›</em></span></div><div class="qa"><b>第 2 題</b></div></div><div class="ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="v" cx="18" cy="18" r="15"/></svg><span>✓</span></div></div>`;
  }
  /* ---------- 傳承者、維護者：流程和示意畫面 ---------- */
  const C_FLOW = [
    { k: 'start', ic: 'inbox', t: '開工', d: '跟 Agent 說「有什麼我可以做的？」：列出待回答、勘誤，和還沒附出處的頁；說「我來回答 #12」就認領。' },
    { k: 'say', ic: 'chat', t: '跟 Agent 說', d: '用中文講你要做什麼：給一個主題請它研究、給檔案請它整理，或直接口述經驗。' },
    { k: 'draft', ic: 'doc', t: 'Agent 做草稿', d: '做成簡報頁，一頁講一個概念、每頁有圖；數字附出處，一頁放不下的建議做成深入頁。' },
    { k: 'confirm', ic: 'eye', t: '你確認', d: '在本機打開改過的頁看一遍，說得對不對由你判斷；改到你滿意才往下走。' },
    { k: 'check', ic: 'check', t: '檢查', d: '程式擋格式、引用和新寫的數字沒出處；再讓沒有背景的 Agent 讀一遍（讀者測試），看寫得清不清楚。' },
    { k: 'pr', ic: 'flag', t: '變更提案', d: 'Agent 開變更提案：寫好改了什麼、來歷（研究、整理、訪談）；回答 issue 時連到那個 issue。' },
    { k: 'merge', ic: 'star', t: '審核、合併', d: '維護者核准才合併；合併後入口網站自動更新，連到的 issue 自動關閉，提問的人收到通知。' }
  ];
  const R_FLOW = [
    { k: 'notify', ic: 'inbox', t: '收到通知', d: 'Git 主機通知你有變更提案要審；你自己開的提案，檢查過了可以自己合併。' },
    { k: 'summary', ic: 'chat', t: '請 Agent 整理', d: '輸入 /kb-review 或說「幫我審 #31」：Agent 用白話整理改了什麼、來歷和影響。' },
    { k: 'pages', ic: 'eye', t: '看改過的頁', d: 'Agent 在本機打開改過的簡報頁和深入頁：看圖、互動、說法和出處。' },
    { k: 'claims', ic: 'magnifier', t: '研究來的逐條看', d: '來歷是研究時，每個說法配上出處列出來，沒出處的數字特別標；Agent 說錯時語氣一樣肯定，你是最後一關。' },
    { k: 'decide', ic: 'check', t: '核准或退回', d: '對就核准合併；不對就退回，跟 Agent 說哪裡不對，它幫你寫成意見留在提案上。' },
    { k: 'release', ic: 'star', t: '入口網站更新', d: '合併後 CI 自動建置、發布新的入口網站，新人下次下載就是新的。' }
  ];
  const term = lines => `<div class="mi mi-term"><div class="tm">${lines.map(([who, t]) => `<div class="tl ${who}">${who === 'me' ? '› ' : ''}${t}</div>`).join('')}</div></div>`;
  const prCard = (title, tags, from, to, foot) => `<div class="mi mi-pr"><div class="prc"><div class="pr-h">${icon('flag', 16)}<b>${title}</b></div><div class="pr-tags">${tags.map(x => `<span>${x}</span>`).join('')}</div>
    <div class="pr-st"><span class="ci">CI ✓</span><span class="st0">${from}</span><span class="st1">${to}</span></div>${foot ? `<div class="pr-f">${foot}</div>` : ''}</div></div>`;
  const draftSlide = (tag, mark) => `<div class="sl"><div class="sl-h">新的一頁：標題就是重點${tag ? ` <em>${tag}</em>` : ''}</div><div class="sl-b"><div class="sl-fig"><i></i></div><div class="sl-pts"><i${mark ? ' class="mark"' : ''}></i><i></i><i></i></div></div><div class="sl-src">數字後面有出處小標號 ¹</div></div>`;
  function cScene(key) {
    const k = byName[sel] || { path: [] }, kb = esc(k.title || '這個知識庫'), ch = esc(sample(k).ch);
    if (key === 'start') return term([['me', '有什麼我可以做的？'], ['ai', '待回答 #12：這台機台多久保養一次？'], ['ai', '勘誤 #15：某一頁的倍數好像寫錯'], ['ai', `還沒附出處的頁：${(k.todo || []).length} 頁`], ['me', '我來回答 #12']]);
    if (key === 'say') return `<div class="mi mi-say"><div class="tm"><div class="tl me">› 幫我研究〈主題〉，放進〈${ch}〉那一章</div></div><div class="ways"><span class="hot">研究：給主題</span><span>整理：給檔案</span><span>訪談：用說的</span></div></div>`;
    if (key === 'draft') return `<div class="mi mi-draft">${draftSlide('草稿')}<div class="sl deep"><div class="sl-h">放不下的長說明 <em>深入</em></div><div class="sl-more">推導、表格、出處</div></div></div>`;
    if (key === 'confirm') return `<div class="mi mi-confirm"><div class="bar">本機預覽（還沒合併）</div>${draftSlide()}<div class="ok-b"><span class="hot">這樣可以</span><span>第二點改成……</span></div></div>`;
    if (key === 'check') return `<div class="mi mi-cl"><div class="cl"><div><i></i>格式、頁 id、引用都對</div><div><i></i>新寫的數字都有出處</div><div><i></i>每頁都有圖</div><div><i></i>讀者測試：3 / 3 題答對</div></div></div>`;
    if (key === 'pr') return prCard(`變更提案 #31：${kb}：新增〈主題〉`, ['來歷：研究', `kb:${esc(k.name || '')}`, 'Closes #12'], '檢查中', '等維護者審', '說明裡寫好改了什麼、來歷、讀者測試的結果');
    return prCard(`變更提案 #31：${kb}：新增〈主題〉`, ['來歷：研究', 'Closes #12'], '等維護者審', '已合併 ✓', '#12 自動關閉，提問的人收到通知；入口網站自動更新');
  }
  function rScene(key) {
    const k = byName[sel] || {}, kb = esc(k.title || '這個知識庫');
    if (key === 'notify') return `<div class="mi mi-note"><div class="nt">${icon('inbox', 22)}<span><b>有人請你審核變更提案 #31</b><br>${kb}：新增〈主題〉· 來歷：研究</span></div></div>`;
    if (key === 'summary') return term([['me', '幫我審 #31'], ['ai', '改了什麼：新增 2 頁、1 題自我檢查'], ['ai', '來歷：研究（要特別仔細看）'], ['ai', '影響：術語表多 1 個詞；讀者測試 3 / 3']]);
    if (key === 'pages') return `<div class="mi mi-confirm"><div class="bar">本機打開改過的頁（2 頁）</div>${draftSlide('', true)}</div>`;
    if (key === 'claims') return `<div class="mi mi-cl"><div class="cl"><div><i></i>說法一 ── 出處：論文</div><div><i></i>說法二 ── 出處：原廠文件</div><div class="bad"><i></i>說法三有數字，沒有出處</div></div></div>`;
    if (key === 'decide') return `<div class="mi mi-decide"><div class="ok-b"><span class="hot">核准合併</span><span>退回附意見</span></div><div class="cm">🤖 由 Agent 代〈你〉發出：說法三的數字請補出處，找不到就拿掉。</div></div>`;
    return `<div class="mi mi-note"><div class="nt">${icon('star', 22)}<span><b>入口網站與簡報：新版</b><br>portal.zip · 新人下次下載就是新的</span></div></div>`;
  }
  /* 動作卡片：正面是圖示和一句話；翻面看「跟 Agent 這樣說」（可以複製）、Agent 會做什麼、你要做什麼 */
  const C_ACTS = [
    { id: 'research', ic: 'magnifier', t: '研究新主題', d: '只給一個主題，Agent 查第一手來源，寫成簡報頁。', say: ['幫我研究〈主題〉，放進〈章名〉那一章'], agent: ['只查第一手來源，每個數字附出處', '做成簡報頁；一頁放不下，建議接一頁深入頁', '你確認後跑檢查和讀者測試，開變更提案，標「研究」'], you: '確認說得對；研究來的內容，維護者會特別仔細看。', cmd: '/kb-add' },
    { id: 'organize', ic: 'data', t: '整理現有資料', d: '給檔案、網址或舊簡報，Agent 整理成簡報頁。', say: ['把〈檔案或網址〉整理成〈章名〉的簡報頁'], agent: ['讀你給的資料；原檔不放進知識庫，只在出處寫它在哪裡', '照一頁一個概念重新寫，每頁配圖', '跑檢查和讀者測試，開變更提案，標「整理」'], you: '提供資料，確認整理得對。', cmd: '/kb-add' },
    { id: 'interview', ic: 'users', t: '訪談：用說的', d: '口述經驗就好，Agent 反問、寫成簡報頁。', say: ['我想記下〈某件事〉的經驗'], agent: ['一輪問完，每題附建議答案，你挑或改', '寫成簡報頁，出處寫「〈你的名字〉口述，年-月」', '你確認後開變更提案，標「訪談」'], you: '用說的回答。', cmd: '/kb-add' },
    { id: 'answer', ic: 'inbox', t: '回答待回答', d: '新人問倒了簡報，回答成一頁和一題自我檢查。', say: ['有什麼我可以回答的？', '我來回答 #12'], agent: ['把 issue 指派給你', '用訪談或研究寫成簡報頁，加一題自我檢查', '變更提案寫「Closes #12」，合併後 issue 自動關閉、提問的人收到通知'], you: '回答問題、確認草稿。', cmd: '/kb-add' },
    { id: 'edit', ic: 'doc', t: '修改一頁', d: '說哪一頁、要怎麼改。', say: ['〈頁標題〉的第二點要改成……'], agent: ['後面的深入頁、指向它的自我檢查一起看，說法要一致', '在本機打開改過的頁給你看', '跑檢查和讀者測試，開變更提案'], you: '確認改得對。', cmd: '/kb-change' },
    { id: 'delete', ic: 'layers', t: '刪除或合併', d: '刪掉一頁，或把兩頁合成一頁。', say: ['把〈頁〉和〈頁〉合併成一頁', '刪掉〈頁〉'], agent: ['列出所有引用：頁序、深入頁、自我檢查、術語表、頁碼引用', '在同一個變更提案裡一起改掉，不留舊 id', '刪掉的內容，Git 歷史找得回來'], you: '確認要刪、要合併的是對的。', cmd: '/kb-change' },
    { id: 'source', ic: 'book', t: '補出處', d: '舊的頁有數字還沒附出處，一頁一頁補。', say: ['〈頁標題〉的數字幫我補出處'], agent: ['找第一手來源，附上出處註腳', '找不到就改成不帶數字的說法，不編出處', '開變更提案'], you: '確認來源可靠；下面「現在可以做的事」列出還沒補的頁。', cmd: '/kb-change' },
    { id: 'fix', ic: 'shield', t: '修正勘誤', d: '有人覺得寫錯，查清楚再改。', say: ['修正勘誤 #15'], agent: ['讀勘誤裡的哪一頁、哪一句、依據', '修正那一句和相關的頁，出處一起補', '變更提案連到 #15，合併後自動關閉'], you: '判斷誰對；拿不準就問維護者。', cmd: '/kb-change' },
    { id: 'revise', ic: 'tool', t: '照維護者意見改', d: '提案被退回，照意見改完再送。', say: ['照維護者的意見改 #31'], agent: ['讀提案上的每一條意見', '逐條改、重跑檢查', '推上去，並在提案上回覆改了什麼'], you: '不同意的意見，跟 Agent 說，它幫你回覆。', cmd: '/kb-change' }
  ];
  const R_ACTS = [
    { id: 'review', ic: 'users', t: '審別人的提案', d: 'Agent 整理好，你判斷內容對不對。', say: ['幫我審 #31'], agent: ['用白話整理：改了什麼、來歷、影響範圍', '打開改過的簡報頁和深入頁', '你說核准，就合併'], you: '判斷說法對不對；格式和引用已經由程式擋過。', cmd: '/kb-review' },
    { id: 'research-r', ic: 'magnifier', t: '研究來的提案', d: '每個說法配出處，逐條看。', say: ['把研究來的說法和出處逐條列給我'], agent: ['結論、重點、數字卡、深入頁說明，每條配上出處', '沒有出處的數字特別標出來'], you: '特別仔細看：沒有人親身確認過，你是最後一關。', cmd: '/kb-review' },
    { id: 'reject', ic: 'chat', t: '退回附意見', d: '說哪裡不對，Agent 幫你寫成意見。', say: ['第二段的數字不對，請他補出處'], agent: ['把你的話整理成逐條意見', '留在提案上，第一行寫「🤖 由 Agent 代〈你〉發出」', '傳承者照意見改完會再送'], you: '說清楚哪裡不對、為什麼。', cmd: '/kb-review' },
    { id: 'self', ic: 'check', t: '自己的提案', d: '檢查過了，自己合併。', say: ['開變更提案，檢查過了就合併'], agent: ['開提案、等 CI 檢查通過', '把研究來的段落列出來，讓你多看一眼', '你說好就合併'], you: '多看一眼研究來的段落。', cmd: '/kb-review' },
    { id: 'newkb', ic: 'stack', t: '核准新知識庫', who: '框架維護者', d: '有人想開新領域，先看骨架。', say: ['幫我看〈新知識庫〉的骨架提案'], agent: ['整理骨架：部分和章、每章的速覽和圖示、維護者、術語表', '核准合併後，首頁和入口網站自動多一個知識庫'], you: '確認範圍和維護者合理；發起人輸入 /kb-new 開始。', cmd: '/kb-review' },
    { id: 'rule', ic: 'gear', t: '改框架、加規則', who: '框架維護者', d: '同一個錯出現第二次，才考慮加規則。', say: ['這個錯出現第二次了，要不要加規則？'], agent: ['先看能不能用程式檢查；能，就加進檢查程式', '不能，才寫進 AGENTS.md', '跑情境測試，和改之前比較'], you: '核准規則和引擎的修改；還沒發生過的錯，不預先加規則。', cmd: '/kb-review' }
  ];
  const acSel = { contribute: null, review: null };
  function actBack(a) {
    return `<div class="bk-h"><b>${a.t}</b></div>
      <div class="say"><small>跟 Agent 這樣說</small>${a.say.map(x => `<button type="button" class="sayb" data-copy="${esc(x)}">「${esc(x)}」<span>複製</span></button>`).join('')}</div>
      <div class="dos"><small>Agent 會做</small><ol>${a.agent.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>
      <div class="dos"><small>你要做</small><p>${esc(a.you)}</p></div>
      <div class="acts"><span class="m">短指令 <code>${a.cmd}</code>，不用也可以</span><button type="button" class="lk turn" data-unac="1">翻回去</button></div>`;
  }
  function actCards(name, list) {
    return `<div class="ccs">${list.map(a => `<div class="cc ac${acSel[name] === a.id ? ' flip' : ''}" data-ac="${a.id}" style="--c:${a.who ? '#6a4bb5' : name === 'review' ? '#1f7a4d' : '#1f4fb5'}"><div class="cc-in">
      <button type="button" class="cc-f" data-ac="${a.id}" aria-label="${a.t}：看怎麼做"><span class="cc-pt">${a.who || (name === 'review' ? '維護者' : '傳承者')}</span>
        <span class="cc-ic">${icon(a.ic, 40)}</span><b>${a.t}</b><span class="cc-ov">${a.d}</span><span class="cc-ft"><code>${a.cmd}</code>點了看怎麼說</span></button>
      <div class="cc-b">${acSel[name] === a.id ? actBack(a) : ''}</div></div></div>`).join('')}</div>`;
  }
  function flipAct(name, id) {   // 翻面不重畫整頁，翻的動畫才看得到
    const list = name === 'review' ? R_ACTS : C_ACTS;
    acSel[name] = id;
    document.querySelectorAll(`#acts-${name} .ac`).forEach(c => { const on = c.dataset.ac === id; c.classList.toggle('flip', on); c.querySelector('.cc-b').innerHTML = on ? actBack(list.find(a => a.id === id)) : ''; });
  }
  const todoAll = {};   // 「還有 N 頁」按過的知識庫
  function todo() {
    return P.kbs.filter(k => k.deck).map(k => {
      const list = k.todo || [], shown = todoAll[k.name] ? list : list.slice(0, 6), iss = k.issues || {};
      return `<div class="td"><div class="td-h"><b>${esc(k.title)}</b><span>${iss['待回答'] ? `<a class="btn" href="${iss['待回答']}" target="_blank" rel="noopener">待回答</a>` : ''}${iss['勘誤'] ? `<a class="btn" href="${iss['勘誤']}" target="_blank" rel="noopener">勘誤</a>` : ''}</span></div>
        ${list.length ? `<p class="sub">有 ${list.length} 頁的數字還沒附出處。點一頁打開來看，再跟 Agent 說「〈頁標題〉的數字幫我補出處」。</p>
          <div class="tp">${shown.map(([id, title, ch, snip, deep]) => `<a class="row" href="${deckHref(k.name, id)}" target="_blank" rel="noopener"><span class="tg">${deep ? '深入' : '簡報頁'}</span><span class="nm">${esc(title)}<small>${esc(ch)} · ${esc(snip)}</small></span></a>`).join('')}</div>
          ${list.length > shown.length ? `<button type="button" class="chip more" data-todo="${k.name}">還有 ${list.length - shown.length} 頁 ▾</button>` : ''}` : '<p class="sub">每一頁的數字都有出處了。</p>'}</div>`;
    }).join('') + '<p class="sub">待回答、勘誤是 Git 主機上的 issue。也可以直接跟 Agent 說「有什麼我可以做的？」，它會一起列出來。</p>';
  }

  /* ---------- 三頁共用：流程時間軸、分頁、複製 ---------- */
  const FLOWS = { learn: [FLOW, key => scene(key, sample(byName[sel]))], contribute: [C_FLOW, cScene], review: [R_FLOW, rScene] };
  function renderFlow(name) {
    const [steps, sceneOf] = FLOWS[name], cur = flowSel[name], el = $(`#flow-${name}`);
    el.innerHTML = `<div class="fl-line" style="--n:${steps.length}">${steps.map((f, i) => `<button type="button" class="fl-st${i === cur ? ' on' : ''}" data-f="${i}" aria-expanded="${i === cur}"><span class="fl-dot">${icon(f.ic, 26)}</span><b>${i + 1}. ${f.t}</b></button>`).join('')}<i class="fl-run" aria-hidden="true"></i></div>
      ${cur == null ? '<p class="fl-hint">點一站，看這一步在畫面上長什麼樣子。</p>' : `<div class="fl-show"><div class="fl-scene">${sceneOf(steps[cur].k)}</div>
        <div class="fl-txt"><b>${cur + 1}. ${steps[cur].t}</b><p>${steps[cur].d}</p>
          <div class="acts"><button type="button" class="btn" data-fs="-1">上一步</button><button type="button" class="btn primary" data-fs="1">${cur === steps.length - 1 ? '收起來' : '下一步'}</button></div></div></div>`}`;
    const mi = el.querySelector('.mi'); if (mi) setTimeout(() => mi.classList.add('go'), 350);
  }
  const TABS = [['learn', '新人：怎麼學', 'book'], ['contribute', '傳承者：新增和修改', 'doc'], ['review', '維護者：審核', 'shield']];
  let tab = TABS.some(t => t[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'learn';
  function showTab(t) {
    tab = t;
    document.querySelectorAll('[data-tab]').forEach(el => { el.hidden = el.dataset.tab !== t; });
    document.querySelectorAll('.tab').forEach(b => { b.classList.toggle('on', b.dataset.t === t); b.setAttribute('aria-selected', b.dataset.t === t); });
    try { if (location.hash.slice(1) !== t) history.replaceState(null, '', '#' + t); } catch (e) { /* 只是記在網址上，失敗也照常切換 */ }
    renderFlow(t);
    if (t === 'contribute') { $('#acts-contribute').innerHTML = actCards('contribute', C_ACTS); $('#todo').innerHTML = todo(); }
    if (t === 'review') $('#acts-review').innerHTML = actCards('review', R_ACTS);
    if (t === 'learn') drawArrows();
  }
  function copy(text, done) {
    const fallback = () => { const a = document.createElement('textarea'); a.value = text; a.style.position = 'fixed'; a.style.opacity = '0'; document.body.appendChild(a); a.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { ok = false; } a.remove(); done(ok); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback); else fallback();
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
    if (k && chapSel != null && !k.path[chapSel]) chapSel = null;
    $('#path-h').textContent = k ? `學習路徑：${k.title}` : '學習路徑';
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
      <nav class="tabs" role="tablist" aria-label="依角色">${TABS.map(([k, n, ic]) => `<button type="button" class="tab" role="tab" data-t="${k}">${icon(ic, 20)}${n}</button>`).join('')}</nav>
      <div data-tab="learn">
        <p class="lead">老手的經驗，整理成一份份簡報。第一次來，先看看怎麼學：</p>
        <div id="flow-learn" class="flow"></div>
        <label class="search"><span>搜尋</span><input id="q" type="search" placeholder="找一個詞，例如 EUV、穿隧、OCD" autocomplete="off"></label>
        <div id="hits"></div>
      </div>
      <div data-tab="contribute" hidden>
        <p class="lead">把你的經驗交給 Agent 寫成簡報頁：你只要講中文，Agent 做草稿、跑檢查、開變更提案；維護者核准後才算數。一筆知識這樣進來：</p>
        <div id="flow-contribute" class="flow"></div>
      </div>
      <div data-tab="review" hidden>
        <p class="lead">維護者決定哪些內容算正式。Agent 幫你整理改了什麼、打開改過的頁、逐條列出處；說法對不對，由你判斷。審核一個變更提案：</p>
        <div id="flow-review" class="flow"></div>
      </div>
    </div></header>
    <main class="wrap">
      <div data-tab="learn">
        <section><h2>挑一個知識庫</h2><div id="cards" class="cards"></div></section>
        <section><div class="h2row"><h2 id="path-h">學習路徑</h2><span id="path-n"></span></div><div id="path"></div>
          <details id="mapbox" class="mapbox"><summary>看章節關係圖（全景圖）：每個部分有哪些章、哪一章建議先看</summary><div id="map"></div></details></section>
        <section id="topics-s"><h2 id="topics-h">主題索引</h2><div id="topics"></div></section>
        <section id="roles-s"><h2>角色路徑</h2><div id="roles"></div></section>
      </div>
      <div data-tab="contribute" hidden>
        <section><h2>你可以做的事</h2><p class="sub">點卡片翻面：跟 Agent 怎麼說（可以複製）、Agent 會做什麼、你要做什麼。</p><div id="acts-contribute"></div></section>
        <section><h2>現在可以做的事</h2><div id="todo"></div></section>
      </div>
      <div data-tab="review" hidden>
        <section><h2>你要做的事</h2><p class="sub">點卡片翻面：跟 Agent 怎麼說（可以複製）、Agent 會做什麼、你要做什麼。最後兩張是框架維護者的事。</p><div id="acts-review"></div></section>
      </div>
    </main>
    <footer class="foot"><div class="wrap" id="foot"></div></footer>`;
  let t = null;
  $('#q').addEventListener('input', e => { clearTimeout(t); t = setTimeout(() => { $('#hits').innerHTML = search(e.target.value.trim()); }, 120); });
  $('#cards').addEventListener('click', e => { const b = e.target.closest('.pick'); if (b && b.dataset.kb !== sel) { sel = b.dataset.kb; chapSel = null; topicSel = 0; allTopics = false; render(); renderFlow('learn'); } });
  const openCard = i => { turn(i); document.querySelector(`.cc[data-i="${i}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
  $('#path').addEventListener('click', e => {
    const g = e.target.closest('[data-go]'); if (g) { if (+g.dataset.go >= 0) openCard(+g.dataset.go); return; }
    const tb = e.target.closest('[data-turn]'); if (tb) { chapSel = null; document.querySelectorAll('.cc.flip').forEach(c => c.classList.remove('flip')); return; }
    const f = e.target.closest('.cc-f'); if (f) turn(+f.dataset.i);
  });
  $('#map').addEventListener('click', e => { const b = e.target.closest('.node'); if (b) openCard(+b.dataset.i); });
  document.querySelectorAll('.flow').forEach(el => el.addEventListener('click', e => {   // 三頁的流程時間軸
    const name = el.id.replace('flow-', ''), n = FLOWS[name][0].length;
    const s = e.target.closest('[data-f]'); if (s) { flowSel[name] = +s.dataset.f === flowSel[name] ? null : +s.dataset.f; renderFlow(name); return; }
    const b = e.target.closest('[data-fs]'); if (b) { const j = flowSel[name] + +b.dataset.fs; flowSel[name] = j < 0 ? 0 : j >= n ? null : j; renderFlow(name); }
  }));
  $('.tabs').addEventListener('click', e => { const b = e.target.closest('.tab'); if (b) showTab(b.dataset.t); });
  window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h !== tab && TABS.some(x => x[0] === h)) showTab(h); });
  ['contribute', 'review'].forEach(name => $(`#acts-${name}`).addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy, ok => { const sp = c.querySelector('span'); sp.textContent = ok ? '已複製' : '請自己選取'; setTimeout(() => { sp.textContent = '複製'; }, 1600); }); return; }
    if (e.target.closest('[data-unac]')) { acSel[name] = null; document.querySelectorAll(`#acts-${name} .ac.flip`).forEach(x => x.classList.remove('flip')); return; }
    const f = e.target.closest('.cc-f'); if (f) flipAct(name, f.dataset.ac);
  }));
  $('#todo').addEventListener('click', e => { const b = e.target.closest('[data-todo]'); if (b) { todoAll[b.dataset.todo] = true; $('#todo').innerHTML = todo(); } });
  $('#mapbox').addEventListener('toggle', drawArrows);
  $('#topics').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { topicSel = +b.dataset.t; render(); return; } if (e.target.closest('[data-all]')) { allTopics = true; render(); } });
  window.addEventListener('resize', drawArrows);
  // 從簡報回到這一頁時，重新讀進度
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
  window.addEventListener('focus', render);
  window.addEventListener('storage', render);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { chapSel = null; acSel.contribute = acSel.review = null; document.querySelectorAll('.cc.flip').forEach(c => c.classList.remove('flip')); } });
  // 第一次來（每個知識庫都還沒有進度）：「怎麼學」預設打開第一站
  if (P.kbs.every(k => !seenOf(k.name).size)) flowSel.learn = 0;
  render();
  showTab(tab);
})();
