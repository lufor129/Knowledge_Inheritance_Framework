/* 第二部分 ① 微影：用光畫圖 */
(function () {
  const A = Deck.add.bind(Deck);
  const F = { chap: 1, eyebrow: '第二部分 · ① 微影' };

  /* 1. 光越細，畫筆越細 */
  const SRC = [
    { n: '可見光', lam: 400, lim: 1000, limT: '1,000', fd: '可見光的波長；1980 年代的晶片就是用這種光畫的', col: '#4c7cf0', y: '1980 年代（1 微米）' },
    { n: '深紫外光 DUV', lam: 193, lim: 40, limT: '40', fd: '深紫外光的波長；靠浸水、大鏡頭等技巧，能畫到比波長細好幾倍', col: '#7a50dc', y: '2000 年代至今' },
    { n: '極紫外光 EUV', lam: 13.5, lim: 14, limT: '13–16', fd: '極紫外光的波長，大約是 X 光和紫外光的交界', col: '#b04fc9', y: '2019 年起' }
  ];
  A(Object.assign({
    id: 'litho1', part: 2, minutes: 2.2, short: '微影：光越細畫筆越細',
    title: '微影：用光當畫筆，光越細，畫得越細', en: 'Lithography',
    thesis: '選一種光，再拖動「想畫的線寬」。線太細、光太粗，<b>印出來就糊成一片</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('l1-src', SRC.map(s => s.n), 0)}</div>
        ${U.figHTML('l1-cv', '上：光罩上的圖案　下：晶圓上實際印出來的結果', '')}
        <div class="controls">${U.range('l1-w', '想畫的線寬', 8, 120, 1, 40, ' nm')}</div></div>
      ${U.side({
        top: `<div class="bigword" id="l1-res"></div>`,
        points: ['<b>光阻</b>：照到光會變質的感光膠', '光的波長越短，能畫的線越細', '靠浸水、大鏡頭等技巧，能畫到比波長細幾倍，但有極限'],
        fact: { v: '400 nm', d: '可見光的波長' },
        analogy: { icon: 'pen', t: '比喻', p: '用粗的麥克筆寫不出小字，要換成極細的針筆。光就是畫筆。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#l1-cv'));
      let si = 0, lw = 40;
      U.onSeg(el, 'l1-src', i => si = i);
      U.bind(el, 'l1-w', v => lw = v, v => v + ' nm');
      const noise = Array.from({ length: 400 }, () => Math.random() - .5);
      ctx.raf((dt, t) => {
        const s = SRC[si];
        const contrast = U.clamp((lw - s.lim * 0.75) / (s.lim * 0.6), 0, 1);
        c.clearRect(0, 0, w, h);
        // 光波
        c.strokeStyle = s.col; c.lineWidth = 2.5; c.beginPath();
        const wl = U.lerp(14, 110, Math.sqrt(s.lam / 400));
        for (let x = 20; x < w - 20; x += 2) { const y = 34 + Math.sin((x - t * 90) / wl * Math.PI * 2) * 12; x === 20 ? c.moveTo(x, y) : c.lineTo(x, y); }
        c.stroke();
        U.tag(c, `${s.n}：波長 ${s.lam} nm`, 20, 70, { color: s.col });
        // 光罩圖案
        const pitchPx = U.lerp(26, 120, (lw - 8) / 112) * 2, top = 90, mh = 60;
        c.fillStyle = '#f2f5f8'; c.fillRect(20, top, w - 40, mh);
        for (let x = 20; x < w - 20; x += pitchPx) { c.fillStyle = U.MAT.mask; c.fillRect(x, top, pitchPx / 2, mh); }
        U.tag(c, '光罩', 26, top + 20, { size: 14 });
        // 晶圓上的結果
        const ry = top + mh + 70, rh = h - ry - 50;
        U.box(c, 'ox', 20, ry + rh * 0.75, w - 40, rh * 0.25);
        if (contrast < 0.15) { // 糊成一片：整片光阻都只曝一半，邊界模糊
          const gg = c.createLinearGradient(0, ry, 0, ry + rh * 0.75); gg.addColorStop(0, U.MAT.pr + '22'); gg.addColorStop(1, U.MAT.pr + 'aa');
          c.fillStyle = gg; c.fillRect(20, ry + rh * 0.3, w - 40, rh * 0.45);
        } else for (let x = 20; x < w - 20; x++) {
          const ph = ((x - 20) % pitchPx) / pitchPx;
          // 正光阻：光罩黑條（ph 0–0.5）正下方沒照到光，光阻留下來
          const inten = 0.5 + 0.5 * contrast * Math.cos((ph - 0.25) * Math.PI * 2) + noise[x % 400] * (1 - contrast) * 0.3;
          const hh = inten > 0.5 ? rh * 0.75 : 0;
          c.fillStyle = U.MAT.pr; if (hh) c.fillRect(x, ry + rh * 0.75 - hh * U.clamp(contrast * 1.4, 0.15, 1), 1, hh * U.clamp(contrast * 1.4, 0.15, 1));
        }
        U.tag(c, '晶圓上的光阻（粉紅）', 26, ry + rh * 0.75 - 8, { size: 14 });
        // 中間的光
        const g = c.createLinearGradient(0, top + mh, 0, ry);
        g.addColorStop(0, s.col + '55'); g.addColorStop(1, s.col + '11');
        c.fillStyle = g; c.fillRect(20, top + mh, w - 40, ry - top - mh);
        U.txt(c, contrast > .6 ? '✓ 清楚印出每一條線' : contrast > .15 ? '△ 勉強印出，邊緣粗糙' : '✗ 糊成一片，印不出來', w / 2, h - 16, { align: 'center', size: 19, w: 700, color: contrast > .6 ? '#1f7a4d' : contrast > .15 ? '#a8660a' : '#b3261e' });
        const res = `${s.n}<br><span style="font-size:19px;font-weight:500;color:var(--ink-2)">單次最細約 ${s.limT} nm · ${s.y}</span>`;
        if (U.$(el, '#l1-res').innerHTML !== res) { U.$(el, '#l1-res').innerHTML = res; U.$(el, '.fact .v').textContent = s.lam + ' nm'; U.$(el, '.fact .d').textContent = s.fd; }
      });
    },
    notes: `第一章：微影。微影就是用光來畫圖。晶圓上塗著一層光阻，它是照到光會變質的感光膠，就像底片。光穿過光罩，把圖案印到光阻上。

先從最早的可見光開始：1980 年代量產的線寬大約 1 微米，也就是 1,000 奈米，40 奈米的線完全糊掉。切到深紫外光 DUV，波長 193 奈米，把線寬往下拉。你可能會問：193 奈米的光怎麼畫得出 40 奈米的線？因為工程師用了很多技巧，例如在鏡頭和晶圓之間加一層水、把鏡頭做得很大、一條線分好幾次曝光，可以畫到比波長細好幾倍。但再細就開始糊掉，技巧也有極限，就像粗麥克筆再怎麼小心也寫不出極小的字。

切換到極紫外光 EUV，波長只有 13.5 奈米，是 DUV 的十四分之一，一次曝光就能印出十三到十六奈米的線。這就是為什麼 5 奈米以後都要用 EUV。

補充給有興趣的聽眾：能畫多細除了看波長，也看鏡頭有多大，後面講 High-NA 時會提到。

先埋一個伏筆：曝光完、還沒蝕刻之前，廠裡會先量線寬，以及這一層和下面那層有沒有對準，叫疊對。這時候如果不對，還可以把光阻洗掉重來，叫 rework；一旦蝕刻下去就回不來了。第九章會再看到。`
  }, F));

  /* 1b. 光的特性：為什麼越細越難印 */
  const erf = x => { const s = Math.sign(x), a = Math.abs(x), t = 1 / (1 + 0.3275911 * a); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a)); };
  const LT = [
    { h: '特性 1：繞射', t: '光遇到小開口會散開', d: '光是一種波。開口比波長大很多時，光幾乎直直穿過；開口越接近波長，光就越往兩旁散開。同樣大小的開口，長波長的光散得很開，短波長的光幾乎直直穿過。' },
    { h: '特性 2：干涉', t: '相鄰的光會疊在一起', d: '兩個開口靠得太近，散開的光重疊後互相干涉，暗的地方不夠暗，兩條線就糊成一條。長波長的光散得開，稍微靠近就糊；短波長的光散得少，線可以排得更密。' },
    { h: '特性 3：光子', t: '波長越短，每顆光能量越大', d: '光也是一顆一顆的「光子」。同樣的總能量，EUV 每顆光子的能量約是 DUV 的 14 倍，所以數量只有約 1/14，容易分布不均（後面「光子太少」那頁會看到後果）。' }
  ];
  A(Object.assign({
    id: 'lithoL', part: 2, minutes: 2.5, short: '光的特性：繞射、干涉、光子',
    title: '光的三個特性：為什麼要換更短的光', en: 'Diffraction · Interference · Photons',
    thesis: '光是波，遇到小開口會<b>散開（繞射）</b>，相鄰的光會<b>疊在一起（干涉）</b>。<b>波長越長散得越開，波長越短越能直直前進</b>，所以要畫更細的線就要換更短的光。切換長短波長比比看。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('lt-m', ['1. 繞射', '2. 干涉', '3. 光子'], 0)}</div>
        ${U.figHTML('lt-cv', '上：光罩開口　下：晶圓上收到的光有多亮、印出來的結果（示意）', '')}
        <div class="controls" id="lt-cl">${U.seg('lt-l', ['長波長的光（例如 DUV）', '短波長的光（例如 EUV）'], 0)}</div>
        <div class="controls" id="lt-c1">${U.range('lt-a', '開口寬度（示意）', 20, 140, 5, 140, '')}</div>
        <div class="controls" id="lt-c2" style="display:none">${U.range('lt-g', '兩個開口的距離（示意）', 50, 170, 5, 170, '')}</div></div>
      ${U.side({
        top: `<div class="card key"><h4 id="lt-h"></h4><div class="bigword" id="lt-t" style="font-size:24px"></div><p id="lt-p" style="font-size:18.5px;margin:0"></p></div>`,
        points: ['同樣的開口：長波長散得開，短波長幾乎直走', '所以要畫更細、更密的線，就要換更短的波長', '光子：波長越短，每顆能量越大、數量越少'],
        analogy: { icon: 'rain', t: '比喻', p: '海浪穿過防波堤的小缺口，會往兩旁擴散成半圓；缺口越小，散得越開。兩個缺口太近，浪就混在一起。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#lt-cv'));
      let m = 0, r = 140, d = 170, LAM = 26;
      U.onSeg(el, 'lt-m', i => {
        m = i; const x = LT[i];
        U.$(el, '#lt-h').textContent = x.h; U.$(el, '#lt-t').textContent = x.t; U.$(el, '#lt-p').textContent = x.d;
        U.$(el, '#lt-c1').style.display = i === 0 ? '' : 'none'; U.$(el, '#lt-c2').style.display = i === 1 ? '' : 'none'; U.$(el, '#lt-cl').style.visibility = i === 2 ? 'hidden' : '';
      });
      U.onSeg(el, 'lt-l', i => LAM = i ? 7 : 26);
      U.bind(el, 'lt-a', v => r = v, v => v + ' nm');
      U.bind(el, 'lt-g', v => d = v, v => v + ' nm');
      const PUR = '#7a50dc';
      // 從開口邊緣散開的波前：中間平、兩端是圓弧，張開角度由「開口 / 波長」決定
      const front = (cx, y0, a, R, th) => {
        c.beginPath();
        c.arc(cx - a / 2, y0, R, Math.PI / 2 + th, Math.PI / 2, true);
        c.lineTo(cx + a / 2, y0 + R);
        c.arc(cx + a / 2, y0, R, Math.PI / 2, Math.PI / 2 - th, true);
        c.stroke();
      };
      const profile = (xs, a, sig) => x => xs.reduce((v, cx) => v + 0.5 * (erf((x - cx + a / 2) / (sig * 1.414)) - erf((x - cx - a / 2) / (sig * 1.414))), 0);
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const cx = w / 2, my = h * 0.3, sy = h * 0.72, L = sy - my;
        if (m === 2) {
          // 同樣的能量：DUV 很多小光子、EUV 很少大光子
          [[w * 0.25, 'DUV（193 nm）：同樣能量約 14 顆', 14, 4, PUR], [w * 0.75, 'EUV（13.5 nm）：只有約 1 顆', 1, 11, '#b04fc9']].forEach(([x0, lab, n, rad, col]) => {
            c.fillStyle = '#f2e0ea'; c.fillRect(x0 - 110, h - 110, 220, 24);
            for (let k = 0; k < n; k++) { const f = ((t * 0.6 + k / n) % 1), xx = x0 - 90 + ((k * 53) % 180); U.dot(c, xx, U.lerp(40, h - 116, f), rad, col); }
            U.txt(c, lab, x0, h - 60, { align: 'center', size: 17, w: 700, color: col });
          });
          U.txt(c, '每一顆光子帶的能量，和波長成反比：波長短 14 倍，每顆能量就大 14 倍', w / 2, h - 22, { align: 'center', size: 15, color: '#3e4b5b' });
          c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(w / 2, 20); c.lineTo(w / 2, h - 80); c.stroke();
          return;
        }
        const one = m === 0, a = one ? r : 40, xs = one ? [cx] : [cx - d / 2, cx + d / 2];
        const th = Math.min(1.25, Math.asin(Math.min(1, 1.1 * LAM / a)));
        // 入射的平面波
        c.strokeStyle = 'rgba(122,80,220,.45)'; c.lineWidth = 2;
        for (let k = 0; k < Math.ceil((my - 14) / LAM); k++) { const y = 14 + ((t * 30 + k * LAM) % (my - 14)); c.beginPath(); c.moveTo(40, y); c.lineTo(w - 40, y); c.stroke(); }
        // 光罩
        c.fillStyle = '#2b3440'; c.fillRect(20, my - 8, w - 40, 16);
        c.fillStyle = '#fff'; xs.forEach(x => c.fillRect(x - a / 2, my - 8, a, 16));
        U.tag(c, '光罩', 26, my - 14, { size: 14 });
        // 穿過開口後散開的波前
        c.save(); c.beginPath(); c.rect(20, my + 8, w - 40, L - 8); c.clip();
        c.lineWidth = 2;
        const nk = Math.ceil(L / LAM) + 1; xs.forEach(x => { for (let k = 0; k < nk; k++) { const R = ((t * 30) % LAM) + k * LAM; c.strokeStyle = `rgba(122,80,220,${0.55 - 0.4 * k / nk})`; front(x, my + 8, a, R, th); } });
        c.restore();
        // 晶圓上的亮度曲線與印出來的結果
        const sig = L * Math.tan(th) * 0.28 + 2, I0 = profile(xs, a, sig);
        // 干涉模式：曝光量調到「單獨一個開口剛好印得清楚」，再看兩個開口疊在一起的結果
        const p1 = one ? 1 : profile([cx], a, sig)(cx), I = x => I0(x) / p1 * (one ? 1 : 0.8);
        c.fillStyle = 'rgba(176,79,201,.18)'; c.strokeStyle = '#8e44ad'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(20, sy);
        for (let x = 20; x <= w - 20; x += 2) c.lineTo(x, sy - Math.min(1.2, I(x)) * 70);
        c.lineTo(w - 20, sy); c.closePath(); c.fill(); c.stroke();
        c.setLineDash([5, 4]); c.strokeStyle = '#b3541e'; c.beginPath(); c.moveTo(20, sy - 35); c.lineTo(w - 20, sy - 35); c.stroke(); c.setLineDash([]);
        U.tag(c, '亮度超過橘線才印得出來', w - 26, sy - 40, { align: 'right', size: 13, color: '#b3541e' });
        c.fillStyle = U.MAT.si; c.fillRect(20, sy + 26, w - 40, 30);
        let segs = [], on = false, s0 = 0;
        for (let x = 20; x <= w - 20; x += 1) { const v = I(x) > 0.5; if (v && !on) { on = true; s0 = x; } if (!v && on) { on = false; segs.push([s0, x]); } }
        c.fillStyle = U.MAT.pr; segs.forEach(([p0, p1]) => c.fillRect(p0, sy + 8, p1 - p0, 18));
        let msg, col;
        if (one) {
          const wid = segs.length ? segs[0][1] - segs[0][0] : 0;
          if (!segs.length) { msg = '光散得太開、太淡：印不出來 ✗'; col = '#b3261e'; }
          else if (wid > a * 1.4) { msg = `光散開了：印出的線比開口寬 ${Math.round((wid / a - 1) * 100)}%`; col = '#a8660a'; }
          else { msg = '開口比波長大很多：光直直穿過，印得清楚 ✓'; col = '#1f7a4d'; }
        } else {
          if (segs.length >= 2) { msg = '兩條線分得開 ✓'; col = '#1f7a4d'; }
          else if (segs.length === 1) { msg = '散開的光疊在一起：兩條線糊成一條 ✗'; col = '#b3261e'; }
          else { msg = '太淡了，什麼都印不出來 ✗'; col = '#b3261e'; }
        }
        U.txt(c, msg, w / 2, h - 12, { align: 'center', size: 18, w: 700, color: col });
        U.tag(c, LAM > 10 ? '長波長：波紋間距大，散得開' : '短波長：波紋間距小，幾乎直直前進', w - 26, 30, { align: 'right', size: 14, color: '#6b3fb0' });
      });
    },
    notes: `上一頁說「光越細，畫得越細」。為什麼？因為光有三個特性。

第一，繞射。光是一種波，就像海浪穿過防波堤的缺口，會往兩旁擴散成半圓。開口比波長大很多的時候，光幾乎直直穿過，印出來的線很清楚。把滑桿往左拉，開口越來越小，光就越往兩旁散開，印出來的線變寬、變淡，最後淡到印不出來。現在切到「短波長的光」：同樣小的開口，短波長的波紋間距小很多，光幾乎直直穿過，又印得出來了。關鍵是「開口和波長的比例」：開口比波長大很多，光就直走；開口接近波長，光就散開。所以想畫更細的線，就要換波長更短的光。

第二，干涉。切到第二個按鈕，現在有兩個開口。它們離得遠的時候，兩條線分得很清楚。把距離拉近，兩邊散開的光重疊後互相干涉，中間暗的地方不夠暗，兩條線就分不開了。再切到短波長：光散得少，同樣的距離兩條線又分得開了。所以短波長不只能畫更細的線，線和線也能排得更密。

第三，光子。光除了是波，也是一顆一顆的光子。波長越短，每顆光子的能量越大。同樣的總能量，EUV 每顆光子的能量大約是 DUV 的十四倍，所以數量只有大約十四分之一。光子少，就容易分布不均，有的地方剛好沒收到，這個問題後面「光子太少」那一頁會看到。

所以微影的每一次進步，都是在和這三件事搏鬥：換更短的光、把鏡頭做得更大，還要讓光子夠多。`
  }, F));

  /* 3. EUV 光源 */
  A(Object.assign({
    id: 'litho3', part: 2, minutes: 2.2, short: 'EUV：打錫滴發光',
    title: 'EUV 的光怎麼來？用雷射每秒打 5 萬顆錫滴', en: 'EUV Light Source',
    thesis: '極紫外光在空氣中走不遠，也穿不透鏡片。所以要<b>在真空中自己製造光，再用鏡子一路反射</b>。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('l3-cv', 'EUV 機台內部光路（示意）', '')}</div>
      ${U.side({
        points: ['雷射打錫滴 → 變成電漿（被打散、會發光的氣體）→ 發出 EUV', '全程在真空中，只能用鏡子反射', '一台機台約 2 億美元、重 180 噸'],
        fact: { v: '每秒 5 萬顆', d: '被雷射擊中的錫滴數量，每顆只有 30 微米大' },
        analogy: { icon: 'target', t: '比喻', p: '像在高速公路上，用雷射槍每秒打中 5 萬顆飛過的小鋼珠，而且每一發都要打中兩次。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#l3-cv'));
      const drops = [];
      let acc = 0;
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        c.fillStyle = '#f5f7fa'; U.rrect(c, 10, 10, w - 20, h - 20, 10); c.fill();
        U.txt(c, '真空腔', 24, 36, { size: 14, color: '#6a7888' });
        const sx = w * 0.18, sy = h * 0.62;
        // 收集鏡
        c.strokeStyle = '#8a97a6'; c.lineWidth = 8; c.beginPath(); c.arc(sx - 30, sy, 90, -1.1, 1.1); c.stroke();
        U.tag(c, '收集鏡', sx - 60, sy + 110, { size: 14 });
        // 錫滴
        acc += dt; if (acc > 0.12) { acc = 0; drops.push({ y: sy - 150, hit: 0 }); }
        drops.forEach(d => { d.y += dt * 260; });
        for (let k = drops.length - 1; k >= 0; k--) {
          const d = drops[k];
          if (d.y >= sy && !d.hit) d.hit = 0.001;
          if (d.hit) d.hit += dt * 3;
          if (d.hit > 1) { drops.splice(k, 1); continue; }
          if (!d.hit) U.dot(c, sx, d.y, 5, '#8c8c8c');
          else {
            const r = 8 + d.hit * 40;
            const g = c.createRadialGradient(sx, sy, 0, sx, sy, r);
            g.addColorStop(0, `rgba(255,240,255,${1 - d.hit})`); g.addColorStop(.4, `rgba(190,90,230,${.8 * (1 - d.hit)})`); g.addColorStop(1, 'rgba(190,90,230,0)');
            c.fillStyle = g; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill();
          }
        }
        U.tag(c, '錫滴落下', sx + 12, sy - 130, { size: 14 });
        // 雷射
        const flash = (t * 8) % 1 < .3;
        c.strokeStyle = flash ? 'rgba(220,40,40,.9)' : 'rgba(220,40,40,.3)'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(20, sy + 70); c.lineTo(sx, sy); c.stroke();
        U.tag(c, '高功率雷射', 24, sy + 96, { size: 14, color: '#b3261e' });
        // 光路：收集鏡 → 光罩 → 投影鏡 → 晶圓
        const pts = [[sx, sy], [w * 0.5, h * 0.2], [w * 0.72, h * 0.34], [w * 0.62, h * 0.55], [w * 0.8, h * 0.62], [w * 0.8, h * 0.86]];
        c.strokeStyle = 'rgba(176,79,201,.55)'; c.lineWidth = 6; c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
        const seg = (t * 0.5) % 1, tot = pts.length - 1, si = Math.floor(seg * tot), f = seg * tot - si;
        U.dot(c, U.lerp(pts[si][0], pts[si + 1][0], f), U.lerp(pts[si][1], pts[si + 1][1], f), 8, '#b04fc9');
        [[1, '照明反射鏡'], [2, '光罩（反射式，圖案在這）'], [3, '投影反射鏡'], [4, '投影反射鏡']].forEach(([k, s]) => { const [x, y] = pts[k]; c.fillStyle = '#8a97a6'; c.fillRect(x - 34, y - 5, 68, 10); U.tag(c, s, x + 40, y + 5, { size: 14 }); });
        c.fillStyle = U.MAT.si; c.fillRect(w * 0.66, h * 0.86, w * 0.28, 22); U.tag(c, '晶圓', w * 0.66, h * 0.86 - 8, { size: 14 });
        U.txt(c, '一般透鏡會吸收 EUV，所以整條光路都用鏡子', w / 2, h - 22, { align: 'center', size: 16, color: '#3e4b5b' });
      });
    },
    notes: `EUV 的光要怎麼產生？答案非常瘋狂。

極紫外光在空氣中走不遠，也穿不透玻璃鏡片，所以整台機器內部是真空的，光要在裡面自己製造。方法是讓一顆顆直徑三十微米的錫滴落下，用高功率雷射精準擊中，錫瞬間變成比太陽表面還熱的電漿，發出 13.5 奈米的極紫外光。實際上每顆錫滴要打兩次：第一次把它打扁，第二次才讓它發光。每秒要打五萬顆。

光被收集鏡收集，經過照明反射鏡照到光罩上。EUV 的光罩也是一面鏡子，圖案就在鏡面上；反射出來的光再經過幾面投影反射鏡縮小，最後照到晶圓。為什麼要這麼多面鏡子，下一頁細看。這些鏡子極度平滑，如果放大到一個國家那麼大，最高的凸起也不到一毫米。

全世界只有荷蘭的 ASML 能做這種機台，一台大約兩億美元、重一百八十噸。`
  }, F));

  /* 3b. 為什麼要這麼多面反射鏡 */
  function mirrorStep(c, w, h, i, p, t) {
    const PUR = '#b04fc9';
    if (i === 0) {
      // 左：DUV 穿過玻璃透鏡聚焦；右：EUV 進玻璃就被吃掉
      [[w * 0.25, 'DUV（193 nm）：穿過玻璃透鏡，聚焦 ✓', '#7a50dc', 1], [w * 0.75, 'EUV（13.5 nm）：一進玻璃就被吸收 ✗', PUR, 0]].forEach(([cx, lab, col, ok]) => {
        const ly = h * 0.45;
        c.fillStyle = 'rgba(160,190,220,.45)'; c.strokeStyle = '#7d9bb8'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx, ly, 90, 22, 0, 0, 7); c.fill(); c.stroke();
        U.tag(c, '玻璃透鏡', cx + 96, ly + 5, { size: 14 });
        for (let k = -3; k <= 3; k++) {
          const x0 = cx + k * 22, f = U.clamp(p * 1.4, 0, 1);
          c.strokeStyle = col; c.lineWidth = 2.5; c.globalAlpha = 0.85;
          c.beginPath(); c.moveTo(x0, 40); c.lineTo(x0, U.lerp(40, ly, U.clamp(f * 2, 0, 1))); c.stroke();
          if (ok && f > 0.5) { c.beginPath(); c.moveTo(x0, ly); c.lineTo(U.lerp(x0, cx, (f - .5) * 2), U.lerp(ly, h * 0.82, (f - .5) * 2)); c.stroke(); }
          c.globalAlpha = 1;
        }
        if (!ok && p > 0.4) { c.fillStyle = `rgba(176,79,201,${0.5 * U.clamp((p - .4) * 2, 0, 1)})`; c.beginPath(); c.ellipse(cx, ly, 70, 14, 0, 0, 7); c.fill(); U.tag(c, '光全部被吃掉，底下一片黑', cx, h * 0.72, { align: 'center', size: 15, color: '#b3261e' }); }
        if (ok && p > 0.7) U.dot(c, cx, h * 0.82, 6, col);
        U.txt(c, lab, cx, h - 20, { align: 'center', size: 17, w: 700, color: ok ? '#1f7a4d' : '#b3261e' });
      });
      c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(w / 2, 20); c.lineTo(w / 2, h - 50); c.stroke();
    } else if (i === 1) {
      // 多層膜反射鏡：每一層反射一點點，疊 40 多層加起來約 7 成
      const x0 = w * 0.12, x1 = w * 0.88, top = h * 0.5, n = 16, lh = 9;
      for (let k = 0; k < n; k++) { c.fillStyle = k % 2 ? '#c9d3de' : '#4f5d6e'; c.fillRect(x0, top + k * lh, x1 - x0, lh); }
      c.fillStyle = '#a9bcd0'; c.fillRect(x0, top + n * lh, x1 - x0, 26);
      U.tag(c, '深色：鉬（Mo）　淺色：矽（Si）　一層只有幾奈米，實際疊 40 多對', x0, top + n * lh + 50, { size: 14 });
      const hx = w * 0.42, f = U.clamp(p * 1.3, 0, 1);
      c.strokeStyle = PUR; c.lineWidth = 4; c.beginPath(); c.moveTo(hx - 170, 40); c.lineTo(U.lerp(hx - 170, hx, U.clamp(f * 2, 0, 1)), U.lerp(40, top, U.clamp(f * 2, 0, 1))); c.stroke();
      if (f > 0.5) for (let k = 0; k < 8; k++) {
        const yy = top + k * 2 * lh, xx = hx + k * 2 * lh * (170 / (top - 40)), a = 0.9 - k * 0.09, g = (f - .5) * 2;
        c.strokeStyle = `rgba(176,79,201,${a})`; c.lineWidth = 2; c.beginPath(); c.moveTo(hx, top); c.lineTo(xx, yy); c.stroke();
        c.beginPath(); c.moveTo(xx, yy); c.lineTo(U.lerp(xx, xx + 170, g), U.lerp(yy, yy - (top - 40), g)); c.stroke();
      }
      U.tag(c, '入射的 EUV', hx - 180, 32, { size: 15, color: '#6b3fb0' });
      if (f > 0.9) U.tag(c, '每一層介面反射一點點，全部疊加起來：約 7 成', hx + 190, 50, { size: 15, color: '#1f7a4d' });
    } else if (i === 2) {
      // 光路接力：收集 → 照明（整理均勻）→ 光罩 → 投影（縮小 4 倍並對焦）→ 晶圓
      const M = [[0.1, 0.78, '收集鏡'], [0.24, 0.2, ''], [0.36, 0.62, ''], [0.46, 0.18, ''], [0.56, 0.5, ''], [0.64, 0.12, '光罩'], [0.7, 0.62, ''], [0.76, 0.22, ''], [0.82, 0.58, ''], [0.87, 0.26, ''], [0.91, 0.54, ''], [0.94, 0.3, '']];
      const pts = M.map(([x, y]) => [x * w, y * (h - 80) + 20]);
      const end = [w * 0.95, h - 70];
      const shown = U.clamp(p * 1.2, 0, 1) * (pts.length);
      c.strokeStyle = 'rgba(176,79,201,.6)'; c.lineWidth = 4; c.beginPath();
      pts.concat([end]).forEach((q, k) => { if (k <= shown) { k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); } }); c.stroke();
      pts.forEach(([x, y], k) => { c.fillStyle = k === 5 ? '#e0a33a' : '#8a97a6'; c.fillRect(x - 16, y - 4, 32, 8); if (k <= shown) U.txt(c, String(k + 1), x, y + (y < h / 2 ? -10 : 24), { align: 'center', size: 13, w: 700, color: '#3e4b5b' }); });
      c.fillStyle = U.MAT.si; c.fillRect(end[0] - 40, end[1], 60, 16); U.tag(c, '晶圓', end[0] - 60, end[1] + 12, { align: 'right', size: 14 });
      const grp = (a, b, lab, col) => { const xa = pts[a][0] - 18, xb = pts[b][0] + 18, y = h - 40; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(xa, y - 8); c.lineTo(xa, y); c.lineTo(xb, y); c.lineTo(xb, y - 8); c.stroke(); U.txt(c, lab, (xa + xb) / 2, y + 22, { align: 'center', size: 15, w: 700, color: col }); };
      grp(0, 0, '收集', '#6a7888');
      if (shown > 3) grp(1, 4, '照明：把光整理均勻', '#1f4fb5');
      if (shown > 5) grp(5, 5, '光罩', '#a8660a');
      if (shown > 8) grp(6, 11, '投影：縮小 4 倍、對焦', '#1f7a4d');
      U.tag(c, '鏡子只能把光「轉個方向」，每面只做一小段工作，要十幾面接力', w / 2, 16, { align: 'center', size: 15 });
    } else {
      // 代價：每反射一次剩 7 成
      const n = 12, L = 60, R = w - 40, B = h - 60, T = 80, bw = (R - L) / n;
      c.strokeStyle = '#9aa8b8'; c.beginPath(); c.moveTo(L, T); c.lineTo(L, B); c.lineTo(R, B); c.stroke();
      U.txt(c, '剩下的光', L - 6, T - 44, { size: 14, color: '#6a7888' });
      const shown = U.clamp(p * 1.2, 0, 1) * n;
      for (let k = 0; k < n; k++) {
        if (k > shown) break;
        const v = Math.pow(0.7, k), x = L + k * bw + bw * 0.15, bh = (B - T) * v;
        c.fillStyle = k === n - 1 ? '#b3261e' : PUR; c.globalAlpha = k === n - 1 ? 1 : 0.75; c.fillRect(x, B - bh, bw * 0.7, bh); c.globalAlpha = 1;
        U.txt(c, (v * 100 >= 10 ? Math.round(v * 100) : (v * 100).toFixed(0)) + '%', x + bw * 0.35, B - bh - 8, { align: 'center', size: 14, w: 600 });
        U.txt(c, k ? '第 ' + k + ' 面' : '出發', x + bw * 0.35, B + 20, { align: 'center', size: 12, color: '#6a7888' });
      }
      if (shown >= n - 1) U.tag(c, '反射十幾次後只剩約 1–2%：光源必須非常強', R - 10, T + 20, { align: 'right', size: 17, color: '#b3261e' });
    }
  }
  const MSTEPS = [
    { t: '透鏡行不通', d: '一般曝光機用玻璃透鏡聚光；但 EUV 波長太短，任何玻璃都會把它吸光，所以不能用透鏡。' },
    { t: '改用特製的反射鏡', d: '鏡面由鉬和矽交錯疊 40 多對，每層介面反射一點點，加起來能反射約 7 成。' },
    { t: '一面鏡子只能做一小段', d: '鏡子只能把光轉個方向。要收集光、整理均勻、照到光罩、再把圖案縮小 4 倍並對焦，得靠十幾面接力。' },
    { t: '代價：光越反射越少', d: '每反射一次剩約 7 成，反射十幾次後只剩約 1–2%。所以錫滴光源要打得非常亮。' }
  ];
  A(Object.assign({
    id: 'litho3m', part: 2, minutes: 2.2, short: 'EUV：為什麼要十幾面鏡子',
    title: '為什麼 EUV 要用十幾面反射鏡？', en: 'Why So Many Mirrors',
    thesis: 'EUV 穿不過任何透鏡，只能靠鏡子。可是一面鏡子<b>只能把光轉個方向</b>，要收光、勻光、縮小圖案、對焦，就得十幾面接力，每一面還會吃掉 3 成的光。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('l3m-cv', '一步一步看', '')}${U.stepperHTML('l3m-st')}</div>
      ${U.side({
        points: ['EUV 會被玻璃吸收：不能用透鏡', '特製鏡子：鉬／矽疊 40 多對，反射約 7 成', '十幾面接力：收光、勻光、縮小 4 倍、對焦'],
        fact: { v: '約 1–2%', d: '從光源出發的 EUV，經過十幾次反射（含光罩）後，真正照到晶圓上的比例' },
        analogy: { icon: 'target', t: '比喻', p: '用好幾面鏡子把陽光一路轉進地下室：每面都會損失一些光，但少了哪一面，光就轉不進來。' }
      })}</div>`,
    init(el, ctx) {
      const steps = MSTEPS.map((s, i) => Object.assign({}, s, { draw: (c, w, h, p, t) => mirrorStep(c, w, h, i, p, t) }));
      U.animSteps(el, ctx, { canvas: 'l3m-cv', stepper: 'l3m-st', steps, interval: 3600, dur: 2 });
    },
    notes: `上一頁說 EUV 整條光路都用鏡子。這一頁把原因講細一點：為什麼不用透鏡？為什麼要那麼多面鏡子？

第一步：一般的深紫外光曝光機，用的是玻璃透鏡，像放大鏡一樣把光聚起來。但極紫外光的波長只有 13.5 奈米，任何玻璃、甚至空氣都會把它吸光，透鏡根本不能用。

第二步：只能改用反射。可是一般的鏡子對 EUV 也幾乎不反射，所以要特製：把鉬和矽一層一層交錯疊上四十多對，每一層只有幾奈米。每一層的交界都會反射一點點光，全部疊加起來，大約可以反射七成。

第三步：鏡子和透鏡不一樣，它不能把光「彎」過去，只能把光轉個方向，而且每面鏡子都會帶來一點變形。整台機器要做的事很多：先把錫滴發出的光收集起來，再把光整理得很均勻、用對的角度照到光罩上，接著把光罩上的圖案縮小四倍、清楚地對焦在晶圓上。每一件事都要好幾面鏡子分工，所以加起來要十幾面，照明系統大約五面，投影系統大約六面。

第四步是代價：每反射一次只剩大約七成，反射十幾次之後只剩百分之一到二。所以錫滴光源必須打得非常亮，這也是 EUV 機台又大又貴的原因之一。`
  }, F));

  /* 4. 隨機缺陷：DUV 與 EUV 並排比較 */
  function poisson(m) { let L = Math.exp(-m), k = 0, p = 1; do { k++; p *= Math.random(); } while (p > L); return k - 1; }
  A(Object.assign({
    id: 'litho4', part: 2, minutes: 2.5, short: 'EUV 難題：光子太少',
    title: 'EUV 的難題：光子太少，有些洞印不出來', en: 'Stochastic Defects',
    thesis: '同樣的能量，EUV 的光子數只有 DUV 的約 1/14，洞開始靠運氣。多照一點光能解決，<b>但機台每小時做的晶圓會大幅變少</b>。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('l4-cv', '同樣能量照向 12 個要印的小洞（上視圖）', '')}
        <div class="controls">${U.range('l4-d', 'EUV 曝光量', 1, 4, 1, 1, '')}<button class="btn primary" id="l4-go" type="button">▶ 再曝光一次</button></div></div>
      ${U.side({
        top: `<div class="card"><h4>怎麼看這張圖</h4><p style="font-size:19px;margin:0">每個洞下方的長條代表收到多少光。長條超過<b style="color:var(--accent-2)">橘線</b>才印得開（綠框），不夠就失敗（紅框）。</p></div>`,
        meters: [['l4-m', 'EUV 印壞的洞']],
        extra: `<div class="card alt"><h4>代價：每小時能曝光幾片晶圓</h4>${U.meterHTML('l4-du', 'DUV')}${U.meterHTML('l4-eu', 'EUV')}<p id="l4-tpd" style="font-size:17px"></p></div>`,
        points: ['EUV：光子少，收多收少差很多', '拉高曝光量 → 印壞變少，但機台變慢', '👁 怎麼抓？壞的機率極低、洞又小：用電子束大面積掃，或 CD-SEM 一次量上萬個洞看分布的尾巴（第九章）'],
        analogy: { icon: 'rain', t: '比喻', p: '同樣一桶水：用細霧噴，每個杯子都裝得到；改成丟幾顆大水球，有的杯子就可能剛好沒被砸中。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#l4-cv'));
      let dose = 1, T = 0, panels = [];
      const NEED = 10;
      const setup = () => {
        T = 0;
        panels = [
          { n: 'DUV：光子多、每顆能量小', col: '#7a50dc', e: 0.5, mean: 40, r: 3 },
          { n: 'EUV：光子少、每顆能量大', col: '#b04fc9', e: 5, mean: 3 * dose, r: 6 }
        ].map(pp => Object.assign(pp, { holes: Array.from({ length: 12 }, () => { const k = poisson(pp.mean); return { k, times: Array.from({ length: k }, () => Math.random() * 2.2) }; }) }));
      };
      setup();
      U.bind(el, 'l4-d', v => { dose = v; setup(); }, v => ['', '一般', '2 倍', '3 倍', '4 倍'][v]);
      U.$(el, '#l4-go').onclick = setup;
      ctx.raf(dt => {
        T += dt;
        c.clearRect(0, 0, w, h);
        panels.forEach((pn, pi) => {
          const x0 = pi * w / 2 + 16, pw = w / 2 - 32;
          U.txt(c, pn.n, x0 + pw / 2, 24, { align: 'center', size: 17, w: 700, color: pn.col });
          const cols = 4, rows = 3, cw = pw / cols, ch = (h - 110) / rows;
          let bad = 0;
          pn.holes.forEach((hole, i) => {
            const hx = x0 + (i % cols) * cw + cw / 2, hy = 50 + Math.floor(i / cols) * ch + ch * 0.38;
            const got = hole.times.filter(tt => tt < T).length, energy = got * pn.e, done = T > 2.4;
            const ok = energy >= NEED;
            if (done && !ok) bad++;
            c.fillStyle = done ? (ok ? '#ffffff' : '#f6dcda') : '#f2e0ea';
            c.strokeStyle = done ? (ok ? '#1f7a4d' : '#b3261e') : '#c9a3b8'; c.lineWidth = done ? 3 : 1.5;
            c.beginPath(); c.arc(hx, hy, Math.min(cw, ch) * 0.26, 0, 7); c.fill(); c.stroke();
            hole.times.forEach(tt => { const f = (T - tt) / 0.35; if (f > 0 && f < 1) U.dot(c, hx + (Math.sin(tt * 99) * .5) * cw * 0.3, U.lerp(hy - ch * 0.5, hy, f), pn.r, pn.col); });
            const bw = cw * 0.6, by = hy + Math.min(cw, ch) * 0.26 + 10;
            c.fillStyle = '#e3e8ef'; c.fillRect(hx - bw / 2, by, bw, 14);
            c.fillStyle = ok ? '#2f9a63' : pn.col; c.fillRect(hx - bw / 2, by, Math.min(bw, bw * energy / (NEED * 1.6)), 14);
            c.fillStyle = '#b3541e'; c.fillRect(hx - bw / 2 + bw / 1.6 - 1.5, by - 4, 4, 22);
            if (done && !ok) U.txt(c, '✗', hx, hy + 7, { align: 'center', size: 20, w: 700, color: '#b3261e' });
          });
          if (T > 2.4) U.txt(c, bad ? `${bad} 個洞沒印開` : '全部印開 ✓', x0 + pw / 2, h - 18, { align: 'center', size: 19, w: 700, color: bad ? '#b3261e' : '#1f7a4d' });
          else U.txt(c, '曝光中…', x0 + pw / 2, h - 18, { align: 'center', size: 17, color: '#6a7888' });
          if (pi === 1 && T > 2.4) U.setMeter(el, 'l4-m', bad / 12 * 3, bad + ' 個', bad > 1 ? 'bad' : bad ? 'warn' : 'good');
        });
        c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(w / 2, 10); c.lineTo(w / 2, h - 10); c.stroke();
        // 產能估算：一般曝光量約 220 片/小時，曝光時間約佔 6 成，隨曝光量等比例拉長
        const wph = Math.round(220 / (0.4 + 0.6 * dose) / 5) * 5;
        U.setMeter(el, 'l4-du', 1, '300 片', 'good');
        U.setMeter(el, 'l4-eu', wph / 300, `${wph} 片`, dose > 2 ? 'bad' : dose > 1 ? 'warn' : '');
        const tpd = dose === 1 ? '一般曝光量：本來就比 DUV 慢約 3 成。' : `曝光量 ${dose} 倍：比一般慢 <b>${Math.round((1 - wph / 220) * 100)}%</b>。要維持產量，得多買約 <b>${Math.round((220 / wph - 1) * 100)}%</b> 的 EUV 機台（每台約 2 億美元）。`;
        const tp = U.$(el, '#l4-tpd'); if (tp.innerHTML !== tpd) tp.innerHTML = tpd;
        // 曝光結果停在畫面上，按「再曝光一次」或拉滑桿才重來
      });
    },
    notes: `這頁比較同樣的光能量，用 DUV 和用 EUV 會發生什麼事。

左邊是 DUV，右邊是 EUV，各有 12 個要印的小洞。每個洞下方的長條代表收到了多少光，超過橘線就印得開，變成綠框；不夠就失敗，變成紅框。

DUV 的光子能量小、數量多，像細霧一樣，每個洞收到的量都差不多，全部印開。EUV 的每顆光子能量大十幾倍，所以同樣的能量只有很少幾顆，像丟大水球。有的洞剛好被砸中好幾顆，有的洞運氣不好一顆都沒有，就印不開。按「再曝光一次」，每次失敗的位置都不一樣，這就是「隨機」缺陷。

解法是把 EUV 曝光量調高，印壞的洞會變少，但每片晶圓要照更久。右邊的長條是估算：DUV 浸潤式機台每小時大約能曝光 300 片晶圓；最新的 EUV 機台規格是每小時大約 220 片，這是用一般曝光量算的，關鍵層的曝光量通常更高，本來就比較慢。曝光量加倍，一片晶圓的曝光時間跟著變長，每小時只剩大約 140 片，慢了三成多；要維持同樣的產量，就得多買將近六成的機台，每台大約兩億美元。

這就是 EUV 在良率和產量之間最大的取捨：少印壞一點，還是多做幾片。數字是估算，實際會依圖層和機型不同；動畫把光子畫得很少，實際每個洞收到的是幾千顆，差異來自統計上的起伏，加上光阻化學本身的隨機性。

右邊最後一點是給量測的伏筆：這種缺陷怎麼抓？一片晶圓上百億個洞，壞的機率可能是百萬分之一以下，光學檢測看不到，CD-SEM 平常抽幾十個點也抓不到。要用電子束檢測大面積掃，或讓 CD-SEM 一次量上萬個洞，看分布最尾巴那幾個是不是快印不開了，第九章會再碰到這兩種工具。`
  }, F));

  /* 5. High-NA */
  A(Object.assign({
    id: 'litho5', part: 2, minutes: 3.0, short: 'EUV vs High-NA EUV',
    title: 'EUV vs High-NA EUV：畫得更細，但一次只拍半張', en: 'EUV (NA 0.33) vs High-NA (NA 0.55)',
    thesis: 'NA 是鏡頭收光的角度。High-NA 把它從 0.33 加大到 0.55，<b>單次最細從約 13–16 nm 變成約 8 nm</b>，最細的圖層不用再多重曝光（把圖案拆開、分兩次曝光）；代價是一次只拍半張、機台貴一倍。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('l5-m', ['一般 EUV（NA 0.33）', 'High-NA EUV（NA 0.55）', '最細的線：多重曝光 vs 一次'], 0)}</div>${U.figHTML('l5-cv', '左：鏡頭收光角度與印出的線　右：一次曝光的範圍', '')}</div>
      ${U.side({
        top: `<table class="t" style="font-size:17.5px"><thead><tr><th></th><th>一般 EUV</th><th>High-NA</th></tr></thead><tbody>
          <tr><td>鏡頭收光（NA）</td><td>0.33</td><td><b>0.55</b></td></tr>
          <tr><td>單次最細（半間距）</td><td>約 13–16 nm</td><td><b>約 8 nm</b></td></tr>
          <tr><td>最細的圖層</td><td>要多重曝光（圖案拆成兩張光罩）</td><td><b>一次搞定</b></td></tr>
          <tr><td>一次曝光範圍</td><td>整張 26×33 mm</td><td>半張 26×16.5 mm</td></tr>
          <tr><td>機台價格</td><td>約 2 億美元</td><td>約 4 億美元</td></tr>
          <tr><td>誰在用</td><td>各家主力</td><td>Intel：18A 部分圖層（2026 起出貨）、14A 關鍵層；SK hynix：下一代 DRAM</td></tr></tbody></table>`,
        points: ['多重曝光：線太密，要把圖案拆開、分兩次曝光才印得出來；步驟多、容易對不準', '半張曝光：大晶片要拼接，接縫要對準', '台積電到 2029 年都不打算用：多曝光幾次比較划算'],
        analogy: { icon: 'camera', t: '比喻', p: '換上更高倍的顯微鏡：看得更細，但視野變小，要拼好幾張才看得完。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#l5-cv'));
      let m = 0, mm = 0, p = 1;
      U.onSeg(el, 'l5-m', i => { m = i; p = U.reduced() ? 1 : 0; });
      ctx.raf((dt, t) => {
        p = Math.min(1, p + dt / 1.6);
        c.clearRect(0, 0, w, h);
        if (m === 2) {
          // 同樣要印間距 16 nm 的細線：一般 EUV 多重曝光（拆成兩張光罩、曝光兩次）；High-NA 一次
          const e = U.ease(p), half = w / 2;
          [[0, '一般 EUV：多重曝光（圖案拆兩張，分兩次曝光）'], [1, 'High-NA：一次就印出來']].forEach(([k, lab]) => {
            const x0 = k * half + 30, x1 = x0 + half - 60, y0 = 70, hh = h - 190;
            U.txt(c, lab, (x0 + x1) / 2, 34, { align: 'center', size: 17, w: 700, color: k ? '#1f7a4d' : '#b3541e' });
            c.fillStyle = '#eef2f6'; c.fillRect(x0, y0, x1 - x0, hh);
            const n = 12, sp = (x1 - x0) / n;
            for (let j = 0; j < n; j++) {
              const x = x0 + j * sp + sp * 0.25, first = j % 2 === 0;
              let show = k ? e : (first ? U.clamp(e * 2, 0, 1) : U.clamp(e * 2 - 1, 0, 1));
              if (show <= 0) continue;
              const off = (!k && !first) ? 3 : 0; // 第二次曝光稍微對偏
              c.fillStyle = k ? '#1f4fb5' : (first ? '#1f4fb5' : '#c77a12');
              c.globalAlpha = show; c.fillRect(x + off, y0 + 10, sp * 0.5, hh - 20); c.globalAlpha = 1;
            }
            if (!k) {
              U.tag(c, '藍：第 1 次　橘：第 2 次', (x0 + x1) / 2, y0 + hh + 26, { align: 'center', size: 15 });
              if (e > 0.9) U.tag(c, '第 2 次只要對偏一點，間距就不均勻', (x0 + x1) / 2, y0 + hh + 56, { align: 'center', size: 15, color: '#b3261e' });
            } else if (e > 0.9) U.tag(c, '步驟少一半，也不怕兩次對不準 ✓', (x0 + x1) / 2, y0 + hh + 26, { align: 'center', size: 15, color: '#1f7a4d' });
          });
          c.strokeStyle = '#e3e8ef'; c.beginPath(); c.moveTo(half, 20); c.lineTo(half, h - 20); c.stroke();
          return;
        }
        mm += (m - mm) * Math.min(1, dt * 5);
        const lx = w * 0.26, ly = h * 0.3;
        const lensW = U.lerp(120, 200, mm);
        c.fillStyle = '#dfe7f1'; c.beginPath(); c.ellipse(lx, ly, lensW / 2, 22, 0, 0, 7); c.fill(); c.strokeStyle = '#8a97a6'; c.stroke();
        U.tag(c, '最後一面投影鏡', lx - 40, ly - 32, { size: 14 });
        const fy = h * 0.72;
        c.fillStyle = 'rgba(176,79,201,.25)'; c.beginPath(); c.moveTo(lx - lensW / 2, ly); c.lineTo(lx + lensW / 2, ly); c.lineTo(lx, fy); c.closePath(); c.fill();
        U.txt(c, `收光角度 NA ${m ? '0.55（大）' : '0.33（小）'}`, lx, fy + 30, { align: 'center', size: 18, w: 700, color: '#b04fc9' });
        const lw = U.lerp(12, 7, mm), blur = U.lerp(0.45, 0.12, mm);
        for (let k = 0; k < 12; k++) { const x = lx - 90 + k * lw * 1.6; c.fillStyle = `rgba(31,79,181,${1 - blur})`; c.fillRect(x, fy + 44, lw * 0.8, 50); c.fillStyle = `rgba(31,79,181,${blur * .5})`; c.fillRect(x - 2, fy + 42, lw * 0.8 + 4, 54); }
        U.txt(c, m ? '單次最細約 8 nm：更細、更銳利' : '單次最細約 13–16 nm', lx, h - 12, { align: 'center', size: 16 });
        const fx = w * 0.56, fw = w * 0.38, fh = h * 0.62, top = h * 0.12;
        c.strokeStyle = '#9aa8b8'; c.setLineDash([5, 4]); c.strokeRect(fx, top, fw, fh); c.setLineDash([]);
        U.tag(c, '晶片需要的完整範圍（26 × 33 mm）', fx, top - 8, { size: 14 });
        const eh = fh * U.lerp(1, 0.5, mm);
        c.fillStyle = 'rgba(31,79,181,.18)'; c.fillRect(fx, top, fw, eh); c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.strokeRect(fx, top, fw, eh);
        U.txt(c, m ? '一次只曝光一半' : '一次曝光整個範圍', fx + fw / 2, top + eh / 2 + 6, { align: 'center', size: 18, w: 700, color: '#1f4fb5' });
        if (m) { c.fillStyle = 'rgba(179,84,30,.12)'; c.fillRect(fx, top + eh, fw, fh - eh); U.txt(c, '另一半要再曝光一次，接縫要對準', fx + fw / 2, top + eh + (fh - eh) / 2 + 6, { align: 'center', size: 16, color: '#b3541e', w: 600 }); }
        if (m) { U.txt(c, '為什麼只剩一半？光打到光罩上太斜，鏡面反射不了', fx + fw / 2, top + fh + 26, { align: 'center', size: 14, color: '#6a7888' }); U.txt(c, '→ 一個方向改縮小 8 倍；光罩大小不變，只照得到半張', fx + fw / 2, top + fh + 46, { align: 'center', size: 14, color: '#6a7888' }); } else U.txt(c, '各方向都縮小 4 倍', fx + fw / 2, top + fh + 30, { align: 'center', size: 14, color: '#6a7888' });
      });
    },
    notes: `這一頁仔細比較一般 EUV 和下一代的 High-NA EUV。

NA 可以理解成鏡頭收光的角度，也就是最後一面投影鏡張得多開。一般 EUV 的 NA 是 0.33，High-NA 加大到 0.55。收光角度越大，能畫的線就越細：一般 EUV 一次曝光，最細大約 13 到 16 奈米的半間距；High-NA 大約 8 奈米。

這代表什麼？切到第三個按鈕。2 奈米之後最細的幾層線，一般 EUV 一次畫不出來，只能用「多重曝光」：線排得太密時，相鄰兩條線會糊在一起，所以把圖案拆開，隔一條取一條分到兩張光罩，每張上的線就變鬆了，再分兩次曝光，藍的一次、橘的一次，合起來才是完整的圖案。步驟多了一倍，而且第二次只要對偏一點點，線和線的間距就不均勻。High-NA 一次就能印出來，步驟少、也不怕兩次對不準。多重曝光還有另一種做法，叫自對準多重圖案，SADP、SAQP：先印一組比較鬆的線，在線的兩側長一層側壁，再把原本的線拿掉，留下的側壁就是兩倍密的線；做兩次就是四倍，鰭就是這樣做出來的。

代價有兩個。第一，收光角度變大以後，光打到光罩上的角度也跟著變大，光罩的多層膜鏡面反射不了那麼斜的光。所以 ASML 把一個方向的縮小倍率從 4 倍改成 8 倍，讓光罩端的角度變小；可是光罩尺寸不變，一次就只能曝光半張，大晶片要分兩次曝光再拼起來，接縫要完美對準；每小時能做的晶圓也比較少。第二，機台大約四億美元，是一般 EUV 的兩倍。

所以各家選擇不同：Intel 很積極，2026 年 7 月已經用 High-NA 印 18A 的部分圖層，做出一部分 Panther Lake 處理器出貨；這些圖層用 High-NA 或一般 EUV 都能印，等於保留備案。真正用在關鍵圖層是 14A。記憶體廠 SK hynix 也在 2025 年裝了量產型的機台，準備做下一代 DRAM。台積電公開表示，到 2029 年的 A12、A13 都還不需要 High-NA。`
  }, F));

  /* 6. OPC：故意畫歪 */
  A(Object.assign({
    id: 'litho6', part: 2, minutes: 1.6, short: 'OPC：故意畫歪',
    title: 'OPC：光罩要故意畫歪，印出來才會是正的', en: 'Optical Proximity Correction',
    thesis: '光在小圖案的邊角會「暈開」，印出來會變圓、變短。所以<b>先在光罩上把圖形修正過</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('l6-m', ['光罩照原樣畫', '光罩經過 OPC 修正'], 0)}</div>${U.figHTML('l6-cv', '左：光罩上的圖形　右：晶圓上印出來的結果（虛線是目標）', '')}</div>
      ${U.side({
        points: ['轉角會變圓、線尾會縮短', '在光罩上加「耳朵」和「錘頭」來補償', '電腦要算數天，才畫得出一張光罩'],
        fact: { v: '數十億個', d: '一張先進光罩上要修正的圖形數量級，全靠電腦計算' },
        analogy: { icon: 'pen', t: '比喻', p: '在會暈開的紙上寫字：筆畫的轉角要先多描一點，乾了才會剛好方正。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#l6-cv'));
      const S = Math.floor(Math.min(w / 2 - 40, h - 60));
      // 在 100×100 的格子上模擬：光罩（0/1）→ 光學模糊 → 超過門檻的地方光阻被曝開
      const N = 100, u = N / 20, BL = 1.25 * u, TH = 0.5;
      const tgt = new Uint8Array(N * N);
      const rect = (m, x, y, ww, hh) => { for (let j = Math.round(y * u); j < Math.round((y + hh) * u); j++) for (let i = Math.round(x * u); i < Math.round((x + ww) * u); i++) m[j * N + i] = 1; };
      rect(tgt, 4, 4, 12, 3); rect(tgt, 8.5, 7, 3, 9); // T 字形目標
      const cv = document.createElement('canvas'); cv.width = cv.height = N; const cc = cv.getContext('2d');
      const cb = document.createElement('canvas'); cb.width = cb.height = N; const cbc = cb.getContext('2d');
      const expose = m => { // 回傳每一格的光強（0–1）
        const id = cc.createImageData(N, N); for (let k = 0; k < N * N; k++) { const v = m[k] ? 255 : 0; id.data[k * 4] = id.data[k * 4 + 1] = id.data[k * 4 + 2] = v; id.data[k * 4 + 3] = 255; }
        cc.putImageData(id, 0, 0); cbc.fillStyle = '#000'; cbc.fillRect(0, 0, N, N); cbc.filter = `blur(${BL}px)`; cbc.drawImage(cv, 0, 0); cbc.filter = 'none';
        const d = cbc.getImageData(0, 0, N, N).data, I = new Float32Array(N * N); for (let k = 0; k < N * N; k++) I[k] = d[k * 4] / 255; return I;
      };
      const printOf = m => { const I = expose(m), p = new Uint8Array(N * N); for (let k = 0; k < N * N; k++) p[k] = I[k] > TH ? 1 : 0; return p; };
      const errOf = p => { let e = 0, t = 0; for (let k = 0; k < N * N; k++) { if (p[k] !== tgt[k]) e++; if (tgt[k]) t++; } return e / t; };
      // OPC：反覆「模擬曝光 → 比對目標 → 在印不夠的地方補、印太多的地方削」
      const opc = Uint8Array.from(tgt);
      const nb = k => [k - 1, k + 1, k - N, k + N, k - N - 1, k - N + 1, k + N - 1, k + N + 1];
      for (let it = 0; it < 30; it++) {
        const I = expose(opc), add = [], del = [];
        for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) {
          const k = j * N + i, short = n => tgt[n] && I[n] < TH;
          if (!opc[k]) { if (nb(k).some(short)) add.push(k); }        // 旁邊的目標印不夠：光罩往外長一格
          else if (!tgt[k] && I[k] > TH && !nb(k).some(short)) del.push(k); // 目標外被印出來：削掉
        }
        if (!add.length && !del.length) break;
        add.forEach(k => opc[k] = 1); del.forEach(k => opc[k] = 0);
      }
      const R = { 0: { m: tgt, p: printOf(tgt) }, 1: { m: opc, p: printOf(opc) } };
      R[0].e = errOf(R[0].p); R[1].e = errOf(R[1].p);
      const draw = (m, x0, y0, on, off) => { const q = S / N; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { c.fillStyle = m[j * N + i] ? on : off; c.fillRect(x0 + i * q, y0 + j * q, q + 0.6, q + 0.6); } };
      let mode = 0;
      const render = () => {
        c.clearRect(0, 0, w, h);
        const x1 = 20, x2 = w - S - 20, y0 = 34, r = R[mode];
        draw(r.m, x1, y0, '#ffffff', '#2b3440');
        U.tag(c, mode ? '修正後的光罩（電腦算出來的）' : '原樣光罩', x1 + 8, y0 + 20, { size: 14 });
        draw(r.p, x2, y0, U.MAT.pr, '#f2f5f8');
        c.strokeStyle = '#b3541e'; c.setLineDash([6, 4]); c.lineWidth = 2; const q = S / N;
        c.strokeRect(x2 + 4 * u * q, y0 + 4 * u * q, 12 * u * q, 3 * u * q); c.strokeRect(x2 + 8.5 * u * q, y0 + 7 * u * q, 3 * u * q, 9 * u * q); c.setLineDash([]);
        U.tag(c, '晶圓上印出的光阻（虛線是目標）', x2 + 8, y0 + 20, { size: 14 });
        U.arrow(c, x1 + S + 10, y0 + S / 2, x2 - 10, y0 + S / 2, '#7a50dc', 3);
        U.txt(c, '曝光', (x1 + S + x2) / 2, y0 + S / 2 - 12, { align: 'center', size: 15, color: '#7a50dc' });
        const ok = mode === 1;
        U.txt(c, ok ? `和目標差 ${Math.round(r.e * 100)}%（原樣是 ${Math.round(R[0].e * 100)}%）✓ 貼近很多` : `和目標差 ${Math.round(r.e * 100)}%　✗ 轉角變圓、尾巴變短`, x2 + S / 2, y0 + S + 22, { align: 'center', size: 18, w: 700, color: ok ? '#1f7a4d' : '#b3261e' });
      };
      U.onSeg(el, 'l6-m', i => { mode = i; render(); });
    },
    notes: `微影最後兩頁看計算微影：先看傳統的 OPC，光學鄰近修正。

當圖案小到接近光的粗細時，光在邊角會暈開。左邊是一個 T 字形的光罩，照原樣畫，右邊粉紅色是晶圓上印出來的光阻：轉角變圓、底部的尾巴變短，和橘色虛線的目標差了一截，畫面下方會顯示差多少。

切換到修正後的光罩。這張光罩是電腦算出來的：先模擬曝光，看哪裡印不夠、哪裡印太多，就在光罩上補一點、削一點，反覆十幾次。結果轉角多了像耳朵的小方塊，線尾多了錘頭，光罩看起來怪怪的，但印出來反而貼近目標。

一張先進光罩上有數十億個圖形要這樣修正，完全靠電腦計算，需要跑好幾天。這一行叫做計算微影。`
  }, F));
  /* 6b. 曲線光罩與 GPU 運算微影 */
  function cmaskDraw(c, w, h, m, e, t) {
    const PR = U.MAT.pr;
    if (m === 2) {
      // 運算量：CPU 伺服器 vs GPU
      const L = 240, R = w - 130, rows = [['CPU 伺服器（約 4 萬台）', 1, '約 2 週', '#9aa8b8'], ['GPU 系統（約 350 台）', 1 / 40, '一個晚上', '#1f7a4d']];
      U.txt(c, '算完一整套光罩的修正，要花多久？（NVIDIA 宣稱）', w / 2, 40, { align: 'center', size: 17, w: 700 });
      rows.forEach(([lab, f, tl, col], k) => {
        const y = 110 + k * 120, bw = (R - L) * f * Math.min(1, e * (k ? 40 : 1));
        U.txt(c, lab, L - 12, y + 26, { align: 'right', size: 16, w: 600 });
        c.fillStyle = '#eef2f6'; c.fillRect(L, y, R - L, 40);
        c.fillStyle = col; c.fillRect(L, y, Math.max(6, bw), 40);
        if (e > 0.95) U.txt(c, tl, L + Math.max(6, bw) + 12, y + 27, { size: 18, w: 700, color: col });
      });
      U.txt(c, '曲線光罩的計算量大很多：沒有 GPU，根本算不完', w / 2, h - 40, { align: 'center', size: 16, color: '#3e4b5b' });
      return;
    }
    const cx1 = w * 0.25, cx2 = w * 0.75, cy = h * 0.48, S = Math.min(w * 0.16, h * 0.26);
    U.txt(c, '光罩上的圖案', cx1, 36, { align: 'center', size: 17, w: 700 });
    U.txt(c, '晶圓上印出來的（虛線是目標）', cx2, 36, { align: 'center', size: 17, w: 700 });
    c.fillStyle = '#1b2430'; c.fillRect(cx1 - S * 1.6, cy - S * 1.6, S * 3.2, S * 3.2);
    c.fillStyle = '#fff';
    const a = U.lerp(0.2, 1, e);
    if (m === 0) {
      // 傳統：只能用長方形修正（加粗、四角加小方塊）
      c.fillRect(cx1 - S * 0.55, cy - S * 0.55, S * 1.1, S * 1.1);
      if (e > 0.3) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => c.fillRect(cx1 + sx * S * 0.55 - S * 0.14 + sx * S * 0.07, cy + sy * S * 0.55 - S * 0.14 + sy * S * 0.07, S * 0.28, S * 0.28));
      U.tag(c, '只能畫直角：加粗＋四角小方塊', cx1, cy + S * 1.6 + 26, { align: 'center', size: 14 });
    } else {
      // 曲線光罩：電腦反推出來的平滑形狀，外圍還有輔助小圖形
      c.beginPath();
      for (let k = 0; k <= 64; k++) { const th = k / 64 * Math.PI * 2, r = S * (0.62 + 0.14 * Math.pow(Math.abs(Math.cos(2 * th)), 3)); const x = cx1 + Math.cos(th) * r, y = cy + Math.sin(th) * r; k ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.fill();
      if (e > 0.4) [0, 1, 2, 3].forEach(k => { const th = k * Math.PI / 2; c.beginPath(); c.ellipse(cx1 + Math.cos(th) * S * 1.25, cy + Math.sin(th) * S * 1.25, S * (k % 2 ? 0.34 : 0.1), S * (k % 2 ? 0.1 : 0.34), 0, 0, 7); c.fill(); });
      U.tag(c, '電腦反推的曲線形狀＋外圍輔助小圖形', cx1, cy + S * 1.6 + 26, { align: 'center', size: 14 });
    }
    // 印出來的結果：用「角的圓度」與「大小」示意
    const tgt = S * 0.7;
    c.setLineDash([6, 4]); c.strokeStyle = '#1b2430'; c.lineWidth = 2; c.strokeRect(cx2 - tgt, cy - tgt, tgt * 2, tgt * 2); c.setLineDash([]);
    const shrink = m === 0 ? 0.86 : 0.97, round = m === 0 ? 0.55 : 0.28, sz = tgt * U.lerp(0.6, shrink, e);
    c.fillStyle = 'rgba(217,120,170,.75)'; U.rrect(c, cx2 - sz, cy - sz, sz * 2, sz * 2, sz * round); c.fill();
    const err = m === 0 ? 14 : 4;
    if (e > 0.9) U.tag(c, `和目標差約 ${err}%（示意）`, cx2, cy + S * 1.6 + 26, { align: 'center', size: 15, color: m === 0 ? '#a8660a' : '#1f7a4d' });
  }
  A(Object.assign({
    id: 'cmask', part: 2, minutes: 2.5, short: '曲線光罩與 GPU 運算微影', badge: '2 nm 世代新技術',
    title: '曲線光罩：電腦算出最好的形狀，GPU 加速', en: 'Curvilinear Mask · Computational Lithography',
    thesis: '上一頁的 OPC 只能用直角修正。新做法讓電腦<b>直接反推出任意曲線的光罩</b>，印得更準；代價是計算量暴增，所以改用 <b>GPU</b> 來算。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('cm-m', ['傳統 OPC：只能畫直角', '曲線光罩：任意形狀', '計算量：CPU vs GPU'], 0)}</div>${U.figHTML('cm-cv', '一個方形的接觸孔（示意）', '')}</div>
      ${U.side({
        top: `<div class="card newcard"><h4>新技術：解決什麼問題？</h4><p>線越細，光的繞射越嚴重，只用直角修正已經不夠準。曲線光罩印得更接近設計，製程的容許誤差也更大。</p><h4>為什麼現在才做得到？</h4><p>以前寫光罩的機器只能畫長方形；新的「多電子束」寫光罩機能畫曲線。再加上 GPU 把計算從兩週縮到一個晚上。</p></div>`,
        points: ['台積電 2024 年起在生產中導入 GPU 運算微影', '也開始用 AI 幫忙產生光罩圖案', '晶片製造也開始靠 AI 晶片來加速'],
        analogy: { icon: 'pen', t: '比喻', p: '以前只能用直尺畫光罩，現在可以用曲線板；但每條曲線都要精算，所以得請超級電腦幫忙。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#cm-cv'));
      let m = 0, p = 0;
      U.onSeg(el, 'cm-m', i => { m = i; p = U.reduced() ? 1 : 0; });
      ctx.raf((dt, t) => { p = Math.min(1, p + dt / 1.6); c.clearRect(0, 0, w, h); cmaskDraw(c, w, h, m, U.ease(p), t); });
    },
    notes: `這一頁是 2 奈米世代的新技術：曲線光罩和 GPU 運算微影，接續上一頁的 OPC。

上一頁的 OPC，是把光罩上的圖案加粗、在角落加小方塊，補償光的繞射。但它有個限制：只能用直角和長方形。原因很實際：以前寫光罩的機器，只能一個一個畫長方形。

切到第二個按鈕：新的做法叫逆向微影，讓電腦從「想印出來的形狀」反推回去，算出最好的光罩，結果常常是一堆平滑的曲線，外圍還有一些輔助的小圖形。印出來的結果更接近設計，製程的容許誤差也更大。能做出來，是因為新的「多電子束」寫光罩機，可以同時用幾十萬道電子束畫出曲線。

代價是計算量暴增。切到第三個按鈕：一整套光罩的修正，用傳統 CPU 伺服器要算大約兩週。NVIDIA 的 cuLitho 用 GPU 來算，宣稱約三百五十台 GPU 系統就能取代四萬台 CPU 伺服器（2023 年剛發表時說五百台，2024 年導入量產時更新成三百五十台），時間縮到一個晚上。台積電 2024 年起在生產中導入，也開始用 AI 幫忙產生光罩圖案。這是很有趣的循環：AI 晶片反過來幫忙製造更先進的晶片。`
  }, F));
})();
