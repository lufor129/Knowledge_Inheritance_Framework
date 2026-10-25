/* 第一部分：先進製程的演進與現況（簡單版：零公式、具象動畫） */
(function () {
  const VT = 0.0259;
  /* 內部用的簡化電晶體模型（只拿來驅動動畫，不顯示在畫面上） */
  function idvg(vg, vth, ss) {
    const nn = ss / 60, x = (vg - vth) / (2 * nn * VT);
    const l = x > 30 ? x : Math.log1p(Math.exp(x));
    return 16 * l * l;
  }
  const LAMBDA = { planar: 9, finfet: 4.5, gaa: 3 };
  function leakOf(Lg, lam) {
    const e = Math.exp(-Lg / (2 * lam));
    const ss = 60 * (1 + 1.5 * e), vth = 0.32 - 0.18 * e - 0.26 * e * 0.75;
    const ioff = idvg(0, vth, ss);
    return U.clamp((Math.log10(ioff) + 4.5) / 5, 0.02, 1);
  }
  const leakWord = f => f < 0.3 ? ['很低', 'good'] : f < 0.55 ? ['中等', 'warn'] : ['很高', 'bad'];

  /* 章節頁 */
  Fig.add('p1', {
    raw: true, cls: 'divider-slide', render: () => `<div class="divider-grid"><div class="divider-num"><div class="l">Part</div><div class="n">01</div></div>
      <div class="divider-body"><div class="s-eyebrow">PART 1 · 約 26 分鐘</div><h2>先進製程的演進與現況</h2>
      <p class="q">一句話看懂這一部分：電晶體縮得太小，<b style="color:var(--accent-2)">閘極就關不住電子</b>。這十年所有結構的改變，都是為了把電子重新關好。</p>
      <div class="cards c3" style="max-width:1000px">
        <button type="button" class="card go-card" data-go="parts"><h4>先懂原理 →</h4><p>電晶體：電壓控制的水龍頭</p></button>
        <button type="button" class="card go-card" data-go="struct3d"><h4>看結構怎麼變 →</h4><p>平面 → 鰭式 → 環繞式 → 上下疊</p></button>
        <button type="button" class="card go-card" data-go="timeline"><h4>看產業現況 →</h4><p>台積電、Intel、三星走到哪裡</p></button>
      </div></div></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); }
  });

  /* 電晶體的各個零件 */
  const PARTS = [
    { k: 'si', n: '矽晶圓（基板）', d: '整顆電晶體蓋在上面的地基，是一整塊非常純的矽。', a: '房子的地基', chem: '矽 Si ＋ 極少量的硼 B', lat: 'p' },
    { k: 'n', n: '源極 Source', d: '電子的出發點。這塊矽摻了很多雜質，裡面有大量可以移動的電子。', a: '水塔（水的來源）', chem: '矽 Si ＋ 大量的磷 P（或砷 As）', lat: 'n' },
    { k: 'n', n: '汲極 Drain', d: '電子的終點。構造和源極一樣，只是接在比較高的電壓上，把電子吸過去。', a: '出水口', chem: '矽 Si ＋ 大量的磷 P（或砷 As）', lat: 'n' },
    { k: 'ch', n: '通道 Channel', d: '源極和汲極之間的一小段矽，電子要走的路。它通不通，由閘極決定。', a: '水管', chem: '矽 Si（平面時代摻少量硼；鰭式、環繞式幾乎不摻雜）', lat: 'p' },
    { k: 'ox', n: '閘極絕緣層', d: '只有 1–2 nm 的極薄絕緣膜，把閘極和通道隔開：電場過得去，電流過不去。', a: '把手和水管之間的墊片', chem: '二氧化矽 SiO₂ ＋ 氧化鉿 HfO₂', lat: 'ins' },
    { k: 'metal', n: '閘極 Gate', d: '控制開關的電極。加上電壓，就能在下方的通道「打開」一條路。', a: '水龍頭把手', chem: '金屬：氮化鈦 TiN、鎢 W 等', lat: 'metal' },
    { k: 'nit', n: '間隔層 Spacer', d: '閘極兩側的絕緣小牆，防止閘極和源極、汲極碰在一起短路。', a: '隔間牆', chem: '氮化矽 Si₃N₄', lat: 'ins' },
    { k: 'w', n: '接觸電極', d: '把源極、汲極、閘極接到上方導線的金屬柱，電從這裡進出。', a: '水管接頭', chem: '鎢 W 或鈷 Co', lat: 'metal' }
  ];
  Fig.add('parts', { body: true,
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('pt-cv', '電晶體剖面（側面切開來看）', '')}
        <div class="controls"><button class="btn primary" id="pt-tour" type="button">▶ 自動導覽</button><span class="gloss">一顆手機晶片裡有約 200 億個這樣的電晶體</span></div></div>
      <div class="col">
        <div class="card key"><h4 id="pt-i"></h4><div class="bigword" id="pt-n"></div><p id="pt-d" style="font-size:19px"></p><p style="font-size:18px;margin-top:4px"><b>材料：</b><span id="pt-c" style="color:var(--accent)"></span>　<span style="color:var(--accent-2)" id="pt-a"></span></p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px" id="pt-list">${PARTS.map((p, i) => `<button type="button" class="btn" data-i="${i}" style="justify-content:flex-start"><i style="display:inline-block;width:14px;height:14px;background:${p.k === 'ch' ? '#9fb5e3' : U.MAT[p.k]};border:1px solid rgba(0,0,0,.2)"></i>${p.n}</button>`).join('')}</div>
        <div class="fig grow" style="padding:8px 12px"><div class="fig-title"><span>原子放大鏡：為什麼矽能「半」導電？</span></div>
          <div class="controls">${U.seg('pt-lat', ['純矽', '摻磷 → n 型', '摻硼 → p 型'], 0)}</div>
          <div class="fig-canvas"><canvas id="pt-lv"></canvas></div>
          <div id="pt-lc" style="font-size:16px;line-height:1.4;color:var(--ink-2);min-height:44px"></div></div>
      </div></div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#pt-cv'));
      let sel = 0, tour = null;
      const sy = h * 0.5, L = 30, R = w - 30, gx0 = w * 0.38, gx1 = w * 0.62;
      const rects = [
        [[L, sy, R - L, h - sy - 20]],
        [[L + 30, sy, gx0 - L - 60, 70]],
        [[gx1 + 30, sy, R - gx1 - 60, 70]],
        [[gx0 - 4, sy, gx1 - gx0 + 8, 26]],
        [[gx0 - 4, sy - 12, gx1 - gx0 + 8, 12]],
        [[gx0, sy - 120, gx1 - gx0, 108]],
        [[gx0 - 30, sy - 120, 26, 120], [gx1 + 4, sy - 120, 26, 120]],
        [[L + 70, sy - 170, 34, 170], [R - 104, sy - 170, 34, 170], [(gx0 + gx1) / 2 - 17, sy - 190, 34, 70]]
      ];
      let showChem = false;
      const pick = (i, user) => {
        if (user) showChem = true;
        sel = i; const p = PARTS[i];
        U.$(el, '#pt-i').textContent = `零件 ${i + 1} / ${PARTS.length}`; U.$(el, '#pt-n').textContent = p.n;
        U.$(el, '#pt-d').textContent = p.d; U.$(el, '#pt-a').textContent = '（比喻：' + p.a + '）'; U.$(el, '#pt-c').textContent = showChem ? p.chem : '（點選零件後顯示）'; setLat(p.lat);
        U.$$(el, '#pt-list button').forEach((b, k) => b.classList.toggle('primary', k === i));
      };
      /* 原子放大鏡 */
      const LC = {
        pure: '矽有 <b>4 個最外層電子</b>，剛好和 4 個鄰居各共用一對，電子全被「綁住」→ 純矽幾乎不導電。',
        n: '磷有 <b>5 個</b>最外層電子：4 個用來牽手，<b style="color:#1f4fb5">多出 1 個自由電子</b>可以到處跑 → <b>n 型</b>（源極、汲極）。',
        p: '硼只有 <b>3 個</b>：少牽一隻手，留下一個<b style="color:#c0392b">空位「電洞」</b>。鄰居的電子跳進來，空位就像在移動 → <b>p 型</b>（基板、通道）。',
        ins: '絕緣體：電子被原子抓得非常緊，怎麼推都不動 → <b>完全不導電</b>，用來隔開、保護。',
        metal: '金屬：原子之間有<b>一大片自由電子</b>，隨時都能流動 → 用來當電極、導線。'
      };
      const lv = U.canvas(U.$(el, '#pt-lv'));
      let lat = 'p';
      function setLat(k) { lat = k; U.$(el, '#pt-lc').innerHTML = LC[k]; U.$$(el, '#pt-lat button').forEach((b, i) => b.classList.toggle('on', ['pure', 'n', 'p'][i] === k)); }
      U.onSeg(el, 'pt-lat', i => setLat(['pure', 'n', 'p'][i]));
      const free = Array.from({ length: 22 }, () => ({ x: Math.random(), y: Math.random(), vx: U.rand(-1, 1), vy: U.rand(-1, 1) }));
      ctx.raf((dt, t) => {
        const { c: g, w: W, h: H } = lv; g.clearRect(0, 0, W, H);
        const cols = 5, rows = 3, a = Math.min((W - 20) / cols, (H - 10) / rows), ox = (W - a * (cols - 1)) / 2, oy = (H - a * (rows - 1)) / 2, R = a * 0.24;
        const P = (i, j) => [ox + i * a, oy + j * a], dopant = lat === 'n' || lat === 'p';
        const hole = ['h', 2, 1, 3, 1, 'v', 3, 0, 3, 1, 'h', 3, 0, 4, 0, 'v', 4, 0, 4, 1];
        const holeIdx = Math.floor(t / 1.1) % 4, holeB = hole.slice(holeIdx * 5, holeIdx * 5 + 5);
        const bond = (i1, j1, i2, j2) => {
          const [x1, y1] = P(i1, j1), [x2, y2] = P(i2, j2), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
          g.strokeStyle = lat === 'metal' ? 'rgba(0,0,0,0)' : '#c3ccd6'; g.lineWidth = 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
          if (lat === 'metal') return;
          const hz = j1 === j2, d = a * 0.08, isHole = lat === 'p' && holeB[1] === i1 && holeB[2] === j1 && holeB[3] === i2 && holeB[4] === j2;
          const e1 = hz ? [mx - d, my] : [mx, my - d], e2 = hz ? [mx + d, my] : [mx, my + d];
          U.dot(g, e1[0], e1[1], 3.2, lat === 'ins' ? '#7a6a2a' : '#3e4b5b');
          if (isHole) { g.strokeStyle = '#c0392b'; g.lineWidth = 2.2; g.beginPath(); g.arc(e2[0], e2[1], 6, 0, 7); g.stroke(); U.tag(g, '電洞', e2[0], e2[1] - 12, { align: 'center', size: 13, color: '#c0392b' }); }
          else U.dot(g, e2[0], e2[1], 3.2, lat === 'ins' ? '#7a6a2a' : '#3e4b5b');
        };
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { if (i < cols - 1) bond(i, j, i + 1, j); if (j < rows - 1) bond(i, j, i, j + 1); }
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          const [x, y] = P(i, j), isD = dopant && i === 2 && j === 1;
          let lab = 'Si', col = '#a9bcd0';
          if (isD) { lab = lat === 'n' ? 'P' : 'B'; col = lat === 'n' ? '#5b8fd9' : '#d9765b'; }
          if (lat === 'ins') { lab = (i + j) % 2 ? 'O' : 'Si'; col = (i + j) % 2 ? '#f1e3a8' : '#a9bcd0'; }
          if (lat === 'metal') { lab = '+'; col = '#9aa5b1'; }
          U.dot(g, x, y, R, col); g.strokeStyle = 'rgba(20,30,45,.35)'; g.lineWidth = 1; g.beginPath(); g.arc(x, y, R, 0, 7); g.stroke();
          U.txt(g, lab, x, y + 1, { align: 'center', base: 'middle', size: Math.round(R * 0.9), w: 700, color: isD ? '#fff' : '#17202b' });
        }
        if (lat === 'n') {
          const [x0, y0] = P(2, 1), ex = x0 + Math.sin(t * 0.9) * a * 1.6 + Math.sin(t * 2.3) * a * 0.3, ey = y0 + Math.sin(t * 1.3) * a * 0.55;
          g.fillStyle = 'rgba(31,79,181,.18)'; g.beginPath(); g.arc(ex, ey, 11, 0, 7); g.fill(); U.dot(g, ex, ey, 5, '#1f4fb5');
          U.tag(g, '自由電子', ex, ey - 14, { align: 'center', size: 13, color: '#1f4fb5' });
        }
        if (lat === 'metal') free.forEach(f => { f.x = (f.x + f.vx * dt * 0.12 + 1) % 1; f.y = (f.y + f.vy * dt * 0.12 + 1) % 1; U.dot(g, ox - a / 2 + f.x * a * cols, oy - a / 2 + f.y * a * rows, 3.5, '#1f4fb5'); });
      });
      pick(0); setLat('pure');
      U.$$(el, '#pt-list button').forEach(b => b.onclick = () => { stopTour(); pick(+b.dataset.i, true); });
      const stopTour = () => { if (tour) { clearInterval(tour); tour = null; U.$(el, '#pt-tour').textContent = '▶ 自動導覽'; } };
      U.$(el, '#pt-tour').onclick = () => { if (tour) return stopTour(); pick(0, true); U.$(el, '#pt-tour').textContent = '❚❚ 暫停'; tour = setInterval(() => pick((sel + 1) % PARTS.length, true), 2600); };
      ctx.onCleanup(stopTour);
      U.$(el, '#pt-cv').addEventListener('click', e => {
        const r = e.target.getBoundingClientRect(), sc = Deck.scale || 1, x = (e.clientX - r.left) / sc, y = (e.clientY - r.top) / sc;
        for (let i = rects.length - 1; i >= 0; i--) if (rects[i].some(([a, b, cw, ch]) => x >= a && x <= a + cw && y >= b && y <= b + ch)) { stopTour(); pick(i, true); return; }
      });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const dim = i => (i === sel ? 1 : 0.35);
        const B = (m, r, i) => U.box(c, m, r[0], r[1], r[2], r[3], { a: dim(i) });
        B('si', rects[0][0], 0); B('n', rects[1][0], 1); B('n', rects[2][0], 2);
        B('#9fb5e3', rects[3][0], 3); B('ox', rects[4][0], 4); B('metal', rects[5][0], 5);
        rects[6].forEach(r => B('nit', r, 6)); rects[7].forEach(r => B('w', r, 7));
        c.fillStyle = `rgba(123,135,148,${dim(7) * 0.5})`; c.fillRect(L, sy - 196, R - L, 8);
        U.txt(c, '↑ 上方還有十幾層導線，把所有電晶體連起來', w / 2, sy - 204, { align: 'center', size: 14, color: '#6a7888' });
        const pulse = 0.55 + 0.45 * Math.sin(t * 5);
        c.strokeStyle = `rgba(179,84,30,${pulse})`; c.lineWidth = 4;
        rects[sel].forEach(([a, b, cw, ch]) => c.strokeRect(a - 2, b - 2, cw + 4, ch + 4));
        const [a, b, cw, ch] = rects[sel][0];
        U.tag(c, `${sel + 1}. ${PARTS[sel].n}`, Math.min(R - 10, Math.max(L + 10, a + cw / 2)), sel === 0 ? b + ch * 0.62 : Math.max(24, b - 12), { align: 'center', size: 17, color: '#b3541e' });
        PARTS.forEach((p, i) => { if (i === sel) return; const [x, y, ww] = rects[i][0]; U.txt(c, String(i + 1), x + ww / 2, y + 22, { align: 'center', size: 15, w: 700, color: '#17202b' }); });
      });
    }
  });

  /* MOSFET 水龍頭：分四步看懂原理 */
  const MSTEP = [
    ['關閉', '源極、汲極之間隔著 p 型矽，裡面幾乎沒有能自由移動的電子，電子過不去。', '水龍頭關緊，一滴水都沒有。'],
    ['加一點電壓', '閘極帶正電，把矽裡帶正電的「電洞」推開，表面變得空空的。', '把手開始轉，但還沒出水。'],
    ['電壓夠大', '閘極把電子吸到矽的表面，排成一條薄薄的電子通路：通道這段矽，這時才真正「打開」。', '水已經到出水口了。'],
    ['導通', '電子沿著這條通路從源極流到汲極，電流出現，這就是「開」。', '水流出來了。']
  ];
  Fig.add('mosfet', { body: true,
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('mf-cv', '電晶體剖面（側面切開來看）', '')}
        <div class="controls">${U.range('mf-vg', '閘極電壓：把手轉開多少', 0, 100, 1, 0, '%')}</div></div>
      <div class="col">
        <div class="bigword" id="mf-state"></div>
        ${U.meterHTML('mf-m', '電子流量')}
        <ol class="points num" id="mf-steps" style="gap:8px">${MSTEP.map((m, i) => `<li data-i="${i}" style="opacity:.4;transition:opacity .2s"><b>${m[0]}</b>：${m[1]}<br><span style="color:var(--accent-2);font-size:17px">${m[2]}</span></li>`).join('')}</ol>
        <div class="legend"><span><i style="background:#1f4fb5;border-radius:50%"></i>電子（帶負電，會流動）</span><span><i style="background:#fff;border:2px solid #d9765b;border-radius:50%"></i>電洞（帶正電）</span></div>
        <div class="analogy" style="margin-top:auto"><div class="ic">${U.icon('faucet')}</div><div><h4>比喻</h4><p>閘極是水龍頭把手：轉開（加電壓）水就流，關上就停。</p></div></div>
      </div></div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#mf-cv'));
      let vg = 0;
      U.bind(el, 'mf-vg', v => { vg = v / 100; }, v => v + '%');
      const sy = h * 0.42, L = 20, R = w - 20, gx0 = w * 0.36, gx1 = w * 0.64;
      const holes = Array.from({ length: 70 }, () => ({ x: U.rand(L + 10, R - 10), y: U.rand(sy + 70, h - 30) }));
      holes.forEach(o => { if (o.x > gx0 - 20 && o.x < gx1 + 20) o.y = U.rand(sy + 12, h - 30); });
      const bridge = Array.from({ length: 26 }, (_, i) => ({ x: U.lerp(gx0 - 6, gx1 + 6, i / 25), j: Math.random() }));
      const flow = Array.from({ length: 30 }, () => ({ x: Math.random(), y: Math.random(), s: U.rand(.6, 1.3) }));
      const steps = U.$$(el, '#mf-steps li');
      ctx.raf(dt => {
        const st = vg < 0.2 ? 0 : vg < 0.45 ? 1 : vg < 0.65 ? 2 : 3;
        steps.forEach((li, i) => li.style.opacity = i === st ? 1 : i < st ? .55 : .3);
        c.clearRect(0, 0, w, h);
        U.box(c, 'si', L, sy, R - L, h - sy - 10);
        U.box(c, 'n', L, sy, gx0 - L - 6, 60); U.box(c, 'n', gx1 + 6, sy, R - gx1 - 6, 60);
        U.box(c, 'ox', gx0 - 6, sy - 9, gx1 - gx0 + 12, 9);
        U.box(c, 'metal', gx0, sy - 90, gx1 - gx0, 81);
        // 閘極上的 + 號
        const np = Math.round(vg * 8);
        for (let k = 0; k < np; k++) U.txt(c, '+', gx0 + (k + .5) * (gx1 - gx0) / 8, sy - 40, { align: 'center', size: 22, w: 700, color: '#fff' });
        // 空乏區
        const dep = U.clamp(vg / 0.45, 0, 1) * 70;
        if (dep > 1) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(gx0 - 6, sy, gx1 - gx0 + 12, dep); }
        // 電洞被推開
        holes.forEach(o => {
          let y = o.y;
          if (o.x > gx0 - 10 && o.x < gx1 + 10) y = Math.max(o.y, sy + 12 + dep + (o.y - sy) * 0.2);
          c.strokeStyle = '#d9765b'; c.lineWidth = 2; c.fillStyle = '#fff';
          c.beginPath(); c.arc(o.x, y, 5, 0, 7); c.fill(); c.stroke();
        });
        // 電子橋
        const bq = U.clamp((vg - 0.45) / 0.2, 0, 1);
        bridge.forEach((b, i) => { if (b.j < bq) U.dot(c, b.x, sy + 6 + (i % 2) * 5, 4.5, '#1f4fb5'); });
        // 源汲極裡的電子 + 流動
        const on = st === 3;
        flow.forEach(f => {
          if (on) { f.x += dt * 0.35 * f.s; if (f.x > 1) f.x -= 1; }
          const x = U.lerp(L + 10, R - 10, f.x);
          const inCh = x > gx0 - 6 && x < gx1 + 6;
          if (inCh && !on) return;
          const y = inCh ? sy + 6 + f.y * 6 : sy + 8 + f.y * 44;
          U.dot(c, x, y, 4.5, '#1f4fb5');
        });
        U.tag(c, '源極（電子從這裡出發）', L + 8, sy + 84, { size: 15 });
        U.tag(c, '汲極（電子到這裡）', R - 8, sy + 84, { size: 15, align: 'right' });
        U.tag(c, '閘極', (gx0 + gx1) / 2, sy - 100, { align: 'center', size: 16 });
        U.tag(c, 'p 型矽（很多電洞，幾乎沒有自由電子）', w / 2, h - 22, { align: 'center', size: 15 });
        if (st >= 2) U.tag(c, '電子通路（通道）', (gx0 + gx1) / 2, sy + 52, { align: 'center', size: 15, color: '#1f4fb5' });
        if (on) { U.arrow(c, gx0 - 70, sy + 28, gx1 + 70, sy + 28, '#1f7a4d', 3); U.tag(c, '電子流動方向', gx1 + 76, sy + 34, { size: 14, color: '#1f7a4d' }); }
        U.setMeter(el, 'mf-m', on ? 0.3 + (vg - 0.65) / 0.35 * 0.7 : st === 2 ? 0.05 : 0.01, on ? '流動中' : '幾乎 0', on ? 'good' : '');
        U.$(el, '#mf-state').innerHTML = on ? '<span style="color:var(--good)">● 開（1）</span>' : st === 2 ? '<span style="color:var(--warn)">◐ 通路剛形成，快開了</span>' : '<span style="color:var(--bad)">● 關（0）</span>';
      });
    }
  });

  /* 短通道：電子偷溜 */
  Fig.add('sce', { body: true,
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('sc-cv', '平面電晶體（關閉狀態）', '')}
        <div class="controls">${U.range('sc-lg', '閘極長度（通道長短）', 8, 100, 1, 70, ' nm')}</div></div>
      ${U.pageSide({
        meters: [['sc-m', '漏電']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#sc-cv'));
      let Lg = 70;
      const dots = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), v: .5 + Math.random() }));
      U.bind(el, 'sc-lg', v => { Lg = v; }, v => v + ' nm');
      ctx.raf(dt => {
        c.clearRect(0, 0, w, h);
        const leak = leakOf(Lg, LAMBDA.planar);
        const sy = h * 0.34, gw = U.lerp(w * 0.06, w * 0.42, (Lg - 8) / 92), cx = w / 2;
        c.fillStyle = U.MAT.si; c.fillRect(20, sy, w - 40, h - sy - 50);
        c.fillStyle = U.MAT.n; U.rrect(c, 20, sy, cx - gw / 2 - 20, 60, 8); c.fill(); U.rrect(c, cx + gw / 2, sy, w - 20 - cx - gw / 2, 60, 8); c.fill();
        c.fillStyle = U.MAT.ox; c.fillRect(cx - gw / 2 - 4, sy - 8, gw + 8, 8);
        c.fillStyle = U.MAT.metal; c.fillRect(cx - gw / 2, sy - 70, gw, 62);
        const reach = 70;
        const gr = c.createLinearGradient(0, sy, 0, sy + reach);
        gr.addColorStop(0, 'rgba(31,122,77,.4)'); gr.addColorStop(1, 'rgba(31,122,77,0)');
        c.fillStyle = gr; c.fillRect(cx - gw / 2, sy, gw, reach);
        U.txt(c, '綠色：閘極管得到的區域', cx, sy + reach + 90, { align: 'center', size: 14, color: '#1f7a4d', bg: 'rgba(255,255,255,.85)' });
        U.txt(c, '源極', 50, sy + 36, { size: 16, w: 600, color: '#fff' });
        U.txt(c, '汲極', w - 90, sy + 36, { size: 16, w: 600, color: '#fff' });
        U.txt(c, '閘極（關）', cx, sy - 80, { align: 'center', size: 16, w: 600 });
        U.txt(c, `閘極長度 ${Lg} nm`, cx, h - 18, { align: 'center', size: 17, color: '#b3541e', w: 700 });
        const n = Math.round(leak * leak * 55);
        dots.forEach((d, i) => {
          if (i >= n) return;
          d.x += dt * 0.25 * d.v; if (d.x > 1) { d.x = 0; d.y = Math.random(); }
          const x = U.lerp(cx - gw / 2 - 40, cx + gw / 2 + 40, d.x);
          const y = sy + reach * 0.9 + 16 + d.y * 50 - Math.sin(d.x * Math.PI) * 10;
          U.electron(c, x, y, 4, true);
        });
        for (let i = 0; i < 9; i++) U.electron(c, cx - gw / 2 - 20 - (i % 3) * 12, sy + 14 + Math.floor(i / 3) * 12, 4);
        U.pLegend(c, w - 212, 6, ['e', 'bad']);
        const [word, cls] = leakWord(leak);
        U.setMeter(el, 'sc-m', leak, word, cls);
      });
    }
  });

  /* 奈米只是名稱 */
  const NODES = [
    { n: '16nm', y: 2015, cpp: 90, den: 29 }, { n: '10nm', y: 2017, cpp: 66, den: 53 }, { n: '7nm', y: 2018, cpp: 57, den: 91 },
    { n: '5nm', y: 2020, cpp: 51, den: 171 }, { n: '3nm', y: 2023, cpp: 48, den: 216 }, { n: '2nm', y: 2025, cpp: 48, den: 313 }
  ];
  Fig.add('nodename', { body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('nn-m', ['名字 vs 真實間距', '同樣面積能放多少電晶體'], 0)}</div>
        ${U.figHTML('nn-svg', '', '台積電各代（閘極間距為業界估計；密度為 WikiChip、TechInsights 分析值）', 'svg')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el) {
      const svg = U.$(el, '#nn-svg');
      // 切換圖表時，標題下的說明和右邊的大數字跟著換
      const TH = ['製程名稱只是「第幾代」的代號。橘色是名字上的數字，藍色是<b>真實的閘極間距</b>。', '同樣面積能放的電晶體一直增加：<b>名字縮了約 8 倍，密度增加了 10 倍以上</b>，但間距只縮一半。'];
      const FA = [['約 24 倍', '2 奈米世代的實際閘極間距（約 45–48 nm，業界估計）是名字的 20 幾倍'], ['約 11 倍', '從 16 奈米到 2 奈米，同樣面積能放的電晶體增加的倍數']];
      U.onSeg(el, 'nn-m', mi => {
        const th = el.querySelector('.s-thesis'), fv = el.querySelector('.fact .v'), fd = el.querySelector('.fact .d');
        if (th) th.innerHTML = TH[mi]; if (fv) fv.textContent = FA[mi][0]; if (fd) fd.textContent = FA[mi][1];
        U.clear(svg); const { w, h } = U.fit(svg);
        const max = mi === 0 ? 100 : 350;
        const ax = U.axes(svg, { size: { w, h }, x: [0, NODES.length], y: [0, max], yticks: mi === 0 ? [0, 25, 50, 75, 100] : [0, 100, 200, 300], m: { l: 50, b: 56 }, ylabel: mi === 0 ? '奈米 (nm)' : '百萬個 / mm²' });
        const bw = (ax.x(1) - ax.x(0)) * 0.5;
        NODES.forEach((d, i) => {
          const x = ax.x(i + 0.5), v = mi === 0 ? d.cpp : d.den;
          U.svg('rect', { x: x - bw / 2, y: ax.y(v), width: bw, height: ax.y(0) - ax.y(v), fill: d.est ? '#8fa9de' : U.MAT.accent, rx: 3 }, ax.plot);
          U.svg('text', { x, y: ax.y(v) - 8, 'text-anchor': 'middle', class: 'lbl mono', style: 'font-size:16px;font-weight:600', text: (d.est ? '~' : '') + v }, ax.plot);
          U.svg('text', { x, y: h - 32, 'text-anchor': 'middle', class: 'lbl', style: 'font-size:17px;font-weight:600', text: d.n }, ax.plot);
          U.svg('text', { x, y: h - 12, 'text-anchor': 'middle', class: 'lbl-s mono', text: d.y }, ax.plot);
          if (mi === 0) U.svg('rect', { x: x - bw / 2 - 4, y: ax.y(parseFloat(d.n)) - 3, width: bw + 8, height: 6, fill: U.MAT.accent2, rx: 2 }, ax.plot);
        });
        if (mi === 0) {
          U.svg('text', { x: ax.x(3.6), y: ax.y(90), class: 'lbl', style: 'font-size:16px', fill: U.MAT.accent2, text: '橘色：名字上的數字' }, ax.plot);
          U.svg('text', { x: ax.x(3.6), y: ax.y(81), class: 'lbl', style: 'font-size:16px', fill: U.MAT.accent, text: '藍色：真實閘極間距' }, ax.plot);
        } else U.svg('text', { x: ax.x(0.2), y: ax.y(330), class: 'lbl', style: 'font-size:16px', text: '名字縮了 8 倍、間距只縮一半，密度卻增加 11 倍：還靠把電路排得更聰明' }, ax.plot);
      });
    }
  });

  /* nFET 與 pFET */
  Fig.add('nfetpfet', { body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('nf-in', ['輸入 0（低電壓）', '輸入 1（高電壓）'], 0)}</div>${U.figHTML('nf-cv', '上：兩種電晶體剖面　下：接成一組（反相器）的電路簡圖', '')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#nf-cv'));
      let inp = 1;
      U.onSeg(el, 'nf-in', i => inp = i);
      const fl = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random() }));
      const fet = (x0, y0, ww, hh, type, on, t) => {
        const nT = type === 'n';
        U.box(c, nT ? 'si' : '#cfe0f5', x0, y0 + hh * 0.45, ww, hh * 0.55);
        U.box(c, nT ? 'n' : 'p', x0, y0 + hh * 0.45, ww * 0.32, hh * 0.25); U.box(c, nT ? 'n' : 'p', x0 + ww * 0.68, y0 + hh * 0.45, ww * 0.32, hh * 0.25);
        U.box(c, 'ox', x0 + ww * 0.32, y0 + hh * 0.41, ww * 0.36, hh * 0.04);
        U.box(c, 'metal', x0 + ww * 0.34, y0 + hh * 0.15, ww * 0.32, hh * 0.26);
        U.txt(c, (nT ? inp : inp) ? '1' : '0', x0 + ww * 0.5, y0 + hh * 0.32, { align: 'center', size: 20, w: 700, color: '#fff' });
        const col = nT ? '#1f4fb5' : '#c0392b';
        fl.forEach((f, k) => {
          if (on) f.x = (f.x + 0.004) % 1;
          const x = x0 + 8 + f.x * (ww - 16), inCh = x > x0 + ww * 0.32 && x < x0 + ww * 0.68;
          if (inCh && !on) return;
          const y = inCh ? y0 + hh * 0.47 + (k % 3) * 3 : y0 + hh * 0.5 + f.y * hh * 0.16;
          if (nT) U.electron(c, x, y, 3.5); else U.hole(c, x, y, 3.5);
        });
        U.txt(c, (nT ? 'nFET' : 'pFET') + (on ? '：開 ✓' : '：關'), x0 + ww / 2, y0 + 4, { align: 'center', size: 18, w: 700, color: on ? '#1f7a4d' : '#b3261e' });
        U.txt(c, nT ? '藍色實心點：電子' : '紅色空心圈：電洞', x0 + ww / 2, y0 + hh + 16, { align: 'center', size: 13, color: '#6a7888' });
      };
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const tw = w * 0.4, th = h * 0.36;
        fet(w * 0.06, 20, tw, th, 'n', inp === 1, t);
        fet(w * 0.54, 20, tw, th, 'p', inp === 0, t);
        // 下半部：電路簡圖（左）＋ 等效開關（右）
        const top = h * 0.47, bot = h - 16, out = inp ? 0 : 1, pOn = inp === 0, nOn = inp === 1;
        c.strokeStyle = '#d3dbe4'; c.lineWidth = 1; c.beginPath(); c.moveTo(10, top - 8); c.lineTo(w - 10, top - 8); c.stroke();
        U.txt(c, '電路簡圖（工程師的畫法）', 14, top + 12, { size: 15, w: 700, color: '#6a7888' });
        U.txt(c, '把電晶體想成開關', w * 0.62, top + 12, { size: 15, w: 700, color: '#6a7888' });
        const ink = '#3e4b5b', on = '#1f7a4d', off = '#b5bfca';
        const vT = top + 40, vB = bot - 8, mid = (vT + vB) / 2, yP = (vT + mid) / 2 + 2, yN = (mid + vB) / 2 - 2;
        const rail = (x0, x1, y, lab) => { c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); U.txt(c, lab, x1 + 8, y + 5, { size: 14, w: 600 }); };
        const wire = (pts, col, wd) => { c.strokeStyle = col || ink; c.lineWidth = wd || 2.2; c.beginPath(); pts.forEach(([x, y], k) => k ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
        // --- 電晶體符號 ---
        const sx = w * 0.3;
        rail(sx - 50, sx + 50, vT, '電源（1）'); rail(sx - 50, sx + 50, vB, '接地（0）');
        const sym = (y, p, isOn) => {
          const col = isOn ? (p ? '#c0392b' : '#1f4fb5') : off;
          wire([[sx, y - 20], [sx, y + 20]], col, 5);            // 通道
          wire([[sx - 12, y - 16], [sx - 12, y + 16]], ink, 3);   // 閘極板
          if (p) { c.strokeStyle = ink; c.lineWidth = 2; c.beginPath(); c.arc(sx - 20, y, 6, 0, 7); c.stroke(); wire([[sx - 26, y], [sx - 60, y]]); }
          else wire([[sx - 12, y], [sx - 60, y]]);
          wire([[sx, y - 16], [sx + 22, y - 16], [sx + 22, y - 34]]); wire([[sx, y + 16], [sx + 22, y + 16], [sx + 22, y + 34]]);
          U.txt(c, (p ? 'pFET' : 'nFET') + (isOn ? ' 開' : ' 關'), sx + 34, y + 5, { size: 15, w: 700, color: isOn ? (p ? '#c0392b' : '#1f4fb5') : '#8a97a6' });
          if (p) U.txt(c, '小圓圈代表「反過來」：給 0 才開', sx + 34, y + 22, { size: 13, color: '#6a7888' });
        };
        wire([[sx + 22, vT], [sx + 22, yP - 34]]); wire([[sx + 22, yP + 34], [sx + 22, yN - 34]]); wire([[sx + 22, yN + 34], [sx + 22, vB]]);
        sym(yP, true, pOn); sym(yN, false, nOn);
        // 輸入：同一條線接到兩個閘極
        const ix = sx - 60;
        wire([[ix, yP], [ix, yN]]); wire([[ix - 70, mid], [ix, mid]]); U.dot(c, ix, mid, 4, ink);
        U.dot(c, ix - 70, mid, 13, inp ? '#f2c14e' : '#cfd6de'); U.txt(c, String(inp), ix - 70, mid + 5, { align: 'center', size: 15, w: 700 });
        U.txt(c, '輸入', ix - 70, mid - 20, { align: 'center', size: 14, w: 600 });
        // 輸出
        const ox2 = sx + 22;
        wire([[ox2, mid], [ox2 + 70, mid]]); U.dot(c, ox2, mid, 4, ink);
        U.dot(c, ox2 + 86, mid, 15, out ? '#f2c14e' : '#cfd6de'); U.txt(c, String(out), ox2 + 86, mid + 5, { align: 'center', size: 15, w: 700 });
        U.txt(c, '輸出', ox2 + 86, mid + 34, { align: 'center', size: 14, w: 600 });
        // 電流動畫：沿著打開的那一條路
        const ph = (t * 0.7) % 1;
        for (let k = 0; k < 3; k++) {
          const q = (ph + k / 3) % 1;
          if (out) U.dot(c, ox2, U.lerp(vT, mid, q), 5, '#f2a93b'); else U.dot(c, ox2, U.lerp(mid, vB, q), 5, '#f2a93b');
        }
        // --- 等效開關 ---
        const kx = w * 0.72;
        rail(kx - 40, kx + 40, vT, '1'); rail(kx - 40, kx + 40, vB, '0');
        const sw = (y, closed, lab, col) => {
          const y0 = y - 26, y1 = y + 26;
          U.dot(c, kx, y0, 4, ink); U.dot(c, kx, y1, 4, ink);
          const ang = closed ? 0 : 0.55;
          wire([[kx, y0], [kx + Math.sin(ang) * 52, y0 + Math.cos(ang) * 52]], closed ? col : '#8a97a6', 4);
          U.txt(c, lab + (closed ? '：接通' : '：斷開'), kx + 30, y + 5, { size: 15, w: 700, color: closed ? col : '#8a97a6' });
        };
        wire([[kx, vT], [kx, yP - 26]]); wire([[kx, yP + 26], [kx, yN - 26]]); wire([[kx, yN + 26], [kx, vB]]);
        sw(yP, pOn, 'pFET', '#c0392b'); sw(yN, nOn, 'nFET', '#1f4fb5');
        wire([[kx, mid], [kx - 60, mid]]); U.dot(c, kx, mid, 4, ink);
        U.dot(c, kx - 74, mid, 13, out ? '#f2c14e' : '#cfd6de'); U.txt(c, String(out), kx - 74, mid + 5, { align: 'center', size: 15, w: 700 });
        U.txt(c, out ? '上面接通 → 輸出連到 1' : '下面接通 → 輸出連到 0', kx + 18, mid + 5, { size: 14, w: 700, color: out ? '#c0392b' : '#1f4fb5' });
      });
    }
  });

  /* 3D 結構演進 */
  const STRUCT = {
    planar: { y: '2011 年以前', g: '從上面 1 面', d: '閘極只蓋在通道上面，像用一根手指壓水管。' },
    finfet: { y: '2011 年 Intel 起；台積電 16nm（2015）起', g: '左、右、上 3 面', d: '把通道立起來變成一片「鰭」，閘極像馬鞍一樣跨在上面。' },
    gaa: { y: '2022 年三星 3nm 起；台積電 N2 2025 年底', g: '上下左右 4 面', d: '把鰭橫切成幾片薄薄的「奈米片」，閘極把每一片完全包住。' },
    forksheet: { y: '研究中', g: '3 面＋中間一道牆', d: '在兩種電晶體中間插一道絕緣牆，讓它們可以靠得更近。' },
    cfet: { y: '預計 2030 年代', g: '4 面，兩個電晶體上下疊', d: '把兩個電晶體疊成上下兩層，佔地面積可以省三到五成。' }
  };
  Fig.add('struct3d', { body: true,
    render: () => `<div class="s-body w66">
      <div class="col">
        <div class="controls">${U.seg('t3-type', T3D.TYPES.map(t => T3D.NAMES[t] + (t === 'forksheet' ? '<small style="display:block;font-size:12px;opacity:.8">研發中</small>' : t === 'cfet' ? '<small style="display:block;font-size:12px;opacity:.8">第三部分詳談</small>' : '')), 0)}</div>
        <div class="fig grow" style="padding:0"><div class="fig-canvas" id="t3-host"></div></div>
        <div class="controls">${U.range('t3-op', '閘極透明度', 0.1, 1, 0.01, 0.5, '')}<button class="btn primary" id="t3-cur" type="button">⚡ 電流流動：開</button><button class="btn" id="t3-rot" type="button">⟳ 自動旋轉</button></div>
        <div class="controls"><span class="gloss" style="font-size:16px;color:var(--ink-2)">切開來看：</span>${U.seg('t3-cd', ['橫切（看閘極怎麼包）', '順著電流切'], 0)}${U.range('t3-cut', '切面位置', 0, 100, 1, 100, '')}</div>
      </div>
      ${U.pageSide({
        top: `<div class="bigword" id="t3-name"></div><p style="margin:0;font-size:21px" id="t3-d"></p>
          <table class="t" style="font-size:18px"><tbody><tr><td>閘極包住</td><td id="t3-g"></td></tr><tr><td>開始使用</td><td id="t3-y"></td></tr></tbody></table>`,
        extra: U.legendHTML(['metal', 'hk', 'si', 'n', 'p', 'nit', 'ox']) + '<p class="gloss" style="margin:0"><b>藍色小球</b>：電子，由源極流向汲極（紅色小球：pFET 裡的電洞，方向相反）。電流只走被閘極包住的通道。<br><b>高介電</b>：一種擋電子更好的絕緣材料（第二部分 ⑤ 閘極章詳談）。</p>'
      })}</div>`,
    init(el, ctx) {
      const t3 = T3D.mount(U.$(el, '#t3-host'), ctx, { type: 'planar', current: true, gateOpacity: 0.5, noSpacer: true });
      if (!t3) return;
      U.$$(el, '#t3-type button').forEach((b, i) => { if (i >= 3) b.style.opacity = '.62'; });
      let auto = false;
      U.onSeg(el, 't3-type', i => {
        const t = T3D.TYPES[i]; t3.setType(t); const s = STRUCT[t];
        U.$(el, '#t3-name').textContent = T3D.NAMES[t]; U.$(el, '#t3-d').textContent = s.d;
        U.$(el, '#t3-y').textContent = s.y; U.$(el, '#t3-g').textContent = s.g;
      });
      U.bind(el, 't3-op', v => t3.setGate(v), v => Math.round(v * 100) + '%');
      let cur = true;
      // 切面：100＝不切；橫切的位置從源極端移到汲極端，順著電流切則從前面切到後面
      let cdir = 'x', cut = 100, cutSl;
      const applyCut = moved => {
        const f = cut / 100, pos = cut >= 100 ? 99 : cdir === 'x' ? U.lerp(-2.9, 3.1, f) : U.lerp(-1.9, 2.3, f);
        t3.setClip(cdir, pos);
        if (moved && cut < 100) t3.setView(cdir === 'x' ? 1.3 : 0.28, 1.3, 12);
        if (cut >= 100) t3.setView(0.75, 1.05, 16.5); // 拉回「不切」：鏡頭復位
      };
      U.onSeg(el, 't3-cd', i => { cdir = i ? 'z' : 'x'; if (cutSl && cut >= 100) cutSl.set(i ? 45 : 48); applyCut(true); });
      cutSl = U.bind(el, 't3-cut', v => { const was = cut; cut = v; if (v < 100 && cur) setCur(false); applyCut(was >= 100 && v < 100); }, v => v >= 100 ? '不切' : cdir === 'x' ? (v < 40 ? '靠源極' : v > 60 ? '靠汲極' : '閘極正中間') : (v < 45 ? '前半' : '中間'));
      U.$(el, '#t3-rot').onclick = e => { auto = !auto; t3.setAuto(auto); e.currentTarget.classList.toggle('primary', auto); };
      // 電流和切面互斥：切開時自動關掉電流；打開電流時自動恢復成不切
      function setCur(v) { cur = v; t3.setCurrent(v); const b = U.$(el, '#t3-cur'); b.classList.toggle('primary', v); b.textContent = '⚡ 電流流動：' + (v ? '開' : '關'); }
      U.$(el, '#t3-cur').onclick = () => { setCur(!cur); if (cur && cut < 100) cutSl.set(100); };
    }
  });

  /* 閘極控制：三格並排漏電動畫 */
  Fig.add('gatectl', { body: true,
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('gc-cv', '上：側面（橘色標尺＝閘極長度）　下：切面', '<span style="color:#1f4fb5">●</span> 電子　<span style="color:#1f4fb5;-webkit-text-stroke:1.5px #b3261e">●</span> 漏電的電子')}
        <div class="controls">${U.range('gc-l', '閘極長度', 6, 30, 1, 20, ' nm')}</div></div>
      ${U.pageSide({
        meters: [['gc-a', '平面'], ['gc-b', '鰭式'], ['gc-c', '環繞式']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#gc-cv'));
      let Lg = 20;
      U.bind(el, 'gc-l', v => { Lg = v; }, v => v + ' nm');
      const types = [['planar', '平面', 'gc-a'], ['finfet', '鰭式', 'gc-b'], ['gaa', '環繞式', 'gc-c']];
      const SD = '#cfdff5';
      // 每格固定一批電子：漏電越多，啟用的電子越多（相位錯開，看起來像連續流）
      const flow = types.map(() => Array.from({ length: 36 }, (_, j) => ({ p: (j * 0.618) % 1, r: (j * 0.371) % 1 })));
      const parts = types.map(() => Array.from({ length: 24 }, (_, j) => ({ a: j * 2.4, r: (j * 0.53) % 1, p: (j * 0.29) % 1 })));
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const pw = w / 3, top = 50, sideH = h * 0.44;
        types.forEach(([k, name, mid], i) => {
          const cx = pw * i + pw / 2, leak = leakOf(Lg, LAMBDA[k]);
          if (i) { c.strokeStyle = '#e3e8ee'; c.lineWidth = 1; c.beginPath(); c.moveTo(pw * i, 10); c.lineTo(pw * i, h - 10); c.stroke(); }
          U.txt(c, name, cx, 28, { align: 'center', size: 20, w: 700, color: '#17202b' });

          /* ── 上：側面（電子由左往右走），閘極寬度＝閘極長度 ── */
          const SW = pw * 0.88, x0 = cx - SW / 2, x1 = cx + SW / 2;
          const gw = SW * 0.62 * Lg / 30, g0 = cx - gw / 2, g1 = cx + gw / 2;
          const yS = top + 62;                      // 矽的頂面
          let lanes;                                // 漏電電子走的高度
          if (k === 'planar') {
            c.fillStyle = U.MAT.si; c.fillRect(x0, yS, SW, sideH - 70);
            c.fillStyle = SD; c.fillRect(x0, yS, g0 - x0 - 4, 34); c.fillRect(g1 + 4, yS, x1 - g1 - 4, 34);
            c.fillStyle = U.MAT.hk; c.fillRect(g0, yS - 5, gw, 5);
            c.fillStyle = U.MAT.metal; c.fillRect(g0, yS - 40, gw, 35);
            lanes = [yS + 26, yS + 62];             // 閘極管不到的深處
          } else if (k === 'finfet') {
            const fb = yS + 78;                     // 鰭底（再往下是氧化層）
            c.fillStyle = U.MAT.ox; c.fillRect(x0, fb - 14, SW, sideH - 70 - (fb - 14 - yS));
            c.fillStyle = U.MAT.si; c.fillRect(x0, yS, SW, fb - yS);
            c.fillStyle = SD; c.fillRect(x0, yS, g0 - x0 - 4, fb - yS - 16); c.fillRect(g1 + 4, yS, x1 - g1 - 4, fb - yS - 16);
            c.fillStyle = U.MAT.metal; c.fillRect(g0, yS - 40, gw, 40);
            c.globalAlpha = 0.55; c.fillRect(g0, yS, gw, fb - 16 - yS); c.globalAlpha = 1; // 兩側的閘極（在鰭前後，半透明）
            c.fillStyle = U.MAT.hk; c.fillRect(g0, yS - 5, gw, 5);
            lanes = [fb - 13, fb - 3];              // 鰭底：側面閘極蓋不到
          } else {
            const th = 16, gap = 14, n = 3, stackH = n * th + (n + 1) * gap;
            c.fillStyle = U.MAT.si; c.fillRect(x0, yS + stackH, SW, sideH - 70 - stackH);
            c.fillStyle = U.MAT.metal; c.fillRect(g0, yS - 40, gw, 40 + stackH);
            for (let s = 0; s < n; s++) {
              const y = yS + gap + s * (th + gap);
              c.fillStyle = U.MAT.hk; c.fillRect(g0, y - 3, gw, th + 6);
              c.fillStyle = U.MAT.si; c.fillRect(x0, y, SW, th);
            }
            c.fillStyle = SD; c.fillRect(x0, yS, g0 - x0 - 4, stackH); c.fillRect(g1 + 4, yS, x1 - g1 - 4, stackH);
            lanes = [0, 1, 2].map(s => yS + gap + s * (th + gap) + th / 2); // 每片正中央
          }
          U.tag(c, '源極', (x0 + g0) / 2, yS - 8, { align: 'center', size: 14, bg: null });
          U.tag(c, '汲極', (g1 + x1) / 2, yS - 8, { align: 'center', size: 14, bg: null });
          // 閘極長度標尺
          const ry = yS - 52;
          c.strokeStyle = U.MAT.accent2; c.lineWidth = 2;
          c.beginPath(); c.moveTo(g0, ry); c.lineTo(g1, ry); c.moveTo(g0, ry - 6); c.lineTo(g0, ry + 6); c.moveTo(g1, ry - 6); c.lineTo(g1, ry + 6); c.stroke();
          U.txt(c, Lg + ' nm', cx, ry - 12, { align: 'center', size: 16, w: 700, color: U.MAT.accent2 });
          // 源極裡等著的電子（被閘極擋住）
          for (let j = 0; j < 10; j++) {
            const ex = x0 + 8 + ((j * 0.37) % 1) * (g0 - x0 - 20), ey = (k === 'gaa' ? lanes[j % 3] : yS + 8 + ((j * 0.61) % 1) * 20) + Math.sin(t * 3 + j) * 2;
            U.electron(c, ex, ey, 3.2);
          }
          // 漏電電子：從源極穿過閘極下方流到汲極
          const nOn = Math.round(leak * leak * flow[i].length);
          const xa = g0 - 45, xb = g1 + 60, span = xb - xa;
          flow[i].forEach((p, j) => {
            if (j >= nOn) return;
            const ph = (p.p + t * 70 / span) % 1, x = xa + ph * span;
            const y = k === 'gaa' ? lanes[j % 3] + (p.r - 0.5) * 4 : lanes[0] + p.r * (lanes[1] - lanes[0]);
            c.globalAlpha = Math.min(1, ph * 6, (1 - ph) * 6);
            U.electron(c, x, y, 3.4, x > g0 && x < g1);
            c.globalAlpha = 1;
          });
          U.txt(c, '側面：電子由左往右', x0, top + sideH + 4, { size: 13, color: '#6a7888' });

          /* ── 下：切面（從通道正面看），看漏在哪裡 ── */
          const S = Math.min(pw * 0.62, h * 0.3), cy = top + sideH + (h - 60 - top - sideH) / 2 + 10;
          let hole;
          if (k === 'planar') {
            c.fillStyle = U.MAT.si; c.fillRect(cx - S / 2, cy - S * 0.05, S, S * 0.5);
            c.fillStyle = U.MAT.metal; c.fillRect(cx - S / 2, cy - S * 0.3, S, S * 0.22);
            c.fillStyle = U.MAT.hk; c.fillRect(cx - S / 2, cy - S * 0.08, S, S * 0.03);
            hole = [cx - S * 0.45, cy + S * 0.08, S * 0.9, S * 0.32];
          } else if (k === 'finfet') {
            c.fillStyle = U.MAT.si; c.fillRect(cx - S / 2, cy + S * 0.25, S, S * 0.2);
            c.fillStyle = U.MAT.ox; c.fillRect(cx - S / 2, cy + S * 0.15, S, S * 0.1);
            c.fillStyle = U.MAT.metal; c.fillRect(cx - S * 0.3, cy - S * 0.35, S * 0.6, S * 0.5);
            c.fillStyle = U.MAT.hk; c.fillRect(cx - S * 0.09, cy - S * 0.23, S * 0.18, S * 0.4);
            c.fillStyle = U.MAT.si; c.fillRect(cx - S * 0.07, cy - S * 0.21, S * 0.14, S * 0.46);
            hole = [cx - S * 0.07, cy + S * 0.12, S * 0.14, S * 0.12];
          } else {
            c.fillStyle = U.MAT.si; c.fillRect(cx - S / 2, cy + S * 0.3, S, S * 0.15);
            c.fillStyle = U.MAT.metal; c.fillRect(cx - S * 0.3, cy - S * 0.38, S * 0.6, S * 0.66);
            [-0.22, 0, 0.22].forEach(f => { c.fillStyle = U.MAT.hk; c.fillRect(cx - S * 0.2, cy + f * S - S * 0.055, S * 0.4, S * 0.11); c.fillStyle = U.MAT.si; c.fillRect(cx - S * 0.18, cy + f * S - S * 0.035, S * 0.36, S * 0.07); });
            hole = [-0.22, 0, 0.22].map(f => [cx - S * 0.12, cy + f * S - S * 0.012, S * 0.24, S * 0.024]); // 每片奈米片的正中央：離四面閘極最遠
          }
          U.txt(c, '切面：漏在哪裡', x0, cy - S * 0.42 - 8, { size: 13, color: '#6a7888' });
          const n = Math.round(leak * leak * parts[i].length);
          parts[i].forEach((p, j) => {
            if (j >= n) return;
            const ph = (p.p + t * 0.6) % 1, hb = Array.isArray(hole[0]) ? hole[j % 3] : hole;
            const x = hb[0] + p.r * hb[2], y = hb[1] + (Math.sin(p.a + t * 3) * .5 + .5) * hb[3];
            c.globalAlpha = 0.45 + 0.55 * Math.sin(ph * Math.PI);
            U.electron(c, x, y, 3.2, true);
            c.globalAlpha = 1;
          });
          const [word, cls] = leakWord(leak);
          U.txt(c, '漏電：' + word, cx, h - 22, { align: 'center', size: 19, w: 700, color: cls === 'bad' ? '#b3261e' : cls === 'warn' ? '#a8660a' : '#1f7a4d' });
          U.setMeter(el, mid, leak, word, cls);
        });
      });
    }
  });

  /* 時間軸：每個節點都有代表圖 */
  const TL = [
    { y: 2018, n: '7nm', t: '最後一代只用 DUV', d: '只用舊的深紫外光（DUV），最細的線要拆開、曝光好幾次才畫得出來。', c: 'tsmc', img: ['die'], cap: '真實的 7 奈米晶片：AMD Zen 2 處理器' },
    { y: 2019, n: 'EUV 上線', t: '極紫外光 (EUV) 開始量產', d: '光的波長從 193 nm 變成 13.5 nm，短了十幾倍；單次能畫的線約細 3 倍，不用再一條線曝光好幾次。', c: 'ind', draw: 'euv', cap: '示意圖：用雷射打錫滴產生 EUV 光' },
    { y: 2020, n: '5nm', t: '關鍵層大量改用 EUV', d: '關鍵的十幾層都用 EUV；Apple M1 就是這一代。', c: 'tsmc', img: ['die5'], cap: '真實的 5 奈米晶片：AMD Zen 4 運算晶片' },
    { y: 2022, n: '3nm', t: '鰭式的最後一代', d: '台積電仍用鰭式；三星搶先改用環繞式 (GAA)。', c: 'tsmc', img: ['a17', 'finstem'], cap: '左：3 奈米的 Apple A17 Pro　右：一根「鰭」的電子顯微鏡剖面＋元素分布（綠：矽、黃：氧、紅：摻雜的砷）' },
    { y: 2025, n: '2nm', t: '環繞式全面量產', d: '台積電 N2 於 2025 年底量產；Intel 18A 同時加上背面供電，筆電晶片 2026 年初上市。', c: 'tsmc', img: ['gaatem'], cap: '環繞式電晶體的電子顯微鏡剖面：三片奈米片被閘極完全包住（研究樣品）' },
    { y: 2026, n: 'High-NA', t: '新一代 EUV 機台進廠驗證', d: 'High-NA EUV 進入產線：Intel 先在 18A 部分圖層試用，14A 關鍵圖層才全面導入；台積電 N2P 量產。', c: 'ind', draw: 'highna', cap: '示意圖：鏡頭收光角度變大，畫得更細' },
    { y: 2027, n: 'A16', t: '背面供電普及', d: '台積電 A16 加入背面供電，2027 年放量。同一時期 Intel 14A（Intel 的代號，A 寫在後面）關鍵圖層用 High-NA（2027 試產、2028 量產）。', c: 'tsmc', draw: 'bspdn', cap: '示意圖：電源線搬到晶片背面（廠商的剖面照未以開放授權公開）' },
    { y: 2028, n: 'A14', t: '第二代環繞式', d: '台積電 A14 預計 2028 年量產，2029 年接續 A13、A12。', c: 'tsmc', draw: 'sheet2', cap: '示意圖：奈米片排得更密、更薄' },
    { y: 2032, n: 'CFET?', t: '上下疊的電晶體', d: '研究機構 imec 預估 2030 年代導入，時程還不確定。', c: 'ind', draw: 'cfet', cap: '示意圖：nFET 與 pFET 上下疊起來' }
  ];
  function illu(c, w, h, kind, t) {
    c.clearRect(0, 0, w, h); c.fillStyle = '#f5f7fa'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    if (kind === 'euv') {
      c.strokeStyle = '#8a97a6'; c.lineWidth = 8; c.beginPath(); c.arc(cx - 60, cy, 90, -1.1, 1.1); c.stroke();
      for (let k = 0; k < 5; k++) U.dot(c, cx, cy - 110 + ((t * 120 + k * 40) % 110), 5, '#8c8c8c');
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 50); g.addColorStop(0, 'rgba(255,240,255,1)'); g.addColorStop(.4, 'rgba(190,90,230,.8)'); g.addColorStop(1, 'rgba(190,90,230,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 50, 0, 7); c.fill();
      c.strokeStyle = 'rgba(220,40,40,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, cy + 70); c.lineTo(cx, cy); c.stroke();
      U.tag(c, '錫滴', cx + 12, cy - 90, { size: 14 }); U.tag(c, '雷射', 30, cy + 90, { size: 14, color: '#b3261e' }); U.tag(c, 'EUV 光', cx + 60, cy + 6, { size: 14, color: '#6b3fb0' });
    } else if (kind === 'highna') {
      [[cx - w * 0.22, 60, '一般 EUV'], [cx + w * 0.22, 110, 'High-NA']].forEach(([x, lw, n]) => {
        c.fillStyle = '#dfe7f1'; c.beginPath(); c.ellipse(x, cy - 50, lw / 2, 14, 0, 0, 7); c.fill();
        c.fillStyle = 'rgba(176,79,201,.25)'; c.beginPath(); c.moveTo(x - lw / 2, cy - 50); c.lineTo(x + lw / 2, cy - 50); c.lineTo(x, cy + 50); c.fill();
        U.tag(c, n, x, cy + 80, { align: 'center', size: 15 });
      });
    } else if (kind === 'bspdn') {
      const L = 40, R = w - 40;
      for (let l = 0; l < 4; l++) for (let k = 0; k < 12; k++) { c.fillStyle = '#5b8fd9'; c.fillRect(L + k * (R - L) / 12 + 6, 30 + l * 16, 16, 6); }
      U.tag(c, '正面：只剩訊號線', L, 22, { size: 14 });
      for (let k = 0; k < 10; k++) U.box(c, 'metal', L + k * (R - L) / 10 + 6, cy, 22, 12);
      U.box(c, 'si', L, cy + 12, R - L, 16);
      c.fillStyle = '#c0392b'; c.fillRect(L, cy + 36, R - L, 14); c.fillRect(L, cy + 58, R - L, 14);
      for (let k = 0; k < 5; k++) U.arrow(c, L + 30 + k * (R - L) / 5, h - 10, L + 30 + k * (R - L) / 5, cy + 76, '#c0392b', 2);
      U.tag(c, '背面：粗電源線，電從下面進來', L, h - 14, { size: 14, color: '#c0392b' });
    } else if (kind === 'sheet2' || kind === 'cfet') {
      const n = kind === 'cfet' ? 4 : 4, sw = w * 0.4, th = 16, gap = kind === 'cfet' ? 20 : 16;
      const tot = n * th + (n - 1) * gap + (kind === 'cfet' ? 24 : 0), y0 = cy - tot / 2;
      c.fillStyle = U.MAT.metal; c.fillRect(cx - sw / 2 - 30, y0 - 26, sw + 60, tot + 52);
      for (let k = 0; k < n; k++) {
        const y = y0 + k * (th + gap) + (kind === 'cfet' && k >= 2 ? 24 : 0);
        const col = kind === 'cfet' ? (k < 2 ? '#8fb0e0' : '#e7a58f') : U.MAT.si; // CFET：上層 nFET（藍）、下層 pFET（紅）
        U.box(c, 'hk', cx - sw / 2 - 5, y - 5, sw + 10, th + 10); U.box(c, col, cx - sw / 2, y, sw, th);
      }
      if (kind === 'cfet') { c.fillStyle = U.MAT.ox; c.fillRect(cx - sw / 2 - 30, y0 + 2 * (th + gap) - 4, sw + 60, 16); U.tag(c, '上層 nFET', cx + sw / 2 + 40, y0 + 20, { size: 14, color: '#1f4fb5' }); U.tag(c, '下層 pFET', cx + sw / 2 + 40, y0 + tot - 10, { size: 14, color: '#c0392b' }); }
      else U.tag(c, '更多片、更薄、排更密', cx, y0 - 34, { align: 'center', size: 15 });
    }
    U.txt(c, '示意圖', w - 10, h - 8, { align: 'right', size: 12, color: '#6a7888' });
  }
  Fig.add('timeline', { body: true,
    render: () => `<div class="s-body full" style="grid-template-rows:auto 1fr">
      <div class="fig" style="height:230px"><div class="fig-canvas"><svg id="tl-svg"></svg></div></div>
      <div class="s-body" style="grid-template-columns:40fr 60fr;gap:22px">
        <div class="card key" style="display:flex;flex-direction:column;gap:6px"><h4 id="tl-y"></h4><div style="font-size:30px;font-weight:700" id="tl-n"></div><div style="font-size:22px;color:var(--accent)" id="tl-t"></div><p id="tl-d" style="font-size:21px"></p>
          <ul class="points simple" id="tl-three" style="margin-top:auto"><li data-k="light"><b>光</b>：深紫外光 → EUV</li><li data-k="struct"><b>結構</b>：鰭式 → 環繞式</li><li data-k="power"><b>電線</b>：正面 → 背面</li></ul></div>
        <div class="fig" style="padding:10px 12px"><div class="fig-title"><span id="tl-cap"></span></div>
          <div id="tl-imgs" style="flex:1;min-height:0;display:flex;gap:10px"></div>
          <div id="tl-cr" style="font-size:11.5px;color:var(--ink-3);line-height:1.3"></div></div>
      </div></div>`,
    init(el, ctx) {
      const svg = U.$(el, '#tl-svg'); const { w, h } = U.fit(svg);
      const X = U.lin(2017.5, 2032.8, 40, w - 30);
      const g = U.svg('g', {}, svg);
      U.svg('rect', { x: X(2026.7), y: 6, width: X(2032.8) - X(2026.7), height: h - 12, fill: '#f2f5f8' }, g);
      U.svg('text', { x: X(2026.8) + 4, y: 24, class: 'lbl-s', text: '→ 未來規劃' }, g);
      U.svg('line', { x1: 30, x2: w - 20, y1: h * 0.55, y2: h * 0.55, stroke: U.MAT.ink2, 'stroke-width': 2 }, g);
      for (let y = 2018; y <= 2032; y++) { U.svg('line', { x1: X(y), x2: X(y), y1: h * 0.55 - 5, y2: h * 0.55 + 5, stroke: U.MAT.ink3 }, g); U.svg('text', { x: X(y), y: h * 0.55 + 24, 'text-anchor': 'middle', class: 'lbl-s mono', text: y }, g); }
      const nodes = [];
      TL.forEach((t, i) => {
        const up = t.c === 'tsmc', x = X(t.y), y = up ? h * 0.26 : h * 0.84;
        const grp = U.svg('g', { class: 'hot' }, g);
        U.svg('line', { x1: x, x2: x, y1: h * 0.55, y2: y, stroke: U.MAT.line, 'stroke-width': 1.5 }, grp);
        const r = U.svg('rect', { x: x - 40, y: y - 19, width: 80, height: 38, rx: 4, stroke: up ? U.MAT.accent : U.MAT.accent2, 'stroke-width': 1.5 }, grp);
        const tx = U.svg('text', { x, y: y + 6, 'text-anchor': 'middle', class: 'lbl', style: 'font-weight:700;font-size:15px', text: t.n }, grp);
        nodes.push({ r, tx, up }); grp.addEventListener('click', () => sel(i));
      });
      U.svg('text', { x: 36, y: h * 0.26 - 28, class: 'lbl-s', text: '上排：新製程世代（點選）' }, g);
      U.svg('text', { x: 36, y: h - 4, class: 'lbl-s', text: '下排：產業大事' }, g);
      const box = U.$(el, '#tl-imgs');
      let stopDraw = null;
      // 這一代換的是哪一件大事（光／結構／電線），左下三條就亮哪一條
      const KEY = { '7nm': '', 'EUV 上線': 'light', '5nm': 'light', '3nm': 'struct', '2nm': 'struct', 'High-NA': 'light', 'A16': 'power', 'A14': '', 'CFET?': 'struct' };
      function sel(i) {
        const t = TL[i];
        U.$$(el, '#tl-three li').forEach(li => { const on = li.dataset.k === KEY[t.n]; li.style.opacity = KEY[t.n] && !on ? 0.4 : 1; li.style.fontWeight = on ? 700 : ''; li.style.color = on ? 'var(--accent-2)' : ''; });
        nodes.forEach((n, k) => { n.r.setAttribute('fill', k === i ? (n.up ? U.MAT.accent : U.MAT.accent2) : (n.up ? '#fff' : '#f8e9df')); n.tx.style.fill = k === i ? '#fff' : U.MAT.ink2; });
        U.$(el, '#tl-y').textContent = t.y + (t.y > 2026 ? '（規劃）' : ''); U.$(el, '#tl-n').textContent = t.n; U.$(el, '#tl-t').textContent = t.t; U.$(el, '#tl-d').textContent = t.d;
        U.$(el, '#tl-cap').textContent = t.cap;
        if (stopDraw) { stopDraw(); stopDraw = null; }
        if (t.img) {
          box.innerHTML = t.img.map(k => `<div style="flex:${CREDITS[k].ar || 1};min-width:0;background:#1b2430;border-radius:3px;overflow:hidden"><img src="${CREDITS[k].f}" alt="" style="display:block;width:100%;height:100%;object-fit:contain"></div>`).join('');
          U.$(el, '#tl-cr').textContent = '影像：' + t.img.map(k => `${CREDITS[k].by}（${CREDITS[k].lic}）`).join('；');
        } else {
          box.innerHTML = '<div style="flex:1;position:relative"><canvas id="tl-cv"></canvas></div>';
          const cv = U.$(el, '#tl-cv'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
          const { c: cc, w: ww, h: hh } = U.canvas(cv);
          stopDraw = ctx.raf((dt, tt) => illu(cc, ww, hh, t.draw, tt));
          U.$(el, '#tl-cr').textContent = '本簡報自繪示意圖（沒有可公開使用的實拍照片）';
        }
      }
      sel(0);
    }
  });

  /* 三大廠：用實際電晶體密度比較各代製程 */
  // den：高密度電路的電晶體密度（百萬個／mm²）。m：1＝第三方分析或官方公布，0＝依官方宣稱倍數推估
  const LANES = [
    { co: 'TSMC 台積電', col: '#1f4fb5', pts: [
      { y: 2015.5, n: '16nm', den: 29, m: 1, gaa: 0, bs: 0, d: '台積電第一代鰭式電晶體。密度約 29。' },
      { y: 2017.6, n: '10nm', den: 53, m: 1, gaa: 0, bs: 0, d: '過渡性的一代，主要用在手機晶片。密度約 53。' },
      { y: 2018.3, n: 'N7', den: 91, m: 1, gaa: 0, bs: 0, d: '最後一代只用 DUV（N7+ 才開始用 EUV）。密度約 91。' },
      { y: 2020.3, n: 'N5', den: 171, m: 1, gaa: 0, bs: 0, d: '關鍵層大量改用 EUV，Apple M1 就是這一代。密度約 171（WikiChip 分析）。' },
      { y: 2023, n: 'N3E', den: 216, m: 1, gaa: 0, bs: 0, d: '鰭式的最後一代，目前出貨量最大的 3 奈米。密度約 216（WikiChip 分析）。' },
      { y: 2025.85, n: 'N2', den: 313, m: 1, gaa: 1, bs: 0, d: '第一次用環繞式，2025 年底量產。密度約 313，是三家 2 奈米級裡最高的（TechInsights 分析）。' },
      { y: 2027.2, n: 'A16', den: 340, m: 0, gaa: 1, bs: 1, d: '加上背面供電，鎖定 AI 晶片，2027 年放量。台積電宣稱密度比 N2P 多 7–10%，推估約 340。' },
      { y: 2028.2, n: 'A14', den: 375, m: 0, gaa: 1, bs: 0, d: '第二代環繞式，不用 High-NA。台積電宣稱邏輯密度是 N2 的 1.2 倍，推估約 375。' } ] },
    { co: 'Intel', col: '#1a8f82', pts: [
      { y: 2014.6, n: '14nm', den: 38, m: 1, gaa: 0, bs: 0, d: 'Intel 第二代鰭式，在 14 奈米停留了很多年。密度約 38（Intel 公布）。' },
      { y: 2021.8, n: 'Intel 7', den: 101, m: 1, gaa: 0, bs: 0, d: '原名 10nm，2021 年改名 Intel 7。密度約 101（Intel 公布）。之後的 Intel 4、Intel 3 沒有公布密度。' },
      { y: 2025.85, dx: -0.4, n: '18A', den: 238, m: 1, gaa: 1, bs: 1, d: '2025 年第 4 季量產，一次同時換環繞式＋背面供電（業界第一），筆電晶片 2026 年初上市。密度約 238（TechInsights 分析），比 N2 低，但速度表現好。' },
      { y: 2028.2, n: '14A', den: 310, m: 0, gaa: 1, bs: 1, d: '第二代環繞式＋背面供電，關鍵圖層用 High-NA；2027 試產、2028 量產。Intel 宣稱密度是 18A 的約 1.3 倍，推估約 310。' } ] },
    { co: 'Samsung 三星', col: '#c77a12', pts: [
      { y: 2016.7, n: '10LPE', den: 52, m: 1, gaa: 0, bs: 0, d: '三星第一代 10 奈米，比台積電早半年量產。密度約 52。' },
      { y: 2019, n: '7LPP', den: 95, m: 1, gaa: 0, bs: 0, d: '三星第一個用 EUV 的製程。密度約 95。' },
      { y: 2020.8, n: '5LPE', den: 127, m: 1, gaa: 0, bs: 0, d: '同樣叫 5 奈米，密度約 127，比台積電 N5 的 171 低不少。' },
      { y: 2025.9, dx: 0.4, n: 'SF2', den: 231, m: 1, gaa: 1, bs: 0, d: '原名 SF3（第二代 3 奈米），2024 年改名 SF2，2025 年底量產。Exynos 2600 使用。密度約 231（TechInsights 分析），和台積電 N3 家族相近。前一代 SF3E（2022）是全世界第一個量產的環繞式，但沒有公布密度。' } ] }
  ];
  Fig.add('fabs', { body: true,
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('fb-m', ['密度走勢圖', '完整表格'], 0)}</div>
        <div class="fig grow" id="fb-chart"><div class="fig-title"><span>電晶體密度（百萬個／mm²，高密度電路）</span></div><div class="fig-canvas"><svg id="fb-svg"></svg></div></div>
        <div class="fig grow" id="fb-table" style="display:none"><div class="fig-title"><span>各代製程與電晶體密度（百萬個／mm²）</span></div>
          <table class="t" style="font-size:17px"><thead><tr><th>世代</th><th>台積電</th><th>Intel</th><th>三星</th></tr></thead><tbody>
            <tr><td>14／16 奈米級</td><td>16nm：29（2015）</td><td>14nm：38（2014）</td><td>—</td></tr>
            <tr><td>10 奈米級</td><td>10nm：53（2017）</td><td>Intel 7：101（原名 10nm，2021）</td><td>10LPE：52（2016）</td></tr>
            <tr><td>7 奈米級</td><td>N7：91（2018）</td><td>—</td><td>7LPP：95（2019）</td></tr>
            <tr><td>5 奈米級</td><td>N5：171（2020）</td><td>Intel 4／3：未公布</td><td>5LPE：127（2020）</td></tr>
            <tr><td>3 奈米級</td><td>N3E：216（2023，鰭式）</td><td>—</td><td>SF3E：未公布（2022，第一個環繞式）</td></tr>
            <tr><td><b>2 奈米級</b></td><td><b>N2：313（2025）</b></td><td><b>18A：238（2025）</b></td><td><b>SF2：231（2025，原名 SF3）</b></td></tr>
            <tr><td>規劃中</td><td>A16：~340（2027）<br>A14：~375（2028）</td><td>14A：~310（2028）</td><td>SF1.4：未公布（據報導 2029）</td></tr>
          </tbody></table>
          <p class="gloss" style="margin:6px 0 0">~ 為依官方宣稱倍數推估；其餘為 WikiChip、TechInsights 分析或官方公布值</p></div>
        <div class="card key" style="min-height:96px"><h4 id="fb-h"></h4><p id="fb-d" style="font-size:20px;margin:0"></p></div></div>
      <div class="col">
        <div class="card key"><h4>台積電：密度一路領先</h4><p style="font-size:19px">N2 約 313。一次只換一樣：先換環繞式，下一代才加背面供電。</p></div>
        <div class="card alt"><h4>Intel：速度優先</h4><p style="font-size:19px">18A 約 238，密度較低，但同時換環繞式和背面供電。</p></div>
        <div class="card"><h4>三星：最早換環繞式</h4><p style="font-size:19px">SF2（原名 SF3）約 231。2022 年的 SF3E 就量產環繞式，是第一家。</p></div>
        <div class="fact" style="margin-top:auto"><div class="v">約 1.3 倍</div><div class="d">同樣叫 2 奈米級，台積電 N2 的密度約是 Intel 18A、三星 SF2 的倍數：名字不能直接比</div></div>
      </div></div>`,
    init(el) {
      const svg = U.$(el, '#fb-svg'); const { w, h } = U.fit(svg);
      U.onSeg(el, 'fb-m', i => { U.$(el, '#fb-chart').style.display = i === 1 ? 'none' : ''; U.$(el, '#fb-table').style.display = i === 0 ? 'none' : ''; });
      const X = U.lin(2014, 2029.2, 64, w - 100), Y = U.lin(0, 400, h - 44, 26);
      const g = U.svg('g', {}, svg);
      U.svg('rect', { x: X(2026.75), y: 0, width: w - 20 - X(2026.75), height: h - 36, fill: '#f2f5f8' }, g);
      for (let v = 0; v <= 400; v += 100) { U.svg('line', { x1: 52, x2: w - 20, y1: Y(v), y2: Y(v), stroke: '#e3e8ef' }, g); U.svg('text', { x: 46, y: Y(v) + 5, 'text-anchor': 'end', class: 'lbl-s mono', text: v }, g); }
      for (let y = 2014; y <= 2028; y += 2) U.svg('text', { x: X(y), y: h - 12, 'text-anchor': 'middle', class: 'lbl-s mono', text: y }, g);
      U.svg('line', { x1: X(2026.75), x2: X(2026.75), y1: 0, y2: h - 36, stroke: U.MAT.accent2, 'stroke-width': 2, 'stroke-dasharray': '5 4' }, g);
      U.svg('text', { x: X(2026.75) + 6, y: h - 46, class: 'lbl-s', fill: U.MAT.accent2, text: '今天 → 規劃' }, g);
      const all = [], bolts = [];
      LANES.forEach(ln => {
        const d = ln.pts.map((p, k) => (k ? 'L' : 'M') + X(p.y + (p.dx || 0)) + ',' + Y(p.den)).join(' ');
        U.svg('path', { d, fill: 'none', stroke: ln.col, 'stroke-width': 3, opacity: .45 }, g);
        const lp = ln.pts[ln.pts.length - 1];
        U.svg('text', { x: X(lp.y) + 30, y: Y(lp.den) + 6 + (/Samsung/.test(ln.co) ? 26 : 0), class: 'lbl', style: 'font-size:17px;font-weight:700', fill: ln.col, text: ln.co.split(' ')[0] }, g);
      });
      LANES.forEach(ln => ln.pts.forEach(p => {
        const x = X(p.y + (p.dx || 0)), cy = Y(p.den), grp = U.svg('g', { class: 'hot' }, g);
        const r = p.n.length > 4 ? 19 : 16;
        const dot = U.svg('circle', { cx: x, cy, r, fill: p.m ? ln.col : '#fff', stroke: ln.col, 'stroke-width': 3, 'stroke-dasharray': p.m ? null : '5 3' }, grp);
        U.svg('text', { x, y: cy + 4, 'text-anchor': 'middle', style: 'font-size:13px;font-weight:700', fill: p.m ? '#fff' : ln.col, text: p.n }, grp);
        U.svg('text', { x, y: cy - r - 6, 'text-anchor': 'middle', class: 'mono', style: 'font-size:14px;font-weight:700', fill: '#17202b', text: (p.m ? '' : '~') + p.den }, grp);
        if (p.bs) bolts.push(`M${x + 16},${cy + 6} l-7,12 h6 l-4,11 l11,-14 h-6 l4,-9 z`);
        grp.addEventListener('click', () => show(ln, p, dot));
        all.push({ ln, p, dot });
      }));
      bolts.forEach(d => U.svg('path', { d, fill: '#b3261e', stroke: '#fff', 'stroke-width': 1, 'pointer-events': 'none' }, g)); // ⚡ 畫在最上層
      function show(ln, p, dot) {
        all.forEach(a => a.dot.setAttribute('stroke-width', 3));
        dot.setAttribute('stroke-width', 6);
        U.$(el, '#fb-h').textContent = `${ln.co} · ${p.n} · ${Math.floor(p.y)}${p.y > 2026.75 ? '（規劃）' : ''} · 約 ${p.den} 百萬個／mm²${p.m ? '' : '（推估）'}`;
        U.$(el, '#fb-d').textContent = p.d;
      }
      const f = all.find(a => a.p.n === 'N2'); show(f.ln, f.p, f.dot);
    }
  });

  /* 成本：1,500 道關卡 */
  Fig.add('cost', { body: true,
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('ct-cv', '100 片晶圓闖關，最後剩下幾片完好？', '')}
        <div class="controls">${U.range('ct-p', '每一步的成功率', 0, 4, 1, 0, '')}</div></div>
      ${U.pageSide({
        top: `<div class="fig" style="height:230px"><div class="fig-title"><span>每片晶圓價格（美元，業界估計）</span></div><div class="fig-canvas"><svg id="ct-bar"></svg></div></div>`
      })}</div>`,
    init(el, ctx) {
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      const { c, w, h } = U.canvas(U.$(el, '#ct-cv'));
      const P = [0.999, 0.9995, 0.9999, 0.99995, 0.99999];
      const PL = ['99.9%', '99.95%', '99.99%', '99.995%', '99.999%'];
      let pi = 0, anim = 0;
      U.bind(el, 'ct-p', v => { pi = v; anim = 0; }, v => PL[v]);
      // 決定性配置：打叉的數量剛好等於文字說的報廢片數
      const seeds = Array.from({ length: 100 }, (_, k) => (k + 0.5) / 100).sort((a, b) => ((a * 7919) % 1) - ((b * 7919) % 1));
      ctx.raf(dt => {
        anim = Math.min(1, anim + dt * 0.7);
        const survive = Math.pow(P[pi], 1500);
        c.clearRect(0, 0, w, h);
        const cols = 10, sz = Math.min((w - 40) / cols, (h - 70) / 10), x0 = (w - sz * cols) / 2, y0 = 10;
        seeds.forEach((s, i) => {
          const x = x0 + (i % cols) * sz + sz / 2, y = y0 + Math.floor(i / cols) * sz + sz / 2;
          const dead = s > Math.round(survive * 100) / 100 && (i / 100) < anim;
          c.fillStyle = dead ? '#f1d6d3' : '#9fb5e3';
          c.beginPath(); c.arc(x, y, sz * 0.4, 0, 7); c.fill();
          c.strokeStyle = dead ? '#b3261e' : '#1f4fb5'; c.lineWidth = 1.2; c.stroke();
          if (dead) { c.strokeStyle = '#b3261e'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - sz * .18, y - sz * .18); c.lineTo(x + sz * .18, y + sz * .18); c.moveTo(x + sz * .18, y - sz * .18); c.lineTo(x - sz * .18, y + sz * .18); c.stroke(); }
        });
        U.txt(c, `每一步 ${PL[pi]} 成功 → 走完 1,500 步，約剩 ${Math.round(survive * 100)} 片完好`, w / 2, h - 18, { align: 'center', size: 19, w: 700, color: survive > .8 ? '#1f7a4d' : survive > .4 ? '#a8660a' : '#b3261e' });
      });
      const svg = U.$(el, '#ct-bar');
      const data = [['28nm', 3], ['7nm', 9.5], ['5nm', 16], ['3nm', 20], ['2nm', 30]];
      const ax = U.axes(svg, { x: [0, 5], y: [0, 34], yticks: [0, 10, 20, 30], fy: v => v ? v + 'k' : '0', m: { l: 44, b: 28, t: 16 } });
      const bw = (ax.x(1) - ax.x(0)) * .55;
      data.forEach(([n, v], k) => {
        const x = ax.x(k + .5);
        U.svg('rect', { x: x - bw / 2, y: ax.y(v), width: bw, height: ax.y(0) - ax.y(v), fill: k === 4 ? U.MAT.accent2 : U.MAT.accent, rx: 2 }, ax.plot);
        U.svg('text', { x, y: ax.y(v) - 5, 'text-anchor': 'middle', class: 'lbl-s mono', text: '$' + v + 'k' }, ax.plot);
        U.svg('text', { x, y: ax.h - 8, 'text-anchor': 'middle', class: 'lbl-s', text: n }, ax.plot);
      });
    }
  });

  /* 第一部分小結 */
  Fig.add('p1sum', { body: true,
    render: () => `<div class="s-body w50">
      <div class="fig"><div class="fig-title"><span>環繞式電晶體剖面（沿通道方向）</span></div><div class="fig-canvas"><svg id="ps-svg"></svg></div></div>
      <div class="col">
        <table class="t" style="font-size:19px"><thead><tr><th>要做出的部位</th><th>靠哪項技術</th></tr></thead><tbody>
          <tr class="clickable" data-go="litho1"><td>又細又密的線條</td><td>① 微影（用光畫圖）</td></tr>
          <tr class="clickable" data-go="etch1"><td>又深又直的溝槽</td><td>② 蝕刻（挖掉不要的）</td></tr>
          <tr class="clickable" data-go="depo4"><td>一層層的薄膜</td><td>③ 薄膜沉積（鋪上新材料）</td></tr>
          <tr class="clickable" data-go="depo3"><td>奈米片、源極、汲極</td><td>④ 摻雜與磊晶（長晶體、調電性）</td></tr>
          <tr class="clickable" data-go="hk1"><td>包住奈米片的閘極</td><td>⑤ 閘極與高介電材料</td></tr>
          <tr class="clickable" data-go="cmp1"><td>每一層都要平整</td><td>⑥ 化學機械平坦化（磨平）</td></tr>
          <tr class="clickable" data-go="gaaflow"><td>奈米片之間的空隙</td><td>⑦ 環繞式電晶體與導線</td></tr>
          <tr class="clickable" data-go="tcad1"><td>確認每一步都做對</td><td>⑧ 模擬、⑨ 檢測量測</td></tr>
          <tr class="clickable" data-go="d2m"><td>做成產品、良率爬上去</td><td>⑩ 從設計到量產</td></tr>
        </tbody></table>
        <div class="card key" style="margin-top:auto"><h4>第一部分回顧</h4><p style="font-size:18px;margin:2px 0">① 縮太短會漏電，所以閘極從「壓住」變成「包住」。</p><p style="font-size:18px;margin:2px 0">② 「2 奈米」只是世代代號；密度還靠把電路排得更聰明。</p><p style="font-size:18px;margin:2px 0">③ 三大廠都已換成環繞式；背面供電 Intel 18A 已導入，台積電 A16 跟上。</p></div>
      </div></div>`,
    init(el) {
      U.$$(el, '[data-go]').forEach(r => r.onclick = () => Deck.goId(r.dataset.go));
      const svg = U.$(el, '#ps-svg'); const { w, h } = U.fit(svg);
      const g = U.svg('g', {}, svg);
      const base = h * 0.8, cx = w / 2, gw = w * 0.18;
      const sh = [{ m: 'si', x: 20, y: base, w: w - 40, h: h - base - 10 }];
      [0, 1, 2].forEach(k => {
        const y = base - 44 - k * 62;
        sh.push({ m: 'hk', x: cx - gw / 2 - 5, y: y - 5, w: gw + 10, h: 32 });
        sh.push({ m: 'si', x: w * 0.2, y, w: w * 0.6, h: 22 });
        sh.push({ m: 'metal', x: cx - gw / 2, y: y + 27, w: gw, h: 30 });
        sh.push({ m: 'nit', x: cx - gw / 2 - 18, y: y + 27, w: 13, h: 30 });
        sh.push({ m: 'nit', x: cx + gw / 2 + 5, y: y + 27, w: 13, h: 30 });
      });
      sh.push({ m: 'metal', x: cx - gw / 2, y: base - 250, w: gw, h: 72 });
      sh.push({ m: 'n', x: 26, y: base - 200, w: w * 0.2 - 6, h: 200 });
      sh.push({ m: 'n', x: w * 0.8, y: base - 200, w: w * 0.2 - 26, h: 200 });
      sh.push({ label: '源極', x: 30 + w * 0.09, y: base - 208, anchor: 'middle', cls: 'lbl' });
      sh.push({ label: '汲極', x: w * 0.8 + w * 0.09, y: base - 208, anchor: 'middle', cls: 'lbl' });
      sh.push({ label: '閘極（灰）', x: cx, y: base - 258, anchor: 'middle', cls: 'lbl' });
      sh.push({ label: '↓ 奈米片（灰藍，約 5 nm 厚）', x: cx + gw / 2 + 24, y: base - 50, cls: 'lbl-s', fill: '#17202b' });
      sh.push({ label: '紫色：絕緣層', x: cx + gw / 2 + 24, y: base - 120, cls: 'lbl-s', fill: '#6b4fb0' });
      sh.push({ label: '綠色：間隔層', x: cx + gw / 2 + 24, y: base - 14, cls: 'lbl-s', fill: '#1f7a4d' });
      U.drawShapes(g, sh);
    }
  });
})();
