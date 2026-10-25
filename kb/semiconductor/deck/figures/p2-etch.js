/* 第二部分 ② 蝕刻：挖掉不要的 */
(function () {
  const F = { chap: 2, eyebrow: '第二部分 · ② 蝕刻' };

  /* 共用：畫帶光阻的待蝕刻材料 */
  function scene(c, w, h, o) {
    const top = o.top || h * 0.34, L = 30, R = w - 30, cx = w / 2, W = o.W || 90;
    U.box(c, 'si', L, top, R - L, h - top - 40);
    U.box(c, 'pr', L, top - 28, cx - W / 2 - L, 28); U.box(c, 'pr', cx + W / 2, top - 28, R - cx - W / 2, 28);
    return { top, L, R, cx, W };
  }

  /* 1. 蝕刻總覽（原 26、27 頁合併）：① 濕式 vs 乾式 ② 乾式裡面：離子＋化學 ③ 牆為什麼直＋選擇比 */
  const E1TX = [
    ['① 濕式 vs 乾式', '濕式泡藥水，四面八方都溶，會吃到光阻底下；乾式用電漿，離子由上往下打，挖得出直牆。'],
    ['② 乾式裡面：離子＋化學', '離子負責「敲」：方向直但很慢；化學負責「溶」：會往各方向溶，單獨用也不快。兩者一起：離子敲鬆、活性分子馬上帶走，又快又直。'],
    ['③ 什麼是選擇比？', '同一種氣體，吃不同材料的速度差很多。吃矽很快、吃氧化矽很慢，挖到底下的氧化矽就幾乎停住，不會挖過頭。快慢的比值就叫選擇比。']
  ];
  Fig.add('etch1', Object.assign({ body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('e1-t', E1TX.map(x => x[0]), 0)}</div>${U.figHTML('e1-cv', '剖面：粉紅是光阻（保護層），藍灰是要挖的材料', '')}
        <div class="controls" id="e1-c0">${U.range('e1-a', '挖的方向', 0, 100, 1, 0, '')}</div>
        <div class="controls" id="e1-c1" hidden>${U.seg('e2-m', ['只有離子', '只有化學氣體', '兩者一起'], 0)}<button class="btn" id="e2-re" type="button">⟲ 再挖一次</button></div>
        <div class="controls" id="e1-c2" hidden><button class="btn" id="e3x-re" type="button">⟲ 重新挖</button></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="e1-h"></h4><p id="e1-p" style="font-size:17.5px;margin:0"></p></div>`,
        meters: [['e1-m', '往旁邊吃進去'], ['e2-s', '挖的速度'], ['e2-d', '牆壁垂直']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#e1-cv'));
      let tab = 0, a = 0, t0 = 0, m = 0, T = 0, g3 = 0;
      const meterRow = id => U.$(el, '#' + id).closest('.meter');
      const ft = U.$(el, '#e1-cv').closest('.fig').querySelector('.fig-title span');
      U.onSeg(el, 'e1-t', i => {
        tab = i; t0 = 0; T = 0; g3 = 0;
        U.$(el, '#e1-h').textContent = E1TX[i][0]; U.$(el, '#e1-p').textContent = E1TX[i][1];
        [0, 1, 2].forEach(k => U.$(el, '#e1-c' + k).hidden = k !== i);
        meterRow('e1-m').style.display = i === 0 ? '' : 'none';
        meterRow('e2-s').style.display = meterRow('e2-d').style.display = i === 1 ? '' : 'none';
        if (ft) ft.textContent = ['剖面：粉紅是光阻（保護層），藍灰是要挖的材料', '電漿蝕刻機內部（示意）：同樣挖 4 秒，比比看挖多深', '左：挖到底下的氧化矽就停住　右：同一種氣體對不同材料的蝕刻速度'][i];
      });
      U.bind(el, 'e1-a', v => { a = v / 100; t0 = 0; }, v => v < 20 ? '濕式：四面八方' : v > 80 ? '乾式：垂直往下' : '介於中間');
      U.onSeg(el, 'e2-m', i => { m = i; T = 0; });
      U.$(el, '#e2-re').onclick = () => { T = 0; };
      U.$(el, '#e3x-re').onclick = () => { g3 = 0; };
      const parts = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28 }));
      const ions = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random() }));
      const rad = Array.from({ length: 34 }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28 }));
      // ① 濕式 vs 乾式
      function wetDry(dt, t) {
        t0 = Math.min(1, t0 + dt * 0.35);
        const g = scene(c, w, h, {});
        const d = (h - g.top - 70) * t0, u = d * (1 - a) * 0.95;
        c.fillStyle = '#fbfcfd'; c.beginPath();
        c.moveTo(g.cx - g.W / 2, g.top);
        c.bezierCurveTo(g.cx - g.W / 2 - u, g.top, g.cx - g.W / 2 - u, g.top + d, g.cx - g.W / 2 + (1 - a) * 10, g.top + d);
        c.lineTo(g.cx + g.W / 2 - (1 - a) * 10, g.top + d);
        c.bezierCurveTo(g.cx + g.W / 2 + u, g.top + d, g.cx + g.W / 2 + u, g.top, g.cx + g.W / 2, g.top);
        c.closePath(); c.fill(); c.strokeStyle = '#7f97b0'; c.lineWidth = 1.5; c.stroke();
        U.box(c, 'pr', g.L, g.top - 28, g.cx - g.W / 2 - g.L, 28); U.box(c, 'pr', g.cx + g.W / 2, g.top - 28, g.R - g.cx - g.W / 2, 28);
        parts.forEach((p, i) => {
          if (a < 0.5) {
            const x = g.cx + Math.cos(p.a + t * (1 + i % 3)) * (g.W / 2 + u * 0.6) * p.x;
            const y = g.top - 50 + Math.sin(p.a * 2 + t * 1.3) * 40 + p.y * (d * 0.9 + 60);
            U.dot(c, x, y, 3.2, `rgba(31,122,77,${0.8 - a})`);
          }
          if (a > 0.3) {
            const x = g.cx - g.W / 2 + 6 + p.x * (g.W - 12), y = 20 + ((t * 300 + p.y * 400) % (g.top + d - 10));
            U.arrow(c, x, y - 12, x, y, `rgba(179,84,30,${a})`, 1.5);
          }
        });
        U.tag(c, a < 0.5 ? '綠點：藥水分子，往各方向溶解' : '橘色箭頭：離子，垂直往下打', 36, 30, { size: 15 });
        if (u > 12) { U.arrow(c, g.cx - g.W / 2 - 4, g.top + 18, g.cx - g.W / 2 - u * 0.75, g.top + 18, '#b3261e', 2); U.tag(c, '吃到光阻下面了！', g.cx - g.W / 2 - u * 0.75 + 4, g.top + 44, { size: 14, color: '#b3261e' }); }
        U.setMeter(el, 'e1-m', 1 - a, a < .3 ? '很多' : a < .7 ? '一些' : '幾乎沒有', a < .3 ? 'bad' : a < .7 ? 'warn' : 'good');
      }
      // ② 電漿：離子＋化學
      function plasma(dt, t) {
        const rate = [0.08, 0.1, 0.35][m], vert = [0.95, 0.15, 1][m];
        T = Math.min(4, T + dt); const depth = T / 4 * rate / 0.35, run = T < 4;
        c.fillStyle = '#eef2f6'; U.rrect(c, 20, 10, w - 40, h - 20, 8); c.fill();
        c.fillStyle = '#9aa8b8'; c.fillRect(60, 24, w - 120, 12); U.tag(c, '上電極', 64, 56, { size: 13 });
        const glow = c.createLinearGradient(0, 40, 0, h * 0.5);
        glow.addColorStop(0, 'rgba(160,110,230,.35)'); glow.addColorStop(1, 'rgba(160,110,230,.05)');
        c.fillStyle = glow; c.fillRect(60, 40, w - 120, h * 0.45);
        U.tag(c, '電漿（會發紫光）', w / 2, 80, { align: 'center', size: 15, color: '#6b3fb0' });
        const top = h * 0.62, cx = w / 2, W = 70;
        c.fillStyle = '#9aa8b8'; c.fillRect(60, h - 50, w - 120, 14); U.tag(c, '下電極（放晶圓）', 64, h - 20, { size: 13 });
        U.box(c, 'si', 90, top, w - 180, h - 60 - top);
        const D = (h - 70 - top) * depth, u = D * (1 - vert);
        c.fillStyle = '#eef2f6'; c.beginPath(); c.moveTo(cx - W / 2, top); c.quadraticCurveTo(cx - W / 2 - u, top + D * .5, cx - W / 2 + 4, top + D); c.lineTo(cx + W / 2 - 4, top + D); c.quadraticCurveTo(cx + W / 2 + u, top + D * .5, cx + W / 2, top); c.fill();
        U.box(c, 'pr', 90, top - 18, cx - W / 2 - 90, 18); U.box(c, 'pr', cx + W / 2, top - 18, w - 90 - cx - W / 2, 18);
        if (m !== 1 && run) ions.forEach(p => { const x = 90 + p.x * (w - 180), y = 50 + ((t * 260 + p.y * 500) % (top - 60)); U.arrow(c, x, y - 12, x, y, '#b3541e', 1.8); });
        if (m !== 0 && run) rad.forEach(p => { const x = 90 + ((p.x * (w - 180) + Math.cos(p.a + t) * 30) % (w - 180)), y = 60 + ((p.y * (top - 70) + Math.sin(p.a * 3 + t * 2) * 20)); U.dot(c, x, y, 3.5, '#1f7a4d'); });
        if (!run) U.tag(c, '4 秒到：' + ['只挖了一點點', '挖得淺，而且往旁邊溶歪', '挖到底，牆壁又直'][m], w / 2, 120, { align: 'center', size: 17, color: m === 2 ? '#1f7a4d' : '#b3261e' });
        U.tag(c, m === 0 ? '橘：離子（垂直，但只靠敲很慢）' : m === 1 ? '綠：活性分子（會往各方向溶）' : '離子敲鬆＋活性分子帶走：快又直', w / 2, top - 30, { align: 'center', size: 15 });
        U.setMeter(el, 'e2-s', rate / 0.35, ['慢', '慢', '快'][m], m === 2 ? 'good' : 'warn');
        U.setMeter(el, 'e2-d', vert, vert > .8 ? '直' : '歪', vert > .8 ? 'good' : 'bad');
      }
      // ③ 側壁保護＋選擇比
      function wallSel(dt, t) {
        g3 = Math.min(1, g3 + dt * 0.4);
        const L = 30, R = w * 0.58, cx = (L + R) / 2, W = 70, top = h * 0.24, stop = h * 0.74, bot = h - 30;
        U.box(c, 'si', L, top, R - L, stop - top); U.box(c, 'ox', L, stop, R - L, bot - stop);
        U.box(c, 'nit', L, top - 22, cx - W / 2 - L, 22); U.box(c, 'nit', cx + W / 2, top - 22, R - cx - W / 2, 22);
        const reach = stop - top, d = Math.min(reach + 6, (reach + 6) * Math.min(1, g3 * 1.15));
        c.fillStyle = '#fbfcfd'; c.fillRect(cx - W / 2, top, W, d);
        for (let k = 0; k < 7; k++) { const x = cx - W / 2 + 12 + k * (W - 24) / 6, y = 20 + ((t * 240 + k * 37) % (top + d - 30)); U.arrow(c, x, y - 12, x, y, '#b3541e', 1.6); }
        U.tag(c, d < reach ? '矽：吃得很快' : '挖到底了', R + 10, top + 40, { size: 15, color: '#b3541e' });
        U.txt(c, '要挖的矽', L + 8, top + 26, { size: 14, w: 700, color: '#17202b' });
        U.txt(c, '底下的氧化矽', L + 8, stop + 26, { size: 14, w: 700, color: '#17202b' });
        if (d >= reach) U.tag(c, '碰到氧化矽：吃得很慢 → 自動停住', cx, stop + 56, { align: 'center', size: 15, color: '#1f7a4d' });
        // 右：蝕刻速度長條
        const bx = w * 0.64, bw = w - bx - 30, by = h * 0.5;
        U.txt(c, '同一種氣體，對不同材料的蝕刻速度（示意）', bx, by - 24, { size: 14, w: 700, color: '#17202b' });
        [['矽', 1, '#7f97b0'], ['氧化矽', 0.05, '#e3c86a'], ['氮化矽（遮罩）', 0.1, '#5fae7b']].forEach(([n, v, col], k) => {
          const y = by + k * 46; U.txt(c, n, bx, y + 18, { size: 14, color: '#3e4b5b' });
          c.fillStyle = '#e8edf3'; c.fillRect(bx + 110, y, bw - 110, 26); c.fillStyle = col; c.fillRect(bx + 110, y, (bw - 110) * v, 26);
        });
        U.tag(c, '選擇比（矽：氧化矽）：幾十到上百倍', bx, by + 160, { size: 16, color: '#b3541e' }); U.txt(c, '長條為示意比例', bx, by + 186, { size: 13, color: '#6a7888' });
      }
      ctx.raf((dt, t) => { c.clearRect(0, 0, w, h); [wetDry, plasma, wallSel][tab](dt, t); });
    }
  }, F));

  /* 3. 高深寬比：① 問題 ② 解法（側壁保護＋脈衝） */
  Fig.add('etch3', Object.assign({ body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('e3-t', ['① 問題：越深越難挖', '② 解法：側壁保護＋脈衝'], 0)}<span id="e3-pw" hidden>${U.seg('e3-p', ['連續電漿', '脈衝（一開一關）'], 1)}</span></div>${U.figHTML('e3-cv', '深洞剖面', '')}
        <div class="controls">${U.range('e3-r', '洞的深度（深寬比：深度是寬度的幾倍）', 2, 20, 1, 2, '')}</div></div>
      ${U.pageSide({
        meters: [['e3-m', '到洞底離子'], ['e3-b', '牆壁變形']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#e3-cv'));
      let r = 2, tab = 0, pulse = 1;
      U.bind(el, 'e3-r', v => r = v, v => v + ' 倍');
      U.onSeg(el, 'e3-t', i => { tab = i; U.$(el, '#e3-pw').hidden = i !== 1; });
      U.onSeg(el, 'e3-p', i => pulse = i);
      const ions = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), a: U.rand(-.12, .12) }));
      const bits = Array.from({ length: 14 }, () => ({ y: Math.random(), x: Math.random() }));
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const top = 60, bottom = h - 30, cx = w / 2;
        const full = bottom - top - 20, W = full / 20, depth = W * r;
        const fix = tab === 1, on = !fix || !pulse || Math.sin(t * 3) > 0; // 脈衝：電漿一開一關
        U.box(c, 'si', 40, top, w - 80, bottom - top);
        const bow = fix ? 0 : U.clamp((r - 9) / 11, 0, 1) * W * 0.6;
        c.fillStyle = '#fbfcfd'; c.beginPath();
        c.moveTo(cx - W / 2, top); c.quadraticCurveTo(cx - W / 2 - bow * 2, top + depth * 0.3, cx - W / 2 + W * 0.15, top + depth);
        c.lineTo(cx + W / 2 - W * 0.15, top + depth); c.quadraticCurveTo(cx + W / 2 + bow * 2, top + depth * 0.3, cx + W / 2, top); c.fill();
        if (fix) { // 側壁保護膜：牆上留著，底部被離子打掉
          c.strokeStyle = '#2f9a63'; c.lineWidth = 4;
          c.beginPath(); c.moveTo(cx - W / 2 + 2, top); c.lineTo(cx - W / 2 + W * 0.15 + 2, top + depth - 4); c.stroke();
          c.beginPath(); c.moveTo(cx + W / 2 - 2, top); c.lineTo(cx + W / 2 - W * 0.15 - 2, top + depth - 4); c.stroke();
        }
        U.box(c, 'nit', 40, top - 20, cx - W / 2 - 40, 20); U.box(c, 'nit', cx + W / 2, top - 20, w - 40 - cx - W / 2, 20);
        let reach = 0;
        if (on) ions.forEach(p => {
          const y0 = 10 + ((t * 220 + p.y * 400) % (depth + top));
          const x = cx + (p.x - .5) * W * 0.9 + p.a * (y0 - top);
          const hitWall = y0 > top && Math.abs(x - cx) > W / 2;
          if (hitWall) { U.dot(c, Math.max(cx - W / 2, Math.min(cx + W / 2, x)), y0, 3, 'rgba(179,38,30,.7)'); return; }
          U.arrow(c, x - p.a * 10, y0 - 10, x, y0, '#b3541e', 1.5);
        });
        ions.forEach(p => { if (Math.abs(p.a * depth) < W / 2) reach++; });
        const out = fix && pulse ? 3 : 1; // 脈衝關掉的空檔，碎屑爬得出去
        bits.forEach(b => { const y = top + depth - ((t * 30 * (on ? 1 : out * 2) / Math.sqrt(r) + b.y) % 1) * depth; U.dot(c, cx + (b.x - .5) * W * .5, y, 2.5, '#6a7888'); });
        if (!fix) {
          U.tag(c, '灰點：挖下來的碎屑，要一路爬出去', 50, 30, { size: 14 });
          if (bow > 3) U.tag(c, '牆壁被刮得鼓起來', cx + W / 2 + bow * 2 + 10, top + depth * 0.3, { size: 14, color: '#b3261e' });
        } else {
          U.tag(c, '綠：牆上的保護膜（底部被離子打掉，牆上留著）', 50, 30, { size: 14, color: '#1f7a4d' });
          if (pulse) U.tag(c, on ? '電漿開：往下挖' : '電漿關：碎屑趁空檔爬出去', cx + W / 2 + 16, top + 40, { size: 15, color: on ? '#b3541e' : '#3e4b5b' });
        }
        const f = Math.min(1, reach / ions.length + (fix && pulse ? 0.2 : 0));
        U.setMeter(el, 'e3-m', f, f > .8 ? '多' : f > .4 ? '少' : f > .2 ? '較少' : '很少', f > .8 ? 'good' : f > .4 ? 'warn' : 'bad');
        U.setMeter(el, 'e3-b', bow / (W * .5 + .01), bow > 3 ? '明顯' : '無', bow > 3 ? 'bad' : 'good');
      });
    }
  }, F));

  /* 4. ALE */
  function ale(c, w, h, i, p, t) {
    const cols = 18, rows = 6, sz = Math.min((w - 80) / cols, (h - 140) / (rows + 2)), x0 = (w - cols * sz) / 2, y0 = 90;
    const removed = i >= 3 ? 1 : 0;
    const done = i === 4 ? 1 : 0;
    for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
      let y = y0 + r * sz, a = 1, col = '#7f97b0';
      if (r === 0) {
        if (i >= 1) col = U.lerp(0, 1, i === 1 ? p : 1) > .5 ? '#5fae7b' : col;
        if (i === 3) { y -= p * 120; a = 1 - p; }
        if (i >= 4) continue;
      }
      c.globalAlpha = a; U.dot(c, x0 + k * sz + sz / 2, y + sz / 2, sz * 0.42, col); c.globalAlpha = 1;
    }
    if (i === 1) for (let k = 0; k < 20; k++) U.dot(c, x0 + ((k * 53 + t * 80) % (cols * sz)), y0 - 30 - (k % 3) * 12 + (1 - p) * -30, 5, '#5fae7b');
    if (i === 2 || i === 4) for (let k = 0; k < 10; k++) { const x = x0 + cols * sz + 20 + ((t * 200 + k * 30) % 120); U.arrow(c, x - 20, y0 - 20, x, y0 - 20, '#9aa8b8', 2); }
    if (i === 3) for (let k = 0; k < 12; k++) { const x = x0 + (k + .5) * cols * sz / 12, y = 10 + ((t * 250 + k * 17) % 70); U.arrow(c, x, y - 10, x, y, '#b3541e', 1.5); }
    const txt = ['表面是一層層整齊的原子', '通入氣體：只和「最上面一層」反應（變綠）', '把多餘的氣體清掉', '用很溫和的離子，只把綠色那層剝掉', '少了一薄層（圖上畫成一層原子），重複 N 輪就挖 N 層'][i];
    U.txt(c, txt, w / 2, h - 30, { align: 'center', size: 19, w: 700, color: '#17202b' });
    U.tag(c, `已移除 ${i >= 4 || (i === 3 && p > .9) ? 1 : 0} 層`, 30, 34, { size: 15, color: '#1f4fb5' });
  }
  Fig.add('etch4', Object.assign({ body: true,
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('e4-cv', '表面原子（剖面放大）', '')}${U.stepperHTML('e4-st')}</div>
      ${U.pageSide({
        top: `<div class="card newcard"><h4>新技術：解決什麼問題？</h4><p>傳統蝕刻靠「控制時間」停下來：多挖 1 nm 就傷到底下的材料；寬的洞和窄的洞挖的速度也不一樣，深淺不均；離子還會把表面打壞。</p><h4>用在哪裡？</h4><p>7 奈米世代起導入，環繞式時代更關鍵：修整閘極、間隔層這些只有幾奈米厚的薄層，又不能傷到只有 5 nm 厚的奈米片。</p></div>`
      })}</div>`,
    init(el, ctx) {
      const ED = ['表面是一層層排好的原子。', '通入氣體，只讓最上面一層原子起變化（綠色），下面不受影響。', '把多餘的氣體吹走，只留下變了的那一層。', '用很輕的離子把變了的那一層剝掉，力道小到下面那層剝不動。', '再吹一次氣把剝下來的東西清掉，少了固定的一薄層。想挖多深，就重複幾輪。'];
      const steps = ['起點', '改質', '清洗', '剝除', '再清洗（完成一輪）'].map((t, i) => ({ t, d: ED[i], draw: (c, w, h, p, tt) => ale(c, w, h, i, p, tt) }));
      U.animSteps(el, ctx, { canvas: 'e4-cv', stepper: 'e4-st', steps });
    }
  }, F));
})();
