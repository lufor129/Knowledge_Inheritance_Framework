/* 簡報引擎（所有知識庫共用）：翻頁、縮放、講稿和旁白、總覽、章節列
   每頁用 Deck.add({ id, part, title, minutes, render(h) -> html, init(el, ctx), notes }) 註冊；
   Markdown 寫的頁由 pages.js 註冊，給新人的按鈕（旁白、看詳細和出處、問 Agent）和進度在 learn.js */
(function () {
  const W = 1600, H = 900;
  /* 由 build.py 從頁序（deck/order.md）產生：部分、章節列、浮水印 */
  const CFG = window.DECK_CONFIG || {};
  /* 章節列：[編號, 名稱, 該章第一頁 id, 部分]；頁面用 part、chap 指定所屬章節，章節列只列同一個部分的章 */
  const CHAPS = CFG.chaps || [];
  const PARTS = CFG.parts || {};

  const Deck = {
    slides: [],
    cur: -1,
    _rafs: [],
    add(s) { this.slides.push(s); },
    onGo: [],   // 換頁之後要做的事：fn(頁, 第幾頁)
    /* 檢查用：同步推進目前頁面的動畫 n 幀（背景分頁時瀏覽器會暫停動畫） */
    tick(n) { for (let k = 0; k < (n || 1); k++) { const t = performance.now() / 1000 + k * 0.05; this._rafs.forEach(f => f(0.05, t)); } },
    CHAPS, PARTS
  };
  window.Deck = Deck;

  /* ---------- 版面輔助 ---------- */
  function esc(s) { return String(s); }
  /* 頁碼引用：文字裡寫 [[頁:頁id]]，顯示時換成「第 N 頁」。頁序調整、插入自動產生的頁，頁碼都會跟著對 */
  Deck.ref = t => String(t == null ? '' : t).replace(/\[\[頁:([A-Za-z0-9_-]+)\]\]/g, (m, id) => {
    const k = Deck.slides.findIndex(x => x.id === id); return k >= 0 ? `第 ${k + 1} 頁` : m;
  });
  function fixRefs(node) {
    if (node.nodeType === 3) { if (node.data.includes('[[頁:')) node.data = Deck.ref(node.data); return; }
    if (node.nodeType !== 1) return;
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) if (n.data.includes('[[頁:')) n.data = Deck.ref(n.data);
  }
  Deck.head = function (s, i) {
    let flow = '';
    if (s.chap) { // 右上角的章節列：亮起目前所在的章，點名稱跳到該章第一頁
      flow = '<div class="miniflow" aria-label="章節列">' + CHAPS.filter(c => c[3] === undefined || c[3] === s.part).map(([k, n, go]) =>
        `<span class="${k === s.chap ? 'on' : ''}" data-chap="${go}" title="跳到第 ${k} 章">${'①②③④⑤⑥⑦⑧⑨⑩'[k - 1]} ${n}</span>`).join('') + '</div>';
    }
    return `<header class="s-head">
      <div class="s-eyebrow"><span class="num">${String(i + 1).padStart(2, '0')}</span><span>${esc(s.eyebrow || PARTS[s.part] || '')}</span></div>
      ${flow}
      <h2 class="s-title">${s.title}${s.badge ? `<span class="newtag">${s.badge}</span>` : ''}${s.en ? `<span class="en">${s.en}</span>` : ''}</h2>
      ${s.thesis ? `<p class="s-thesis">${s.thesis}</p>` : ''}
    </header>`;
  };
  Deck.foot = function (s) {
    if (!s.src && !s.footL) return '';
    return `<footer class="s-foot"><span>${s.footL || ''}</span><span class="src">${s.src ? '資料：' + s.src : ''}</span></footer>`;
  };

  /* ---------- 舞台與縮放 ---------- */
  let stage, progress, hudNum, notesEl, overviewEl;
  let cleanups = [];
  let startTime = null;

  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const sc = Math.min(vw / W, vh / H);
    stage.style.transform = `translate(${-W * sc / 2}px, ${-H * sc / 2}px) scale(${sc})`;
    Deck.scale = sc;
  }

  /* 互動狀態：離頁前記下分頁鈕、逐步動畫、滑桿，按 B 回來或視窗縮放重建時還原（不用從第 1 步重來） */
  Deck._state = {};
  function snapState(el) {
    const st = { seg: [], step: [], rng: [] };
    el.querySelectorAll('.seg[id]').forEach(b => { const k = [...b.querySelectorAll('button')].findIndex(x => x.classList.contains('on')); if (k >= 0) st.seg.push([b.id, k]); });
    el.querySelectorAll('.stepper[id]').forEach(b => { const d = [...b.querySelectorAll('.dots i')]; const k = d.findIndex(x => x.classList.contains('on')); if (k >= 0) st.step.push([b.id, k]); });
    el.querySelectorAll('input[type=range][id]').forEach(r => st.rng.push([r.id, r.value]));
    return st;
  }
  function applyState(el, st) {
    const q = id => el.querySelector('#' + CSS.escape(id));
    st.seg.forEach(([id, k]) => { const b = q(id), bt = b && b.querySelectorAll('button')[k]; if (bt && !bt.classList.contains('on')) bt.click(); }); // 先切分頁（分頁會換掉下面的內容）
    st.rng.forEach(([id, v]) => { const r = q(id); if (r && r.value !== v) { r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); } });
    st.step.forEach(([id, k]) => { const b = q(id), d = b && b.querySelectorAll('.dots i')[k]; if (d && k > 0) d.click(); });
  }

  /* 影片：內嵌的 data URI 轉成 blob 網址再播（Safari 不一定能直接播 data URI 影片；同一支影片只轉一次）
     進頁時自動播放有 data-autoplay 的影片，離頁時停掉；沒有控制列的影片點畫面暫停／繼續 */
  const blobs = new Map();
  function blobURL(s) {
    if (!s.startsWith('data:')) return s;
    if (!blobs.has(s)) {
      const k = s.indexOf(','), mime = s.slice(5, k).split(';')[0], bin = atob(s.slice(k + 1));
      const u = new Uint8Array(bin.length);
      for (let j = 0; j < bin.length; j++) u[j] = bin.charCodeAt(j);
      blobs.set(s, URL.createObjectURL(new Blob([u], { type: mime })));
    }
    return blobs.get(s);
  }
  function setupVideos(el) {
    const vids = [...el.querySelectorAll('video')];
    if (!vids.length) return;
    vids.forEach(v => {
      const s = v.dataset.src || v.getAttribute('src') || '';
      if (s) v.src = blobURL(s);
      v.muted = v.hasAttribute('muted'); // 用 innerHTML 放進來的 muted 屬性不會設定 muted 狀態，自動播放要靜音
      if (!v.controls) v.addEventListener('click', () => { if (v.paused) v.play().catch(() => {}); else v.pause(); });
      if (v.hasAttribute('data-autoplay')) v.play().catch(() => {});
    });
    cleanups.push(() => vids.forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }));
  }

  function runCleanups() {
    cleanups.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
    cleanups = [];
  }

  Deck.go = function (i, opts) {
    const n = Deck.slides.length;
    i = Math.max(0, Math.min(n - 1, i));
    if (i === Deck.cur && !(opts && opts.force)) return;
    const old = stage.querySelector('section.slide');
    if (old && Deck.slides[Deck.cur]) { try { Deck._state[Deck.slides[Deck.cur].id] = snapState(old); } catch (e) { console.error(e); } }
    runCleanups();
    Deck.cur = i; Deck._builtScale = Deck.scale;
    const s = Deck.slides[i];
    const el = document.createElement('section');
    el.className = 'slide enter ' + (s.cls || '');
    el.setAttribute('aria-label', `第 ${i + 1} 頁：${String(s.title).replace(/<[^>]+>/g, '')}`);
    try {
      el.innerHTML = s.raw ? s.render(i) : Deck.head(s, i) + s.render(i) + Deck.foot(s);
    } catch (e) { el.innerHTML = `<pre>${e.stack}</pre>`; console.error(e); }
    if (CFG.watermark) el.insertAdjacentHTML('beforeend', `<div class="wm">${CFG.watermark}</div>`); // 每頁上方的浮水印
    fixRefs(el);
    stage.innerHTML = '';
    stage.appendChild(el);
    backButton(el, s, opts);
    setupVideos(el);
    el.querySelectorAll('.miniflow [data-chap]').forEach(sp => { if (!sp.classList.contains('on')) sp.onclick = () => Deck.goId(sp.dataset.chap); });
    if (s.hub) { // 回到章節全貌頁（全貌頁會出現「回到第 N 頁」，可以來回跳）
      const t = Deck.slides.find(x => x.id === s.hub), eb = el.querySelector('.s-eyebrow');
      if (t && eb && Deck.slides[Deck._back] !== t) { const b = document.createElement('button'); b.type = 'button'; b.className = 'backbtn hubbtn'; b.textContent = '⌂ ' + String(t.hubShort || t.short || t.title).replace(/<[^>]+>/g, ''); b.onclick = () => Deck.goId(s.hub); eb.appendChild(b); }
    }
    if (s.init) {
      const ctx = {
        onCleanup(fn) { cleanups.push(fn); },
        raf(fn) { // 動畫迴圈，離頁自動停止
          let id, alive = true, last = performance.now();
          // 第一幀的 rAF 時間戳可能早於 performance.now()，dt 會是負的：夾在 0–0.05；單一幀出錯也不讓迴圈停掉
          const loop = t => { if (!alive) return; const dt = Math.max(0, Math.min(0.05, (t - last) / 1000)); last = t; try { fn(dt, t / 1000); } catch (e) { console.error('raf error', e); } id = requestAnimationFrame(loop); };
          id = requestAnimationFrame(loop);
          Deck._rafs.push(fn);
          const stop = () => { alive = false; cancelAnimationFrame(id); Deck._rafs = Deck._rafs.filter(f => f !== fn); };
          cleanups.push(stop); return stop;
        },
        timer(fn, ms) { const id = setInterval(fn, ms); cleanups.push(() => clearInterval(id)); return id; },
        timeout(fn, ms) { const id = setTimeout(fn, ms); cleanups.push(() => clearTimeout(id)); return id; }
      };
      try { s.init(el, ctx); } catch (e) { console.error('init error on slide', i + 1, e); }
      const keep = opts && (opts.returning || opts.keep) && Deck._state[s.id];
      if (keep) { try { applyState(el, keep); } catch (e) { console.error('restore error on slide', i + 1, e); } }
    }
    progress.style.width = ((i + 1) / n * 100) + '%';
    hudNum.textContent = `${i + 1} / ${n}`;
    // 網址記頁 id，頁序調整了連結也不會跳錯（舊的頁碼網址照樣能開）
    try { history.replaceState(null, '', '#' + s.id); } catch (e) { location.hash = s.id; }
    Deck.onGo.forEach(fn => { try { fn(s, i); } catch (e) { console.error(e); } });
    renderNotes();
    renderPresenter();
    if (!overviewEl.hidden) renderOverview();
  };


  /* 跳頁連結：記住從哪一頁跳來，目標頁會出現「回到第 N 頁」按鈕（B 鍵也可以） */
  /* 調整頁序：把 id 那一頁搬到 afterId 那一頁後面 */
  Deck.move = function (id, afterId) {
    const i = Deck.slides.findIndex(s => s.id === id); if (i < 0) return;
    const [s] = Deck.slides.splice(i, 1);
    const j = Deck.slides.findIndex(x => x.id === afterId);
    Deck.slides.splice(j + 1, 0, s);
  };

  Deck.goId = function (id) {
    const i = Deck.slides.findIndex(s => s.id === id);
    if (i >= 0 && i !== Deck.cur) Deck.go(i, { from: Deck.cur });
  };
  Deck.goBack = function () { if (Deck._back != null) Deck.go(Deck._back, { returning: true }); };
  function backButton(el, s, opts) {
    let to = null;
    if (opts && opts.from != null) to = opts.from;
    else if (s.back) to = Deck.slides.findIndex(x => x.id === s.back);
    Deck._back = to != null && to >= 0 ? to : null;
    if (Deck._back == null) return;
    const t = Deck.slides[Deck._back];
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'backbtn';
    b.innerHTML = `↩ 回到第 ${Deck._back + 1} 頁：${String(t.short || t.title).replace(/<[^>]+>/g, '')}`;
    b.onclick = Deck.goBack;
    const eb = el.querySelector('.s-eyebrow');
    if (eb) eb.appendChild(b); else { b.classList.add('float'); el.appendChild(b); }
  }

  function cumMinutes(upto) {
    let m = 0; for (let k = 0; k < upto; k++) m += Deck.slides[k].minutes || 0; return m;
  }
  // 計時基準：按 T 時記下目前頁，計畫進度從這一頁起算（第二場從中間開講時才不會顯示超前一大截）
  let planBase = 0;
  const planAt = i => cumMinutes(i) - cumMinutes(planBase);
  // 講稿段落開頭的【可略】【提示】標籤換顏色，講者一眼看得到
  const notesHTML = s => Deck.ref(s.notes || '（這一頁沒有講稿）').trim().split(/\n\s*\n/).map(p => `<p>${p.trim().replace(/^【(.+?)】/, '<b class="tg">【$1】</b>')}</p>`).join('');
  function fmtMin(m) { return `${Math.floor(m)}:${String(Math.round((m % 1) * 60)).padStart(2, '0')}`; }

  // 旁白：講稿拿掉給講者看的【可略】【提示】段落，也不顯示計時
  let notesMode = 'talk';
  const narrHTML = s => {
    const ps = Deck.ref(s.notes || '').trim().split(/\n\s*\n/).map(p => p.trim()).filter(p => p && !/^【(可略|提示)】/.test(p));
    return ps.length ? ps.map(p => `<p>${p}</p>`).join('') : '<p>（這一頁沒有旁白）</p>';
  };
  Deck.toggleNotes = function (mode) {
    const same = !notesEl.hidden && notesMode === mode;
    notesMode = mode;
    notesEl.hidden = same;
    notesEl.classList.toggle('narr', mode === 'narr');
    renderNotes();
    return !notesEl.hidden;
  };
  Deck.notesOpen = () => !notesEl.hidden && notesMode;
  function renderNotes() {
    if (notesEl.hidden) return;
    const s = Deck.slides[Deck.cur];
    if (notesMode === 'narr') { notesEl.innerHTML = `<div class="nh"><span>旁白 · ${String(s.short || s.title).replace(/<[^>]+>/g, '')}</span><span>再按一次「旁白」收起</span></div>${narrHTML(s)}`; return; }
    const total = planAt(Deck.slides.length);
    const el = startTime ? (Date.now() - startTime) / 60000 : 0;
    const paras = notesHTML(s);
    notesEl.innerHTML = `<div class="nh"><span>講稿 · 第 ${Deck.cur + 1} 頁 · 建議 <b>${s.minutes || 0} 分</b></span>
      <span>計畫進度 ${fmtMin(Math.max(0, planAt(Deck.cur)))} → ${fmtMin(Math.max(0, planAt(Deck.cur + 1)))} / ${planBase ? '本場（從第 ' + (planBase + 1) + ' 頁起）' : '全場'} ${fmtMin(total)}</span>
      <span>實際經過 <b id="elapsed">${fmtMin(el)}</b>（按 T 重設計時）</span></div>${paras}`;
  }

  /* 講者視窗：另開一個視窗顯示講稿、下一頁與計時（投影時主畫面維持乾淨） */
  let presenter = null;
  function openPresenter() {
    try { presenter = window.open('', 'deck-presenter', 'width=900,height=640'); } catch (e) { presenter = null; }
    if (!presenter) { if (Deck.notesOpen() !== 'talk') Deck.toggleNotes('talk'); return; } // 開不了新視窗：改在下方顯示講稿
    const d = presenter.document;
    d.open();
    d.write(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>講者視窗</title><style>
      body{margin:0;font-family:"PingFang TC","Noto Sans TC",system-ui,sans-serif;background:#1b2430;color:#e9eef4}
      header{display:flex;justify-content:space-between;align-items:center;padding:14px 22px;background:#111822;gap:16px;flex-wrap:wrap}
      .big{font-size:40px;font-family:Menlo,monospace;color:#ffd28a}.cur{font-size:22px;font-weight:700}.nx{color:#9fb0c4;font-size:16px}
      main{padding:18px 26px;font-size:21px;line-height:1.75}main p{margin:0 0 12px}
      button{font:inherit;font-size:18px;padding:8px 18px;border-radius:4px;border:1px solid #4a5a70;background:#26344a;color:#fff;cursor:pointer}
      .bar{height:6px;background:#26344a}.bar i{display:block;height:100%;background:#1f4fb5}.tg{color:#ffd28a}
    </style></head><body><header><div><div class="cur" id="pc"></div><div class="nx" id="pn"></div></div>
      <div><span class="big" id="pt"></span> <span class="nx" id="pp"></span></div>
      <div><button id="bp">◀ 上一頁</button> <button id="bn">下一頁 ▶</button></div></header>
      <div class="bar"><i id="pb"></i></div><main id="pm"></main></body></html>`);
    d.close();
    d.getElementById('bp').onclick = () => Deck.go(Deck.cur - 1);
    d.getElementById('bn').onclick = () => Deck.go(Deck.cur + 1);
    d.addEventListener('keydown', e => {
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { Deck.go(Deck.cur + 1); e.preventDefault(); }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) { Deck.go(Deck.cur - 1); e.preventDefault(); }
    });
    renderPresenter();
  }
  function renderPresenter() {
    if (!presenter || presenter.closed) return;
    const d = presenter.document, s = Deck.slides[Deck.cur], nx = Deck.slides[Deck.cur + 1];
    const strip = x => String(x || '').replace(/<[^>]+>/g, '');
    const el = startTime ? (Date.now() - startTime) / 60000 : 0, plan = Math.max(0, planAt(Deck.cur));
    const q = id => d.getElementById(id);
    if (!q('pc')) return;
    q('pc').textContent = `${Deck.cur + 1} / ${Deck.slides.length}　${strip(s.title)}（建議 ${s.minutes || 0} 分）`;
    q('pn').textContent = nx ? '下一頁：' + strip(nx.short || nx.title) : '最後一頁';
    q('pt').textContent = fmtMin(el);
    const diff = el - plan;
    q('pp').textContent = `計畫 ${fmtMin(plan)}　${diff > 1 ? '落後 ' + fmtMin(diff) : diff < -1 ? '超前 ' + fmtMin(-diff) : '準時'}`;
    q('pb').style.width = ((Deck.cur + 1) / Deck.slides.length * 100) + '%';
    q('pm').innerHTML = notesHTML(s);
  }
  Deck.openPresenter = openPresenter;

  function renderOverview() {
    const total = cumMinutes(Deck.slides.length);
    let html = `<div class="ot">全場 ${Deck.slides.length} 頁 · 預估 ${fmtMin(total)} · 點擊跳頁 · Esc 關閉</div>`;
    let part = null;
    Deck.slides.forEach((s, i) => {
      if (s.part !== part) {
        if (part !== null) html += '</div>';
        part = s.part;
        const pm = Deck.slides.filter(x => x.part === part).reduce((a, x) => a + (x.minutes || 0), 0);
        html += `<h3>${PARTS[part]} · ${fmtMin(pm)}</h3><div class="og">`;
      }
      html += `<div class="oc ${i === Deck.cur ? 'cur' : ''}" data-i="${i}"><span class="i">${i + 1}</span><span>${String(s.short || s.title).replace(/<[^>]+>/g, '')}</span><span class="m">${s.minutes || 0}′</span></div>`;
    });
    html += '</div>';
    overviewEl.innerHTML = html;
  }

  function toggle(el, force) {
    el.hidden = force === undefined ? !el.hidden : !force;
  }

  Deck.start = function () {
    stage = document.getElementById('stage');
    progress = document.getElementById('progress');
    hudNum = document.getElementById('hud-num');
    notesEl = document.getElementById('notes');
    overviewEl = document.getElementById('overview');
    fit();
    // 互動元件之後才放進頁面的文字（例如點了才出現的說明），也要換頁碼引用
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(fixRefs))).observe(stage, { childList: true, subtree: true });
    // 視窗大小改變（例如按 F 全螢幕）：canvas 解析度是進頁時決定的，縮放差超過一成就重建當頁，避免畫面變糊
    let rsT = null;
    window.addEventListener('resize', () => {
      fit(); clearTimeout(rsT);
      rsT = setTimeout(() => { if (Math.abs(Deck.scale / (Deck._builtScale || Deck.scale) - 1) > 0.1) { Deck.go(Deck.cur, { force: true, from: Deck._back, keep: true }); } }, 300);
    });

    document.addEventListener('keydown', e => {
      const t = e.target;
      const isRange = t && t.tagName === 'INPUT' && t.type === 'range';
      const typing = t && !isRange && (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA');
      if (typing && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key)) return;
      // 滑桿：上下鍵調整數值，左右鍵照常翻頁（講者拖完滑桿直接按 → 就能換頁）
      if (isRange && ['ArrowUp', 'ArrowDown'].includes(e.key)) return;
      if (isRange && ['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', ' '].includes(e.key)) t.blur();
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key) {
        case 'ArrowRight': case 'PageDown': case ' ': Deck.go(Deck.cur + 1); e.preventDefault(); break;
        case 'ArrowLeft': case 'PageUp': Deck.go(Deck.cur - 1); e.preventDefault(); break;
        case 'Home': Deck.go(0); break;
        case 'End': Deck.go(Deck.slides.length - 1); break;
        case 'n': case 'N': Deck.toggleNotes('talk'); break;
        case 'o': case 'O': toggle(overviewEl); if (!overviewEl.hidden) renderOverview(); break;
        case 'Escape': toggle(overviewEl, false); break;
        case 't': case 'T': startTime = Date.now(); planBase = Deck.cur; renderNotes(); renderPresenter(); break;
        case 'p': case 'P': openPresenter(); break;
        case 'b': case 'B': Deck.goBack(); break;
        case 'f': case 'F':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
          else document.exitFullscreen?.();
          break;
      }
    });
    // 全螢幕時的醒目游標：紅色光暈跟著滑鼠，點擊有波紋；停 3 秒淡出；L 鍵開關
    const ptr = document.createElement('div'); ptr.id = 'ptr-halo'; document.body.appendChild(ptr);
    let ptrOn = true, ptrIdle = null;
    const ptrShow = () => { ptr.classList.toggle('on', ptrOn && !!document.fullscreenElement); };
    document.addEventListener('mousemove', e => {
      ptr.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      ptrShow(); ptr.classList.remove('idle');
      clearTimeout(ptrIdle); ptrIdle = setTimeout(() => ptr.classList.add('idle'), 3000);
    }, { passive: true });
    document.addEventListener('mousedown', e => {
      if (!ptrOn || !document.fullscreenElement) return;
      const r = document.createElement('div'); r.className = 'ptr-ripple';
      r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
      document.body.appendChild(r); setTimeout(() => r.remove(), 650);
    });
    document.addEventListener('fullscreenchange', ptrShow);
    document.addEventListener('keydown', e => {
      if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey && !e.altKey && !(e.target && e.target.tagName === 'INPUT' && e.target.type !== 'range')) { ptrOn = !ptrOn; ptrShow(); }
    });

    overviewEl.addEventListener('click', e => {
      const c = e.target.closest('.oc'); if (!c) return;
      toggle(overviewEl, false); Deck.go(+c.dataset.i);
    });
    document.getElementById('btn-prev').onclick = () => Deck.go(Deck.cur - 1);
    document.getElementById('btn-next').onclick = () => Deck.go(Deck.cur + 1);
    document.getElementById('btn-notes').onclick = () => Deck.toggleNotes('talk');
    document.getElementById('btn-ov').onclick = () => { toggle(overviewEl); if (!overviewEl.hidden) renderOverview(); };

    // 觸控滑動
    let tx = null;
    document.addEventListener('touchstart', e => { if (e.target.tagName !== 'INPUT') tx = e.touches[0].clientX; }, { passive: true });
    document.addEventListener('touchend', e => {
      if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 60) Deck.go(Deck.cur + (dx < 0 ? 1 : -1));
    });

    setInterval(() => { const e = document.getElementById('elapsed'); if (e && startTime) e.textContent = fmtMin((Date.now() - startTime) / 60000); renderPresenter(); }, 1000);
    const bpv = document.getElementById('btn-pv'); if (bpv) bpv.onclick = openPresenter;
    startTime = Date.now();
    // 網址可以是頁 id（#hk1）或頁碼（#12）
    const h = decodeURIComponent((location.hash || '').replace('#', ''));
    const byId = Deck.slides.findIndex(x => x.id === h), n = parseInt(h, 10);
    Deck.go(byId >= 0 ? byId : isNaN(n) ? 0 : n - 1, { force: true });
    window.addEventListener('hashchange', () => {
      const id = decodeURIComponent(location.hash.slice(1)), k = Deck.slides.findIndex(x => x.id === id);
      if (k >= 0 && k !== Deck.cur) Deck.go(k);
    });
  };
})();
