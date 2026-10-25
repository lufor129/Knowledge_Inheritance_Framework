/* 第三部分 ① 先進封裝：光通訊兩頁（接在 3DIC 設計與測試之後、背面供電之前；整組可略）
   ① 為什麼 AI 需要光　② 從插拔到共同封裝（最後一個分頁：光學引擎裡面電怎麼變光） */
(function () {
  const EP = '第三部分 · ① 先進封裝';
  const PU = '#b04fc9', PUD = '#6b3fb0', CU = '#c9793b', GO = '#e0a33a';
  const figT = (el, id) => U.$(el, '#' + id).closest('.fig').querySelector('.fig-title span');
  const goBtns = list => `<div class="controls" style="gap:8px">${list.map(([id, n]) => `<button class="btn" type="button" data-go="${id}" style="padding:4px 10px;font-size:14.5px">${n} →</button>`).join('')}</div>`;

  /* ---------- ① 為什麼 AI 需要光 ---------- */
  // 每條線道速度 Gb/s → 被動銅纜大約能到幾公尺（示意，公開資料的量級）
  const RATE = [25, 50, 100, 200, 400], CUR = [5, 3, 2, 1, 0.5];
  const ZONE = [[0.1, 0.4, '同一塊板子', '', '#eef3fc'], [0.4, 3, '同一櫃', 'scale-up', '#e3f1e7'], [3, 500, '櫃與櫃', 'scale-out', '#f6eefa'], [500, 10000, '跨棟、跨園區', '', '#f4f6f9']];
  // 每傳一位元的耗電 pJ/bit（公開資料的量級，示意）
  const SCH = [['插拔式光模組', 18, '約 15–20 pJ/bit', '#8a96a6'], ['共同封裝 CPO', 5, '約 5 pJ/bit', '#8a4fc9'], ['封裝內光 I/O（研發）', 1.5, '目標約 1–2 pJ/bit', '#1f7a4d']];
  const GN = [1000, 10000, 50000, 100000];
  const SCALE = [[8, '一台伺服器 8 顆'], [72, '一櫃 72 顆'], [1000, '約 1,000 顆'], [10000, '約 1 萬顆'], [100000, '約 10 萬顆']];
  const BITS = '10110011101001011001110100111010';
  const n0 = v => Math.round(v).toLocaleString('en-US');
  Fig.add('opt1', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('o1-t', ['① 銅線越快傳越短', '② 耗電：每傳一位元幾 pJ', '③ 規模：一櫃到上萬顆 GPU'], 0)}</div>${U.figHTML('o1-cv', '', '示意')}
        <div class="controls" id="o1-c0">${U.range('o1-r', '每條線道的速度', 0, 4, 1, 2, '')}</div>
        <div class="controls" id="o1-c1" hidden>${U.range('o1-n', '叢集有幾顆 GPU', 0, 3, 1, 3, '')}</div>
        <div class="controls" id="o1-c2" hidden>${U.range('o1-g', 'GPU 數量', 0, 4, 1, 1, '')}</div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="o1-h" style="text-transform:none"></h4><div class="bigword" id="o1-v"></div><p id="o1-p" style="font-size:16.5px"></p></div>`,
        extra: `<div class="card"><h4>這一頁的單位</h4><p style="font-size:15.5px"><b>Gb/s</b>：每秒傳幾十億個位元（0 或 1）<br><b>pJ/bit</b>：每傳一個位元用掉幾皮焦耳（10⁻¹² 焦耳）<br>換算：1 pJ/bit × 每秒 1 兆位元（1 Tb/s）＝ 1 瓦</p></div>`
      })}</div>`,
    init(el, ctx) {
      const cv = U.$(el, '#o1-cv'), { c, w, h } = U.canvas(cv), ft = figT(el, 'o1-cv');
      let tab = 0, ri = 2, gi = 3, si = 1, reach = CUR[2], wave = null;
      // 銅線像低通濾波：速度越快，每個位元越短，越容易被抹平（示意）
      const mkWave = r => { const spb = 14, tb = 0.12 * r / 25, a = 1 - Math.exp(-1 / (spb * tb)), att = 1 / (1 + r / 150), n = BITS.length * spb, out = []; let y = 0.5; for (let k = 0; k < 3 * n; k++) { y += a * (+BITS[Math.floor(k / spb) % BITS.length] - y); if (k >= 2 * n) out.push(0.5 + (y - 0.5) * att); } return { spb, n, out }; };
      const side = (hh, v, p) => { U.$(el, '#o1-h').textContent = hh; U.$(el, '#o1-v').textContent = v; U.$(el, '#o1-p').textContent = p; };
      U.onSeg(el, 'o1-t', i => { tab = i; [0, 1, 2].forEach(k => U.$(el, '#o1-c' + k).hidden = k !== i); ft.textContent = ['同一串 0 和 1 經過銅線；下面比銅線和光纖能傳多遠', '每傳一位元的耗電，和整個叢集加起來', '一櫃之內用銅線，櫃和櫃之間用光纖'][i]; });
      U.bind(el, 'o1-r', v => { ri = v; wave = mkWave(RATE[v]); }, v => RATE[v] + ' Gb/s');
      U.bind(el, 'o1-n', v => { gi = v; }, v => n0(GN[v]) + ' 顆');
      U.bind(el, 'o1-g', v => { si = v; }, v => SCALE[v][1]);
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const L = 20, R = w - 20;
        if (tab === 0) {
          const r = RATE[ri], A0 = Math.min(44, h * 0.1), NB = 24, o = Math.floor(t * 18) % wave.n, tot = NB * wave.spb;
          const trace = (y0, f, col) => { c.strokeStyle = col; c.lineWidth = 2.4; c.beginPath(); for (let k = 0; k <= tot; k++) { const x = L + k / tot * (R - L), v = f(k); k ? c.lineTo(x, y0 + (1 - v) * A0) : c.moveTo(x, y0 + (1 - v) * A0); } c.stroke(); };
          U.txt(c, `送出去：乾淨的 0 和 1（${r} Gb/s，每個位元只有 ${(1000 / r).toFixed(r >= 200 ? 1 : 0)} 兆分之一秒）`, L, 22, { size: 14.5, w: 700, color: '#17202b' });
          trace(32, k => +BITS[Math.floor((k + o) / wave.spb) % BITS.length], '#1f4fb5');
          const y2 = 32 + A0 + 34;
          U.txt(c, '跑過 1 公尺銅線之後：變弱、變糊', L, y2 - 10, { size: 14.5, w: 700, color: '#17202b' });
          c.fillStyle = '#f4f6f9'; c.fillRect(L, y2, R - L, A0);
          trace(y2, k => wave.out[(k + o) % wave.n], CU);
          if (r >= 200) U.tag(c, '沒做補強時，接收端分不清 0 和 1：只能縮短距離，或加補強電路（更耗電）', (L + R) / 2, y2 + A0 / 2 + 6, { align: 'center', size: 14, color: '#b3261e' });
          // 下半：能傳多遠（對數尺度 0.1 m → 10 km）
          const X = m => L + (Math.log10(m) + 1) / 5 * (R - L), y0 = y2 + A0 + 30, yb = h - 34;
          ZONE.forEach(([a, b, n, e, col]) => { c.fillStyle = col; c.fillRect(X(a), y0, X(b) - X(a), yb - y0); U.txt(c, n, (X(a) + X(b)) / 2, y0 + 18, { align: 'center', size: 14, w: 700, color: '#3e4b5b' }); if (e) U.txt(c, e, (X(a) + X(b)) / 2, y0 + 35, { align: 'center', size: 13, color: '#5b6878' }); });
          reach += (CUR[ri] - reach) * Math.min(1, dt * 5);
          const bh = Math.min(38, (yb - y0 - 60) / 4), b1 = y0 + (yb - y0) * 0.3, b2 = y0 + (yb - y0) * 0.66;
          CUR.forEach((m, k) => { const x = X(m), on = k === ri, yy = b1 + bh + 8 + (k % 2) * 17; c.fillStyle = on ? '#a8541e' : '#c3ccd6'; c.fillRect(x - 1, b1 + bh, 2, yy - b1 - bh + 2); U.txt(c, RATE[k] + 'G', x, yy + 14, { align: 'center', size: 13, w: on ? 700 : 500, color: on ? '#a8541e' : '#8a96a6' }); });
          c.fillStyle = CU; c.fillRect(X(0.1), b1, X(reach) - X(0.1), bh); U.txt(c, `銅線（被動銅纜）約 ${reach < 0.95 ? (reach * 100).toFixed(0) + ' 公分' : reach.toFixed(reach < 1.5 ? 1 : 0) + ' 公尺'}`, X(reach) + 8, b1 + bh * 0.7, { size: 14.5, w: 700, color: '#a8541e' });
          c.fillStyle = PU; c.fillRect(X(0.1), b2, X(2000) - X(0.1), bh); U.txt(c, '光纖：單模可到 2 公里以上，速度變快也幾乎不受影響', X(0.1) + 10, b2 + bh * 0.7, { size: 14, w: 700, color: '#fff' });
          [[0.1, '10 cm'], [1, '1 m'], [10, '10 m'], [100, '100 m'], [1000, '1 km'], [10000, '10 km']].forEach(([m, s]) => { c.fillStyle = '#9aa8b8'; c.fillRect(X(m) - 0.5, yb, 1, 6); U.txt(c, s, U.clamp(X(m), L + 18, R - 22), yb + 22, { align: 'center', size: 13, color: '#5b6878' }); });
          side(`每條線道 ${r} Gb/s`, `銅線約 ${CUR[ri] < 1 ? (CUR[ri] * 100) + ' 公分' : CUR[ri] + ' 公尺'}`, ri >= 3 ? '連一櫃之內都快不夠了：櫃內還能用銅，但只剩一兩公尺；櫃和櫃之間早就只能用光纖。（數字為示意）' : '速度每翻倍，同樣的銅線損失更大，能傳的距離就縮一截。光纖的損失幾乎和速度無關。（數字為示意）');
        } else if (tab === 1) {
          const N = GN[gi], LX = 220, BW = w - LX - 200, sc = v => v / 20 * BW;
          U.txt(c, '每傳一位元的耗電（公開資料的量級，示意）', L, 26, { size: 15, w: 700, color: '#17202b' });
          SCH.forEach(([n, v, s, col], k) => { const y = 48 + k * 58; U.txt(c, n, L, y + 22, { size: 15, w: 700, color: '#17202b' }); c.fillStyle = col; U.rrect(c, LX, y, sc(v), 32, 4); c.fill(); U.txt(c, s, LX + sc(v) + 10, y + 22, { size: 15, w: 700, color: col }); });
          const y1 = 48 + 3 * 58 + 26, gpuMW = N * 1 / 1000, MW = SCH.map(s => N * 3 * 0.8 * s[1] / 1e6), mx = MW[0];
          c.fillStyle = '#d3dbe4'; c.fillRect(L, y1 - 8, R - L, 1);
          U.txt(c, `整個叢集：${n0(N)} 顆 GPU，光模組加起來的耗電`, L, y1 + 18, { size: 15, w: 700, color: '#17202b' });
          MW.forEach((v, k) => { const y = y1 + 36 + k * 54, bw = v / mx * (w - LX - 330); U.txt(c, SCH[k][0], L, y + 20, { size: 14.5, color: '#3e4b5b' }); c.fillStyle = SCH[k][3]; c.globalAlpha = 0.85; c.fillRect(LX, y + 2, Math.max(2, bw), 26); c.globalAlpha = 1; U.txt(c, `約 ${v < 1 ? Math.round(v * 1000) + ' kW' : v.toFixed(1) + ' MW'}（GPU 本身的 ${(v / gpuMW * 100).toFixed(1)}%）`, LX + Math.max(2, bw) + 10, y + 21, { size: 14.5, w: 700, color: SCH[k][3] }); });
          U.txt(c, '假設：每顆 GPU 約配 3 個 800G 光模組（含交換器那一端），每顆 GPU 約 1 kW；皆為示意', L, h - 12, { size: 13, color: '#5b6878' });
          side(`${n0(N)} 顆 GPU 的叢集`, `光模組約 ${MW[0] < 1 ? Math.round(MW[0] * 1000) + ' kW' : MW[0].toFixed(1) + ' MW'}`, `換成 CPO 約 ${MW[1] < 1 ? Math.round(MW[1] * 1000) + ' kW' : MW[1].toFixed(1) + ' MW'}。佔比看起來只有幾 %，但頻寬每一代都翻倍；pJ/bit 不降，這部分就跟著翻倍。資料中心的電是固定的，網路多用一瓦，GPU 就少一瓦。`);
        } else {
          const [N, nm] = SCALE[si], racks = Math.ceil(N / 72), tiers = N <= 72 ? 0 : N <= 2048 ? 2 : 3, mods = N <= 72 ? 0 : N * (tiers === 2 ? 2 : 3);
          // 左：一櫃（18 個運算盤＋中間 9 個交換盤，背板銅纜）
          const rx = 30, ry = 30, rw = Math.min(170, w * 0.22), rh = h - 90, slot = rh / 27;
          c.fillStyle = '#2b3440'; U.rrect(c, rx - 8, ry - 8, rw + 34, rh + 16, 6); c.fill();
          for (let k = 0; k < 27; k++) {
            const y = ry + k * slot, sw = k >= 10 && k < 19, lit = si === 0 ? k < 2 : true;
            c.fillStyle = sw ? '#5b6878' : '#3e4b5b'; c.fillRect(rx, y + 1, rw, slot - 2);
            if (!sw) for (let q = 0; q < 4; q++) { c.fillStyle = lit ? '#9fb5e3' : '#56657a'; c.fillRect(rx + 8 + q * (rw - 16) / 4, y + 3, (rw - 16) / 4 - 6, slot - 6); }
            c.strokeStyle = CU; c.lineWidth = 1.5; c.beginPath(); c.moveTo(rx + rw, y + slot / 2); c.lineTo(rx + rw + 16, y + slot / 2); c.stroke();
          }
          c.fillStyle = CU; c.fillRect(rx + rw + 14, ry, 4, rh);
          for (let q = 0; q < 4; q++) { const f = (t * 0.5 + q / 4) % 1; U.dot(c, rx + rw + 16, ry + f * rh, 3.5, GO); }
          U.txt(c, si === 0 ? '8 顆：一台伺服器' : '一櫃 72 顆 GPU', rx + rw / 2 + 8, ry + rh + 30, { align: 'center', size: 14.5, w: 700, color: '#17202b' });
          U.txt(c, '櫃內：銅纜背板', rx + rw / 2 + 8, ry + rh + 48, { align: 'center', size: 13.5, color: '#a8541e' });
          // 右：櫃和櫃之間，光纖接到好幾層交換器
          const X0 = rx + rw + 70, W2 = w - X0 - 20;
          if (si <= 1) {
            U.txt(c, si === 0 ? '電路板上的走線就夠了' : '一櫃之內：全部用銅線就接得到', X0 + W2 / 2, h / 2 - 20, { align: 'center', size: 18, w: 700, color: '#1f7a4d' });
            U.txt(c, si === 0 ? '還不需要光' : 'NVIDIA 公開說法：一櫃 NVL72 的背板約 5,000 條銅纜', X0 + W2 / 2, h / 2 + 10, { align: 'center', size: 14.5, color: '#3e4b5b' });
            U.txt(c, '往右拖：再多就要櫃和櫃相連 →', X0 + W2 / 2, h / 2 + 40, { align: 'center', size: 14.5, color: PUD });
          } else {
            const show = Math.min(racks, 30), cols = Math.min(show, 15), rowsN = Math.ceil(show / cols), cw = W2 / cols, rkW = Math.min(22, cw - 6), rkH = 40;
            const yR = h - 70 - (rowsN - 1) * (rkH + 14), yLeaf = yR - 80, ySp = yLeaf - 80;
            const nLeaf = Math.min(8, Math.ceil(show / 4)), nSp = tiers === 3 ? 6 : 0;
            const lx = j => X0 + (j + 0.5) * W2 / nLeaf, sx = j => X0 + (j + 0.5) * W2 / Math.max(1, nSp);
            for (let k = 0; k < show; k++) {
              const x = X0 + (k % cols + 0.5) * cw, y = yR + Math.floor(k / cols) * (rkH + 14), j = Math.floor(k / show * nLeaf);
              c.strokeStyle = 'rgba(176,79,201,.45)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(lx(j), yLeaf + 14); c.stroke();
              c.fillStyle = '#3e4b5b'; c.fillRect(x - rkW / 2, y, rkW, rkH); for (let q = 0; q < 4; q++) { c.fillStyle = '#9fb5e3'; c.fillRect(x - rkW / 2 + 3, y + 4 + q * 9, rkW - 6, 5); }
            }
            for (let j = 0; j < nLeaf; j++) { if (nSp) for (let q = 0; q < nSp; q++) { c.strokeStyle = 'rgba(176,79,201,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(lx(j), yLeaf); c.lineTo(sx(q), ySp + 14); c.stroke(); } c.fillStyle = PUD; c.fillRect(lx(j) - 18, yLeaf, 36, 14); }
            for (let q = 0; q < nSp; q++) { c.fillStyle = '#4a2a80'; c.fillRect(sx(q) - 18, ySp, 36, 14); }
            for (let q = 0; q < 10; q++) { const f = (t * 0.4 + q / 10) % 1, k = q * 7 % show, x = X0 + (k % cols + 0.5) * cw, y = yR + Math.floor(k / cols) * (rkH + 14), j = Math.floor(k / show * nLeaf); U.dot(c, U.lerp(x, lx(j), f), U.lerp(y, yLeaf + 14, f), 3.5, PU); }
            U.txt(c, '交換器（第一層）', X0, yLeaf - 8, { size: 13.5, w: 700, color: PUD });
            if (nSp) U.txt(c, '交換器（第二、三層）', X0, ySp - 8, { size: 13.5, w: 700, color: '#4a2a80' });
            U.txt(c, `共約 ${n0(racks)} 櫃${racks > show ? `（只畫 ${show} 櫃）` : ''}；紫線＝光纖`, X0 + W2 / 2, h - 12, { align: 'center', size: 14.5, w: 700, color: '#17202b' });
          }
          side(`${nm}`, mods ? `光模組約 ${n0(mods)} 個` : '光模組 0 個', mods ? `${n0(racks)} 櫃，網路要 ${tiers} 層交換器，每一條櫃外的線都是光纖、兩端各一個光模組。GPU 多 10 倍，光模組多 10 倍以上。（示意）` : '距離只有一兩公尺以內，銅線又便宜又可靠，櫃內 scale-up 目前仍用銅。');
        }
      });
    }
  });

  // 光學引擎裡面：雷射 → 調變器（電控制光的明暗）→ 光纖 → 光偵測器（光變回電）
  function engine(c, w, h, t) {
    const y = h * 0.42, L = 30, R = w - 30, bits = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1];
    const box = (x, bw, name, sub, col) => { c.fillStyle = col; U.rrect(c, x, y - 34, bw, 68, 8); c.fill(); U.txt(c, name, x + bw / 2, y - 4, { align: 'center', size: 15, w: 700, color: '#fff' }); U.txt(c, sub, x + bw / 2, y + 18, { align: 'center', size: 13, color: '#f3eef8' }); };
    const xL = L, xM = L + (R - L) * 0.24, xD = L + (R - L) * 0.8, bw = 128;
    U.txt(c, '這一端：交換器／GPU 旁邊', L, 26, { size: 14, w: 700, color: '#17202b' }); U.txt(c, '另一端：別台機器', R, 26, { align: 'right', size: 14, w: 700, color: '#17202b' });
    box(xL, bw, '① 雷射', '一直發出穩定的光', PUD);
    box(xM, bw, '② 調變器', '用電控制光的明暗', '#8a4fc9');
    box(xD, bw, '④ 光偵測器', '把光變回電', PUD);
    c.strokeStyle = PU; c.lineWidth = 5; c.beginPath(); c.moveTo(xL + bw, y); c.lineTo(xM, y); c.stroke();
    c.strokeStyle = '#e8d4f0'; c.lineWidth = 8; c.beginPath(); c.moveTo(xM + bw, y); c.lineTo(xD, y); c.stroke();
    U.txt(c, '③ 光纖：光可以跑很遠、幾乎不耗損', (xM + bw + xD) / 2, y - 46, { align: 'center', size: 13.5, w: 700, color: PUD });
    const span = xD - (xM + bw), n = 12;
    for (let k = 0; k < n; k++) { const f = ((t * 0.25) + k / n) % 1, x = xM + bw + f * span, b = bits[(k + Math.floor(t * 0.25 * n)) % bits.length]; if (b) { c.fillStyle = PU; c.fillRect(x - 8, y - 5, 16, 10); } }
    const ey = y + 90;
    U.txt(c, '電訊號 0 1 1 0 1 …（從晶片來）', xM + bw / 2, ey + 34, { align: 'center', size: 13.5, color: '#a8660a' });
    c.strokeStyle = CU; c.lineWidth = 3; c.beginPath(); c.moveTo(xM + bw / 2, ey + 16); c.lineTo(xM + bw / 2, y + 36); c.stroke();
    for (let k = 0; k < 3; k++) { const f = (t * 0.8 + k / 3) % 1; U.dot(c, xM + bw / 2, U.lerp(ey + 16, y + 36, f), 4.5, GO); }
    c.strokeStyle = CU; c.lineWidth = 3; c.beginPath(); c.moveTo(xD + bw / 2, y + 36); c.lineTo(xD + bw / 2, ey + 16); c.stroke();
    for (let k = 0; k < 3; k++) { const f = (t * 0.8 + k / 3) % 1; U.dot(c, xD + bw / 2, U.lerp(y + 36, ey + 16, f), 4.5, GO); }
    U.txt(c, '還原成電訊號，送進晶片', xD + bw / 2, ey + 34, { align: 'center', size: 13.5, color: '#a8660a' });
    U.tag(c, '調變器就像快門：電說 1 就讓光過、說 0 就擋住，每秒開關上千億次', w / 2, h - 46, { align: 'center', size: 14, color: '#17202b' });
    U.tag(c, '調變器、光偵測器和控制電路做成「光學引擎」；雷射怕熱，常放在外面再用光纖送進來', w / 2, h - 16, { align: 'center', size: 13.5, color: PUD });
  }
  /* ---------- ② 從插拔到共同封裝：光越靠越近（原 CPO 頁改寫） ---------- */
  const CPS = [
    { cu: '幾十公分', cuF: 0.9, pj: '15–20', pjF: 1, c1: 'bad', c2: 'bad', h: '光模組插在機殼前面', d: '晶片的電訊號要先走幾十公分銅線，到機殼前面的光模組才變成光。中間常要加補強晶片，模組裡還有 DSP 整理訊號，都在耗電。好處是壞了拔掉換一個就好。' },
    { cu: '幾公分', cuF: 0.4, pj: '8–10', pjF: 0.5, c1: 'warn', c2: 'warn', h: '近封裝光學 NPO：引擎在板子上', d: '光學引擎從機殼前面搬到電路板上、緊靠封裝，銅線縮到幾公分，不用再加補強晶片。引擎還是獨立零件、壞了能換，算是走向 CPO 的過渡。' },
    { cu: '幾毫米', cuF: 0.1, pj: '5', pjF: 0.28, c1: 'good', c2: 'good', h: '共同封裝 CPO：引擎進到封裝裡', d: '光學引擎直接放在封裝基板上、緊貼晶片，銅線只剩幾毫米，一出封裝就是光纖。代價：引擎壞了不好換，所以最怕熱的雷射通常放在外面；光纖也要對得非常準。' },
    { cu: '不到 1 毫米', cuF: 0.03, pj: '1–2', pjF: 0.09, c1: 'good', c2: 'good', h: '光 I/O：光進到中介層／晶片旁（研發中）', d: '下一步把光元件做進中介層，或做成光學 I/O 小晶片和運算晶片放在一起，資料幾乎一出晶片就是光，GPU 和 GPU 之間也能直接用光連。目前還在研發。' }
  ];
  Fig.add('cpo', { body: true,
    eyebrow: EP, render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('c2-m', ['① 傳統插拔', '② 近封裝 NPO', '③ 共同封裝 CPO', '④ 下一步：光進中介層', '⑤ 電怎麼變光'], 0)}</div>${U.figHTML('c2-cv', '交換器電路板上視（示意）：黃點是電訊號，紫點是光訊號', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="c2-h" style="text-transform:none"></h4><p id="c2-p" style="font-size:16px"></p></div>`,
        meters: [['c2-a', '銅線長度'], ['c2-b', '每位元耗電 pJ（示意）']],
        extra: `<div class="card alt"><h4>實際產品（依公開資料）</h4><p style="font-size:15px"><b>NVIDIA</b>：Quantum-X、Spectrum-X 光子交換器，採用台積電 COUPE，宣稱比插拔式光模組省電約 3.5 倍<br><b>Broadcom</b>：Tomahawk 系列 CPO 交換器（51.2T、102.4T）<br><b>台積電 COUPE</b>：電子晶片用 SoIC 疊在光子晶片上；2026 年上封裝基板量產，比插拔式省電 2 倍、延遲少 10 倍</p></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#c2-cv'));
      let m = 0, mm = 0;
      const ft = U.$(el, '#c2-cv').closest('.fig').querySelector('.fig-title span');
      U.onSeg(el, 'c2-m', i => { m = i; U.$(el, '.meters').hidden = i === 4; ft.textContent = i === 4 ? '光學引擎裡面（示意）：黃點是電訊號，紫色是光' : '交換器電路板上視（示意）：黃點是電訊號，紫點是光訊號'; if (i === 4) { U.$(el, '#c2-h').textContent = '光學引擎的四個零件：雷射 → 調變器 → 光纖 → 偵測器'; U.$(el, '#c2-p').textContent = '晶片的電訊號在調變器變成光的明暗，光纖送到另一端，再被光偵測器變回電。CPO 就是把調變器、偵測器和控制電路做成光學引擎，放進封裝、緊貼晶片；雷射怕熱，常放在外面。'; return; } const s = CPS[i]; U.setMeter(el, 'c2-a', s.cuF, s.cu.replace('不到 1 毫米', '<1 毫米'), s.c1); U.setMeter(el, 'c2-b', s.pjF, s.pj, s.c2); U.$(el, '#c2-h').textContent = s.h; U.$(el, '#c2-p').textContent = s.d; });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        if (m === 4) { engine(c, w, h, t); return; }
        mm += (m - mm) * Math.min(1, dt * 4); if (Math.abs(m - mm) < 0.002) mm = m;
        const bx = 30, by = 34, bw = w - 60, bh = h - 80;
        c.fillStyle = '#6f8f5a'; c.fillRect(bx, by, bw, bh); U.tag(c, '電路板', bx + 8, by + 22, { size: 13 });
        c.fillStyle = '#2b3440'; c.fillRect(bx + bw - 14, by, 14, bh); U.txt(c, '機殼前面', bx + bw - 7, by - 10, { align: 'center', size: 13.5, color: '#3e4b5b' });
        const cx = bx + bw * 0.3, cy = by + bh / 2, cs = Math.min(bh * 0.34, 150, bw * 0.17);
        c.fillStyle = '#c7d0db'; c.fillRect(cx - cs * 0.85, cy - cs * 0.85, cs * 1.7, cs * 1.7);
        const ip = U.clamp(mm - 2, 0, 1);
        if (ip > 0) { c.globalAlpha = ip; c.fillStyle = '#eef1f5'; c.fillRect(cx - cs * 0.64, cy - cs * 0.64, cs * 1.28, cs * 1.28); c.globalAlpha = 1; }
        c.fillStyle = '#9fb5e3'; c.fillRect(cx - cs / 2, cy - cs / 2, cs, cs); U.txt(c, '交換器／GPU', cx, cy - 2, { align: 'center', size: 14, w: 700 }); U.txt(c, '晶片', cx, cy + 16, { align: 'center', size: 14, w: 700 });
        U.txt(c, ip > 0.5 ? '灰色：封裝基板　白色：中介層' : '灰色：封裝基板', cx, cy + cs * 0.85 + 20, { align: 'center', size: 13.5, color: '#fff' });
        // 光學引擎的位置：機殼前面 → 板子上 → 基板上 → 中介層上（相鄰狀態之間內插）
        const EX = [bx + bw - 62, cx + cs * 0.85 + 30, cx + cs * 0.5 + 8, cx + cs * 0.5 + 2], EW = [46, 34, 30, 14], SP = [1.3, 0.55, 0.4, 0.4];
        const k0 = Math.min(2, Math.floor(mm)), f = mm - k0, ex = U.lerp(EX[k0], EX[k0 + 1], f), ew = U.lerp(EW[k0], EW[k0 + 1], f), sp = U.lerp(SP[k0], SP[k0 + 1], f);
        const rows = [-0.6, -0.2, 0.2, 0.6], outY = r => cy + r * cs * 1.3;
        rows.forEach((r, k) => {
          const oy = cy + r * cs * 0.4, ey = cy + r * cs * sp, kx = Math.min(cx + cs, ex);
          if (ex - (cx + cs / 2) > 4) {
            c.strokeStyle = CU; c.lineWidth = 3; c.beginPath(); c.moveTo(cx + cs / 2, oy); c.lineTo(kx, ey); c.lineTo(ex, ey); c.stroke();
            for (let q = 0; q < 3; q++) { const g = (t * 0.5 + q / 3 + k * 0.1) % 1, x = U.lerp(cx + cs / 2, ex, g), y = x < kx ? U.lerp(oy, ey, (x - cx - cs / 2) / Math.max(1, kx - cx - cs / 2)) : ey; c.globalAlpha = mm < 0.5 ? 1 - g * 0.7 : 1; U.dot(c, x, y, mm < 0.5 ? 5 - g * 2.5 : 4, GO); c.globalAlpha = 1; }
          }
          c.fillStyle = mm < 0.5 ? '#e3c28f' : '#d7b7e6'; c.fillRect(ex, ey - 11, ew, 22); c.strokeStyle = 'rgba(20,30,45,.35)'; c.lineWidth = 1; c.strokeRect(ex + 0.5, ey - 10.5, ew - 1, 21);
          const x1 = ex + ew, x2 = w - 10, y2 = outY(r);
          c.strokeStyle = PU; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, ey); c.bezierCurveTo(x1 + 90, ey, x2 - 110, y2, x2, y2); c.stroke();
          for (let q = 0; q < 3; q++) { const g = (t * 0.5 + q / 3 + k * 0.1) % 1, u = 1 - g, bx3 = u * u * u * x1 + 3 * u * u * g * (x1 + 90) + 3 * u * g * g * (x2 - 110) + g * g * g * x2, by3 = u * u * u * ey + 3 * u * u * g * ey + 3 * u * g * g * y2 + g * g * g * y2; U.dot(c, bx3, by3, 4, PU); }
        });
        if (Math.abs(mm - m) < 0.05) {
          const s = CPS[m], ty = cy - 0.6 * cs * Math.max(0.4, SP[m]) - 30;
          if (m < 3) { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx + cs / 2, ty + 10); c.lineTo(ex, ty + 10); c.stroke(); [cx + cs / 2, ex].forEach(x => { c.beginPath(); c.moveTo(x, ty + 4); c.lineTo(x, ty + 16); c.stroke(); }); }
          U.tag(c, `銅線：${s.cu}`, m < 3 ? Math.max((cx + cs / 2 + ex) / 2, cx + 60) : cx + cs * 0.5, m < 3 ? ty : cy - cs * 0.64 - 14, { align: 'center', size: 14, color: '#a8541e' });
          const lab = ['光模組（在這裡才把電變成光）', '光學引擎在板子上、緊靠封裝（壞了能換）', '光學引擎在封裝基板上，一出封裝就是光纖', '光元件做進中介層、緊貼晶片（研發中）'][m];
          U.tag(c, lab, m === 0 ? bx + bw - 70 : cx + cs * 0.9, outY(0.6) + 40 > by + bh - 6 ? by + bh - 12 : outY(0.6) + 40, { align: m === 0 ? 'right' : 'left', size: 14, color: m === 0 ? '#17202b' : PUD });
        }
      });
    }
  });

})();
