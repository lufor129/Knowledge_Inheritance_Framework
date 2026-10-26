/* PROTOTYPE（用完就丟，不進主線）：入口網站用圖示與互動講「學習流程」和「各主題（章）」。三種做法，?variant=A|B|C 切換：
   A 路線圖：學習流程是一條五站的時間軸，點一站看示意動畫；各章畫成一條捷運路線，每個部分一個顏色，點一站畫出它的先修。
   B 示範影片＋卡片牆：學習流程是一段自己會播的操作示範（游標點按鈕）；各章是圖示卡片，點了翻面看速覽。
   C 循環＋故事卡：學習流程畫成一個循環（看 → 卡住 → 問 → 沒寫就記下來 → 老手補上）；各章一次看一張大卡，下面一排小圖示是整條路。
   資料和正式的入口網站一樣（window.PORTAL）；章的圖示先用章名猜，正式版再決定怎麼指定。 */
(function () {
  const P = window.PORTAL;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const hm = m => m >= 60 ? `${Math.floor(m / 60)} 小時${m % 60 ? ` ${Math.round(m % 60)} 分` : ''}` : `${Math.round(m)} 分`;
  const byName = Object.fromEntries(P.kbs.map(k => [k.name, k]));
  const VARIANTS = [['A', '路線圖'], ['B', '示範影片＋卡片牆'], ['C', '循環＋故事卡']];
  const q = new URLSearchParams(location.search);
  let variant = VARIANTS.some(v => v[0] === q.get('variant')) ? q.get('variant') : 'A';
  let sel = (P.kbs.find(k => k.deck) || P.kbs[0]).name, chapSel = null, fake = false, flowSel = 0;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

  /* ---------- 圖示（24×24 線條） ---------- */
  const ICONS = {
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14', slides: 'M3 5h18v12H3zM8 21h8M12 17v4', doc: 'M6 3h9l4 4v14H6zM15 3v4h4M9 11h7M9 15h7',
    chat: 'M4 5h16v10H9l-5 4z', check: 'M5 12l4 4 10-10', flag: 'M5 21V4M5 4h11l-2 4 2 4H5', book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5',
    light: 'M12 2v3M5 5l2 2M19 5l-2 2M8 14a4 4 0 1 1 8 0c0 1.5-1 2.5-1.5 3.5h-5C9 16.5 8 15.5 8 14zM10 21h4', shovel: 'M14 4l6 6M17 7l-8 8M7 13l4 4-3 3-4-4z',
    layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5M2 17l10 5 10-5', dots: 'M6 6h.01M12 6h.01M18 6h.01M6 12h.01M12 12h.01M18 12h.01M6 18h.01M12 18h.01M18 18h.01',
    gate: 'M4 20V8h16v12M8 20v-8h8v8M2 20h20', flat: 'M3 17h18M5 13h14l-2-4H7zM12 4v5', gaa: 'M4 9h16M4 15h16M8 6v12M16 6v12',
    sim: 'M3 4h18v12H3zM8 20h8M7 12l3-3 2 2 4-4', magnifier: 'M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM20 20l-5.5-5.5', factory: 'M3 21V10l6 4V10l6 4V6l6 4v11zM7 17h2M12 17h2M17 17h2',
    chip: 'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4', star: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
    stack: 'M6 4h12v4H6zM4 10h16v4H4zM6 16h12v4H6z', camera: 'M4 8h4l2-3h4l2 3h4v11H4zM12 10a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', net: 'M5 6l7 3M5 12l7-3M5 12l7 3M5 18l7-3M12 9l7 3M12 15l7-3M5 6h.01M5 12h.01M5 18h.01M12 9h.01M12 15h.01M19 12h.01',
    box: 'M4 4h7v7H4zM13 13h7v7h-7zM13 4h7v7h-7z', data: 'M12 4c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    chart: 'M4 20V4M4 20h16M7 15l4-5 3 3 5-7', tool: 'M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 1-2-2z', inbox: 'M3 13l3-8h12l3 8v6H3zM3 13h5l1 2h6l1-2h5'
  };
  const icon = (n, size = 24, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${ICONS[n] || ICONS.book}"/></svg>`;
  const KEYS = [[/製造|導讀/, 'map'], [/微影|光罩/, 'light'], [/蝕刻/, 'shovel'], [/沉積/, 'layers'], [/摻雜|磊晶/, 'dots'], [/閘極/, 'gate'], [/平坦/, 'flat'], [/環繞/, 'gaa'],
    [/模擬/, 'sim'], [/檢測|量測/, 'magnifier'], [/量產/, 'factory'], [/開場|結尾/, 'flag'], [/演進|現況/, 'chip'], [/總整理/, 'star'], [/摩爾|封裝/, 'stack'],
    [/相機|影像形成/, 'camera'], [/影像處理/, 'eye'], [/特徵|比對|卷積|Transformer/, 'net'], [/分類|偵測|分割/, 'box'], [/3D|深度/, 'stack'], [/影片|追蹤/, 'camera'],
    [/資料集|標註/, 'data'], [/訓練|評估/, 'chart'], [/壓縮|部署/, 'tool']];
  const iconOf = g => (KEYS.find(([re]) => re.test(g.name)) || [0, 'book'])[1];
  const COLORS = ['#1f4fb5', '#b3541e', '#1f7a4d', '#6a4bb5', '#0e7490', '#a8660a'];
  const colorOf = (k, g) => COLORS[[...new Set(k.path.map(x => x.part))].indexOf(g.part) % COLORS.length];

  /* ---------- 資料：進度、章名、細節 ---------- */
  function seenOf(k) {
    if (fake && k.name === sel) {   // 示範進度：前三章看完、第四章看一半
      const s = new Set(); k.path.slice(0, 3).forEach(g => g.pages.forEach(id => s.add(id)));
      const g4 = k.path[3]; if (g4) g4.pages.slice(0, Math.ceil(g4.pages.length / 2)).forEach(id => s.add(id));
      return s;
    }
    try { return new Set(JSON.parse(localStorage.getItem(`kif.${k.name}.seen`) || '[]')); } catch (e) { return new Set(); }
  }
  const stateOf = (g, seen) => { const n = g.pages.filter(id => seen.has(id)).length; return { n, done: g.pages.length > 0 && n === g.pages.length, half: n > 0 && n < g.pages.length, empty: !g.pages.length, next: g.pages.find(id => !seen.has(id)) || g.pages[0] }; };
  const deckHref = (kb, id) => `${kb}/deck.html${id ? '#' + encodeURIComponent(id) : ''}`;
  function label(k, g) {
    if (g.chap) return g.name;
    const same = k.path.filter(x => x.part === g.part);
    if (same.length > 1) return same[0] === g ? '導讀' : g.name;
    return g.name.replace(/^第.+?部分\s*·\s*/, '');
  }
  const short = (k, g) => label(k, g).replace(/^[①-⑳]\s*/, '');
  const nextIdx = (k, seen) => { const i = k.path.findIndex(g => g.pages.length && !stateOf(g, seen).done); return i < 0 ? 0 : i; };
  const partName = (k, g) => String(k.parts[g.part] || '').split(' · ')[0];
  function preOf(k, g) {
    return (g.pre || []).map(([kb, key, name]) => {
      const kk = byName[kb], gs = kk ? kk.path.filter(x => x.key === key) : [], s2 = kk ? seenOf(kk) : new Set();
      const done = gs.some(x => x.pages.length) ? gs.every(x => x.pages.every(id => s2.has(id))) : null;
      return { name: kb !== k.name ? `${kk ? kk.title : kb} › ${name}` : name, done, i: kb === k.name ? k.path.findIndex(x => x.key === key) : -1 };
    });
  }
  function detail(k, g) {
    const st = stateOf(g, seenOf(k)), pre = preOf(k, g);
    return `<div class="dt" style="--c:${colorOf(k, g)}">
      <div class="dt-h"><span class="dt-ic">${icon(iconOf(g), 30)}</span><div><small>${esc(partName(k, g))}</small><b>${esc(label(k, g))}</b>
        <span>${g.pages.length ? `${g.pages.length} 頁 · 約 ${hm(g.minutes)}` : '還沒有頁'}${g.deep && g.deep.length ? ` · 另有 ${g.deep.length} 頁深入（選看）` : ''}${st.done ? ' · ✓ 看完了' : st.half ? ` · 看了 ${st.n} 頁` : ''}</span></div></div>
      ${g.overview ? `<p>${esc(g.overview)}</p>` : ''}
      ${pre.length ? `<p class="dt-pre">先修（建議先看）：${pre.map(p => `<span class="${p.done ? 'ok' : p.done === false ? 'no' : ''}">${esc(p.name)}${p.done ? ' ✓' : p.done === false ? '（還沒看完）' : ''}</span>`).join('、')}</p>` : ''}
      ${g.pages.length ? `<a class="btn primary" href="${deckHref(k.name, st.next)}" target="_blank" rel="noopener">${st.done ? '再看一次' : st.n ? '接著看這一章' : '打開這一章'}</a>` : '<p class="dt-empty">這一章還沒有頁；傳承者新增知識時，Agent 會一起做簡報頁。</p>'}
    </div>`;
  }

  /* ---------- 學習流程：每一步的內容和示意畫面 ---------- */
  const FLOW = [
    { k: 'pick', ic: 'map', t: '挑一個知識庫', d: '每張卡片是一個領域。點了，就看到它的學習路徑：照順序排好的每一章。' },
    { k: 'deck', ic: 'slides', t: '照順序看簡報', d: '一頁講一個概念，左邊的圖可以動手玩；按「旁白」聽這一頁的講解。' },
    { k: 'deep', ic: 'doc', t: '想多知道：看深入', d: '比較長的說明放在深入頁，平常翻頁不會經過；在主頁按「看深入」才進去。' },
    { k: 'ask', ic: 'chat', t: '看不懂：問 Agent', d: '按「問 Agent」複製這一頁的位置，貼到 Claude Code 接著問；答案一定附出處。' },
    { k: 'check', ic: 'check', t: '章末自我檢查', d: '每章最後有幾題，先自己想再打開答案；看完的章會打勾，下次接著看。' }
  ];
  // 示意畫面：每一步一個小動畫，加上 .go 之後播放（CSS 轉場）
  function scene(k) {
    if (k === 'pick') return `<div class="mi mi-pick"><div class="mc tgt"><b>半導體製程</b><i></i><i></i></div><div class="mc"><b>電腦視覺</b><i></i><i></i></div><div class="mi-path"><span></span><span></span><span></span><span></span></div></div>`;
    if (k === 'deck') return `<div class="mi mi-deck"><div class="sl"><div class="sl-h">OPC：光罩要故意畫歪</div><div class="sl-b"><div class="sl-fig"><i></i></div><div class="sl-pts"><i></i><i></i><i></i></div></div>
      <div class="sl-btns"><span class="hot tgt">旁白</span><span>看深入</span><span>問 Agent</span></div><div class="sl-narr">旁白：光太細時會繞射，印出來的角會變圓……</div></div><div class="mi-nav">◀　▶</div></div>`;
    if (k === 'deep') return `<div class="mi mi-deep"><div class="sl main"><div class="sl-h">絕緣牆的兩難</div><div class="sl-b"><div class="sl-fig"><i></i></div><div class="sl-pts"><i></i><i></i></div></div><div class="sl-btns"><span>旁白</span><span class="hot tgt">看深入（4 頁）</span><span>問 Agent</span></div></div>
      <div class="sl deep"><div class="sl-h">換成二氧化鉿 <em>深入</em></div><div class="sl-more">說明：既然二氧化矽不能再薄，解法就是換材料……<br>表格、推導、出處都在這裡</div></div></div>`;
    if (k === 'ask') return `<div class="mi mi-ask"><div class="sl"><div class="sl-h">OPC：光罩要故意畫歪</div><div class="sl-btns"><span>旁白</span><span>看深入</span><span class="hot tgt">問 Agent</span></div><div class="toast">已複製這一頁的位置</div></div>
      <div class="term"><div class="t1">› 我在看〈半導體製程〉簡報的〈OPC〉這一頁，想問：為什麼要故意畫歪？</div><div class="t2">光在晶圓上會變形，所以光罩先畫成反方向的形狀……<br><span>出處：半導體製程 › 簡報 › 微影 › 〈OPC〉（litho6）</span></div></div></div>`;
    return `<div class="mi mi-check"><div class="sl"><div class="sl-h">自我檢查：① 微影</div><div class="qa tgt"><b>OPC 改的是什麼？</b><span class="ans">改的是光罩上的圖形，讓印出來的線條接近設計。<em>回到那一頁 ›</em></span></div><div class="qa"><b>EUV 的光從哪裡來？</b></div></div><div class="ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle class="v" cx="18" cy="18" r="15"/></svg><span>✓</span></div></div>`;
  }
  const play = el => { el.classList.remove('go'); void el.offsetWidth; later(() => el.classList.add('go'), 350); };

  /* ================= A 路線圖 ================= */
  function vA(k) {
    return `<section class="a-flow"><h2>怎麼學：五個步驟</h2>
        <div class="a-line">${FLOW.map((f, i) => `<button type="button" class="a-st${i === flowSel ? ' on' : ''}" data-f="${i}"><span class="a-dot">${icon(f.ic, 26)}</span><b>${i + 1}. ${f.t}</b></button>`).join('')}<i class="a-run"></i></div>
        <div class="a-show"><div class="a-scene" id="a-scene">${scene(FLOW[flowSel].k)}</div><div class="a-txt"><b>${FLOW[flowSel].t}</b><p>${FLOW[flowSel].d}</p>
          <div class="a-nav"><button type="button" class="btn" data-fs="-1">上一步</button><button type="button" class="btn primary" data-fs="1">下一步</button></div></div></div></section>
      <section class="a-map"><h2>各主題：${esc(k.title)}的路線圖</h2>
        <p class="sub">每一站是一章，顏色是部分；綠色實心是看完的站，<b class="pulse-t">閃的</b>是下一站。點一站，畫出它的<b>先修</b>（建議先看的章）和它在講什麼。</p>
        <div class="a-metro" id="a-metro"></div>
        <div class="a-detail" id="a-detail">${chapSel != null && k.path[chapSel] ? detail(k, k.path[chapSel]) : '<p class="sub">點路線上的一站。</p>'}</div></section>`;
  }
  function drawMetro(k) {
    const box = $('#a-metro'); if (!box) return;
    const seen = seenOf(k), nx = nextIdx(k, seen), W = Math.max(box.clientWidth, 560), pad = 56, step = 104;
    const per = Math.max(3, Math.floor((W - 2 * pad) / step) + 1), rowH = 132, n = k.path.length;
    const pos = k.path.map((g, i) => { const r = Math.floor(i / per), c = i % per; return [pad + c * step, 70 + r * rowH]; });
    const H = 70 + Math.ceil(n / per) * rowH - 20;
    let s = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
    for (let i = 0; i < n - 1; i++) {
      const [x1, y1] = pos[i], [x2, y2] = pos[i + 1], c = colorOf(k, k.path[i + 1]);
      const ym = (y1 + y2) / 2 + 4;   // 換排：往右一點、往下、回到最左邊、再往下接下一排（像文字換行）
      const d = y1 === y2 ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} Q${x1 + 34},${y1} ${x1 + 34},${y1 + 30} L${x1 + 34},${ym - 20} Q${x1 + 34},${ym} ${x1 + 14},${ym} L${x2 - 14},${ym} Q${x2 - 34},${ym} ${x2 - 34},${ym + 20} L${x2 - 34},${y2 - 30} Q${x2 - 34},${y2} ${x2},${y2}`;
      s += `<path d="${d}" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round" opacity="${stateOf(k.path[i + 1], seen).done || stateOf(k.path[i + 1], seen).half ? 1 : .35}"/>`;
    }
    const pre = chapSel != null && k.path[chapSel] ? preOf(k, k.path[chapSel]).filter(p => p.i >= 0) : [];
    pre.forEach(p => {   // 同一排：從上面拱過去；不同排：從上一排往下接
      const [x1, y1] = pos[p.i], [x2, y2] = pos[chapSel];
      const d = y1 === y2 ? `M${x1},${y1 - 22} C${x1},${y1 - 70} ${x2},${y2 - 70} ${x2},${y2 - 24}` : `M${x1},${y1 + 22} C${x1},${(y1 + y2) / 2 + 10} ${x2},${(y1 + y2) / 2 - 10} ${x2},${y2 - 24}`;
      s += `<path class="a-pre" d="${d}" marker-end="url(#a-ah)"/>`;
    });
    s += `<defs><marker id="a-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#b3541e"/></marker></defs>`;
    let lastPart = null;
    k.path.forEach((g, i) => {
      const [x, y] = pos[i], st = stateOf(g, seen), c = colorOf(k, g), on = i === chapSel, isPre = pre.some(p => p.i === i);
      if (g.part !== lastPart) { lastPart = g.part; s += `<g transform="translate(${x},${y - 44})"><rect x="-34" y="-11" width="68" height="20" rx="10" fill="${c}"/><text y="4" text-anchor="middle" class="a-pl">${esc(partName(k, g))}</text></g>`; }
      s += `<g class="a-stn${on ? ' on' : ''}${i === nx && !st.done ? ' next' : ''}" data-i="${i}" transform="translate(${x},${y})" tabindex="0" role="button" aria-label="${esc(label(k, g))}">
        ${i === nx && !st.done ? `<circle r="30" class="a-pulse" stroke="${c}"/>` : ''}
        <circle r="22" fill="${st.done ? c : '#fff'}" stroke="${isPre ? '#b3541e' : c}" stroke-width="${on || isPre ? 6 : 4}" ${st.empty ? 'stroke-dasharray="5 4"' : ''}/>
        <g transform="translate(-12,-12)" class="${st.done ? 'w' : ''}" style="color:${st.done ? '#fff' : c}">${icon(iconOf(g), 24)}</g>
        <text y="42" text-anchor="middle" class="a-lb">${esc(short(k, g).slice(0, 8))}</text>
        ${st.half ? `<text y="58" text-anchor="middle" class="a-sm">看了 ${st.n}/${g.pages.length}</text>` : ''}</g>`;
    });
    box.innerHTML = s + '</svg>';
  }

  /* ================= B 示範影片＋卡片牆 ================= */
  // 示範：游標移到畫面上標了 .tgt 的地方、按下去、畫面變化
  const DEMO = [
    { f: 0, tip: '點一張卡片，挑一個知識庫' },
    { f: 1, tip: '方向鍵翻頁；按「旁白」聽講解' },
    { f: 2, tip: '想多知道，按「看深入」' },
    { f: 3, tip: '看不懂，按「問 Agent」，貼到 Claude Code' },
    { f: 4, tip: '章末自我檢查：先想，再打開答案' }
  ];
  let demoI = 0, demoPlay = true;
  function vB(k) {
    const seen = seenOf(k);
    const ring = (st, g, c) => { const p = g.pages.length ? st.n / g.pages.length : 0; return `<span class="b-rg"><svg class="b-ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15"/><circle cx="18" cy="18" r="15" stroke="${c}" stroke-dasharray="${(p * 94.2).toFixed(1)} 94.2"/></svg><span class="b-pct">${st.done ? '✓' : Math.round(p * 100) + '%'}</span></span>`; };
    return `<section class="b-flow"><h2>第一次來？看一遍怎麼用（約 20 秒）</h2>
        <div class="b-player"><div class="b-screen" id="b-screen"></div>
          <ol class="b-steps">${DEMO.map((d, i) => `<li><button type="button" data-d="${i}" class="${i === demoI ? 'on' : ''}">${icon(FLOW[d.f].ic, 22)}<span><b>${FLOW[d.f].t}</b><small>${FLOW[d.f].d}</small></span></button></li>`).join('')}</ol>
          <div class="b-ctl"><button type="button" class="btn" id="b-pp">${demoPlay ? '❚❚ 暫停' : '▶ 播放'}</button><span id="b-tip"></span></div></div></section>
      <section><h2>各主題：${esc(k.title)}</h2><p class="sub">一張卡片是一章，照順序由左到右、由上到下；卡片上方的顏色是部分。圓圈是看了多少；點卡片翻面，看它在講什麼、要不要先看別章。</p>
          <div class="b-grid">${k.path.map((g, i) => { const st = stateOf(g, seen), cc = colorOf(k, g), pre = preOf(k, g);
            return `<div class="b-card${i === chapSel ? ' flip' : ''}${st.empty ? ' empty' : ''}" data-i="${i}" style="--c:${cc}"><div class="b-in">
              <button type="button" class="b-front" data-i="${i}"><small class="b-pt">${esc(partName(k, g))}</small><span class="b-ic" style="color:${cc}">${icon(iconOf(g), 40)}</span>
                <b>${esc(label(k, g))}</b><span class="b-ov">${esc(g.overview || '')}</span>
                <span class="b-ft">${ring(st, g, cc)}<span>${g.pages.length ? `${g.pages.length} 頁 · ${hm(g.minutes)}` : '還沒有頁'}</span>${pre.length ? `<em title="先修：建議先看的章">先修 ${pre.length}</em>` : ''}${g.deep && g.deep.length ? `<em class="dp">深入 ${g.deep.length}</em>` : ''}</span></button>
              <div class="b-back">${i === chapSel ? detail(k, g) : ''}<button type="button" class="b-close" data-i="${i}">翻回去</button></div></div></div>`; }).join('')}</div></section>`;
  }
  function runDemo() {
    const scr = $('#b-screen'); if (!scr) return;
    const d = DEMO[demoI];
    scr.innerHTML = scene(FLOW[d.f].k) + '<i class="cur"></i>';
    $$('.b-steps button').forEach((b, i) => b.classList.toggle('on', i === demoI));
    $('#b-tip').textContent = d.tip;
    const cur = $('.cur', scr); cur.style.left = '50%'; cur.style.top = '110%';
    later(() => { const t = $('.tgt', scr).getBoundingClientRect(), r = scr.getBoundingClientRect(); cur.style.left = (t.left + t.width * .6 - r.left) + 'px'; cur.style.top = (t.top + t.height * .6 - r.top) + 'px'; }, 200);
    later(() => { cur.classList.add('press'); $('.mi', scr).classList.add('go'); }, 1300);
    if (demoPlay) later(() => { demoI = (demoI + 1) % DEMO.length; runDemo(); }, 4600);
  }

  /* ================= C 循環＋故事卡 ================= */
  const LOOP = [
    { ic: 'slides', t: '看簡報', d: '照學習路徑一章一章看；一頁講一個概念，圖可以動手玩。' },
    { ic: 'doc', t: '看深入', d: '想多知道一點，在主頁按「看深入」，看比較長的說明。' },
    { ic: 'check', t: '自我檢查', d: '每章最後先自己想，再打開答案；答不出來就回那一頁。' },
    { ic: 'chat', t: '卡住了：問 Agent', d: '按「問 Agent」貼到 Claude Code；它只根據簡報回答，附上出處。' },
    { ic: 'inbox', t: '簡報沒寫：記下來', d: 'Agent 會問要不要記成「待回答」，交給老手；你不用自己寫。' },
    { ic: 'book', t: '老手補上', d: '老手回答、維護者審核後併進簡報，你會收到通知；下一個新人就看得到。' }
  ];
  let loopSel = 0;
  function vC(k) {
    const seen = seenOf(k), nx = nextIdx(k, seen);
    if (chapSel == null || !k.path[chapSel]) chapSel = nx;
    const g = k.path[chapSel], c = colorOf(k, g);
    const R = 150, cx = 200, cy = 190;
    const nodes = LOOP.map((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / LOOP.length; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
    return `<section class="c-flow"><h2>怎麼學：一個會越轉越完整的循環</h2>
        <div class="c-loop"><svg viewBox="0 0 400 410" class="c-svg"><circle cx="${cx}" cy="${cy}" r="${R}" class="c-ring"/><circle r="7" class="c-run"><animateMotion dur="9s" repeatCount="indefinite" path="M${cx},${cy - R} a${R},${R} 0 1,1 -0.1,0"/></circle>
          <path d="M20,${cy - R - 10} C60,${cy - R - 10} 120,${cy - R} ${cx - 30},${cy - R}" class="c-in" marker-end="url(#c-ah)"/><text x="18" y="${cy - R - 18}" class="c-intx">挑一個知識庫</text>
          <defs><marker id="c-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#3e4b5b"/></marker></defs>
          ${nodes.map(([x, y], i) => `<g class="c-node${i === loopSel ? ' on' : ''}${i >= 4 ? ' back' : ''}" data-l="${i}" transform="translate(${x},${y})" role="button" tabindex="0"><circle r="30"/><g transform="translate(-13,-13)">${icon(LOOP[i].ic, 26)}</g><text y="48" text-anchor="middle">${LOOP[i].t}</text></g>`).join('')}
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="c-ct">${LOOP[loopSel].t}</text><text x="${cx}" y="${cy + 16}" text-anchor="middle" class="c-cs">點外圈的一站看說明</text></svg>
          <div class="c-cap"><b>${loopSel + 1}. ${LOOP[loopSel].t}</b><p>${LOOP[loopSel].d}</p><p class="sub">前三站是你自己看；後三站是看不懂、簡報沒寫時，知識怎麼回來：每個新人的問題，都會讓簡報更完整。</p></div></div></section>
      <section class="c-story"><h2>各主題：${esc(k.title)}，一次看一章</h2>
        <div class="c-card" style="--c:${c}"><div class="c-big">${icon(iconOf(g), 72)}</div>
          <div class="c-body">${chapSel === nx && !stateOf(g, seen).done ? '<span class="c-here">你在這裡：建議接著看</span>' : ''}${detail(k, g)}</div>
          <button type="button" class="c-nav prev" data-cn="-1" aria-label="上一章">‹</button><button type="button" class="c-nav next" data-cn="1" aria-label="下一章">›</button></div>
        <div class="c-strip">${k.path.map((x, i) => { const st = stateOf(x, seen), cc = colorOf(k, x);
          return `<button type="button" class="c-dot${i === chapSel ? ' on' : ''}${st.done ? ' done' : ''}${st.empty ? ' empty' : ''}" data-i="${i}" style="--c:${cc}" title="${esc(label(k, x))}">${icon(iconOf(x), 18)}${i === nx && !st.done ? '<i class="c-pin">你在這裡</i>' : ''}</button>`; }).join('<span class="c-dash"></span>')}</div>
        <p class="sub" style="text-align:center">下面一排是整條路：顏色是部分，實心是看完的章。點一個圖示跳到那一章。</p></section>`;
  }

  /* ---------- 共用：上方、切換列 ---------- */
  function header() {
    return `<header class="pv-top"><div class="wrap"><div class="pv-title"><h1>知識傳承入口</h1><span class="pv-tag">原型</span></div>
      <div class="pv-kbs">${P.kbs.map(k => `<button type="button" class="pv-kb${k.name === sel ? ' on' : ''}" data-kb="${k.name}">${icon(k.name === 'cv' ? 'eye' : 'chip', 22)}<span><b>${esc(k.title)}</b><small>${k.deck ? `${k.pages} 頁 · 約 ${hm(k.minutes)}` : `規劃了 ${k.path.length} 章，還沒有頁`}</small></span></button>`).join('')}</div></div></header>`;
  }
  function bar() {
    const i = VARIANTS.findIndex(v => v[0] === variant), k = byName[sel];
    return `<div class="pv-bar"><button type="button" data-v="-1" aria-label="上一個做法">←</button><span class="pv-v"><b>${variant}</b> ${VARIANTS[i][1]}</span><button type="button" data-v="1" aria-label="下一個做法">→</button>
      <label><input type="checkbox" id="pv-fake"${fake ? ' checked' : ''}> 示範進度</label>
      <span class="pv-state">${esc(k.title)} · 選到：${chapSel != null && k.path[chapSel] ? esc(label(k, k.path[chapSel])) : '（無）'}</span></div>`;
  }
  function render() {
    clearTimers();
    const k = byName[sel];
    $('#app').innerHTML = header() + `<main class="wrap pv-main">${variant === 'A' ? vA(k) : variant === 'B' ? vB(k) : vC(k)}</main>` + bar();
    if (variant === 'A') { drawMetro(k); play($('#a-scene .mi')); }
    if (variant === 'B') runDemo();
  }
  function setVariant(d) {
    const i = VARIANTS.findIndex(v => v[0] === variant);
    variant = VARIANTS[(i + d + VARIANTS.length) % VARIANTS.length][0];
    try { history.replaceState(null, '', `?variant=${variant}`); } catch (e) { /* file:// 也照常切換 */ }
    chapSel = null; render();
  }

  document.addEventListener('click', e => {
    const t = e.target;
    const v = t.closest('[data-v]'); if (v) { setVariant(+v.dataset.v); return; }
    const kb = t.closest('[data-kb]'); if (kb) { sel = kb.dataset.kb; chapSel = null; render(); return; }
    const f = t.closest('[data-f]'); if (f) { flowSel = +f.dataset.f; render(); return; }
    const fs = t.closest('[data-fs]'); if (fs) { flowSel = (flowSel + +fs.dataset.fs + FLOW.length) % FLOW.length; render(); return; }
    const stn = t.closest('.a-stn'); if (stn) { const k = byName[sel]; chapSel = +stn.dataset.i; drawMetro(k); $('#a-detail').innerHTML = detail(k, k.path[chapSel]); $('.pv-bar').outerHTML = bar(); return; }
    const d = t.closest('[data-d]'); if (d) { demoI = +d.dataset.d; demoPlay = false; render(); return; }
    if (t.closest('#b-pp')) { demoPlay = !demoPlay; render(); return; }
    if (t.closest('.b-close')) { chapSel = null; $$('.b-card.flip').forEach(c => c.classList.remove('flip')); $('.pv-bar').outerHTML = bar(); return; }
    const bf = t.closest('.b-front'); if (bf) { const k = byName[sel], i = +bf.dataset.i; chapSel = i; $$('.b-card').forEach(c => c.classList.toggle('flip', +c.dataset.i === i)); const back = $(`.b-card[data-i="${i}"] .b-back`); back.innerHTML = detail(k, k.path[i]) + `<button type="button" class="b-close" data-i="${i}">翻回去</button>`; $('.pv-bar').outerHTML = bar(); return; }
    const ln = t.closest('.c-node'); if (ln) { loopSel = +ln.dataset.l; render(); return; }
    const cn = t.closest('[data-cn]'); if (cn) { const n = byName[sel].path.length; chapSel = (chapSel + +cn.dataset.cn + n) % n; render(); return; }
    const cd = t.closest('.c-dot'); if (cd) { chapSel = +cd.dataset.i; render(); return; }
  });
  document.addEventListener('change', e => { if (e.target.id === 'pv-fake') { fake = e.target.checked; if (variant === 'C') chapSel = null; render(); } });
  document.addEventListener('keydown', e => {
    const tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable)) return;
    if (e.key === 'ArrowLeft') setVariant(-1);
    if (e.key === 'ArrowRight') setVariant(1);
    if ((e.key === 'Enter' || e.key === ' ') && tg.closest && tg.closest('.a-stn, .c-node')) { e.preventDefault(); tg.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
  });
  let rt = null; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (variant === 'A') drawMetro(byName[sel]); }, 150); });
  render();
})();
