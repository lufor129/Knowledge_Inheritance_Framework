/* 共用互動元件輔助函式 */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const U = {};
  window.U = U;

  U.$ = (el, sel) => el.querySelector(sel);
  U.$$ = (el, sel) => Array.from(el.querySelectorAll(sel));
  U.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  U.lerp = (a, b, t) => a + (b - a) * t;
  U.ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  /* 材料顏色（和 CSS 變數同步） */
  const MAT = {
    si: '#a9bcd0', siDark: '#7f97b0', ox: '#f1e3a8', nit: '#8fc1b5', pr: '#e39ac2', prExp: '#f6d3e6',
    poly: '#c2a878', hk: '#9d80d6', metal: '#7b8794', cu: '#c9793b', sige: '#b8c85a', n: '#5b8fd9', p: '#d9765b',
    w: '#5e6770', ru: '#6f86a8', mask: '#2b3440', air: '#ffffff', lowk: '#d9e7c4', tin: '#6e5f4b', bond: '#c8cdd4',
    accent: '#1f4fb5', accent2: '#b3541e', ink: '#17202b', ink2: '#3e4b5b', ink3: '#6a7888', line: '#d3dbe4', good: '#1f7a4d', bad: '#b3261e', warn: '#a8660a'
  };
  U.MAT = MAT;
  /* 粒子顏色（全場統一）：電子＝藍色實心、電洞＝紅色空心、出問題的電子（漏電、穿隧）＝藍點加紅框 */
  U.PC = { e: '#1f4fb5', h: '#c0392b', bad: '#b3261e' };
  U.electron = (c, x, y, r, bad) => {
    c.fillStyle = U.PC.e; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    if (bad) { c.strokeStyle = U.PC.bad; c.lineWidth = 1.8; c.beginPath(); c.arc(x, y, r + 1.6, 0, 7); c.stroke(); }
  };
  U.hole = (c, x, y, r) => { c.fillStyle = '#fff'; c.strokeStyle = U.PC.h; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.stroke(); };
  /* 圖角的小圖例：kinds 取自 'e'（電子）、'h'（電洞）、'bad'（漏電的電子） */
  U.pLegend = (c, x, y, kinds) => {
    const lab = { e: '電子', h: '電洞', bad: '漏電／穿隧的電子' }, w0 = kinds.reduce((a, k) => a + 26 + lab[k].length * 14, 0) + 10;
    c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(x, y, w0, 24); c.strokeStyle = '#d3dbe4'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w0 - 1, 23);
    let xx = x + 12;
    kinds.forEach(k => {
      if (k === 'h') U.hole(c, xx, y + 12, 4.5); else U.electron(c, xx, y + 12, 4.5, k === 'bad');
      c.font = '500 13px "PingFang TC","Noto Sans TC",sans-serif'; c.fillStyle = '#3e4b5b'; c.textBaseline = 'middle'; c.fillText(lab[k], xx + 9, y + 13); c.textBaseline = 'alphabetic';
      xx += 26 + lab[k].length * 14;
    });
  };
  U.MAT_NAME = {
    si: '矽 Si', ox: '氧化矽 SiO₂', nit: '氮化矽 SiN', pr: '光阻 PR', prExp: '已曝光光阻', poly: '多晶矽 Poly-Si', hk: '高介電 HfO₂',
    metal: '金屬閘極', cu: '銅 Cu', sige: '矽鍺 SiGe', n: 'n 型摻雜區', p: 'p 型摻雜區', w: '鎢 W', ru: '釕 Ru', mask: '光罩鉻層', lowk: 'low-k 介電', tin: '阻障層（TaN/Ta）'
  };

  /* ---------- SVG ---------- */
  U.svg = function (tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      if (k === 'text') e.textContent = attrs[k];
      else if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    }
    if (tag === 'text' && attrs && attrs.fill) e.style.fill = attrs.fill;
    if (parent) parent.appendChild(e);
    return e;
  };
  /* 讓 SVG 的 viewBox 等於實際像素大小（舞台固定 1600×900，clientWidth 不受縮放影響） */
  U.fit = function (svg) {
    const r = svg.parentElement;
    const w = r.clientWidth || 600, h = r.clientHeight || 400;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    return { w, h };
  };
  U.clear = el => { while (el.firstChild) el.removeChild(el.firstChild); };

  U.lin = (d0, d1, r0, r1) => { const f = v => r0 + (v - d0) / (d1 - d0) * (r1 - r0); f.inv = p => d0 + (p - r0) / (r1 - r0) * (d1 - d0); return f; };
  U.log = (d0, d1, r0, r1) => { const a = Math.log10(d0), b = Math.log10(d1); const f = v => r0 + (Math.log10(Math.max(v, 1e-300)) - a) / (b - a) * (r1 - r0); return f; };
  U.pathD = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('');

  /* 座標軸：回傳 {x, y, g, plot} */
  U.axes = function (svg, o) {
    const { w, h } = o.size || U.fit(svg);
    const m = Object.assign({ l: 62, r: 16, t: 14, b: 46 }, o.m || {});
    const X = (o.xlog ? U.log : U.lin)(o.x[0], o.x[1], m.l, w - m.r);
    const Y = (o.ylog ? U.log : U.lin)(o.y[0], o.y[1], h - m.b, m.t);
    const g = U.svg('g', {}, svg);
    const grid = U.svg('g', { class: 'grid' }, g);
    const ax = U.svg('g', { class: 'axis' }, g);
    const xt = o.xticks || [], yt = o.yticks || [];
    xt.forEach(v => {
      const px = X(v);
      U.svg('line', { x1: px, x2: px, y1: m.t, y2: h - m.b }, grid);
      U.svg('text', { x: px, y: h - m.b + 18, 'text-anchor': 'middle', class: 'lbl-s mono', text: o.fx ? o.fx(v) : v }, ax);
    });
    yt.forEach(v => {
      const py = Y(v);
      U.svg('line', { x1: m.l, x2: w - m.r, y1: py, y2: py }, grid);
      U.svg('text', { x: m.l - 7, y: py + 4, 'text-anchor': 'end', class: 'lbl-s mono', text: o.fy ? o.fy(v) : v }, ax);
    });
    U.svg('line', { x1: m.l, x2: w - m.r, y1: h - m.b, y2: h - m.b }, ax);
    U.svg('line', { x1: m.l, x2: m.l, y1: m.t, y2: h - m.b }, ax);
    if (o.xlabel) U.svg('text', { x: (m.l + w - m.r) / 2, y: h - 8, 'text-anchor': 'middle', class: 'lbl', text: o.xlabel }, ax);
    if (o.ylabel) U.svg('text', { x: 16, y: (m.t + h - m.b) / 2, 'text-anchor': 'middle', class: 'lbl', transform: `rotate(-90 16 ${(m.t + h - m.b) / 2})`, text: o.ylabel }, ax);
    const plot = U.svg('g', {}, svg);
    return { x: X, y: Y, g, plot, w, h, m };
  };

  /* ---------- 控制元件 HTML ---------- */
  U.range = (id, label, min, max, step, val, unit) =>
    `<div class="ctl"><label for="${id}">${label}<output id="${id}-o"></output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}" data-unit="${unit || ''}"></div>`;
  /* 綁定滑桿；fmt 可自訂顯示 */
  U.bind = function (el, id, fn, fmt) {
    const inp = U.$(el, '#' + id), out = U.$(el, '#' + id + '-o');
    const upd = () => { const v = parseFloat(inp.value); out.textContent = fmt ? fmt(v) : v + (inp.dataset.unit || ''); fn && fn(v); };
    inp.addEventListener('input', upd);
    upd();
    return { get: () => parseFloat(inp.value), set: v => { inp.value = v; upd(); }, el: inp, refresh: upd };
  };
  U.seg = (id, items, on = 0) =>
    `<div class="seg" id="${id}" role="group">${items.map((t, i) => `<button type="button" data-i="${i}" class="${i === on ? 'on' : ''}">${t}</button>`).join('')}</div>`;
  U.onSeg = function (el, id, fn) {
    const box = U.$(el, '#' + id);
    const set = i => { U.$$(box, 'button').forEach((b, k) => b.classList.toggle('on', k === i)); fn(i); };
    box.addEventListener('click', e => { const b = e.target.closest('button'); if (b) set(+b.dataset.i); });
    const cur = U.$$(box, 'button').findIndex(b => b.classList.contains('on'));
    fn(cur < 0 ? 0 : cur);
    return { set };
  };

  /* ---------- 逐步播放器 ----------
     host 內需有 .stepper 容器與 .step-text；steps = [{t:'標題', d:'說明'}]；draw(i) 繪製第 i 步 */
  U.stepperHTML = (id) => `<div class="stepper" id="${id}"><button class="btn" data-a="prev" type="button">◀ 上一步</button><button class="btn primary" data-a="next" type="button">下一步 ▶</button><button class="btn" data-a="play" type="button">▶ 自動播放</button><span class="dots"></span></div><div class="step-text" id="${id}-t"></div>`;
  U.stepper = function (el, id, steps, draw, ctx, opts) {
    const box = U.$(el, '#' + id), txt = U.$(el, '#' + id + '-t');
    const dots = U.$(box, '.dots');
    dots.innerHTML = steps.map((_, i) => `<i data-i="${i}" title="${steps[i].t}"></i>`).join('');
    let i = 0, playing = null;
    const show = k => {
      i = U.clamp(k, 0, steps.length - 1);
      U.$$(dots, 'i').forEach((d, j) => { d.className = j === i ? 'on' : j < i ? 'done' : ''; });
      txt.innerHTML = `<b>${i + 1}. ${steps[i].t}</b>　${steps[i].d || ''}`;
      draw(i);
    };
    const stop = () => { if (playing) { clearInterval(playing); playing = null; U.$(box, '[data-a=play]').textContent = '▶ 自動播放'; } };
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'), d = e.target.closest('i[data-i]');
      if (d) { stop(); show(+d.dataset.i); return; }
      if (!b) return;
      if (b.dataset.a === 'prev') { stop(); show(i - 1); }
      if (b.dataset.a === 'next') { stop(); show(i + 1); }
      if (b.dataset.a === 'play') {
        if (playing) { stop(); return; }
        if (i >= steps.length - 1) show(0);
        b.textContent = '❚❚ 暫停';
        playing = setInterval(() => { if (i >= steps.length - 1) stop(); else show(i + 1); }, (opts && opts.interval) || 1800);
      }
    });
    ctx && ctx.onCleanup(stop);
    show((opts && opts.start) || 0);
    return { show, get: () => i };
  };

  /* ---------- Canvas ---------- */
  U.canvas = function (cv) {
    const r = cv.parentElement;
    const w = r.clientWidth || 600, h = r.clientHeight || 400, dpr = Math.min(2, window.devicePixelRatio || 1) * Math.max(1, (window.Deck && Deck.scale) || 1);
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { c, w, h };
  };

  /* ---------- 剖面繪圖：以材料矩形與多邊形描述狀態 ----------
     shapes: [{m:'si', x,y,w,h} | {m, pts:[[x,y],...]} | {label:'文字', x,y, anchor}] */
  U.drawShapes = function (g, shapes) {
    U.clear(g);
    shapes.forEach(s => {
      if (!s) return;
      if (s.label !== undefined) {
        U.svg('text', { x: s.x, y: s.y, 'text-anchor': s.anchor || 'start', class: s.cls || 'lbl', fill: s.fill, text: s.label }, g);
        return;
      }
      if (s.line) { U.svg('line', { x1: s.line[0], y1: s.line[1], x2: s.line[2], y2: s.line[3], stroke: s.stroke || MAT.ink2, 'stroke-width': s.sw || 1.2, 'stroke-dasharray': s.dash, 'marker-end': s.arrow ? 'url(#arrow)' : null }, g); return; }
      const fill = MAT[s.m] || s.m;
      const common = { fill, stroke: s.stroke || 'rgba(20,30,45,.35)', 'stroke-width': s.sw || .8, opacity: s.op, class: s.cls };
      if (s.pts) U.svg('polygon', Object.assign({ points: s.pts.map(p => p.join(',')).join(' ') }, common), g);
      else if (s.r) U.svg('circle', Object.assign({ cx: s.x, cy: s.y, r: s.r }, common), g);
      else U.svg('rect', Object.assign({ x: s.x, y: s.y, width: Math.max(0, s.w), height: Math.max(0, s.h), rx: s.rx || 0 }, common), g);
    });
  };
  U.arrowDefs = function (svg, color) {
    const d = U.svg('defs', {}, svg);
    const mk = U.svg('marker', { id: 'arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d);
    U.svg('path', { d: 'M0,0 L10,5 L0,10 z', fill: color || MAT.ink2 }, mk);
    return d;
  };
  U.legendHTML = keys => `<div class="legend">${keys.map(k => `<span><i style="background:${MAT[k]}"></i>${U.MAT_NAME[k] || k}</span>`).join('')}</div>`;

  U.fmt = (v, d = 1) => Number(v).toFixed(d);
  U.sci = v => { if (v === 0) return '0'; const e = Math.floor(Math.log10(Math.abs(v))); const m = v / Math.pow(10, e); return `${m.toFixed(1)}×10${U.sup(e)}`; };
  U.sup = n => String(n).split('').map(c => '⁰¹²³⁴⁵⁶⁷⁸⁹'['0123456789'.indexOf(c)] || (c === '-' ? '⁻' : c)).join('');
  U.gauss = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
})();
