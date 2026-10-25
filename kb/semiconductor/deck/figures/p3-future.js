/* 第三部分：未來突破摩爾定律的關鍵：系統性解決 */
(function () {

  Fig.add('p3', {
    raw: true, cls: 'divider-slide', render: () => `<div class="divider-grid"><div class="divider-num"><div class="l">Part</div><div class="n">03</div></div>
      <div class="divider-body"><div class="s-eyebrow">PART 3 · 約 70 分鐘</div><h2>未來突破摩爾定律的關鍵<br><span style="color:var(--accent-2)">系統性解決</span></h2>
      <p class="q">電晶體還在縮，但光靠縮已經不夠。接下來的進步不只靠單一顆電晶體，而是<b style="color:var(--accent-2)">從整個系統下手：把晶片組起來、換個地方送電</b>。</p>
      <div class="cards c2" style="max-width:800px">
        <button type="button" class="card go-card" data-go="pkg0"><h4>① 先進封裝 →</h4><p>把小晶片像積木一樣組起來</p></button>
        <button type="button" class="card go-card" data-go="bsx"><h4>② 背面供電 →</h4><p>把電線搬到晶片背面</p></button>
      </div><p class="gloss">加碼：上下疊的電晶體 CFET、總路線圖</p></div></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); }
  });

  /* ===== ① 先進封裝 ===== */
  const EP = '第三部分 · ① 先進封裝';

  /* 封裝 0：為什麼需要先進封裝 */
  const WHY = [
    { t: '縮小變慢又變貴', h: '理由 1', d: '每一代電晶體縮小的幅度越來越小，成本卻越來越高。光靠縮小，已經不划算。' },
    { t: '一顆晶片有尺寸上限', h: '理由 2', d: '曝光機一次最多只能印約 26 × 33 mm。AI 晶片需要的電晶體更多，一顆已經做不下。' },
    { t: '大晶片良率低', h: '理由 3', d: '第十章的公式：良率 ≈ e^(−面積 × D0)，晶片越大掉得越快。同一片晶圓、同一批缺陷，做成一整顆和拆成四顆比一比。' },
    { t: '資料搬不夠快', h: '理由 4', d: '運算晶片算得很快，記憶體卻離得遠、線又少，資料送不過來。要把它們貼得更近。' }
  ];
  Fig.add('pkg0', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('p0-m', WHY.map((x, i) => (i + 1) + '. ' + x.t), 0)}</div>${U.figHTML('p0-cv', '四個瓶頸（示意）', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="p0-h"></h4><div class="bigword" id="p0-t" style="font-size:26px"></div><p id="p0-d" style="font-size:19px;margin:0"></p></div>`,
        extra: `<div class="card" id="p0-y" hidden><h4>良率模擬（單位同第十章）</h4><div class="controls" style="flex-direction:column;align-items:stretch;gap:6px">${U.range('p1-a', '晶片面積', 100, 800, 10, 200, ' mm²')}${U.range('p1-d', '缺陷密度 D0', 0.05, 1, 0.05, 0.3, '')}<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="p1-r" type="button">⟳ 換一片晶圓</button><button class="btn" type="button" data-go="yield">← 回顧：良率公式</button></div></div></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#p0-cv'));
      let m = 0, p = 0;
      // 理由 3 的良率模擬：和第十章 yield 同一套單位（晶圓座標單位 mm；D0＝每平方公分幾個致命缺陷）
      let A0 = 200, defects = [], D0 = 0.3;
      const reroll = () => { defects = []; const n = Math.round(Math.PI * 148 * 148 / 100 * D0); while (defects.length < n) { const x = U.rand(-150, 150), y = U.rand(-150, 150); if (x * x + y * y < 148 * 148) defects.push([x, y]); } };
      reroll();
      U.$(el, '#p1-r').onclick = reroll;
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      U.bind(el, 'p1-a', v => A0 = v, v => `${v} mm²（${+(v / 100).toFixed(1)} cm²）`);
      U.bind(el, 'p1-d', v => { D0 = v; reroll(); }, v => `${v.toFixed(2)} 個／cm²（${v <= 0.1 ? '成熟量產' : v >= 0.8 ? '研發初期' : '良率爬坡中'}）`);
      const wafer = (cx, cy, R, side) => {
        const k = R / 150, n = Math.ceil(150 / side) + 1, hit = new Set();
        defects.forEach(([x, y]) => hit.add(Math.floor(x / side) + ',' + Math.floor(y / side)));
        let good = 0, tot = 0;
        c.fillStyle = '#e8edf3'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.stroke();
        for (let i = -n; i < n; i++) for (let j = -n; j < n; j++) {
          const x0 = i * side, y0 = j * side, x1 = x0 + side, y1 = y0 + side;
          if (![[x0, y0], [x1, y0], [x0, y1], [x1, y1]].every(([x, y]) => x * x + y * y < 147 * 147)) continue;
          tot++;
          const bad = hit.has(i + ',' + j);
          if (!bad) good++;
          c.fillStyle = bad ? '#f3c1bd' : '#bfe3cc'; c.fillRect(cx + x0 * k + 0.5, cy + y0 * k + 0.5, side * k - 1, side * k - 1);
        }
        defects.forEach(([x, y]) => U.dot(c, cx + x * k, cy + y * k, 2.6, '#b3261e'));
        return { good, tot };
      };
      U.onSeg(el, 'p0-m', i => { m = i; p = U.reduced() ? 1 : 0; U.$(el, '#p0-y').hidden = i !== 2; const x = WHY[i]; U.$(el, '#p0-h').textContent = x.h; U.$(el, '#p0-t').textContent = x.t; U.$(el, '#p0-d').textContent = x.d; });
      ctx.raf((dt, t) => {
        p = Math.min(1, p + dt / 1.6);
        const e = U.ease(p);
        c.clearRect(0, 0, w, h);
        if (m === 0) {
          // 每一代「同樣的錢能買到的電晶體」增加幅度：早期很多，後來幾乎持平（示意）
          const G = [['28nm', 1], ['16nm', 1.5], ['7nm', 2.2], ['5nm', 2.3], ['3nm', 2.34], ['2nm', 2.36]];
          const L = 70, R = w - 40, B = h - 60, T = 60, bw = (R - L) / G.length;
          c.strokeStyle = '#9aa8b8'; c.beginPath(); c.moveTo(L, T - 20); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
          U.txt(c, '同樣花一塊錢，買得到的電晶體（示意）', L, T - 30, { size: 14, color: '#6a7888' });
          G.forEach(([n, v], k) => {
            if (k / G.length > e) return;
            const x = L + k * bw + bw * 0.2, bh = (B - T) * v / 2.9;
            c.fillStyle = k < 3 ? '#8fa9de' : '#b3541e'; c.fillRect(x, B - bh, bw * 0.6, bh);
            U.txt(c, n, x + bw * 0.3, B + 22, { align: 'center', size: 15, w: 600 });
          });
          if (e > 0.9) { U.tag(c, '早期：每一代都便宜很多', L + bw * 1.5, T + 60, { align: 'center', size: 15, color: '#1f4fb5' }); U.tag(c, '現在：幾乎沒變便宜', L + bw * 4.5, T + 10, { align: 'center', size: 15, color: '#b3261e' }); }
        } else if (m === 1) {
          // 光罩上限：26 × 33 mm 的框，AI 晶片想要更大
          const rw = Math.min((w - 110) / 2.7, (h - 120) / 1.27), rh = rw * 1.27, x0 = 40, cy = h / 2 + 10;
          c.setLineDash([8, 6]); c.strokeStyle = '#b3541e'; c.lineWidth = 3; c.strokeRect(x0, cy - rh / 2, rw, rh); c.setLineDash([]);
          U.tag(c, '一次曝光的上限：約 26 × 33 mm', x0 + rw / 2, cy - rh / 2 - 12, { align: 'center', size: 15, color: '#b3541e' });
          const want = U.lerp(0.6, 1.6, e);
          c.fillStyle = want > 1 ? 'rgba(243,193,189,.85)' : 'rgba(159,181,227,.85)'; c.fillRect(x0 + 6, cy - rh / 2 + 6, rw * want - 12, rh - 12);
          U.txt(c, want > 1 ? '想做的晶片：超出框外 ✗' : '想做的晶片', x0 + rw * want / 2, cy + 6, { align: 'center', size: 16, w: 700, color: want > 1 ? '#b3261e' : '#17202b' });
          if (e > 0.95) {
            const sx = x0 + rw * 1.6 + 40;
            c.fillStyle = '#9fb5e3'; c.fillRect(sx, cy - rh / 2, rw * 0.47, rh); c.fillRect(sx + rw * 0.53, cy - rh / 2, rw * 0.47, rh);
            U.tag(c, '解法：拆成兩顆，再組起來 ✓', sx + rw / 2, cy + rh / 2 + 26, { align: 'center', size: 15, color: '#1f7a4d' });
          }
        } else if (m === 2) {
          // 良率模擬：同一片晶圓、同一批缺陷，做成一整顆大晶片 vs 拆成 4 顆小晶片
          const R = Math.min(w / 4 - 16, (h - 190) / 2), cy = 44 + R, ya = cy + R + 28;
          const big = wafer(w / 4, cy, R, Math.sqrt(A0)), sm = wafer(w * 3 / 4, cy, R, Math.sqrt(A0 / 4));
          const fb = big.tot ? big.good / big.tot : 0, fs = sm.tot ? sm.good / sm.tot : 0, cm = A0 / 100, f = v => +v.toFixed(2);
          U.txt(c, `一整顆 ${A0} mm²（${f(cm)} cm²）`, w / 4, 24, { align: 'center', size: 17, w: 700 });
          U.txt(c, `拆成 4 顆，每顆 ${Math.round(A0 / 4)} mm²（${f(cm / 4)} cm²）`, w * 3 / 4, 24, { align: 'center', size: 17, w: 700 });
          [[w / 4, big, fb, cm], [w * 3 / 4, sm, fs, cm / 4]].forEach(([x, r, fr, a]) => {
            U.txt(c, `模擬：能用 ${Math.round(fr * 100)}%（${r.good} / ${r.tot} 顆）`, x, ya, { align: 'center', size: 18, w: 700, color: fr < 0.5 ? '#b3261e' : '#1f7a4d' });
            U.txt(c, `公式：e^(−${f(a)} × ${f(D0)}) ≈ ${Math.round(Math.exp(-a * D0) * 100)}%`, x, ya + 26, { align: 'center', size: 15, color: '#3e4b5b' });
          });
          U.txt(c, `一顆就是一套：${big.good} 套完整產品`, w / 4, ya + 56, { align: 'center', size: 17, w: 700, color: '#17202b' });
          U.txt(c, `可湊成 ⌊${sm.good} ÷ 4⌋ ＝ ${Math.floor(sm.good / 4)} 套完整產品`, w * 3 / 4, ya + 56, { align: 'center', size: 17, w: 700, color: '#1f4fb5' });
          U.txt(c, '前提：每顆先經 CP 測過，只組好的（Known Good Die）', w * 3 / 4, ya + 80, { align: 'center', size: 15, color: '#1f4fb5' });
          U.txt(c, '綠：好晶片　紅：被缺陷打中', w / 4, ya + 80, { align: 'center', size: 15, color: '#6a7888' });
        } else {
          // 記憶體牆：遠而細 vs 近而寬
          const y1 = h * 0.3, y2 = h * 0.72;
          [[y1, 0, '傳統：記憶體放在電路板上，離得遠、線很少'], [y2, 1, '先進封裝：記憶體貼在旁邊，路短、線超多']].forEach(([y, near, lab]) => {
            const gx = w * 0.62, mx = near ? gx - 200 : w * 0.06;
            c.fillStyle = '#9fb5e3'; c.fillRect(gx, y - 40, 150, 80); U.txt(c, '運算晶片', gx + 75, y + 6, { align: 'center', size: 16, w: 700 });
            c.fillStyle = '#f2cf8f'; c.fillRect(mx, y - 30, 100, 60); U.txt(c, '記憶體', mx + 50, y + 6, { align: 'center', size: 15, w: 700 });
            const lanes = near ? 9 : 2;
            for (let k = 0; k < lanes; k++) { const yy = y - 20 + k * (40 / Math.max(1, lanes - 1)); c.strokeStyle = '#b3541e'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx + 100, near ? yy : y - 6 + k * 12); c.lineTo(gx, near ? yy : y - 6 + k * 12); c.stroke();
              const f = (t * 0.5 + k * 0.37) % 1; U.dot(c, U.lerp(mx + 100, gx, f), near ? yy : y - 6 + k * 12, 4, '#e0a33a'); }
            U.txt(c, lab, w / 2, y + 62, { align: 'center', size: 16, w: 600, color: near ? '#1f7a4d' : '#b3261e' });
          });
        }
      });
    }
  });

  /* 封裝 2：接點越來越密 */
  const PITCH = [
    { t: '2D：傳統覆晶', p: 130, d: '一顆晶片翻過來，用錫球直接焊在封裝基板上。', use: '家電、一般晶片：便宜、成熟；高階手機晶片改用台積電 InFO 扇出型封裝' },
    { t: '2.5D：並排在中介層上', p: 40, d: '好幾顆晶片並排放在一片「矽中介層」上，中間用很密的線互連。台積電 CoWoS 屬於這種。', use: 'AI 晶片＋HBM 記憶體並排' },
    { t: '3D：微凸塊堆疊', p: 30, d: '晶片直接上下疊，中間用更小的微凸塊連接（量產多在約 25–50 µm，再小就很難；這裡以 30 µm 畫）。', use: 'HBM 記憶體本身（12 層疊起來）' },
    { t: '3D：混合鍵合（SoIC）', p: 9, d: '不用微凸塊，銅對銅直接接合，間距小到幾微米。台積電 SoIC 屬於這種。', use: '晶片直接疊晶片（台積電 SoIC，後面專頁細講）' }
  ];
  // 為什麼中介層要用曝光機：線寬比一比＋晶圓廠做法
  function whyLitho(c, w, h, e) {
    const L = 20, R = w - 20;
    U.txt(c, '線寬比一比（越往下越細，對數刻度）', L, 28, { size: 16, w: 700, color: '#17202b' });
    const rows = [['主機板（電路板）', 100, '電路板級乾膜曝光', '#4f7a3a'], ['封裝基板', 10, '載板級乾膜曝光＋電鍍', '#6f8f5a'], ['矽中介層', 0.5, '晶圓廠曝光機（在矽上）', '#7f97b0'], ['晶片最底層導線', 0.015, '最先進曝光機（EUV）', '#1f4fb5']];
    const bx = L + 150, bw = R - bx - 230;
    rows.forEach(([n, v, how, col], k) => {
      const y = 48 + k * 50, frac = (Math.log10(v) + 2.2) / 4.2 * e;
      U.txt(c, n, L, y + 22, { size: 15, w: 700, color: k === 2 ? '#b3541e' : '#17202b' });
      c.fillStyle = col; c.fillRect(bx, y + 6, Math.max(4, bw * frac), 24);
      U.txt(c, (v >= 1 ? v + ' µm' : v < 0.1 ? '約 15 nm' : '約 0.5–1 µm'), bx + Math.max(4, bw * frac) + 8, y + 24, { size: 14, w: 700, color: '#17202b' });
      U.txt(c, how, R, y + 24, { align: 'right', size: 14, color: k >= 2 ? '#b3541e' : '#3e4b5b' });
      if (k === 2) { c.strokeStyle = '#d6781a'; c.lineWidth = 2; c.strokeRect(L - 6, y + 2, R - L + 12, 34); }
    });
    // 下：和晶片後段導線同一套做法
    const y0 = 270;
    U.txt(c, '大家都用曝光，但 1 µm 以下要在平整的矽上、用晶圓廠的曝光機（和晶片後段導線同一套）', L, y0, { size: 16, w: 700, color: '#17202b' });
    const steps = ['① 塗光阻', '② 曝光機照出線路', '③ 蝕刻挖溝', '④ 鍍銅、磨平'], sw = (R - L - 30) / 4;
    steps.forEach((s, k) => {
      const x = L + k * (sw + 10), y = y0 + 16, on = e * 4 > k;
      c.fillStyle = on ? (k === 1 ? '#fbe3c8' : '#eef2f6') : '#f7f8fa'; c.fillRect(x, y, sw, 120); c.strokeStyle = k === 1 ? '#d6781a' : '#c9d2dc'; c.lineWidth = k === 1 ? 2 : 1; c.strokeRect(x, y, sw, 120);
      U.txt(c, s, x + sw / 2, y + 22, { align: 'center', size: 15, w: 700, color: '#17202b' });
      // 小剖面
      const sx = x + 16, sy = y + 70, ww = sw - 32;
      U.box(c, 'si', sx, sy + 20, ww, 22, { stroke: false });
      if (k === 0) U.box(c, 'pr', sx, sy + 8, ww, 12, { stroke: false });
      if (k === 1) { U.box(c, 'pr', sx, sy + 8, ww, 12, { stroke: false }); c.fillStyle = 'rgba(160,110,230,.35)'; [0.2, 0.5, 0.8].forEach(f => c.fillRect(sx + ww * f - 6, sy - 26, 12, 34)); U.txt(c, '光', sx + ww / 2, sy - 30, { align: 'center', size: 13, color: '#6b3fb0' }); }
      if (k >= 2) { c.fillStyle = k === 3 ? U.MAT.cu : '#fbfcfd'; [0.2, 0.5, 0.8].forEach(f => c.fillRect(sx + ww * f - 6, sy + 20, 12, 12)); }
      if (k === 2) { U.box(c, 'pr', sx, sy + 8, ww, 12, { stroke: false }); c.fillStyle = '#fbfcfd'; [0.2, 0.5, 0.8].forEach(f => c.fillRect(sx + ww * f - 6, sy + 8, 12, 12)); }
      if (k < 3) U.arrow(c, x + sw + 1, y + 60, x + sw + 9, y + 60, '#9aa8b8', 2);
    });
    U.txt(c, '好消息：不用 EUV，較舊、較便宜的曝光機就夠', L, y0 + 170, { size: 15, w: 700, color: '#1f7a4d' });
    U.txt(c, '壞消息：曝光機一次只能照一格（約 26×33 mm）→ 中介層要做大就得拼接 → 切回「結構」看', L, y0 + 198, { size: 15, w: 700, color: '#b3261e' });
  }
  function pkgSide(c, x0, y0, W, H, i, p) {
    const base = y0 + H - 20;
    U.box(c, '#6f8f5a', x0, base - 26, W, 26); U.txt(c, '封裝基板', x0 + W / 2, base - 8, { align: 'center', size: 13, w: 700, color: '#fff' });
    const bump = (x, y, r) => U.dot(c, x, y, r, '#8a8f96');
    if (i === 0) {
      const dy = (1 - p) * 30, top = base - 26 - 16 - 60 - dy;
      for (let k = 0; k < 7; k++) bump(x0 + W * 0.2 + k * W * 0.1, base - 26 - 8 - dy * 0.3, 8);
      U.box(c, '#9fb5e3', x0 + W * 0.15, top, W * 0.7, 60); U.tag(c, '晶片', x0 + W / 2, top + 36, { align: 'center', size: 14 });
    } else if (i === 1) {
      const ip = base - 26 - 10 - 24;
      for (let k = 0; k < 12; k++) bump(x0 + W * 0.08 + k * W * 0.077, base - 26 - 5, 5);
      U.box(c, '#a9bcd0', x0 + W * 0.05, ip, W * 0.9, 24); U.tag(c, '矽中介層', x0 + W * 0.06, ip + 17, { size: 13 });
      c.strokeStyle = '#c9793b'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x0 + W * 0.3, ip + 5 + k * 4); c.lineTo(x0 + W * 0.7, ip + 5 + k * 4); c.stroke(); }
      const dy = (1 - p) * 30;
      [[0.08, 0.38], [0.62, 0.92]].forEach(([a, b], n) => {
        for (let k = 0; k < 10; k++) bump(x0 + W * a + 8 + k * (W * (b - a) - 16) / 9, ip - 4 - dy * 0.3, 3.2);
        U.box(c, n ? '#f2cf8f' : '#9fb5e3', x0 + W * a, ip - 8 - 56 - dy, W * (b - a), 56); U.tag(c, n ? '記憶體' : '運算晶片', x0 + W * (a + b) / 2, ip - 30 - dy, { align: 'center', size: 13 });
      });
    } else {
      const d1 = base - 26 - 10 - 60;
      for (let k = 0; k < 7; k++) bump(x0 + W * 0.2 + k * W * 0.1, base - 26 - 5, 5);
      U.box(c, '#9fb5e3', x0 + W * 0.15, d1, W * 0.7, 60); U.tag(c, '下層晶片', x0 + W / 2, d1 + 36, { align: 'center', size: 13 });
      const gap = i === 2 ? 8 : 0, dy = (1 - p) * 30, t2 = d1 - gap - 50 - dy;
      if (i === 2) for (let k = 0; k < 18; k++) bump(x0 + W * 0.22 + k * W * 0.033, d1 - 4 - dy * 0.5, 2.6);
      else { c.fillStyle = '#c9793b'; for (let k = 0; k < 40; k++) c.fillRect(x0 + W * 0.2 + k * W * 0.015, d1 - 2 - dy, W * 0.008, 4); }
      U.box(c, '#e3c28f', x0 + W * 0.2, t2, W * 0.6, 50); U.tag(c, '上層晶片', x0 + W / 2, t2 + 30, { align: 'center', size: 13 });
    }
  }
  Fig.add('pkg2', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('p2-m', PITCH.map((s, k) => '①②③④'[k] + ' ' + s.t), 0)}</div>${U.figHTML('p2-cv', '左：側面　右：同樣 0.25 × 0.25 mm 的面積（上視）', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="p2-uh">主要用在</h4><div class="bigword" id="p2-u" style="font-size:22px"></div><p id="p2-d" style="font-size:17px"></p></div>
          <div class="card"><h4 id="p2-nh">每平方毫米的接點數</h4><div class="bigword" id="p2-n" style="font-size:30px;font-family:var(--font-mono);color:var(--accent)"></div></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#p2-cv'));
      let i = 0, p = 1;
      U.onSeg(el, 'p2-m', k => {
        i = k; p = U.reduced() ? 1 : 0; const why = false;
        U.$(el, '#p2-nh').textContent = why ? '中介層的線有多細' : '每平方毫米的接點數'; U.$(el, '#p2-uh').textContent = why ? '原因' : '主要用在';
        { const ft = U.$(el, '#p2-cv').closest('.fig').querySelector('.fig-title span'); if (ft) ft.textContent = why ? '各層的線有多細？為什麼中介層要用曝光機' : '左：側面　右：同樣 0.25 × 0.25 mm 的面積（上視）'; }
        if (why) { U.$(el, '#p2-u').textContent = '要畫上萬條比頭髮細百倍的線'; U.$(el, '#p2-d').textContent = '運算晶片和 HBM 之間要接上萬條線，全擠在晶片邊緣幾毫米內，線寬只有約 0.5–1 µm。這麼細的線，電路板的做法做不出來，只能用晶圓廠的方法：曝光機照出圖案、蝕刻、鍍銅。'; U.$(el, '#p2-n').textContent = '線寬約 1 µm 以下'; return; }
        const s = PITCH[i];
        U.$(el, '#p2-u').textContent = s.use; U.$(el, '#p2-d').textContent = s.d;
        { const v = 1e6 / s.p ** 2; U.$(el, '#p2-n').textContent = v >= 1e4 ? '約 ' + (v / 1e4).toFixed(1) + ' 萬個' : '約 ' + (Math.round(v / 10) * 10).toLocaleString() + ' 個'; }
      });
      ctx.raf(dt => {
        p = Math.min(1, p + dt / 1.2);
        c.clearRect(0, 0, w, h);
        const s = PITCH[i], e = U.ease(p), LW = w * 0.56;
        c.save(); c.translate(10, 0); c.scale(1.5, 1.5); pkgSide(c, 0, 0, (LW - 20) / 1.5, h * 0.78 / 1.5 + 20, i, e); c.restore();
        c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(LW, 10); c.lineTo(LW, h - 10); c.stroke();
        const S = Math.min(w - LW - 40, h - 80), sx = LW + (w - LW - S) / 2, sy = 40;
        c.fillStyle = '#f5f7fa'; c.fillRect(sx, sy, S, S); c.strokeStyle = '#9aa8b8'; c.strokeRect(sx, sy, S, S);
        const n = Math.round(250 / s.p), gp = S / n, show = Math.ceil(n * n * Math.min(1, e * 1.4));
        let k = 0;
        for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { if (k++ >= show) break; U.dot(c, sx + (b + 0.5) * gp, sy + (a + 0.5) * gp, Math.max(1.4, gp * 0.3), i === 3 ? '#c9793b' : '#8a8f96'); }
        U.txt(c, `間距約 ${s.p} µm → 這一格放 ${n * n} 個`, sx + S / 2, sy + S + 26, { align: 'center', size: 16, w: 700 });
      });
    }
  });

  /* 9. 先進封裝 */
  const PK = [
    { n: '封裝基板', s: '封裝基板', col: '#6f8f5a', y: 0, h: 46, w: 1 },
    { n: '中介層（矽，裡面有很密的線路）', s: '矽中介層', col: '#a9bcd0', y: 1, h: 30, w: 0.86 },
    { n: 'HBM 記憶體（疊 12 層）', col: '#f2cf8f', y: 2, h: 150, w: 0.18, x: -0.33, stack: 12 },
    { n: 'GPU / AI 運算晶片', s: 'GPU 運算晶片', col: '#9fb5e3', y: 2, h: 56, w: 0.36, x: 0 },
    { n: '上下再疊一顆晶片（混合鍵合，部分產品才有）', s: '疊上的晶片（部分產品）', col: '#e3c28f', y: 3, h: 30, w: 0.3, x: 0 },
    { n: 'HBM 記憶體（疊 12 層）', col: '#f2cf8f', y: 2, h: 150, w: 0.18, x: 0.33, stack: 12 }
  ];
  // 每個元件的說明：idx 對到 PK 的哪幾塊（'bump'＝凸塊）
  const PKC = [
    { n: '運算晶片', ana: '主廚：真正在做菜的人，手要快，但一直需要有人遞食材。', idx: [3], h: 'GPU／AI 運算晶片', what: '真正做計算的地方：上千個核心同時算大量的矩陣乘法。', num: '用台積電 4／3 奈米級製程；一顆接近曝光機一次能印的最大面積（約 800 mm²），裡面有近千億到上千億個電晶體。', who: '設計：NVIDIA、AMD、Google 等；製造：台積電', go: ['pkg0', '為什麼要拆成小晶片'] },
    { n: 'HBM 記憶體', ana: '主廚手邊的冰箱：食材就放在旁邊，一伸手就拿到；冰箱疊高，放得多又不佔地。', idx: [2, 5], h: 'HBM 高頻寬記憶體', what: '存放模型參數和資料，緊貼在旁邊隨時餵給運算晶片。', num: '8–12 層記憶體晶片疊成一疊，用矽穿孔上下接通；每疊 1,024 條資料線、每秒約 1.2 TB（HBM3E）。一顆 AI 晶片旁邊常放 6–8 疊。', who: 'SK 海力士、三星、美光', go: ['pkg4', 'HBM 詳解'] },
    { n: '疊上的晶片', ana: '主廚頭頂的層架：抬手就拿到，比旁邊的冰箱還近。', idx: [4], h: '疊上的晶片（部分產品才有）', what: '把晶片直接上下疊，例如運算晶片疊在 I/O 晶片上，上下只隔幾微米。', num: '用 SoIC 混合鍵合，接點間距 9 µm 以下，每 mm² 上萬個接點。不是每顆 AI 晶片都有，例如 AMD MI300 有。', who: '台積電 SoIC；例：AMD MI300', go: ['soic', 'SoIC 詳解'] },
    { n: '矽中介層', ana: '廚房的工作檯：主廚和冰箱都放在上面，中間鋪了上萬條輸送帶，食材隨時送過去。', idx: [1], h: '矽中介層', what: '一片超密的「接線板」：讓運算晶片和 HBM 之間有上萬條又短又密的線。', num: '用矽做，線路用晶圓廠的製程做出來，比一般電路板密上百倍；整片矽的 CoWoS-S 最大約光罩面積的 3.3 倍，更大的改用 CoWoS-L。', who: '台積電 CoWoS（Chip on Wafer on Substrate：晶片 → 晶圓做的中介層 → 基板）', go: ['cowcmp', '各家方案比較'] },
    { n: '凸塊', ana: '每一層之間的門和插座：越往廚房裡面，門越小、越密，東西才送得又多又快。', idx: 'bump', h: '凸塊（橘點）：層與層之間的焊點', what: '負責通電和傳訊號。越往上越小、越密。', num: '晶片底下最小、最密，越往下越大：晶片 ↔ 中介層是微凸塊，中介層 ↔ 封裝基板是 C4 凸塊，最底下接主機板的是錫球。各種接法有多密，下一頁比一比。', who: '晶圓廠與封測廠', go: ['pkg2', '2D、2.5D、3D 接法'] },
    { n: '封裝基板', ana: '餐廳的後門和送貨口：把外面大街（主機板）來的食材和電，轉進廚房裡。', idx: [0], h: '封裝基板', what: '把中介層上的細線轉成粗一點的接腳，接到主機板；也負責把電送進來。', num: '玻纖樹脂做的多層板，上下用 ABF 增層做線路，十幾層。尺寸越做越大、加熱容易翹，所以正在研發玻璃基板。', who: 'Ibiden、欣興、南電、景碩（ABF 載板）', go: ['glass', '玻璃基板'] }
  ];
  Fig.add('pkg', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('pk-c', PKC.map(x => x.n), 0)}</div>${U.figHTML('pk-cv', 'AI 晶片封裝（剖面示意，也可以直接點圖上的元件）', '')}
        <div class="controls">${U.range('pk-x', '拆開程度', 0, 100, 1, 60, '')}</div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="pk-h"></h4><p style="font-size:16.5px;margin:2px 0"><b>做什麼</b>：<span id="pk-w"></span></p><p style="font-size:16.5px;margin:2px 0"><b style="color:#1f4fb5">關鍵數字</b>：<span id="pk-n"></span></p><p style="font-size:16.5px;margin:2px 0"><b style="color:#1f7a4d">誰做</b>：<span id="pk-o"></span></p><p style="font-size:16.5px;margin:2px 0"><b style="color:#b3541e">比喻</b>：<span id="pk-a"></span></p><button class="btn" type="button" id="pk-go" style="margin-top:6px"></button></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#pk-cv'));
      let X = 0.6, cur = 0, sel = 0;
      const rects = [];
      const pick = i => { sel = i; const x = PKC[i]; U.$(el, '#pk-h').textContent = x.h; U.$(el, '#pk-w').textContent = x.what; U.$(el, '#pk-n').textContent = x.num; U.$(el, '#pk-o').textContent = x.who; U.$(el, '#pk-a').textContent = x.ana; U.$(el, '#pk-go').textContent = x.go[1] + ' →'; };
      const segc = U.onSeg(el, 'pk-c', pick);
      U.$(el, '#pk-go').onclick = () => Deck.goId(PKC[sel].go[0]);
      U.bind(el, 'pk-x', v => X = v / 100, v => v < 20 ? '組好的樣子' : v > 80 ? '完全拆開' : '拆開一些');
      U.$(el, '#pk-cv').addEventListener('click', e => {
        const r = e.target.getBoundingClientRect(), sc = Deck.scale || 1, mx = (e.clientX - r.left) / sc, my = (e.clientY - r.top) / sc;
        const hit = rects.find(q => mx >= q.x && mx <= q.x + q.w && my >= q.y && my <= q.y + q.h);
        if (hit) { const i = PKC.findIndex(p => Array.isArray(p.idx) && p.idx.includes(hit.k)); if (i >= 0) segc.set(i); }
      });
      ctx.raf((dt, t) => {
        cur += (X - cur) * Math.min(1, dt * 6);
        c.clearRect(0, 0, w, h); rects.length = 0;
        const cx = w / 2, base = h - 66, W = w - 100, gap = cur * 70;
        const levelY = [base, base - 50, base - 84, base - 144];
        const S = PKC[sel], pulse = 0.55 + 0.45 * Math.sin(t * 4);
        PK.forEach((p, k) => {
          const y = levelY[p.y] - p.y * gap;
          const x = cx + (p.x || 0) * W * (1 + cur * 0.25) - p.w * W / 2;
          if (p.stack) { const lh = p.h / p.stack; for (let q = 0; q < p.stack; q++) { c.fillStyle = q % 2 ? p.col : '#e6bd70'; c.fillRect(x, y - p.h + q * lh - q * cur * 4, p.w * W, lh - 1); } }
          else { c.fillStyle = p.col; c.fillRect(x, y - p.h, p.w * W, p.h); c.strokeStyle = 'rgba(0,0,0,.2)'; c.strokeRect(x, y - p.h, p.w * W, p.h); }
          const top = y - p.h - (p.stack ? (p.stack - 1) * cur * 4 : 0);
          rects.push({ k, x, y: top, w: p.w * W, h: y - top });
          if (cur > .3) U.tag(c, p.n, x + p.w * W / 2, top - 8, { align: 'center', size: 14 });
          else if (p.stack) U.tag(c, 'HBM 記憶體', x + p.w * W / 2, top - 8, { align: 'center', size: 14 });
          else U.txt(c, p.s, x + p.w * W / 2, y - p.h / 2 + 5, { align: 'center', size: 14, w: 700, color: '#1f2a37' });
          // 凸塊：越往下越大（微凸塊 → C4 → 錫球）
          // 中介層底下：C4 凸塊（較大）；晶片底下：微凸塊（較小）；封裝基板底下的錫球另外畫；SoIC 疊的晶片沒有凸塊（混合鍵合）
          const br = [0, 4.2, 2.2, 0][p.y], bn = Math.round(p.w * [0, 22, 34, 0][p.y]);
          const big = S.idx === 'bump' ? 1 + 0.5 * pulse : 1;
          for (let q = 0; q < bn; q++) U.dot(c, x + 6 + q * (p.w * W - 12) / Math.max(1, bn - 1), y + br, br * big, '#b3541e');
          if (Array.isArray(S.idx) && S.idx.includes(k)) { c.strokeStyle = `rgba(214,120,20,${pulse})`; c.lineWidth = 4; c.setLineDash([8, 5]); c.strokeRect(x - 6, top - 6, p.w * W + 12, y - top + 12); c.setLineDash([]); }
        });
        // 最底下：封裝基板 ↔ 電路板的錫球
        const by = levelY[0] + 8;
        c.fillStyle = '#4f7a3a'; c.fillRect(cx - W / 2, by + 10, W, 14); U.txt(c, '電路板（主機板）', cx + W / 2 - 8, by + 38, { align: 'right', size: 13, color: '#3e4b5b' });
        for (let q = 0; q < 14; q++) U.dot(c, cx - W / 2 + 20 + q * (W - 40) / 13, by + 5, 6.5 * (S.idx === 'bump' ? 1 + 0.4 * pulse : 1), '#8a8f96');
        if (S.idx === 'bump') U.tag(c, '越往上越小、越密：微凸塊 → C4 凸塊 → 錫球（下一頁比一比）', w / 2, 30, { align: 'center', size: 15, color: '#b3541e' });
        else U.tag(c, '橘點：連接用的凸塊　灰點：接電路板的錫球', cx - W / 2 + 4, by + 38, { size: 13 });
      });
    }
  });

  /* HBM 頁「放大看矽穿孔」分頁：五步逐步動畫 */
  const TSTEPS = [
    { t: '深蝕刻挖孔', d: '用蝕刻在晶片上挖出又細又深的孔：孔徑只有幾微米，深約 50 微米。' },
    { t: '鋪絕緣層＋阻障層', d: '孔壁先鋪絕緣層（不讓銅和矽導通），再鋪阻障層（不讓銅跑進矽）和薄薄的銅晶種。' },
    { t: '電鍍銅填滿', d: '把銅從孔底往上長滿，再用 CMP 磨掉表面多餘的銅。' },
    { t: '背面磨薄、露出', d: '先把晶圓正面黏在承載晶圓上，從背面磨薄到接近孔底，再用蝕刻把剩下的矽吃掉，讓銅露出來：從約 775 微米變成 30–50 微米，比頭髮（約 70 微米）還薄。' },
    { t: '一層層疊起來', d: '每片晶片上下都有銅柱，用微凸塊（銅柱頂端帶一點錫）對齊接起來，中間再填膠，12 層就像一棟大樓。' }
  ];
  function tsvDraw(c, w, h, i, p, t) {
    const L = 60, R = w - 60, W = R - L, y0 = 46, H = h - 96, D = H * 0.55, holes = [0.25, 0.5, 0.75].map(f => L + W * f), hw = 14;
    U.txt(c, `${i + 1}. ${TSTEPS[i].t}`, w / 2, 22, { align: 'center', size: 16, w: 700, color: '#17202b' });
    if (i < 4) {
      const thin = i === 3 ? (H - D - 6) * U.ease(p) : 0, bot = y0 + H - thin;
      U.box(c, 'si', L, y0, W, bot - y0); U.txt(c, '一片記憶體晶片（剖面）', L, y0 - 8, { size: 13, color: '#3e4b5b' });
      holes.forEach(x => {
        const d = i === 0 ? D * U.ease(p) : D;
        c.fillStyle = '#fbfcfd'; c.fillRect(x - hw / 2, y0, hw, d);
        if (i === 0) for (let k = 0; k < 3; k++) { const f = (t * 1.2 + k / 3) % 1; U.dot(c, x + (k - 1) * 3, y0 - 20 + f * (d + 16), 2, '#c0392b'); }
        if (i >= 1) { const a = i === 1 ? p : 1; c.globalAlpha = a; c.strokeStyle = U.MAT.ox; c.lineWidth = 3; c.strokeRect(x - hw / 2 + 1.5, y0, hw - 3, d - 1.5); c.strokeStyle = U.MAT.tin; c.lineWidth = 1.5; c.strokeRect(x - hw / 2 + 3.5, y0, hw - 7, d - 3.5); c.globalAlpha = 1; }
        if (i >= 2) { const f = i === 2 ? U.ease(p) : 1, ch = (D - 4) * f; U.box(c, 'cu', x - hw / 2 + 4, y0 + D - 4 - ch, hw - 8, ch, { stroke: false }); }
      });
      if (i === 0) U.tag(c, '孔徑幾微米、深約 50 微米：又細又深', w / 2, y0 + D + 24, { align: 'center', size: 13, color: '#b3541e' });
      if (i === 1) U.tag(c, '黃：絕緣層　深色：阻障層', w / 2, y0 + D + 24, { align: 'center', size: 13 });
      if (i === 3) {
        c.fillStyle = '#9aa1a9'; c.fillRect(L - 10, bot + 2, W + 20, 14); for (let k = 0; k < 20; k++) { const x = L - 10 + ((k * 23 + t * 120) % (W + 20)); c.fillStyle = '#6f7780'; c.fillRect(x, bot + 4, 6, 10); }
        if (p <= 0.9) U.txt(c, '先磨薄、再用蝕刻讓銅露出（正面黏在承載晶圓上）', R, bot + 34, { align: 'right', size: 14, color: '#3e4b5b' });
        if (p > 0.9) U.tag(c, '銅柱從背面露出來了：上下都能接', w / 2, y0 + D + 40, { align: 'center', size: 13, color: '#1f7a4d' });
      }
    } else {
      const n = 5, dh = 26, gap = 12, base = h - 26; let y = base;
      U.box(c, '#9fb5e3', L, base - 30, W, 30); U.txt(c, '底層邏輯晶片', L + 8, base - 10, { size: 12, w: 700, color: '#17202b' }); y = base - 30;
      for (let k = 0; k < n; k++) {
        const f = U.clamp(p * n - k, 0, 1); if (f <= 0) break;
        const yy = y - gap - dh - (1 - U.ease(f)) * 40;
        c.globalAlpha = f;
        c.fillStyle = 'rgba(241,227,168,.7)'; c.fillRect(L, yy + dh, W, gap);
        holes.forEach(x => { U.dot(c, x, yy + dh + gap / 2, 5.5, '#9aa1a9'); });
        c.fillStyle = k % 2 ? '#f2cf8f' : '#e6bd70'; c.fillRect(L, yy, W, dh);
        holes.forEach(x => U.box(c, 'cu', x - 3, yy, 6, dh, { stroke: false }));
        c.globalAlpha = 1; y = yy;
      }
      U.tag(c, '灰色＝微凸塊（銅柱頂端帶一點錫），間距約 25–50 µm；中間淡黃＝填膠', w / 2, 44, { align: 'center', size: 13 });
      if (p > 0.9) U.tag(c, '問題：微凸塊要空間、還要填膠，能不能直接接？→ 下一頁', w / 2, 66, { align: 'center', size: 13, color: '#b3541e' });
    }
  }
  /* HBM 頁「HBM4 有什麼不同？」：HBM3E 和 HBM4 並排 */
  const HBMROWS = [['資料線', '1,024 條', '2,048 條（加倍）'], ['每疊頻寬', '約 1.2 TB/s', '約 2 TB/s 以上'], ['疊幾層', '8–12 層', '12–16 層'], ['每疊容量', '最多約 36 GB', '量產 36 GB（規格上限 64 GB）'], ['底層晶片', '記憶體廠自家 DRAM 製程', '多家改用邏輯製程（可客製）']];
  function hbm4Compare(c, w, h, t) {
    const colW = w * 0.5, base = h * 0.56;
    [[0, 'HBM3E（目前主流）', 12, '#e6bd70', 'DRAM 製程', 1024], [1, 'HBM4（2026 起量產）', 16, '#1f4fb5', '邏輯製程', 2048]].forEach(([k, name, nL, bc, bl, lines]) => {
      const cx = colW * (k + 0.5) - 40, sw = 146, lh = (base - 70) / 17, bh = 26;
      U.txt(c, name, cx, 24, { align: 'center', size: 17, w: 700, color: k ? '#1f4fb5' : '#8a6a2e' });
      c.fillStyle = bc; c.fillRect(cx - sw / 2, base - bh, sw, bh);
      U.txt(c, `底層：${bl}`, cx, base - 8, { align: 'center', size: 14, w: 700, color: k ? '#fff' : '#17202b' });
      for (let j = 0; j < nL; j++) { c.fillStyle = j % 2 ? '#f2cf8f' : '#e6bd70'; c.fillRect(cx - sw / 2, base - bh - (j + 1) * lh, sw, lh - 1); }
      U.txt(c, `${nL} 層`, cx - sw / 2 - 8, base - bh - nL * lh / 2, { align: 'right', size: 15, color: '#3e4b5b' });
      // 資料線：往旁邊的 GPU 拉出一束線，HBM4 是兩倍
      const n = k ? 16 : 8, x0 = cx + sw / 2, x1 = x0 + 90;
      for (let q = 0; q < n; q++) { const y = base - 4 - q * 2.2; c.strokeStyle = 'rgba(201,121,59,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); const f = (t * 0.9 + q / n) % 1; U.dot(c, U.lerp(x0, x1, f), y, 1.8, '#f2a93b'); }
      U.box(c, '#9fb5e3', x1, base - 50, 40, 50); U.txt(c, 'GPU', x1 + 20, base - 20, { align: 'center', size: 14, w: 700, color: '#17202b' });
      U.txt(c, `${lines.toLocaleString()} 條`, (x0 + x1) / 2, base - 44, { align: 'center', size: 14, w: 700, color: '#b3541e' });
    });
    // 下方對照表
    const ty = base + 22, rh = (h - ty - 6) / HBMROWS.length, c1 = 20, c2 = w * 0.25, c3 = w * 0.6;
    U.txt(c, '項目', c1, ty, { size: 14, color: '#6a7888' }); U.txt(c, 'HBM3E', c2, ty, { size: 14, w: 700, color: '#8a6a2e' }); U.txt(c, 'HBM4', c3, ty, { size: 14, w: 700, color: '#1f4fb5' });
    HBMROWS.forEach(([a, b, d], r) => {
      const y = ty + (r + 1) * rh - 4;
      c.strokeStyle = '#e3e8ef'; c.lineWidth = 1; c.beginPath(); c.moveTo(c1, y - rh + 8); c.lineTo(w - 20, y - rh + 8); c.stroke();
      U.txt(c, a, c1, y, { size: 14, w: 700, color: '#17202b' }); U.txt(c, b, c2, y, { size: 14, color: '#3e4b5b' }); U.txt(c, d, c3, y, { size: 14, w: 700, color: '#1f4fb5' });
    });
  }
  /* 封裝 4：HBM（拆兩頁：pkg4 為什麼快＋容量；pkg4b 矽穿孔＋HBM4）。四種畫面共用一個繪圖函式，m＝0–3 */
  const HBM_BW = [[0.07, '0.13 TB', 'warn', '每顆每秒約 0.13 TB，等於約 26 部電影'], [0.6, '1.2 TB', 'good', '目前主流 HBM3E：每疊每秒最高約 1.2 TB，約 240 部電影'], [0.6, '1.2 TB', 'good', '矽穿孔：每一片晶片都有上千個蝕刻出來、灌滿銅的細孔，12 層上下直接相通'], [1, '2 TB+', 'good', 'HBM4：資料線加倍，每疊每秒約 2 TB 以上，約 400 部電影']];
  const HBM_CAP = [
    ['每顆約 2–3 GB', '一般顯示卡記憶體（GDDR7）一顆約 2–3 GB；高階顯示卡放 8–16 顆，共約 16–32 GB。'],
    ['每疊 24–36 GB', 'HBM3E 每層約 3 GB，疊 8–12 層。一疊約 11 × 11 mm、厚不到 1 mm。一顆 AI 晶片旁放 8 疊，例如 NVIDIA B200 共 192 GB。'],
    ['每層約 3 GB', '每一片記憶體晶片約 3 GB（24 Gb），磨到 30–50 µm 薄；12 片疊起來再加底層晶片，總厚度約 0.7 mm。'],
    ['量產每疊 36 GB', 'HBM4 量產初期是 12 層 36 GB；16 層 48 GB 已展示；規格上限 64 GB（每層 4 GB × 16 層）。']
  ];
  function hbmDraw(c, w0, h0, m, t, ts, tp) {
    const S = 1.4, w = w0 / S, h = h0 / S;
    c.save(); c.scale(S, S);
    const base = h - 20, cx = w / 2;
    if (m === 2) tsvDraw(c, w, h, ts, tp, t);
    else if (m === 0) {
      U.box(c, '#6f8f5a', 20, base - 20, w - 40, 20); U.txt(c, '電路板', cx, base - 5, { align: 'center', size: 13, w: 700, color: '#fff' });
      U.box(c, '#9fb5e3', cx - 90, base - 20 - 70, 180, 70); U.tag(c, 'GPU', cx, base - 50, { align: 'center', size: 16 });
      [[40, 1], [w - 40 - 90, -1]].forEach(([x, d]) => {
        U.box(c, '#f2cf8f', x, base - 20 - 40, 90, 40); U.tag(c, '記憶體', x + 45, base - 34, { align: 'center', size: 13 });
        const xa = d > 0 ? x + 90 : x, xb = d > 0 ? cx - 90 : cx + 90;
        c.strokeStyle = '#c9793b'; c.lineWidth = 2; for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(xa, base - 8 - k * 6); c.lineTo(xb, base - 8 - k * 6); c.stroke(); }
        for (let k = 0; k < 3; k++) { const f = (t * 0.25 + k / 3) % 1; U.dot(c, U.lerp(xa, xb, f), base - 8 - (k % 2) * 6, 4.5, '#f2a93b'); }
      });
      U.tag(c, '距離遠、每顆只有 32 條資料線', cx, 40, { align: 'center', size: 15, color: '#a8660a' });
    } else if (m === 3) {
      c.restore(); c.save(); hbm4Compare(c, w0, h0, t);
    } else {
      U.box(c, '#6f8f5a', 20, base - 20, w - 40, 20);
      const ip = base - 20 - 22; U.box(c, '#a9bcd0', 40, ip, w - 80, 22); U.tag(c, '矽中介層', 50, ip + 16, { size: 13 });
      U.box(c, '#9fb5e3', cx - 90, ip - 90, 180, 90); U.tag(c, 'GPU', cx, ip - 40, { align: 'center', size: 16 });
      [[cx - 90 - 24 - 110, 1], [cx + 90 + 24, -1]].forEach(([x, d]) => {
        const lh = 14, nL = 12, top = ip - 24 - nL * lh;
        U.box(c, '#b7c3d6', x, ip - 24, 110, 24);
        for (let k = 0; k < nL; k++) { c.fillStyle = k % 2 ? '#f2cf8f' : '#e6bd70'; c.fillRect(x, ip - 24 - (k + 1) * lh, 110, lh - 1); }
        c.strokeStyle = '#c9793b'; c.lineWidth = 2; [0.2, 0.4, 0.6, 0.8].forEach(f => { c.beginPath(); c.moveTo(x + 110 * f, ip); c.lineTo(x + 110 * f, top); c.stroke(); });
        for (let k = 0; k < 4; k++) { const f = (t * 0.8 + k / 4) % 1; U.dot(c, x + 110 * (0.2 + 0.2 * k), U.lerp(top, ip, f), 3.5, '#f2a93b'); }
        U.tag(c, '12 層記憶體', x + 55, top - 10, { align: 'center', size: 13 });
        U.tag(c, '底層控制晶片', x + 55, ip - 6, { align: 'center', size: 13, bg: 'rgba(255,255,255,.95)' }); // 畫在矽穿孔上面
        const xa = d > 0 ? x + 110 : x, xb = d > 0 ? cx - 90 : cx + 90;
        c.strokeStyle = 'rgba(201,121,59,.7)'; c.lineWidth = 1; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(xa, ip + 3 + k * 3); c.lineTo(xb, ip + 3 + k * 3); c.stroke(); }
        for (let k = 0; k < 14; k++) { const f = (t * 0.9 + k / 14) % 1; U.dot(c, U.lerp(xa, xb, f), ip + 3 + (k % 6) * 3, 2.6, '#f2a93b'); }
      });
      U.tag(c, '橘線是矽穿孔：蝕刻出細孔填銅，12 層上下直接相通（下一頁細看）', cx, 26, { align: 'center', size: 14 });
      U.tag(c, '緊貼 GPU、每疊 1,024 條資料線（HBM3E）', cx, 50, { align: 'center', size: 15, color: '#1f7a4d' });
    }
    c.restore();
  }
  /* 兩頁共用的 init：tabs＝這一頁用到的畫面編號 */
  function hbmInit(tabs) {
    return function (el, ctx) {
      const cv = U.canvas(U.$(el, '#p4-cv'));
      let m = tabs[0], ts = 0, tp = 1;
      if (U.$(el, '#p4-st')) U.stepper(el, 'p4-st', TSTEPS, i => { ts = i; tp = U.reduced() ? 1 : 0; }, ctx, { interval: 3200 });
      const tog = (id, on) => { const e = U.$(el, id); if (e) e.hidden = !on; };
      U.onSeg(el, 'p4-m', i => {
        m = tabs[i]; const x = HBM_BW[m];
        tog('#p4-stw', m === 2); tog('#p4-tsvq', m === 2); tog('#p4-why', m === 3);
        U.$(el, '#p4-cap').textContent = HBM_CAP[m][0]; U.$(el, '#p4-capd').textContent = HBM_CAP[m][1];
        U.setMeter(el, 'p4-bw', x[0], x[1], x[2]); U.$(el, '#p4-mv').textContent = x[3];
      });
      ctx.raf((dt, t) => { tp = Math.min(1, tp + dt / 1.3); cv.c.clearRect(0, 0, cv.w, cv.h); hbmDraw(cv.c, cv.w, cv.h, m, t, ts, tp); });
    };
  }
  const HBM_CAPCARD = `<div class="card"><h4>記憶體有多大</h4><div class="bigword" id="p4-cap" style="font-size:24px"></div><p id="p4-capd" style="font-size:15.5px;margin:2px 0 0"></p></div>`;
  Fig.add('pkg4', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('p4-m', ['一般顯示卡記憶體', 'HBM 高頻寬記憶體'], 0)}</div>${U.figHTML('p4-cv', '側面剖面（示意）', '')}</div>
      ${U.pageSide({
        top: HBM_CAPCARD,
        meters: [['p4-bw', '每秒能搬']],
        extra: `<p class="gloss" id="p4-mv" style="margin:-4px 0 0;font-size:16px"></p>`
      })}</div>`,
    init: hbmInit([0, 1])
  });
  Fig.add('pkg4b', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('p4-m', ['放大看矽穿孔', 'HBM4 有什麼不同？'], 0)}</div>${U.figHTML('p4-cv', '側面剖面（示意）', '')}<div id="p4-stw">${U.stepperHTML('p4-st')}</div></div>
      ${U.pageSide({
        top: HBM_CAPCARD,
        meters: [['p4-bw', '每秒能搬']],
        extra: `<p class="gloss" id="p4-mv" style="margin:-4px 0 0;font-size:16px"></p><div class="card alt" id="p4-tsvq"><h4>在記憶體上挖洞，不會弄壞嗎？</h4><p style="font-size:15.5px">不會，因為洞不是事後亂鑽的：<br><b>⓪ 不是用鑽頭鑽</b>：在晶圓廠做晶片的中途就用蝕刻挖好孔，最後磨薄才穿透<br><b>① 專用區域</b>：設計時就留一條「矽穿孔區」，周圍一圈不放電晶體<br><b>② 先絕緣</b>：孔壁先長絕緣層，銅和矽不會導通<br><b>③ 留安全距離</b>：銅受熱會膨脹、擠壓旁邊的矽<br><b>④ 先測再疊</b>：壞的不用，還有備用孔可以替換<br>代價是每片都要犧牲一點面積。</p></div><div class="card alt" id="p4-why" hidden><h4>底層換成邏輯製程，好在哪？</h4><p style="font-size:15.5px"><b>① 跑得更快</b>：電晶體更小更快，撐得起 2,048 條資料線<br><b>② 更省電</b>：同樣搬一筆資料，介面電路耗的電更少<br><b>③ 放得下更多功能</b>：電路更密<br><b>④ 可以客製</b>：客戶把部分原本在 GPU 裡的功能搬進底層</p><p style="font-size:14px;color:var(--ink-3)">為什麼以前不這樣做？DRAM 製程專門做電容（存資料），不擅長做又快又省電的邏輯電路。</p></div><div class="card" id="p4-meas"><h4>👁 這裡要量什麼</h4><p style="font-size:15px;margin:0">磨薄後剩多厚、厚度均不均勻、整片翹不翹；矽穿孔挖多深</p></div>`
      })}</div>`,
    init: hbmInit([2, 3])
  });

  /* 封裝 5：混合鍵合 */
  function hbond(c, w, h, i, p, t) {
    const L = 40, R = w - 40, W = R - L, mid = h * 0.52;
    const pitch = i === 0 ? 90 : 34, n = Math.floor((W - 40) / pitch), padW = i === 0 ? 34 : 18;
    // 下層晶片
    U.box(c, 'si', L, mid + 26, W, h - mid - 50); U.box(c, 'ox', L, mid, W, 26);
    let dy, gap;
    if (i === 0) { dy = 40 * (1 - p); gap = 26; }
    else if (i === 1) { dy = 70; gap = 0; }
    else { dy = i === 2 ? 70 * (1 - p) : 0; gap = 0; }
    const topB = mid - gap - dy; // 上層晶片的底面
    U.box(c, 'ox', L, topB - 26, W, 26); U.box(c, 'si', L, 44, W, topB - 26 - 44);
    U.tag(c, '上層晶片', L + 10, 70, { size: 14 }); U.tag(c, '下層晶片', L + 10, h - 34, { size: 14 });
    const exp = i === 3 ? p : 0, rec = i >= 1 ? 3 * (1 - exp) : 0; // 銅墊凹陷，加熱後膨脹補滿
    for (let k = 0; k < n; k++) {
      const x = L + 20 + k * pitch + (pitch - padW) / 2;
      U.box(c, 'cu', x, mid + rec, padW, 20 - rec);
      U.box(c, 'cu', x, topB - 20, padW, 20 - rec);
      if (i === 0) { const sq = 1 + 0.3 * p; c.fillStyle = '#9aa1a9'; c.beginPath(); c.ellipse(x + padW / 2, mid - gap / 2 - dy / 2, padW * 0.55 * sq, (gap + dy) / 2, 0, 0, 7); c.fill(); }
    }
    if (i === 0) { c.fillStyle = 'rgba(200,200,180,.35)'; c.fillRect(L, topB, W, mid - topB); }
    if (i === 3) { c.fillStyle = `rgba(179,38,30,${0.12 * p})`; c.fillRect(L, 44, W, h - 68); }
    if (i >= 1) { U.tag(c, '銅墊', L + 20 + padW / 2 + pitch * 2, mid + 40, { align: 'center', size: 13, color: '#b3541e' }); U.tag(c, '氧化層（絕緣）', R - 80, mid + 18, { align: 'center', size: 13 }); }
    if (i === 1) for (let k = 0; k < 8; k++) { const x = L + ((k * 0.37 + t * 0.2) % 1) * W; U.txt(c, '✦', x, mid - 4, { size: 14, color: '#1f4fb5' }); U.txt(c, '✦', x + 40, topB + 16, { size: 14, color: '#1f4fb5' }); }
    if (i === 2) { U.arrow(c, R + 16, topB - 60, R + 16, topB - 20, '#1f4fb5', 3); }
    const lab = ['舊方法：用微凸塊（銅柱＋一點錫）焊起來，中間留縫再填膠（灰色）', '① 兩面都用 CMP 磨到幾乎原子級平整，銅墊微微凹下', '② 精準對齊、室溫壓合：氧化層一碰到就黏住', '③ 加熱：銅膨脹，把縫補滿，銅對銅接成一整塊'][i];
    U.txt(c, lab, w / 2, 22, { align: 'center', size: 17, w: 700, color: i === 0 ? '#6a7888' : '#17202b' });
    U.tag(c, i === 0 ? '接點間距約 40 µm' : '接點間距約 9 µm 以下', R - 6, h - 36, { align: 'right', size: 14, color: '#b3541e' });
  }
  const HB_TABS = [
    { h: '為什麼要換？', p: '微凸塊是頂端帶一點錫的小銅柱：球要空間、中間還要填膠，間距量產多在約 25–50 微米，再小就很難。混合鍵合把銅墊直接埋在表面，間距 9 微米以下，和 40 微米比，接點多約 20 倍，兩顆晶片中間幾乎沒有縫。' },
    { h: '怎麼做？每一步都難', p: '' },
    { h: '一粒灰塵有多致命？', p: '灰塵把兩片撐開，周圍一大圈都貼不上。一粒約 1 微米的灰塵，就可能撐出直徑好幾毫米的空洞，裡面的接點全部失效。所以要在極乾淨的環境裡做。' }
  ];
  const HB_STEPS = [
    { t: '磨平', d: '難在哪：整片表面的高低差要小於約 1 奈米；銅墊還要刻意凹下幾奈米，留給加熱時膨脹。' },
    { t: '對準、壓合', d: '第一種接合：絕緣層碰絕緣層，室溫就黏住。難在哪：表面要極度乾淨，一粒灰塵就留下空洞；上下銅墊要對準到幾百奈米以內。' },
    { t: '加熱接合', d: '第二種接合：銅膨脹把縫補滿，銅接成一整塊。一個面上兩種接合，所以叫「混合」。難在哪：溫度不能熱到傷害下面的電晶體。' }
  ];
  function hbCompare(c, w, h, t) {
    const half = w / 2, by = h - 74, mid = (44 + by - 20) / 2;
    [[0, '微凸塊（銅柱＋錫）', 40], [1, '混合鍵合', 9]].forEach(([k, name, pitch]) => {
      const L = 20 + k * half, R = L + half - 40, W = R - L, gap = k ? 0 : 34;
      U.txt(c, name, L + W / 2, 24, { align: 'center', size: 17, w: 700, color: k ? '#1f7a4d' : '#6a7888' });
      U.box(c, 'si', L, 40, W, mid - 40 - gap / 2 - 10); U.box(c, 'ox', L, mid - gap / 2 - 10, W, 10);
      U.box(c, 'ox', L, mid + gap / 2, W, 10); U.box(c, 'si', L, mid + gap / 2 + 10, W, by - 20 - (mid + gap / 2 + 10));
      const px = k ? 13 : 58, n = Math.floor((W - 10) / px);
      if (!k) { c.fillStyle = 'rgba(241,227,168,.75)'; c.fillRect(L, mid - gap / 2, W, gap); }
      for (let j = 0; j < n; j++) {
        const x = L + 10 + j * px + px / 2;
        if (k) { U.box(c, 'cu', x - 4, mid - 10, 8, 10, { stroke: false }); U.box(c, 'cu', x - 4, mid, 8, 10, { stroke: false }); }
        else { U.box(c, 'cu', x - 9, mid - gap / 2 - 10, 18, 10, { stroke: false }); U.box(c, 'cu', x - 9, mid + gap / 2, 18, 10, { stroke: false }); c.fillStyle = '#9aa1a9'; c.beginPath(); c.ellipse(x, mid, 13, gap / 2 + 2, 0, 0, 7); c.fill(); }
      }
      U.txt(c, `間距：約 ${pitch} µm${k ? ' 以下' : ''}`, L, by, { size: 14, w: 700, color: '#17202b' });
      U.txt(c, k ? '縫隙：幾乎 0（絕緣層直接貼合）' : '縫隙：幾十微米，要填膠', L, by + 20, { size: 13, color: '#3e4b5b' });
      const dens = Math.round((1000 / pitch) ** 2);
      c.fillStyle = k ? '#1f7a4d' : '#9aa8b8'; c.fillRect(L, by + 30, (W - 10) * dens / 12346, 10);
      U.txt(c, `每 mm² 約 ${dens.toLocaleString()} 個接點`, L, by + 56, { size: 13, w: 600, color: k ? '#1f7a4d' : '#6a7888' });
    });
  }
  function hbDust(c, w, h, dust) {
    const L = 30, T = 40, W = w - 60, H = h - 100, nx = 40, ny = 20, sx = W / nx, sy = H / ny;
    U.txt(c, '上視：兩片晶圓接合面的一小塊（每個點是一個接點，示意）', L, 24, { size: 14, w: 600, color: '#17202b' });
    c.fillStyle = '#e8edf3'; c.fillRect(L, T, W, H);
    let bad = 0;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const x = L + (i + .5) * sx, y = T + (j + .5) * sy, hit = dust.some(d => Math.hypot(x - d.x, y - d.y) < d.r);
      if (hit) bad++;
      U.dot(c, x, y, Math.min(sx, sy) * 0.22, hit ? '#b3261e' : '#c9793b');
    }
    dust.forEach(d => { c.strokeStyle = 'rgba(179,38,30,.7)'; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); c.arc(d.x, d.y, d.r, 0, 7); c.stroke(); c.setLineDash([]); U.dot(c, d.x, d.y, 3, '#17202b'); });
    U.txt(c, `失效的接點：${bad} / ${nx * ny}`, L, T + H + 30, { size: 17, w: 700, color: bad ? '#b3261e' : '#1f7a4d' });
    U.txt(c, '黑點＝灰塵（放大畫）　紅圈＝被撐開、貼不上的空洞', L + W, T + H + 30, { align: 'right', size: 13, color: '#3e4b5b' });
  }
  Fig.add('pkg3', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('hb-m', ['① 和微凸塊比一比', '② 怎麼做', '③ 放一粒灰塵試試'], 0)}</div>
        ${U.figHTML('hb-cv', '剖面／上視示意', '')}
        <div id="hb-stw" hidden>${U.stepperHTML('hb-st')}</div>
        <div class="controls" id="hb-dw" hidden><button class="btn primary" id="hb-add" type="button">放一粒灰塵</button><button class="btn" id="hb-clr" type="button">清乾淨</button></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="hb-h"></h4><p id="hb-p" style="font-size:16.5px"></p></div>`,
        extra: `<div class="card alt"><h4>和 HBM 的關係</h4><p style="font-size:15.5px">HBM 目前（含 HBM4）仍用微凸塊疊 12–16 層（熱壓接合或回焊）；混合鍵合正在驗證，預計疊得更高時才導入。邏輯晶片已經在用：下一頁 SoIC。</p></div><div class="card"><h4>👁 這裡要量什麼</h4><p style="font-size:15px;margin:0">接合前：CMP 後銅墊凹多深、整片掃微粒；接合後：上下對準誤差（紅外線穿透矽量）、有沒有空洞</p></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#hb-cv'));
      let m = 0, st = 0, sp = 1, dust = [];
      U.stepper(el, 'hb-st', HB_STEPS, i => { st = i; sp = U.reduced() ? 1 : 0; if (m === 1) U.$(el, '#hb-p').textContent = HB_STEPS[i].d; }, ctx, { interval: 3200 });
      U.onSeg(el, 'hb-m', i => {
        m = i; U.$(el, '#hb-h').textContent = HB_TABS[i].h; U.$(el, '#hb-p').textContent = i === 1 ? HB_STEPS[st].d : HB_TABS[i].p;
        U.$(el, '#hb-stw').hidden = i !== 1; U.$(el, '#hb-dw').hidden = i !== 2;
      });
      U.$(el, '#hb-add').onclick = () => dust.push({ x: 60 + Math.random() * (w - 120), y: 70 + Math.random() * (h - 170), r: 40 + Math.random() * 30 });
      U.$(el, '#hb-clr').onclick = () => { dust = []; };
      ctx.raf((dt, t) => {
        sp = Math.min(1, sp + dt / 1.4);
        c.clearRect(0, 0, w, h);
        if (m === 0) hbCompare(c, w, h, t);
        else if (m === 1) hbond(c, w, h, st + 1, U.ease(sp), t);
        else hbDust(c, w, h, dust);
      });
    }
  });

  /* 玻璃基板頁：封裝剖面（晶片 → 中介層 → 封裝基板〔核心層＋上下線路層〕→ 電路板），hl 標出要看的那一層 */
  function glStack(c, x, y, w, h, hl, small, t) {
    const lay = small ? [0.22, 0.12, 0.36, 0.18] : [0.24, 0.12, 0.38, 0.16], gap = h * 0.04;
    let yy = y; const Y = [];
    lay.forEach(f => { Y.push([yy, h * f]); yy += h * f + gap; });
    const pulse = 0.55 + 0.45 * Math.sin((t || 0) * 3);
    const hi = (k, yy0, hh) => { c.strokeStyle = `rgba(179,84,30,${small ? 1 : pulse})`; c.lineWidth = small ? 2 : 3.5; c.strokeRect(x + 1, yy0 - 3, w - 2, hh + 6); };
    // 晶片層：中間運算晶片、兩側 HBM
    const [y0, h0] = Y[0];
    U.box(c, '#9fb5e3', x + w * 0.33, y0 + h0 * 0.2, w * 0.34, h0 * 0.8);
    [0.06, 0.74].forEach(f => { for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#f2cf8f' : '#e6bd70'; c.fillRect(x + w * f, y0 + k * h0 / 6, w * 0.2, h0 / 6 - 1); } });
    // 中介層
    const [y1, h1] = Y[1]; U.box(c, '#a9bcd0', x + w * 0.03, y1, w * 0.94, h1);
    // 封裝基板：上下線路層＋中間核心層
    const [y2, h2] = Y[2]; U.box(c, '#7fa06a', x, y2, w, h2 * 0.3); U.box(c, hl === 'core' ? '#a9d3dc' : '#c9b98a', x, y2 + h2 * 0.3, w, h2 * 0.4); U.box(c, '#7fa06a', x, y2 + h2 * 0.7, w, h2 * 0.3);
    // 電路板
    const [y3, h3] = Y[3]; U.box(c, '#4f6f45', x - w * 0.04, y3, w * 1.08, h3);
    if (!small) {
      const L = x + w + 22, lab = (yy0, hh, a, b, on) => { U.txt(c, a, L, yy0 + hh / 2 + 2, { size: 15, w: 700, color: on ? '#b3541e' : '#17202b' }); if (b) U.txt(c, b, L, yy0 + hh / 2 + 21, { size: 12.5, color: on ? '#b3541e' : '#6a7888' }); };
      lab(y0, h0, '① 晶片：運算晶片＋HBM', '');
      lab(y1, h1, '② 中介層', '矽做的，裡面有很密的線路', hl === 'int');
      lab(y2, h2, '③ 封裝基板', '中間一塊硬的「核心層」，上下是線路層', hl === 'core');
      lab(y3, h3, '④ 電路板（主機板）', '');
    }
    if (hl === 'int') hi(1, y1, h1);
    if (hl === 'core') hi(2, y2 + h2 * 0.3, h2 * 0.4);
    return Y;
  }
  /* 封裝 6：玻璃基板與面板級封裝 */
  Fig.add('glass', { body: true,
    eyebrow: EP, render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('gl-m', ['① 在封裝的哪一層？', '② 圓形晶圓 vs 方形面板', '③ 為什麼會翹？', '④ 有機基板 vs 玻璃基板'], 0)}</div>${U.figHTML('gl-cv', '左：12 吋圓形晶圓　右：31 × 31 cm 方形面板（上視）', '')}
        <div class="controls" id="gl-c">${U.range('gl-s', '中介層大小（邊長）', 40, 110, 5, 50, ' mm')}</div>
        <div class="controls" id="gl-c2" hidden>${U.range('gl-t', '溫度', 25, 260, 5, 25, '°C')}</div></div>
      ${U.pageSide({
        top: `<div class="card newcard"><h4>新技術：解決什麼問題？</h4><p>AI 晶片的中介層越做越大，圓形晶圓邊緣切不出完整的方塊，浪費很多；大尺寸的有機基板加熱時會翹曲，細線路也做不上去。</p><h4>誰在做？</h4><p>台積電 CoPoS（方形面板版 CoWoS）據報導 2026 年試產線啟動，約 2028–2029 年量產；Intel、SKC 等研發玻璃基板，約 2030 年前後導入，時程一再延後。</p></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#gl-cv'));
      let m = 0, S = 50, p = 0, T = 25;
      U.bind(el, 'gl-t', v => { T = v; }, v => v + '°C');
      U.onSeg(el, 'gl-m', i => { m = i; p = U.reduced() ? 1 : 0; U.$(el, '#gl-c').style.visibility = i === 1 ? '' : 'hidden'; U.$(el, '#gl-c').hidden = i === 2; U.$(el, '#gl-c2').hidden = i !== 2; const ft = U.$(el, '#gl-cv').closest('.fig').querySelector('.fig-title span'); if (ft) ft.textContent = ['AI 晶片封裝的剖面（示意）：兩個新技術改的是不同層', '中介層：左 12 吋圓形晶圓　右 31 × 31 cm 方形面板（上視）', '一整疊材料加熱時（剖面，翹曲放大很多倍畫）', '封裝基板加熱時的變形（側面，示意）'][i]; });
      U.bind(el, 'gl-s', v => S = v, v => v + ' mm');
      // 在 300 mm 圓裡最多排得下幾個 S×S 方塊（試幾種網格位移取最多）
      const countCircle = s => { let best = 0; for (const ox of [0, 0.5]) for (const oy of [0, 0.5]) { let n = 0; for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) { const x0 = (i + ox) * s - s / 2, y0 = (j + oy) * s - s / 2; if ([[x0, y0], [x0 + s, y0], [x0, y0 + s], [x0 + s, y0 + s]].every(([x, y]) => x * x + y * y <= 147 * 147)) n++; } if (n > best) best = n; } return best; };
      ctx.raf((dt, t) => {
        p = Math.min(1, p + dt / 1.4);
        c.clearRect(0, 0, w, h);
        if (m === 0) {
          // 總覽：整個封裝剖面，兩個新技術各自改哪一層
          glStack(c, 40, 24, w * 0.44, h - 92, (t % 6) < 3 ? 'int' : 'core', false, t);
          const on = (t % 6) < 3;
          U.tag(c, on ? '方形面板 → 改的是 ② 中介層的「做法」：在方形面板上做（CoPoS）' : '玻璃 → 改的是 ③ 封裝基板的「核心層」：從樹脂換成玻璃', w / 2, h - 14, { align: 'center', size: 15, color: '#b3541e' });
        } else if (m === 1) {
          glStack(c, w - 120, 6, 100, 70, 'int', true);
          U.txt(c, '改這一層 →', w - 126, 44, { align: 'right', size: 12, w: 700, color: '#b3541e' });
          const R = Math.min(w / 4 - 20, (h - 170) / 2), k = R / 150, cy = 92 + R;
          // 圓形晶圓
          const cx1 = w / 4; c.fillStyle = '#e8edf3'; c.beginPath(); c.arc(cx1, cy, R, 0, 7); c.fill(); c.strokeStyle = '#9aa8b8'; c.stroke();
          let n1 = 0, best = null;
          for (const ox of [0, 0.5]) for (const oy of [0, 0.5]) { const list = []; for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) { const x0 = (i + ox) * S - S / 2, y0 = (j + oy) * S - S / 2; if ([[x0, y0], [x0 + S, y0], [x0, y0 + S], [x0 + S, y0 + S]].every(([x, y]) => x * x + y * y <= 147 * 147)) list.push([x0, y0]); } if (!best || list.length > best.length) best = list; }
          n1 = best.length;
          best.forEach(([x0, y0]) => { c.fillStyle = '#9fb5e3'; c.fillRect(cx1 + x0 * k + 1, cy + y0 * k + 1, S * k - 2, S * k - 2); });
          // 方形面板（310 mm）
          const cx2 = w * 3 / 4, half = 155 * k;
          c.fillStyle = '#e8edf3'; c.fillRect(cx2 - half, cy - half, half * 2, half * 2); c.strokeStyle = '#9aa8b8'; c.strokeRect(cx2 - half, cy - half, half * 2, half * 2);
          const per = Math.floor(310 / S), n2 = per * per, off = (310 - per * S) / 2;
          for (let i = 0; i < per; i++) for (let j = 0; j < per; j++) { c.fillStyle = '#9fb5e3'; c.fillRect(cx2 - half + (off + i * S) * k + 1, cy - half + (off + j * S) * k + 1, S * k - 2, S * k - 2); }
          const u1 = n1 * S * S / (Math.PI * 150 * 150), u2 = n2 * S * S / (310 * 310);
          U.txt(c, `排得下 ${n1} 塊，用掉 ${Math.round(u1 * 100)}% 面積`, cx1, cy + R + 30, { align: 'center', size: 17, w: 700, color: u1 < 0.6 ? '#b3261e' : '#1f7a4d' });
          U.txt(c, `排得下 ${n2} 塊，用掉 ${Math.round(u2 * 100)}% 面積`, cx2, cy + R + 30, { align: 'center', size: 17, w: 700, color: u2 < 0.6 ? '#b3261e' : '#1f7a4d' });
        } else if (m === 2) {
          // 為什麼會翹：上層矽脹縮少、下層有機基板脹縮多（熱膨脹係數約 3 vs 15–17 ppm/°C）。填膠約 170°C 固化時是平的；降回室溫基板縮得多 → 拱起來；回焊時超過固化溫度 → 反向
          const T0 = 170, bow = (T0 - T) / 145, L = 70, R = w - 220, top = h * 0.34;
          [[top, '#a9bcd0', '矽晶片（熱膨脹約 3 ppm/°C）', 34], [top + 40, '#d9a35b', '凸塊與底部填膠', 22], [top + 70, '#8fae7a', '有機基板（約 15–17 ppm/°C）', 40]].forEach(([y, col, n, th]) => {
            c.fillStyle = col; c.beginPath(); for (let q = 0; q <= 40; q++) { const x = L + (R - L) * q / 40, u = q / 20 - 1; c.lineTo(x, y - bow * 60 * (1 - u * u)); } for (let q = 40; q >= 0; q--) { const x = L + (R - L) * q / 40, u = q / 20 - 1; c.lineTo(x, y + th - bow * 60 * (1 - u * u)); } c.closePath(); c.fill();
            U.tag(c, n, (L + R) / 2, y + th / 2 + 5 - bow * 60, { align: 'center', size: 13.5 });
          });
          const st = Math.abs(bow);
          [L + 18, R - 18].forEach(x => { c.strokeStyle = st > 0.6 ? '#e03131' : st > 0.3 ? '#e8590c' : '#1f7a4d'; c.lineWidth = 3; c.beginPath(); c.arc(x, top + 52, 14 + st * 8, 0, 7); c.stroke(); });
          U.tag(c, '角落的接點受力最大', L + 18, top + 140, { size: 13.5, color: '#b3261e' });
          const rx = R + 24, warp = Math.round(Math.abs(T0 - T) * 0.6);
          U.txt(c, '整疊翹起來', rx, top - 30, { size: 15, w: 700, color: '#17202b' });
          U.txt(c, `約 ${warp} µm`, rx, top, { size: 26, w: 700, color: warp > 80 ? '#b3261e' : warp > 40 ? '#e8590c' : '#1f7a4d' });
          ['翹太多：', '・角落接點裂開', '・填膠、接合面剝離', '・焊到主機板焊不平', '・開關機反覆冷熱，', '  接點慢慢疲勞'].forEach((s, k) => U.txt(c, s, rx, top + 34 + k * 24, { size: 14, w: k ? 500 : 700, color: '#3e4b5b' }));
          U.txt(c, T > 200 ? '回焊（焊錫熔化）約 250°C：超過固化溫度，反向翹' : Math.abs(T - T0) < 25 ? '填膠約 170°C 固化：這時候是平的' : T > 90 ? '晶片運作時可到 100°C 上下' : '室溫：基板縮得比矽多，翹得最多', (L + R) / 2, h - 44, { align: 'center', size: 15, color: '#b3541e' });
          U.txt(c, '量測也要盯：封裝後量翹曲、量所有接點是否在同一平面（共平面度）。數字為示意', (L + R) / 2, h - 16, { align: 'center', size: 14, color: '#3e4b5b' });
        } else {
          glStack(c, w - 120, 6, 100, 70, 'core', true);
          U.txt(c, '改這一層 →', w - 126, 44, { align: 'right', size: 12, w: 700, color: '#b3541e' });
          // 加熱時：樹脂基板翹曲、玻璃基板維持平整
          const e = U.ease(p), heat = 0.5 + 0.5 * Math.sin(t * 1.5);
          [[h * 0.33, '有機（樹脂）基板：加熱就翹', 26, '#6f8f5a'], [h * 0.72, '玻璃基板：熱膨脹接近矽，很平、不易翹', 3, '#a9d3dc']].forEach(([y, lab, amp, col]) => {
            const L = 60, R = w - 60, bend = amp * e * heat;
            c.fillStyle = col; c.beginPath();
            for (let x = L; x <= R; x += 4) { const f = (x - L) / (R - L), dy = bend * (1 - Math.pow(2 * f - 1, 2)); x === L ? c.moveTo(x, y + dy) : c.lineTo(x, y + dy); }
            for (let x = R; x >= L; x -= 4) { const f = (x - L) / (R - L), dy = bend * (1 - Math.pow(2 * f - 1, 2)); c.lineTo(x, y + dy + 22); }
            c.closePath(); c.fill();
            [0.3, 0.5, 0.7].forEach(f => { const x = L + f * (R - L), dy = bend * (1 - Math.pow(2 * f - 1, 2)); c.fillStyle = '#9fb5e3'; c.fillRect(x - 40, y + dy - 34, 80, 30); });
            U.txt(c, lab, w / 2, y + 56, { align: 'center', size: 17, w: 700, color: amp > 10 ? '#b3261e' : '#1f7a4d' });
          });
          U.tag(c, '封裝要經過好幾次高溫', w / 2, 24, { align: 'center', size: 15, color: '#b3541e' });
        }
      });
    }
  });

  /* 封裝 6b：各家 2.5D 封裝方案比較：先看基本結構，再看每一種改了哪一層 */
  const PKGS = [
    { n: '基本結構', co: '', kind: 'si', sub: 1, hl: '', row: -1,
      chg: '從上到下四層：晶片 → 中介層 → 封裝基板 → 電路板。', pro: '中介層是一片超密的「接線板」，讓運算晶片和記憶體之間有上萬條線。', con: '封裝基板把細線轉成粗線，才接得上主機板。各家方案的差別，就在中間這兩層。' },
    { n: 'CoWoS-S', co: '台積電', kind: 'si', sub: 1, hl: 'mid', row: 0, sw: 1,
      chg: '起點：中介層是一整片矽。線只有約 0.5–1 µm，只能用晶圓廠曝光機在矽上做（切「為何用曝光機」）。', pro: '線路最密、技術最成熟。', con: '做不大：曝光一格約 26×33 mm，更大要拼接；大片矽又貴、良率掉、加熱會翹，上限約 3.3 倍光罩。' },
    { n: 'CoWoS-L', co: '台積電', kind: 'rdl', sub: 1, hl: 'mid', row: 1,
      chg: '改善方向：不用整片昂貴、易翹的矽，改用樹脂佈線層（線較粗、較不受曝光大小限制），只在晶片交界埋一小塊「矽橋」走最密的線；還能埋電容穩住供電。', pro: '可以做得很大：已量產約 5.5 倍，2028 年目標 14 倍，NVIDIA Blackwell 就是用這種。', con: '製程更複雜，矽橋要對得很準。' },
    { n: 'CoPoS', co: '台積電', kind: 'rdl', sub: 1, hl: 'mid', panel: 1, row: 2,
      chg: '名字裡的 P＝Panel（方形面板）：和 CoWoS-L 一樣，但中介層改在方形面板上做（原本在圓形晶圓上）。', pro: '大塊中介層排得滿、浪費少、一次做得多。', con: '據報導 2026 年試產線啟動，約 2028–2029 年量產；設備要重新建立。' },
    { n: 'CoWoP', co: '業界研發中（據報導）', kind: 'rdl', sub: 0, hl: 'sub', row: 3,
      chg: '名字最後的 P＝PCB（電路板）：拿掉封裝基板，中介層直接焊在電路板上。', pro: '少一層材料，訊號路徑更短。', con: '電路板要做到和封裝基板一樣精細，還在研發中。' },
    { n: '別家方案', co: 'Intel EMIB-T、三星 I-Cube', kind: 'emib', sub: 1, hl: 'sub', row: 4,
      chg: 'Intel EMIB：只在封裝基板裡埋小矽橋，2017 年起量產；新版 EMIB-T 的矽橋再加矽穿孔。3D 疊晶片有 Foveros Direct（混合鍵合，對應 SoIC）。三星 I-Cube：和 CoWoS-S 類似的整片矽中介層。', pro: 'EMIB 便宜、能做大（Intel 規劃 2028 年超過 12 倍）；三星可一起提供晶圓和 HBM。', con: 'EMIB 只能連相鄰晶片；I-Cube 一樣受光罩大小限制。' }
  ];
  Fig.add('cowcmp', { body: true,
    eyebrow: EP, render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('cw-m', PKGS.map(x => x.n), 0)}<span id="cw-sw" hidden>${U.seg('cw-s', ['結構', '為何用曝光機'], 0)}</span></div>${U.figHTML('cw-cv', '側面剖面（示意）', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="cw-h"></h4>
          <p style="font-size:17px;margin:2px 0"><b id="cw-l1">改了什麼</b>：<span id="cw-a"></span></p>
          <p style="font-size:17px;margin:2px 0"><b id="cw-l2" style="color:#1f7a4d">好處</b>：<span id="cw-b"></span></p>
          <p style="font-size:17px;margin:2px 0"><b id="cw-l3" style="color:#b3261e">代價</b>：<span id="cw-c"></span></p></div>`,
        extra: `<table class="t" style="font-size:14px"><thead><tr><th>方案</th><th>誰</th><th>改了哪一層</th><th>狀態</th></tr></thead><tbody>
          <tr data-r="0"><td>CoWoS-S</td><td style="white-space:nowrap">台積電</td><td>起點：整片矽中介層</td><td>量產中</td></tr>
          <tr data-r="1"><td>CoWoS-L</td><td style="white-space:nowrap">台積電</td><td>中介層：樹脂佈線層＋矽橋</td><td>量產中</td></tr>
          <tr data-r="2"><td>CoPoS</td><td style="white-space:nowrap">台積電</td><td>中介層：改在方形面板做</td><td>2026 試產線，約 2028–29 量產（據報導）</td></tr>
          <tr data-r="3"><td>CoWoP</td><td style="white-space:nowrap">業界</td><td>拿掉封裝基板</td><td>研發中</td></tr>
          <tr data-r="4"><td>EMIB／EMIB-T</td><td style="white-space:nowrap">Intel</td><td>不用中介層，矽橋埋在基板</td><td>EMIB 2017 起量產；EMIB-T 2027 客戶量產</td></tr>
          <tr data-r="4"><td>Foveros Direct</td><td style="white-space:nowrap">Intel</td><td>晶片層：3D 混合鍵合（對應 SoIC）</td><td>2026 起出貨（據報導）</td></tr>
          <tr data-r="4"><td>I-Cube</td><td style="white-space:nowrap">三星</td><td>整片矽中介層</td><td>量產中</td></tr></tbody></table>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#cw-cv'));
      let m = 0, p = 0, why = 0;
      const sw = U.onSeg(el, 'cw-s', i => { why = i; p = U.reduced() ? 1 : 0; });
      U.onSeg(el, 'cw-m', i => {
        m = i; p = U.reduced() ? 1 : 0; const x = PKGS[i];
        U.$(el, '#cw-sw').hidden = !x.sw; if (!x.sw) { why = 0; sw.set(0); }
        U.$(el, '#cw-h').textContent = i ? `${x.n}（${x.co}）` : '基本結構：四層各做什麼';
        U.$(el, '#cw-l1').textContent = i ? '改了什麼' : '四層';
        U.$(el, '#cw-l2').textContent = i ? '好處' : '中介層';
        U.$(el, '#cw-l3').textContent = i ? '代價' : '封裝基板';
        U.$(el, '#cw-a').textContent = x.chg; U.$(el, '#cw-b').textContent = x.pro; U.$(el, '#cw-c').textContent = x.con;
        U.$$(el, 'tr[data-r]').forEach(r => r.style.background = +r.dataset.r === x.row ? '#fbe3c8' : '');
      });
      ctx.raf((dt, t) => {
        p = Math.min(1, p + dt / 1.2);
        const e = U.ease(p), x = PKGS[m], base0 = m === 0;
        c.clearRect(0, 0, w, h);
        if (x.sw && why) { whyLitho(c, w, h, e); return; }
        const W = Math.min(w - (base0 ? 330 : 60), 680), cx = base0 ? w - 20 - W / 2 : w / 2, L = cx - W / 2, R = cx + W / 2;
        let y = h - 50;
        const boxes = {};
        const layer = (hh, col, x0 = L, x1 = R) => { y -= hh; U.box(c, col, x0, y, x1 - x0, hh); return [x0, y, x1 - x0, hh]; };
        const bumps = (x0, x1, yy, n, col) => { for (let k = 0; k <= n; k++) U.dot(c, x0 + k * (x1 - x0) / n, yy, 3, col || '#b3541e'); };
        const big = x.kind !== 'si';
        const joints = big ? [cx - W * 0.31, cx, cx + W * 0.31] : [cx - W * 0.21, cx + W * 0.21];
        boxes.pcb = layer(44, '#4f7a3a');
        bumps(L + 30, R - 30, y - 3, 26, '#8a8f96');
        let drop = 0;
        if (x.sub) { y -= 6; boxes.sub = layer(54, '#86a86e', L + 30, R - 30); }
        else {
          drop = 60 * (1 - e);
          c.globalAlpha = 1 - e; c.setLineDash([6, 5]); c.strokeStyle = '#b3261e'; c.lineWidth = 2; c.strokeRect(L + 30, y - 60, W - 60, 54); c.setLineDash([]); c.globalAlpha = 1;
          boxes.sub = [L + 30, y - 60, W - 60, 54];
          y -= drop;
        }
        const ix0 = L + (big ? 44 : 100), ix1 = R - (big ? 44 : 100);
        if (x.kind === 'emib') {
          joints.forEach(jx => U.box(c, '#a9bcd0', jx - 30, y + 8, 60, 16));
        } else {
          y -= 6; bumps(ix0 + 10, ix1 - 10, y + 2, 32);
          boxes.mid = layer(32, x.kind === 'si' ? '#a9bcd0' : '#d9c7a0', ix0, ix1);
          if (x.kind === 'rdl') joints.forEach(jx => U.box(c, '#a9bcd0', jx - 26, y + 8, 52, 16));
        }
        const top = y - 6, ch = 92 * U.clamp(e * 1.5, 0, 1);
        const chips = big ? [cx - W * 0.155, cx + W * 0.155] : [cx];
        const cw = big ? W * 0.27 : W * 0.3;
        if (x.soic) { // SoIC：運算晶片疊在 I/O 晶片上（3D），整組放在中介層上
          const ioh = 40 * U.clamp(e * 1.5, 0, 1), uh = 62 * U.clamp(e * 1.5 - 0.3, 0, 1);
          chips.forEach(gx => {
            U.box(c, '#c9d3e6', gx - cw / 2 + 4, top - ioh, cw - 8, ioh); if (ioh > 30) U.txt(c, 'I/O 晶片', gx, top - ioh / 2 + 5, { align: 'center', size: 14, w: 700 });
            if (uh > 0) { c.fillStyle = '#c9793b'; c.fillRect(gx - cw / 2 + 12, top - ioh - 3, cw - 24, 3); U.box(c, '#9fb5e3', gx - cw / 2 + 12, top - ioh - 3 - uh, cw - 24, uh); if (uh > 40) U.txt(c, '運算晶片', gx, top - ioh - uh / 2, { align: 'center', size: 15, w: 700 }); }
          });
          boxes.top = [chips[0] - cw / 2 + 4, top - ioh - 3 - uh, chips[chips.length - 1] - chips[0] + cw - 8, ioh + uh + 3];
          if (e > 0.8) U.tag(c, '橘線：SoIC 混合鍵合（上一頁）', cx, boxes.top[1] - 14, { align: 'center', size: 14, color: '#b3541e' });
        } else chips.forEach(gx => { U.box(c, '#9fb5e3', gx - cw / 2 + 4, top - ch, cw - 8, ch); if (ch > 40) U.txt(c, '運算晶片', gx, top - ch / 2 + 6, { align: 'center', size: 16, w: 700 }); });
        const hbm = big ? [cx - W * 0.43, cx - W * 0.36, cx + W * 0.36, cx + W * 0.43] : [cx - W * 0.33, cx - W * 0.26, cx + W * 0.26, cx + W * 0.33];
        const hw = W * 0.055, hh = 124 * U.clamp(e * 1.5, 0, 1);
        hbm.forEach(hx => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#f2cf8f' : '#e6bd70'; c.fillRect(hx - hw / 2, top - hh + k * hh / 8, hw, hh / 8 - 1); } });
        if (hh > 60) U.tag(c, 'HBM 記憶體', (hbm[2] + hbm[3]) / 2, top - hh - 12, { align: 'center', size: 14 });
        bumps(hbm[0] - hw / 2, hbm[hbm.length - 1] + hw / 2, top + 2, 40);
        if (base0) {
          for (let k = 0; k < 6; k++) { const f = (t * 0.6 + k / 6) % 1, x0 = hbm[1] + hw / 2, x1 = cx - cw / 2 + 4, yy = boxes.mid[1] + 8 + (k % 3) * 7; U.dot(c, U.lerp(x0, x1, f), yy, 3, '#e0a33a'); U.dot(c, U.lerp(hbm[2] - hw / 2, cx + cw / 2 - 4, f), yy, 3, '#e0a33a'); }
        }
        // 各層的文字標籤
        const lab = (bx, s2, col) => { if (bx) U.tag(c, s2, bx[0] + bx[2] - 10, bx[1] + bx[3] / 2 + 5, { align: 'right', size: 14, color: col || '#17202b' }); };
        lab(boxes.pcb, x.sub ? '電路板（主機板）' : '高密度電路板');
        if (x.sub) lab(boxes.sub, '封裝基板');
        else U.tag(c, e < 0.9 ? '拿掉封裝基板…' : '封裝基板拿掉了：中介層直接焊在電路板上', cx, 58, { align: 'center', size: 15, color: '#b3261e' });
        if (boxes.mid) lab(boxes.mid, x.kind === 'si' ? '中介層（整片矽）' : '中介層（樹脂佈線層＋矽橋）');
        if (x.n === 'CoWoS-S' && e > 0.6) { // 一次曝光的範圍：要更大就得拼接
          const [mx, my, mw, mh] = boxes.mid, cell = mw / 3;
          c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.setLineDash([6, 4]); for (let q = 0; q < 3; q++) c.strokeRect(mx + q * cell + 2, my - 4, cell - 4, mh + 8); c.setLineDash([]);
          U.tag(c, '藍虛線：曝光機一次能印的一格（約 26×33 mm）', cx, 92, { align: 'center', size: 15, color: '#1f4fb5' });
          U.tag(c, '要更大只能拼接好幾格 → 貴、良率低、加熱會翹', cx, 118, { align: 'center', size: 15, color: '#b3261e' });
          U.arrow(c, mx + cell / 2, 128, mx + cell / 2, my - 8, '#1f4fb5', 2);
        }
        if (x.n === 'CoWoS-L' && e > 0.6) {
          const [mx, my, mw, mh] = boxes.mid;
          U.tag(c, '藍色小塊：矽橋，只放在需要超密線路的交界', cx, 92, { align: 'center', size: 15, color: '#1f4fb5' });
          U.tag(c, '其他地方是樹脂佈線層：線較粗、不用整片矽 → 可以做很大', cx, 120, { align: 'center', size: 15, color: '#1f7a4d' });
          U.arrow(c, joints[0], 130, joints[0], my + 4, '#1f4fb5', 2);
        }
        if (x.kind === 'emib') { U.tag(c, '↑ 矽橋埋在封裝基板裡（Intel EMIB）', joints[1], boxes.sub[1] + boxes.sub[3] - 7, { align: 'center', size: 13 }); U.tag(c, '三星 I-Cube 則和 CoWoS-S 類似：整片矽中介層', cx, 92, { align: 'center', size: 15, color: '#3e4b5b' }); }
        // 基本結構：引線說明每一層的用途，並畫出晶片和記憶體之間的訊號
        if (base0) {
          const rows = [[top - ch / 2, '① 晶片＋記憶體：真正在計算、存資料'], [boxes.mid[1] + 16, '② 中介層：超密的接線板，上萬條線'], [boxes.sub[1] + 27, '③ 封裝基板：細線轉粗線'], [boxes.pcb[1] + 22, '④ 電路板：主機板']];
          rows.forEach(([yy, s2], k) => { const lx = 16; U.txt(c, s2, lx, yy - 14 + (k === 0 ? 0 : 0), { size: 15, w: 700, color: '#17202b' }); c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx, yy - 8); c.lineTo(L - 6, yy - 8); c.stroke(); });
        }
        // 標示：這一種方案改了哪一層
        if (x.hl) {
          const bx = x.hl === 'top' ? boxes.top : x.hl === 'mid' ? boxes.mid : x.sub ? boxes.sub : boxes.pcb, pulse = 0.55 + 0.45 * Math.sin(t * 4);
          if (x.hl === 'top') U.tag(c, '改了這一層：晶片層', cx, bx[1] - 40, { align: 'center', size: 14, color: '#b3541e' });
          else U.tag(c, '改了這一層', bx[0] + 8, bx[1] + bx[3] / 2 + 5, { size: 13, color: '#b3541e' });
        }
        if (x.panel) {
          const ox = R - 60, oy = 60;
          c.fillStyle = '#e8edf3'; c.beginPath(); c.arc(ox - 110, oy, 38, 0, 7); c.fill(); c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.stroke();
          c.fillStyle = '#d9c7a0'; c.fillRect(ox - 132, oy - 22, 44, 44);
          c.fillStyle = '#e8edf3'; c.fillRect(ox - 38, oy - 38, 76, 76); c.strokeRect(ox - 38, oy - 38, 76, 76);
          [[-36, -36], [2, -36], [-36, 2], [2, 2]].forEach(([dx, dy]) => { c.fillStyle = '#d9c7a0'; c.fillRect(ox + dx, oy + dy, 34, 34); });
          U.txt(c, '圓形晶圓切 1 塊 → 方形面板切 4 塊（示意）', ox - 60, oy + 58, { align: 'center', size: 13, color: '#1f7a4d', w: 600 });
        }
        U.txt(c, m ? `${x.n}（${x.co}）` : '基本結構：大多數 AI 晶片都長這樣', 24, 30, { size: 19, w: 700, color: '#17202b' });
      });
    }
  });

  /* 1b. 一張圖看懂：正面 vs 背面（剖面並排） */
  Fig.add('bsx', { body: true,
    eyebrow: '第三部分 · ② 背面供電',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('bx-cv', '晶片剖面：紅是電源（紅球越小，電壓掉越多）　藍是訊號線', '')}<div class="controls">${U.range('bx-d', '電晶體密度', 1, 10, 1, 1, '')}</div></div>
      ${U.pageSide({
        meters: [['bx-f', '傳統掉壓'], ['bx-b', '背面掉壓']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#bx-cv'));
      let d = 1;
      U.bind(el, 'bx-d', v => d = v, v => v < 4 ? '低' : v > 7 ? '很高' : '中');
      ctx.raf((dt, t) => {
        const drop = 0.2 + 0.075 * d, dropB = 0.04 + 0.01 * d; // 密度越高，正面的電壓損失越嚴重
        U.setMeter(el, 'bx-f', drop, drop > .6 ? '嚴重' : drop > .4 ? '多' : '中', drop > .6 ? 'bad' : 'warn');
        U.setMeter(el, 'bx-b', dropB, '很少', 'good');
        c.clearRect(0, 0, w, h);
        const pw = (w - 30) / 2, yT = h * 0.56;
        const trans = (x0) => { for (let k = 0; k < 10; k++) U.box(c, 'metal', x0 + 12 + k * (pw - 24) / 10, yT - 6, (pw - 24) / 10 * 0.55, 12); };
        [0, 1].forEach(side => {
          const x0 = 10 + side * (pw + 10), cx = x0 + pw / 2;
          c.fillStyle = side ? '#f3f8f4' : '#fbf3f2'; c.fillRect(x0, 0, pw, h);
          U.txt(c, side ? '新：背面供電' : '傳統：正面供電', cx, 22, { align: 'center', size: 18, w: 700, color: side ? '#1f7a4d' : '#b3261e' });
          if (!side) {
            // 正面：導線全在電晶體上面，上粗下細；最下面是厚厚的矽
            U.box(c, 'si', x0 + 6, yT + 6, pw - 12, h - yT - 30); U.tag(c, '矽晶圓（很厚）', x0 + 14, h - 34, { size: 13 });
            const nL = 12;
            for (let l = 0; l < nL; l++) {
              const y = yT - 18 - l * ((yT - 90) / nL), th = 3 + l * 0.6, n = 12 - Math.floor(l / 2) + Math.round(d * 0.8);
              for (let k = 0; k < n; k++) { const pwr = k % 3 === 0; c.fillStyle = pwr ? '#c0392b' : '#5b8fd9'; c.fillRect(x0 + 10 + k * (pw - 20) / n, y - th, (pw - 20) / n * 0.6, th); }
            }
            for (let k = 0; k < 6; k++) U.dot(c, x0 + 20 + k * (pw - 40) / 5, 50, 7, '#9aa1a9');
            U.tag(c, '電從正面進來 ↓', cx, 70, { align: 'center', size: 14, color: '#b3261e' });
            for (let k = 0; k < 4; k++) {
              const x = x0 + 20 + k * (pw - 40) / 3, f = (t * 0.35 + k * 0.25) % 1, y = U.lerp(56, yT - 8, f);
              c.strokeStyle = 'rgba(192,57,43,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, 56); c.lineTo(x, yT - 8); c.stroke();
              U.dot(c, x, y, U.lerp(8, 8 * (1 - drop), f), '#c0392b');
            }
            trans(x0); U.tag(c, '電晶體', x0 + pw - 10, yT + 24, { align: 'right', size: 13 });
          } else {
            // 背面：上面只有訊號線；下面是磨薄的矽＋奈米穿孔＋粗電源線
            U.box(c, '#c8cdd4', x0 + 6, 36, pw - 12, 24); U.tag(c, '承載晶圓（支撐用）', x0 + 14, 53, { size: 12 });
            const nL = 10;
            for (let l = 0; l < nL; l++) { const y = yT - 18 - l * ((yT - 90) / nL), n = 12 - Math.floor(l / 2); for (let k = 0; k < n; k++) { c.fillStyle = '#5b8fd9'; c.fillRect(x0 + 10 + k * (pw - 20) / n, y - 3 - l * 0.5, (pw - 20) / n * 0.5, 3 + l * 0.5); } }
            U.tag(c, '正面只剩訊號線，寬鬆多了', cx, 82, { align: 'center', size: 14, color: '#1f4fb5' });
            trans(x0);
            const siY = yT + 8; U.box(c, 'si', x0 + 6, siY, pw - 12, 14);
            for (let k = 0; k < 10; k += 2) { c.fillStyle = U.MAT.cu; c.fillRect(x0 + 14 + k * (pw - 24) / 10, siY, 6, 14); }
            U.tag(c, '矽磨到極薄＋奈米穿孔（橘）', x0 + pw - 10, siY + 30, { align: 'right', size: 12 });
            for (let l = 0; l < 3; l++) { c.fillStyle = '#c0392b'; c.fillRect(x0 + 10, siY + 40 + l * 22, pw - 20, 12 + l * 2); }
            for (let k = 0; k < 6; k++) U.dot(c, x0 + 20 + k * (pw - 40) / 5, h - 22, 7, '#9aa1a9');
            U.tag(c, '電從背面進來 ↑', cx, h - 40, { align: 'center', size: 14, color: '#1f7a4d' });
            for (let k = 0; k < 4; k++) {
              const x = x0 + 16 + k * 2 * (pw - 24) / 10 + 3, f = (t * 0.6 + k * 0.25) % 1, y = U.lerp(h - 28, yT + 6, f);
              U.dot(c, x, y, U.lerp(8, 7, f), '#c0392b');
            }
          }
        });
      });
    }
  });

  /* 2. 背面供電流程 */
  function bsp(c, w, h, i, p, t) {
    const L = 40, R = w - 40, cx = w / 2, W = R - L;
    const tw = 14, sig = 6, sigH = 18;
    /* 以「晶片疊層」由下往上描述：front = 未翻面（矽在下）；翻面後（矽在上） */
    let mute = false;
    const tagQ = (...a) => { if (!mute) U.tag(...a); };
    const drawStack = (flipped, siH, tsv, power) => {
      const carrierH = 36, top0 = 60;
      if (!flipped) {
        const siY = h * 0.72 - 20;
        U.box(c, 'si', L, siY, W, 150);
        for (let k = 0; k < tw; k++) U.box(c, 'metal', L + 10 + k * (W - 20) / tw, siY - 12, 20, 12);
        for (let l = 0; l < sig; l++) for (let k = 0; k < 16; k++) { c.fillStyle = '#5b8fd9'; c.fillRect(L + 12 + k * (W - 24) / 16, siY - 26 - l * sigH, 12, 6); }
        tagQ(c, '訊號線（藍）', R - 6, siY - 60, { align: 'right', size: 14 });
        tagQ(c, '矽晶圓（很厚）', L + 8, siY + 40, { size: 14 });
        return;
      }
      // 翻面後：最下面是承載晶圓，上面依序是訊號線、電晶體、（被磨薄的）矽、背面電源線
      const carY = h - 70;
      U.box(c, 'bond', L, carY, W, carrierH);
      tagQ(c, '承載晶圓（支撐用）', L + 8, carY + 24, { size: 13 });
      const sigTop = carY - sig * sigH - 6;
      for (let l = 0; l < sig; l++) for (let k = 0; k < 16; k++) { c.fillStyle = '#5b8fd9'; c.fillRect(L + 12 + k * (W - 24) / 16, carY - 12 - l * sigH, 12, 6); }
      const trY = sigTop;
      for (let k = 0; k < tw; k++) U.box(c, 'metal', L + 10 + k * (W - 20) / tw, trY - 12, 20, 12);
      const siY = trY - 12 - siH;
      U.box(c, 'si', L, siY, W, siH);
      if (tsv > 0) for (let k = 0; k < tw; k += 2) { const x = L + 16 + k * (W - 20) / tw; c.fillStyle = U.MAT.cu; c.globalAlpha = tsv; c.fillRect(x, siY, 8, siH); c.globalAlpha = 1; }
      if (power > 0) { c.globalAlpha = power; for (let l = 0; l < 2; l++) { c.fillStyle = '#c0392b'; c.fillRect(L, siY - 18 - l * 22, W, 14); } c.globalAlpha = 1; tagQ(c, '背面電源線（紅）：又粗又短', L + 8, siY - 58, { size: 14, color: '#c0392b' }); }
      if (power > 0.6) { // 完成：電從背面電源線，經奈米穿孔直接流進電晶體
        for (let k = 0; k < tw; k += 2) { const x = L + 20 + k * (W - 20) / tw, f = (t * 0.7 + k * 0.13) % 1; U.dot(c, x, U.lerp(siY - 10, trY - 6, f), 5, '#c0392b'); }
        tagQ(c, '電：背面 → 穿孔 → 電晶體（路很短）', L + 8, trY + 22, { size: 14, color: '#b3261e' });
      }
      tagQ(c, '訊號線（藍）留在正面', R - 6, carY - 40, { align: 'right', size: 14 });
      tagQ(c, siH > 60 ? '原本的矽（現在朝上）' : '矽被磨到極薄', R - 6, siY + Math.min(siH, 40) / 2 + 5, { align: 'right', size: 14 });
    };
    const side = i === 5 ? (p < 0.5 ? '畫面上方是晶片背面' : '畫面上方是晶片正面') : i >= 1 && !(i === 1 && p < 0.5) ? '畫面上方是晶片背面' : '畫面上方是晶片正面';
    if (i === 5) {
      // 翻回來：正面朝上、背面朝下，和下一頁的方向一致
      const yc = h - 152, sc = Math.abs(Math.cos(p * Math.PI)) || 0.01;
      mute = p >= 0.5;
      c.save(); c.translate(0, yc); c.scale(1, p < 0.5 ? sc : -sc); c.translate(0, -yc);
      drawStack(true, 34, 1, 1);
      c.restore(); mute = false;
      if (p > 0.9) {
        U.tag(c, '承載晶圓（支撐用）', L + 8, h - 270 + 24, { size: 13 });
        U.tag(c, '正面：訊號線（藍）', R - 6, h - 200, { align: 'right', size: 14 });
        U.tag(c, '背面：電源線（紅），電往上送進電晶體', L + 8, h - 44, { size: 14, color: '#c0392b' });
        U.tag(c, '⟲ 翻回來看：上面是正面、下面是背面（和下一頁同方向）', w / 2, 64, { align: 'center', size: 17, color: '#b3541e' });
      }
    }
    else if (i === 0) drawStack(false);
    else if (i === 1) {
      // 翻面動畫：先縮成一條線再展開成翻面後的樣子
      c.save(); c.translate(0, h / 2); c.scale(1, Math.abs(Math.cos(p * Math.PI)) || 0.01); c.translate(0, -h / 2);
      if (p < 0.5) drawStack(false); else drawStack(true, 150, 0, 0);
      c.restore();
      if (p > 0.9) U.tag(c, '⟲ 翻過來了：現在上面是背面', w / 2, 64, { align: 'center', size: 18, color: '#b3541e' });
    }
    else if (i === 2) drawStack(true, U.lerp(150, 34, p), 0, 0);
    else if (i === 3) drawStack(true, 34, p, 0);
    else drawStack(true, 34, 1, p);
    const lab = ['正面照常做好電晶體和訊號線（藍）', '整片翻過來，正面朝下黏到「承載晶圓」上', '從背面磨薄，最後用蝕刻停在預先埋好的停止層', '從背面接到電晶體：露出或打出奈米級小孔，填入金屬（橘）', '在背面做粗的電源線（紅）：完成！', '最後翻回來，用平常的方向看'][i];
    U.txt(c, lab, w / 2, 30, { align: 'center', size: 18, w: 700, color: '#17202b' });
    if (!(i === 1 && p > 0.9) && !(i === 5 && p > 0.9)) U.tag(c, side, w - 44, 56, { align: 'right', size: 13, color: '#6a7888' });
  }
  Fig.add('bs2', { body: true,
    eyebrow: '第三部分 · ② 背面供電',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('b2-cv', '晶圓剖面（逐步）', '')}${U.stepperHTML('b2-st')}</div>
      ${U.pageSide({
        extra: `<div class="card"><h4>👁 這裡要量什麼</h4><p style="font-size:15px;margin:0">剩下的矽有多厚；黏合、磨薄後整片變形多少；背面圖案和正面電晶體的對準誤差（第九章的疊對）</p></div>`
      })}</div>`,
    init(el, ctx) {
      const steps = ['正面照常做', '翻過來黏上', '背面磨薄', '打洞接電', '做背面電源線', '翻回來看'].map((t, i) => ({ t, d: '', draw: (c, w, h, p, tt) => bsp(c, w, h, i, p, tt) }));
      U.animSteps(el, ctx, { canvas: 'b2-cv', stepper: 'b2-st', steps, interval: 3000 });
    }
  });

  /* 背面供電的代價：散熱變難（接在「怎麼做」之後） */
  Fig.add('bsheat', { body: true,
    eyebrow: '第三部分 · ② 背面供電',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('bh-cv', '剖面：晶片翻過來裝在封裝裡，散熱器在上面（示意，厚度不成比例）', '')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#bh-cv'));
      // 散熱路徑剖面：晶片面朝下裝在封裝裡（覆晶），熱往上走到散熱器
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const cols = [['正面供電：熱穿過厚矽就出去', [['散熱器', '#868e96', 26], ['矽基板（幾百 µm，導熱好）', '#a9bcd0', 120], ['電晶體（熱從這裡來）', '#c46a6a', 14], ['十幾層導線（訊號＋電源）', '#e3c28f', 50], ['凸塊、封裝基板', '#8fae7a', 30]], 3, 82],
          ['背面供電：熱要先穿過導線層和載體', [['散熱器', '#868e96', 26], ['載體晶圓（黏上去的矽）', '#c3cfdc', 90], ['接合層', '#d9a35b', 10], ['訊號導線（絕緣層導熱差）', '#e3c28f', 50], ['電晶體（原本的矽幾乎磨光）', '#c46a6a', 16], ['背面電源網路', '#b87333', 26], ['凸塊、封裝基板', '#8fae7a', 30]], 1, 94]];
        const cw = (w - 60) / 2;
        cols.forEach(([title, layers, hot, T], k) => {
          const x = 20 + k * (cw + 20), bw = cw * 0.5, bx = x + 10;
          U.txt(c, title, x + cw / 2, 26, { align: 'center', size: 15, w: 700, color: k ? '#b3261e' : '#1f7a4d' });
          let y = 46; const ys = [], kz = Math.min(1.7, (h - 150) / 246);
          layers.forEach(([n, col, h0]) => { const hh = h0 * kz; c.fillStyle = col; c.fillRect(bx, y, bw, hh - 2); U.txt(c, n, bx + bw + 10, y + hh / 2 + 5, { size: 13.5, color: '#17202b' }); ys.push([y, hh]); y += hh; });
          // 熱從電晶體往上走：每多一層熱阻大的，箭頭就變暗
          const [ty] = ys[layers.findIndex(l => l[0].startsWith('電晶體'))];
          for (let q = 0; q < 3; q++) { const f = (t * 0.35 + q / 3) % 1, yy = U.lerp(ty, 60, f); U.arrow(c, bx + bw * (0.3 + q * 0.2), yy, bx + bw * (0.3 + q * 0.2), yy - 14, `rgba(232,89,12,${k ? 0.9 - f * 0.6 : 0.9})`, 2.5); }
          U.txt(c, `熱點約 ${T}°C（示意）`, x + cw / 2, y + 30, { align: 'center', size: 17, w: 700, color: k ? '#b3261e' : '#1f7a4d' });
        });
        U.txt(c, '補救：導熱更好的接合層和載體、熱感知佈局；電壓降變小可以用較低電壓省電，背面粗金屬也能幫忙攤熱', w / 2, h - 14, { align: 'center', size: 14, color: '#3e4b5b' });
      });
    }
  });

  /* 2b. 三種接法：越來越貼近電晶體 */
  const BSW = [
    { n: '埋入式電源軌', who: 'imec 等研究機構', d: '在電晶體旁邊的地底下埋一條電源軌，背面的穿孔接到電源軌，再從正面繞一小段到源極。', near: 0.35 },
    { n: 'PowerVia', who: 'Intel 18A（已量產）', d: '奈米穿孔從背面一路往上，接到電晶體旁邊的接觸層，再進到源極。不用埋電源軌，比較好做。', near: 0.65 },
    { n: '直接背面接觸', who: '台積電 A16「Super Power Rail」（2027）；Intel 14A PowerDirect 也屬這一類（2028）', d: '背面的電直接從下方接到源極，路徑最短、最省空間，但對準要求最高，最難做。', near: 1 }
  ];
  Fig.add('bs4', { body: true,
    eyebrow: '第三部分 · ② 背面供電',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('b4-m', BSW.map(s => s.n), 0)}</div>${U.figHTML('b4-cv', '單一電晶體剖面（示意）：上面是正面、下面是背面', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="b4-who"></h4><div class="bigword" id="b4-n"></div><p id="b4-d" style="font-size:18.5px"></p></div>`,
        meters: [['b4-near', '離電晶體多近']],
        extra: `<div id="b4-ph" class="fig" style="display:none;padding:8px 10px;flex:none"><div class="fig-title"><span>研究樣品：奈米穿孔接到埋入式電源軌</span></div>
          <img src="${CREDITS.ntsv.f}" alt="imec 奈米穿孔與埋入式電源軌" style="display:block;width:100%;max-height:240px;object-fit:contain;border-radius:3px;background:#fff">
          <p class="gloss" style="margin:4px 0 0;font-size:14.5px">左：3D 示意，紫色是埋在底下的電源軌（BPR），金色柱子是奈米穿孔（nano-TSV，寬約 120 nm、高約 500 nm）；右：電子顯微鏡剖面。</p>
          <div style="font-size:11.5px;color:var(--ink-3)">影像：${CREDITS.ntsv.by}，Communications Engineering 2023（${CREDITS.ntsv.lic}）</div></div>`
      })}</div>`,
    init(el, ctx) {
      const cv = U.canvas(U.$(el, '#b4-cv')), c = cv.c, S = 1.35, w = cv.w / S, h = cv.h / S;
      let m = 0;
      U.onSeg(el, 'b4-m', i => { m = i; const s = BSW[i]; U.$(el, '#b4-who').textContent = s.who; U.$(el, '#b4-n').textContent = s.n; U.$(el, '#b4-d').textContent = s.d; U.setMeter(el, 'b4-near', s.near, ['遠', '中', '最近'][i], ['warn', '', 'good'][i]); U.$(el, '#b4-ph').style.display = i === 0 ? '' : 'none'; U.$(el, '.points').style.display = i === 0 ? 'none' : ''; const an = U.$(el, '.analogy'); if (an) an.style.display = i === 0 ? 'none' : ''; });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, cv.w, cv.h); c.save(); c.scale(S, S);
        const cx = w * 0.56, yT = h * 0.44, gw = 90, sdw = 110, L = 30, R = w - 30;
        // 正面：訊號線
        for (let l = 0; l < 4; l++) for (let k = 0; k < 9; k++) { c.fillStyle = '#5b8fd9'; c.fillRect(L + 10 + k * (R - L - 20) / 9, yT - 112 - l * 17, (R - L - 20) / 9 * 0.55, 5); }
        U.tag(c, '正面：訊號線', L + 6, 16, { size: 12, color: '#1f4fb5' });
        // 電晶體：源極｜閘極＋奈米片｜汲極
        const sx0 = cx - gw / 2 - sdw, dx0 = cx + gw / 2;
        U.box(c, 'n', sx0, yT - 50, sdw, 80); U.box(c, 'n', dx0, yT - 50, sdw, 80);
        U.box(c, 'metal', cx - gw / 2, yT - 70, gw, 100);
        [yT - 30, yT - 5, yT + 20].forEach(y => U.box(c, 'si', cx - gw / 2 - 6, y - 5, gw + 12, 10));
        // 正面接觸
        U.box(c, 'w', dx0 + sdw / 2 - 10, yT - 90, 20, 40);
        // 下方：磨薄的矽（或絕緣）＋背面電源線
        const siY = yT + 34; U.box(c, 'ox', L, siY, R - L, 50);
        const pwY = siY + 50; for (let l = 0; l < 3; l++) { c.fillStyle = '#c0392b'; c.fillRect(L, pwY + 8 + l * 26, R - L, 16); }
        U.tag(c, '背面：粗電源線', L + 6, h - 8, { size: 12, color: '#b3261e' });
        let path;
        if (m === 0) {
          const rx = sx0 - 70; // 埋入式電源軌在電晶體旁邊
          U.box(c, 'cu', rx - 18, yT - 10, 36, 44); U.tag(c, '埋入式電源軌', rx - 24, yT + 16, { align: 'right', size: 13, color: '#b3541e' });
          U.box(c, 'cu', rx - 7, siY, 14, 58);
          U.box(c, 'w', rx - 7, yT - 90, 14, 80); U.box(c, 'w', rx - 7, yT - 96, sx0 + sdw / 2 - rx + 7, 12); U.box(c, 'w', sx0 + sdw / 2 - 7, yT - 90, 14, 40);
          path = [[rx, pwY + 8], [rx, yT - 10], [rx, yT - 90], [sx0 + sdw / 2, yT - 90], [sx0 + sdw / 2, yT - 40]];
        } else if (m === 1) {
          const vx = sx0 - 40;
          U.box(c, 'cu', vx - 8, yT - 96, 16, pwY - yT + 104); U.tag(c, '奈米穿孔', vx - 12, yT + 70, { align: 'right', size: 13, color: '#b3541e' });
          U.box(c, 'w', vx - 8, yT - 100, sx0 + sdw / 2 - vx + 8, 12); U.box(c, 'w', sx0 + sdw / 2 - 7, yT - 90, 14, 40);
          path = [[vx, pwY + 8], [vx, yT - 94], [sx0 + sdw / 2, yT - 94], [sx0 + sdw / 2, yT - 40]];
        } else {
          U.box(c, 'cu', sx0 + sdw / 2 - 16, yT + 30, 32, pwY - yT - 22); U.tag(c, '背面接觸：直接接到源極底部', sx0 + sdw / 2 + 24, siY + 30, { size: 13, color: '#b3541e' });
          path = [[sx0 + sdw / 2, pwY + 8], [sx0 + sdw / 2, yT + 10]];
        }
        // 紅色路徑與流動的電
        c.strokeStyle = 'rgba(192,57,43,.55)'; c.lineWidth = 5; c.setLineDash([10, 6]); c.beginPath(); path.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.setLineDash([]);
        const segs = path.slice(1).map((p2, k) => Math.hypot(p2[0] - path[k][0], p2[1] - path[k][1])), tot = segs.reduce((a, b) => a + b, 0);
        for (let e = 0; e < 4; e++) {
          let d = ((t * 90 + e * tot / 4) % tot), k = 0; while (d > segs[k]) { d -= segs[k]; k++; }
          const f = d / segs[k]; U.dot(c, U.lerp(path[k][0], path[k + 1][0], f), U.lerp(path[k][1], path[k + 1][1], f), 6, '#c0392b');
        }
        U.tag(c, '源極', sx0 + sdw / 2, yT + 20, { align: 'center', size: 13 }); U.tag(c, '汲極', dx0 + sdw / 2, yT + 20, { align: 'center', size: 13 }); U.tag(c, '閘極', cx + 26, yT - 58, { align: 'left', size: 13 });
        U.tag(c, `電走的路：${['繞一段', '比較直', '最短'][m]}`, R - 6, 16, { align: 'right', size: 13, color: '#b3261e' });
        c.restore();
      });
    }
  });

  /* 3. 比較 */
  Fig.add('bs3', { body: true,
    eyebrow: '第三部分 · ② 背面供電',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('b3-m', ['正面供電（傳統）', '背面供電（新）'], 0)}</div>${U.figHTML('b3-cv', '晶片上視：每一格的電壓損失', '')}</div>
      <div class="col">
        ${U.meterHTML('b3-a', '電壓損失')}${U.meterHTML('b3-b', '訊號線空間')}
        <table class="t" style="font-size:18px"><thead><tr><th>公司</th><th>名稱</th><th>時間</th></tr></thead><tbody>
          <tr><td><span class="tag w">Intel</span></td><td>PowerVia</td><td>18A，已量產</td></tr>
          <tr><td><span class="tag w">Intel</span></td><td>PowerDirect（直接接觸）</td><td>14A，2028</td></tr>
          <tr><td><span class="tag a">TSMC</span></td><td>Super Power Rail</td><td>A16，2027 放量</td></tr>
          <tr><td><span class="tag g">Samsung</span></td><td>BSPDN</td><td>SF2Z，原訂 2027（2026 年未再更新）</td></tr></tbody></table>
        <p class="gloss" style="margin:0">台積電 A16 從背面直接接到源極底部，比 Intel 18A 的 PowerVia 更貼近電晶體，但製程更難；Intel 下一代 14A 的 PowerDirect 也改成直接接觸。</p>
        <div class="analogy" style="margin-top:auto"><div class="ic">${U.icon('road')}</div><div><h4>比喻</h4><p>像電網：只有幾座大電廠時，偏遠地區電壓不穩；到處都有變電所，每一區都很穩。</p></div></div>
      </div></div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#b3-cv'));
      let m = 0, mm = 0;
      U.onSeg(el, 'b3-m', i => m = i);
      const noise = Array.from({ length: 400 }, () => Math.random());
      // 藍（沒掉）→ 淺色 → 橘（掉很多）：色盲也分得出來
      const vcol = v => { const A = [66, 125, 196], B = [236, 234, 226], C = [222, 112, 32], [p, q, f] = v < .5 ? [A, B, v * 2] : [B, C, v * 2 - 1]; return `rgb(${p.map((x, k) => Math.round(x + (q[k] - x) * f)).join(',')})`; };
      ctx.raf((dt, t) => {
        mm += (m - mm) * Math.min(1, dt * 4);
        c.clearRect(0, 0, w, h);
        const n = 20, s = Math.min(w - 200, h - 60) / n, x0 = (w - n * s - 110) / 2, y0 = 20;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const pads = [[4, 4], [15, 4], [4, 15], [15, 15], [10, 10]];
          const dist = Math.min(...pads.map(([a, b]) => Math.hypot(i - a, j - b)));
          const front = U.clamp(dist / 8 + noise[(i * n + j) % 400] * 0.25, 0, 1);
          const back = U.clamp(0.08 + noise[(i * n + j) % 400] * 0.12, 0, 1);
          const v = U.lerp(front, back, mm);
          c.fillStyle = vcol(v); c.fillRect(x0 + i * s, y0 + j * s, s - 1, s - 1);
        }
        // 供電點：正面只有 5 個，背面到處都有
        const pads = mm < .5 ? [[4, 4], [15, 4], [4, 15], [15, 15], [10, 10]] : Array.from({ length: 49 }, (_, k) => [1.5 + (k % 7) * 2.8, 1.5 + Math.floor(k / 7) * 2.8]);
        pads.forEach(([a, b]) => { const px = x0 + (a + .5) * s, py = y0 + (b + .5) * s; c.fillStyle = '#17202b'; c.beginPath(); c.arc(px, py, mm < .5 ? 6 : 3.5, 0, 7); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); });
        // 色階圖例
        const lx = x0 + n * s + 18, lh = n * s;
        for (let k = 0; k < lh; k++) { c.fillStyle = vcol(1 - k / lh); c.fillRect(lx, y0 + k, 16, 1); }
        c.strokeStyle = '#9aa8b8'; c.strokeRect(lx, y0, 16, lh);
        U.txt(c, '電壓掉很多', lx + 22, y0 + 12, { size: 13, color: '#a8560f', w: 700 });
        U.txt(c, '幾乎沒掉', lx + 22, y0 + lh - 2, { size: 13, color: '#2c5f9e', w: 700 });
        c.fillStyle = '#17202b'; c.beginPath(); c.arc(lx + 8, y0 + lh / 2, 5, 0, 7); c.fill();
        U.txt(c, '供電點', lx + 22, y0 + lh / 2 + 5, { size: 13, color: '#3e4b5b' });
        U.tag(c, mm < .5 ? '示意：正面的電要往下穿過十幾層細導線，路徑長、電壓掉很多' : '背面到處都能直接供電，整片都很穩', w / 2, h - 12, { align: 'center', size: 15 });
        U.setMeter(el, 'b3-a', U.lerp(.75, .12, mm), mm > .5 ? '少' : '多', mm > .5 ? 'good' : 'bad');
        U.setMeter(el, 'b3-b', U.lerp(.5, .9, mm), mm > .5 ? '寬鬆' : '擁擠', mm > .5 ? 'good' : 'warn');
      });
    }
  });

  /* 8. CFET */
  Fig.add('cfet', { body: true,
    eyebrow: '第三部分 · 加碼',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('cf-t', ['環繞式：n、p 並排', '叉型片：中間加牆', 'CFET：上下疊'], 0)}</div>
        <div class="fig grow" style="padding:0"><div class="fig-canvas" id="cf-host"></div></div></div>
      ${U.pageSide({
        top: `<table class="t" style="font-size:18px"><thead><tr><th>做法</th><th>說明</th></tr></thead><tbody>
          <tr><td><b>一次做完</b></td><td>在同一片晶圓上，由下往上依序做兩層</td></tr>
          <tr><td><b>先做下層、再接一層矽</b></td><td>下層電晶體做好後，接合一層薄矽上去，再在上面做上層（溫度不能太高）</td></tr></tbody></table>`
      })}</div>`,
    init(el, ctx) {
      const t3 = T3D.mount(U.$(el, '#cf-host'), ctx, { type: 'gaapair', current: true, gateOpacity: 0.45 });
      if (!t3) return;
      U.onSeg(el, 'cf-t', i => t3.setType(['gaapair', 'forksheet', 'cfet'][i]));
    }
  });

  /* 10. 總路線圖（台積電版）：每段 [起, 迄, 文字, 列內第幾條, 跳頁 id] */
  const TRACKS = [
    ['製程（台積電）', [[2020, 2022, 'N5', 0, 'timeline'], [2022, 2025, 'N3', 0, 'timeline'], [2025, 2028, 'N2', 0, 'gaaflow'], [2026, 2028, 'N2P', 1], [2027, 2029, 'A16', 2, 'bsx'], [2028, 2029, 'A14', 0, 'timeline'], [2029, 2031, 'A13／A12', 0, 'timeline'], [2031, 2036, '之後（作者推估）', 0], [2022, 2036, 'N5／N4、N3 家族持續量產（上排只標開始量產的年份）', 3]]],
    ['電晶體', [[2020, 2025, '鰭式（N3 是最後一代）', 0, 'struct3d'], [2025, 2032, '環繞式（奈米片）', 0, 'gaaflow'], [2032, 2036, '叉型片／CFET（預估）', 1, 'cfet']]],
    ['微影', [[2020, 2036, '極紫外光 EUV', 0, 'litho3'], [2027, 2036, 'High-NA EUV：Intel 14A 導入（非台積電）；台積電到 A12 仍不用', 1, 'litho5']]],
    ['供電', [[2020, 2036, '正面供電（多數製程）', 0, 'bsx'], [2027, 2036, '背面供電：超級電軌（A16 起）', 1, 'bs4']]],
    ['封裝', [[2020, 2036, 'CoWoS：2026 年 5.5 倍光罩 → 2028 年 14 倍', 0, 'cowcmp'], [2022, 2036, 'SoIC 3D 堆疊／混合鍵合', 1, 'soic'], [2026, 2036, 'CoPoS 方形面板（2026 試產線，據報導）', 2, 'glass'], [2030, 2036, '業界：玻璃基板（預估，和 CoPoS 並行）', 4, 'glass'], [2026, 2036, '共同封裝光學 CPO', 3, 'cpo']]]
  ];
  Fig.add('roadmap', { body: true,
    render: () => `<div class="s-body full" style="grid-template-rows:1fr auto">
      <div class="fig" id="rm-fig"><div class="fig-canvas"><canvas id="rm-cv"></canvas></div></div>
      <div class="controls" id="rm-ctl">${U.range('rm-y', '年份', 2020, 2035, 1, 2026, '')}<div class="card key" style="flex:2"><p id="rm-t" style="font-size:18px;margin:0"></p></div></div></div>`,
    init(el, ctx) {
      const cv = U.$(el, '#rm-cv'), { c, w, h } = U.canvas(cv);
      let Y = 2026, rects = [];
      U.bind(el, 'rm-y', v => {
        Y = v;
        const now = TRACKS.map(([n, segs]) => n + '：' + (segs.filter(s => v >= s[0] && v < s[1]).map(s => s[2]).join('、') || '—')).join('　｜　');
        U.$(el, '#rm-t').textContent = (v > 2026 ? '（預估）' : '') + now;
      }, v => v + (v > 2026 ? '（預估）' : ''));
      cv.addEventListener('click', e => {
        const r = cv.getBoundingClientRect(), sc = r.width / w, x = (e.clientX - r.left) / sc, y = (e.clientY - r.top) / sc;
        const hit = rects.find(q => x >= q.x && x <= q.x + q.w && y >= q.y && y <= q.y + q.h && q.go);
        if (hit) Deck.goId(hit.go);
      });
      cv.style.cursor = 'pointer';
      ctx.raf(() => {
        c.clearRect(0, 0, w, h); rects = [];
        // 各列高度依條數分配：製程 4 條、封裝 5 條，中間三列各 2 條
        const X = U.lin(2020, 2036, 130, w - 14), WT = [1.2, 0.75, 0.75, 0.75, 1.55], unit = (h - 34) / WT.reduce((a, b) => a + b, 0);
        c.fillStyle = '#f2f5f8'; c.fillRect(X(2027), 0, X(2036) - X(2027), h - 20);
        for (let y = 2020; y <= 2035; y++) { c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(X(y), 0); c.lineTo(X(y), h - 24); c.stroke(); U.txt(c, String(y), X(y), h - 6, { align: 'center', size: 13, color: '#6a7888' }); }
        TRACKS.forEach(([n, segs], r) => {
          const rowH = WT[r] * unit, y0 = WT.slice(0, r).reduce((a, b) => a + b, 0) * unit + 6, lanes = Math.max(...segs.map(s => s[3])) + 1, node = r === 0;
          U.txt(c, n, 12, y0 + rowH / 2, { size: 16, w: 700, color: '#17202b', base: 'middle' });
          segs.forEach(([a, b, s, lane, go]) => {
            const on = Y >= a && Y < b, one = node && lanes === 1, hh = one ? rowH * 0.7 : (rowH - 8) / lanes - 3, yy = one ? y0 + 4 : y0 + 2 + lane * (hh + 3);
            c.fillStyle = on ? (node ? '#b3541e' : '#1f4fb5') : (node ? '#f8e9df' : '#c9d6ee'); U.rrect(c, X(a), yy, X(b) - X(a) - 3, hh, 4); c.fill();
            if (go) { c.strokeStyle = on ? '#fff' : '#7f97c9'; c.lineWidth = 1; c.setLineDash([3, 3]); U.rrect(c, X(a) + 1.5, yy + 1.5, X(b) - X(a) - 6, hh - 3, 3); c.stroke(); c.setLineDash([]); }
            U.txt(c, s + (go ? ' ↗' : ''), X(a) + (node ? (X(b) - X(a)) / 2 : 7), yy + hh / 2, { size: node ? 16 : Math.min(14, hh * 0.62), w: 700, align: node ? 'center' : 'left', color: on ? '#fff' : node ? '#8a4a1e' : '#3e4b5b', base: 'middle' });
            rects.push({ x: X(a), y: yy, w: X(b) - X(a) - 3, h: hh, go });
          });
        });
        c.strokeStyle = 'rgba(179,84,30,.45)'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(Y + .5), 0); c.lineTo(X(Y + .5), h - 24); c.stroke();
      });
    }
  });

  /* 11. 總結 */
  Fig.add('summary', { body: true,
    render: () => `<div class="s-body three">
      ${[
        ['1', '結構：越包越緊、越疊越高', '平面 → 鰭式 → 環繞式 → CFET。為了關住電子，閘極從壓住變成包住，再往上疊。', 'gate', 'gaatem', [['struct3d', '結構演進 3D'], ['gatectl', '包得越緊漏電越少'], ['gaaflow', '環繞式怎麼做'], ['cfet', 'CFET']]],
        ['2', '製程：精準到一層原子，也要量得到', 'EUV、原子層沉積、原子層蝕刻、磊晶；每一步靠量測和檢測把關、回饋機台，良率才一格一格爬上去。', 'onion', 'atoms', [['litho3', 'EUV 光源'], ['depo2', 'ALD'], ['etch4', 'ALE'], ['eyes', '量測與檢測'], ['ocdb', 'OCD 對答案'], ['yield', '良率學習']]],
        ['3', '系統：不只靠縮小', '先進封裝、背面供電。從整個系統下手：拆小晶片保良率、HBM 貼近運算晶片、背面供電走捷徑。', 'lego', 'die', [['pkg0', '為什麼要封裝'], ['pkg', 'AI 晶片拆解'], ['pkg3', '混合鍵合'], ['bs2', '背面供電']]]
      ].map(([n, t, d, ic, img, links]) => `<div class="fig" style="gap:14px"><div style="display:flex;gap:14px;align-items:center"><div class="analogy" style="padding:0;border:0;background:none;grid-template-columns:64px"><div class="ic">${U.icon(ic)}</div></div><div class="s-eyebrow" style="font-size:18px">趨勢 ${n}</div></div><div class="bigword">${t}</div><p style="font-size:21px;margin:0;line-height:1.55">${d}</p>
        <div style="height:200px;flex:none;background:#1b2430;border-radius:4px;overflow:hidden"><img src="${CREDITS[img].f}" alt="" style="display:block;width:100%;height:100%;object-fit:contain"></div>
        <div><div class="gloss" style="margin-bottom:6px">回頭看（點擊跳頁）</div><div style="display:flex;flex-wrap:wrap;gap:8px">${links.map(([id, l]) => `<button class="btn" type="button" data-go="${id}">${l}</button>`).join('')}</div></div></div>`).join('')}
    </div>
    <div class="card key" style="margin-top:16px"><p style="margin:0;font-size:21px">一句話帶回家：<b>晶片的進步，是無數個「原子等級的精準」疊加起來的結果。</b></p></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go)); }
  });
})();
