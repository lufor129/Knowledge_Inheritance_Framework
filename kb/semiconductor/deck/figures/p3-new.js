/* 第三部分新增：SoIC（混合鍵合後）；頁序在 index.html 用 Deck.move 調整 */
(function () {
  const EP = '第三部分 · ① 先進封裝';

  /* ---------- SoIC：台積電的 3D 堆疊 ---------- */
  const PITCH = [
    { n: '微凸塊 40 µm', p: 40, y: '2.5D／傳統 3D', c: '#9aa1a9' },
    { n: 'SoIC 9 µm（2022）', p: 9, y: '2022 年起量產', c: '#c9793b' },
    { n: 'SoIC 6 µm（2025）', p: 6, y: '2025 年起', c: '#c9793b' },
    { n: 'SoIC 4.5 µm（2029 目標）', p: 4.5, y: '2029 年目標', c: '#b3541e' }
  ];
  Fig.add('soic', { body: true,
    eyebrow: EP, render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('so-t', ['① 接點有多密', '② 實例：AMD 3D V-Cache'], 0)}<span id="so-pw">${U.seg('so-p', PITCH.map(x => x.n), 1)}</span></div>
        <div id="so-p0" style="display:flex;flex-direction:column;flex:1;min-height:0">${U.figHTML('so-cv', '左：兩顆晶片疊起來（剖面）　右：0.2 × 0.2 mm 範圍內的接點（上視）', '')}</div>
        <div id="so-p1" hidden style="display:flex;flex-direction:column;flex:1;min-height:0">${U.figHTML('so-vc', '上：AMD 3D V-Cache 結構（自繪示意圖）　下：CPU 和快取之間的路', '')}</div></div>
      ${U.pageSide({
        top: `<div class="card alt" id="so-why2" hidden><h4>為什麼 CPU 需要它？</h4><p style="font-size:16px">CPU 每算一步都要跟<b>快取</b>拿資料。快取不夠大，就得跑去更遠、更慢的記憶體拿，<b>中間那條路就成了瓶頸</b>，核心再快也在空等。<br>3D V-Cache 用 SoIC 把一塊 64 MB 快取直接疊在 CPU 上：L3 快取從 32 MB 變 96 MB，上下只隔幾微米、頻寬約 2 TB/s。AMD 宣稱 5800X3D 遊戲平均比 5900X 快約 15%。圖是第一代（Zen 3）結構，最新一代改把快取放在下面。</p></div><div class="card alt" id="so-why1"><h4>為什麼要做 SoIC？</h4><p style="font-size:16px"><b>① 距離最短</b>：上下只差幾微米，接點又密，傳資料更快、更省電<br><b>② 拆開做再疊</b>：例如 MI300 的 I/O 晶片用 6 奈米、運算晶片用 5 奈米，分開做良率更好<br><b>③ 省面積</b>：往上疊，不用攤平佔地；疊好還能再放上 CoWoS</p></div><div class="fact"><div class="v" id="so-n">—</div><div class="d" id="so-d">每平方毫米的上下接點數</div></div>`,
        extra: `<table class="t" style="font-size:16px"><tbody>
          <tr><td><b>AMD 3D V-Cache</b></td><td>快取晶片疊在 CPU 上</td></tr>
          <tr><td><b>AMD MI300</b></td><td>運算晶片疊在 I/O 晶片上，再放上 CoWoS</td></tr>
          <tr><td><b>A14 疊 A14</b></td><td>2029 年，接點密度是 N2 疊 N2 的 1.8 倍</td></tr></tbody></table>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#so-cv'));
      let k = 1, an = 0, tab = 0, vc = null;
      // 右上大數字：① 跟著間距按鈕；② V-Cache 固定是 SoIC 9 µm
      function showN(i, vcache) {
        const x = PITCH[i], n = Math.round((1000 / x.p) ** 2);
        U.$(el, '#so-n').textContent = n.toLocaleString() + ' 個';
        U.$(el, '#so-d').textContent = vcache ? `V-Cache 用 SoIC 9 µm：每平方毫米的上下接點數，約微凸塊的 ${Math.round(n / 625)} 倍` : `每平方毫米的上下接點數（${x.y}）${i ? `，約微凸塊的 ${Math.round(n / 625)} 倍` : ''}`;
      }
      U.onSeg(el, 'so-t', i => {
        tab = i; U.$(el, '#so-p0').hidden = i !== 0; U.$(el, '#so-p1').hidden = i !== 1; U.$(el, '#so-pw').hidden = i !== 0;
        U.$(el, '#so-why1').hidden = i !== 0; U.$(el, '#so-why2').hidden = i !== 1;
        if (i === 1 && !vc) vc = U.canvas(U.$(el, '#so-vc'));
        showN(i === 1 ? 1 : k, i === 1);
      });
      // ② AMD 3D V-Cache：自繪結構剖面（依公開資料）＋「去遠方記憶體 vs 疊上去」
      ctx.raf((dt, t) => {
        if (tab !== 1 || !vc) return;
        const { c, w, h } = vc; c.clearRect(0, 0, w, h);
        const iw = w * 0.72, ih = iw * 455 / 1000, ix = 4, iy = 14;
        // 剖面示意：下層 CPU 晶片（核心＋原本的 L3），上層正中間疊 64 MB 快取晶片，兩側墊結構矽；中間是混合鍵合，矽穿孔把上下接通
        c.fillStyle = '#f2f5f8'; c.fillRect(ix, iy, iw, ih);
        const x0 = ix + iw * 0.04, x1 = ix + iw * 0.96, by0 = iy + ih * 0.58, by1 = iy + ih * 0.86, ty0 = iy + ih * 0.22, l3a = ix + iw * 0.36, l3b = ix + iw * 0.7;
        c.fillStyle = '#c9d3df'; c.fillRect(x0, by0, x1 - x0, by1 - by0);
        c.fillStyle = '#9fb5e3'; c.fillRect(x0 + 6, by0 + 6, l3a - x0 - 10, by1 - by0 - 12); c.fillRect(l3b + 4, by0 + 6, x1 - l3b - 10, by1 - by0 - 12);
        c.fillStyle = '#7fa6e8'; c.fillRect(l3a, by0 + 6, l3b - l3a, by1 - by0 - 12);
        c.fillStyle = '#e3e7ec'; c.fillRect(x0, ty0, l3a - x0 - 4, by0 - ty0 - 4); c.fillRect(l3b + 4, ty0, x1 - l3b - 4, by0 - ty0 - 4);
        c.fillStyle = '#e8a05a'; c.fillRect(l3a, ty0, l3b - l3a, by0 - ty0 - 4);
        c.strokeStyle = '#b3541e'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(x0, by0 - 2); c.lineTo(x1, by0 - 2); c.stroke(); c.setLineDash([]);
        for (let q = 0; q < 9; q++) { const xx = l3a + 12 + q * (l3b - l3a - 24) / 8; c.fillStyle = '#d08a1e'; c.fillRect(xx - 2, by0, 4, by1 - by0 - 10); }
        c.fillStyle = '#8a95a3'; c.fillRect(x0 - 10, by1, x1 - x0 + 20, ih * 0.08);
        U.tag(c, '疊上去的 64 MB 快取晶片', (l3a + l3b) / 2, ty0 + (by0 - ty0) / 2 + 5, { align: 'center', size: 14, color: '#b3261e' });
        U.tag(c, '結構矽（墊高、散熱）', (x0 + l3a) / 2, ty0 + (by0 - ty0) / 2 + 5, { align: 'center', size: 13, color: '#3e4b5b' });
        U.tag(c, 'CPU 核心', (x0 + l3a) / 2, (by0 + by1) / 2 + 5, { align: 'center', size: 14, color: '#1f4fb5' });
        U.tag(c, 'CPU 原本的 32 MB 快取', (l3a + l3b) / 2, by1 + 22, { align: 'center', size: 14, color: '#1f4fb5' });
        U.tag(c, '矽穿孔（上下接通）', l3b + 10, (by0 + by1) / 2 + 5, { size: 13, color: '#a8660a' });
        U.tag(c, '混合鍵合（銅對銅）', x1, by0 - 10, { align: 'right', size: 13, color: '#b3541e' });
        U.txt(c, '示意圖（自繪，依 AMD 公開資料；比例不準）', ix, iy + ih + 22, { size: 11, color: '#6a7888' });
        // 右上：L3 容量
        const qx = ix + iw + 26, qw = w - qx - 14;
        U.txt(c, 'L3 快取容量', qx, iy + 30, { size: 15, w: 700, color: '#17202b' });
        [['一般版', 32, '#9aa1a9'], ['X3D', 96, '#c9793b']].forEach(([n, v, col], q) => { const yy = iy + 46 + q * 40; U.txt(c, n, qx, yy + 18, { size: 14, color: '#3e4b5b' }); c.fillStyle = col; c.fillRect(qx + 60, yy, (qw - 120) * v / 96, 26); U.txt(c, v + ' MB', qx + 66 + (qw - 120) * v / 96, yy + 19, { size: 14, w: 700, color: '#17202b' }); });
        U.txt(c, '變 3 倍', qx + qw - 6, iy + 150, { align: 'right', size: 20, w: 700, color: '#b3541e' });
        // 下排：兩種情況
        const by = iy + ih + 60, half = (w - 50) / 2, flowDot = (x0, y0, x1, y1, n, sp, col) => { for (let q = 0; q < n; q++) { const f = (t * sp + q / n) % 1; U.dot(c, U.lerp(x0, x1, f), U.lerp(y0, y1, f), 3.2, col); } };
        let rx = 16, rw = half;
        U.txt(c, '快取不夠：要去遠方的記憶體拿', rx, by, { size: 16, w: 700, color: '#b3261e' });
        U.box(c, 'si', rx, by + 16, rw * 0.36, 62); U.txt(c, 'CPU', rx + rw * 0.18, by + 53, { align: 'center', size: 15, w: 700, color: '#17202b' });
        c.fillStyle = '#c9ced6'; c.fillRect(rx + rw * 0.64, by + 16, rw * 0.36, 62); U.txt(c, '記憶體（遠）', rx + rw * 0.82, by + 53, { align: 'center', size: 14, w: 700, color: '#17202b' });
        c.strokeStyle = '#b3261e'; c.lineWidth = 3; c.beginPath(); c.moveTo(rx + rw * 0.36, by + 47); c.lineTo(rx + rw * 0.64, by + 47); c.stroke();
        flowDot(rx + rw * 0.64, by + 47, rx + rw * 0.36, by + 47, 3, 0.25, '#b3261e');
        U.txt(c, '路長、慢 → 核心在空等（瓶頸）', rx + rw / 2, by + 104, { align: 'center', size: 15, color: '#b3261e' });
        rx = 34 + half;
        U.txt(c, '3D V-Cache：快取直接疊在上面（SoIC）', rx, by, { size: 16, w: 700, color: '#1f7a4d' });
        const bx = rx + rw * 0.1, bw = rw * 0.8;
        U.box(c, 'cu', bx + bw * 0.2, by + 16, bw * 0.6, 30); U.txt(c, '64 MB 快取', bx + bw / 2, by + 36, { align: 'center', size: 14, w: 700, color: '#fff' });
        U.box(c, 'si', bx, by + 52, bw, 40); U.txt(c, 'CPU（本身 32 MB 快取）', bx + bw / 2, by + 78, { align: 'center', size: 14, w: 700, color: '#17202b' });
        for (let q = 0; q < 14; q++) { const x = bx + bw * 0.22 + q * bw * 0.56 / 13; c.fillStyle = '#c9793b'; c.fillRect(x - 1.5, by + 46, 3, 6); flowDot(x, by + 46, x, by + 54, 1, 1.5 + (q % 3) * 0.2, '#1f7a4d'); }
        U.txt(c, '上下只隔幾微米、頻寬約 2 TB/s', rx + rw / 2, by + 118, { align: 'center', size: 15, color: '#1f7a4d' });
      });
      U.onSeg(el, 'so-p', i => { k = i; an = U.reduced() ? 1 : 0; showN(i, false); });
      ctx.raf(dt => {
        an = Math.min(1, an + dt * 1.5);
        c.clearRect(0, 0, w, h);
        const x = PITCH[k], lw = w * 0.44;
        // 左：剖面
        const L = 20, R = lw - 10, W = R - L, mid = h * 0.5;
        U.box(c, 'si', L, mid + 24, W, h - mid - 60); U.txt(c, '下層晶片（例如運算晶片）', L + W / 2, h - 50, { align: 'center', size: 13, w: 600, color: '#17202b' });
        const gap = k === 0 ? 24 : 0;
        U.box(c, 'si', L + W * 0.15, 40, W * 0.7, mid - gap - 40); U.txt(c, '上層晶片（例如快取）', L + W / 2, 70, { align: 'center', size: 13, w: 600, color: '#17202b' });
        const sc = W / 220, nP = Math.min(60, Math.floor(W * 0.7 / (x.p * sc * 1.6)));
        for (let j = 0; j < nP; j++) {
          const px = L + W * 0.15 + (j + 0.5) * (W * 0.7 / nP);
          if (k === 0) { c.fillStyle = '#9aa1a9'; c.beginPath(); c.ellipse(px, mid + 12 - gap / 2 + 12, Math.min(9, W * 0.35 / nP), 12, 0, 0, 7); c.fill(); }
          else { const pw = Math.max(1.5, W * 0.7 / nP * 0.45); U.box(c, 'cu', px - pw / 2, mid - 10, pw, 34, { stroke: false }); }
        }
        if (k > 0) { c.fillStyle = 'rgba(241,227,168,.55)'; c.fillRect(L + W * 0.15, mid - 10, W * 0.7, 34); }
        U.tag(c, k === 0 ? '微凸塊：中間留縫、再填膠' : '銅墊直接接銅墊（混合鍵合）', L + W / 2, mid + 52 + (k === 0 ? 10 : 0), { align: 'center', size: 13, color: k === 0 ? '#6a7888' : '#b3541e' });
        // 右：上視接點
        const gx = lw + 30, gs = Math.min(w - gx - 20, h - 70), gy = 30, win = 200; // 200 µm 見方
        c.fillStyle = '#e8edf3'; c.fillRect(gx, gy, gs, gs); c.strokeStyle = '#9aa8b8'; c.strokeRect(gx, gy, gs, gs);
        const n = Math.floor(win / x.p), cell = gs / n, r = Math.max(0.8, cell * 0.28);
        const show = Math.ceil(an * n);
        c.fillStyle = x.c;
        for (let a = 0; a < show; a++) for (let b = 0; b < n; b++) { c.beginPath(); c.arc(gx + (b + 0.5) * cell, gy + (a + 0.5) * cell, r, 0, 7); c.fill(); }
        U.txt(c, `間距 ${x.p} µm：這一小格裡有 ${(n * n).toLocaleString()} 個接點`, gx + gs / 2, gy + gs + 26, { align: 'center', size: 15, w: 700, color: '#17202b' });
      });
    }
  });
})();
