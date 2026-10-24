/* 第二部分 ⑩：從設計到量產（五頁）
   ① d2m 一顆晶片的旅程（分頁：旅程／下線之後：圖檔變光罩／光罩也要檢測／共乘下線 MPW）
   ② pdk PDK 與設計規則、DTCO　③ npi 新製程四階段（TV、可靠度）　④ a14case 用 A14 製程走一次（示意案例）　⑤ yield 良率學習
   頁序：接在第九章 wat4 之後、第二部分小結之前（index.html） */
(function () {
  const A = Deck.add.bind(Deck);
  const F = { part: 2, chap: 10, eyebrow: '第二部分 · ⑩ 從設計到量產' };
  const go = el => U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
  // canvas 自動換行：英數字詞不拆開；標點不放行首
  function wrapLines(c, s, maxW, o) {
    c.save(); c.font = `${o.w || 500} ${o.size}px "PingFang TC","Noto Sans TC",sans-serif`;
    const NS = /^[、，；：）)」。]/, lines = []; let cur = []; // 不放行首的標點：放不下時連前一個詞一起換行
    const W = a => c.measureText(a.join('')).width;
    for (const tk of s.match(/（?[A-Za-z0-9.\-\/()×≈]+）?|\s|./g)) {
      if (W(cur.concat(tk)) <= maxW || !cur.join('').trim()) { cur.push(tk); continue; }
      if (NS.test(tk) && cur.length > 1) { const back = cur.pop(); lines.push(cur.join('').trim()); cur = [back, tk]; }
      else { lines.push(cur.join('').trim()); cur = tk.trim() ? [tk] : []; }
    }
    if (cur.join('').trim()) lines.push(cur.join('').trim()); c.restore(); return lines;
  }
  function wrapTxt(c, s, x, y, maxW, o) {
    const lines = wrapLines(c, s, maxW, o);
    lines.forEach((ln, k) => U.txt(c, ln, x, y + (k - (lines.length - 1) / 2) * (o.size + 4), o));
  }

  /* ---------- ① 一顆晶片的旅程（分頁：旅程／下線之後／光罩檢測／MPW） ---------- */
  const TRIP = [
    { n: '設計', who: 'IC 設計公司（晶圓廠的客戶）', time: '1–3 年', what: '寫電路、模擬，畫出每一層的圖形（佈局）。', cost: .05, cv: '改圖就好' },
    { n: '驗證', who: '設計公司，用晶圓廠給的 PDK', time: '數週到數月', what: '設計規則檢查：線寬、間距有沒有違規；畫出來的圖和電路對不對得上。', cost: .1, cv: '回去改圖，還算便宜', go: ['pdk', 'PDK 與設計規則'] },
    { n: '下線', who: '設計公司 → 晶圓廠', time: '一天', what: '設計定案，把最終佈局存成 GDS 檔交給晶圓廠。英文 tape-out，來自早年把圖檔存在磁帶上寄出。', cost: .3, cv: '設計有錯：改圖、重新下線，光罩可能已經開始做', go: ['#1', '下線之後：圖檔變光罩'] },
    { n: '光罩', who: '晶圓廠的光罩廠', time: '數週', what: 'OPC 修圖、電子束寫光罩、檢查修補；一層圖案一片，一組數十片。', cost: .55, cv: '光罩做壞：重做那一片；設計有錯：受影響的光罩都要重做', go: ['litho6', 'OPC（第一章）'] },
    { n: '晶圓製造', who: '晶圓廠', time: '約 3 個月', what: '上千道步驟，就是前九章的所有技術；每一步都有量測和檢測把關。', cost: .8, cv: '設計有錯：改圖、重做光罩，再等 3 個月', go: ['eyes', '檢測量測（第九章）'] },
    { n: 'WAT、CP', who: '晶圓廠、測試廠', time: '數天', what: '先量走道上的測試結構（WAT），再一顆顆測功能（CP），壞的做記號。', cost: .88, cv: '整批可能報廢，改圖重來', go: ['wat', 'WAT 與 CP'] },
    { n: '封裝、FT', who: '封裝測試廠（先進封裝也在晶圓廠）', time: '數週', what: '切開、封裝成晶片，再做成品測試（FT）。', cost: .94, cv: '晶圓和封裝都白做' },
    { n: '量產出貨', who: '設計公司 → 系統廠（手機、伺服器）', time: '數年', what: '良率夠高、交期穩，才算量產成功。良率怎麼爬上去，是這一章最後一頁。', cost: 1, cv: '回收、賠償、信譽', go: ['yield', '良率學習'] }
  ];
  const WHO = [[0, 2, '設計公司', '#1f4fb5'], [3, 5, '晶圓廠', '#b3541e'], [6, 7, '封測、客戶', '#1f7a4d']];
  function trip(c, w, h, i, p, t) {
    // 兩排：上排左→右（0–3），下排右→左（4–7）
    const bw = (w - 80) / 4, bh = 74, y0 = 70, y1 = y0 + bh + 110;
    const pos = k => k < 4 ? [40 + k * bw + bw / 2, y0 + bh / 2] : [40 + (7 - k) * bw + bw / 2, y1 + bh / 2];
    // 路
    c.strokeStyle = '#d5dce5'; c.lineWidth = 14; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); TRIP.forEach((_, k) => { const [x, y] = pos(k); k ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    // 走過的路
    c.strokeStyle = '#9fb5e3'; c.beginPath();
    for (let k = 0; k <= i; k++) { const [x, y] = pos(k); if (!k) { c.moveTo(x, y); continue; } if (k < i) { c.lineTo(x, y); continue; } const [px, py] = pos(k - 1); c.lineTo(U.lerp(px, x, p), U.lerp(py, y, p)); }
    c.stroke(); c.lineCap = 'butt';
    // 誰負責（色條）
    WHO.forEach(([a, b, n, col]) => {
      for (let k = a; k <= b; k++) { const [x, y] = pos(k); c.fillStyle = col; c.globalAlpha = .18; c.fillRect(x - bw / 2 + 6, y + bh / 2 + 6, bw - 12, 6); c.globalAlpha = 1; }
      const [xa, ya] = pos(a), [xb, yb] = pos(b);
      U.txt(c, n, ya === yb ? (xa + xb) / 2 : xa, ya + bh / 2 + 32, { align: 'center', size: 15, w: 700, color: col });
    });
    // 站
    TRIP.forEach((s, k) => {
      const [x, y] = pos(k), on = k === i, done = k < i;
      c.fillStyle = on ? '#1f4fb5' : done ? '#eef3fc' : '#fff'; U.rrect(c, x - bw / 2 + 10, y - bh / 2, bw - 20, bh, 10); c.fill();
      c.strokeStyle = on ? '#1f4fb5' : '#c3ccd6'; c.lineWidth = on ? 2.5 : 1.2; c.stroke();
      U.txt(c, `${k + 1}. ${s.n}`, x, y - 4, { align: 'center', size: 19, w: 700, color: on ? '#fff' : '#17202b' });
      U.txt(c, s.time, x, y + 22, { align: 'center', size: 14, color: on ? '#dbe6fb' : '#5b6878' });
      if (done) U.txt(c, '✓', x + bw / 2 - 26, y - bh / 2 + 20, { size: 16, w: 700, color: '#1f7a4d' });
    });
    // 下線這一站特別標出：之後改就要重做光罩
    const [tx] = pos(2);
    c.setLineDash([6, 5]); c.strokeStyle = '#b3261e'; c.lineWidth = 2; c.beginPath(); c.moveTo(tx + bw / 2, 34); c.lineTo(tx + bw / 2, h - 30); c.stroke(); c.setLineDash([]);
    U.tag(c, '← 下線前：改圖就好　｜　下線後：改一次就要重做光罩 →', tx + bw / 2, 26, { align: 'center', size: 15, color: '#b3261e' });
    // 一片晶圓在路上走
    const k0 = Math.max(0, i - 1), [ax, ay] = pos(k0), [bx, by] = pos(i), f = i ? p : 1;
    const mx = U.lerp(ax, bx, f), my = U.lerp(ay, by, f) - bh / 2 - 14;
    if (i >= 4) { c.fillStyle = '#c9d3df'; c.beginPath(); c.arc(mx, my, 11, 0, 7); c.fill(); c.strokeStyle = '#5b6878'; c.lineWidth = 1.2; c.stroke(); }
    else { c.fillStyle = '#fff'; c.fillRect(mx - 9, my - 11, 18, 22); c.strokeStyle = '#5b6878'; c.lineWidth = 1.2; c.strokeRect(mx - 9, my - 11, 18, 22); for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(mx - 5, my - 5 + q * 5); c.lineTo(mx + 5, my - 5 + q * 5); c.stroke(); } }
    U.txt(c, '晶圓廠裡：一片晶圓走上千步，約 3 個月', w / 2, h - 12, { align: 'center', size: 14, color: '#3e4b5b' });
  }

  // 下線之後：五站
  const MSTEP = ['GDS 圖檔', 'OPC 修圖', '電子束寫光罩', '檢測、修補', '送進晶圓廠'];
  const D5 = ['設計者交出的 GDS 檔：電腦裡每一層的框線，晶圓廠從這裡接手。', 'OPC 修圖：線頭加錘頭、轉角加小方塊，補償光的繞射。', '電子束先在光阻上寫圖，再顯影、蝕刻出圖形；一片要寫好幾個小時。', '和圖檔逐點比對（die-to-database），多一點、少一點都要抓出來修掉。', 'EUV 反射、DUV 穿透，縮小 4 倍（High-NA 一個方向 8 倍）印到晶圓上。'];
  function maskSteps(c, w, h, k, T) {
    // 上：五站，亮目前這一站；下：同一組圖形在這一站變成什麼樣子
    const n = MSTEP.length, bw = (w - 40) / n, y = 16, bh = 40, p = Math.min(1, T / 2.4), e = U.ease(p);
    MSTEP.forEach((s2, j) => {
      const x = 20 + j * bw, on = j === k, done = j < k;
      c.fillStyle = on ? '#1f4fb5' : done ? '#eef3fc' : '#fff'; U.rrect(c, x + 4, y, bw - 22, bh, 8); c.fill(); c.strokeStyle = on ? '#1f4fb5' : '#c3ccd6'; c.lineWidth = 1.2; c.stroke();
      U.txt(c, `${j + 1}. ${s2}`, x + 4 + (bw - 22) / 2, y + bh / 2 + 5, { align: 'center', size: 14, w: 700, color: on ? '#fff' : '#17202b' });
      if (j < n - 1) U.arrow(c, x + bw - 16, y + bh / 2, x + bw + 2, y + bh / 2, '#9aa8b8', 1.8);
    });
    // 圖形（版面座標 0–1）：兩條直線、一個 L 形、一個接觸孔
    const SH = [[.1, .12, .08, .76], [.28, .12, .08, .76], [.5, .12, .08, .62], [.5, .66, .34, .08], [.74, .22, .1, .1]];
    const ax = 40, ay = y + bh + 46, aw = Math.min(w * 0.46, (h - ay - 30) / .75), ah = aw * 0.75;
    const X = v => ax + v * aw, Y = v => ay + v * ah;
    const rx = ax + aw + 36, note = (lines, col) => { let yy = ay + 14; lines.forEach((t2, q) => { const o = { size: q ? 15 : 18, w: q ? 500 : 700, color: q ? '#3e4b5b' : (col || '#17202b') }; wrapLines(c, t2, w - rx - 14, o).forEach(ln => { U.txt(c, ln, rx, yy, o); yy += o.size + 7; }); yy += 8; }); };
    const plate = () => { c.fillStyle = '#e6eef7'; c.fillRect(ax - 14, ay - 14, aw + 28, ah + 28); c.strokeStyle = '#7a8a9c'; c.lineWidth = 2; c.strokeRect(ax - 14, ay - 14, aw + 28, ah + 28); };
    const opc = (f) => { // 線頭加「錘頭」、轉角加小方塊
      c.fillStyle = '#2b2f36';
      SH.forEach(([x, y2, ww, hh]) => c.fillRect(X(x), Y(y2), ww * aw, hh * ah));
      const d = .025 * f;
      [[.1, .12, .08], [.28, .12, .08], [.5, .12, .08]].forEach(([x, y2, ww]) => c.fillRect(X(x - d), Y(y2 - d), (ww + 2 * d) * aw, d * 3 * ah));
      [[.1, .88, .08], [.28, .88, .08]].forEach(([x, y2, ww]) => c.fillRect(X(x - d), Y(y2 - d * 2), (ww + 2 * d) * aw, d * 3 * ah));
      c.fillRect(X(.84 - d * .2), Y(.66 - d), d * 2 * aw, (d * 2 + .08) * ah);
      c.fillRect(X(.74 - d), Y(.22 - d), (.1 + 2 * d) * aw, (.1 + 2 * d) * ah);
    };
    U.txt(c, '↓ 同一組圖形，在這一站變成什麼樣子', ax - 14, ay - 24, { size: 13.5, color: '#5b6878' });
    if (k === 0) {
      c.fillStyle = '#1b2533'; c.fillRect(ax - 14, ay - 14, aw + 28, ah + 28);
      c.fillStyle = 'rgba(255,255,255,.12)'; for (let gx = 0; gx <= 20; gx++) for (let gy = 0; gy <= 15; gy++) c.fillRect(X(gx / 20) - 1, Y(gy / 15) - 1, 2, 2);
      c.strokeStyle = '#7fb2ff'; c.lineWidth = 2;
      SH.forEach(([x, y2, ww, hh], q) => { if (q / SH.length < e * 1.2) c.strokeRect(X(x), Y(y2), ww * aw, hh * ah); });
      U.txt(c, 'chip.gds · layer M1', ax - 4, ay + ah + 8, { size: 13, color: '#7fb2ff' });
      note(['設計者交出的 GDS 檔', 'GDS＝佈局的標準檔案格式（較新的叫 OASIS）', '只是電腦裡的「框線」：每一層的圖形', '一顆晶片幾十層、上百億個圖形，檔案動輒數百 GB']);
    } else if (k === 1) {
      c.fillStyle = '#fff'; c.fillRect(ax - 14, ay - 14, aw + 28, ah + 28); c.strokeStyle = '#c3ccd6'; c.strokeRect(ax - 14, ay - 14, aw + 28, ah + 28);
      opc(e);
      c.setLineDash([5, 4]); c.strokeStyle = '#e8590c'; c.lineWidth = 2; SH.forEach(([x, y2, ww, hh]) => c.strokeRect(X(x), Y(y2), ww * aw, hh * ah)); c.setLineDash([]);
      if (p > .6) { U.tag(c, '錘頭', X(.14), Y(.06), { align: 'center', size: 13, color: '#b3541e' }); U.tag(c, '小方塊', X(.89), Y(.6), { align: 'center', size: 13, color: '#b3541e' }); }
      note(['OPC：故意畫歪', '虛線＝想要的形狀；黑色＝修過的圖', '線頭加「錘頭」、轉角加小方塊', '補償光的繞射，印出來才會是正的（第一章）'], '#b3541e');
    } else if (k === 2) {
      plate();
      // 電子束一列一列往下寫：寫過的地方出現圖形（實際是先曝光阻，再顯影、蝕刻）
      const sy = Y(-.05) + (ah * 1.1) * e;
      c.save(); c.beginPath(); c.rect(ax - 14, ay - 14, aw + 28, sy - ay + 14); c.clip(); opc(1); c.restore();
      if (p < 1) { const bx = ax + ((T * 900) % aw); const g = c.createRadialGradient(bx, sy, 0, bx, sy, 16); g.addColorStop(0, 'rgba(80,140,255,.95)'); g.addColorStop(1, 'rgba(80,140,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(bx, sy, 16, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,140,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx, ay - 40); c.lineTo(bx, sy); c.stroke(); }
      note(['電子束寫光罩', '電子束先在光阻上寫圖，再顯影、蝕刻出圖形；一片寫好幾個小時', 'EUV 光罩：低熱膨脹玻璃＋鉬／矽多層膜（鏡面）＋吸收層', 'DUV 光罩：石英板鍍鉻，光從透明處穿過', '圖案比晶圓上大 4 倍']);
    } else if (k === 3) {
      plate(); opc(1);
      // 多出一點圖形（缺陷）→ 掃描找到 → 修掉
      const dfx = X(.43), dfy = Y(.45), found = p > .45, fixed = p > .8;
      if (!fixed) { c.fillStyle = '#2b2f36'; c.beginPath(); c.arc(dfx, dfy, 9, 0, 7); c.fill(); }
      const scan = ax + aw * Math.min(1, p / .45); if (!found) { c.strokeStyle = 'rgba(31,122,77,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(scan, ay - 14); c.lineTo(scan, ay + ah + 14); c.stroke(); }
      if (found) { c.strokeStyle = fixed ? '#1f7a4d' : '#e03131'; c.lineWidth = 2.5; c.beginPath(); c.arc(dfx, dfy, 20, 0, 7); c.stroke(); U.tag(c, fixed ? '✓ 修好了' : '多出一點圖形！', dfx, dfy - 28, { align: 'center', size: 14, color: fixed ? '#1f7a4d' : '#b3261e' }); }
      note(['檢測、修補', '綠線掃過整片，和圖檔逐點比對（die-to-database）', '多一點、少一點都要抓出來，再用電子束修掉', '進了晶圓廠還要定期重驗（下一個分頁）'], '#1f7a4d');
    } else {
      // EUV：光從斜下方打上光罩、反射後縮小印到晶圓（DUV 則是穿過光罩）
      const mw2 = aw * .5, mh2 = mw2 * .75, mx2 = ax + (aw - mw2) / 2, my2 = ay - 6, cx2 = mx2 + mw2 / 2, mb = my2 + mh2 + 8;
      c.save(); c.translate(mx2, my2); c.scale(.5, .5); c.translate(-ax, -ay); plate(); opc(1); c.restore();
      c.fillStyle = '#7a8a9c'; for (let q = 0; q < 4; q++) c.fillRect(mx2 - 7, mb + 2 + q * 3, mw2 + 14, 1.5);
      const wy = mb + 120, wr = aw * .32, f = (T * .7) % 1;
      c.strokeStyle = 'rgba(124,92,214,.55)'; c.lineWidth = 9; c.beginPath(); c.moveTo(ax - 6, wy - 40); c.lineTo(cx2, mb + 14); c.stroke();
      U.dot(c, U.lerp(ax - 6, cx2, f), U.lerp(wy - 40, mb + 14, f), 4, '#7c5cd6');
      c.fillStyle = 'rgba(124,92,214,.18)'; c.beginPath(); c.moveTo(cx2 - mw2 * .35, mb + 14); c.lineTo(cx2 + mw2 * .35, mb + 14); c.lineTo(cx2 + 22, wy - 4); c.lineTo(cx2 - 22, wy - 4); c.closePath(); c.fill();
      c.fillStyle = '#c9d3df'; c.beginPath(); c.ellipse(cx2, wy + 10, wr, 16, 0, 0, 7); c.fill(); c.strokeStyle = '#7a8a9c'; c.lineWidth = 1.5; c.stroke();
      for (let q = -3; q <= 3; q++) { const a2 = U.clamp(e * 8 - (q + 3), 0, 1); c.globalAlpha = a2; c.fillStyle = '#2b2f36'; c.fillRect(cx2 + q * 26 - 8, wy + 4, 16, 10); c.globalAlpha = 1; }
      U.tag(c, 'EUV 光打上來', ax - 4, wy - 52, { size: 13.5, color: '#7c5cd6' });
      U.tag(c, '反射、縮小 4 倍', cx2 + 30, (mb + wy) / 2 + 8, { size: 13.5, color: '#7c5cd6' });
      note(['送進晶圓廠', 'EUV 光罩像鏡子：光打上去「反射」，經鏡子縮小', 'DUV 光罩：光「穿過」透明處，經透鏡縮小', '縮小 4 倍（High-NA 一個方向 8 倍）', '一格一格印滿整片晶圓'], '#1f4fb5');
    }
  }
  // 光罩也要檢測：左＝光罩一格＋缺陷；右＝晶圓上每一個曝光區都有；左下＝一格一顆大晶片的盲點。回傳 true＝播完一輪
  function maskInsp(c, w, h, T) {
    const mx = 30, my = 40, ms = Math.min(190, (h - 250) / 1.27);
    c.fillStyle = '#e6eef7'; c.fillRect(mx, my, ms, ms * 1.27); c.strokeStyle = '#7a8a9c'; c.lineWidth = 2; c.strokeRect(mx, my, ms, ms * 1.27);
    c.fillStyle = '#2b2f36'; for (let q = 0; q < 6; q++) c.fillRect(mx + 20 + q * (ms - 40) / 6, my + 20, (ms - 40) / 12, ms * 1.27 - 40);
    const dx = mx + ms * 0.62, dy = my + ms * 0.5;
    U.dot(c, dx, dy, 6, '#e03131'); c.strokeStyle = '#e03131'; c.lineWidth = 2; c.beginPath(); c.arc(dx, dy, 14, 0, 7); c.stroke();
    U.tag(c, '光罩上一個缺陷', mx + ms / 2, my + ms * 1.27 + 24, { align: 'center', size: 14, color: '#b3261e' });
    // 盲點：一格只放一顆大晶片
    const by = my + ms * 1.27 + 50, bw = ms + 50, bh2 = Math.min(160, h - by - 10);
    c.fillStyle = '#fdf0ef'; U.rrect(c, mx - 10, by, bw, bh2, 8); c.fill(); c.strokeStyle = '#e8b4ae'; c.lineWidth = 1; c.stroke();
    U.txt(c, '盲點：一格只放一顆大晶片', mx, by + 22, { size: 14.5, w: 700, color: '#b3261e' });
    const dw = 46, dh = 56;
    [0, 1].forEach(q => { const x = mx + 8 + q * (dw + 30); c.fillStyle = '#e9edf2'; c.fillRect(x, by + 34, dw, dh); c.strokeStyle = '#7a8a9c'; c.strokeRect(x, by + 34, dw, dh); U.dot(c, x + dw * .62, by + 34 + dh * .5, 3.5, '#e03131'); });
    U.txt(c, '＝', mx + 8 + dw + 15, by + 34 + dh / 2 + 6, { align: 'center', size: 16, w: 700, color: '#17202b' });
    U.txt(c, '兩顆比一比', mx + 2 * dw + 52, by + 56, { size: 13.5, color: '#3e4b5b' });
    U.txt(c, '一模一樣', mx + 2 * dw + 52, by + 76, { size: 13.5, color: '#3e4b5b' });
    wrapLines(c, '晶粒對晶粒比對抓不到 → 光罩要和圖檔比對、進廠後定期重驗', bw - 20, { size: 13.5, w: 700 }).forEach((ln, q) => U.txt(c, ln, mx, by + dh + 58 + q * 19, { size: 13.5, w: 700, color: '#17202b' }));
    // 右：晶圓
    const R = Math.min((h - 70) / 2, (w - mx - bw - 90) / 2), cx = mx + bw + 40 + R, cy = 28 + R, fw = R * 0.34, fh = fw * 1.27;
    c.fillStyle = '#e9edf2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill(); c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.stroke();
    const cells = [];
    for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) { const x = cx + a * fw - fw / 2, y = cy + b * fh - fh / 2; if ([[x, y], [x + fw, y], [x, y + fh], [x + fw, y + fh]].every(([p, q]) => Math.hypot(p - cx, q - cy) < R)) cells.push([x, y]); }
    const shown = Math.min(cells.length, Math.floor(T * 6));
    cells.forEach(([x, y], k) => { c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.strokeRect(x, y, fw, fh); if (k < shown) { c.fillStyle = 'rgba(159,181,227,.35)'; c.fillRect(x, y, fw, fh); U.dot(c, x + fw * 0.62, y + fh * 0.5, 3.5, '#e03131'); } });
    if (shown >= cells.length) {
      U.tag(c, '每一格同一個位置都有 → 重複缺陷，懷疑光罩', cx, cy + R + 24, { align: 'center', size: 14.5, color: '#b3261e' });
      return T > cells.length / 6 + 4;
    }
    U.tag(c, '曝光機一格一格印下去…', cx, cy + R + 24, { align: 'center', size: 14.5 });
    return false;
  }
  // 共乘下線：一個曝光區（26 × 33 mm）拼好幾家
  function mpw(c, w, h, T) {
    const fh = h - 70, fw = fh * 26 / 33, x0 = 40, y0 = 34;
    c.strokeStyle = '#17202b'; c.lineWidth = 2; c.strokeRect(x0, y0, fw, fh);
    const blocks = [[0, 0, .5, .4, 'A 公司', '#9fb5e3'], [.5, 0, .5, .25, 'B 學校', '#b9d8c4'], [.5, .25, .5, .35, 'C 公司', '#f2c46b'], [0, .4, .3, .3, 'D', '#e8b4c8'], [.3, .4, .2, .3, 'E', '#a993db'], [0, .7, .5, .3, 'F 公司', '#f4c7a1'], [.5, .6, .5, .4, 'G 新創', '#a9d6e5']];
    blocks.forEach(([a, b, ww, hh, n, col], k) => { const al = U.clamp(T * 2 - k * 0.4, 0, 1); c.globalAlpha = al; c.fillStyle = col; c.fillRect(x0 + a * fw + 3, y0 + b * fh + 3, ww * fw - 6, hh * fh - 6); U.txt(c, n, x0 + (a + ww / 2) * fw, y0 + (b + hh / 2) * fh + 6, { align: 'center', size: 15, w: 700, color: '#17202b' }); c.globalAlpha = 1; });
    U.txt(c, '26 mm', x0 + fw / 2, y0 + fh + 22, { align: 'center', size: 13, color: '#5b6878' });
    const rx = x0 + fw + 50;
    U.txt(c, '一組光罩的錢，七家一起分', rx, 70, { size: 22, w: 700, color: '#17202b' });
    ['做完切開，各拿各的晶片（每家幾十顆）', '用途：試新設計、學校研究、驗證新製程', '晶圓廠固定時間開「班車」，到站就出發', '產品要量產時，再自己做一整組光罩'].forEach((s, k) => U.txt(c, '• ' + s, rx, 116 + k * 34, { size: 16, color: '#3e4b5b' }));
    U.txt(c, '像共乘：一個人包車太貴，大家拼一台', rx, 116 + 4 * 34 + 20, { size: 15, w: 700, color: '#1f7a4d' });
  }
  // 四個分頁：側欄標題、說明、跳頁、一句話數字、比喻
  const DTAB = [
    { ft: '八站：上排左到右，下排右到左', fact: ['約 3 個月', '先進製程一片晶圓從投片到做完，大約要走這麼久；第一批常走急件（hot lot）插隊，會快一些'], an: '像蓋房子：設計圖改幾次都便宜，開工後要改就得拆了重蓋。' },
    { ft: '下線之後的五站', h: '下線之後：圖檔變光罩', p: '下線（tape-out）＝設計定案、交出佈局檔 GDS，晶圓廠從這裡接手。GDS 先經 OPC 修圖，再用電子束寫成光罩，檢查、修補後才送進晶圓廠。一層圖案一片，一組數十片。', go: ['litho6', '↩ 回看 OPC（第一章）'], fact: ['數十片', '先進製程一組光罩的片數：每一層圖案一片，EUV 層和 DUV 層都要'], an: '像印刷廠的版：版刻好才能開印，版上的字要先校對過。' },
    { ft: '左：光罩上有一個缺陷　右：印到晶圓上', h: '光罩也要檢測', p: '光罩上一個缺陷，會印到每一個曝光區、每一片晶圓。晶圓檢測發現「每一格同一個位置都有」，就要懷疑光罩。盲點：一格只放一顆大晶片時，晶粒對晶粒比對看不出來；所以光罩出廠前要和圖檔比對，進廠後還要定期重驗。', go: ['insp', '晶圓缺陷檢測（第九章）'], fact: ['每一片', '光罩上一個缺陷，每一片晶圓、每一個曝光區都會印到'], an: '像印刷廠的版：版上有一個污點，印出來的每一本書同一頁都有。' },
    { ft: '一個曝光區（26 × 33 mm），分給好幾家（示意）', h: '共乘下線（MPW）', p: '一組光罩很貴。多家公司、學校把各自的小晶片拼在同一組光罩上，一起下線、分攤成本，常用來試新設計或驗證新製程。台積電的服務叫 CyberShuttle。', fact: ['分攤', '一組光罩的費用由好幾家一起出，每家拿回自己的幾十顆晶片'], an: '像共乘：一個人包車太貴，大家拼一台，到站各自下車。' }
  ];
  A(Object.assign({
    id: 'd2m', minutes: 6.5, short: '⑩ 一顆晶片的旅程、下線與光罩',
    title: '從設計圖到出貨：一顆晶片的旅程', en: 'From Design to Volume Production',
    thesis: '往前看，晶片從<b>設計圖</b>開始；往後看，要<b>良率夠高</b>才算量產。分界是<b>下線</b>：圖檔做成<b>一組數十片光罩</b>，之後發現錯就要重做光罩、再等一輪。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('dm-m', ['一顆晶片的旅程', '下線之後：圖檔變光罩', '光罩也要檢測', '共乘下線（MPW）'], 0)}</div>${U.figHTML('dm-cv', '', '')}<div id="dm-sw0">${U.stepperHTML('dm-st')}</div><div id="dm-sw1" hidden>${U.stepperHTML('dm-st2')}</div></div>
      ${U.side({
        top: `<div class="card key"><h4 id="dm-h"></h4><p id="dm-who" style="font-size:17px;margin:2px 0"></p><p id="dm-what" style="font-size:17px"></p><p id="dm-cv2" style="font-size:17px;color:#b3261e"></p><div id="dm-go" style="margin-top:6px"></div></div>`,
        meters: [['dm-c', '修正代價']],
        fact: { v: '', d: '' },
        analogy: { icon: 'road', t: '比喻', p: '' }
      })}</div>`,
    init(el, ctx) {
      const cv = U.$(el, '#dm-cv'), ft = cv.closest('.fig').querySelector('.fig-title span');
      let G = U.canvas(cv), m = 0, i = 0, p = 1, K = 0, T = 0, tabs = null;
      // 分頁切換時下面的播放器會換掉、圖框高度會變：跟著重設 canvas，字才不會被拉扁
      const fit = () => { const r = cv.parentElement; if (Math.abs(r.clientWidth - G.w) > 2 || Math.abs(r.clientHeight - G.h) > 2) G = U.canvas(cv); };
      const btn = g => g ? (g[0][0] === '#' ? `<button class="btn" type="button" data-tab="${g[0].slice(1)}">${g[1]} →</button>` : `<button class="btn" type="button" data-go="${g[0]}">${g[1]}${g[1][0] === '↩' ? '' : ' →'}</button>`) : '';
      const setGo = g => { U.$(el, '#dm-go').innerHTML = btn(g); go(el); U.$$(el, '#dm-go [data-tab]').forEach(b => b.onclick = () => tabs && tabs.set(+b.dataset.tab)); };
      const station = k => {
        const s = TRIP[k];
        U.$(el, '#dm-h').textContent = `第 ${k + 1} 站 · ${s.n}`;
        U.$(el, '#dm-who').innerHTML = `<b>誰：</b>${s.who}　<b>多久：</b>${s.time}`;
        U.$(el, '#dm-what').textContent = s.what;
        U.$(el, '#dm-cv2').innerHTML = `<b>這時才發現錯：</b>${s.cv}`;
        setGo(s.go);
        U.setMeter(el, 'dm-c', s.cost, '', s.cost > .5 ? 'bad' : s.cost > .2 ? 'warn' : 'good');
      };
      U.stepper(el, 'dm-st', TRIP.map(s => ({ t: s.n, d: s.what })), k => { i = k; p = 0; if (m === 0) station(k); }, ctx, { interval: 3600 });
      U.stepper(el, 'dm-st2', MSTEP.map((t2, j) => ({ t: t2, d: D5[j] })), k => { K = k; T = 0; }, ctx, { interval: 3600 });
      tabs = U.onSeg(el, 'dm-m', j => {
        m = j; T = 0; const D = DTAB[j];
        U.$(el, '#dm-sw0').hidden = j !== 0; U.$(el, '#dm-sw1').hidden = j !== 1; U.$(el, '.meters').hidden = j !== 0;
        ft.textContent = D.ft; U.$(el, '.fact .v').textContent = D.fact[0]; U.$(el, '.fact .d').textContent = D.fact[1]; U.$(el, '.analogy p').textContent = D.an;
        if (j === 0) station(i);
        else { U.$(el, '#dm-h').textContent = D.h; U.$(el, '#dm-who').textContent = ''; U.$(el, '#dm-what').textContent = D.p; U.$(el, '#dm-cv2').textContent = ''; setGo(D.go); }
        fit();
      });
      ctx.raf((dt, t) => {
        fit(); const { c, w, h } = G;
        T += dt; p = Math.min(1, p + dt / 1.2); c.clearRect(0, 0, w, h);
        if (m === 0) trip(c, w, h, i, U.ease(p), t);
        else if (m === 1) maskSteps(c, w, h, K, T);
        else if (m === 2) { if (maskInsp(c, w, h, T)) T = 0; }
        else mpw(c, w, h, T);
      });
    },
    notes: `進入第十章：從設計到量產。前九章都在晶圓廠裡面，這一章把鏡頭拉遠，看一顆晶片從設計圖到出貨的整條路，也看一個新製程怎麼從實驗室走到量產。這一頁有四個分頁，先看第一個：一顆晶片的旅程。

畫面上有八站，上排從左到右，下排從右到左。第一站設計：客戶是 IC 設計公司，花一到三年寫電路、模擬、畫出每一層的圖形。第二站驗證：用晶圓廠給的 PDK 檢查畫出來的圖，下一頁會講。第三站下線，英文 tape-out，就是設計定案、把最終的佈局存成 GDS 檔交給晶圓廠；這個字來自早年把圖檔存在磁帶上寄出去。第四站光罩，等一下第二個分頁細看。第五站晶圓製造，上千道步驟、大約三個月，就是前九章所有的技術；第一批晶片常常走急件，英文 hot lot，在產線上插隊，會快一些。第六站 WAT 和 CP，第九章講過。第七站封裝和成品測試。第八站量產出貨，設計公司把晶片交給手機、伺服器這些系統廠。

右邊的量條是重點：在哪一站發現錯誤，修正的代價有多大。紅色虛線就是下線：下線之前，改圖就好；下線之後，改一次就要重做光罩、再等一輪三個月；出貨之後才發現，就是回收和賠償。注意兩種錯不一樣：光罩本身做壞了，晶圓廠重做那一片就好；設計本身有錯，就要改圖、重新下線，受影響的光罩全部重做。

第二個分頁，下線之後：圖檔變光罩，五站。第一站 GDS 檔，佈局的標準格式，較新的叫 OASIS，裡面只有每一層圖形的框線，一顆晶片動輒數百 GB。第二站 OPC，第一章講過，故意把圖畫歪，印出來才是正的。第三站電子束寫光罩：電子束先在光罩的光阻上一筆一筆寫，再顯影、蝕刻出圖形，一片要寫好幾個小時。光罩有兩種：一般的 DUV 層，用石英板鍍鉻，光從透明的地方穿過去；EUV 層的光罩是一面鏡子，低熱膨脹玻璃上鍍幾十層鉬和矽的多層膜，上面再做一層吸收層，光打上去被反射，這就是第一章說的「EUV 光罩是鏡子」。第四站檢測修補，和圖檔逐點比對。第五站送進晶圓廠，縮小四倍印上去；High-NA EUV 是一個方向縮八倍。一組先進製程的光罩要數十片。

第三個分頁，光罩也要檢測，這和第九章直接相關。光罩上只要有一個缺陷，曝光機一格一格印下去，每一個曝光區同一個位置都會有，而且每一片晶圓都有。晶圓檢測看到「每一格同一個位置都有」，叫重複缺陷，就要懷疑光罩。但看左下的盲點：如果一個曝光區只放一顆大晶片，像 AI 晶片，每一顆都在同一個位置壞，第九章的晶粒對晶粒比對，兩顆比起來一模一樣，就抓不到。所以光罩出光罩廠之前，要和設計圖檔逐點比對，英文 die-to-database；進了晶圓廠也不是一勞永逸，用久了會沾微粒、表面會慢慢長出霧狀結晶，英文 haze，EUV 光罩前面的保護膜 pellicle 也要顧，所以要定期拿下來重新檢驗。【可略】另外，一組新光罩進廠，通常先跑一片故意把焦距和曝光劑量排成棋盤的晶圓，叫 PWQ，找出最容易印壞的圖形；這份熱點清單再回給 OPC 和設計端修正。

第四個分頁，共乘下線，英文 MPW。一組先進製程的光罩非常貴，小公司或學校包不起，就把好幾家的小晶片拼在同一組光罩上，一起下線、分攤成本。晶圓廠固定時間開班車，到站就出發，台積電的這個服務叫 CyberShuttle。新製程剛開出來時，客戶也常用這種方式先驗證自己的電路區塊。`
  }, F));

  /* ---------- ② PDK 與設計規則、DTCO ---------- */
  const PDK = [
    ['設計規則', '最小線寬、間距；附 DRC／LVS 檢查檔', '來自：微影畫多細、蝕刻挖多直（第一、二章）'],
    ['元件模型', '電晶體的電流、電壓曲線，給電路模擬用', '來自：WAT 量測校正（第九章）、TCAD（第八章）'],
    ['寄生萃取', '導線的電阻、電容怎麼算', '來自：導線結構（第七章）＋量測（第九章）'],
    ['PCell', '填入尺寸，自動畫出電晶體、電阻', '來自：晶圓廠依規則做好']
  ];
  const PTX = [
    ['PDK 是什麼？', '晶圓廠給設計者的說明書加工具包（Process Design Kit）：設計規則（含 DRC／LVS 檢查檔）、元件模型、寄生萃取、PCell。標準元件庫、SRAM、I/O 叫「基礎 IP」，通常另外交付。規則和模型都來自製程與量測；PDK 越準，第一次下線就成功的機會越大。'],
    ['設計規則檢查（DRC）', '拖動滑桿：間距或線寬小於規則，DRC 會標紅；硬要做，印到晶圓上就會短路或斷線。原則上全部通過；非這樣畫不可的地方，要晶圓廠審查同意（waiver）。另外還有 LVS：圖和電路對不對得上；DFM 熱點檢查：規則都過、但容易印壞的圖形。數字是示意。'],
    ['DTCO：設計和製程一起改', '晶片要再縮小，有兩個旋鈕：金屬間距靠製程；軌道數由標準元件庫的架構決定，通常是晶圓廠和領頭客戶一起定（元件高度＝軌道數 × 間距）。各轉各的都有代價；坐下來一起談，才能縮最多又不吃虧。下面四個情境依序點。']
  ];
  // DTCO 四個情境：t＝軌道數、p＝金屬間距、back＝電源線搬到背面、crowd＝訊號線不夠用
  const DT = [
    { s: '起點', n: '起點', t: 6, p: 28, col: '#17202b', d: ['6 條軌道：上下 2 條電源、中間 4 條訊號', '目標：下一代面積要再小一截'] },
    { s: '只改製程', n: '只靠製程：線做更細', t: 6, p: 24, col: '#b3541e', d: ['製程把金屬間距從 28 縮到 24 nm', '代價：微影要更細，可能多重曝光，貴、良率風險高', '只縮到 86%'] },
    { s: '只改元件庫', n: '只改元件庫：少一條軌道', t: 5, p: 28, col: '#1f4fb5', d: ['元件庫少用一條軌道：6 → 5 條', '代價：訊號線只剩 3 條，複雜的元件接不出來、變慢', '縮到 83%，但線不夠用（紅色）'] },
    { s: '一起改', n: 'DTCO：一起改', t: 5, p: 24, back: true, col: '#1f7a4d', d: ['製程縮間距＋把電源線搬到背面（新製程）', '元件庫就能放心少一條軌道：5 條全部走訊號', '台積電從 A16 開始用背面供電；A14 第一版沒有', '縮到 71%，訊號線還比原本多'] }
  ];
  DT[2].crowd = true;
  A(Object.assign({
    id: 'pdk', minutes: 5, short: '⑩ PDK、設計規則、DTCO',
    title: '設計和製程的合約：PDK 與設計規則', en: 'PDK · Design Rules · DTCO',
    thesis: '晶圓廠把「做得到什麼」寫成<b>設計規則和模型</b>，打包成 <b>PDK</b> 交給設計者。設計者照規則畫，下線前用<b>設計規則檢查（DRC）</b>逐條驗；兩邊再一起最佳化，叫 <b>DTCO</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('pk-m', ['PDK 裡有什麼', '設計規則檢查', 'DTCO：一起改'], 0)}</div>
        ${U.figHTML('pk-cv', '', '')}
        <div class="controls" id="pk-c1" hidden>${U.range('pk-s', '線的間距', 8, 36, 1, 26, ' nm')}${U.range('pk-w', '線寬', 8, 36, 1, 24, ' nm')}</div>
        <div class="controls" id="pk-c2" hidden>${U.seg('pk-d', ['① 起點', '② 只改製程', '③ 只改元件庫（少一條軌道）', '④ 一起改（DTCO）'], 0)}</div></div>
      ${U.side({
        top: `<div class="card key"><h4 id="pk-h"></h4><p id="pk-tx" style="font-size:17px"></p></div>`,
        points: ['PDK：晶圓廠給設計者的說明書＋工具包', '規則和模型都來自製程能力與量測', '背面供電也是 DTCO：電源線搬到背面，省出軌道'],
        analogy: { icon: 'stairs', t: '比喻', p: '像建築法規：建商規定樑柱最少多粗、間距多寬；建築師照規定畫、送審（DRC）。特殊設計要另外申請核准（waiver）。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#pk-cv'));
      const ft = U.$(el, '#pk-cv').closest('.fig').querySelector('.fig-title span');
      let m = 0, S = 26, Wd = 24, D = 0, g = 0;
      U.onSeg(el, 'pk-m', i => { m = i; g = 0; U.$(el, '#pk-c1').hidden = i !== 1; U.$(el, '#pk-c2').hidden = i !== 2; U.$(el, '#pk-h').textContent = PTX[i][0]; U.$(el, '#pk-tx').textContent = PTX[i][1]; ft.textContent = ['晶圓廠 → PDK → 設計者', '上：設計圖（俯視）　下：印到晶圓上會怎樣', '一個標準元件（俯視）：高度＝軌道數 × 金屬間距'][i]; });
      U.bind(el, 'pk-s', v => { S = v; }, v => v + ' nm');
      U.bind(el, 'pk-w', v => { Wd = v; }, v => v + ' nm');
      U.onSeg(el, 'pk-d', i => { D = i; });
      const RULE = 20;
      ctx.raf((dt, t) => {
        g = Math.min(1, g + dt * 0.8);
        c.clearRect(0, 0, w, h);
        if (m === 0) {
          const L = 20, cw = (w - 40) / 3, rh = (h - 96) / 4;
          [['晶圓廠', '製程能力、量測資料', '#b3541e'], ['PDK', '打包成四樣東西', '#1f4fb5'], ['設計者', '照著用、照著畫', '#1f7a4d']].forEach(([n, d, col], k) => {
            U.txt(c, n, L + cw * k + cw / 2, 26, { align: 'center', size: 18, w: 700, color: col });
            U.txt(c, d, L + cw * k + cw / 2, 46, { align: 'center', size: 13.5, color: '#5b6878' });
          });
          PDK.forEach(([n, d, src], k) => {
            const y = 60 + k * rh, a = U.clamp(g * 4 - k * 0.6, 0, 1);
            c.globalAlpha = a;
            U.txt(c, src.replace('來自：', ''), L + cw - 24, y + rh / 2 + 5, { align: 'right', size: 13, color: '#3e4b5b' });
            c.fillStyle = '#eef3fc'; U.rrect(c, L + cw + 8, y + 6, cw - 16, rh - 12, 8); c.fill(); c.strokeStyle = '#9fb5e3'; c.lineWidth = 1.2; c.stroke();
            U.txt(c, n, L + cw * 1.5, y + rh / 2 - 6, { align: 'center', size: 18, w: 700, color: '#1f4fb5' });
            U.txt(c, d, L + cw * 1.5, y + rh / 2 + 18, { align: 'center', size: 13, color: '#3e4b5b' });
            const f = (t * 0.6 + k * 0.25) % 1;
            U.arrow(c, L + cw - 18, y + rh / 2, L + cw + 4, y + rh / 2, '#b3541e', 2);
            U.arrow(c, L + 2 * cw - 4, y + rh / 2, L + 2 * cw + 18, y + rh / 2, '#1f7a4d', 2);
            U.dot(c, U.lerp(L + 2 * cw - 4, L + 2 * cw + 18, f), y + rh / 2, 3, '#1f7a4d');
            U.txt(c, ['照規則畫圖、自動檢查', '模擬電路快不快、耗不耗電', '算訊號會延遲多少', '直接拿來擺，不用手畫'][k], L + cw * 2.5 + 8, y + rh / 2 + 5, { align: 'center', size: 14, color: '#1f7a4d' });
            c.globalAlpha = 1;
          });
          U.txt(c, '標準元件庫、SRAM、I/O：叫「基礎 IP」，通常和 PDK 分開交付', w / 2, h - 14, { align: 'center', size: 14, color: '#5b6878' });
        } else if (m === 1) {
          // 上：三條線（俯視）；下：印到晶圓上
          const sc = 3.2, cx = w / 2, n = 3, tot = n * Wd + (n - 1) * S, x0 = cx - tot * sc / 2, top = 50, len = h * 0.3;
          const sBad = S < RULE, wBad = Wd < RULE;
          U.txt(c, `設計規則（示意）：線寬 ≥ ${RULE} nm、間距 ≥ ${RULE} nm`, cx, 28, { align: 'center', size: 15, w: 700, color: '#17202b' });
          for (let k = 0; k < n; k++) { const x = x0 + k * (Wd + S) * sc; c.fillStyle = wBad ? '#f2b8b0' : '#9fb5e3'; c.fillRect(x, top, Wd * sc, len); c.strokeStyle = wBad ? '#b3261e' : '#1f4fb5'; c.lineWidth = 1.5; c.strokeRect(x, top, Wd * sc, len); }
          if (sBad) for (let k = 0; k < n - 1; k++) { const x = x0 + (k * (Wd + S) + Wd) * sc; c.fillStyle = 'rgba(179,38,30,.25)'; c.fillRect(x, top, S * sc, len); }
          const msg = [sBad ? `✗ 間距 ${S} nm < ${RULE}` : `✓ 間距 ${S} nm`, wBad ? `✗ 線寬 ${Wd} nm < ${RULE}` : `✓ 線寬 ${Wd} nm`];
          U.tag(c, msg[0], x0 - 14, top + len / 2 - 12, { align: 'right', size: 14, color: sBad ? '#b3261e' : '#1f7a4d' });
          U.tag(c, msg[1], x0 - 14, top + len / 2 + 14, { align: 'right', size: 14, color: wBad ? '#b3261e' : '#1f7a4d' });
          // 印到晶圓上：間距太小 → 連在一起（短路）；線寬太小 → 斷掉（斷路）
          const y2 = top + len + 60, len2 = h - y2 - 40;
          U.txt(c, '印到晶圓上', 30, y2 - 14, { size: 14, w: 700, color: '#5b6878' });
          for (let k = 0; k < n; k++) {
            const x = x0 + k * (Wd + S) * sc, wob = q => Math.sin(q * 0.11 + k * 2) * 3;
            c.fillStyle = '#b87333';
            const seg = (q0, q1) => { c.beginPath(); for (let q = q0; q <= q1; q += 4) c.lineTo(x + wob(q) * 0.6, y2 + q); for (let q = q1; q >= q0; q -= 4) c.lineTo(x + Wd * sc - wob(q + 40) * 0.6, y2 + q); c.closePath(); c.fill(); };
            if (wBad && k === 1) { seg(0, len2 * 0.45); seg(len2 * 0.56, len2); } else seg(0, len2);
            if (sBad && k < n - 1) { const bx = x + Wd * sc, by = y2 + len2 * (0.3 + k * 0.3); c.fillRect(bx - 2, by, S * sc + 4, 10); }
          }
          const res = sBad && wBad ? '短路＋斷路' : sBad ? '短路：相鄰的線連在一起' : wBad ? '斷路：線太細，印斷了' : '印得出來 ✓';
          U.tag(c, res, cx, h - 12, { align: 'center', size: 16, color: sBad || wBad ? '#b3261e' : '#1f7a4d' });
        } else {
          // DTCO：四個情境比一比。標準元件高度＝軌道數 × 金屬間距
          const S = DT[D], base = 6 * 28, H0 = h - 120, scl = H0 / (6 * 28), cellH = S.t * S.p * scl, cw = 170, x0 = 50, yb = h - 64;
          // 起點的外框（虛線）
          c.setLineDash([6, 4]); c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.strokeRect(x0 - 8, yb - base * scl, cw + 16, base * scl); c.setLineDash([]);
          U.txt(c, '虛線：起點的大小', x0 - 8, yb - base * scl - 8, { size: 13, color: '#5b6878' });
          c.fillStyle = '#f4f6f9'; c.fillRect(x0, yb - cellH, cw, cellH); c.strokeStyle = '#17202b'; c.lineWidth = 2; c.strokeRect(x0, yb - cellH, cw, cellH);
          for (let k = 0; k < S.t; k++) {
            const y = yb - cellH + (k + .5) * S.p * scl, pw = !S.back && (k === 0 || k === S.t - 1), crowd = S.crowd && !pw;
            c.fillStyle = pw ? '#c98a5a' : crowd ? '#f2b8b0' : '#9fb5e3'; c.fillRect(x0 + 6, y - S.p * scl * .25, cw - 12, S.p * scl * .5);
          }
          if (S.back) { c.fillStyle = '#c98a5a'; c.fillRect(x0 + 6, yb + 10, cw - 12, 10); U.txt(c, '電源線搬到背面', x0 + cw / 2, yb + 38, { align: 'center', size: 13, w: 700, color: '#b3541e' }); }
          else U.txt(c, `${S.t} 條軌道 × ${S.p} nm`, x0 + cw / 2, yb + 30, { align: 'center', size: 14, w: 700, color: '#17202b' });
          const sig = S.back ? S.t : S.t - 2;
          U.txt(c, '橘＝電源線　藍＝訊號線', x0 + cw / 2, yb - base * scl - 30, { align: 'center', size: 13, color: '#5b6878' });
          // 右邊：誰改了什麼、結果、代價
          const rx = x0 + cw + 70, r = S.t * S.p / base;
          U.txt(c, S.n, rx, 44, { size: 22, w: 700, color: S.col });
          U.txt(c, `製程：金屬間距 ${S.p} nm${S.p < 28 ? '（變細）' : ''}`, rx, 86, { size: 16, color: S.p < 28 ? '#b3541e' : '#5b6878', w: S.p < 28 ? 700 : 500 });
          U.txt(c, `元件庫：${S.t} 條軌道${S.t < 6 ? '（少一條）' : ''}`, rx, 114, { size: 16, color: S.t < 6 ? '#1f4fb5' : '#5b6878', w: S.t < 6 ? 700 : 500 });
          U.txt(c, `面積是起點的 ${Math.round(r * 100)}%`, rx, 160, { size: 26, w: 700, color: r < .99 ? '#1f7a4d' : '#17202b' });
          U.txt(c, `能走訊號的線：${sig} 條`, rx, 196, { size: 16, w: 700, color: sig < 4 ? '#b3261e' : '#1f7a4d' });
          S.d.forEach((s2, k) => U.txt(c, s2, rx, 236 + k * 28, { size: 15, color: k === S.d.length - 1 ? S.col : '#3e4b5b', w: k === S.d.length - 1 ? 700 : 500 }));
          // 下：四個情境的面積長條
          const bx = rx, by = Math.min(h - 120, 236 + 4 * 28 + 10), bw = w - rx - 40;
          DT.forEach((d2, k) => { const v = d2.t * d2.p / base, y = by + k * 25; c.fillStyle = k === D ? d2.col : '#dfe5ec'; c.fillRect(bx + 100, y, bw * .55 * v, 16); U.txt(c, d2.s, bx, y + 14, { size: 14, color: k === D ? '#17202b' : '#3e4b5b', w: k === D ? 700 : 500 }); U.txt(c, Math.round(v * 100) + '%', bx + 106 + bw * .55 * v, y + 14, { size: 14, color: '#3e4b5b' }); });
          U.txt(c, '數字是示意', w - 20, h - 8, { align: 'right', size: 13, color: '#6a7888' });
        }
      });
    },
    notes: `下線之前，設計者怎麼知道畫出來的東西晶圓廠做得出來？靠 PDK，Process Design Kit，是晶圓廠交給設計者的說明書加工具包。三個分頁依序看。

第一個分頁，PDK 裡有什麼。主要四樣：設計規則，例如最小線寬、最小間距，連同電腦自動檢查用的 DRC、LVS 檢查檔；元件模型，就是電晶體的電流電壓曲線，給設計者模擬電路用；寄生萃取，告訴設計工具導線的電阻電容怎麼算；還有 PCell，參數化元件，填入尺寸就自動畫出電晶體或電阻。注意左邊的來源：規則來自微影和蝕刻的能力，模型來自第九章的 WAT 量測和第八章的 TCAD，寄生參數來自第七章的導線結構，再用第九章的量測校正。PDK 越準，客戶第一次下線就成功的機會越大，所以我們量到的每一個數字，最後都會變成客戶手上的規則和模型。底下那行也注意：標準元件庫，像反相器、正反器這些現成的小積木，還有 SRAM、I/O，業界叫「基礎 IP」，通常和 PDK 分開交付。PDK 會一直改版，從 0.1 版到 1.0 版，下一頁會看到。

第二個分頁，設計規則檢查，簡稱 DRC。拖動間距滑桿，小於規則就會標紅；硬要做，印到晶圓上相鄰的線就會連在一起，短路。拖線寬滑桿，太細就會印斷，斷路。一顆晶片有上百億個圖形，下線前每一條規則都要用電腦檢查。原則上要全部通過；真的非這樣畫不可的地方，要晶圓廠審查同意，英文叫 waiver。DRC 之外還有兩種檢查：LVS，比對畫出來的圖和電路圖對不對得上；DFM 熱點檢查，找出規則都過、但製程上容易印壞的圖形，叫熱點。等一下 A14 的例子會再看到熱點。

第三個分頁，DTCO，英文 Design-Technology Co-Optimization，設計和製程一起最佳化。先抓一個概念：晶片是由上億個標準元件排出來的，一個元件的高度，等於裡面有幾條金屬線的位置，叫軌道，乘上線和線的間距。所以要縮小有兩個旋鈕：間距靠製程；軌道數由標準元件庫的架構決定，通常是晶圓廠和領頭客戶一起定。下面四個情境依序點。

第一個，起點：6 條軌道，上下兩條是電源線，中間 4 條走訊號。第二個，只靠製程：把間距從 28 縮到 24 奈米，面積剩 86%，但線要做更細，微影可能要多重曝光，貴、良率風險也高。第三個，只改元件庫：少一條軌道，面積剩 83%，可是走訊號的線從 4 條變 3 條，複雜的元件接不出來，紅色就是不夠用。第四個，一起改：製程除了縮間距，再做一件新事，把電源線搬到晶片背面，這就是第三部分的背面供電；正面 5 條軌道全部可以走訊號，元件庫就能放心少一條軌道。面積剩 71%，訊號線還比原本多。提醒一下，台積電從 A16 開始用背面供電，A14 第一版沒有，這裡是講概念。

這就是 DTCO：不是製程單方面做更細，而是設計說卡在哪裡，製程想辦法幫它解決，兩邊一起找最划算的組合。數字都是示意。`
  }, F));

  /* ---------- ④ 新製程四階段：TV、可靠度 ---------- */
  const NPI = [
    { n: '探索', when: '量產前約 4–5 年', y: .02, yv: '還談不上', v: .05, vv: '幾十片', pdk: '—', fab: '研發線', d: '新結構、新材料能不能做？用最簡單的測試結構，一次只驗一件事，例如奈米片疊不疊得起來。' },
    { n: '研發', when: '前約 2–3 年', y: .2, yv: '低', v: .2, vv: '數百片', pdk: '0.1 → 0.9', fab: '研發線', d: '把整套製程串起來，開始跑測試載具。TV（Test Vehicle）＝晶圓廠自己設計、不拿來賣的晶片，專門用來考新製程。PDK 一路改版：0.1 先給領頭客戶，0.5 設計公司開始設計，0.9 開始畫佈局。' },
    { n: '試產', when: '前約 1 年', y: .55, yv: '中', v: .45, vv: '數千片', pdk: '1.0 定版', fab: '研發線 → 量產線', d: '風險試產（risk production）：製程還沒全部驗證完，就先接客戶第一批單，風險兩邊共擔。PDK 定版 1.0、客戶下線；製程技術移轉到量產線，配方、機台型號、量測規格、OCD 模型、檢測配方整套照搬。' },
    { n: '量產', when: '量產', y: .85, yv: '高', v: 1, vv: '數萬片', pdk: '1.0 沿用', fab: '量產線', d: '在量產線上大量生產，PDK 1.0 沿用（之後只做小改版）。左邊對照研發線和量產線的差別；良率還要繼續往上爬，靠的是後面的良率學習。' }
  ];
  function npi(c, w, h, i, p, t) {
    const L = 30, R = w - 30, sw = (R - L) / 4, y = 34;
    NPI.forEach((s, k) => {
      const x = L + k * sw, on = k === i, done = k < i;
      c.fillStyle = on ? '#1f4fb5' : done ? '#9fb5e3' : '#e4e9f0';
      c.beginPath(); c.moveTo(x + 4, y); c.lineTo(x + sw - 14, y); c.lineTo(x + sw + 2, y + 24); c.lineTo(x + sw - 14, y + 48); c.lineTo(x + 4, y + 48); c.lineTo(x + 20, y + 24); c.closePath(); c.fill();
      U.txt(c, s.n, x + sw / 2 + 4, y + 30, { align: 'center', size: 18, w: 700, color: on || done ? '#fff' : '#3e4b5b' });
      U.txt(c, s.when, x + sw / 2 + 4, y + 70, { align: 'center', size: 13.5, color: on ? '#1f4fb5' : '#5b6878' });
    });
    // 在哪條線做：研發線（探索～試產）、量產線（試產～量產），試產時技術移轉
    const ly = y + 88, lh = 26, gap = 28, LANES = [[0, 3, '研發線：晶圓少、實驗多，每批條件都不同', '#1f4fb5', i <= 2], [2, 4, '量產線：同型機台好幾十台、配方鎖定', '#b3541e', i >= 2]];
    LANES.forEach(([a, b, n, col, on], k) => {
      const x0 = L + a * sw + 6, x1 = L + b * sw - 6, yy = ly + k * (lh + gap);
      c.fillStyle = on ? col : '#eef1f5'; U.rrect(c, x0, yy, x1 - x0, lh, 6); c.fill();
      U.txt(c, n, x0 + 10, yy + 18, { size: 14, w: 700, color: on ? '#fff' : '#8a97a8' });
    });
    if (i === 2) {
      const tx = L + 2.5 * sw, f = (t * 0.8) % 1;
      U.arrow(c, tx, ly + lh + 2, tx, ly + lh + gap - 2, '#17202b', 2.5);
      U.dot(c, tx, ly + lh + 2 + f * (gap - 4), 3, '#17202b');
      U.tag(c, '技術移轉：整套照搬', tx + 14, ly + lh + gap / 2 + 6, { size: 14, color: '#17202b' });
    }
    const top = ly + 2 * lh + gap + 22, bot = h - 20, mh = bot - top, cx = w / 2;
    if (i === 0) {
      // 晶圓上只有零星幾個測試結構
      const Rw = mh * 0.42, wx = L + Rw + 20, wy = top + mh / 2;
      c.fillStyle = '#e9edf2'; c.beginPath(); c.arc(wx, wy, Rw, 0, 7); c.fill(); c.strokeStyle = '#9aa8b8'; c.stroke();
      [[-.4, -.3], [.3, -.2], [-.1, .35], [.35, .4], [0, -.05]].forEach(([a, b], k) => { c.globalAlpha = U.clamp(p * 5 - k, 0, 1); c.fillStyle = '#b3541e'; c.fillRect(wx + a * Rw - 7, wy + b * Rw - 7, 14, 14); c.globalAlpha = 1; });
      const rx = wx + Rw + 50;
      U.txt(c, '零星幾個測試結構', rx, top + 40, { size: 22, w: 700, color: '#17202b' });
      ['一次只驗一件事：疊得起來嗎？溶得掉嗎？', '大量用 TEM 切片、看剖面（第九章）', '很多點子在這一關就被淘汰'].forEach((s, k) => U.txt(c, '• ' + s, rx, top + 84 + k * 32, { size: 16, color: '#3e4b5b' }));
    } else if (i === 1) {
      // 一顆 TV 晶片的平面圖
      const tw = Math.min(mh * 1.1, w * 0.46), th = mh * 0.9, tx = L + 10, ty = top + (mh - th) / 2;
      const B = [[0, 0, .62, .6, 'SRAM', '#9fb5e3', '最密的記憶體格子：抓缺陷最靈敏'], [.62, 0, .38, .3, '環形振盪器', '#f2c46b', '量電晶體有多快'], [.62, .3, .38, .3, '缺陷監控', '#e8b4c8', '梳狀線抓短路、蛇形長線抓斷路'], [0, .6, 1, .4, 'test key（WAT）', '#b9d8c4', '單顆電晶體、導線、接點電阻']];
      B.forEach(([a, b, ww, hh, n, col, d], k) => { c.globalAlpha = U.clamp(p * 4 - k * 0.7, 0, 1); c.fillStyle = col; c.fillRect(tx + a * tw + 2, ty + b * th + 2, ww * tw - 4, hh * th - 4); U.tag(c, n, tx + (a + ww / 2) * tw, ty + (b + hh / 2) * th + 6, { align: 'center', size: 15 }); c.globalAlpha = 1; });
      if (p > .3) for (let q = 0; q < 5; q++) for (let r = 0; r < 5; r++) { c.strokeStyle = 'rgba(31,79,181,.25)'; c.strokeRect(tx + 10 + q * tw * .11, ty + 10 + r * th * .1, tw * .1, th * .09); }
      c.strokeStyle = '#17202b'; c.lineWidth = 2; c.strokeRect(tx, ty, tw, th);
      const rx = tx + tw + 40;
      U.txt(c, '測試載具（TV，Test Vehicle）', rx, top + 24, { size: 20, w: 700, color: '#17202b' });
      U.txt(c, '晶圓廠自己設計、不拿來賣的晶片', rx, top + 50, { size: 15, w: 700, color: '#b3541e' });
      U.txt(c, '專門用來「考」新製程：哪裡壞、壞多少、為什麼壞', rx, top + 72, { size: 14, color: '#3e4b5b' });
      B.forEach(([, , , , n, col, d], k) => { c.fillStyle = col; c.fillRect(rx, top + 96 + k * 42, 14, 14); U.txt(c, n, rx + 22, top + 108 + k * 42, { size: 15, w: 700, color: '#17202b' }); U.txt(c, d, rx + 22, top + 127 + k * 42, { size: 13.5, color: '#3e4b5b' }); });
      const fy = top + 96 + 4 * 42 + 8;
      if (fy < bot - 10) U.txt(c, 'SRAM 哪一格壞 → 位置 → 對回缺陷檢測', rx, fy, { size: 14, w: 700, color: '#b3541e' });
    } else if (i === 2) {
      // 可靠度：把十年壓成幾週。分製程可靠度（TV 測試結構）和產品可靠度（真的產品）
      const G2 = [['製程可靠度：TV 上的測試結構', '#b3541e', '#fdf3ea', [['絕緣層崩潰', '閘極那道牆能撐多久（第五章）'], ['電遷移', '導線被電流慢慢推走、斷掉（第七章）'], ['電晶體老化', 'Vt 隨時間慢慢漂，速度變慢']]], ['產品可靠度：真正的產品晶片', '#1f4fb5', '#eef3fc', [['高溫長時間通電', '約 125°C、加高電壓跑上千小時，看會不會提早壞']]]];
      U.txt(c, '可靠度驗證：加溫、加壓，把十年壓縮成幾週', L, top + 18, { size: 19, w: 700, color: '#17202b' });
      const rh = Math.min(44, (mh - 34 - 2 * 24) / 4); let yy = top + 30, k = 0;
      G2.forEach(([gn, col, bg, rows]) => {
        U.txt(c, gn, L, yy + 17, { size: 15, w: 700, color: col }); yy += 24;
        rows.forEach(([n, d]) => {
          c.globalAlpha = U.clamp(p * 5 - k, 0, 1);
          c.fillStyle = bg; U.rrect(c, L, yy, R - L, rh - 6, 8); c.fill();
          U.txt(c, n, L + 16, yy + rh / 2 + 3, { size: 16, w: 700, color: col });
          U.txt(c, d, L + 170, yy + rh / 2 + 3, { size: 15, color: '#3e4b5b' });
          const bx = R - 150, bw2 = 130, f = U.clamp((t * 0.4 + k * 0.2) % 1.2, 0, 1);
          c.fillStyle = '#e4e9f0'; c.fillRect(bx, yy + rh / 2 - 9, bw2, 10); c.fillStyle = col; c.fillRect(bx, yy + rh / 2 - 9, bw2 * f, 10);
          c.globalAlpha = 1; yy += rh; k++;
        });
      });
    } else {
      // 量產：研發線 vs 量產線對照
      const ROWS = [['目的', '把製程做出來、找問題', '穩定、大量、便宜地做'], ['晶圓量', '每月數百到數千片', '每月數萬片'], ['機台', '各型號一兩台，常有新機', '同型號好幾十台'], ['配方', '每批都可能不同（分批實驗）', '鎖定，改動要走變更審核'], ['量測', '量很多點、常切 TEM', '固定抽樣，SPC／APC 盯每一站']];
      const c0 = L, c1 = L + 90, c2 = L + 90 + (R - L - 90) / 2, rh = Math.min(40, (mh - 70) / 6);
      U.txt(c, '研發線', c1 + 8, top + 18, { size: 17, w: 700, color: '#1f4fb5' }); U.txt(c, '量產線', c2 + 8, top + 18, { size: 17, w: 700, color: '#b3541e' });
      ROWS.forEach(([k, a1, a2], j) => {
        const yy = top + 30 + j * rh; c.globalAlpha = U.clamp(p * 6 - j, 0, 1);
        if (j % 2 === 0) { c.fillStyle = '#f4f6f9'; c.fillRect(c0, yy, R - L, rh); }
        U.txt(c, k, c0 + 8, yy + rh / 2 + 5, { size: 14.5, w: 700, color: '#17202b' });
        U.txt(c, a1, c1 + 8, yy + rh / 2 + 5, { size: 14.5, color: '#3e4b5b' }); U.txt(c, a2, c2 + 8, yy + rh / 2 + 5, { size: 14.5, color: '#3e4b5b' });
        c.globalAlpha = 1;
      });
      const fy = top + 30 + ROWS.length * rh + 26;
      U.txt(c, '技術移轉的關鍵：兩條線做出來要一樣；量測機台用標準片（golden wafer）彼此匹配', L, fy, { size: 15.5, w: 700, color: '#b3261e' });
      U.txt(c, '→ 下一頁：用 A14 製程實際走一次（示意案例），看誰負責什麼', L, fy + 28, { size: 15, w: 700, color: '#1f4fb5' });
    }
  }
  A(Object.assign({
    id: 'npi', minutes: 5, short: '⑩ 新製程四階段：TV、可靠度',
    title: '一個新製程怎麼誕生：從測試載具（TV）到量產', en: 'Pathfinding → R&D → Risk → Volume',
    thesis: '新製程先在<b>研發線</b>用<b>測試載具（TV）</b>反覆試做，試產時<b>技術移轉</b>到<b>量產線</b>；PDK 從 0.1 版長到 1.0 版，每一關都要通過<b>可靠度驗證</b>。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('np-cv', '四個階段（年份是示意）', '流程為業界通則示意，各廠做法不同')}${U.stepperHTML('np-st')}</div>
      ${U.side({
        top: `<div class="card key"><h4 id="np-h"></h4><p id="np-p" style="font-size:17px"></p></div>`,
        meters: [['np-y', '良率（示意）'], ['np-v', '晶圓量']],
        extra: '<div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px"><h4>PDK 版本</h4><h4>在哪條線</h4><div class="bigword" id="np-k" style="font-size:22px"></div><div class="bigword" id="np-f" style="font-size:22px"></div></div>',
        analogy: { icon: 'road', t: '比喻', p: '像新車上市：先做原型測引擎，再派測試車隊跑幾十萬公里，小量交車，最後才大量生產。' }
      })}</div>`,
    init(el, ctx) {
      const steps = NPI.map((s, i) => ({ t: s.n, d: s.when, draw: (c, w, h, p, t) => npi(c, w, h, i, p, t) }));
      U.animSteps(el, ctx, { canvas: 'np-cv', stepper: 'np-st', steps, interval: 4200, dur: 1.6, onStep: i => {
        const s = NPI[i];
        U.$(el, '#np-h').textContent = `第 ${i + 1} 階段 · ${s.n}（${s.when}）`;
        U.$(el, '#np-p').textContent = s.d;
        U.$(el, '#np-k').textContent = s.pdk;
        U.$(el, '#np-f').textContent = s.fab;
        U.setMeter(el, 'np-y', s.y, s.yv, s.y > .7 ? 'good' : s.y > .3 ? 'warn' : 'bad');
        U.setMeter(el, 'np-v', s.v, s.vv, '');
      } });
    },
    notes: `前面看的是一顆產品晶片從設計到出貨的路。這一頁換個角度：一個全新的製程，像 2 奈米，怎麼從實驗室走到量產。四個階段，年份都是示意，各廠做法也不完全一樣。

第一個階段，探索，大約量產前四、五年。新結構、新材料到底做不做得出來？用最簡單的測試結構，一次只驗一件事，例如奈米片疊不疊得起來、矽鍺溶不溶得乾淨，大量靠 TEM 切片看剖面。很多點子在這一關就被淘汰。

第二個階段，研發，把上千道步驟整套串起來，做測試載具，英文 Test Vehicle，簡稱 TV。TV 是晶圓廠自己設計、不拿來賣的晶片，就像新車的測試車，專門拿來考新製程：哪裡會壞、壞多少、為什麼壞。真正的產品太複雜，壞了很難知道是哪一步出錯；TV 上放的都是容易壞、又容易診斷的結構。一顆 TV 晶片上放四種東西：SRAM，最密的記憶體格子；環形振盪器，量電晶體有多快；缺陷監控結構，梳子一樣交錯的線專門抓短路，一條來回繞的蛇形長線專門抓斷路；還有第九章講的 test key。SRAM 最密、每一格都一樣，哪一格壞了，電性測試一查就知道位置，再拿這個位置去對缺陷檢測的資料，就找得到是哪一步、哪台機台出的問題。PDK 也在這個階段一路改版：0.1 版先給少數領頭客戶，0.5 版設計公司開始設計，0.9 版開始畫佈局。

第三個階段，試產，英文 risk production，風險試產。意思是製程還沒全部驗證完，就先接客戶第一批單，風險由晶圓廠和客戶一起扛。PDK 在這時定版 1.0，客戶正式下線。

注意上面兩條色帶，中間的箭頭就是技術移轉。前兩個階段都在研發線，晶圓少、實驗多，常常一批拆成好幾組、各做一種條件來比，叫分批實驗。試產時，製程從研發線搬到量產線：配方、機台型號、量測規格整套照搬，量測用的 OCD 模型、缺陷檢測的配方也一起移過去。量產線同一型號的機台有好幾十台、配方鎖定，任何改動都要走變更審核。

對量測來說，最關鍵的是機台匹配：拿同一片標準片，英文 golden wafer，在每一台量測機上量。研發線那台量到 15 奈米，量產線的每一台也都要量到 15 奈米，差一點點，SPC 管制線就全部失準。

【可略】同時跑可靠度驗證：晶片要用十年，不能等十年，所以加溫、加電壓，把老化壓縮成幾週。分兩層：製程可靠度，用 TV 上的測試結構，看閘極絕緣層多久會崩潰、導線會不會電遷移斷掉、電晶體會不會老化變慢；產品可靠度，拿真正的產品晶片在高溫下長時間通電，看會不會提早壞。

第四個階段，量產。PDK 1.0 沿用，產能放大到每月數萬片。【可略】畫面上研發線和量產線的對照表請自己看：新人進公司可能分到其中一邊，工作節奏很不一樣。良率還沒到頂，要繼續往上爬。下一頁用 A14 製程實際走一次，看設計公司和晶圓廠各負責什麼。`
  }, F));

  /* ---------- ④ 實際走一次：用 A14 製程做一顆手機晶片（示意案例） ---------- */
  // 三條泳道：設計公司（藍）／一起做（紫）／晶圓廠（橘）；re：第二個客戶來時要重做（1）還是沿用（0）；一格可拆成上下兩半
  const LANE = [['設計公司', '#1f4fb5', '#e8effc'], ['一起做', '#7c3aed', '#f1eafd'], ['晶圓廠', '#b3541e', '#fbeee4']];
  const CASE = [
    { y: '2025.4 公布', t: 'PDK 0.1', c: [['評估要不要用 A14', 1], ['DTCO：和領頭客戶訂規則、元件庫', 0], ['研發線用 TV 試製程', 0]] },
    { y: '量產前約 2 年', t: 'PDK 0.5', c: [['定架構、寫電路（RTL）、加測試電路（DFT）', 1], ['領頭客戶試用 PDK、回報問題', 0], ['晶圓廠＋EDA／IP 廠商：認證工具、做基礎 IP', 0]] },
    { y: '約 1.5 年', t: 'PDK 0.9', c: [['畫佈局、時序驗證、跑 DRC／LVS', 1], ['客戶測試晶片搭 MPW，先驗證自家 IP', 1], ['TV 良率學習、製程可靠度驗證', 0]] },
    { y: '約 1 年', t: 'PDK 1.0・下線', c: [['下線：交出 GDS 檔', 1], ['規則例外審查（waiver）、修熱點', 1], [['PDK 1.0 定版、技術移轉', 0], ['OPC、光罩、投片', 1]]] },
    { y: '下線後約 3 個月', t: '第一批晶片', c: [['開機、除錯；必要時只改幾層金屬光罩（ECO）', 1], ['客戶回報 CP 結果', 1], ['良率工程師拿 CP 壞點對上線上缺陷找原因', 1]] },
    { y: '2028 量產', t: '量產', c: [['測試程式（CP／FT）、出貨給手機廠', 1], ['產品可靠度驗證、產能規劃', 1], [['量產線', 0], ['這顆產品良率重爬', 1]]] }
  ];
  const CASE_TX = [
    '台積電 2025 年 4 月公布 A14、預計 2028 年量產（公開時程）。這時製程還在研發線上，PDK 0.1 只給少數領頭客戶；領頭客戶會一起訂規則和元件庫（DTCO），所以 PDK 不是「研發完才給」。',
    '大約量產前 2 年，PDK 0.5：規則和模型大致底定，但還會改。設計公司開始定架構、寫電路，並加進測試電路（DFT），以後 CP 測到壞才找得到位置。晶圓廠和 EDA／IP 廠商拿同一份 PDK 認證工具、做 SRAM 和 I/O。',
    '大約量產前 1.5 年，PDK 0.9：設計公司畫佈局、跑 DRC／LVS 和時序驗證；先把自家 IP 做成小測試晶片搭 MPW 驗證。晶圓廠在研發線用 TV 抓缺陷、跑製程可靠度。',
    '大約量產前 1 年進入試產：PDK 1.0 定版，客戶下線交出 GDS 檔；晶圓廠做 OPC、寫一整組光罩、投片，同時把製程技術移轉到量產線。非這樣畫不可的地方走例外審查，熱點兩邊一起修。',
    '約 3 個月後第一批晶片回來。設計公司開機、除錯；小錯可以只改幾層金屬光罩（ECO），比全部重做便宜很多。客戶回報 CP 結果，晶圓廠良率工程師拿 CP 壞點對上線上缺陷找原因；量測檢測的數據就是證據。',
    '2028 年量產（公開時程）：產品可靠度驗證通過、放大產能。設計公司寫測試程式、出貨；晶圓廠在量產線繼續爬良率（下一頁）。'
  ];
  A(Object.assign({
    id: 'a14case', minutes: 5.5, short: '⑩ 用 A14 製程走一次（示意）',
    title: '實際走一次：用 A14 製程做一顆手機晶片（示意案例）', en: 'Who Does What: Design × Foundry',
    thesis: 'PDK 不是研發完才給：<b>一邊研發、一邊發版</b>，設計同時進行。新客戶用同一個製程，<b>製程和 PDK 沿用</b>；要重做的是<b>自己的設計、光罩、產品驗證，以及這顆產品的良率</b>。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('ac-m', ['第一個客戶：從頭走一次', '第二個客戶來了：哪些要重做？'], 0)}</div>${U.figHTML('ac-cv', '藍＝設計公司　紫＝一起做　橘＝晶圓廠（PDK 版本與中間時間為示意）', '流程為業界通則示意，各廠做法不同')}
        <p class="gloss" style="margin:2px 0 0;font-size:14px"><b>RTL</b> 用程式碼寫的電路　<b>DFT</b> 方便測試的電路　<b>EDA</b> 設計軟體　<b>IP</b> 現成的電路區塊　<b>熱點</b> 規則都過、但容易印壞的圖形</p>
        <div id="ac-sw">${U.stepperHTML('ac-st')}</div></div>
      ${U.side({
        top: `<div class="card key"><h4 id="ac-h"></h4><p id="ac-p" style="font-size:16px"></p></div>`,
        extra: `<div class="card"><h4>誰負責什麼</h4><p style="font-size:15px;margin:2px 0"><b style="color:#1f4fb5">設計公司</b>：晶片要做什麼、電路、佈局、驗證、測試程式</p><p style="font-size:15px;margin:2px 0"><b style="color:#b3541e">晶圓廠</b>：製程、PDK、光罩、製造、量測檢測、良率</p><p style="font-size:15px;margin:2px 0"><b style="color:#7c3aed">一起做</b>：訂規則（DTCO）、修熱點、良率除錯、產品驗證</p></div>`,
        analogy: { icon: 'stairs', t: '比喻', p: '像建案：建商先開發工法、訂建材規範；建築師照規範設計。下一個建案沿用工法，但要重新設計、重新送審。' }
      })}</div>`,
    init(el, ctx) {
      const cv = U.$(el, '#ac-cv');
      let G = U.canvas(cv), m = 0, k = 0, T = 0;
      // 切分頁時播放器會藏起來、圖框變高：跟著重設 canvas，字才不會被拉扁
      const fit = () => { const r = cv.parentElement; if (Math.abs(r.clientWidth - G.w) > 2 || Math.abs(r.clientHeight - G.h) > 2) G = U.canvas(cv); };
      const card = () => {
        if (m === 0) { U.$(el, '#ac-h').textContent = `${CASE[k].y} · ${CASE[k].t}`; U.$(el, '#ac-p').textContent = CASE_TX[k]; }
        else { U.$(el, '#ac-h').textContent = '第二個客戶：A14 已經量產了'; U.$(el, '#ac-p').textContent = '沿用：製程、PDK 1.0、TV、製程可靠度驗證、量產線。重做：自己的設計、下線、一整組新光罩（OPC 重跑）、投片、產品可靠度驗證；新設計可能有新的熱點，這顆產品的良率也要重爬。每家客戶的設計資料分開保管、嚴格隔離，A 客戶的圖檔 B 客戶看不到。'; }
      };
      U.stepper(el, 'ac-st', CASE.map(s => ({ t: `${s.y} · ${s.t}`, d: '' })), i => { k = i; T = 0; card(); }, ctx, { interval: 4200 });
      U.onSeg(el, 'ac-m', i => { m = i; T = 0; U.$(el, '#ac-sw').style.visibility = i === 0 ? '' : 'hidden'; card(); });
      ctx.raf((dt) => {
        fit(); const { c, w, h } = G;
        T += dt; c.clearRect(0, 0, w, h);
        const LW = 74, top = 56, n = CASE.length, cw = (w - LW - 12) / n, lh = (h - top - 10) / 3, a = Math.min(1, T / 0.5);
        // 欄標題兩行：時間／事件
        CASE.forEach((s, j) => {
          const x = LW + j * cw, on = m === 0 && j === k;
          c.globalAlpha = m === 0 && j > k ? .3 : 1;
          U.txt(c, s.y, x + cw / 2, 20, { align: 'center', size: 13.5, color: on ? '#1f4fb5' : '#3e4b5b', w: on ? 700 : 500 });
          U.txt(c, s.t, x + cw / 2, 42, { align: 'center', size: 15, w: 700, color: on ? '#1f4fb5' : '#17202b' });
          c.globalAlpha = 1;
          if (j > 0) { c.strokeStyle = '#e4e9f0'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, 6); c.lineTo(x, h - 6); c.stroke(); }
        });
        // 泳道
        LANE.forEach(([n2, col, bg], r) => {
          const y = top + r * lh;
          c.fillStyle = bg; c.fillRect(0, y + 3, LW - 6, lh - 6);
          U.txt(c, n2, (LW - 6) / 2, y + lh / 2 + 5, { align: 'center', size: 15, w: 700, color: col });
          CASE.forEach((s, j) => {
            const x = LW + j * cw, cell = s.c[r], parts = Array.isArray(cell[0]) ? cell : [cell], ph = (lh - 10 - (parts.length - 1) * 4) / parts.length;
            if (m === 0 && j > k) return;
            parts.forEach(([txt, re], q) => {
              const yy = y + 5 + q * (ph + 4);
              let alpha = 1, fill = bg, stroke = col, tcol = '#17202b', tag = '';
              if (m === 0) { if (j === k) alpha = a; else { fill = '#fff'; tcol = '#3e4b5b'; stroke = '#c3ccd6'; } }
              else if (!re) { fill = '#f4f6f9'; stroke = '#c3ccd6'; tcol = '#5b6878'; tag = '沿用'; } else tag = '重做';
              c.globalAlpha = alpha;
              c.fillStyle = fill; U.rrect(c, x + 4, yy, cw - 8, ph, 8); c.fill(); c.strokeStyle = stroke; c.lineWidth = m === 0 && j === k ? 2.2 : 1.2; c.stroke();
              // 有「沿用／重做」標籤時，字放在標籤下方的空間置中
              wrapTxt(c, txt, x + cw / 2, tag ? yy + 18 + (ph - 18) / 2 + 5 : yy + ph / 2 + 5, cw - 18, { align: 'center', size: parts.length > 1 ? 13.5 : 14, color: tcol, w: m === 0 && j === k ? 700 : 500 });
              if (tag) U.txt(c, tag, x + cw - 10, yy + 15, { align: 'right', size: 13, w: 700, color: re ? '#b3261e' : '#6a7888' });
              c.globalAlpha = 1;
            });
          });
        });
      });
    },
    notes: `這一頁用一個例子實際走一次：一家虛構的手機晶片公司，用台積電的 A14 製程做新一代手機晶片。公開的只有兩個時間點：台積電 2025 年 4 月公布 A14、預計 2028 年量產；中間的時間和 PDK 版本都是示意，流程是業界通則，各廠做法不同。畫面分三條泳道：藍色是設計公司，橘色是晶圓廠，紫色是兩邊一起做。圖下面那行是幾個術語的白話解釋。

第一步，公布，大約是量產前三年。很多人以為晶圓廠先把製程研發完，再把 PDK 交給設計者。其實不是：製程還在研發線上的時候，PDK 0.1 版就交給少數領頭客戶了。領頭客戶會跟晶圓廠一起訂規則、訂元件庫，這就是 PDK 那一頁講的 DTCO。

第二步，大約量產前兩年，PDK 0.5。設計公司開始定架構、用程式碼寫電路，叫 RTL；同時要加進方便測試的電路，叫 DFT，例如把晶片裡的正反器串成掃描鏈，再用工具自動產生測試圖樣，叫 ATPG。這樣以後 CP 測到壞，才定位得出是哪一塊、甚至哪一條線。晶圓廠這邊，和 EDA 工具廠、IP 廠一起拿同一份 PDK 認證工具、做 SRAM 和 I/O 這些基礎 IP，設計公司才有東西可以用。

第三步，大約量產前一年半，PDK 0.9。設計公司畫佈局，跑 DRC、LVS 和時序驗證；自家的關鍵 IP 先做成小測試晶片，搭旅程那一頁講的共乘下線，也就是 MPW，先去驗證。晶圓廠在研發線用 TV 抓缺陷、跑製程可靠度。

第四步，大約量產前一年，進入試產。PDK 1.0 定版，客戶下線，交出 GDS 檔。晶圓廠做 OPC、寫一整組光罩、投片；投片就是把空白晶圓放進產線、開始照這組光罩做。同一段時間，製程從研發線技術移轉到量產線。設計裡違反規則、但非這樣畫不可的地方，走例外審查，也就是 waiver；熱點檢查抓到容易印壞的圖形，兩邊一起修。

第五步，下線後大約三個月，第一批晶片回來。設計公司開機、除錯。有小錯時，常常只改幾層金屬層的光罩，叫 ECO，Engineering Change Order：設計時會預先撒一些沒接線的備用元件，叫 spare cells，要改的時候只動金屬層把它們接起來，不用重做電晶體那幾層。第一批投片時，也常把幾片晶圓先停在金屬層之前，叫 metal hold，萬一要 ECO，就從金屬層接著做，又省好幾週。良率這邊，客戶把 CP 測試結果回報給晶圓廠，晶圓廠的良率工程師拿 CP 壞點的位置，對上第九章線上檢測的缺陷資料找原因；量測和檢測的數據，就是找原因的證據。

第六步，2028 年量產：產品可靠度驗證通過、放大產能；設計公司寫測試程式、出貨給手機廠；晶圓廠在量產線繼續爬良率，就是下一頁。

最後切到「第二個客戶來了」。A14 量產之後，另一家公司也想用 A14 製程，要不要整個重來？不用。灰色寫「沿用」的：製程、PDK 1.0、TV、製程可靠度驗證、量產線，都是現成的。紅字「重做」的：客戶自己的設計、下線、一整組新光罩，連 OPC 都要針對新圖形重跑、重新投片，還有這顆產品自己的可靠度驗證。新的設計可能有新的熱點，這顆產品的良率也要再爬一次，所以新客戶剛下線時，量測檢測一樣要盯得很緊。順帶一提，每家客戶的設計資料，晶圓廠都分開保管、嚴格隔離，A 客戶的圖檔 B 客戶看不到，這是晶圓廠被信任的基礎。`
  }, F));

  /* ---------- ⑤ 良率學習 ---------- */
  const DEF = [['微塵顆粒', '#e03131', .32], ['圖案橋接', '#e8590c', .26], ['蝕刻殘留', '#9c36b5', .2], ['薄膜空洞', '#1971c2', .13], ['CMP 刮傷', '#2b8a3e', .09]];
  const WAFER_CM2 = Math.PI * 15 * 15;
  A(Object.assign({
    id: 'yield', minutes: 5, short: '⑩ 良率學習：柏拉圖與根因',
    title: '良率學習：把缺陷一個一個抓出來', en: 'Yield Learning',
    thesis: '良率大約是 <b>e<sup>−晶片面積 × 致命缺陷密度</sup></b>：晶片越大，對缺陷越敏感。工程師靠<b>檢測找缺陷 → 分類排名次 → 找根因 → 修製程</b>，先修排第一的，把缺陷密度一路壓低。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('yl-a', ['手機晶片 1 cm²', '電腦晶片 3 cm²', 'AI 晶片 8 cm²'], 0)}<button class="btn primary" type="button" id="yl-fix">🔍 修好排第一的原因</button><button class="btn" type="button" id="yl-rs">↺ 重來</button></div>${U.figHTML('yl-cv', '左：晶圓圖（每一點是一個致命缺陷）　右上：致命缺陷排名　右下：學習曲線', '')}</div>
      ${U.side({
        top: `<div class="card key"><h4>這一片的良率</h4><div class="bigword" id="yl-y"></div><p id="yl-d" style="font-size:16.5px"></p></div>`,
        points: ['晶片越大，越容易被缺陷打中', '排名看「會殺死晶片」的：缺陷數 × 致命率，先修排第一的', '缺陷種類從哪來？檢測找位置 → 電子顯微鏡分類（第九章）'],
        analogy: { icon: 'target', t: '比喻', p: '像抓漏：先補最大的那個漏水點，水費降最多；再找下一個。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#yl-cv'));
      let A2 = 1, pts = [], hist = [];
      const D0 = () => DEF.map((_, k) => pts.filter(q => q[2] === k).length).reduce((a, b) => a + b, 0) / WAFER_CM2;
      const reset = () => {
        pts = [];
        DEF.forEach(([, , sh], k) => { const n = Math.round(sh * WAFER_CM2); for (let j = 0; j < n; j++) { const r = 15 * Math.sqrt(Math.random()), a = Math.random() * 6.283; pts.push([r * Math.cos(a), r * Math.sin(a), k]); } });
        hist = [D0()]; lock(); draw();
      };
      // 修到接近量產水準（D0≈0.1）就停用按鈕
      const fb = U.$(el, '#yl-fix'), done = () => d0Last() <= .11 || hist.length > 9;
      const lock = () => { fb.disabled = done(); fb.textContent = done() ? '✓ 已接近量產水準' : '🔍 修好排第一的原因'; };
      const fix = () => {
        const cnt = DEF.map((_, k) => pts.filter(q => q[2] === k).length), top = cnt.indexOf(Math.max(...cnt));
        if (!cnt[top] || done()) return;
        pts = pts.filter(q => q[2] !== top || Math.random() > .75);
        hist.push(D0()); lock(); draw();
      };
      U.onSeg(el, 'yl-a', i => { A2 = [1, 3, 8][i]; draw(); });
      U.$(el, '#yl-fix').addEventListener('click', fix);
      U.$(el, '#yl-rs').addEventListener('click', reset);
      function draw() {
        if (!pts.length && !hist.length) return;
        c.clearRect(0, 0, w, h);
        // 晶圓圖：晶片邊長 sqrt(A) cm
        const R = Math.min(h / 2 - 30, w * 0.27), cx = 20 + R, cy = h / 2 - 6, s = R / 15, side = Math.sqrt(A2);
        c.fillStyle = '#e9edf2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
        const n = Math.ceil(15 / side) + 1, bad = new Set();
        pts.forEach(([x, y]) => bad.add(Math.floor(x / side) + ',' + Math.floor(y / side)));
        let good = 0, tot = 0;
        for (let a = -n; a < n; a++) for (let b = -n; b < n; b++) {
          const x = a * side, y = b * side;
          if (![[x, y], [x + side, y], [x, y + side], [x + side, y + side]].every(([p, q]) => Math.hypot(p, q) < 14.7)) continue;
          tot++; const isBad = bad.has(a + ',' + b); if (!isBad) good++;
          c.fillStyle = isBad ? '#f6c9c5' : '#cfe8d6'; c.fillRect(cx + x * s + 1, cy + y * s + 1, side * s - 2, side * s - 2);
        }
        pts.forEach(([x, y, k]) => U.dot(c, cx + x * s, cy + y * s, 1.6, DEF[k][1]));
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        U.txt(c, `綠＝好晶片　紅＝被打中（共 ${tot} 顆）`, cx, h - 8, { align: 'center', size: 13.5, color: '#3e4b5b' });
        // 右上：柏拉圖
        const px = cx + R + 40, pw = w - px - 20, py = 16, ph = h * 0.42;
        const cnt = DEF.map(([n2, col], k) => [n2, col, pts.filter(q => q[2] === k).length / WAFER_CM2]).sort((a, b) => b[2] - a[2]);
        const mx = Math.max(.35, cnt[0][2]);
        U.txt(c, '致命缺陷排名（缺陷數 × 致命率，示意）', px, py + 12, { size: 14, w: 700, color: '#17202b' });
        cnt.forEach(([n2, col, v], k) => {
          const y = py + 26 + k * (ph - 30) / 5, bh = (ph - 30) / 5 - 8;
          U.txt(c, n2, px, y + bh / 2 + 5, { size: 13.5, color: '#3e4b5b' });
          c.fillStyle = col; c.globalAlpha = k ? .55 : 1; c.fillRect(px + 78, y, (pw - 210) * v / mx, bh); c.globalAlpha = 1;
          U.txt(c, v.toFixed(2) + (k ? '' : '　← 下一個修它'), px + 84 + (pw - 210) * v / mx, y + bh / 2 + 5, { size: 13, w: k ? 500 : 700, color: k ? '#5b6878' : '#b3261e' });
        });
        // 右下：學習曲線（這個晶片面積下的良率）
        const gx = px + 30, gy = py + ph + 30, gw = pw - 40, gh = h - gy - 36;
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
        U.txt(c, '良率', gx - 6, gy - 6, { size: 13, color: '#5b6878' });
        U.txt(c, '100%', gx - 6, gy + 5, { align: 'right', size: 13, color: '#5b6878' });
        U.txt(c, '0', gx - 6, gy + gh + 4, { align: 'right', size: 13, color: '#5b6878' });
        U.txt(c, '修正次數 →（每一次＝幾週到幾個月）', gx + gw, gy + gh + 22, { align: 'right', size: 13, color: '#5b6878' });
        const X = k => gx + (k / 9) * gw, Y = v => gy + gh * (1 - v);
        // 量產目標：D0≈0.1 時這個晶片大小的良率
        const yt = Math.exp(-A2 * .1); c.setLineDash([5, 4]); c.strokeStyle = '#1f7a4d'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, Y(yt)); c.lineTo(gx + gw, Y(yt)); c.stroke(); c.setLineDash([]);
        U.tag(c, `量產目標 D0≈0.1：良率約 ${Math.round(yt * 100)}%`, gx + 10, Y(yt) + 18, { size: 13, color: '#1f7a4d', w: 700 });
        [1, 3, 8].forEach(a => { c.strokeStyle = a === A2 ? '#1f4fb5' : 'rgba(31,79,181,.22)'; c.lineWidth = a === A2 ? 2.5 : 1.5; c.beginPath(); hist.forEach((d, k) => { const v = Math.exp(-a * d); k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v)); }); c.stroke(); });
        hist.forEach((d, k) => U.dot(c, X(k), Y(Math.exp(-A2 * d)), 4, '#1f4fb5'));
        const used = [Y(Math.exp(-A2 * d0Last()))];
        if (hist.length > 1) [1, 3, 8].forEach(a => { const yy = Y(Math.exp(-a * d0Last())); if (a === A2 || used.some(u => Math.abs(u - yy) < 16)) return; used.push(yy); U.txt(c, a + ' cm²', X(hist.length - 1) + 8, yy + 4, { size: 13, color: 'rgba(31,79,181,.6)' }); });
        const yv = good / Math.max(1, tot), d0 = hist[hist.length - 1];
        U.txt(c, `${Math.round(yv * 100)}%`, X(hist.length - 1) + 8, Y(Math.exp(-A2 * d0)) - 6, { size: 14, w: 700, color: '#1f4fb5' });
        U.$(el, '#yl-y').textContent = `${Math.round(yv * 100)}%　（${good} / ${tot} 顆）`;
        U.$(el, '#yl-d').innerHTML = `致命缺陷密度 ${d0.toFixed(2)} 個／cm²，晶片 ${A2} cm²：公式算 e<sup>−${A2}×${d0.toFixed(2)}</sup> ≈ ${Math.round(Math.exp(-A2 * d0) * 100)}%。${done() ? '已接近量產水準（D0≈0.1）：剩下的越來越難抓。' : ''}`;
      }
      function d0Last() { return hist[hist.length - 1]; }
      reset();
    },
    notes: `第十章最後一頁，也是整個第二部分最實際的一頁：良率怎麼爬上去。

先看公式：良率大約等於 e 的負「晶片面積乘缺陷密度」次方。這裡的缺陷密度是「致命缺陷」密度，就是每平方公分平均有幾個會讓晶片壞掉的缺陷。這是最簡單的模型，叫 Poisson 模型；真實的缺陷常常成群出現，擠在同幾顆晶片上，所以大晶片的實際良率會比公式算的好一些。左邊的晶圓圖，每一個小點是一個致命缺陷，綠色格子是好晶片，紅色是被打中的。現在缺陷密度大約每平方公分 1 個，這是新製程研發初期的水準；量產時要壓到 0.1 左右，甚至更低。右下那條綠色虛線，就是壓到 0.1 時這個晶片大小的良率。上面切換晶片大小：手機晶片 1 平方公分，良率三成多；換成 8 平方公分的 AI 晶片，在研發初期幾乎做不出好晶片。晶片越大，對缺陷越敏感，所以 AI 晶片特別需要成熟、乾淨的製程。

怎麼把缺陷密度壓下來？看右上的排名，這叫柏拉圖分析。注意排的是致命缺陷，不是檢測掃到的缺陷總數：一片晶圓可能掃到上千個缺陷，大部分不會讓晶片壞。每一類缺陷有一個致命率，算法是把線上檢測的缺陷位置，疊到 CP 的壞晶片圖上，看落在壞晶片上的比例有多高。缺陷數乘上致命率，才是真正該修的排名。缺陷種類怎麼來？第九章講過：檢測機台找到位置，再用電子顯微鏡一顆顆拍照分類。

排第一的是微塵顆粒，就先修它。按「修好排第一的原因」。怎麼知道是哪台機台？用共通性分析：把壞的晶圓走過哪些機台列出來，看是不是都經過同一台。找到了，可能是某台機台的零件在掉粉，修好之後，這一類缺陷少了七成五。排名馬上換人，下一個再修。修到接近 0.1，按鈕就會停下來。

看右下的學習曲線：每修一次，良率往上跳一格。三條線是三種晶片大小，深色是目前選的那一種。一開始修一次跳很多，後面越來越難，因為剩下的缺陷又小又少、更難抓。真實世界裡，每一次修正都是幾週到幾個月的工作，這就是為什麼量測和檢測工程師對量產這麼關鍵。

【可略】再補兩點。第一，良率損失不只有隨機掉落的微塵，還有系統性的：某些圖形剛好在製程窗口邊緣，每一片都在同一個地方印壞，就是前面講的熱點；或是電性參數整體偏掉，晶片能動但太慢、太耗電，叫參數良率。第二，SRAM 的壞點可以畫成位元圖，英文 bitmap，看是單一位元壞、一整排壞還是一整列壞，就能猜是哪一層出問題；再把那個位置送去做失效分析，英文 FA，切下來放到 TEM 下看，最後確認根因。

第三部分講先進封裝時，會再用到這個公式：大晶片良率太低，所以要拆成小晶片。這一章走完了一顆晶片從設計到量產的路：設計者照 PDK 畫圖、下線、做光罩，新製程靠 TV 和可靠度驗證走到量產，最後靠良率學習一路爬上去。`
  }, F));
})();
