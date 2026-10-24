/* 簡單版共用：側欄（重點＋比喻卡＋一句話數字）、量條、圖示、粒子 */
(function () {
  const S = 'fill="none" stroke="#b3541e" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  const ICON = {
    faucet: `<path d="M6 14h14a6 6 0 0 1 6 6v3" ${S}/><path d="M13 14V9m-4 0h8" ${S}/><path d="M26 28v0m0 5v0" ${S}/><path d="M6 12v6" ${S}/>`,
    film: `<rect x="6" y="9" width="28" height="22" rx="2" ${S}/><path d="M6 14h28M6 26h28M11 9v5m6-5v5m6-5v5m6-5v5M11 26v5m6-5v5m6-5v5m6-5v5" ${S}/>`,
    paint: `<rect x="8" y="8" width="18" height="10" rx="2" ${S}/><path d="M26 13h4v8H17v5" ${S}/><rect x="14" y="26" width="6" height="8" rx="1" ${S}/>`,
    sand: `<rect x="6" y="22" width="28" height="8" rx="2" ${S}/><path d="M10 22c2-6 18-6 20 0" ${S}/><path d="M12 34l2-4m6 4l2-4m6 4l2-4" ${S}/>`,
    onion: `<path d="M20 6c6 6 12 10 12 18a12 12 0 0 1-24 0c0-8 6-12 12-18z" ${S}/><path d="M20 12c3 4 6 7 6 12a6 6 0 0 1-12 0c0-5 3-8 6-12z" ${S}/>`,
    bullet: `<path d="M6 20h18l8-4v8l-8-4" ${S}/><path d="M6 16v8" ${S}/><path d="M34 12l2-2m-2 18l2 2" ${S}/>`,
    seed: `<path d="M20 34V20" ${S}/><path d="M20 22c-6 0-9-4-9-9 6 0 9 4 9 9zm0-2c0-6 3-10 9-10 0 6-3 10-9 10z" ${S}/><path d="M8 34h24" ${S}/>`,
    lego: `<rect x="6" y="18" width="28" height="14" rx="1" ${S}/><rect x="10" y="12" width="7" height="6" ${S}/><rect x="23" y="12" width="7" height="6" ${S}/>`,
    road: `<path d="M12 34L16 6m12 28L24 6" ${S}/><path d="M20 10v4m0 6v4m0 6v4" ${S}/>`,
    pen: `<path d="M8 32l4-12L26 6l6 6-14 14z" ${S}/><path d="M12 20l6 6" ${S}/>`,
    camera: `<rect x="6" y="12" width="28" height="18" rx="3" ${S}/><circle cx="20" cy="21" r="6" ${S}/><path d="M14 12l2-4h8l2 4" ${S}/>`,
    rain: `<path d="M10 16a8 8 0 0 1 15-4 6 6 0 0 1 5 10H11a6 6 0 0 1-1-6z" ${S}/><path d="M13 27l-2 5m8-5l-2 5m8-5l-2 5" ${S}/>`,
    wall: `<rect x="6" y="8" width="28" height="24" ${S}/><path d="M6 16h28M6 24h28M14 8v8m10 0v8m-6 0v8m10-24v8" ${S}/>`,
    fire: `<path d="M20 34a9 9 0 0 1-9-9c0-7 6-9 7-17 4 4 11 9 11 17a9 9 0 0 1-9 9z" ${S}/><path d="M20 34a4 4 0 0 1-4-4c0-3 2-4 4-8 2 4 4 5 4 8a4 4 0 0 1-4 4z" ${S}/>`,
    ruler: `<rect x="4" y="14" width="32" height="12" rx="1" ${S}/><path d="M9 14v5m5-5v3m5-3v5m5-5v3m5-5v5" ${S}/>`,
    tile: `<rect x="6" y="6" width="12" height="12" ${S}/><rect x="22" y="6" width="12" height="12" ${S}/><rect x="6" y="22" width="12" height="12" ${S}/><rect x="22" y="22" width="12" height="12" ${S}/>`,
    stack: `<path d="M20 6l14 7-14 7-14-7z" ${S}/><path d="M6 20l14 7 14-7M6 27l14 7 14-7" ${S}/>`,
    chip: `<rect x="11" y="11" width="18" height="18" rx="2" ${S}/><path d="M15 11V6m5 5V6m5 5V6M15 34v-5m5 5v-5m5 5v-5M11 15H6m5 5H6m5 5H6M34 15h-5m5 5h-5m5 5h-5" ${S}/>`,
    gate: `<path d="M8 32V14l12-6 12 6v18" ${S}/><path d="M14 32V20h12v12" ${S}/>`,
    shovel: `<path d="M26 8l6 6-12 12-6-6z" ${S}/><path d="M14 20l-8 8 6 6 8-8" ${S}/>`,
    stairs: `<path d="M6 32h7v-7h7v-7h7v-7h7" ${S}/>`,
    money: `<circle cx="20" cy="20" r="13" ${S}/><path d="M24 15c-1-2-7-3-8 0s8 3 8 7-7 3-8 0M20 11v18" ${S}/>`,
    eye: `<path d="M4 20s6-10 16-10 16 10 16 10-6 10-16 10S4 20 4 20z" ${S}/><circle cx="20" cy="20" r="5" ${S}/>`,
    sponge: `<rect x="6" y="12" width="28" height="16" rx="3" ${S}/><circle cx="13" cy="18" r="1.5" ${S}/><circle cx="21" cy="22" r="1.5" ${S}/><circle cx="28" cy="17" r="1.5" ${S}/>`,
    bread: `<path d="M8 30V18a8 6 0 0 1 8-6h8a8 6 0 0 1 8 6v12z" ${S}/><path d="M13 20v4m7-6v4m7-2v4" ${S}/>`,
    target: `<circle cx="20" cy="20" r="13" ${S}/><circle cx="20" cy="20" r="7" ${S}/><circle cx="20" cy="20" r="1.5" ${S}/>`
  };
  U.icon = k => `<svg viewBox="0 0 40 40" aria-hidden="true">${ICON[k] || ICON.chip}</svg>`;

  U.meterHTML = (id, label) => `<div class="meter"><span>${label}</span><span class="bar"><i id="${id}"></i></span><span class="val" id="${id}-v"></span></div>`;
  U.setMeter = (el, id, frac, text, cls) => {
    const i = U.$(el, '#' + id); if (!i) return;
    i.style.width = (U.clamp(frac, 0, 1) * 100).toFixed(1) + '%';
    i.className = cls || '';
    const v = U.$(el, '#' + id + '-v'); if (v) v.textContent = text ?? '';
  };

  /* 側欄：points（≤3 點短句）、analogy {icon, t, p}、fact {v, d}、meters [[id,label]]、extra（任意 HTML） */
  U.side = o => `<div class="col">
    ${o.top || ''}
    ${o.points ? `<ul class="points simple">${o.points.map(p => `<li>${p}</li>`).join('')}</ul>` : ''}
    ${o.meters ? `<div class="meters">${o.meters.map(m => U.meterHTML(m[0], m[1])).join('')}</div>` : ''}
    ${o.extra || ''}
    ${o.fact ? `<div class="fact"><div class="v">${o.fact.v}</div><div class="d">${o.fact.d}</div></div>` : ''}
    ${o.analogy ? `<div class="analogy" style="margin-top:auto"><div class="ic">${U.icon(o.analogy.icon)}</div><div><h4>${o.analogy.t || '比喻'}</h4><p>${o.analogy.p}</p></div></div>` : ''}
  </div>`;


  /* 主區圖框 */
  U.figHTML = (id, title, right, kind) => `<div class="fig grow"><div class="fig-title"><span>${title || ''}</span><span id="${id}-r">${right || ''}</span></div><div class="fig-canvas">${kind === 'svg' ? `<svg id="${id}"></svg>` : `<canvas id="${id}"></canvas>`}</div></div>`;

  // 步驟動畫是教學內容，不跟系統「減少動態效果」（Windows 關掉動畫效果時會只剩最終畫面）；換頁淡入仍由 CSS 尊重該設定
  U.reduced = () => false;

  /* 畫布小工具 */
  U.rrect = (c, x, y, w, h, r) => { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); };
  U.txt = (c, s, x, y, o) => {
    o = o || {}; c.save(); c.font = `${o.w || 500} ${o.size || 15}px "PingFang TC","Noto Sans TC",sans-serif`;
    c.fillStyle = o.color || '#3e4b5b'; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.bg) { const m = c.measureText(s); const w = m.width + 10, hh = (o.size || 15) + 8; const x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x - 5; c.fillStyle = o.bg; c.fillRect(x0, y - hh + 5, w, hh); c.fillStyle = o.color || '#3e4b5b'; }
    c.fillText(s, x, y); c.restore();
  };
  U.dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); };
  U.rand = (a, b) => a + Math.random() * (b - a);
})();

