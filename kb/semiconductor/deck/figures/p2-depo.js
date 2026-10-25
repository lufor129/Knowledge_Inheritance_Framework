/* 第二部分 ③ 薄膜沉積：鋪上新材料 */
(function () {
  const F = { chap: 3, eyebrow: '第二部分 · ③ 薄膜沉積' };

  /* 1. PVD / CVD / ALD 在溝槽裡的覆蓋 */
  const METH = [
    { n: 'PVD 物理氣相沉積', s: '噴漆', top: 1, side: 0.18, bot: 0.45, over: 1, d: '把金屬靶材打成原子，像噴漆一樣由上往下飛。' },
    { n: 'CVD 化學氣相沉積', s: '起霧', top: 1, side: 0.65, bot: 0.75, over: 0.25, d: '通入氣體，在表面起化學反應長成薄膜，像霧氣凝結。' },
    { n: 'ALD 原子層沉積', s: '一層層刷', top: 1, side: 1, bot: 1, over: 0, d: '一輪只長固定的一薄層（約 0.1 nm），任何角落都一樣厚。' }
  ];
  Fig.add('depo1', Object.assign({ body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('d1-m', METH.map(m => m.n), 0)}</div>${U.figHTML('d1-cv', '溝槽剖面：黃色是鋪上去的薄膜', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="d1-s"></h4><p id="d1-d" style="font-size:20px;margin:0"></p></div>`,
        meters: [['d1-m1', '側壁覆蓋'], ['d1-m2', '速度']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#d1-cv'));
      let mi = 0, g = 0;
      U.onSeg(el, 'd1-m', i => { mi = i; g = 0; const m = METH[i]; U.$(el, '#d1-s').textContent = `${m.n}　比喻：${m.s}`; U.$(el, '#d1-d').textContent = m.d; U.setMeter(el, 'd1-m1', m.side, m.side > .9 ? '完美' : m.side > .5 ? '尚可' : '很薄', m.side > .9 ? 'good' : m.side > .5 ? 'warn' : 'bad'); U.setMeter(el, 'd1-m2', [0.9, 0.6, 0.15][i], ['快', '中', '慢'][i], i === 2 ? 'warn' : 'good'); });
      const pts = Array.from({ length: 50 }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 6.28 }));
      ctx.raf((dt, t) => {
        g = Math.min(1, g + dt * 0.3);
        const m = METH[mi];
        c.clearRect(0, 0, w, h);
        const top = h * 0.3, bot = h - 40, cx = w / 2, W = 110, L = 40, R = w - 40;
        U.box(c, 'si', L, top, cx - W / 2 - L, bot - top); U.box(c, 'si', cx + W / 2, top, R - cx - W / 2, bot - top);
        U.box(c, 'si', cx - W / 2, bot - 60, W, 60);
        const T = 26 * g;
        c.fillStyle = U.MAT.ox;
        c.fillRect(L, top - T * m.top, cx - W / 2 - L, T * m.top); c.fillRect(cx + W / 2, top - T * m.top, R - cx - W / 2, T * m.top);
        // 側壁：上厚下薄（PVD）
        const sT = T * m.side;
        c.beginPath(); c.moveTo(cx - W / 2, top); c.lineTo(cx - W / 2 + sT + T * m.over * 0.9, top); c.lineTo(cx - W / 2 + sT * (m.over ? 0.3 : 1), bot - 60); c.lineTo(cx - W / 2, bot - 60); c.fill();
        c.beginPath(); c.moveTo(cx + W / 2, top); c.lineTo(cx + W / 2 - sT - T * m.over * 0.9, top); c.lineTo(cx + W / 2 - sT * (m.over ? 0.3 : 1), bot - 60); c.lineTo(cx + W / 2, bot - 60); c.fill();
        c.fillRect(cx - W / 2, bot - 60 - T * m.bot, W, T * m.bot);
        if (m.over > .5) { c.beginPath(); c.ellipse(cx - W / 2 + 6, top - T * .4, T * 1.2, T * .7, 0, 0, 7); c.ellipse(cx + W / 2 - 6, top - T * .4, T * 1.2, T * .7, 0, 0, 7); c.fill(); if (g > .7) U.tag(c, '開口快被堵住 → 裡面會留下空洞', cx, top - 50, { align: 'center', size: 15, color: '#b3261e' }); }
        if (g < 1) pts.forEach((p, i) => {
          if (mi === 0) { const x = cx - W * 2 + p.x * W * 4, y = 20 + ((t * 260 + p.y * 300) % (top - 20)); U.arrow(c, x, y - 10, x, y, '#6a7888', 1.5); }
          else if (mi === 1) U.dot(c, cx - W * 1.8 + ((p.x * W * 3.6 + Math.cos(p.a + t) * 20)), 30 + p.y * (bot - 90) * (p.x > .3 && p.x < .7 ? 1 : 0.25) + Math.sin(p.a + t * 2) * 8, 3, 'rgba(31,122,77,.55)');
          else if (i < 24) { const k = i / 24; const ph = (t * 0.5) % 1; U.dot(c, cx - W / 2 + 6 + k * (W - 12), top + 10 + ph * (bot - top - 80), 3, 'rgba(201,150,40,.85)'); }
        });
      });
    }
  }, F));

  /* 2. ALD 循環 */
  function ald(c, w, h, i, p, t, layers) {
    const n = 16, sz = (w - 100) / n, x0 = 50, base = h * 0.66;
    c.fillStyle = U.MAT.si; c.fillRect(x0, base, n * sz, h - base - 50);
    for (let L = 0; L < layers; L++) for (let k = 0; k < n; k++) U.dot(c, x0 + k * sz + sz / 2, base - L * sz * 0.7 - sz * 0.35, sz * 0.3, L % 2 ? '#9d80d6' : '#b8a2e6');
    const yTop = base - layers * sz * 0.7;
    if (i === 1 || i === 2 || i === 3) for (let k = 0; k < n; k++) { const y = i === 1 ? U.lerp(40, yTop - sz * 0.35, U.clamp(p * 1.3 - k * 0.02, 0, 1)) : yTop - sz * 0.35; U.dot(c, x0 + k * sz + sz / 2, y, sz * 0.3, '#e0a33a'); }
    if (i === 1) for (let k = 0; k < 8; k++) { const x = x0 + ((k * 97 + t * 90) % (n * sz)); U.dot(c, x, 50 + Math.abs(Math.sin(t * 3 + k)) * (yTop - 120), sz * 0.25, 'rgba(224,163,58,.5)'); }
    if (i === 3) for (let k = 0; k < n; k++) { const y = U.lerp(30, yTop - sz * 0.7, U.clamp(p * 1.3 - k * 0.02, 0, 1)); U.dot(c, x0 + k * sz + sz / 2, y, sz * 0.2, '#1f4fb5'); }
    if (i === 2 || i === 4) for (let k = 0; k < 6; k++) { const x = x0 + ((t * 300 + k * 90) % (n * sz)); U.arrow(c, x - 30, 60 + k * 14, x, 60 + k * 14, '#9aa8b8', 2); }
    const txt = ['起點：乾淨的表面', '通入氣體 A：每個位置只黏一顆，黏滿就停（多的會彈走）', '清洗：把多餘的 A 吹走', '通入氣體 B：和 A 反應，變成一整層薄膜', '清洗 → 完成一層！'][i];
    U.txt(c, txt, w / 2, h - 18, { align: 'center', size: 19, w: 700, color: '#17202b' });
    U.tag(c, `已長 ${layers} 層`, 30, 30, { size: 15, color: '#6b3fb0' });
  }
  Fig.add('depo2', Object.assign({ body: true,
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('d2-cv', '表面放大（剖面）', '')}${U.stepperHTML('d2-st')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el, ctx) {
      // 起點是乾淨的表面（0 層），跑完一輪第 5 步才變成 1 層
      const D = ['乾淨的表面，還沒有任何薄膜。', '氣體 A（前驅物，例如 TMA、四氯化鉿 HfCl₄）每個位置只黏一顆，黏滿就自動停止。', '把沒黏上的 A 吹走。', '氣體 B（例如水、臭氧、氨氣）和表面的 A 反應，變成一整層薄膜。', '再清洗一次：完成一輪（圖上畫成一整層）。重複幾輪，就長多厚。'];
      const steps = ['起點', '氣體 A', '清洗', '氣體 B', '清洗'].map((t, i) => ({ t, d: D[i], draw: (c, w, h, p, tt) => ald(c, w, h, i, p, tt, i === 4 && p > .3 ? 1 : 0) }));
      U.animSteps(el, ctx, { canvas: 'd2-cv', stepper: 'd2-st', steps });
    }
  }, F));

  /* 3. 磊晶 */
  Fig.add('depo3', Object.assign({ body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('d3-m', ['矽長在矽上', '矽鍺長在矽上', '磊晶用在哪兩處？'], 0)}<button class="btn" id="d3-re" type="button">⟲ 再長一次</button></div>${U.figHTML('d3-cv', '原子排列（剖面示意）', '')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#d3-cv'));
      let m = 0, g = 0;
      U.onSeg(el, 'd3-m', i => { m = i; g = 0; U.$(el, '#d3-re').style.visibility = i === 2 ? 'hidden' : ''; });
      // 分頁③：環繞式電晶體剖面，標出磊晶用的兩個地方
      function epiWhere(c, w, h, t) {
        const L = 40, R = w - 40, W = R - L, base = h - 60, N = 6, lh = 24, top = base - N * lh, gL = L + W * 0.36, gR = L + W * 0.64;
        U.box(c, 'si', L, base, W, 40);
        for (let k = 0; k < N; k++) U.box(c, k % 2 ? 'si' : 'sige', gL, base - (k + 1) * lh, gR - gL, lh);
        U.box(c, 'poly', gL, top - 40, gR - gL, 40); U.txt(c, '閘極（之後換成金屬）', (gL + gR) / 2, top - 16, { align: 'center', size: 13, w: 700, color: '#17202b' });
        [[L + 10, gL - 4], [gR + 4, R - 10]].forEach(([a, b]) => { c.fillStyle = U.MAT.n; c.beginPath(); c.moveTo(a, base); c.lineTo(a + 20, top - 10); c.lineTo(b - 20, top - 10); c.lineTo(b, base); c.closePath(); c.fill(); });
        const pulse = 0.5 + 0.5 * Math.sin(t * 3), on = (t % 6) < 3;
        c.lineWidth = 3.5; c.strokeStyle = `rgba(179,84,30,${on ? pulse : 0.25})`; c.strokeRect(gL - 3, top - 3, gR - gL + 6, N * lh + 6);
        c.strokeStyle = `rgba(31,79,181,${!on ? pulse : 0.25})`; c.strokeRect(L + 6, top - 14, gL - L - 6, base - top + 14); c.strokeRect(gR, top - 14, R - gR - 6, base - top + 14);
        U.tag(c, '① 奈米片疊層：矽／矽鍺交替長（第 ⑦ 章第 1 步）', (gL + gR) / 2, base + 28, { align: 'center', size: 14, color: '#b3541e' });
        U.tag(c, '② 源汲極：選擇性磊晶，邊長邊摻（下一頁）', w / 2, 26, { align: 'center', size: 14, color: '#1f4fb5' });
        U.txt(c, '源極', (L + gL) / 2, base - 20, { align: 'center', size: 14, w: 700, color: '#fff' }); U.txt(c, '汲極', (gR + R) / 2, base - 20, { align: 'center', size: 14, w: 700, color: '#fff' });
      }
      U.$(el, '#d3-re').onclick = () => { g = 0; };
      ctx.raf((dt, t) => {
        g = U.reduced() ? 1 : Math.min(1, g + dt * 0.45); // 長一次就停在結果，按「再長一次」重播
        c.clearRect(0, 0, w, h);
        if (m === 2) { epiWhere(c, w, h, t); return; }
        const cols = 14, a = (w - 100) / cols, rows0 = 4, x0 = 50, base = h - 60;
        for (let r = 0; r < rows0; r++) for (let k = 0; k < cols; k++) U.dot(c, x0 + k * a + a / 2, base - r * a * 0.8, a * 0.3, U.MAT.si);
        const newRows = 4, total = cols * newRows, placed = Math.floor(g * total);
        const big = m === 1, col = big ? U.MAT.sige : U.MAT.si, rad = a * (big ? 0.38 : 0.3);
        for (let q = 0; q < total; q++) {
          const r = Math.floor(q / cols), k = q % cols;
          const tx = x0 + k * a + a / 2, ty = base - (rows0 + r) * a * 0.8;
          if (q < placed) {
            U.dot(c, tx, ty, rad, col);
            if (big) { c.strokeStyle = 'rgba(20,30,45,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(tx, ty, rad, 0, 7); c.stroke(); }
          } else if (q === placed) { const f = (g * total) % 1; U.dot(c, tx, U.lerp(20, ty, f), rad, col); }
        }
        if (big && g >= 1) { // 左右往內壓的箭頭：原子大一號，被擠緊才能對齊底下的格子
          const y = base - (rows0 + 1.5) * a * 0.8;
          U.arrow(c, 8, y, x0 - 4, y, '#b3541e', 3); U.arrow(c, w - 8, y, x0 + cols * a + 4, y, '#b3541e', 3);
          U.tag(c, '被左右擠緊', w / 2, base - (rows0 + newRows) * a * 0.8 - 18, { align: 'center', size: 16, color: '#b3541e' });
        }
        U.tag(c, '原本的矽晶圓', x0, base + 38, { size: 15 });
        U.tag(c, big ? '矽鍺：原子大一號，得擠緊才對得齊' : '新長的矽：完美對齊，看不出界線', x0, 30, { size: 15, color: big ? '#1f7a4d' : '#3e4b5b' });
      });
    }
  }, F, { chap: 4, eyebrow: '第二部分 · ④ 摻雜與磊晶' }));

  /* 4. 薄膜在電晶體中的位置 */
  const FILMS = [
    { k: 'si', n: '矽奈米片（通道）', t: '約 5 nm', how: '磊晶', go: 'depo3', r: [0.22, 0.36, 0.56, 0.06] },
    { k: 'hk', n: '高介電絕緣層', t: '約 1.5 nm', how: 'ALD 原子層沉積', go: 'hk1', r: [0.37, 0.32, 0.26, 0.03] },
    { k: 'metal', n: '金屬閘極', t: '數 nm 多層', how: 'ALD（上方填充可用 CVD）', go: 'gaaflow', r: [0.4, 0.08, 0.2, 0.2] },
    { k: 'nit', n: '間隔層（氮化矽或低介電材料）', t: '約 5 nm', how: 'ALD / CVD', go: 'depo1', r: [0.34, 0.08, 0.05, 0.2] },
    { k: 'nit', n: '內間隔層（片與片之間）', t: '約 5 nm', how: 'ALD＋回蝕', go: 'gaaflow', inner: 1 },
    { k: 'n', n: '源極／汲極', t: '數十 nm', how: '磊晶（同時摻雜）', go: 'dope3', r: [0.03, 0.2, 0.18, 0.58] },
    { k: 'cu', n: '銅導線', t: '最細約 10–20 nm 寬', how: 'PVD＋電鍍', go: 'loop', r: [0.03, 0.02, 0.94, 0.05] },
    { k: 'ox', n: '絕緣填充', t: '數十 nm', how: 'CVD', go: 'depo1', r: [0.66, 0.08, 0.3, 0.1] }
  ];
  Fig.add('depo4', Object.assign({ body: true,
    hubShort: '薄膜全貌',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('d4-cv', '環繞式電晶體剖面（點選任一區域）', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4>你點的是</h4><div class="bigword" id="d4-n"></div><table class="t" style="font-size:19px;margin-top:6px"><tbody><tr><td>厚度</td><td id="d4-t"></td></tr><tr><td>怎麼鋪上去</td><td id="d4-h"></td></tr></tbody></table><button class="btn primary" type="button" id="d4-go" style="margin-top:8px">看它怎麼做 →</button></div>`,
        extra: `<div><div class="gloss" style="margin-bottom:4px">章節導覽（點擊跳頁，每頁標題旁都有「⌂ 全貌」按鈕可以跳回來）</div><div style="display:flex;flex-wrap:wrap;gap:6px">${[['depo1', '③ 三種鋪法'], ['depo2', 'ALD'], ['asd', '選擇性沉積'], ['dope1', '④ 摻雜'], ['depo3', '磊晶'], ['dope3', '選擇性磊晶'], ['hk1', '⑤ 閘極絕緣層']].map(([id, l]) => `<button class="btn" type="button" data-go="${id}" style="padding:4px 10px;font-size:15px">${l}</button>`).join('')}</div></div>
          <table class="t" style="font-size:17px" id="d4-list"><tbody>${FILMS.map((f, i) => `<tr class="clickable" data-i="${i}"><td><i style="display:inline-block;width:14px;height:14px;background:${U.MAT[f.k]};margin-right:8px;vertical-align:-2px"></i>${f.n}</td><td>${f.how}</td></tr>`).join('')}</tbody></table>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#d4-cv'));
      let sel = 0;
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      U.$(el, '#d4-go').onclick = () => Deck.goId(FILMS[sel].go);
      const pick = i => { sel = i; const f = FILMS[i]; U.$(el, '#d4-n').textContent = f.n; U.$(el, '#d4-t').textContent = f.t; U.$(el, '#d4-h').textContent = f.how; U.$$(el, '#d4-list tr').forEach((r, k) => r.classList.toggle('hl', k === i)); };
      pick(0);
      U.$$(el, '#d4-list tr').forEach(r => r.onclick = () => pick(+r.dataset.i));
      const IN = [[0.36, 0.48], [0.54, 0.66], [0.72, 0.82]]; // 內間隔層的上下範圍（奈米片之間、最下片和基板之間）
      const draw = t => {
        c.clearRect(0, 0, w, h);
        const R = (r) => [r[0] * w, r[1] * h, r[2] * w, r[3] * h];
        const base = h * 0.82;
        U.box(c, 'si', 20, base, w - 40, h - base - 10);
        U.box(c, 'ox', ...R([0.66, 0.08, 0.3, 0.1]));
        U.box(c, 'ox', w * 0.03, h * 0.08, w * 0.3, h * 0.1);
        U.box(c, 'n', ...R([0.03, 0.2, 0.3, 0.62])); U.box(c, 'n', w * 0.67, h * 0.2, w * 0.3, h * 0.62);
        U.box(c, 'metal', w * 0.36, h * 0.08, w * 0.28, h * 0.74);
        U.box(c, 'nit', w * 0.33, h * 0.08, w * 0.03, h * 0.74); U.box(c, 'nit', w * 0.64, h * 0.08, w * 0.03, h * 0.74);
        IN.forEach(([y0, y1]) => { U.box(c, 'nit', w * 0.29, h * y0, w * 0.07, h * (y1 - y0)); U.box(c, 'nit', w * 0.64, h * y0, w * 0.07, h * (y1 - y0)); }); // 內間隔層：片與片之間，把金屬閘極和源汲極隔開
        [0.3, 0.48, 0.66].forEach(y => { U.box(c, 'hk', w * 0.35, h * y - 8, w * 0.3, h * 0.06 + 16); U.box(c, 'si', w * 0.21, h * y, w * 0.58, h * 0.06); });
        U.box(c, 'cu', ...R([0.03, 0.01, 0.94, 0.05]));
        const f = FILMS[sel];
        const pulse = 0.5 + 0.5 * Math.sin(t * 5);
        c.strokeStyle = `rgba(179,84,30,${0.5 + pulse * 0.5})`; c.lineWidth = 4;
        if (f.k === 'hk') [0.3, 0.48, 0.66].forEach(y => c.strokeRect(w * 0.35, h * y - 8, w * 0.3, h * 0.06 + 16));
        else if (f.k === 'si') [0.3, 0.48, 0.66].forEach(y => c.strokeRect(w * 0.21, h * y, w * 0.58, h * 0.06));
        else if (f.inner) IN.forEach(([y0, y1]) => { c.strokeRect(w * 0.29, h * y0, w * 0.07, h * (y1 - y0)); c.strokeRect(w * 0.64, h * y0, w * 0.07, h * (y1 - y0)); });
        else if (f.k === 'n') { c.strokeRect(w * 0.03, h * 0.2, w * 0.3, h * 0.62); c.strokeRect(w * 0.67, h * 0.2, w * 0.3, h * 0.62); }
        else if (f.k === 'nit') { c.strokeRect(w * 0.33, h * 0.08, w * 0.03, h * 0.74); c.strokeRect(w * 0.64, h * 0.08, w * 0.03, h * 0.74); }
        else if (f.k === 'metal') c.strokeRect(w * 0.36, h * 0.08, w * 0.28, h * 0.74);
        else if (f.k === 'cu') c.strokeRect(w * 0.03, h * 0.01, w * 0.94, h * 0.05);
        else c.strokeRect(w * 0.66, h * 0.08, w * 0.3, h * 0.1);
      };
      ctx.raf((dt, t) => draw(t));
      U.$(el, '#d4-cv').addEventListener('click', e => {
        const r = e.target.getBoundingClientRect(), sc = Deck.scale || 1;
        const x = (e.clientX - r.left) / sc / w, y = (e.clientY - r.top) / sc / h;
        const hits = [
          [1, [0.35, 0.28, 0.3, 0.44], y => [0.3, 0.48, 0.66].some(v => Math.abs(y - v - 0.03) < 0.05) ],
          [0, [0.21, 0.28, 0.58, 0.46], y => [0.3, 0.48, 0.66].some(v => y >= v && y <= v + 0.06)],
          [6, [0.03, 0.01, 0.94, 0.05]], ...IN.flatMap(([y0, y1]) => [[4, [0.29, y0, 0.07, y1 - y0]], [4, [0.64, y0, 0.07, y1 - y0]]]), [5, [0.03, 0.2, 0.3, 0.62]], [5, [0.67, 0.2, 0.3, 0.62]],
          [3, [0.33, 0.08, 0.03, 0.74]], [3, [0.64, 0.08, 0.03, 0.74]], [7, [0.66, 0.08, 0.3, 0.1]], [2, [0.36, 0.08, 0.28, 0.74]]
        ];
        for (const [i, b, fn] of hits) if (x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3] && (!fn || fn(y))) { pick(i); break; }
      });
    }
  }, F));
})();
