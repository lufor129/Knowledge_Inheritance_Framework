/* 第二部分：章節頁、製程循環、剖面走一遍 */
(function () {
  /* 製程循環的 5 站（口訣：鋪、畫、挖、改、磨），和第二部分的章節對應 */
  const STEPS = [
    ['鋪', '沉積', '在晶圓表面鋪一層新材料', '像在蛋糕上抹一層奶油'],
    ['畫', '微影', '塗光阻、曝光、顯影：用光把圖案畫上去', '像先貼好膠帶，決定哪裡要噴漆'],
    ['挖', '蝕刻', '把沒被光阻保護的材料挖掉', '像照著模板用噴砂刻字'],
    ['改', '摻雜', '打入少量雜質，改變矽的導電性', '像在麵團裡加一點點酵母'],
    ['磨', '平坦化', '把表面磨平，準備蓋下一層', '像用砂紙把桌面磨平']
  ];

  Fig.add('p2', {
    raw: true, cls: 'divider-slide', render: () => `<div class="divider-grid"><div class="divider-num"><div class="l">Part</div><div class="n">02</div></div>
      <div class="divider-body"><div class="s-eyebrow">PART 2 · 約 149 分鐘</div><h2>製造：從電晶體到量產（十章）</h2>
      <p class="q">晶片是<b style="color:var(--accent-2)">一層一層蓋、一層一層刻</b>出來的。每蓋一層，都要重複「鋪、畫、挖、改、磨」這幾個動作。</p>
      <div class="cards" style="max-width:1200px;grid-template-columns:repeat(5,1fr)">
        ${[['litho1', '① 微影', '用光畫出圖案'], ['etch1', '② 蝕刻', '挖掉不要的部分'], ['depo4', '③ 沉積', '鋪上新的薄膜'], ['dope1', '④ 摻雜與磊晶', '調整導電性、長出晶體'],
           ['hk1', '⑤ 閘極與高介電', '做出最關鍵的開關'], ['cmp1', '⑥ 平坦化', '把每一層磨平'], ['gaaflow', '⑦ 環繞式與導線', '組合成電晶體，再接上導線'], ['tcad1', '⑧ 模擬', '先在電腦裡算'], ['eyes', '⑨ 檢測量測', '找缺陷、量尺寸，把關每一步'], ['d2m', '⑩ 從設計到量產', '下線、新製程、良率學習']]
          .map(([id, h, p]) => `<button type="button" class="card go-card" data-go="${id}"><h4>${h} →</h4><p>${p}</p></button>`).join('')}
      </div><p class="gloss">①–⑥ 是六大核心技術；⑦ 把它們組合成環繞式電晶體，再接上中段、後段導線；⑧ 先在電腦裡模擬；⑨ 是工廠的眼睛：檢測量測；⑩ 拉遠看：從設計、下線走到量產</p></div></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); }
  });

  /* 剖面走一遍 */
  function xs(c, w, h, i, p, t) {
    const base = h * 0.62, bot = h * 0.94, L = 30, R = w - 30;
    const films = 42, pr = 34;
    const open = [[0.28, 0.4], [0.6, 0.72]].map(([a, b]) => [L + a * (R - L), L + b * (R - L)]);
    const inOpen = x => open.some(([a, b]) => x >= a && x <= b);
    U.box(c, 'si', L, base, R - L, bot - base);
    U.tag(c, '矽晶圓', L + 10, bot - 12, { size: 14 });
    const filmH = i === 1 ? films * p : i >= 1 ? films : 0;
    // 摻雜區
    if (i >= 6) {
      const dd = i === 6 ? p : 1;
      open.forEach(([a, b]) => { c.fillStyle = U.MAT.n; c.globalAlpha = .85; c.beginPath(); c.ellipse((a + b) / 2, base, (b - a) / 2 + 8 * dd, 36 * dd, 0, 0, Math.PI); c.fill(); c.globalAlpha = 1; });
    }
    // 薄膜（蝕刻後在開口處消失）
    if (filmH > 0) {
      const etchDepth = i === 5 ? films * p : i > 5 ? films : 0;
      let x = L;
      const cuts = open.flat();
      const segs = [[L, cuts[0]], [cuts[0], cuts[1]], [cuts[1], cuts[2]], [cuts[2], cuts[3]], [cuts[3], R]];
      segs.forEach(([a, b], k) => {
        const isOpen = k === 1 || k === 3;
        const hh = isOpen ? filmH - etchDepth : filmH;
        U.box(c, 'ox', a, base - hh, b - a, hh);
      });
    }
    // 光阻
    const prTop = base - films;
    if (i >= 2 && i <= 5) {
      const spread = i === 2 ? p : 1;
      const cx = (L + R) / 2, half = (R - L) / 2 * spread;
      const segs = [[L, open[0][0]], [open[0][0], open[0][1]], [open[0][1], open[1][0]], [open[1][0], open[1][1]], [open[1][1], R]];
      segs.forEach(([a, b], k) => {
        const aa = Math.max(a, cx - half), bb = Math.min(b, cx + half);
        if (bb <= aa) return;
        const isOpen = k === 1 || k === 3;
        let col = 'pr', hh = pr;
        if (isOpen && i === 3) col = p > .5 ? 'prExp' : 'pr';
        if (isOpen && i >= 4) { col = 'prExp'; hh = i === 4 ? pr * (1 - p) : 0; }
        U.box(c, col, aa, prTop - hh, bb - aa, hh);
      });
    }
    // 曝光：光罩與光線
    if (i === 3) {
      const my = h * 0.12;
      c.fillStyle = '#e8eef5'; c.fillRect(L, my, R - L, 14);
      [[L, open[0][0]], [open[0][1], open[1][0]], [open[1][1], R]].forEach(([a, b]) => { c.fillStyle = U.MAT.mask; c.fillRect(a, my, b - a, 14); });
      U.tag(c, '光罩（黑色擋光）', L, my - 8, { size: 14 });
      open.forEach(([a, b]) => {
        const g = c.createLinearGradient(0, my + 14, 0, prTop);
        g.addColorStop(0, 'rgba(120,80,220,.45)'); g.addColorStop(1, 'rgba(120,80,220,.15)');
        c.fillStyle = g; c.fillRect(a, my + 14, b - a, (prTop - pr - my - 14) * Math.min(1, p * 1.5) + (p > .66 ? pr : 0));
        for (let k = 0; k < 4; k++) { const x = a + (k + .5) * (b - a) / 4, yy = my + 20 + ((t * 160 + k * 30) % (prTop - my - 40)); U.arrow(c, x, yy, x, yy + 16, '#7a50dc', 2); }
      });
    }
    // 摻雜離子
    if (i === 6) {
      open.forEach(([a, b]) => { for (let k = 0; k < 6; k++) { const x = a + (k + .5) * (b - a) / 6, yy = h * 0.1 + ((t * 220 + k * 47) % (base - h * 0.1)); U.dot(c, x, yy, 4, U.MAT.n); } });
      U.tag(c, '離子像雨一樣打進開口', (L + R) / 2, h * 0.08, { align: 'center' });
    }
    // 電鍍銅（步驟 7）與 CMP 磨平（步驟 8）
    if (i === 7 || i === 8) {
      const fillP = i === 7 ? p : 1;
      // 阻障層（銅導線用 TaN/Ta）：溝槽內壁與表面一層薄薄的阻障層
      c.fillStyle = U.MAT.tin;
      open.forEach(([a2, b2]) => { c.fillRect(a2, base - films, 3, films); c.fillRect(b2 - 3, base - films, 3, films); c.fillRect(a2, base - 3, b2 - a2, 3); });
      if (i === 7) c.fillRect(L, base - films - 3, R - L, 3);
      // 溝槽裡的銅由下往上長滿
      open.forEach(([a2, b2]) => U.box(c, 'cu', a2 + 3, base - 3 - (films - 3) * U.clamp(fillP * 1.6, 0, 1), b2 - a2 - 6, (films - 3) * U.clamp(fillP * 1.6, 0, 1)));
      const over = i === 7 ? 46 * U.clamp(fillP * 1.6 - 0.6, 0, 1) : 46 * (1 - p);
      if (over > 0) U.box(c, 'cu', L, base - films - 3 - over, R - L, over, { stroke: false });
      if (i === 7) {
        for (let k = 0; k < 16; k++) { const x = L + 20 + ((k * 61) % (R - L - 40)), yy = h * 0.12 + ((t * 90 + k * 23) % (base - films - 60 - h * 0.12)); U.dot(c, x, yy, 4, '#c9793b'); }
        U.tag(c, '晶圓泡在含銅的溶液裡通電：銅離子（橘點）被吸下來，一層層長上去', (L + R) / 2, h * 0.08, { align: 'center' });
        if (over > 5) U.tag(c, '銅會長過頭，蓋滿整個表面', (L + R) / 2, base - films - over - 12, { align: 'center', size: 14, color: '#b3541e' });
      } else {
        c.fillStyle = '#6a7888'; const py = base - films - 3 - over - 26;
        c.fillRect(L + 20, py, R - L - 40, 22);
        U.tag(c, '研磨墊往下壓、旋轉', L + 30, py - 6, { size: 14 });
        for (let k = 0; k < 18; k++) U.dot(c, L + 30 + ((t * 120 + k * 50) % (R - L - 60)), py + 26, 2.2, '#b3541e');
        if (p > .9) U.tag(c, '只剩溝槽裡的銅：導線完成', (L + R) / 2, h * 0.08, { align: 'center', color: '#1f7a4d' });
      }
    }
    // 圖層標示
    const lab = [];
    if (filmH > 10) lab.push(['氧化矽薄膜（黃）', base - filmH / 2]);
    if (i >= 2 && i <= 5) lab.push(['光阻（粉紅）', prTop - pr / 2]);
    if (i >= 6) lab.push(['摻雜區（藍）', base + 20]);
    if (i >= 7) lab.push(['銅（橘）', base - films / 2]);
    // 由上往下排，太近的往上錯開，避免標籤疊在一起
    lab.sort((a, b) => b[1] - a[1]).forEach((l, k, arr) => { if (k && arr[k - 1][1] - l[1] < 22) l[1] = arr[k - 1][1] - 22; });
    lab.forEach(([s, y]) => U.tag(c, s, R - 6, y + 5, { align: 'right', size: 14 }));
  }
  const XSTEPS = [
    { t: '起點', d: '一片乾淨的矽晶圓。' },
    { t: '沉積', d: '鋪上一層薄膜（黃色），這是等一下要雕刻的材料。' },
    { t: '塗光阻', d: '在上面均勻塗一層感光的光阻（粉紅色）。' },
    { t: '曝光', d: '光穿過光罩的透明處，照到的光阻會變質（變淡）。' },
    { t: '顯影', d: '用藥水把照到光的光阻洗掉，圖案就出現了。' },
    { t: '蝕刻', d: '沒有光阻保護的薄膜被挖掉，圖案「刻」進薄膜裡。' },
    { t: '去光阻＋摻雜', d: '光阻功成身退；離子從開口打進矽裡，形成導電區。' },
    { t: '電鍍銅', d: '先鋪一層很薄的阻障層，再用電鍍把銅灌滿開口；銅會長過頭，蓋住整個表面。（示意：真實的銅導線在電晶體上方很多層，不會直接碰到矽）' },
    { t: '平坦化', d: '用 CMP 把多出來的銅磨掉，只留下開口裡的銅，一層完成！' }
  ].map((s, i) => Object.assign(s, { draw: (c, w, h, p, t) => xs(c, w, h, i, p, t) }));
  const XRING = [-1, 0, 1, 1, 1, 2, 3, 0, 4]; // 剖面第 i 步 → 圓環第幾站（塗光阻、曝光、顯影都屬於「畫」；電鍍銅也是一種「鋪」）
  Fig.add('loop', { body: true,
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('xw-cv', '晶圓剖面（側面切開）', '')}${U.stepperHTML('xw-st')}</div>
      <div class="col">
        <div class="fig" style="height:300px;padding:8px 10px"><div class="fig-canvas"><canvas id="xw-ring"></canvas></div></div>
        <div class="card key"><h4 id="xw-n"></h4><p id="xw-a" style="font-size:19px;margin:0;color:var(--accent-2)"></p></div>
        <ul class="points simple"><li>光阻只是「臨時模板」，用完就丟</li><li>一圈 ≈ 一層圖案，一顆晶片有 60–80 層</li><li>最後要磨平，下一層才蓋得上去</li></ul>
        <div class="fact"><div class="v">約 1,500 步</div><div class="d">2 奈米晶片從空白晶圓到完成的步驟數，在廠裡要跑 3–4 個月</div></div>
      </div></div>`,
    init(el, ctx) {
      const rg = U.canvas(U.$(el, '#xw-ring'));
      let cur = 0, pr = 1;
      const onStep = i => {
        cur = i; pr = U.reduced() ? 1 : 0;
        const r = XRING[i];
        U.$(el, '#xw-n').textContent = r < 0 ? '準備開始' : `第 ${r + 1} 站「${STEPS[r][0]}」：${STEPS[r][1]}（現在：${XSTEPS[i].t}）`;
        U.$(el, '#xw-a').textContent = r < 0 ? '一片乾淨的矽晶圓，等著蓋第一層。' : '比喻：' + (i === 7 ? '像把模具灌滿金屬' : STEPS[r][3]);
      };
      U.animSteps(el, ctx, { canvas: 'xw-cv', stepper: 'xw-st', steps: XSTEPS, interval: 2800, onStep });
      ctx.raf((dt, t) => {
        pr = Math.min(1, pr + dt / 1.2);
        const { c, w, h } = rg; c.clearRect(0, 0, w, h);
        const cx = h / 2 + 4, cy = h / 2, R = h / 2 - 34, n = STEPS.length, r = XRING[cur];
        const pos = k => { const a = -Math.PI / 2 + k / n * Math.PI * 2; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; };
        c.strokeStyle = '#d3dbe4'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        const prog = cur === 0 ? 0 : cur === 7 ? 4 : cur === 8 ? n : r + 1;
        c.strokeStyle = '#1f4fb5'; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + prog / n * Math.PI * 2); c.stroke();
        STEPS.forEach((st, k) => {
          const [x, y] = pos(k), on = k === r;
          const rr = on ? 30 + 3 * Math.sin(t * 5) : 28;
          c.fillStyle = on ? '#1f4fb5' : '#fff'; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2;
          c.beginPath(); c.arc(x, y, rr, 0, 7); c.fill(); c.stroke();
          U.txt(c, st[0], x, y + 2, { align: 'center', size: 20, w: 700, color: on ? '#fff' : '#17202b' });
          U.txt(c, st[1], x, y + 17, { align: 'center', size: 11, w: 600, color: on ? '#dfe7fb' : '#6a7888' });
        });
        U.txt(c, cur === 7 ? '電鍍：再鋪一次' : '循環', cx, cy + 5, { align: 'center', size: 14, w: 600, color: cur === 7 ? '#b3541e' : '#6a7888' });
        // 右邊：越蓋越高的疊層
        const sx = h + 30, sw2 = w - sx - 14, layers = cur === 8 ? 1 + U.ease(pr) : 1;
        U.txt(c, '晶片的層數', sx + sw2 / 2, 22, { align: 'center', size: 14, w: 700 });
        for (let k = 0; k < 7; k++) {
          const y = h - 30 - k * 24, fill = U.clamp(layers - k, 0, 1);
          c.fillStyle = '#eef2f6'; c.fillRect(sx, y, sw2, 20);
          c.fillStyle = k === 0 ? '#a9bcd0' : ['#c9793b', '#f1e3a8'][k % 2]; c.fillRect(sx, y, sw2 * (k === 0 ? 1 : fill), 20);
        }
        U.txt(c, cur === 8 && pr > 0.9 ? '＋1 層！再轉一圈' : '轉一圈，多一層', sx + sw2 / 2, h - 6, { align: 'center', size: 13, color: cur === 8 ? '#1f7a4d' : '#6a7888', w: 600 });
      });
    }
  });
})();
