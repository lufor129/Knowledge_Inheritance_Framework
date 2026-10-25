/* 第二部分 ④ 摻雜與磊晶（接在磊晶頁之後）：調整矽的導電性 */
(function () {
  const A = Deck.add.bind(Deck);
  const F = { chap: 4, eyebrow: '第二部分 · ④ 摻雜與磊晶' };

  /* 1. 為什麼摻雜＋離子佈植 */
  A(Object.assign({
    id: 'dope1', part: 2, minutes: 2.8, short: '摻雜：把雜質打進矽',
    title: '摻雜：把極少量的「雜質」打進矽裡，矽就會導電', en: 'Doping & Ion Implantation',
    thesis: '源極和汲極要能導電，但純矽幾乎不導電：摻一點磷變 n 型、摻一點硼變 p 型。傳統做法是用「離子佈植」像開槍一樣打進去，<b>再加熱讓雜質歸位</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('p1-e', ['磷 → n 型（多電子）', '硼 → p 型（多電洞）'], 0)}</div>
        ${U.figHTML('p1-cv', '離子佈植（剖面）', '')}
        <div class="controls">${U.range('p1-k', '發射力道', 1, 10, 1, 5, '')}<button class="btn primary" id="p1-an" type="button">🔥 加熱歸位（退火）</button></div></div>
      ${U.side({
        top: `<div class="card key"><h4>還記得[[頁:parts]]的原子放大鏡嗎？</h4><p style="font-size:18px;margin:2px 0">磷多一個電子 → n 型；硼少一個電子（留下電洞）→ p 型。只要極少量，導電性就差很多。</p><button class="btn" type="button" data-go="parts" style="margin-top:6px">↩ 回看原子放大鏡</button></div>`,
        points: ['力道越大，打得越深', '光阻擋住的地方打不進去', '打完要加熱（退火），雜質才會歸位、開始導電', '今天仍用在井區、接觸區等很多步驟'],
        extra: `<div class="card"><h4>井區、接觸區是什麼？</h4><p><b>井區</b>：電晶體的地基。一大片、打得深、濃度低；n 型電晶體蓋在 p 井上，p 型蓋在 n 井上，同一片晶圓才放得下兩種。</p><p><b>接觸區</b>：金屬接上矽的接點。一小塊、打得淺、濃度很高，電流才容易從金屬流進矽。</p></div>`,
        analogy: { icon: 'bullet', t: '比喻', p: '像對一塊果凍開槍：子彈力道越大，卡得越深；打得越多，那一區顏色越濃。' }
      })}</div>`,
    init(el, ctx) {
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      const { c, w, h } = U.canvas(U.$(el, '#p1-cv'));
      let e = 0, k = 5, hits = [], an = 0; // an：退火進度（0＝剛打完、亂七八糟；1＝歸位、開始導電）
      const reset = () => { hits = []; an = 0; };
      U.onSeg(el, 'p1-e', i => { e = i; reset(); });
      U.bind(el, 'p1-k', v => { k = v; reset(); }, v => ['', '很輕', '輕', '輕', '中', '中', '中', '強', '強', '很強', '最強'][v]);
      U.$(el, '#p1-an').onclick = () => { if (!an) an = 0.001; };
      const flying = [];
      let acc = 0;
      ctx.raf((dt, t) => {
        const col = e ? U.MAT.p : U.MAT.n;
        c.clearRect(0, 0, w, h);
        const top = h * 0.3, L = 30, R = w - 30, W = w * 0.36, cx = w / 2, bot = h - 20;
        U.box(c, 'si', L, top, R - L, bot - top);
        U.box(c, 'pr', L, top - 26, cx - W / 2 - L, 26); U.box(c, 'pr', cx + W / 2, top - 26, R - cx - W / 2, 26);
        U.tag(c, '光阻擋住的地方打不進去', L + 6, top - 36, { size: 14 });
        const depth = 20 + k * (bot - top - 70) / 10;
        if (an) an = Math.min(1, an + dt * 0.8);
        if (!an && hits.length < 260) { acc += dt * 30; while (acc > 1) { acc--; flying.push({ x: U.rand(L + 20, R - 20), y: 20 }); } }
        for (let q = flying.length - 1; q >= 0; q--) {
          const f = flying[q]; f.y += dt * 700;
          const blocked = (f.x < cx - W / 2 || f.x > cx + W / 2) && f.y > top - 26;
          const stopY = Math.min(bot - 10, top + depth + (Math.random() - .5) * depth * 0.6);
          if (blocked) { flying.splice(q, 1); continue; }
          if (f.y > stopY) { hits.push([U.clamp(f.x + U.rand(-10, 10), cx - W / 2 + 4, cx + W / 2 - 4), f.y]); flying.splice(q, 1); continue; }
          U.arrow(c, f.x, f.y - 14, f.x, f.y, col, 2);
        }
        if (an) { // 退火：雜質歸位，那一區變成導電的摻雜區
          const g = c.createLinearGradient(0, top, 0, Math.min(bot, top + depth * 1.5));
          g.addColorStop(0, col + '22'); g.addColorStop(0.65, col + 'aa'); g.addColorStop(1, col + '00');
          c.globalAlpha = an; c.fillStyle = g; c.fillRect(cx - W / 2, top, W, Math.min(bot, top + depth * 1.5) - top); c.globalAlpha = 1;
          c.fillStyle = `rgba(217,80,40,${0.18 * Math.sin(an * Math.PI)})`; c.fillRect(L, top, R - L, bot - top);
        }
        hits.forEach(([x, y]) => { const gx = Math.round(x / 14) * 14, gy = Math.round(y / 14) * 14; U.dot(c, U.lerp(x, gx, an), U.lerp(y, gy, an), 5, col); });
        c.setLineDash([5, 4]); c.strokeStyle = '#b3541e'; c.beginPath(); c.moveTo(cx - W / 2, top + depth); c.lineTo(cx + W / 2, top + depth); c.stroke(); c.setLineDash([]);
        U.tag(c, '平均深度', cx + W / 2 + 8, top + depth + 5, { size: 14, color: '#b3541e' });
        U.tag(c, an >= 1 ? '加熱後：雜質歸位，這一區開始導電 ✓' : hits.length >= 260 ? '打完了：雜質亂七八糟卡在裡面，還不太導電 → 按「加熱歸位」' : '離子打進去中…', w / 2, h - 4, { align: 'center', size: 15, color: an >= 1 ? '#1f7a4d' : '#3e4b5b' });
      });
    },
    notes: `進入第四章：摻雜與磊晶，先講摻雜、再講磊晶。先問一個問題：電晶體的源極和汲極要能導電，電流才進得去、出得來，可是純的矽幾乎不導電，怎麼辦？

要讓它導電，就要摻入極少量的雜質，這叫摻雜。

原理我們在[[頁:parts]]的原子放大鏡看過了：磷多一個電子，就是 n 型；硼少一個電子，留下電洞，就是 p 型。只要極少量的雜質，導電性就差很多。右上角的按鈕可以跳回去複習。

怎麼把雜質放進去？用離子佈植，把雜質變成離子，用電場加速，像開槍一樣打進晶圓。光阻擋住的地方打不進去。拖動力道滑桿，力道越大，打得越深。平面電晶體時代的源極和汲極，就是這樣做出來的。打完之後，雜質會卡在亂七八糟的位置，晶格也被撞壞，這時還不太導電。按「加熱歸位」，極短暫地加熱，讓原子排回格子裡、雜質開始導電，這一步叫退火。

離子佈植今天仍然天天在用：井區、防止漏電的區域、接觸點底下，都還是靠打的。右邊那張小卡解釋兩個名詞。井區是電晶體的地基：一顆晶片同時要有 n 型和 p 型電晶體，n 型要蓋在 p 型的底上，p 型要蓋在 n 型的底上，可是一片晶圓只有一種底色，所以先用離子佈植打出一大片 p 井和 n 井，各自當地基，也把兩種電晶體隔開。井打得深、濃度低。接觸區則是金屬導線接上矽的地方：金屬直接貼在普通的矽上，接面有一道能障，電流不好過；在接點底下打入很高濃度的雜質，能障變得很薄，電子直接穿過去，電阻就降下來。接觸區打得淺、濃度很高。一個是大片的地基，一個是小小的接點，都還是靠打的。但源極汲極這一塊，到了鰭式和環繞式遇到困難：鰭和奈米片又高又密，離子從上面打下來會被擋住，還會把很薄的結構打壞。那怎麼辦？要先認識另一個工具：磊晶。`
  }, F));

  /* 3. 3D 結構的摻雜 */
  A(Object.assign({
    id: 'dope3', part: 2, minutes: 3, short: '選擇性磊晶長源汲極',
    title: '源汲極的新做法：選擇性磊晶，邊長邊摻', en: 'Selective Epitaxy · In-situ Doping',
    thesis: '到了 3D 結構，源汲極這一塊用離子打，<b>打不均勻、還會打壞</b>。解法是用上一頁的磊晶：<b>只在露出的矽上</b>長出源汲極，而且<b>長的時候就把雜質混進去</b>。三個分頁依序看。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('p3-m', ['① 為什麼用打的不好', '② 選擇性：只長在矽上', '③ 邊長邊摻'], 0)}</div>${U.figHTML('p3-cv', '三根鰭（剖面）', '')}</div>
      ${U.side({
        top: `<div class="card key"><h4 id="p3-h"></h4><p id="p3-p" style="font-size:17px"></p></div>`,
        meters: [['p3-a', '摻雜均勻'], ['p3-b', '結構損傷']],
        extra: '<button class="btn" type="button" data-go="depo3">↩ 回看磊晶頁</button>',
        analogy: { icon: 'bread', t: '比喻', p: '與其做好麵包再打針灌餡（容易破），不如揉麵時就把餡料包進去。' }
      })}</div>`,
    init(el, ctx) {
      U.$$(el, "[data-go]").forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      const { c, w, h } = U.canvas(U.$(el, '#p3-cv'));
      let m = 0, g = 0;
      const TX = [
        ['為什麼用打的不好？', '離子要斜著打，才打得到鰭的側面。可是鰭又高又密，隔壁的鰭會擋住一大片（陰影區），左右兩側摻得不一樣；鰭只有幾奈米寬、奈米片只有幾奈米厚，離子一撞，原子排列就亂掉，加熱也很難完全修好。'],
        ['「選擇性」是怎麼做到的？', '矽上原子直接接著底下的格子排（有「空手」可牽），馬上就長；絕緣層上要先聚成小島，起步慢很多。同時混一點氯化氫：它兩邊都吃，但矽上「長得比吃得快」，絕緣層上剛冒頭的小島「吃得比長得快」，所以只有矽上長得起來。'],
        ['邊長邊摻', '長的時候，把含磷或含硼的氣體一起混進去，長出來的源汲極本身就已經摻好。長太短接觸不好，長太長會碰到隔壁的電晶體。pFET 用矽鍺，還能順便擠緊通道，讓電洞跑更快。']
      ];
      U.onSeg(el, 'p3-m', i => { m = i; g = 0; if (i === 1) selReset(); U.$(el, '#p3-h').textContent = TX[i][0]; U.$(el, '#p3-p').textContent = TX[i][1]; const ft = U.$(el, '#p3-cv').closest('.fig').querySelector('.fig-title span'); if (ft) ft.textContent = i === 1 ? '放大看表面（示意）：矽和氯化氫同時進來，一邊長、一邊吃' : '三根鰭（剖面）'; });
      ctx.raf((dt, t) => {
        g = Math.min(1, g + dt * 0.35);
        c.clearRect(0, 0, w, h);
        const base = h * 0.8, fw = 50, fh = h * 0.45, xs = [w * 0.28, w * 0.5, w * 0.72];
        if (m === 1) { selZoom(c, w, h, t, dt); U.setMeter(el, 'p3-a', .95, '均勻', 'good'); U.setMeter(el, 'p3-b', .05, '幾乎沒有', 'good'); return; }
        U.box(c, 'si', 30, base, w - 60, h - base - 20);
        U.box(c, 'ox', 30, base - 40, w - 60, 40);
        xs.forEach(x => U.box(c, 'si', x - fw / 2, base - fh, fw, fh));
        if (m === 0) {
          // 斜射的離子：被前一根鰭擋住，形成陰影區
          const tilt = 0.55, sh = (fh - 40) * tilt; // 陰影長度
          xs.forEach((x, i) => {
            const left = x - fw / 2;
            // 打得到的：鰭頂＋左側上半部；右側在陰影裡
            c.fillStyle = 'rgba(91,143,217,.85)';
            c.fillRect(left, base - fh, fw, 12 * g);
            c.fillRect(left, base - fh, 9 * g, (fh - 40) * (i === 0 ? 1 : 0.4) * g);
            if (i > 0) { c.fillStyle = 'rgba(23,32,43,.12)'; c.beginPath(); c.moveTo(xs[i - 1] + fw / 2, base - fh); c.lineTo(xs[i - 1] + fw / 2 + (fh - 40) * tilt, base - 40); c.lineTo(xs[i - 1] + fw / 2, base - 40); c.closePath(); c.fill(); }
            for (let k = 0; k < 6; k++) U.txt(c, '✕', left + 8 + (k % 3) * 14, base - fh + 34 + Math.floor(k / 3) * 16, { size: 12, color: '#b3261e' });
          });
          for (let k = 0; k < 9; k++) { const f = (t * 0.6 + k / 9) % 1, x0 = 60 + k * (w - 120) / 8, y = 20 + f * (base - fh - 20); const x = x0 - (base - fh) * tilt * 0.3 + y * tilt * 0.6; U.arrow(c, x - 6, y - 10, x, y, U.MAT.n, 1.8); }
          U.tag(c, '灰色三角：被前一根鰭擋住的陰影區，打不到', xs[1] + 30, base - 54, { size: 13 });
          U.tag(c, '紅叉：被打壞的晶格', xs[2] + 40, base - fh + 40, { size: 13, color: '#b3261e' });
          U.tag(c, '離子要斜著打才打得到側面，可是會被隔壁擋住', w / 2, 24, { align: 'center', size: 15 });
          U.setMeter(el, 'p3-a', .35, '不均勻', 'bad'); U.setMeter(el, 'p3-b', .7, '明顯', 'bad');
        } else {
          xs.forEach(x => {
            c.fillStyle = U.MAT.n;
            const r = 42 * g;
            c.beginPath(); c.moveTo(x, base - fh - r * 0.3); c.lineTo(x + fw / 2 + r, base - fh * 0.55); c.lineTo(x, base - 40 + 0); c.lineTo(x - fw / 2 - r, base - fh * 0.55); c.closePath(); c.fill();
            U.box(c, 'si', x - fw / 2, base - fh, fw, fh, { a: .35 });
            for (let k = 0; k < 5; k++) { const a = t * 2 + k * 1.3; U.dot(c, x + Math.cos(a) * (fw / 2 + r * 0.6), base - fh * 0.55 + Math.sin(a) * r * 0.5, 2.6, '#d9765b'); }
          });
          for (let k = 0; k < 14; k++) { const f = (t * 0.5 + k / 14) % 1; U.dot(c, 50 + ((k * 61) % (w - 100)), 20 + f * (base - fh - 40), 3, k % 3 ? '#a9bcd0' : '#d9765b'); }
          U.tag(c, '氣體裡同時有矽（灰）和磷／硼（紅）：一邊長、一邊摻', w / 2, 24, { align: 'center', size: 15 });
          U.tag(c, '黃色絕緣層上一顆都不長', w - 40, base - 52, { align: 'right', size: 13, color: '#1f7a4d' });
          if (g > .6) U.tag(c, 'pFET 用矽鍺：擠緊通道，電洞跑更快', w / 2, h - 10, { align: 'center', size: 14, color: '#1f7a4d' });
          U.setMeter(el, 'p3-a', .95, '均勻', 'good'); U.setMeter(el, 'p3-b', .05, '幾乎沒有', 'good');
        }
      });
      // 分頁②：放大看矽表面和絕緣層表面。矽（灰）和氯化氫（綠）同時落下：一邊長、一邊吃
      const Z = {};
      const selReset = () => { Z.h = [Array(9).fill(0), Array(9).fill(0)]; Z.parts = []; Z.fx = []; Z.grow = [0, 0]; Z.eat = [0, 0]; Z.acc = [0, 0, 0, 0]; Z.hold = 0; };
      selReset();
      function selZoom(c, w, h, t, dt) {
        const half = w / 2, base = h * 0.66, n = 9, R8 = 8, STEP = 16, MAXL = 6;
        const geo = k => { const L = 30 + k * half, W = half - 80; return { L, W, sp: W / n }; };
        const colX = (k, i) => { const g = geo(k); return g.L + (i + .5) * g.sp + (k ? ((i * 7 + Z.h[1][i] * 5) % 7) - 3 : 0); };
        const topY = (k, i) => base - R8 - (Z.h[k][i] - 1) * STEP; // 最上面那顆原子的中心
        dt = Math.min(dt, 0.05);
        if (Z.hold) { Z.hold += dt; if (Z.hold > 2.2) selReset(); }
        else {
          // 生成：每邊每秒約 4.5 顆矽、2 個氯化氫
          for (let k = 0; k < 2; k++) {
            Z.acc[k] += dt * 4.5; Z.acc[k + 2] += dt * 2;
            while (Z.acc[k] > 1) { Z.acc[k]--; const hs = Z.h[k].map((v, i) => v + Z.parts.filter(P => P.k === k && P.kind === 'si' && P.i === i).length), mn = Math.min(...hs), lows = hs.map((v, i) => [v, i]).filter(([v]) => v === mn).map(([, i]) => i); // 矽上一層一層長（先補最低的位置）
              Z.parts.push({ k, kind: 'si', i: k ? Math.floor(Math.random() * n) : lows[Math.floor(Math.random() * lows.length)], y: 70 }); }
            while (Z.acc[k + 2] > 1) { Z.acc[k + 2]--; const isl = Z.h[1].map((v, i) => [v, i]).filter(([v]) => v > 0).map(([, i]) => i); // 氯化氫不挑地方，絕緣層上那顆剛好打在小島上
              Z.parts.push({ k, kind: 'hcl', i: k && isl.length && Math.random() < .95 ? isl[Math.floor(Math.random() * isl.length)] : Math.floor(Math.random() * n), y: 70 }); }
          }
        }
        // 移動與落地
        for (let q = Z.parts.length - 1; q >= 0; q--) {
          const P = Z.parts[q]; P.y += dt * 260;
          const hh = Z.h[P.k][P.i], land = P.kind === 'si' ? base - R8 - hh * STEP : (hh ? topY(P.k, P.i) - 14 : base - 10);
          if (P.y < land) continue;
          Z.parts.splice(q, 1);
          const x = colX(P.k, P.i);
          if (P.kind === 'si') {
            if (P.k === 0 && hh < MAXL) { Z.h[0][P.i]++; Z.grow[0]++; }
            else if (P.k === 1 && Math.random() < (hh ? .45 : .25) && hh < 3) { Z.h[1][P.i]++; Z.grow[1]++; } // 絕緣層上不容易黏，已經有小島的地方比較容易
            else Z.fx.push({ x, y: land, a: 0, kind: 'off' });
          } else if (hh) { Z.fx.push({ x, y: topY(P.k, P.i), a: 0, kind: 'eat' }); Z.h[P.k][P.i]--; Z.eat[P.k]++; }
          else Z.fx.push({ x, y: land, a: 0, kind: 'hoff' });
        }
        if (!Z.hold && Math.min(...Z.h[0]) >= MAXL) Z.hold = 0.001;
        // 畫
        U.dot(c, w / 2 - 210, 56, 7, '#a9bcd0'); U.txt(c, '矽原子（氣體帶來）', w / 2 - 198, 61, { size: 14, color: '#17202b' });
        U.dot(c, w / 2 + 10, 56, 6, '#2f9a63'); U.dot(c, w / 2 + 17, 52, 3, '#fff'); U.txt(c, '氯化氫（會把表面原子吃掉）', w / 2 + 24, 61, { size: 14, color: '#17202b' });
        [[0, '露出的矽表面', U.MAT.si], [1, '絕緣層表面', U.MAT.ox]].forEach(([k, name, col]) => {
          const { L, W } = geo(k);
          U.txt(c, name, L + W / 2, 26, { align: 'center', size: 17, w: 700, color: k ? '#a8660a' : '#1f4fb5' });
          c.fillStyle = col; c.fillRect(L, base, W, h - base - 30);
          for (let i = 0; i < n; i++) {
            const x = colX(k, i);
            for (let l = 0; l < Z.h[k][i]; l++) { const y = base - R8 - l * STEP; U.dot(c, x, y, R8, '#a9bcd0'); c.strokeStyle = '#17202b'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, R8, 0, 7); c.stroke(); }
            if (!k) { const y0 = Z.h[0][i] ? topY(0, i) - R8 : base; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 - 8); c.stroke(); }
          }
          const net = Z.grow[k] - Z.eat[k];
          U.txt(c, k ? '剛冒頭的小島被吃得比長得快 → 長不起來' : '長得比吃得快 → 一層一層往上長', L + W / 2, base + 30, { align: 'center', size: 14, w: 700, color: k ? '#b3261e' : '#1f7a4d' });
          U.txt(c, `長上去 ${Z.grow[k]}　被吃掉 ${Z.eat[k]}　淨 ${net >= 0 ? '+' : ''}${net}`, L + W / 2, base + 54, { align: 'center', size: 14, color: '#17202b' });
        });
        Z.parts.forEach(P => { const x = colX(P.k, P.i); if (P.kind === 'si') U.dot(c, x, P.y, R8, '#a9bcd0'); else { U.dot(c, x, P.y, 6, '#2f9a63'); U.dot(c, x + 7, P.y - 4, 3, '#fff'); } });
        for (let q = Z.fx.length - 1; q >= 0; q--) {
          const F = Z.fx[q]; F.a += dt; if (F.a > .8) { Z.fx.splice(q, 1); continue; }
          const al = 1 - F.a / .8, y = F.y - F.a * 160;
          c.globalAlpha = al;
          if (F.kind === 'eat') { c.strokeStyle = '#b3261e'; c.lineWidth = 2; c.beginPath(); c.arc(F.x, F.y, R8 + F.a * 18, 0, 7); c.stroke(); U.dot(c, F.x - 5, y, R8, '#a9bcd0'); U.dot(c, F.x + 6, y - 4, 6, '#2f9a63'); }
          else U.dot(c, F.x + F.a * 30, y, F.kind === 'off' ? R8 : 6, F.kind === 'off' ? '#a9bcd0' : '#2f9a63');
          c.globalAlpha = 1;
        }
        if (Z.hold) U.tag(c, `矽上長了 ${MAXL} 層，絕緣層上還是空的 → 重來一次`, w / 4, base - MAXL * STEP - 34, { align: 'center', size: 14, color: '#1f7a4d' });
        U.txt(c, '氯化氫兩邊都吃：矽上長得比吃得快 → 淨成長；絕緣層上的小島吃得比長得快 → 長不起來', w / 2, h - 10, { align: 'center', size: 14, w: 700, color: '#1f7a4d' });
      }
    },
    notes: `上一頁認識了磊晶：照著底下的原子排列長出完美的晶體。這一頁用它來解決摻雜那一頁留下的問題：3D 結構的源汲極怎麼摻雜。三個分頁依序看。

第一個分頁，為什麼源汲極用打的不好。鰭是站著的，要摻到側面，離子得斜著打。可是鰭又高又密，前一根鰭會擋住後面一大片，灰色三角形就是打不到的陰影區，所以左右兩側摻得不一樣。而且鰭只有幾奈米寬、奈米片只有幾奈米厚，離子撞進去會把原子排列撞亂，紅色叉叉就是損傷，事後加熱也很難完全修好。

第二個分頁，換個想法：不用打的，用長的，而且只長在需要的地方，這就是選擇性磊晶。「選擇性」怎麼做到？放大來看：左邊是露出的矽表面，表面原子有「空手」，也就是還沒牽到別人的鍵，氣體帶來的矽原子一落下就被抓住，照著底下排好，馬上就長。右邊是絕緣層表面，原子要先聚成一小團、像小島，才長得起來，起步慢很多，大部分落下又離開。長的同時再混一點氯化氫這種蝕刻氣體。要注意，氯化氫不會挑地方，矽上和絕緣層上它都吃。差別在於：矽上原子一落下就接上去，長得比被吃得快，淨效果是一直長；絕緣層上剛冒頭的小島只有幾顆原子、還沒長穩，被吃得比長得快，淨效果是長不起來。工程師調整長和吃的比例，讓矽上淨成長是正的、絕緣層上是負的，選擇性就是這樣做出來的。畫面上灰色是矽原子、綠色是氯化氫，兩邊同時落下。看下面的計數：矽上長上去的多、被吃掉的少，淨值一路往上，一層一層長高；絕緣層上偶爾冒出一兩顆的小島，很快就被氯化氫吃掉，淨值一直在零附近。這就是邊長邊吃。

第三個分頁，邊長邊摻。長的時候，把含磷或含硼的氣體一起混進去，長出來的源汲極本身就已經摻好，不用再打。長的時間要剛好：太短接觸不好，太長會碰到隔壁的電晶體短路。材料選得好還有額外好處：pFET 用矽鍺，會把通道擠緊，讓電洞跑得更快。就像與其做好麵包再打針灌餡，不如揉麵時就把餡料包進去。

這一章的重點：摻雜決定導電性，磊晶負責長出晶體；到了 3D 電晶體，兩件事在同一步一起完成。`
  }, F));
})();