/* 逐步動畫播放器：steps = [{t, d, draw(c, w, h, p, time)}]，p 在進入該步時由 0 平滑跑到 1 */
(function () {
  U.animSteps = function (el, ctx, o) {
    const { c, w, h } = U.canvas(U.$(el, '#' + o.canvas));
    let cur = 0, p = 1;
    const st = U.stepper(el, o.stepper, o.steps, i => { cur = i; p = U.reduced() ? 1 : 0; o.onStep && o.onStep(i); }, ctx, { interval: o.interval || 2600, start: o.start || 0 });
    ctx.raf((dt, t) => {
      p = Math.min(1, p + dt / (o.dur || 1.2));
      c.clearRect(0, 0, w, h);
      o.steps[cur].draw(c, w, h, U.ease(p), t);
    });
    return st;
  };

  /* 通用剖面畫法（canvas）：以材料名稱畫矩形，附帶標籤 */
  U.box = (c, m, x, y, w, h, o) => {
    if (w <= 0 || h <= 0) return;
    c.fillStyle = U.MAT[m] || m; c.globalAlpha = o && o.a !== undefined ? o.a : 1;
    c.fillRect(x, y, w, h); c.globalAlpha = 1;
    if (!o || o.stroke !== false) { c.strokeStyle = 'rgba(20,30,45,.3)'; c.lineWidth = 1; c.strokeRect(x + .5, y + .5, w - 1, h - 1); }
  };
  U.tag = (c, s, x, y, o) => U.txt(c, s, x, y, Object.assign({ size: 15, bg: 'rgba(255,255,255,.88)', color: '#17202b', w: 600 }, o || {}));
  U.arrow = (c, x1, y1, x2, y2, col, wd) => {
    c.strokeStyle = col || '#b3541e'; c.fillStyle = col || '#b3541e'; c.lineWidth = wd || 2;
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
    const a = Math.atan2(y2 - y1, x2 - x1), s = 8 + (wd || 2);
    c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - s * Math.cos(a - .4), y2 - s * Math.sin(a - .4)); c.lineTo(x2 - s * Math.cos(a + .4), y2 - s * Math.sin(a + .4)); c.fill();
  };
})();
