/* 第二部分 ⑦：GAA 九步驟之後，補上前段／中段／後段（總覽、中段接點、後段導線、後段難題）；頁序在 index.html 調整 */
(function () {
  const A = Deck.add.bind(Deck);
  const EY = '第二部分 · ⑦ 環繞式電晶體與導線';

  /* ---------- 共用：一顆晶片的剖面（下：電晶體、中：接點、上：十幾層導線） ---------- */
  const SEG = [
    { k: 'all', n: '全部' },
    { k: 'feol', n: '前段 FEOL', col: '#1f4fb5', what: '做出電晶體本身', key: '微影、蝕刻、磊晶、ALD、高介電金屬閘極', go: [['GAA 九步驟', 'gaaflow']] },
    { k: 'mol', n: '中段 MOL', col: '#1f7a4d', what: '把電晶體的三個端點接出來', key: '接觸孔、金屬矽化物、鎢／鈷填孔', go: [['中段詳解', 'mol']] },
    { k: 'beol', n: '後段 BEOL', col: '#b3541e', what: '用十幾層金屬導線把幾百億顆電晶體連起來', key: '雙鑲嵌、銅電鍍、低介電絕緣層、CMP', go: [['後段詳解', 'beol'], ['銅導線怎麼做', 'cmp2']] }
  ];
  function chip(c, w, h, on, t) {
    const L = 16, R = w * 0.3, W = R - L, base = h - 30;
    const dim = k => on === 'all' || on === k ? 1 : 0.18;
    // 前段：矽基板＋電晶體
    c.globalAlpha = dim('feol');
    U.box(c, 'si', L, base - 40, W, 40);
    const nT = 10, tw = W / nT;
    for (let i = 0; i < nT; i++) {
      const x = L + i * tw;
      U.box(c, 'n', x + tw * 0.08, base - 58, tw * 0.22, 18); U.box(c, 'n', x + tw * 0.7, base - 58, tw * 0.22, 18);
      U.box(c, 'metal', x + tw * 0.34, base - 66, tw * 0.32, 26);
    }
    c.globalAlpha = 1;
    // 中段：接觸點
    c.globalAlpha = dim('mol');
    c.fillStyle = 'rgba(241,227,168,.6)'; c.fillRect(L, base - 96, W, 30);
    for (let i = 0; i < nT; i++) { const x = L + i * tw; [0.19, 0.5, 0.81].forEach(f => U.box(c, 'w', x + tw * f - 3, base - 96 + (f === 0.5 ? 0 : 0), 6, f === 0.5 ? 30 : 38, { stroke: false })); }
    c.globalAlpha = 1;
    // 後段：導線層，越上越粗
    c.globalAlpha = dim('beol');
    let y = base - 96;
    const layers = [[6, 4], [6, 4], [6, 4], [7, 5], [8, 5], [8, 6], [10, 7], [12, 9], [16, 12], [22, 16], [30, 22]];
    layers.forEach(([lh, lw], j) => {
      const gap = lh * 0.9; y -= lh + gap;
      c.fillStyle = U.MAT.lowk; c.fillRect(L, y, W, lh + gap);
      const pitch = lw * 2.4; for (let x = L + 4; x < R - lw; x += pitch) U.box(c, 'cu', x, y, lw * 1.2, lh, { stroke: false });
    });
    U.box(c, '#b7c3d6', L, y - 14, W, 14); for (let x = L + 30; x < R - 20; x += 70) U.dot(c, x, y - 22, 9, '#9aa1a9');
    c.globalAlpha = 1;
    // 右側標籤
    const lab = (k, y0, y1, s) => { const a = on === 'all' || on === k; c.strokeStyle = a ? SEG.find(x => x.k === k).col : '#d3dbe4'; c.lineWidth = 3; c.beginPath(); c.moveTo(R + 14, y0); c.lineTo(R + 14, y1); c.stroke(); U.txt(c, s, R + 22, (y0 + y1) / 2 + 6, { size: 15, w: 700, color: a ? SEG.find(x => x.k === k).col : '#b7c3d6' }); };
    lab('beol', y, base - 96, '後段：導線');
    lab('mol', base - 96, base - 66, '中段：接點');
    lab('feol', base - 66, base, '前段：電晶體');
    U.txt(c, '示意圖', L, y - 30, { size: 14, w: 700, color: '#17202b' });
  }
  A({
    id: 'fmb', part: 2, chap: 7, eyebrow: EY, minutes: 2.1, short: '前中後段總覽',
    title: '電晶體做好只是開始：前段、中段、後段',
    thesis: '上一頁的九步驟只完成了<b>前段</b>：電晶體做好了，但一條線都還沒接。接著要用<b>中段</b>把每顆電晶體的端點接出來，再用<b>後段</b>十幾層金屬導線把幾百億顆電晶體連成電路。點選每一段看看。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('fm-m', SEG.map(x => x.n), 0)}</div>${U.figHTML('fm-cv', '晶片剖面示意圖（比例不準）', '')}</div>
      ${U.side({
        top: `<div class="card key" id="fm-card"><h4 id="fm-h">三段各做什麼</h4><p id="fm-p" style="font-size:17.5px"></p><div id="fm-go" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"></div></div>`,
        extra: `<table class="t" style="font-size:15.5px"><thead><tr><th>段</th><th>做什麼</th><th>關鍵技術</th></tr></thead><tbody>${SEG.slice(1).map(s => `<tr><td><b style="color:${s.col}">${s.n}</b></td><td>${s.what}</td><td>${s.key}</td></tr>`).join('')}</tbody></table>`,
        points: ['前段決定電晶體本身快不快、漏不漏電', '後段佔了大量的光罩層數和製程步驟，約佔整個流程的一半'],
        analogy: { icon: 'stairs', t: '比喻', p: '蓋大樓：前段是打地基、蓋出一間間房間；中段是每間房裝插座；後段是整棟樓十幾層的電線與管線。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#fm-cv'));
      let m = 0;
      U.onSeg(el, 'fm-m', i => {
        m = i; const s = SEG[i];
        U.$(el, '#fm-h').textContent = i ? s.n : '三段各做什麼';
        U.$(el, '#fm-p').textContent = i ? `${s.what}。關鍵技術：${s.key}。` : '由下往上：前段做電晶體、中段接端點、後段拉導線。';
        U.$(el, '#fm-go').innerHTML = (s.go || [['回到[[頁:scale]]', 'scale']]).map(([t, id]) => `<button class="btn" data-go="${id}" type="button">${t} →</button>`).join('');
        U.$$(el, '#fm-go [data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const on = SEG[m].k;
        chip(c, w * 2.4, h, on, t);   // 只畫示意圖，放大到大部分畫面
      });
    },
    notes: `上一頁九個步驟做完，電晶體就完成了，但它們還是一顆顆孤立的開關，一條線都還沒接。業界把整個製程分成三段。

最下面是前段，英文 FEOL：做出電晶體本身，就是前面各章用來做電晶體的部分。前段決定電晶體快不快、漏不漏電。

中間是中段，MOL：每顆電晶體有三個端點，源極、汲極、閘極，要先用很小的接觸點把它們接出來。

最上面是後段，BEOL：用十幾層金屬導線，把幾百億顆電晶體連成電路。最底下的導線最細、排得最密，負責附近電晶體之間的連線；越往上越粗，負責長距離傳訊號和送電。最頂上再接到錫球，連到封裝。後段的光罩層數和製程步驟，大約佔整個流程的一半。

點選每一段，示意圖會亮起對應的位置：最底下是電晶體，往上十幾層導線，越上面越粗。就像蓋大樓：前段是蓋出一間間房間，中段是每間房裝插座，後段是整棟樓的電線管線。接下來兩頁分別看中段和後段。`
  });

  /* ---------- 中段 MOL：把電晶體的端點接出來 ---------- */
  function molDraw(c, w, h, i, p) { // 放大畫，避免上方留白
    const S = Math.min(1.45, (h - 20) / 300); c.save(); c.scale(S, S); molInner(c, w / S, h / S, i, p); c.restore();
  }
  function molInner(c, w, h, i, p) {
    const L = 30, R = w - 30, W = R - L, base = h - 20, cx = w / 2;
    const sd = [[L + W * 0.08, W * 0.26], [L + W * 0.66, W * 0.26]], gx = cx - W * 0.09, gw = W * 0.18;
    if (i >= 1) { const hh = 190 * (i === 1 ? p : 1); c.fillStyle = 'rgba(241,227,168,.9)'; c.fillRect(L, base - 50 - hh, W, hh); }
    U.box(c, 'si', L, base - 50, W, 50); U.txt(c, '矽', L + 12, base - 18, { size: 14, color: '#3e4b5b' });
    sd.forEach(([x, sw]) => U.box(c, 'n', x, base - 80, sw, 40));
    U.box(c, 'hk', gx - 4, base - 56, gw + 8, 6); U.box(c, 'metal', gx, base - 116, gw, 60); U.box(c, 'nit', gx - 14, base - 116, 14, 66); U.box(c, 'nit', gx + gw, base - 116, 14, 66);
    U.txt(c, '源極', sd[0][0] + sd[0][1] / 2, base - 52, { align: 'center', size: 14, w: 700, color: '#fff' }); U.txt(c, '汲極', sd[1][0] + sd[1][1] / 2, base - 52, { align: 'center', size: 14, w: 700, color: '#fff' });
    U.txt(c, '閘極', cx, base - 80, { align: 'center', size: 14, w: 700, color: '#fff' });
    const holes = [[sd[0][0] + sd[0][1] / 2, base - 80], [sd[1][0] + sd[1][1] / 2, base - 80], [cx, base - 116]];
    const topY = base - 240;
    if (i >= 2) holes.forEach(([x, y]) => { const d = (y - topY) * (i === 2 ? p : 1); c.fillStyle = '#fbfcfd'; c.fillRect(x - 14, topY, 28, d); });
    if (i === 2) holes.forEach(([x]) => U.arrow(c, x, topY - 40, x, topY - 6, '#c0392b', 2));
    if (i >= 3) holes.slice(0, 2).forEach(([x, y]) => { c.fillStyle = `rgba(110,95,75,${i === 3 ? p : 1})`; c.fillRect(x - 14, y - 6, 28, 8); });
    if (i >= 4) holes.forEach(([x, y]) => { const d = (y - topY) * (i === 4 ? p : 1); U.box(c, 'w', x - 14, y - d, 28, d); });
    if (i >= 5) { U.box(c, 'lowk', L, topY - 40, W, 40); holes.forEach(([x]) => U.box(c, 'cu', x - 30, topY - 34, 60, 30)); U.txt(c, 'M0：第一層導線', R, topY - 48, { align: 'right', size: 14, w: 700, color: '#8a4a1e' }); }
    const lab = ['電晶體做好了：三個端點都埋在下面', '① 蓋上一層絕緣層，把電晶體整個包起來', '② 微影＋蝕刻：挖出直通源汲極和閘極的接觸孔', '③ 孔底和矽反應，長出一層金屬矽化物，降低接觸電阻', '④ 填滿金屬（鎢或鈷），再用 CMP 磨平', '⑤ 接上第一層導線 M0，交棒給後段'][i];
    U.txt(c, lab, w / 2, 26, { align: 'center', size: 17, w: 700, color: '#17202b' });
  }
  A({
    id: 'mol', part: 2, chap: 7, eyebrow: EY, minutes: 2.1, short: '中段 MOL：接觸點',
    title: '中段：在電晶體上鑽孔，把三個端點接出來', en: 'Middle of Line',
    thesis: '電晶體的源極、汲極、閘極都埋在絕緣層下面。中段要挖出<b>比電晶體還小的接觸孔</b>，填進金屬，讓電流進得去、出得來。孔越小，<b>接觸電阻</b>越成為瓶頸。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('mo-cv', '剖面（沿電流方向切開，示意）', '')}${U.stepperHTML('mo-st')}</div>
      ${U.side({
        points: ['孔只有十幾奈米寬，還要對準下面的端點', '接觸電阻：電晶體越小，這一小段越拖速度', '金屬矽化物：讓金屬和矽之間更好導電', '閘極接點直接打在電晶體正上方，可以省面積'],
        extra: U.legendHTML(['n', 'metal', 'nit', 'w', 'cu']),
        analogy: { icon: 'faucet', t: '比喻', p: '房子蓋好後，在牆上鑽孔接水管：孔太小、接頭沒鎖緊，水壓再大也流不進來。' }
      })}</div>`,
    init(el, ctx) {
      const steps = ['電晶體完成', '蓋絕緣層', '挖接觸孔', '金屬矽化物', '填金屬＋磨平', '接上 M0'].map((t, i) => ({ t, d: '', draw: (c, w, h, p) => molDraw(c, w, h, i, p) }));
      U.animSteps(el, ctx, { canvas: 'mo-cv', stepper: 'mo-st', steps, interval: 2800, dur: 1.4 });
    },
    notes: `中段，英文 Middle of Line。電晶體做好之後，它的源極、汲極、閘極都還埋在下面，外面接不到。

畫面第一步是做好的電晶體，按下一步開始。第二步，先蓋一層絕緣層，把電晶體整個包起來保護。第三步，用微影和蝕刻挖出接觸孔，直通到源極、汲極和閘極。這些孔只有十幾奈米寬，比電晶體還小，而且要對得非常準，偏一點就接不到，或是碰到旁邊短路。

第四步，在孔底讓金屬和矽反應，長出一層金屬矽化物。金屬直接碰矽，接觸的地方電阻很大；有了這一層，電子進出就順很多。第五步，把孔填滿金屬，常用鎢或鈷，再用 CMP 磨平。第六步，接上第一層導線 M0，交棒給後段。

電晶體越做越小，接觸孔也越小，這一小段的電阻反而變成拖慢速度的瓶頸，所以先進製程花很多力氣在降低接觸電阻。另外，新的做法會把閘極的接點直接打在電晶體正上方，不用拉到旁邊，又省下一點面積。就像房子蓋好後在牆上鑽孔接水管，孔太小、接頭沒鎖緊，水壓再大也流不進來。`
  });

  /* ---------- 後段 BEOL：導線一層層疊上去 ---------- */
  function beolDraw(c, w, h, i, p) { // 前五步放大畫；第六步要畫十幾層，用原尺寸
    const S = i < 5 ? Math.min(2, (h - 20) / 190) : 1; c.save(); c.scale(S, S); beolInner(c, w / S, h / S, i, p); c.restore();
  }
  function beolInner(c, w, h, i, p) {
    const L = 30, R = w - 30, W = R - L, base = h - 10;
    U.box(c, '#e8edf3', L, base - 30, W, 30); U.txt(c, '下面：中段＋電晶體', L + 10, base - 8, { size: 14, color: '#6a7888' });
    [0.12 + 0.1, 0.72 + 0.09, 0.42 + 0.09].forEach(f => U.box(c, 'cu', L + W * f - 10, base - 30, 20, 10, { stroke: false }));
    const L1 = base - 30, th = 90;
    if (i === 0) { const hh = th * p; c.fillStyle = U.MAT.lowk; c.fillRect(L, L1 - hh, W, hh); U.txt(c, '低介電絕緣層：線和線之間的電容變小', w / 2, L1 - th - 14, { align: 'center', size: 14, color: '#3e4b5b' }); }
    const tr = [[0.12, 0.2], [0.42, 0.18], [0.72, 0.18]]; // 溝槽 [位置, 寬度]
    if (i >= 1 && i < 5) {
      c.fillStyle = U.MAT.lowk; c.fillRect(L, L1 - th, W, th);
      const dp = i === 1 ? p : 1;
      tr.forEach(([f, tw], k) => {
        const x = L + W * f, ww = W * tw;
        c.fillStyle = '#fbfcfd'; c.fillRect(x, L1 - th, ww, th * 0.55 * dp);
        if (k !== 1) c.fillRect(x + ww * 0.35, L1 - th * 0.45, ww * 0.3, th * 0.45 * dp);
      });
      if (i === 1) U.txt(c, '上半是溝槽（導線）、下半是導孔（往下接），分兩次微影挖好', w / 2, L1 - th - 14, { align: 'center', size: 14, color: '#3e4b5b' });
    }
    if (i >= 2 && i < 5) tr.forEach(([f, tw], k) => { const x = L + W * f, ww = W * tw; c.strokeStyle = U.MAT.tin; c.lineWidth = 3; c.strokeRect(x + 1.5, L1 - th + 1.5, ww - 3, th * 0.55 - 3); if (k !== 1) c.strokeRect(x + ww * 0.35 + 1.5, L1 - th * 0.45, ww * 0.3 - 3, th * 0.45 - 1.5); });
    if (i === 2) U.txt(c, '阻障層＋薄銅晶種：防止銅跑進絕緣層，也讓電鍍長得上去', w / 2, L1 - th - 14, { align: 'center', size: 14, color: '#3e4b5b' });
    if (i >= 3 && i < 5) {
      const over = i === 3 ? 30 * p : 0;
      tr.forEach(([f, tw], k) => { const x = L + W * f, ww = W * tw; U.box(c, 'cu', x + 3, L1 - th + 3, ww - 6, th * 0.55 - 6, { stroke: false }); if (k !== 1) U.box(c, 'cu', x + ww * 0.35 + 3, L1 - th * 0.45, ww * 0.3 - 6, th * 0.45, { stroke: false }); });
      if (i === 3) { U.box(c, 'cu', L, L1 - th - over, W, over, { stroke: false }); U.txt(c, '電鍍：銅長滿整片，連溝槽外面都蓋住', w / 2, L1 - th - over - 14, { align: 'center', size: 14, color: '#3e4b5b' }); }
    }
    if (i === 4) U.txt(c, 'CMP 磨掉多餘的銅：只留溝槽和導孔裡的', w / 2, L1 - th - 14, { align: 'center', size: 14, color: '#3e4b5b' });
    if (i >= 5) {
      let y = L1; const n = Math.ceil(11 * p);
      for (let j = 0; j < n; j++) {
        const lh = 14 + j * 5, lw = 6 + j * 5, pitch = lw * 2.3;
        y -= lh; if (y < 46) break;
        c.fillStyle = U.MAT.lowk; c.fillRect(L, y, W, lh);
        for (let x = L + 6; x < R - lw; x += pitch) U.box(c, 'cu', x, y + 3, lw, lh * 0.55, { stroke: false });
      }
      U.txt(c, '重複十幾次：越往上，導線越粗、間距越大', w / 2, 30, { align: 'center', size: 15, w: 700, color: '#17202b' });
    }
  }
  A({
    id: 'beol', part: 2, chap: 7, eyebrow: EY, minutes: 2.5, short: '後段 BEOL：導線一層層疊',
    title: '後段：十幾層銅導線，一層一層往上蓋', en: 'Dual Damascene',
    thesis: '第 ⑥ 章看過「先挖溝、再灌銅、再磨平」。後段把它升級成<b>雙鑲嵌</b>：導線和往下接的導孔分兩次畫好圖案，再<b>一次灌銅、一次磨平</b>，重複十幾層。越往上越粗，像從巷弄一路接到高速公路。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('be-cv', '後段剖面（示意）', '')}${U.stepperHTML('be-st')}</div>
      ${U.side({
        points: ['雙鑲嵌：溝槽＋導孔一次灌、一次磨，省一輪填銅和 CMP', '底層間距二十幾奈米、線寬十幾奈米；頂層粗到好幾微米', '電源線和訊號線都擠在這裡 → 背面供電的由來'],
        extra: U.legendHTML(['lowk', 'tin', 'cu']) + '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-go="cmp2" type="button">回顧：銅導線 →</button><button class="btn" data-go="bsx" type="button">預告：背面供電 →</button></div>',
        analogy: { icon: 'road', t: '比喻', p: '城市交通：最底層是密密麻麻的巷弄，往上是市區道路，最上面是又寬又直的高速公路。' }
      })}</div>`,
    init(el, ctx) {
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      const steps = ['鋪絕緣層', '挖溝槽＋導孔', '阻障層＋晶種', '電鍍銅', 'CMP 磨平', '重複十幾層'].map((t, i) => ({ t, d: '', draw: (c, w, h, p) => beolDraw(c, w, h, i, p) }));
      U.animSteps(el, ctx, { canvas: 'be-cv', stepper: 'be-st', steps, interval: 2800, dur: 1.4 });
    },
    notes: `後段，英文 Back End of Line。第六章平坦化那裡看過銅導線的做法：先挖溝、再灌銅、最後磨平，叫鑲嵌。後段把它升級成雙鑲嵌。

第一步，鋪一層低介電絕緣層。「低介電」的意思是線和線之間的電容變小：導線要充的電變少，訊號跑得更快、更省電，相鄰兩條線也比較不會互相干擾。電阻乘上電容叫 RC 延遲，下一頁會再看到。第二步，用微影和蝕刻挖出兩種形狀，導孔和溝槽各要一次微影：上半是溝槽，就是導線本身；下半是導孔，往下接到下一層。第三步，鋪一層很薄的阻障層，防止銅原子跑進絕緣層裡，再鋪一層薄薄的銅晶種，電鍍才長得上去。第四步，電鍍銅，銅會長滿整片。第五步，用 CMP 把多餘的銅磨掉，只留溝槽和導孔裡的。導線和導孔一次灌、一次磨，所以叫雙鑲嵌，比分開做省下一輪填銅和一輪 CMP。還記得薄膜沉積那一章的選擇性沉積嗎？它就是用在這裡：讓導孔自動對準下面的導線，或在銅線頂端只長一層保護蓋。

最後，重複十幾次。最底下幾層最細，間距只有二十幾奈米、線寬十幾奈米，負責附近電晶體之間的連線；越往上越粗，最上面好幾微米，負責長距離傳訊號和送電。就像城市交通，從巷弄一路接到高速公路。

注意，電源線和訊號線都擠在這十幾層裡，這就是第三部分背面供電要解決的問題。下一頁看後段最大的難題：銅線太細了。`
  });

  /* ---------- 後段的難題：銅太細了——線寬在後段長什麼樣子、為什麼電阻暴增 ---------- */
  const MET = {
    cu: { n: '銅', r0: 1.7, lam: 39, bar: 2, col: '#c9793b' },
    ru: { n: '釕', r0: 7.1, lam: 6.6, bar: 0.3, col: '#6f86a8' }
  };
  // 示意模型：線越窄，電子撞到表面和晶界的比例越高（ρ ≈ ρ0(1 + 1.2·λ/w)）；阻障層再吃掉一部分截面
  const rho = (m, w) => { const x = MET[m], core = Math.max(1, w - 2 * x.bar); return x.r0 * (1 + 1.2 * x.lam / core) * (w / core); };
  // 各層代表線寬（示意，先進製程數量級）：越上層越粗
  const LAYERS = [['M0', 12], ['M1', 14], ['M2', 14], ['M3', 16], ['M4', 20], ['M5', 24], ['M6', 32], ['M7', 40], ['M8', 56], ['M9', 80], ['M10', 120], ['M11', 200], ['M12', 400], ['M13', 800], ['M14', 1500], ['M15', 3000]];
  A({
    id: 'beol2', part: 2, chap: 7, eyebrow: EY, minutes: 3, short: '後段難題：銅太細了',
    title: '後段的難題：最底層的導線只剩十幾奈米，電阻暴增',
    thesis: '拖動線寬：左邊看<b>這個線寬在後段的哪一層</b>，中間放大看<b>那一層的導線截面</b>：橘色是銅、外圈是阻障層、藍點是電子。線越細，阻障層佔的比例越大，<b>電子也越常撞牆</b>。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('b2-cv', '左：後段各層的線寬　中：放大這一層的截面　右：電阻率 vs 線寬', '')}
        <div class="controls">${U.range('b2-w', '線寬', 10, 60, 1, 14, ' nm')}${U.seg('b2-m', ['銅', '釕'], 0)}</div></div>
      ${U.side({
        top: '<div class="card key"><h4 id="b2-h">—</h4><div class="bigword" id="b2-t" style="font-size:22px">—</div><p id="b2-d" style="font-size:16px"></p></div>',
        meters: [['b2-cu', '銅的電阻率'], ['b2-ru', '釕的電阻率']],
        extra: '<div class="card alt"><h4>電阻高會怎樣？</h4><p style="font-size:16px"><b>① 訊號變慢</b>：導線要先「充電」才傳得過去，電阻越大充越久，整顆晶片時脈上不去<br><b>② 電壓不夠</b>：電源線上的電阻吃掉一部分電壓，電晶體拿到的電變少，跑得慢甚至出錯<br><b>③ 更耗電、更燙</b>：電流流過電阻就發熱<br><b>④ 壽命變短</b>：細線電流太擠，銅原子會被電子推走，久了斷線</p><p id="b2-x" style="font-size:16px;margin-top:6px;color:var(--accent-2);font-weight:600"></p></div><div class="card"><h4>三個解法（讓導線的 RC 延遲變小）</h4><p style="font-size:16px"><b>① 換金屬</b>：釕、鉬幾乎不用阻障層，很細時反而比銅好<br><b>② 空氣間隙</b>：線間挖空，降的是<b>電容</b>（不是電阻），訊號一樣跑得快<br><b>③ 把電源線搬走</b>：背面供電</p><div style="display:flex;gap:8px;margin-top:6px"><button class="btn" data-go="bsx" type="button">背面供電 →</button></div></div>',
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#b2-cv'));
      let W = 14, mat = 'cu';
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      // 電子：在導體截面裡亂跑，撞到邊界就閃紅
      const E = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), a: Math.random() * 7, hit: 0, run: 0 }));
      const near = v => LAYERS.reduce((b, l) => Math.abs(l[1] - v) < Math.abs(b[1] - v) ? l : b);
      const upd = () => {
        const x = MET[mat], core = Math.max(1, W - 2 * x.bar), share = 1 - (core * core) / (W * W);
        const a = rho('cu', W), b = rho('ru', W), L = near(W);
        U.setMeter(el, 'b2-cu', a / 22, a.toFixed(1), a <= b ? 'good' : 'bad');
        U.setMeter(el, 'b2-ru', b / 22, b.toFixed(1), b < a ? 'good' : 'warn');
        U.$(el, '#b2-h').textContent = '這個線寬在哪裡';
        U.$(el, '#b2-t').innerHTML = `${W} nm ≈ ${L[0]} 這一層；阻障層佔截面 <b style="color:${share > 0.3 ? '#b3261e' : '#1f7a4d'}">${Math.round(share * 100)}%</b>`;
        const k = rho(mat, W) / rho(mat, 60);
        U.$(el, '#b2-x').textContent = `和 60 nm 的${x.n}線比：同樣長度，電阻約 ×${k.toFixed(1)}，訊號延遲與發熱也跟著變大`;
        U.$(el, '#b2-d').textContent = `${x.n}：電子平均走 ${x.lam} nm 才會撞到東西；線寬只有 ${W} nm，${x.lam > W ? '還沒走完就先撞牆' : '撞牆的機會還不多'}。電阻率約 ${rho(mat, W).toFixed(1)}（大塊銅是 1.7）。`;
      };
      U.bind(el, 'b2-w', v => { W = v; upd(); }, v => v + ' nm');
      U.onSeg(el, 'b2-m', i => { mat = i ? 'ru' : 'cu'; upd(); });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const x = MET[mat], L = near(W);
        // 左：後段階梯（每層一條，長度代表線寬的對數）
        const lx = 14, lw = w * 0.22, ly = 26, lh = h - 50, rowH = lh / LAYERS.length;
        U.txt(c, '後段各層（示意）', lx, 16, { size: 13, w: 700, color: '#17202b' });
        LAYERS.forEach(([n, v], k) => {
          const y = ly + lh - (k + 1) * rowH, bw = (Math.log10(v) - 0.9) / (3.6 - 0.9) * (lw - 70), on = n === L[0];
          c.fillStyle = on ? '#b3541e' : '#e3c9b0'; c.fillRect(lx + 34, y + 2, Math.max(3, bw), rowH - 4);
          U.txt(c, n, lx + 28, y + rowH - 4, { align: 'right', size: 13, w: on ? 700 : 500, color: on ? '#b3541e' : '#6a7888' });
          if (on || k === 15 || k === 0) U.txt(c, v >= 1000 ? (v / 1000) + ' µm' : v + ' nm', lx + 40 + Math.max(3, bw), y + rowH - 4, { size: 13, w: on ? 700 : 500, color: on ? '#b3541e' : '#6a7888' });
        });
        U.txt(c, '↑ 越上層越粗', lx, h - 6, { size: 14, color: '#6a7888' });
        // 中：放大截面（三條並排的導線，畫面上固定 60 nm 寬的視窗）
        const mx = w * 0.27, mw = w * 0.33, my = 40, mh = h - 110, S = mw / 70; // 1 nm = S px
        c.fillStyle = U.MAT.lowk; c.fillRect(mx, my, mw, mh);
        U.txt(c, `放大 ${L[0]}：三條相鄰的導線`, mx, my - 10, { size: 13, w: 700, color: '#17202b' });
        const lineH = Math.min(mh - 20, 2 * W * S), gap = W * S, cy = my + mh / 2;
        const xs = [-1, 0, 1].map(k => mx + mw / 2 + k * (W * S + gap) - W * S / 2);
        xs.forEach((x0, k) => {
          if (x0 + W * S < mx || x0 > mx + mw) return;
          const x1 = Math.max(mx, x0), x2 = Math.min(mx + mw, x0 + W * S);
          c.fillStyle = mat === 'cu' ? U.MAT.tin : '#8a96a8'; c.fillRect(x1, cy - lineH / 2, x2 - x1, lineH);
          const b = x.bar * S; c.fillStyle = x.col; c.fillRect(Math.max(mx, x0 + b), cy - lineH / 2 + b, Math.min(mx + mw, x0 + W * S - b) - Math.max(mx, x0 + b), lineH - b);
        });
        // 電子只畫在中間那條
        const x0 = xs[1] + x.bar * S, cw = W * S - 2 * x.bar * S, top = cy - lineH / 2 + x.bar * S, ch = lineH - x.bar * S;
        const sp = 0.6; // 每秒走幾個「平均自由徑」
        E.forEach(e => {
          let nx = e.x + Math.cos(e.a) * dt * sp * x.lam / W, ny = e.y + Math.sin(e.a) * dt * sp * x.lam / (2 * W);
          e.run += dt * sp; if (e.run > 1) { e.a = Math.random() * 7; e.run = 0; } // 在材料裡撞到晶格／雜質
          if (nx < 0 || nx > 1) { e.a = Math.PI - e.a; e.hit = 1; nx = U.clamp(nx, 0, 1); }
          if (ny < 0 || ny > 1) { e.a = -e.a; e.hit = 1; ny = U.clamp(ny, 0, 1); }
          e.x = nx; e.y = ny; e.hit = Math.max(0, e.hit - dt * 3);
          U.electron(c, x0 + e.x * cw, top + e.y * ch, 3, e.hit > 0.2);
        });
        // 比例尺
        c.strokeStyle = '#17202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx + 10, my + mh + 16); c.lineTo(mx + 10 + 10 * S, my + mh + 16); c.stroke();
        U.txt(c, '10 nm', mx + 10 + 10 * S + 6, my + mh + 20, { size: 14, color: '#3e4b5b' });
        U.txt(c, mat === 'cu' ? '外圈深色：阻障層（電阻很高，幾乎不分擔電流）' : '釕：只要極薄的襯層', mx + mw, my + mh + 66, { align: 'right', size: 14, color: '#3e4b5b' });
        U.electron(c, mx + 8, my + mh + 40, 4); U.txt(c, '電子', mx + 16, my + mh + 45, { size: 14, color: '#3e4b5b' });
        U.electron(c, mx + 62, my + mh + 40, 4, true); U.txt(c, '剛撞到邊界的電子', mx + 70, my + mh + 45, { size: 14, color: '#3e4b5b' });
        // 右：電阻率曲線
        const gx = w * 0.66, gw = w - gx - 14, gy = 34, gh = h - 84;
        const X = U.lin(10, 60, gx, gx + gw), Y = U.lin(0, 22, gy + gh, gy);
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
        for (let v = 10; v <= 60; v += 10) U.txt(c, v + '', X(v), gy + gh + 16, { align: 'center', size: 14, color: '#6a7888' });
        U.txt(c, '線寬（nm）→', gx + gw, gy + gh + 34, { align: 'right', size: 14, color: '#3e4b5b' });
        U.txt(c, '電阻率 ↑（示意）', gx, gy - 12, { size: 14, color: '#3e4b5b' });
        ['cu', 'ru'].forEach(m => { c.strokeStyle = MET[m].col; c.lineWidth = m === mat ? 3.5 : 2; c.beginPath(); for (let v = 10; v <= 60; v += 0.5) { const y = Y(Math.min(22, rho(m, v))); v === 10 ? c.moveTo(X(v), y) : c.lineTo(X(v), y); } c.stroke(); U.txt(c, MET[m].n, X(59), Y(rho(m, 59)) - 8, { align: 'right', size: 14, w: 700, color: MET[m].col }); });
        U.dot(c, X(W), Y(Math.min(22, rho(mat, W))), 6, MET[mat].col);
        c.strokeStyle = 'rgba(179,84,30,.5)'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(X(W), gy); c.lineTo(X(W), gy + gh); c.stroke(); c.setLineDash([]);
      });
      upd();
    },
    notes: `【可略】時間緊時：「電阻高會怎樣」只講前兩件（變慢、電壓不夠），釕的切換略過。

後段最大的難題：導線越縮越細，電阻反而暴增。這一頁一次看三件事。

先看左邊：這是後段十幾層導線各自大概多粗。最底下的 M0、M1 只有十幾奈米，越往上越粗，最上面好幾微米。拖動下面的線寬，左邊會亮出「這個線寬大約在哪一層」。今天要擔心的，是最底下這幾層。

再看中間：把那一層放大，三條導線並排。橘色是銅，外圈深色是阻障層，因為銅會跑進絕緣層，一定要先包一層，而這一層本身不太導電。藍點是電子，撞到邊界會閃紅框。把線寬從 60 拉到 14 奈米：阻障層的厚度不變，所以它佔的比例越來越大，真正導電的銅越來越少；而且銅裡的電子平均要走大約 39 奈米才會撞到東西，線寬只有 14 奈米時，電子還沒走完就先撞牆，紅框一直閃。

右欄的曲線就是結果：銅的電阻率在 20 奈米以下一路往上衝。

電阻高會怎樣？右側卡片列了四件事。第一，訊號變慢：導線要先充電，訊號才傳得過去，電阻越大充得越久，整顆晶片的時脈就上不去，電晶體做得再快也被導線拖住。第二，電壓不夠：電源線也是導線，電阻會吃掉一部分電壓，傳到電晶體時電壓變低，電晶體跑得慢，嚴重時會算錯。第三，更耗電、更燙：電流流過電阻就變成熱。第四，壽命變短：線越細，電流越擠，銅原子會被電子一直推著走，時間久了導線變細、甚至斷掉，這叫電遷移。卡片最下面一行會即時算：和 60 奈米的線比，同樣長度電阻大幾倍。切到釕：大塊時的電阻率比銅高好幾倍，可是電子本來就只走大約 7 奈米，對線變細比較不敏感，又幾乎不用阻障層，所以在非常細的時候反而贏過銅。曲線和各層線寬都是示意，實際數字依製程而定。量產上，今天最細的幾層仍然是銅，靠把阻障層和襯層做得更薄撐下去；釕、鉬什麼時候接手，要看線多高、整合難不難。

解法有三個，目標都是讓訊號跑得快，也就是電阻乘電容、所謂的 RC 延遲變小：最細的幾層換金屬，像釕、鉬，這是降電阻；在導線之間挖出空氣間隙，空氣的介電常數最低，降的是線和線之間的電容，不是電阻，但導線要充的電變少，一樣跑得快；以及把電源線搬到背面，讓正面空出來給訊號線，線可以做寬一點，也就是第三部分的背面供電。

到這裡，電晶體和十幾層導線都做好了。可是這上千道步驟，怎麼確定每一步都做對？最後兩章：先模擬，再看工廠的眼睛：檢測量測。`
  });
})();
