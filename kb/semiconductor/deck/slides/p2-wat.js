/* 第二部分 ⑨：WAT 晶圓允收測試（四頁）
   ① 是什麼：晶圓出廠前的健康檢查（最後一步帶到 CP、FT）　② 量什麼：把電晶體當水龍頭　④ 和線上量測對照（③ 猜謎已拿掉）
   頁序：接在 APC 之後，三頁連續，當第九章收尾（index.html） */
(function () {
  const A = Deck.add.bind(Deck);
  const EY = '第二部分 · ⑨ 檢測量測';
  const hr = v => { const q = Math.sin(v * 12.9898 + 4.1) * 43758.5453; return q - Math.floor(q); };

  /* 共用：測試流程條（on＝亮起的那一格） */
  const FLOW = ['製程中：量測、檢測', 'WAT 電性允收', 'CP 晶片針測', '封裝', 'FT 成品測試'];
  function flow(c, x, y, w, on) {
    const fw = w / FLOW.length;
    FLOW.forEach((n, k) => {
      const bx = x + k * fw, hi = Array.isArray(on) ? on.includes(k) : k === on;
      c.fillStyle = hi ? '#1f4fb5' : '#f4f6f9'; c.fillRect(bx, y, fw - 26, 30);
      c.strokeStyle = hi ? '#1f4fb5' : '#c3ccd6'; c.lineWidth = 1.2; c.strokeRect(bx, y, fw - 26, 30);
      U.txt(c, n, bx + (fw - 26) / 2, y + 20, { align: 'center', size: 13, w: hi ? 700 : 500, color: hi ? '#fff' : '#3e4b5b' });
      if (k < FLOW.length - 1) U.arrow(c, bx + fw - 24, y + 15, bx + fw - 4, y + 15, '#9aa8b8', 1.5);
    });
  }
  /* 共用：晶圓與晶片格子 */
  function wafer(c, cx, cy, R, die) {
    c.fillStyle = '#e9edf2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
    const ds = die || R * 0.2; c.fillStyle = '#c9d3df';
    for (let x = -R; x < R; x += ds) for (let y = -R; y < R; y += ds)
      if ([[x, y], [x + ds, y], [x, y + ds], [x + ds, y + ds]].every(([a, b]) => Math.hypot(a, b) < R - 3)) c.fillRect(cx + x + 1.5, cy + y + 1.5, ds - 3, ds - 3);
    c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy + R, 5, Math.PI, 0); c.fill();
  }

  /* ---------- ① WAT 是什麼：晶圓出廠前的健康檢查 ---------- */
  const PADS = 8;
  function watStep(c, w, h, i, p, t) {
    const top = 10, bot = h - 58, mh = bot - top;
    flow(c, 16, h - 40, w - 32, i === 5 ? [2, 3, 4] : i === 0 ? 0 : 1);
    if (i === 0) {
      const R = Math.min(mh * 0.44, w * 0.2), cx = 30 + R, cy = top + mh / 2;
      wafer(c, cx, cy, R);
      U.txt(c, '一片 12 吋晶圓，上面有幾百顆晶片', cx, cy + R + 22, { align: 'center', size: 14, color: '#3e4b5b' });
      const rx = cx + R + 60;
      U.txt(c, '上千道步驟全部走完', rx, top + 40, { size: 22, w: 700, color: '#17202b' });
      ['① 微影：畫出圖案', '② 蝕刻：挖出形狀', '③ 沉積：鋪上薄膜', '④ 摻雜與磊晶', '⑤ 閘極', '⑥ 平坦化', '⑦ 電晶體與導線']
        .forEach((s, k) => { const a = U.clamp(p * 8 - k, 0, 1); c.globalAlpha = a; U.txt(c, '✓ ' + s, rx, top + 84 + k * 32, { size: 17, color: '#1f7a4d' }); c.globalAlpha = 1; });
      c.globalAlpha = U.clamp(p * 8 - 7, 0, 1);
      U.txt(c, '電晶體和導線都做好了。出廠前，先量一次「電」對不對。', rx, top + 84 + 7 * 32 + 14, { size: 17, w: 700, color: '#b3541e' });
      c.globalAlpha = 1;
    } else if (i === 1) {
      // 左：小晶圓，右：放大 3×3 顆晶片與中間的走道
      const R = mh * 0.26, cx = 30 + R, cy = top + mh / 2;
      wafer(c, cx, cy, R);
      const zx = cx - R * 0.15, zy = cy - R * 0.15, zs = R * 0.36;
      c.strokeStyle = '#e8590c'; c.lineWidth = 2.5; c.strokeRect(zx, zy, zs, zs);
      const bx = cx + R + 70, bs = Math.min(mh - 20, w - bx - 30), by = top + (mh - bs) / 2;
      c.strokeStyle = 'rgba(232,89,12,.5)'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
      c.beginPath(); c.moveTo(zx + zs, zy); c.lineTo(bx, by); c.moveTo(zx + zs, zy + zs); c.lineTo(bx, by + bs); c.stroke(); c.setLineDash([]);
      const lane = bs * 0.07, die = (bs - 2 * lane) / 3;
      c.fillStyle = p > 0.3 ? '#f2c46b' : '#dfe5ec'; c.fillRect(bx, by, bs, bs);
      for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { c.fillStyle = '#9fb5e3'; c.fillRect(bx + a * (die + lane), by + b * (die + lane), die, die); U.txt(c, '晶片', bx + a * (die + lane) + die / 2, by + b * (die + lane) + die / 2 + 6, { align: 'center', size: 15, color: '#1f4fb5' }); }
      c.globalAlpha = U.clamp(p * 2 - 0.6, 0, 1);
      for (let a = 0; a < 3; a++) { const x = bx + a * (die + lane) + die * 0.2; c.fillStyle = '#b3541e'; c.fillRect(x, by + die + lane * 0.25, die * 0.6, lane * 0.5); }
      U.tag(c, '晶片之間的走道＝切割道', bx + bs / 2, by + die + lane / 2 + 5, { align: 'center', size: 15, color: '#b3541e' });
      c.globalAlpha = 1;
      U.txt(c, '之後切晶片時會被切掉，所以拿來放「測試結構」（棕色小條）', bx + bs / 2, by + bs + 20, { align: 'center', size: 14, color: '#3e4b5b' });
    } else if (i === 2 || i === 3) {
      // 放大一段切割道：一排測試墊，中間夾著小電晶體、電阻、導線孔鏈
      const sx = 30, sw = w - 60, sy = top + mh * 0.42, sh = mh * 0.26;
      c.fillStyle = '#f2c46b'; c.fillRect(sx, sy - 18, sw, sh + 36);
      c.fillStyle = '#9fb5e3'; c.fillRect(sx, top + 10, sw, sy - 28 - top - 10); c.fillRect(sx, sy + sh + 28, sw, bot - sy - sh - 38);
      U.txt(c, '晶片', sx + 10, top + 34, { size: 15, color: '#1f4fb5' }); U.txt(c, '晶片', sx + 10, sy + sh + 52, { size: 15, color: '#1f4fb5' });
      const pw = sw / (PADS * 1.7), gap = (sw - PADS * pw) / PADS, padX = k => sx + gap / 2 + k * (pw + gap);
      for (let k = 0; k < PADS; k++) { c.fillStyle = '#c9a86a'; c.fillRect(padX(k), sy, pw, sh); c.strokeStyle = '#8a6a2e'; c.lineWidth = 1; c.strokeRect(padX(k), sy, pw, sh); }
      const DUT = [['小電晶體', 0], ['電阻', 2], ['導線孔鏈', 4], ['小電晶體', 6]];
      DUT.forEach(([n, k]) => {
        const x0 = padX(k) + pw, x1 = padX(k + 1), mx = (x0 + x1) / 2;
        c.strokeStyle = '#3e4b5b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, sy + sh / 2); c.lineTo(x1, sy + sh / 2); c.stroke();
        if (n === '小電晶體') { c.fillStyle = '#5a6b7f'; c.fillRect(mx - 9, sy + sh / 2 - 9, 18, 18); }
        else if (n === '電阻') { c.strokeStyle = '#3e4b5b'; c.beginPath(); for (let q = 0; q <= 6; q++) c.lineTo(mx - 15 + q * 5, sy + sh / 2 + (q % 2 ? -7 : 7)); c.stroke(); }
        else for (let q = 0; q < 4; q++) { c.fillStyle = '#b3541e'; c.fillRect(mx - 16 + q * 9, sy + sh / 2 - 4, 5, 8); }
        if (i === 2) U.tag(c, n, mx, sy - 26, { align: 'center', size: 14, color: '#17202b' });
      });
      if (i === 2) {
        U.txt(c, '測試墊（金色）：探針要扎的地方；這一整組測試結構，廠內叫 test key', sx + sw / 2, sy + sh + 20, { align: 'center', size: 14, w: 700, color: '#8a6a2e' });
        U.txt(c, '和晶片裡的電晶體、導線用同一套製程、同時做出來 → 量它，就知道晶片做得對不對', sx + sw / 2, bot - 6, { align: 'center', size: 15, w: 700, color: '#b3541e' });
      } else {
        // 探針卡壓下來，接著讀數一行一行跳出來
        const down = U.clamp(p * 2, 0, 1), cardY = U.lerp(top - 4, sy - 70, down);
        c.fillStyle = '#3e4b5b'; c.fillRect(sx + 20, cardY, sw - 40, 26); U.txt(c, '探針卡', sx + sw / 2, cardY + 18, { align: 'center', size: 14, w: 700, color: '#fff' });
        for (let k = 0; k < PADS; k++) { const ax = padX(k) + pw / 2; c.strokeStyle = '#17202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(ax - 14, cardY + 26); c.lineTo(ax, U.lerp(cardY + 60, sy + sh * 0.4, down)); c.stroke(); }
        const R2 = [['加電壓 → 量電流', '（數字為示意）'], ['Vt 臨界電壓', '0.30 V'], ['Ion 開啟電流', '1.02 mA/µm'], ['Ioff 關閉漏電', '0.9 nA/µm'], ['接觸電阻、導線孔鏈電阻…', '…']];
        const lh = 22, bh = R2.length * lh + 14, by = bot - bh - 6, tx = sx + sw * 0.56, bw = sw * 0.44 - 8;
        c.fillStyle = 'rgba(255,255,255,.95)'; c.fillRect(tx - 12, by, bw, bh); c.strokeStyle = '#c3ccd6'; c.lineWidth = 1; c.strokeRect(tx - 12, by, bw, bh);
        R2.forEach(([a, b], k) => { const al = U.clamp(p * 6 - 1 - k, 0, 1), y = by + 22 + k * lh; c.globalAlpha = al; U.txt(c, a, tx, y, { size: 14, w: k ? 500 : 700, color: '#17202b' }); U.txt(c, b, tx + bw - 26, y, { align: 'right', size: k ? 14 : 13, w: k ? 700 : 500, color: k ? '#1f4fb5' : '#6a7888' }); c.globalAlpha = 1; });
      }
    } else if (i === 4) {
      // 和規格比：放行或扣住
      const cx = w / 2, y0 = top + 30;
      c.fillStyle = '#e8edf3'; U.rrect(c, cx - 150, y0, 300, 64, 10); c.fill();
      U.txt(c, '每一項和規格比', cx, y0 + 40, { align: 'center', size: 22, w: 700, color: '#17202b' });
      const by = y0 + 150, bw = Math.min(330, w * 0.36);
      [[cx - bw - 40, '#1f7a4d', '全部在規格內 ✓', ['晶圓放行', '送去 CP：對每一顆晶片扎針測功能']], [cx + 40, '#b3261e', '有一項超出規格 ✗', ['晶圓先扣住', '看哪幾項超、晶圓哪裡超 → 回推是哪一站', '（下一頁：每一項不合格代表什麼）']]].forEach(([x, col, hd, lines], k) => {
        const a = U.clamp(p * 3 - k * 0.6, 0, 1); c.globalAlpha = a;
        U.arrow(c, cx + (k ? 40 : -40), y0 + 66, x + bw / 2, by - 6, col, 3);
        c.fillStyle = k ? 'rgba(179,38,30,.07)' : 'rgba(31,122,77,.08)'; c.strokeStyle = col; c.lineWidth = 2; U.rrect(c, x, by, bw, 150, 10); c.fill(); c.stroke();
        U.txt(c, hd, x + bw / 2, by + 36, { align: 'center', size: 20, w: 700, color: col });
        lines.forEach((s, q) => U.txt(c, s, x + bw / 2, by + 74 + q * 28, { align: 'center', size: 16, w: q ? 500 : 700, color: q === 2 ? '#6a7888' : '#17202b' }));
        c.globalAlpha = 1;
      });
    } else {
      // WAT 之後還有兩關：CP（切割前測每一顆晶片）→ 切割、只封裝好的 → FT（封裝後測每一顆成品、分等級）
      const gap = 56, cw = (w - 40 - 2 * gap) / 3, px = k => 20 + k * (cw + gap), y0 = top + 84, y1 = bot - 74, ch = y1 - y0;
      const GOOD = '#6dbb8a', BAD = '#d9534f', PKG = '#3e4b5b';
      const pkg = (x, y, s, col) => {
        c.strokeStyle = '#8795a6'; c.lineWidth = 2;
        for (let q = 0; q < 4; q++) { const o = s * (0.2 + q * 0.2); c.beginPath(); c.moveTo(x - 5, y + o); c.lineTo(x, y + o); c.moveTo(x + s, y + o); c.lineTo(x + s + 5, y + o); c.stroke(); }
        c.fillStyle = PKG; U.rrect(c, x, y, s, s, 4); c.fill(); c.fillStyle = col || GOOD; c.fillRect(x + s * 0.3, y + s * 0.3, s * 0.4, s * 0.4);
      };
      const head = (k, t, d, col) => { U.txt(c, t, px(k) + cw / 2, top + 34, { align: 'center', size: 21, w: 700, color: col }); U.txt(c, d, px(k) + cw / 2, top + 60, { align: 'center', size: 15, color: '#3e4b5b' }); };
      const foot = (k, a, b) => { U.txt(c, a, px(k) + cw / 2, y1 + 26, { align: 'center', size: 15, w: 700, color: '#17202b' }); U.txt(c, b, px(k) + cw / 2, y1 + 50, { align: 'center', size: 14, color: '#3e4b5b' }); };
      // ① CP：晶圓還沒切，每一顆晶片都扎針；好的綠、壞的紅
      head(0, 'CP 晶片針測', '切割前・每一顆晶片', '#1f4fb5');
      const R = Math.min(cw / 2 - 6, ch / 2 - 22), cx = px(0) + cw / 2, cy = y0 + R, ds = R * 0.2, dies = [];
      for (let y = -R; y < R; y += ds) for (let x = -R; x < R; x += ds)
        if ([[x, y], [x + ds, y], [x, y + ds], [x + ds, y + ds]].every(([a, b]) => Math.hypot(a, b) < R - 3)) dies.push([x, y, hr(dies.length * 7 + 3) < (Math.hypot(x + ds / 2, y + ds / 2) > R * 0.7 ? 0.22 : 0.06)]);
      c.fillStyle = '#e9edf2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      const nd = Math.floor(U.clamp(p * 1.6, 0, 1) * dies.length);
      dies.forEach(([x, y, bad], k) => { c.fillStyle = k < nd ? (bad ? BAD : GOOD) : '#c9d3df'; c.fillRect(cx + x + 1.5, cy + y + 1.5, ds - 3, ds - 3); });
      c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
      if (nd < dies.length) { const [x, y] = dies[nd]; c.strokeStyle = '#17202b'; c.lineWidth = 2; c.strokeRect(cx + x, cy + y, ds, ds); }
      else { const g = dies.filter(d => !d[2]).length; U.txt(c, `良率 ${Math.round(g / dies.length * 100)}%（示意）`, cx, cy + R + 22, { align: 'center', size: 15, w: 700, color: '#1f7a4d' }); }
      foot(0, '每一顆都扎針，跑功能測試', '壞的在晶圓圖上做記號 → 算出良率');
      // ② 切割、只封裝好的
      c.globalAlpha = U.clamp(p * 3 - 1, 0, 1);
      U.arrow(c, px(0) + cw + 8, y0 + ch * 0.4, px(1) - 8, y0 + ch * 0.4, '#9aa8b8', 3);
      head(1, '切割、封裝', '只封裝好的晶片', '#3e4b5b');
      { const s = Math.min(cw / 6, 40), sx = px(1) + (cw - 4 * s - 3 * s * 0.5) / 2, BADI = [2, 5];
        for (let k = 0; k < 8; k++) { const x = sx + (k % 4) * s * 1.5, y = y0 + 6 + Math.floor(k / 4) * s * 1.4, bad = BADI.includes(k);
          c.fillStyle = bad ? BAD : GOOD; c.fillRect(x, y, s, s);
          if (bad) { c.strokeStyle = '#7a1a16'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, y + 4); c.lineTo(x + s - 4, y + s - 4); c.moveTo(x + s - 4, y + 4); c.lineTo(x + 4, y + s - 4); c.stroke(); } }
        const ay = y0 + 6 + s * 2.6; U.arrow(c, px(1) + cw / 2, ay, px(1) + cw / 2, ay + 34, '#9aa8b8', 3);
        const ps = Math.min(cw / 5, 54), py = ay + 48;
        for (let k = 0; k < 3; k++) pkg(px(1) + cw / 2 - 1.5 * ps - ps * 0.5 + k * ps * 1.5, py, ps);
        U.txt(c, '✕ 壞的不封裝', px(1) + cw / 2, py + ps + 30, { align: 'center', size: 14, w: 700, color: BAD }); }
      foot(1, '切開後，只把好的晶片封裝', '封裝就是第三部分的主題');
      c.globalAlpha = U.clamp(p * 3 - 2, 0, 1);
      // ③ FT：封裝後每一顆成品再測一次，依速度分等級
      U.arrow(c, px(1) + cw + 8, y0 + ch * 0.4, px(2) - 8, y0 + ch * 0.4, '#9aa8b8', 3);
      head(2, 'FT 成品測試', '封裝後・每一顆成品', '#1f4fb5');
      { const ps = Math.min(cw / 7, 40), rows = [['A 級：跑得快', GOOD, 2], ['B 級：降速出貨', '#e0a43a', 1], ['不良：淘汰', BAD, 1]], rh = Math.min((ch - 10) / 3, ps * 2.1);
        rows.forEach(([t, col, n], r) => { const y = y0 + 6 + r * rh;
          c.fillStyle = 'rgba(0,0,0,.03)'; c.strokeStyle = col; c.lineWidth = 2; U.rrect(c, px(2), y, cw, rh - 10, 8); c.fill(); c.stroke();
          for (let q = 0; q < n; q++) pkg(px(2) + 16 + q * ps * 1.5, y + (rh - 10 - ps) / 2, ps, col);
          U.txt(c, t, px(2) + cw - 14, y + (rh - 10) / 2 + 6, { align: 'right', size: 16, w: 700, color: col === GOOD ? '#1f7a4d' : col === BAD ? '#b3261e' : '#a8660a' }); }); }
      foot(2, '每一顆成品再測一次（含高低溫）', '依速度分等級出貨');
      c.globalAlpha = 1;
    }
  }
  A({
    id: 'wat', part: 2, chap: 9, eyebrow: EY, minutes: 3.8, short: 'WAT①：出廠前的健康檢查',
    title: 'WAT：晶圓出廠前的健康檢查', en: 'Wafer Acceptance Test',
    thesis: '量測看「尺寸」、檢測找「缺陷」，<b>WAT 直接量「電」</b>：整片晶圓做完後，在晶片之間走道上的<b>測試結構</b>扎針，量電晶體和導線的電性。合格才放行；不合格就扣住、回推是哪一站出問題。按「下一步」一步步看。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('w0-cv', '', '')}${U.stepperHTML('w0-st')}</div>
      ${U.side({
        points: ['<b>WAT</b>：Wafer Acceptance Test，晶圓允收測試', '量的是<b>切割道上的測試結構</b>，不是真正的晶片', 'WAT 管<b>製程</b>、CP 管<b>每一顆晶片</b>、FT 管<b>成品</b>'],
        extra: `<div class="card"><h4 style="margin-bottom:6px">三關測試比一比</h4><table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.35">${[['', '測誰', '什麼時候', '不合格'], ['WAT', '切割道的測試結構，每片幾點', '晶圓做完', '整片扣住，回推哪一站'], ['CP', '每一顆晶片的功能', '切割前', '那一顆做記號，不封裝'], ['FT', '每一顆成品', '封裝後', '淘汰或降級']].map((r, i) => `<tr style="border-top:${i ? '1px solid var(--line)' : '0'}">${r.map((x, j) => `<${i && j ? 'td' : 'th'} style="text-align:left;padding:4px 6px;${j === 0 ? 'white-space:nowrap' : ''}">${x}</${i && j ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></div>`,
        analogy: { icon: 'faucet', t: '比喻', p: '房子蓋好後的水電驗收：不拆牆，用預留的測試插座量電壓、試水壓。驗收過了才交屋；哪一路不對，就找負責的師傅。' }
      })}</div>`,
    init(el, ctx) {
      const steps = ['晶圓做完了', '晶片之間的走道：切割道', '走道上的測試結構', '探針扎下去，量電', '和規格比：放行或扣住', '後面還有兩關：CP、FT'].map((t, i) => ({ t, d: '', draw: (c, w, h, p, tt) => watStep(c, w, h, i, p, tt) }));
      U.animSteps(el, ctx, { canvas: 'w0-cv', stepper: 'w0-st', steps, interval: 3600, dur: 1.6 });
    },
    notes: `【可略】時間緊時，第六步 CP、FT 只唸右邊表格那一行：WAT 管製程、CP 管每一顆、FT 管成品。

製程中的檢查講完了。最後看晶圓做完之後的第三種檢查，也是出廠前的最後一關：WAT，Wafer Acceptance Test，晶圓允收測試。前面的量測和檢測，都是在製程中途看尺寸、找缺陷；WAT 是整片晶圓上千道步驟全部做完之後，直接量「電」，確認做出來的電晶體和導線，電性真的對。

一步一步看。第一步，晶圓做完了：前面七章的步驟全部走完，一片晶圓上有幾百顆晶片。

第二步，放大看晶片和晶片之間：中間有一條走道，叫切割道。之後切晶片的時候，這條走道會被切掉，所以廠裡拿它來放測試用的東西。

第三步，再放大這條走道：一排金色的測試墊，中間夾著小電晶體、電阻、把很多導線孔串起來的導線孔鏈。它們和晶片裡真正的電晶體、導線，是用同一套製程、同時做出來的，所以量它，就知道晶片做得對不對，又不用去碰真正的晶片。這一整組測試結構，廠裡叫 test key。

第四步，探針卡壓下來，探針扎在測試墊上，加電壓、量電流，讀出一串數字：臨界電壓、開啟電流、關閉漏電、電阻。下一頁用水龍頭來解釋這些數字各代表什麼。每片晶圓通常量幾個點。

第五步，每一項都和規格比。全部合格，晶圓放行，送去下一關 CP。有一項超出規格，晶圓先扣住，看是哪幾項超、出現在晶圓哪裡，回推是哪一站出問題；下一頁會看每一項不合格代表什麼。

第六步，WAT 之後還有兩關。CP，英文 Chip Probing，晶圓針測：晶圓還沒切開，換一張對準每一顆晶片焊墊的探針卡，一顆一顆跑功能測試，電路會不會動、速度夠不夠、待機漏電多少。注意差別：WAT 量的是走道上的測試結構，回答「這片晶圓的製程對不對」；CP 測的是每一顆真正的晶片，回答「這一顆能不能用」。壞的晶片在電子晶圓圖上做記號，好的比例就是良率。記憶體晶片還可以在這一步啟用備用電路，把壞掉的部分修起來。接著切割，只把好的晶片拿去封裝，這就是第三部分的主題。封裝完再做 FT，Final Test，成品測試：每一顆成品再測一次，包括高溫、低溫，並依速度分等級，跑得快的賣得比較貴。

所以三關各管一件事：WAT 管製程、CP 管每一顆晶片、FT 管成品。就像房子蓋好後的水電驗收：不拆牆，用預留的測試插座量電壓、試水壓，過了才交屋。`
  });

  /* ---------- ② WAT 量什麼：把電晶體當成水龍頭 ---------- */
  const WI = [
    { k: 'vt', n: 'Vt 臨界電壓', a: '把手要轉多少，才開始出水', how: '慢慢加大閘極電壓，電流開始變大時的那個電壓', bad: '太低：輕輕一碰就出水，關不緊；太高：要轉很多才出水，開得慢' },
    { k: 'ion', n: 'Ion 開啟電流', a: '把手全開時，水流多大', how: '閘極加到正常工作的電壓，量流過去的電流', bad: '太小：電晶體跑不快；太大：通常代表關不緊、漏電也大' },
    { k: 'ioff', n: 'Ioff 關閉漏電', a: '把手關緊了，還在滴水', how: '閘極不加電壓，量還漏過去的電流', bad: '太大：手機放著不用也在耗電、發熱' },
    { k: 'ig', n: 'Ig 閘極漏電', a: '水從把手的墊片漏出來', how: '閘極加電壓，量直接穿過絕緣層的電流', bad: '太大：絕緣牆太薄或有缺陷（第 36 頁）' },
    { k: 'rc', n: 'Rc 接觸電阻', a: '水管接頭太窄、卡卡的', how: '讓電流流過一串接點，量電阻', bad: '太大：電晶體本身沒事，但電送不進去、出不來' },
    { k: 'via', n: '導線孔鏈電阻', a: '整棟樓的水管接頭有沒有堵', how: '把上千個導線孔串成一條鏈，量總電阻', bad: '太大或不通：有導線孔沒填滿、斷掉' }
  ];
  // 左：水龍頭（比喻）
  function faucet(c, x0, y0, W, H, k, t) {
    const py = y0 + H * 0.46, pt = 22, tx = x0 + 10, tw = W * 0.16, vx = x0 + W * 0.5, ox = x0 + W * 0.8;
    let ang = 0, flowQ = 0, rcBad = k === 'rc';
    if (k === 'vt') { const ph = (t * 0.35) % 1; ang = ph < 0.8 ? ph / 0.8 * 90 : 90; flowQ = U.clamp((ang - 30) / 60, 0, 1); }
    if (k === 'ion') { ang = 90; flowQ = 1; }
    if (k === 'rc') { ang = 90; flowQ = 0.45; }
    if (k === 'ig') { ang = 60; flowQ = 0.5; }
    // 水塔（源極）
    c.fillStyle = '#c9d3df'; c.fillRect(tx, y0 + 16, tw, py - y0 + pt / 2 - 16); c.fillStyle = '#7fb0e6'; c.fillRect(tx + 4, y0 + 46, tw - 8, py - y0 + pt / 2 - 50);
    U.txt(c, '水塔', tx + tw / 2, y0 + 12, { align: 'center', size: 13, w: 700, color: '#3e4b5b' }); U.txt(c, '（源極）', tx + tw / 2, py + pt / 2 + 20, { align: 'center', size: 14, color: '#3e4b5b' });
    // 水管＋兩個接頭
    c.fillStyle = '#9aa8b8'; c.fillRect(tx + tw, py - pt / 2, ox - tx - tw, pt);
    [tx + tw + 14, ox - 20].forEach(jx => {
      const nar = rcBad ? 0.35 : 1;
      c.fillStyle = rcBad ? '#d0621e' : '#6a7888'; c.fillRect(jx - 7, py - pt / 2 - 6, 14, pt + 12);
      if (rcBad) { c.fillStyle = '#3e4b5b'; c.fillRect(jx - 7, py - pt / 2, 14, pt * (1 - nar) / 2); c.fillRect(jx - 7, py + pt / 2 - pt * (1 - nar) / 2, 14, pt * (1 - nar) / 2); }
    });
    if (rcBad) U.tag(c, '接頭太窄（Rc 高）', tx + tw + 14, py - pt / 2 - 18, { align: 'left', size: 13, color: '#b3541e' });
    // 水在管子裡流：點點越密越快
    const n = Math.round(flowQ * 14);
    for (let q = 0; q < n; q++) { const f = (t * (0.4 + flowQ * 0.6) + q / Math.max(n, 1)) % 1; U.dot(c, U.lerp(tx + tw, ox, f), py, 3, '#1f4fb5'); }
    // 閥門與把手（閘極），把手下面是墊片（絕緣層）
    c.fillStyle = '#5a6b7f'; c.fillRect(vx - 26, py - pt / 2 - 12, 52, pt + 24);
    c.fillStyle = k === 'ig' ? '#e8a05a' : '#e6dcc8'; c.fillRect(vx - 18, py - pt / 2 - 20, 36, 8);
    c.fillStyle = '#3e4b5b'; c.fillRect(vx - 4, py - pt / 2 - 52, 8, 32);
    c.save(); c.translate(vx, py - pt / 2 - 52); c.rotate(-ang * Math.PI / 180); c.fillStyle = '#b3261e'; U.rrect(c, -40, -7, 80, 14, 6); c.fill(); c.restore();
    U.txt(c, '把手（閘極）', vx, y0 + 12, { align: 'center', size: 13, w: 700, color: '#3e4b5b' });
    U.txt(c, '墊片（絕緣層）', vx + 30, py - pt / 2 - 22, { size: 14, color: k === 'ig' ? '#b3541e' : '#3e4b5b' });
    if (k === 'ig') for (let q = 0; q < 3; q++) { const f = (t * 0.8 + q / 3) % 1; U.dot(c, vx - 14 + q * 14, py - pt / 2 - 12 + f * 70, 3.5, '#1f4fb5'); }
    if (k === 'vt') {
      const gx = vx, gy = py - pt / 2 - 52, gr = 58;
      c.strokeStyle = '#d3dbe4'; c.lineWidth = 6; c.beginPath(); c.arc(gx, gy, gr, -Math.PI / 2, 0); c.stroke();
      c.strokeStyle = '#1f7a4d'; c.beginPath(); c.arc(gx, gy, gr, -Math.PI / 2 + Math.PI / 6, 0); c.stroke();
      U.tag(c, ang < 30 ? `轉了 ${Math.round(ang)}°：還沒出水` : `轉了 ${Math.round(ang)}°：出水了`, gx + gr + 10, gy - gr + 8, { size: 13, color: ang < 30 ? '#6a7888' : '#1f7a4d' });
    }
    // 出水口（汲極）與水桶
    c.fillStyle = '#9aa8b8'; c.fillRect(ox - 4, py - pt / 2, 26, pt); c.fillRect(ox + 4, py, 18, 38);
    U.txt(c, '出水口（汲極）', ox + 12, y0 + 12, { align: 'center', size: 13, w: 700, color: '#3e4b5b' });
    const bkY = py + 120, bkX = ox - 30;
    c.strokeStyle = '#6a7888'; c.lineWidth = 2; c.beginPath(); c.moveTo(bkX, bkY - 50); c.lineTo(bkX + 6, bkY); c.lineTo(bkX + 76, bkY); c.lineTo(bkX + 82, bkY - 50); c.stroke();
    if (flowQ > 0.02) { c.fillStyle = 'rgba(31,79,181,.6)'; c.fillRect(ox + 13 - flowQ * 6, py + 38, flowQ * 12, bkY - py - 40); }
    if (k === 'ioff') { const f = (t * 0.9) % 1; U.dot(c, ox + 13, py + 40 + f * (bkY - py - 44), 4, '#1f4fb5'); U.tag(c, '關緊了還在滴（Ioff）', ox - 10, py + 70, { align: 'right', size: 13, color: '#b3541e' }); }
    const lvl = k === 'ion' ? ((t * 0.25) % 1) : k === 'vt' ? flowQ * 0.6 : k === 'rc' ? 0.3 : k === 'ig' ? 0.3 : 0.05;
    c.fillStyle = 'rgba(31,79,181,.35)'; c.fillRect(bkX + 6, bkY - 48 * lvl, 70, 48 * lvl);
    if (k === 'ion') U.tag(c, '全開：一秒裝多少水（Ion）', bkX - 10, bkY + 20, { align: 'right', size: 13, color: '#1f4fb5' });
    if (k === 'ig') U.tag(c, '墊片漏水（Ig）', vx - 30, py + pt / 2 + 66, { align: 'right', size: 13, color: '#b3541e' });
  }
  // 左：整棟樓的水管（導線孔鏈）
  function building(c, x0, y0, W, H, t) {
    const fl = 5, bw = W * 0.5, bx = x0 + (W - bw) / 2, fh = (H - 40) / fl, by = y0 + 20;
    for (let f = 0; f < fl; f++) { c.fillStyle = f % 2 ? '#f2f5f8' : '#e9edf2'; c.fillRect(bx, by + f * fh, bw, fh); U.txt(c, `${fl - f} 樓`, bx - 8, by + f * fh + fh / 2 + 5, { align: 'right', size: 14, color: '#3e4b5b' }); }
    // 一條水管蛇行上下樓，每層樓之間一個接頭（導線孔）；其中一個堵住
    const pts = []; for (let f = 0; f <= fl; f++) pts.push([bx + (f % 2 ? bw * 0.75 : bw * 0.25), by + (fl - f) * fh]);
    c.strokeStyle = '#9aa8b8'; c.lineWidth = 10; c.beginPath(); pts.forEach(([x, y], q) => q ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    pts.slice(1, -1).forEach(([x, y], q) => { const bad = q === 2; c.fillStyle = bad ? '#b3261e' : '#6a7888'; c.beginPath(); c.arc(x, y, bad ? 9 : 7, 0, 7); c.fill(); if (bad) U.tag(c, '這個接頭堵住了', x + 14, y + 5, { size: 13, color: '#b3261e' }); });
    for (let q = 0; q < 8; q++) { const f = ((t * 0.2 + q / 8) % 1) * 0.55, seg = Math.floor(f * fl), fr = f * fl - seg; const [ax, ay] = pts[seg], [bx2, by2] = pts[seg + 1]; U.dot(c, U.lerp(ax, bx2, fr), U.lerp(ay, by2, fr), 3, '#1f4fb5'); }
    U.txt(c, '水只流到堵住的地方 → 整條串起來量，總阻力就會變大', x0 + W / 2, y0 + H + 4, { align: 'center', size: 13, w: 700, color: '#b3541e' });
  }
  // 右：真的電晶體剖面，亮起對應的部位
  function device(c, x0, y0, W, H, k, t) {
    const sub = y0 + H * 0.7, gx = x0 + W / 2, gw = W * 0.22;
    const on = (...ks) => ks.includes(k);
    U.box(c, 'si', x0, sub, W, H * 0.22);
    c.fillStyle = '#9fb5e3'; c.fillRect(x0 + W * 0.08, sub, W * 0.24, H * 0.1); c.fillRect(x0 + W * 0.68, sub, W * 0.24, H * 0.1);
    U.txt(c, '源極', x0 + W * 0.2, sub + H * 0.07, { align: 'center', size: 15, w: 700, color: '#17202b' }); U.txt(c, '汲極', x0 + W * 0.8, sub + H * 0.07, { align: 'center', size: 15, w: 700, color: '#17202b' });
    // 通道（亮起：Vt、Ion、Ioff）
    c.fillStyle = on('vt', 'ion', 'ioff') ? 'rgba(232,89,12,.45)' : 'rgba(0,0,0,0)'; c.fillRect(gx - gw / 2, sub, gw, 8);
    // 絕緣層、閘極
    c.fillStyle = on('ig') ? '#e8a05a' : '#f2e3b3'; c.fillRect(gx - gw / 2, sub - 8, gw, 8);
    c.fillStyle = on('vt', 'ion', 'ioff') ? '#d0621e' : '#5a6b7f'; c.fillRect(gx - gw / 2, sub - H * 0.2, gw, H * 0.2 - 8);
    U.txt(c, '閘極', gx, sub - H * 0.1, { align: 'center', size: 15, w: 700, color: '#fff' });
    // 接點（Rc）
    [x0 + W * 0.2, x0 + W * 0.8].forEach(x => { c.fillStyle = on('rc') ? '#d0621e' : '#8a95a3'; c.fillRect(x - 6, sub - H * 0.3, 12, H * 0.3); });
    // 導線與導線孔（via）
    const m1 = sub - H * 0.36, m2 = sub - H * 0.56;
    c.fillStyle = '#c9a86a'; c.fillRect(x0 + W * 0.05, m1, W * 0.3, 10); c.fillRect(x0 + W * 0.65, m1, W * 0.3, 10); c.fillRect(x0 + W * 0.05, m2, W * 0.9, 10);
    [x0 + W * 0.25, x0 + W * 0.75].forEach(x => { c.fillStyle = on('via') ? '#d0621e' : '#a88a52'; c.fillRect(x - 5, m2 + 10, 10, m1 - m2 - 10); });
    U.txt(c, '導線', x0 + W * 0.5, m2 - 6, { align: 'center', size: 15, w: 700, color: '#8a6a2e' });
    // 標示：量的地方以外都淡掉，量的地方加閃爍粗框，再拉虛線到下方的說明
    const HL = { vt: [[gx - gw / 2, sub - H * 0.2, gw, H * 0.2 + 10]], ion: [[x0 + W * 0.3, sub, W * 0.4, 10]], ioff: [[x0 + W * 0.3, sub, W * 0.4, 16]], ig: [[gx - gw / 2, sub - 8, gw, 8]],
      rc: [[x0 + W * 0.2 - 6, sub - H * 0.3, 12, H * 0.3], [x0 + W * 0.8 - 6, sub - H * 0.3, 12, H * 0.3]], via: [[x0 + W * 0.25 - 5, m2 + 10, 10, m1 - m2 - 10], [x0 + W * 0.75 - 5, m2 + 10, 10, m1 - m2 - 10]] }[k];
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.rect(x0 - 2, m2 - 24, W + 4, sub + H * 0.22 - m2 + 26); HL.forEach(([x, y, ww, hh]) => c.rect(x, y, ww, hh)); c.fill('evenodd');
    c.globalAlpha = 0.55 + 0.45 * Math.sin(t * 5); c.strokeStyle = '#e8590c'; c.lineWidth = 3;
    HL.forEach(([x, y, ww, hh]) => c.strokeRect(x - 7, y - 7, ww + 14, hh + 14)); c.globalAlpha = 1;
    // 電子：開的時候流過通道；Ioff 時少量漏；Ig 時往上穿過絕緣層
    if (on('ion', 'vt')) for (let q = 0; q < 6; q++) { const f = (t * 0.5 + q / 6) % 1; U.electron(c, U.lerp(x0 + W * 0.2, x0 + W * 0.8, f), sub + 4, 3); }
    if (on('ioff')) { const f = (t * 0.3) % 1; U.electron(c, U.lerp(x0 + W * 0.2, x0 + W * 0.8, f), sub + 12, 3, true); }
    if (on('ig')) for (let q = 0; q < 2; q++) { const f = (t * 0.6 + q / 2) % 1; U.electron(c, gx - 10 + q * 20, U.lerp(sub + 4, sub - 20, f), 3, true); }
    const lab = { vt: '閘極控制通道打不打開', ion: '通道打開時流過的電子', ioff: '關著時還漏過通道的電子', ig: '穿過絕緣層的電子', rc: '源極、汲極接出來的接點', via: '上面一層層導線之間的導線孔' }[k];
    const bx = x0 + W / 2, by = y0 + H + 10;
    c.strokeStyle = 'rgba(232,89,12,.85)'; c.lineWidth = 2; c.setLineDash([6, 4]);
    HL.forEach(([x, y, ww, hh]) => { c.beginPath(); c.moveTo(bx, by - 24); c.lineTo(x + ww / 2, y + hh + 8); c.stroke(); }); c.setLineDash([]);
    U.tag(c, '量這裡：' + lab, bx, by, { align: 'center', size: 18, color: '#b3541e' });
  }
  A({
    id: 'wat2', part: 2, chap: 9, eyebrow: EY, minutes: 2.5, short: 'WAT②：量什麼（水龍頭）',
    title: 'WAT 量什麼：把電晶體當成水龍頭', en: 'What WAT Measures',
    thesis: '還記得第一部分嗎？電晶體就是<b>用電壓控制的水龍頭</b>：源極是水塔、閘極是把手、汲極是出水口。WAT 量的，就是這個水龍頭<b>開得對不對、關得緊不緊、接頭和水管通不通</b>。點每一項看看。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('w2-k', WI.map(x => x.n), 0)}</div>
        ${U.figHTML('w2-cv', '左：水龍頭（比喻）　右：真的電晶體（亮起的就是這一項在量的地方）', '')}</div>
      ${U.side({
        top: `<div class="card key"><h4 id="w2-h" style="text-transform:none;letter-spacing:0;font-family:inherit;font-size:20px;font-weight:700"></h4><p id="w2-a" style="font-size:18px;margin:0 0 8px;color:var(--accent-2);font-weight:700"></p><p id="w2-d" style="font-size:16px;margin:0"></p></div>`,
        points: ['前三項看<b>開關本身</b>：開得動、開得夠大、關得緊', '後三項看<b>周邊</b>：墊片漏不漏、接頭和水管通不通', '每一項都有規格範圍，超出就是不合格'],
        analogy: { icon: 'faucet', t: '比喻', p: '驗收一個水龍頭：轉多少才出水、全開水量多大、關緊會不會滴、把手會不會漏、接頭和水管有沒有堵。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#w2-cv'));
      let k = 'vt';
      U.onSeg(el, 'w2-k', i => {
        const it = WI[i]; k = it.k;
        U.$(el, '#w2-h').textContent = it.n; U.$(el, '#w2-a').textContent = '比喻：' + it.a;
        U.$(el, '#w2-d').innerHTML = `<b>怎麼量：</b>${it.how}<br><b>不合格代表：</b>${it.bad}`;
      });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const LW = w * 0.6, y0 = 20, H = h - 70;
        U.txt(c, '比喻：水龍頭', 16, 16, { size: 15, w: 700, color: '#17202b' });
        if (k === 'via') building(c, 16, y0 + 10, LW - 20, H - 10, t); else faucet(c, 16, y0 + 10, LW - 20, H - 10, k, t);
        c.strokeStyle = '#e3e8ee'; c.lineWidth = 1; c.beginPath(); c.moveTo(LW + 6, 10); c.lineTo(LW + 6, h - 10); c.stroke();
        U.txt(c, '實際：電晶體剖面（示意）', LW + 24, 16, { size: 15, w: 700, color: '#17202b' });
        device(c, LW + 24, y0 + 30, w - LW - 40, H - 40, k, t);
      });
    },
    notes: `WAT 量的那一串數字，各代表什麼？用第一部分的水龍頭來看：源極是水塔，通道是水管，閘極是把手，汲極是出水口，絕緣層是把手和水管之間的墊片。左邊是水龍頭，右邊是真的電晶體，亮起來的就是這一項在量的地方。

前三項看開關本身。第一項 Vt，臨界電壓：把手要轉多少才開始出水。實際上是慢慢加大閘極電壓，看電流什麼時候開始變大。太低，輕輕一碰就出水、關不緊；太高，要轉很多才出水、開得慢。第二項 Ion，開啟電流：把手全開時水流多大，越大電晶體越快。第三項 Ioff，關閉漏電：把手關緊了，還在滴水，滴越多，手機放著不用也越耗電。

後三項看周邊。第四項 Ig，閘極漏電：水從把手的墊片漏出來，就是第 36 頁電子穿過絕緣牆。第五項 Rc，接觸電阻：水管的接頭太窄、卡卡的，電晶體本身沒事，但水送不進去、出不來。第六項是導線孔鏈：把整棟樓上千個水管接頭串成一條來量，只要有一個堵住，總阻力就變大，代表有導線孔沒填滿或斷掉。

每一項都有規格範圍。WAT 不合格時，就是看哪幾項超、出現在晶圓哪裡，回推是哪一站出問題：例如 Vt 偏低加上漏電變大，多半是閘極做太細；只有接觸電阻高，是中段接點。

下一頁是第九章最後一頁：把 WAT 量到的電性，和前面 OCD 量到的尺寸放在一起看。`
  });

  /* ---------- ④ 用：測試點與電性模型（示意） ---------- */
  const WS = [];
  for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) { const x = i * 0.22, y = j * 0.22; if (Math.hypot(x, y) <= 0.9) WS.push([x, y]); }
  const WK = 9.4, WB = 3.5;  // 正常關係：線寬每細 1 nm，Ion 約大 9.4%（示意）
  // s：0 正常、1 閘極太細、2 接點電阻高、5 一邊偏（3、4 是原本猜謎用的情境）
  const wCalc = s => WS.map(([x, y], k) => {
    const r = Math.hypot(x, y) / 0.9, n = q => hr(k * 11 + q * 17 + 500) - 0.5;
    let cd = 15 + n(0) * 1.6;   // 累積很多片、含粗細不同的實驗批，線寬才拉得開
    if (s === 1) cd -= 1.6 * (0.2 + 0.8 * r * r);
    const d = 15 - cd;
    let vt = 0.3 - 0.04 * d + n(1) * 0.012, ion = 100 + WK * d + n(2) * 2, ioff = Math.pow(10, 0.78 * d + n(3) * 0.25), ig = Math.pow(10, n(4) * 0.3), rc = 100 + n(5) * 6, via = 100 + n(6) * 6;
    if (s === 2) { rc *= 1.6; ion *= 0.86; }
    if (s === 3) { ig *= 40; vt -= 0.015; ion *= 1.04; }
    if (s === 4 && Math.hypot(x - 0.45, y + 0.35) < 0.3) via *= 1.9;
    if (s === 5) { vt += 0.06 * x; ion -= 11 * x; ioff *= Math.pow(10, -0.6 * x); }
    return { cd, vt, ion, ioff, ig, rc, via };
  });
  /* ---------- ④ 和線上量測對照：尺寸和電性對得上嗎？ ---------- */
  const WR = [
    { s: 0, n: '① 正常', h: '點排成一條線', d: '線寬細一點，電流就大一點，關係正常。這條線本身，就是拿線上量測和 WAT 一起畫出來的。' },
    { s: 1, n: '② 閘極太細', h: '點沿著線往左上跑：兩邊對得上', d: 'OCD 量到線寬變細，WAT 的電流就跟著變大，正好落在線上 → 問題就是閘極線寬。接著要問：線上量測早就看到線寬偏了，為什麼 SPC 沒攔下來？常見原因：每片只抽幾點、偏最多的外圈沒抽到，或管制線訂得太鬆。' },
    { s: 2, n: '③ 接點電阻高', h: '線寬正常，電流卻掉到線下方', d: '尺寸量起來都對，電流卻整批偏低 → 不是閘極尺寸的問題，要往尺寸以外找：WAT 的接觸電阻偏高，指向中段接點。' },
    { s: 5, n: '④ 一邊偏', h: '線寬一樣，電流卻上下散開', d: '每個點的線寬都差不多，電流卻上下散開 → 也不是尺寸的問題。查 WAT 的 Vt 在晶圓上的分布：一邊高一邊低，指向閘極金屬（功函數金屬）厚度或退火不均。' }
  ];
  A({
    id: 'wat4', part: 2, chap: 9, eyebrow: EY, minutes: 3, short: 'WAT④：和線上量測對照',
    title: 'WAT 和線上量測對照：尺寸和電性對得上嗎？', en: 'Inline Metrology vs WAT',
    thesis: '每個測試點都有兩個數字：製程中 <b>OCD 量到的線寬</b>，和最後 <b>WAT 量到的電流</b>。正常時兩者排成<b>一條線</b>：線寬細一點，電流大一點。<b>點沿著線跑，問題就是尺寸；點離開這條線，就要往尺寸以外找。</b>',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('w4-s', WR.map(x => x.n), 0)}<button class="btn" type="button" id="w4-rp">↻ 重畫</button></div>
        ${U.figHTML('w4-cv', '每個點是一個量測位置（累積很多片晶圓）：橫軸＝線上量到的閘極線寬，縱軸＝WAT 量到的開啟電流', '')}</div>
      ${U.side({
        top: `<div class="card key"><h4 id="w4-h" style="text-transform:none;letter-spacing:0;font-family:inherit;font-size:19px;font-weight:700"></h4><p id="w4-d" style="font-size:16px;margin:0"></p></div>`,
        points: ['<b>沿著線跑</b> → 問題就是尺寸', '<b>尺寸正常、電流離開線</b> → 往尺寸以外找', '廠裡也用這條線，決定線上量測的規格要訂多嚴'],
        extra: `<div class="card" style="padding:10px 14px"><h4 style="margin-bottom:6px">第九章收尾：量測工程師的四件事</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 14px;font-size:15.5px;line-height:1.4">${['① 選工具和量測點', '② 設管制線', '③ 判定並回饋機台', '④ 量不準時追原因'].map(x => `<span>${x}</span>`).join('')}</div></div>`,
        analogy: { icon: 'ruler', t: '比喻', p: '體重和跑步成績：體重重一點，通常跑慢一點。體重正常卻跑很慢，就不是體重的問題，要找別的原因，例如腳受傷。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#w4-cv'));
      const H = U.$(el, '#w4-h'), D = U.$(el, '#w4-d');
      const N = WS.length, DT = 1.6 / N;
      let si = 0, pt = 0, data = wCalc(0);
      U.onSeg(el, 'w4-s', i => { si = i; data = wCalc(WR[i].s); pt = 0; H.textContent = WR[i].h; H.style.color = i ? '#b3261e' : '#1f7a4d'; D.textContent = WR[i].d; });
      U.$(el, '#w4-rp').onclick = () => { pt = 0; };
      ctx.raf(dt => {
        pt += dt; c.clearRect(0, 0, w, h);
        const x0 = 80, x1 = w * 0.7, y0 = 24, y1 = h - 56, cmin = 12.4, cmax = 16.2, imin = 70, imax = 130;
        const X = v => x0 + (v - cmin) / (cmax - cmin) * (x1 - x0), Y = v => y1 - (U.clamp(v, imin, imax) - imin) / (imax - imin) * (y1 - y0), L = cd => 100 + WK * (15 - cd);
        // 正常關係的帶子與線
        c.fillStyle = 'rgba(106,120,136,.16)'; c.beginPath(); c.moveTo(X(cmin), Y(L(cmin) + WB)); c.lineTo(X(cmax), Y(L(cmax) + WB)); c.lineTo(X(cmax), Y(L(cmax) - WB)); c.lineTo(X(cmin), Y(L(cmin) - WB)); c.fill();
        c.strokeStyle = '#6a7888'; c.lineWidth = 2; c.setLineDash([7, 5]); c.beginPath(); c.moveTo(X(cmin), Y(L(cmin))); c.lineTo(X(cmax), Y(L(cmax))); c.stroke(); c.setLineDash([]);
        U.tag(c, '正常關係：線寬細一點，電流大一點', X(13.0), Y(L(13.0)) - 24, { size: 14, color: '#3e4b5b' });
        // 軸
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0, y1); c.lineTo(x1, y1); c.stroke();
        for (let v = 13; v <= 16; v++) U.txt(c, v + ' nm', X(v), y1 + 18, { align: 'center', size: 13, color: '#6a7888' });
        U.txt(c, '← 線寬細', X(13), y1 + 38, { align: 'center', size: 12, color: '#6a7888' }); U.txt(c, '線寬粗 →', X(16), y1 + 38, { align: 'center', size: 12, color: '#6a7888' });
        for (let v = 80; v <= 120; v += 20) U.txt(c, v + '%', x0 - 8, Y(v) + 5, { align: 'right', size: 13, color: '#6a7888' });
        U.txt(c, '電流大 ↑', x0 - 8, y0 + 4, { align: 'right', size: 12, color: '#6a7888' });
        U.txt(c, '線上量測：閘極線寬（OCD）', (x0 + x1) / 2, y1 + 38, { align: 'center', size: 14, w: 700, color: '#3e4b5b' });
        U.txt(c, 'WAT：開啟電流', x0 + 8, y0 + 4, { size: 14, w: 700, color: '#3e4b5b' });
        // 點
        let off = 0, n = 0;
        data.forEach((o, k) => { if (pt < 0.2 + (k + 1) * DT) return; n++; const bad = Math.abs(o.ion - L(o.cd)) > WB; off += bad; U.dot(c, X(o.cd), Y(o.ion), 5, bad ? '#d0621e' : '#1f4fb5'); });
        if (si === 1 && n === N) { U.arrow(c, X(15.1), Y(L(15.1)) + 34, X(13.6), Y(L(13.6)) + 34, '#1f4fb5', 2.5); U.txt(c, '線寬變細 → 電流變大', X(14.35), Y(L(14.35)) + 58, { align: 'center', size: 13, w: 700, color: '#1f4fb5' }); }
        if (si === 2 && n === N) { U.arrow(c, X(15), Y(L(15)) + 6, X(15), Y(L(15)) + 70, '#d0621e', 2.5); U.txt(c, '線寬沒變，電流掉下來', X(15) - 10, Y(L(15)) + 56, { align: 'right', size: 13, w: 700, color: '#d0621e' }); }
        // 右：圖例與統計
        const rx = x1 + 34;
        U.dot(c, rx + 6, y0 + 26, 6, '#1f4fb5'); U.txt(c, '在線上', rx + 20, y0 + 31, { size: 15, color: '#17202b' });
        U.dot(c, rx + 6, y0 + 56, 6, '#d0621e'); U.txt(c, '離開這條線', rx + 20, y0 + 61, { size: 15, color: '#17202b' });
        if (n === N) U.txt(c, `離開的點：${off} / ${N}`, rx, y0 + 110, { size: 19, w: 700, color: off ? '#b3541e' : '#1f7a4d' });
        const tip = [['沿著線跑', '問題就是尺寸'], ['尺寸正常、離開線', '往尺寸以外找']];
        tip.forEach(([a, b], k) => { U.txt(c, a, rx, y1 - 70 + k * 44, { size: 14, w: 700, color: '#17202b' }); U.txt(c, '→ ' + b, rx, y1 - 50 + k * 44, { size: 14, color: '#3e4b5b' }); });
      });
    },
    notes: `第九章最後一頁，把 WAT 和前面的 OCD 放在一起看。每個測試點都有兩個數字：製程中 OCD 量到的閘極線寬，和最後 WAT 量到的開啟電流。橫軸是線寬，縱軸是電流，每個點是一個量測位置，累積了很多片晶圓，還有故意做粗、做細的實驗批，線才畫得出來。

① 正常的時候，點會排成一條線：線寬細一點，電流就大一點。這條線本身，就是廠裡拿線上量測和 WAT 一起畫出來的。

② 閘極太細：點沿著這條線往左上跑，線寬變細、電流變大，兩邊對得上，所以問題就是閘極線寬。接著要問：線上量測早就看到線寬偏了，為什麼 SPC 沒攔下來？常見原因有兩個：線上量測每片只抽幾個點，偏最多的外圈沒抽到；或管制線訂得比電性需要的鬆。所以廠裡會拿這條線，回頭決定線上量測的規格要訂多嚴。

③ 接點電阻高：線寬都正常，電流卻整批掉到線下方。尺寸量起來都對，電流卻不對，就不是尺寸的問題，要往尺寸以外找，WAT 的接觸電阻偏高，指向中段接點。

④ 一邊偏：線寬都差不多，電流卻上下散開，也不是尺寸的問題，查 WAT 的 Vt 在晶圓上的分布，一邊高一邊低。環繞式的通道幾乎不摻雜，Vt 主要由閘極金屬決定，所以指向閘極金屬的厚度或退火不均。

就像體重和跑步成績：體重重一點，通常跑慢一點；體重正常卻跑很慢，就要找別的原因。廠裡也靠這條線決定線上量測的規格要訂多嚴：線寬差多少，電流就會超規格。WAT 量到的電流和漏電，也是第八章 TCAD 校正、以及給晶片設計者用的元件模型的重要資料。數字都是示意。

第九章到這裡。右邊這張小卡把整章收成一句：量測工程師每天做四件事，選工具和量測點、設管制線、判定並回饋機台、量不準時追原因。你們之後的工作，大概就是這四件事的組合。

WAT 合格之後，晶圓送去 CP、切割、封裝，封裝就是第三部分要講的。在那之前，下一章先把鏡頭拉遠：一顆晶片從設計圖到量產的整條路，這些量測數據最後又怎麼變成良率。`
  });
})();
