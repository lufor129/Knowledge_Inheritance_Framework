/* 第二部分：2 奈米以下的額外關鍵技術 */
(function () {
  const EY = '第二部分 · ⑦ 環繞式電晶體與導線';
  const EY8 = '第二部分 · ⑧ 模擬', EY9 = '第二部分 · ⑨ 檢測量測';

  /* 1. GAA 專屬流程：9 步，每一步畫出用到的製程工具，右上角同步顯示垂直切開閘極的橫切面 */
  const GSTEP = [
    { t: '疊層', d: '用磊晶一層矽鍺（黃綠）、一層矽（藍）交替長上去，每層只有幾奈米。', tech: [['④ 磊晶', 'depo3']], why: '原子要一層層對齊排好，只有磊晶做得到。', m: '每層多厚、矽鍺裡有多少鍺，用 X 光繞射和光學量測反推；抽片用 TEM 確認。' },
    { t: '切成鰭', d: '用微影畫出細線，再用蝕刻往下挖，把疊層切成一條條細長的鰭（看右上的橫切面）；鰭與鰭之間填氧化矽、磨平再回蝕，做成淺溝槽隔離（STI）。', tech: [['① 微影', 'litho1'], ['② 蝕刻', 'etch1'], ['③ 沉積', 'depo1']], why: '鰭排得非常密，常用自對準多重圖案（SAQP：靠側壁把線距減半再減半）或 EUV 才畫得出來。' },
    { t: '假閘極', d: '先鋪一層多晶矽，再微影、蝕刻出「假閘極」佔位，兩側加上間隔層。', tech: [['③ 沉積', 'depo1'], ['① 微影', 'litho1'], ['② 蝕刻', 'etch1']], why: '真的金屬怕後面的高溫，先用耐熱的假閘極撐著，最後再換掉，叫後閘極（replacement metal gate）。' },
    { t: '挖源汲極', d: '用蝕刻把假閘極兩旁的疊層挖掉，只留下閘極底下那一段。', tech: [['② 蝕刻', 'etch3']], why: '要挖得又深又直，還不能傷到閘極底下。' },
    { t: '內間隔層', d: '用只吃矽鍺的蝕刻把兩端往內溶一點，再用 ALD 整片鋪一層絕緣膜、把外面多的蝕掉，只留下缺口裡的內間隔層（綠）。', tech: [['② 選擇性蝕刻（只溶矽鍺）', 'etch1'], ['③ ALD', 'depo2']], why: '要往旁邊溶、只溶矽鍺不溶矽（選擇比極高），還要把每個小缺口都填滿。', m: '往內溶了幾奈米藏在結構裡面，從上面看不到：靠 OCD 反推，抽片用 TEM 確認。' },
    { t: '長源汲極', d: '用選擇性磊晶從奈米片兩端長出源極、汲極，一邊長一邊摻雜。', tech: [['④ 選擇性磊晶＋摻雜', 'dope3']], why: '源汲極要長成完整晶體、又要很高的濃度，邊長邊摻最好。' },
    { t: '換掉假閘極', d: '鋪上絕緣層、用 CMP 磨平到露出假閘極，再把假閘極蝕刻掉。', tech: [['③ 沉積', 'depo1'], ['⑥ CMP', 'cmp1'], ['② 蝕刻', 'etch1']], why: '要先磨平，才露得出假閘極的頂端。' },
    { t: '溶掉矽鍺', d: '用只吃矽鍺的蝕刻把夾心溶掉，矽奈米片就懸空了（兩端由源汲極撐著）。', tech: [['② 選擇性蝕刻（只溶矽鍺）', 'etch1']], why: '最難的一步：矽鍺要溶光，矽一點都不能傷。靠的是往四面八方溶、只吃矽鍺的蝕刻（氣體或藥水）。', m: '矽鍺有沒有溶乾淨、矽片有沒有被吃薄，從上面完全看不到：OCD 反推、TEM 抽查；殘留藏在片下、光學看不到：靠電子束檢測、TEM 抽查，最後看 WAT 電性。' },
    { t: '包上閘極', d: '用 ALD 在每片奈米片四周鋪上高介電層（紫）和金屬（灰，最貼近的一層是決定 Vt 的功函數金屬），再用 CMP 磨平：完成！', tech: [['⑤ 高介電', 'hk1'], ['③ ALD', 'depo2'], ['⑥ CMP', 'cmp1']], why: '片與片之間只有約 10 nm：要塞進高介電，加上決定 Vt 的功函數金屬（nFET、pFET 不同），只有 ALD 能從四面八方包均勻。' }
  ];
  function gaa(c, w, h, i, p, t) {
    // U.box 會把透明度重設為 1；這裡改成保留外面設定的 globalAlpha，淡入淡出才有效
    const B = (m, x, y, ww, hh, o) => { const ga = c.globalAlpha; U.box(c, m, x, y, ww, hh, Object.assign({}, o, { a: ga * (o && o.a !== undefined ? o.a : 1) })); c.globalAlpha = ga; };
    const L = 24, R = w * 0.64, cx = (L + R) / 2, base = h * 0.84, N = 6, gh = 72, lh = Math.min(32, (base - gh - 110) / N);
    const gw = (R - L) * 0.26, sw = 20, top = base - N * lh;
    const g0 = cx - gw / 2, g1 = cx + gw / 2, s0 = g0 - sw, s1 = g1 + sw, x0 = L + 16, x1 = R - 16;
    const ph = (k, a = 0, b = 1) => U.clamp((p - a) / (b - a), 0, 1);
    const at = k => i > k ? 1 : i === k ? p : 0;
    B('si', L, base, R - L, h - base - 16);
    // 源極、汲極（第 6 步長出來）
    const epi = at(5);
    if (epi > 0) { const eh = (base - top + 8) * epi; B('n', x0, base - eh, s0 - x0, eh); B('n', s1, base - eh, x1 - s1, eh); }
    // 絕緣層（第 7 步）
    if (i >= 6) { const f = i === 6 ? ph(0, 0, 0.4) : 1, oh = (gh + 18) * f, cut = i === 6 && p > 0.45 ? 18 : i > 6 ? 18 : 0; B('ox', x0, top - 8 - oh + cut, s0 - x0, oh - cut); B('ox', s1, top - 8 - oh + cut, x1 - s1, oh - cut); }
    // 疊層
    const grown = i === 0 ? p * N : N;
    for (let k = 0; k < N; k++) {
      if (k >= grown) break;
      const y = base - (k + 1) * lh, sige = k % 2 === 0, f = i === 0 ? U.clamp(grown - k, 0, 1) : 1;
      // 源汲極區在第 4 步由上往下挖掉
      const recess = i < 3 ? 0 : i === 3 ? U.clamp(p * N - (N - 1 - k), 0, 1) : 1;
      if (!sige) {
        B('si', s0, y, s1 - s0, lh * (i === 0 ? f : 1));
        if (recess < 1) { const hh = lh * (i === 0 ? f : 1); c.globalAlpha = 1 - recess; B('si', x0, y, s0 - x0, hh); B('si', s1, y, x1 - s1, hh); c.globalAlpha = 1; }
      } else {
        let a0 = s0, a1 = s1;
        if (i >= 4) { const d = i === 4 ? ph(0, 0, 0.5) : 1; a0 = U.lerp(s0, g0, d); a1 = U.lerp(s1, g1, d); }
        const gone = i < 7 ? 0 : i === 7 ? p : 1;
        if (gone < 1) { c.globalAlpha = 1 - gone; B('sige', a0, y, a1 - a0, lh * (i === 0 ? f : 1)); c.globalAlpha = 1; }
        if (recess < 1) { const hh = lh * (i === 0 ? f : 1); c.globalAlpha = 1 - recess; B('sige', x0, y, s0 - x0, hh); B('sige', s1, y, x1 - s1, hh); c.globalAlpha = 1; }
        const isp = i < 4 ? 0 : i === 4 ? ph(0, 0.55, 1) : 1;
        if (isp > 0) { c.globalAlpha = isp; B('nit', s0, y, sw, lh); B('nit', g1, y, sw, lh); c.globalAlpha = 1; }
        // 最後一步：縫裡長高介電＋金屬
        if (i === 8) { const hk = ph(0, 0, 0.35), mt = ph(0, 0.35, 0.8); B('hk', g0, y, gw, lh, { a: hk }); if (mt > 0) B('metal', g0, y + 3, gw, (lh - 6) * mt); }
      }
    }
    // 假閘極與間隔層
    if (i === 2) {
      const dep = ph(0, 0, 0.45), pat = ph(0, 0.5, 0.85), spc = ph(0, 0.8, 1);
      if (dep > 0) { c.globalAlpha = 1 - pat; B('poly', x0, top - gh * dep, x1 - x0, gh * dep); c.globalAlpha = 1; }
      if (p > 0.5) B('poly', g0, top - gh, gw, gh);
      if (spc > 0) { c.globalAlpha = spc; B('nit', s0, top - gh, sw, gh); B('nit', g1, top - gh, sw, gh); c.globalAlpha = 1; }
    }
    if (i >= 3 && i <= 6) { const f = i === 6 ? 1 - ph(0, 0.6, 1) : 1; if (f > 0) B('poly', g0, top - gh, gw, gh, { a: f }); }
    if (i >= 3) { B('nit', s0, top - gh, sw, gh); B('nit', g1, top - gh, sw, gh); }
    if (i === 8) { const hk = ph(0, 0, 0.35), mt = ph(0, 0.35, 0.8); B('hk', g0, top - gh, gw, gh, { a: hk }); if (mt > 0) B('metal', g0 + 3, top - gh * mt, gw - 6, gh * mt); }
    // ---- 製程動作 ----
    const drops = (xa, xb, y1, col, n, spd, r) => { for (let k = 0; k < n; k++) { const hr = v => { const q = Math.sin(v) * 43758.5453; return q - Math.floor(q); }, f = (t * spd + hr(k * 7.13)) % 1, x = xa + hr(k * 12.9898 + 1.7) * (xb - xa); U.dot(c, x, U.lerp(50, y1, f), r || 3, col); } };
    const arrows = (xs, y1, col) => xs.forEach((x, k) => { const f = (t * 1.2 + k * 0.17) % 1, y = U.lerp(46, y1, f); U.arrow(c, x, y - 14, x, y, col, 2); });
    const pad = y => { const x = U.lerp(L, R - 120, 0.5 + 0.5 * Math.sin(t * 3)); c.fillStyle = '#5a6470'; c.fillRect(x, y - 16, 120, 12); U.tag(c, 'CMP 研磨墊', x + 60, y - 22, { align: 'center', size: 13 }); };
    if (i === 0 && p < 1) drops(x0, x1, base - Math.floor(grown) * lh - 4, grown % 2 < 1 ? '#8fa33a' : '#3f6fd0', 16, 0.9);
    if (i === 1 && p < 1) { if (p < 0.5) { c.fillStyle = '#1b2430'; c.fillRect(L, 44, R - L, 6); arrows([x0 + 30, cx - 60, cx, cx + 60, x1 - 30], top - 6, '#8b5cc7'); U.tag(c, '微影：光穿過光罩', R - 10, 64, { align: 'right', size: 13, color: '#6b3fb0' }); } else { arrows([x0 + 30, cx - 60, cx, cx + 60, x1 - 30], top - 6, '#b3541e'); U.tag(c, '蝕刻：離子往下挖', R - 10, 64, { align: 'right', size: 13, color: '#b3541e' }); } U.tag(c, '這一刀切在另一個方向 → 看右上', cx, top - 16, { align: 'center', size: 14 }); }
    if (i === 2 && p < 0.45) drops(x0, x1, top - gh * ph(0, 0, 0.45) - 4, '#b39a5e', 14, 0.9);
    if (i === 2 && p > 0.5 && p < 0.85) arrows([x0 + 20, x0 + 70, s0 - 20, s1 + 20, x1 - 70, x1 - 20], top - 6, '#b3541e');
    if (i === 3 && p < 1) arrows([x0 + 20, (x0 + s0) / 2, s0 - 16, s1 + 16, (s1 + x1) / 2, x1 - 20], base - 6, '#b3541e');
    if (i === 4 && p < 0.5) for (let k = 0; k < 3; k++) { const y = base - (2 * k + 1) * lh + lh / 2; U.dot(c, s0 - 8 + Math.sin(t * 6 + k) * 3, y, 4, '#2f9a63'); U.dot(c, s1 + 8 + Math.sin(t * 6 + k) * 3, y, 4, '#2f9a63'); }
    if (i === 4 && p >= 0.5 && p < 1) drops(x0, x1, base, 'rgba(47,154,99,.7)', 18, 1.1, 2.5);
    if (i === 5 && p < 1) for (let k = 0; k < 16; k++) { const f = (t * 0.7 + k / 16) % 1, xs = k % 2 ? [x0 + 10, s0 - 10] : [s1 + 10, x1 - 10], x = U.lerp(xs[0], xs[1], ((k * 37) % 16) / 16); U.dot(c, x, U.lerp(base, base - (base - top) * epi, f), 3, k % 3 ? '#1f4fb5' : '#c0392b'); }
    if (i === 6) { if (p < 0.4) drops(x0, x1, top - 8 - (gh + 18) * ph(0, 0, 0.4), 'rgba(224,190,90,.9)', 14, 1); else if (p < 0.6) pad(top - gh); else if (p < 1) arrows([g0 + 12, cx, g1 - 12], top - 6, '#b3541e'); }
    if (i === 7 && p < 1) for (let k = 0; k < 12; k++) { const lay = [0, 2, 4][k % 3], y = base - (lay + 1) * lh + lh / 2, f = (t * 0.8 + k / 12) % 1; U.dot(c, U.lerp(g0 + 4, g1 - 4, f), y, 3.5, '#2f9a63'); }
    if (i === 7 && p > 0.5) U.tag(c, '奈米片懸空了！', cx, top - gh - 12, { align: 'center', size: 15, color: '#b3261e' });
    if (i === 8 && p < 0.8) drops(g0, g1, top - 4, 'rgba(120,90,200,.8)', 10, 1.2, 2.5);
    if (i === 8 && p >= 0.8 && p < 1) pad(top - gh);
    U.txt(c, `${i + 1}. ${GSTEP[i].t}`, L + 4, 26, { size: 18, w: 700, color: '#17202b' });
    U.txt(c, '沿電流方向切開', R - 6, 26, { align: 'right', size: 13, color: '#6a7888' });
    // ---- 右上：垂直切開閘極的橫切面 ----
    const ix = w * 0.68, iw = w - ix - 12, iy = 36, ih = h * 0.62, icx = ix + iw / 2, ib = iy + ih - 24, il = 19;
    c.fillStyle = '#f5f7fa'; c.fillRect(ix, iy, iw, ih); c.strokeStyle = '#c3cfdc'; c.lineWidth = 1; c.strokeRect(ix, iy, iw, ih);
    U.txt(c, '橫切面（垂直切開閘極）', icx, iy - 8, { align: 'center', size: 13, w: 600, color: '#3e4b5b' });
    U.box(c, 'si', ix + 6, ib, iw - 12, 18);
    const fwFull = iw - 24, fw = i < 1 ? fwFull : i === 1 ? U.lerp(fwFull, iw * 0.34, p) : iw * 0.34, fx = icx - fw / 2, itop = ib - N * il;
    // 淺溝槽隔離（STI）：切完鰭後，鰭兩側的溝槽填氧化矽，閘極就坐在它上面
    const sti = i < 1 ? 0 : i === 1 ? ph(0, 0.7, 1) : 1;
    if (sti > 0) { c.globalAlpha = sti; U.box(c, 'ox', ix + 6, ib, fx - ix - 6, 12); U.box(c, 'ox', fx + fw, ib, ix + iw - 6 - fx - fw, 12); c.globalAlpha = 1; if (i <= 2) U.tag(c, 'STI', ix + (fx - 16 - ix) / 2, ib - 8, { align: 'center', size: 13, color: '#8a6a2e' }); }
    const igrown = i === 0 ? p * N : N;
    for (let k = 0; k < N; k++) {
      if (k >= igrown) break;
      const y = ib - (k + 1) * il, sige = k % 2 === 0;
      if (sige) { const gone = i < 7 ? 0 : i === 7 ? p : 1; if (gone < 1) U.box(c, 'sige', fx, y, fw, il, { a: 1 - gone }); }
      else U.box(c, 'si', fx, y, fw, il);
    }
    const dummy = i === 2 ? ph(0, 0.4, 0.9) : (i >= 3 && i <= 5) ? 1 : i === 6 ? 1 - ph(0, 0.6, 1) : 0;
    if (dummy > 0) { c.globalAlpha = dummy; U.box(c, 'poly', fx - 16, itop - 26, fw + 32, 26); U.box(c, 'poly', fx - 16, itop, 16, ib - itop); U.box(c, 'poly', fx + fw, itop, 16, ib - itop); c.globalAlpha = 1; }
    if (i === 8) {
      const hk = ph(0, 0, 0.35), mt = ph(0, 0.35, 0.8);
      if (mt > 0) { c.globalAlpha = mt; U.box(c, 'metal', fx - 18, itop - 28, fw + 36, ib - itop + 28); c.globalAlpha = 1; }
      for (let k = 1; k < N; k += 2) { const y = ib - (k + 1) * il; if (hk > 0) U.box(c, 'hk', fx - 3, y - 3, fw + 6, il + 6, { a: hk }); U.box(c, 'si', fx, y, fw, il); }
      if (p > 0.8) U.tag(c, '四面都被閘極包住', icx, iy + 18, { align: 'center', size: 13, color: '#1f7a4d' });
    }
    if (i === 1 && p > 0.6) U.tag(c, '切成細長的鰭', icx, iy + 18, { align: 'center', size: 13 });
    if (i === 7 && p > 0.5) U.tag(c, '矽片懸空，上下都空了', icx, iy + 18, { align: 'center', size: 13, color: '#b3261e' });
    if (i >= 2 && i <= 6) U.tag(c, '假閘極從三面跨住鰭', icx, iy + 18, { align: 'center', size: 13 });
  }
  Fig.add('gaaflow', { body: true,
    eyebrow: EY, render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('g1-cv', '左：沿電流方向的剖面　右上：垂直切開閘極的橫切面', '')}${U.stepperHTML('g1-st')}</div>
      ${U.pageSide({
        top: `<div class="card newcard"><h4>這一步用到的技術（點擊跳回該章）</h4><div id="g1-tech" style="display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 6px"></div><p id="g1-why" style="margin:0"></p><p id="g1-m" style="margin:8px 0 0;color:#a8660a;font-weight:600" hidden></p></div>`,
        extra: `<div class="legend" style="display:grid;grid-template-columns:auto 1fr;gap:3px 10px;align-items:baseline">${[
          ['si', '奈米片：電流走的路（底下是晶圓）'], ['sige', '犧牲層：先佔位，第 8 步溶掉'], ['nit', '間隔層、內間隔層：隔開閘極和源汲極'], ['poly', '假閘極：耐高溫先佔位，第 7 步拿掉'],
          ['n', '源極、汲極：電流的進出口'], ['ox', '絕緣層：蓋住源汲極，磨平用'], ['hk', '閘極絕緣層：擋住漏電'], ['metal', '真正的閘極：控制電流通不通']
        ].map(([k, u]) => `<span style="white-space:nowrap"><i style="background:${U.MAT[k]}"></i>${U.MAT_NAME[k]}</span><span>${u}</span>`).join('')}</div><button class="btn" id="g1-3d" type="button">看 3D 模型 →</button>`
      })}</div>`,
    init(el, ctx) {
      const steps = GSTEP.map((s, i) => ({ t: s.t, d: s.d, draw: (c, w, h, p, tt) => gaa(c, w, h, i, p, tt) }));
      U.animSteps(el, ctx, { canvas: 'g1-cv', stepper: 'g1-st', steps, interval: 3800, dur: 2.4, onStep: i => {
        const box = U.$(el, '#g1-tech');
        box.innerHTML = GSTEP[i].tech.map(([n, id]) => `<button class="btn" type="button" data-go="${id}" style="padding:4px 10px;font-size:16px">${n} →</button>`).join('');
        U.$$(box, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
        U.$(el, '#g1-why').textContent = GSTEP[i].why;
        const gm = U.$(el, '#g1-m'); gm.hidden = !GSTEP[i].m; gm.textContent = GSTEP[i].m ? '👁 怎麼量：' + GSTEP[i].m : '';
      } });
      U.$(el, '#g1-3d').onclick = () => Deck.goId('struct3d');
    }
  });

  /* 2. 區域選擇性沉積 */
  const ASD = [
    ['① 塗上「防沾塗層」', '一種長條狀的分子，頭部只會抓住絕緣層表面，排成一片像刷毛的薄層；在金屬上抓不住。'],
    ['② 材料分子飛過來', '沉積用的分子碰到金屬就黏住、起反應；碰到防沾塗層就滑開彈走。'],
    ['③ 長膜＋順手清一下', '重複很多輪，金屬上的膜越長越厚。偶爾在塗層上沾到的小顆粒，用短暫蝕刻清掉。'],
    ['④ 移除防沾塗層', '把塗層洗掉：只有金屬上長了膜，位置完全對齊，不需要光罩。']
  ];
  Fig.add('asd', { body: true,
    eyebrow: '第二部分 · ③ 薄膜沉積', render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('a1-m', ['傳統：鋪滿再挖掉', '新方法：只長在金屬上', '怎麼做到？（分子放大）', '困難點'], 0)}<button class="btn" type="button" id="a1-rp">↻ 重播</button></div>${U.figHTML('a1-cv', '表面剖面：橘色是金屬，黃色是絕緣層', '')}<div id="a1-sw" hidden>${U.stepperHTML('a1-st')}</div><div class="controls" id="a1-hc" hidden>${U.range('a1-th', '想長的厚度', 1, 10, 0.5, 3, ' nm')}${U.seg('a1-fix', ['一口氣長完', '邊長邊修'], 0)}</div></div>
      ${U.pageSide({
        top: `<div class="card key" id="a1-card"><h4 id="a1-h"></h4><div class="bigword" id="a1-t" style="font-size:24px"></div><p id="a1-d" style="font-size:18.5px"></p></div>`,
        extra: `<div class="card newcard"><h4>新技術：解決什麼問題？</h4><p>2 奈米級的導線間距只剩 20 幾奈米，微影只要對偏幾奈米，上下層就會短路或接不上。選擇性沉積「自己對準」，還省下一整輪微影和蝕刻。</p><h4>用在哪裡？</h4><p>導線層：在銅導線頂端只長一層保護蓋、讓上下層的連接孔自動對準。部分應用已量產，2 奈米之後用得更多。</p></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#a1-cv'));
      let m = 0, g = 0, T = 0;
      const card = (hd, t, d) => { U.$(el, '#a1-h').textContent = hd; U.$(el, '#a1-t').textContent = t; U.$(el, '#a1-d').textContent = d; };
      let lastStage = -1;
      const mol = []; // 分子放大模式的元素
      let stage = 0;
      const stp = U.stepper(el, 'a1-st', ASD.map(a => ({ t: a[0], d: '' })), k => { stage = k; T = 0; card(`分子放大 · 第 ${k + 1} / 4 步`, ASD[k][0], ASD[k][1]); if (k === 0) mol.length = 0; }, ctx, { interval: 4600 });
      U.$(el, '#a1-st-t').hidden = true;
      let TH3 = 3, FIX = 0;
      const hardCard = () => { const cyc = Math.ceil(TH3 / 2), bad = FIX ? Math.round(1 + cyc * 0.6) : Math.min(24, Math.round(Math.max(0, (Math.exp((TH3 - 2) / 1.8) - 1) * 3))), steps = FIX ? cyc * 2 : 1; card('困難點', FIX ? `邊長邊修：${steps} 道步驟` : '選擇性會失守', FIX ? `每長約 2 nm 就用輕微蝕刻把零星小島清掉，再繼續長。絕緣層上剩約 ${bad} 個缺陷，代價是步驟和時間變多。` : `長得越厚，絕緣層上越容易冒出零星的小島（缺陷）。現在厚度 ${TH3} nm，絕緣層上約 ${bad} 個。`); };
      U.bind(el, 'a1-th', v => { TH3 = v; if (m === 3) hardCard(); }, v => v + ' nm');
      U.onSeg(el, 'a1-fix', i => { FIX = i; if (m === 3) hardCard(); });
      U.onSeg(el, 'a1-m', i => { m = i; g = 0; T = 0; U.$(el, '#a1-sw').hidden = i !== 2; U.$(el, '#a1-hc').hidden = i !== 3; U.$(el, '#a1-rp').hidden = i === 3; if (i === 3) hardCard(); if (i === 2) stp.show(0); if (i === 0) card('需要的步驟', '4 步', '鋪滿 → 光阻曝光 → 蝕刻 → 去光阻。光阻只要對偏一點點，就做壞了。'); if (i === 1) card('需要的步驟', '不用微影', '材料自己只長在金屬上，自動對準，省下一整輪微影和蝕刻。'); });
      // 重播：前兩個分頁從頭再畫一次；分子放大重播目前這一步
      U.$(el, '#a1-rp').addEventListener('click', () => { g = 0; T = 0; if (m === 2) stp.show(stage); });
      const pads = [[0.08, 0.22], [0.36, 0.5], [0.64, 0.78]];
      ctx.raf((dt, t) => {
        g = Math.min(1, g + dt * 0.18);
        c.clearRect(0, 0, w, h);
        const base = h * 0.66, L = 30, R = w - 30, px = f => L + f * (R - L);
        if (m === 2) { zoom(dt, t); return; }
        if (m === 3) { hard(t); return; }
        U.box(c, 'ox', L, base, R - L, 60); pads.forEach(([a, b]) => U.box(c, 'cu', px(a), base, px(b) - px(a), 60));
        U.box(c, 'si', L, base + 60, R - L, h - base - 90);
        const TH = 34;
        if (m === 1) {
          pads.forEach(([a, b]) => { const hh = TH * g; c.fillStyle = U.MAT.hk; c.beginPath(); c.moveTo(px(a), base); c.lineTo(px(a), base - hh); c.quadraticCurveTo((px(a) + px(b)) / 2, base - hh - 8 * g, px(b), base - hh); c.lineTo(px(b), base); c.fill(); });
          if (g < 1) for (let k = 0; k < 24; k++) { const x = L + ((k * 71 + t * 40) % (R - L)), y = 40 + ((k * 37 + t * 90) % (base - 60)); const onPad = pads.some(([a, b]) => x > px(a) && x < px(b)); U.dot(c, x, y, 3.5, onPad ? '#9d80d6' : 'rgba(157,128,214,.35)'); }
          U.tag(c, '材料只黏在金屬上，絕緣層上黏不住', w / 2, 30, { align: 'center', size: 16 });
        } else {
          const st = Math.min(3, Math.floor(g * 4)), f = g >= 1 ? 1 : (g * 4) % 1;
          c.fillStyle = U.MAT.hk; c.fillRect(L, base - TH * (st === 0 ? f : 1), R - L, TH * (st === 0 ? f : 1));
          if (st >= 1) pads.forEach(([a, b]) => { U.box(c, 'pr', px(a), base - TH - 26 * (st === 1 ? f : 1), px(b) - px(a), 26 * (st === 1 ? f : 1)); });
          if (st >= 2) { c.fillStyle = '#fbfcfd'; pads.concat([[1.1, 1.2]]).reduce((prev, [a, b]) => { c.fillRect(px(prev), base - TH, (px(a) - px(prev)) * (st === 2 ? f : 1), TH); return b; }, 0); }
          if (st >= 3) { c.fillStyle = '#fbfcfd'; pads.forEach(([a, b]) => c.fillRect(px(a), base - TH - 26, px(b) - px(a), 26 * f)); }
          U.tag(c, ['① 整片鋪滿', '② 塗光阻、曝光顯影', '③ 蝕刻掉不要的部分', '④ 去除光阻'][st], w / 2, 30, { align: 'center', size: 16 });
          if (st >= 1) U.tag(c, '光阻若對偏一點點，就做壞了', w / 2, 56, { align: 'center', size: 14, color: '#b3261e' });
        }
      });
      // 困難點：長越厚，絕緣層上越容易冒出零星小島；邊長邊修可以壓下來
      function hard(t) {
        const base = h * 0.66, L = 30, R = w - 30, px = f => L + f * (R - L), S = 7;
        U.box(c, 'ox', L, base, R - L, 60); pads.forEach(([a, b]) => U.box(c, 'cu', px(a), base, px(b) - px(a), 60));
        U.box(c, 'si', L, base + 60, R - L, h - base - 90);
        const hh = TH3 * S;
        const ov = hh * 0.35; // 香菇頭：膜也會往兩旁長
        pads.forEach(([a, b]) => { c.fillStyle = U.MAT.hk; c.beginPath(); c.moveTo(px(a), base); c.quadraticCurveTo(px(a) - ov, base - hh * 0.4, px(a) - ov, base - hh * 0.8); c.quadraticCurveTo((px(a) + px(b)) / 2, base - hh - 8, px(b) + ov, base - hh * 0.8); c.quadraticCurveTo(px(b) + ov, base - hh * 0.4, px(b), base); c.fill(); });
        if (ov > 14) U.tag(c, '也往旁邊長（香菇頭）', px(0.29), base - hh - 22, { align: 'center', size: 14, color: '#b3541e' });
        const cyc = Math.ceil(TH3 / 2), bad = FIX ? Math.round(1 + cyc * 0.6) : Math.min(24, Math.round(Math.max(0, (Math.exp((TH3 - 2) / 1.8) - 1) * 3)));
        const gaps = [[0.22, 0.36], [0.5, 0.64], [0.78, 1]];
        for (let k = 0; k < bad; k++) { const gp = gaps[k % 3], f = ((Math.floor(k / 3) * 0.618 + 0.13) % 1), x = px(gp[0] + (gp[1] - gp[0]) * (0.1 + 0.8 * f)), r = 4 + ((k * 7) % 5); c.fillStyle = U.MAT.hk; c.beginPath(); c.arc(x, base, r, Math.PI, 0); c.fill(); c.strokeStyle = '#b3261e'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, base - 2, r + 4, 0, 7); c.stroke(); }
        U.tag(c, FIX ? '每長約 2 nm 就輕輕蝕刻一次，把零星小島清掉' : '長越厚，絕緣層上越容易冒出零星小島（紅圈）', w / 2, 30, { align: 'center', size: 16 });
        if (FIX) { for (let k = 0; k < cyc; k++) { const x = px(0.05) + k * 46; c.fillStyle = '#9d80d6'; c.fillRect(x, 50, 20, 14); c.fillStyle = '#c0392b'; c.fillRect(x + 22, 50, 20, 14); } U.txt(c, '紫＝長　紅＝修（步驟變多、時間變長）', px(0.05), 82, { size: 13, color: '#3e4b5b' }); }
        U.txt(c, '小島夠大，就可能讓相鄰導線短路', R, base + 84, { align: 'right', size: 13, color: '#b3261e' });
      }
      // 分子放大：金屬｜絕緣層｜金屬，四個階段用上一步／下一步切換
      const DUR = 4.2;
      function zoom(dt, t) {
        T = Math.min(DUR, T + dt); const f = T / DUR;
        const base = h * 0.72, L = 20, R = w - 20, W = R - L;
        const zones = [[L, L + W * 0.3, 'cu'], [L + W * 0.3, L + W * 0.7, 'ox'], [L + W * 0.7, R, 'cu']];
        zones.forEach(([a, b, k]) => U.box(c, k, a, base, b - a, h - base - 10));
        U.tag(c, '金屬', L + W * 0.15, h - 24, { align: 'center', size: 15 }); U.tag(c, '絕緣層', L + W * 0.5, h - 24, { align: 'center', size: 15 }); U.tag(c, '金屬', L + W * 0.85, h - 24, { align: 'center', size: 15 });
        const ox0 = L + W * 0.3, ox1 = L + W * 0.7, n = 22, sp = (ox1 - ox0) / n;
        // 防沾塗層（刷毛狀分子）
        const samA = stage === 0 ? U.clamp(f * 1.6, 0, 1) : stage === 3 ? 1 - U.clamp(f * 1.6, 0, 1) : 1;
        const samH = 56;
        for (let k = 0; k < n; k++) {
          const shown = stage === 0 ? k / n < samA : true;
          if (!shown) continue;
          const x = ox0 + (k + 0.5) * sp, a = stage === 3 ? samA : 1;
          c.globalAlpha = a; c.strokeStyle = '#2f9a63'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, base); c.lineTo(x + Math.sin(k + t) * 2, base - samH); c.stroke();
          U.dot(c, x, base - 2, 4, '#1f7a4d'); c.globalAlpha = 1;
        }
        if (stage === 0) {
          if (f < 1) for (let k = 0; k < 3; k++) { const x = L + W * (0.06 + k * 0.08), y = base - 20 - ((t * 60 + k * 30) % 60); c.strokeStyle = '#2f9a63'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 30); c.stroke(); U.dot(c, x, y, 4, '#1f7a4d'); }
          U.tag(c, '在金屬上抓不住 → 飄走', L + W * 0.15, base - 110, { align: 'center', size: 16, color: '#1f7a4d' });
          U.tag(c, '抓住絕緣層，排成「刷毛」', (ox0 + ox1) / 2, base - samH - 18, { align: 'center', size: 16, color: '#1f7a4d' });
        }
        // 金屬上的膜
        const film = stage === 0 ? 0 : stage === 1 ? 8 * f : stage === 2 ? 8 + 26 * f : 34;
        [[zones[0][0], zones[0][1]], [zones[2][0], zones[2][1]]].forEach(([a, b]) => U.box(c, 'hk', a, base - film, b - a, film));
        // 材料分子：落下，金屬上黏住、塗層上彈走
        if (stage === 1 || stage === 2) {
          if (f < 1 && Math.random() < dt * 30) mol.push({ x: U.rand(L + 10, R - 10), y: 30, vy: 150, vx: 0, st: 0 });
          if (stage === 2 && f > 0.35 && f < 0.4 && !mol.some(q => q.stray)) mol.push({ x: (ox0 + ox1) / 2 + 30, y: base - samH - 5, vy: 0, vx: 0, st: 2, stray: 1 });
        }
        for (let k = mol.length - 1; k >= 0; k--) {
          const q = mol[k];
          if (q.stray) {
            if (stage === 2 && f > 0.75) { const a = 1 - (f - 0.75) * 4; c.globalAlpha = Math.max(0, a); }
            U.dot(c, q.x, q.y, 8, '#9d80d6'); c.globalAlpha = 1;
            if (stage === 2 && f > 0.55 && f < 0.75) U.tag(c, '偶爾沾到一點', q.x, q.y - 14, { align: 'center', size: 15, color: '#b3261e' });
            if (stage === 2 && f >= 0.75) U.tag(c, '短暫蝕刻 → 清掉', q.x, q.y - 14, { align: 'center', size: 15, color: '#1f7a4d' });
            if (stage !== 2) mol.splice(k, 1);
            continue;
          }
          q.x += q.vx * dt; q.y += q.vy * dt;
          const onOx = q.x > ox0 && q.x < ox1;
          if (q.st === 0 && onOx && q.y > base - samH - 4) { q.st = 1; q.vy = -170; q.vx = U.rand(-60, 60); }
          if (q.st === 0 && !onOx && q.y > base - film - 4) { mol.splice(k, 1); continue; }
          if (q.y < 0 || q.x < 0 || q.x > w) { mol.splice(k, 1); continue; }
          U.dot(c, q.x, q.y, 6.5, q.st === 1 ? 'rgba(157,128,214,.5)' : '#9d80d6');
        }
        if (stage === 1) { U.tag(c, '黏住 ✓', L + W * 0.15, base - film - 20, { align: 'center', size: 16, color: '#6a4fb0' }); U.tag(c, '彈走 ✗', (ox0 + ox1) / 2, base - samH - 22, { align: 'center', size: 16, color: '#b3261e' }); }
        if (stage === 3 && f > 0.6) U.tag(c, '只有金屬上有膜，自動對齊', w / 2, 36, { align: 'center', size: 17, color: '#1f7a4d' });
        U.txt(c, ASD[stage][0], L, 26, { size: 18, w: 700, color: '#17202b' });
      }
    }
  });

  /* TCAD 1：在電腦裡先做、先測 */
  function tcadDev(c, x0, y0, W, H, p, t, mode) {
    // 沿電流方向切開的環繞式電晶體；p 控制「長出來」的進度（製程模擬）
    const base = y0 + H * 0.82, sx0 = x0 + W * 0.3, sx1 = x0 + W * 0.7, sh = H * 0.07;
    const ys = [0.28, 0.46, 0.64].map(f => y0 + H * f);
    const on = f => mode !== 'build' || p > f, a = f => mode !== 'build' ? 1 : U.clamp((p - f) * 6, 0, 1);
    if (on(0)) U.box(c, 'si', x0, base, W, y0 + H - base, { a: a(0) });
    if (on(0.15)) ys.forEach(y => U.box(c, 'si', x0 + W * 0.2, y, W * 0.6, sh, { a: a(0.15) }));
    // 和gaaflow 那一頁同一個順序：先放耐高溫的假閘極佔位，源汲極、加熱之後，最後才換成高介電＋金屬閘極
    const rmg = on(0.78);
    if (on(0.3) && !rmg) { U.box(c, 'poly', sx0, y0 + H * 0.12, sx1 - sx0, base - y0 - H * 0.12, { a: a(0.3) * 0.95 }); ys.forEach(y => U.box(c, 'si', sx0, y, sx1 - sx0, sh)); }
    if (rmg) { U.box(c, 'metal', sx0, y0 + H * 0.12, sx1 - sx0, base - y0 - H * 0.12, { a: a(0.78) * 0.95 }); ys.forEach(y => U.box(c, 'si', sx0, y, sx1 - sx0, sh)); ys.forEach(y => { U.box(c, 'hk', sx0, y - 3, sx1 - sx0, 3, { a: a(0.78) }); U.box(c, 'hk', sx0, y + sh, sx1 - sx0, 3, { a: a(0.78) }); }); }
    if (on(0.45)) { U.box(c, 'n', x0 + W * 0.04, y0 + H * 0.2, W * 0.22, base - y0 - H * 0.2, { a: a(0.45) }); U.box(c, 'n', x0 + W * 0.74, y0 + H * 0.2, W * 0.22, base - y0 - H * 0.2, { a: a(0.45) }); }
    if (mode === 'build' && p > 0.6) { // 加熱：雜質往通道擴散一點點
      const r = Math.min(1, (p - 0.6) / 0.18);
      [[x0 + W * 0.26, 1], [x0 + W * 0.74, -1]].forEach(([ex, d]) => { const g = c.createLinearGradient(ex, 0, ex + d * W * 0.05 * r, 0); g.addColorStop(0, 'rgba(91,143,217,.8)'); g.addColorStop(1, 'rgba(91,143,217,0)'); c.fillStyle = g; ys.forEach(y => c.fillRect(Math.min(ex, ex + d * W * 0.05 * r), y, W * 0.05 * r, sh)); });
    }
    return { ys, sh, sx0, sx1, base };
  }
  const TC1 = [
    { t: '寫好配方', d: '把每一道製程的條件輸入電腦：鋪多厚、挖多深、打多少雜質、加熱多久。' },
    { t: '製程模擬', d: '電腦照著配方一步步「長」出虛擬的電晶體，連雜質加熱後擴散多少都算得出來。' },
    { t: '元件模擬', d: '把結構切成幾萬個小格子，算每一格裡的電子怎麼走，得到開、關時的電流。' },
    { t: '和真實比對', d: '拿真的晶片量測結果（例如電子顯微鏡照片、電流）來校正，模擬才會越來越準。' }
  ];
  const RECIPE = ['① 磊晶：矽 5 nm／矽鍺 10 nm，各 3 層', '② 蝕刻：切出 40 nm 寬的鰭、做假閘極', '③ 源汲極磊晶：邊長邊摻磷', '④ 加熱：1,000°C、1 秒', '⑤ 換閘極：高介電 1.5 nm＋金屬'];
  Fig.add('tcad1', { body: true,
    eyebrow: EY8, render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('tc1-m', ['① 怎麼模擬', '② 3D 模型（GAA）', '③ 虛擬實驗：拖拖看'], 0)}</div>
        <div id="tc1-p0" style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0">${U.figHTML('tc1-cv', '電腦螢幕裡的虛擬工廠', '')}${U.stepperHTML('tc1-st')}</div>
        <div id="tc1-p1" hidden style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0"><div class="fig grow"><div class="fig-title"><span>TCAD 的 3D 環繞式電晶體模型（示意，可拖曳旋轉）</span></div><div class="fig-canvas" id="tc1-3d" style="position:relative"></div></div>
          <div class="controls">${U.seg('tc1-v', ['看外觀', '切開看奈米片（和 TEM 同方向）'], 0)}<button class="btn" type="button" id="tc1-cur">電子流動：開</button></div></div>
        <div id="tc1-p2" hidden style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0"><div class="controls">${U.seg('tc2-s', ['關閉狀態（閘極給 0）', '打開狀態（閘極給 1）'], 0)}</div>
        ${U.figHTML('tc2-cv', '模擬結果：一片奈米片沿電流方向切開', '')}
        <div class="controls">${U.range('tc2-l', '閘極長度', 8, 20, 1, 14, ' nm')}${U.range('tc2-t', '奈米片厚度', 3, 10, 0.5, 5, ' nm')}</div></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="tc1-h"></h4><p id="tc1-d" style="font-size:17px;margin:0"></p></div>`,
        meters: [['tc2-off', '關閉時漏電'], ['tc2-on', '打開時電流']],
        extra: `<div class="card key" id="tc2-card"><h4>你剛剛做了幾次實驗</h4><div class="bigword" id="tc2-n"></div><p id="tc2-c" style="font-size:17px"></p></div>`
      })}</div>`,
    init(el, ctx) {
      const steps = TC1.map((s, i) => Object.assign({}, s, { draw: (c, w, h, p, t) => {
        // 螢幕外框
        c.fillStyle = '#1b2430'; U.rrect(c, 8, 8, w - 16, h - 16, 10); c.fill();
        c.fillStyle = '#f5f7fa'; c.fillRect(20, 20, w - 40, h - 40);
        const X = 36, Y = 50, W = w - 72, H = h - 90;
        U.txt(c, ['配方', '製程模擬', '元件模擬', '比對與校正'][i], 32, 42, { size: 15, w: 700, color: '#6a7888' });
        if (i === 0) {
          RECIPE.forEach((r, k) => { if (p * RECIPE.length > k) U.txt(c, r, X + 10, Y + 40 + k * 44, { size: 20, w: 600, color: '#17202b' }); });
          U.arrow(c, X + W * 0.62, Y + H * 0.45, X + W * 0.78, Y + H * 0.45, '#1f4fb5', 4);
          c.strokeStyle = '#9aa8b8'; c.setLineDash([6, 5]); c.strokeRect(X + W * 0.8, Y + H * 0.2, W * 0.18, H * 0.5); c.setLineDash([]);
          U.txt(c, '虛擬晶圓', X + W * 0.89, Y + H * 0.48, { align: 'center', size: 16, color: '#6a7888' });
        } else if (i === 1) {
          tcadDev(c, X + W * 0.05, Y, W * 0.9, H, p, t, 'build');
          const lab = p < 0.15 ? '矽晶圓' : p < 0.3 ? '長出奈米片疊層' : p < 0.45 ? '放上假閘極（耐高溫，先佔位）' : p < 0.6 ? '做出源極、汲極' : p < 0.78 ? '加熱：雜質往內擴散一點點' : '最後才換成高介電＋金屬閘極';
          U.tag(c, lab, X + W / 2, Y + 16, { align: 'center', size: 17, color: '#1f4fb5' });
        } else if (i === 2) {
          const g = tcadDev(c, X + W * 0.05, Y, W * 0.9, H, 1, t, 'dev');
          // 網格
          c.strokeStyle = 'rgba(31,79,181,.18)'; c.lineWidth = 1;
          for (let x = X + W * 0.05; x < X + W * 0.95; x += 14) { c.beginPath(); c.moveTo(x, Y + H * 0.1); c.lineTo(x, g.base); c.stroke(); }
          for (let y = Y + H * 0.1; y < g.base; y += 14) { c.beginPath(); c.moveTo(X + W * 0.05, y); c.lineTo(X + W * 0.95, y); c.stroke(); }
          // 電子密度色塊＋流動的電子
          g.ys.forEach((y, k) => {
            const gr = c.createLinearGradient(0, y, 0, y + g.sh); gr.addColorStop(0, 'rgba(31,79,181,.85)'); gr.addColorStop(0.5, `rgba(31,79,181,${0.35 + 0.25 * p})`); gr.addColorStop(1, 'rgba(31,79,181,.85)');
            c.fillStyle = gr; c.fillRect(g.sx0, y, g.sx1 - g.sx0, g.sh);
            for (let e = 0; e < 5; e++) { const f = (t * 0.35 + e / 5 + k * 0.13) % 1; U.dot(c, U.lerp(X + W * 0.12, X + W * 0.88, f), y + g.sh / 2, 4, '#f2a93b'); }
          });
          U.tag(c, '藍色越深，電子越多：靠近閘極的表面最多', X + W / 2, Y + 16, { align: 'center', size: 16, color: '#1f4fb5' });
          U.tag(c, '算出來的電流 ✓', X + W - 10, g.base + 26, { align: 'right', size: 15, color: '#1f7a4d' });
        } else {
          // 左：模擬的剖面（橫切）；右：真實 TEM
          const pw = W / 2 - 16, ph = H - 60, lx = X, rx = X + W / 2 + 16, py = Y + 20;
          c.fillStyle = '#d9dee6'; c.fillRect(lx, py, pw, ph);
          U.box(c, 'metal', lx + pw * 0.2, py + ph * 0.08, pw * 0.6, ph * 0.72);
          const err = U.lerp(0.25, 0.02, p);
          [0.2, 0.38, 0.56].forEach(f => { const sw = pw * 0.36 * (1 + err), sh2 = ph * 0.1; U.box(c, 'hk', lx + pw / 2 - sw / 2 - 4, py + ph * f - 4, sw + 8, sh2 + 8); U.box(c, 'si', lx + pw / 2 - sw / 2, py + ph * f, sw, sh2); });
          U.box(c, 'si', lx + pw * 0.4, py + ph * 0.72, pw * 0.2, ph * 0.28); U.box(c, 'ox', lx, py + ph * 0.8, pw * 0.4, ph * 0.2); U.box(c, 'ox', lx + pw * 0.6, py + ph * 0.8, pw * 0.4, ph * 0.2);
          U.tag(c, '模擬', lx + 8, py + 20, { size: 15 });
          // 真實量測影像（示意）：灰階、帶顆粒的電子顯微鏡風格
          c.fillStyle = '#2a2d31'; c.fillRect(rx, py, pw, ph);
          c.fillStyle = '#5d636b'; c.fillRect(rx + pw * 0.2, py + ph * 0.08, pw * 0.6, ph * 0.72);
          [0.2, 0.38, 0.56].forEach(f => { const sw = pw * 0.36, sh2 = ph * 0.1; c.fillStyle = '#1c1e21'; c.fillRect(rx + pw / 2 - sw / 2 - 4, py + ph * f - 4, sw + 8, sh2 + 8); c.fillStyle = '#b9bec5'; c.fillRect(rx + pw / 2 - sw / 2, py + ph * f, sw, sh2); });
          c.fillStyle = '#b9bec5'; c.fillRect(rx + pw * 0.4, py + ph * 0.72, pw * 0.2, ph * 0.28); c.fillStyle = '#80868e'; c.fillRect(rx, py + ph * 0.8, pw * 0.4, ph * 0.2); c.fillRect(rx + pw * 0.6, py + ph * 0.8, pw * 0.4, ph * 0.2);
          for (let k = 0; k < 900; k++) { const q = (k * 7919) % 1000 / 1000, r = (k * 104729) % 997 / 997; c.fillStyle = k % 2 ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.12)'; c.fillRect(rx + q * pw, py + r * ph, 2, 2); }
          U.tag(c, '真實量測影像（示意）', rx + 8, py + 20, { size: 15 });
          const e = Math.round(err * 100);
          U.txt(c, `奈米片寬度誤差：${e}%　${p < 1 ? '→ 調整模型參數中…' : '→ 校正完成，可以拿來預測新設計'}`, X + W / 2, py + ph + 30, { align: 'center', size: 17, w: 700, color: e > 5 ? '#b3541e' : '#1f7a4d' });
        }
      } }));
      U.animSteps(el, ctx, { canvas: 'tc1-cv', stepper: 'tc1-st', steps, interval: 4200, dur: 3.2 });
      const TCX = [
        ['① 怎麼模擬', '寫配方 → 製程模擬長出結構 → 元件模擬算電流 → 拿真實量測比對、校正。'],
        ['② 3D 模型（GAA）', '真正的 TCAD 是 3D 的：把整顆環繞式電晶體切成幾十萬個小格子，算每一格的電場和電子。可以拖曳旋轉；切開看奈米片，和 TEM 拍的是同一個方向。'],
        ['③ 虛擬實驗', '一片奈米片沿電流方向切開，藍色越深電子越多。調閘極長度和奈米片厚度，找「關得緊」和「電流夠大」的平衡點。']
      ];
      let t3 = null, sim = false, cur = true;
      const meterRow = id => U.$(el, '#' + id).closest('.meter');
      U.onSeg(el, 'tc1-m', i => {
        [0, 1, 2].forEach(k => U.$(el, '#tc1-p' + k).hidden = k !== i);
        U.$(el, '#tc1-h').textContent = TCX[i][0]; U.$(el, '#tc1-d').textContent = TCX[i][1];
        ['tc2-off', 'tc2-on'].forEach(id => meterRow(id).style.display = i === 2 ? '' : 'none');
        U.$(el, '#tc2-card').style.display = i === 2 ? '' : 'none';
        U.$(el, '.points').style.display = i === 2 ? 'none' : '';
        if (i === 1 && !t3 && window.T3D) t3 = T3D.mount(U.$(el, '#tc1-3d'), ctx, { type: 'gaa', current: true, gateOpacity: 0.45 });
        if (i === 2 && !sim) { sim = true; initSim(); }
      });
      U.onSeg(el, 'tc1-v', i => { if (!t3) return; if (i) { t3.setClip('x', 0); t3.setView(Math.PI / 2 - 0.25, 1.3, 13); } else { t3.setClip('x', 99); t3.setView(0.75, 1.05, 16.5); } });
      U.$(el, '#tc1-cur').onclick = () => { cur = !cur; if (t3) t3.setCurrent(cur); U.$(el, '#tc1-cur').textContent = '電子流動：' + (cur ? '開' : '關'); };
      // ③ 虛擬實驗（canvas 要等分頁顯示後才量得到大小）
      function initSim() {
        const { c, w, h } = U.canvas(U.$(el, '#tc2-cv'));
        let L = 14, T = 5, on = 0, runs = 0, last = '';
        const count = () => { const k = L + '/' + T; if (k !== last) { last = k; runs++; } U.$(el, '#tc2-n').textContent = `${runs} 種設計`; U.$(el, '#tc2-c').innerHTML = `電腦：每種幾分鐘到幾小時。<br>工廠真做：${runs} 批晶圓，每批 3–4 個月。`; };
        U.onSeg(el, 'tc2-s', i => on = i);
        U.bind(el, 'tc2-l', v => { L = v; count(); }, v => v + ' nm');
        U.bind(el, 'tc2-t', v => { T = v; count(); }, v => v + ' nm');
        runs = 1; count();
        // 簡化模型：閘極只能把兩端的影響擋住一段距離（約和厚度成正比），通道中間的「能障」決定能不能關緊
        const barrier = (x, y) => {
          const lam = 0.55 * T + 0.8, edge = Math.exp(-x / lam) + Math.exp(-(L - x) / lam);
          const d = Math.abs(y - T / 2) / (T / 2); // 0＝片中央（離閘極最遠）
          const gate = 1 - 0.45 * (1 - d) * (T / 10);
          return Math.max(0, (1 - edge) * gate);
        };
        ctx.raf((dt, t) => {
          c.clearRect(0, 0, w, h);
          const pad = 8, span = L + 16, sx = (w - 40) / span, x0 = 20 + 8 * sx;
          const maxT = 10, ty = (h - 180) / maxT, yc = h / 2 - 8, top = yc - T * ty / 2; // 片最厚時，下閘極也不壓到底下的結論字
          // 閘極（上下）與源汲極
          U.box(c, 'metal', x0, top - 46, L * sx, 40); U.box(c, 'metal', x0, top + T * ty + 6, L * sx, 40);
          U.box(c, 'hk', x0, top - 6, L * sx, 6); U.box(c, 'hk', x0, top + T * ty, L * sx, 6);
          U.tag(c, '閘極', x0 + L * sx / 2, top - 22, { align: 'center', size: 15 }); U.tag(c, '閘極', x0 + L * sx / 2, top + T * ty + 32, { align: 'center', size: 15 });
          // 電子密度熱圖
          const nx = 70, ny = 18, cw = (span * sx) / nx, chh = (T * ty) / ny;
          let leak = 0; // 關閉狀態的漏電：不論畫面切到開或關，都用關閉時的能障計算
          for (let i = 0; i < nx; i++) {
            const x = -8 + (i + 0.5) * span / nx;
            let colMax = 0;
            for (let j = 0; j < ny; j++) {
              const y = (j + 0.5) * T / ny;
              let n;
              if (x < 0 || x > L) n = 1;
              else { const b = barrier(x, y); n = Math.exp(-9 * b * (on ? 0.12 : 1)); colMax = Math.max(colMax, Math.exp(-9 * b)); }
              const a = Math.pow(n, 0.35);
              c.fillStyle = `rgba(31,79,181,${0.08 + 0.87 * a})`; c.fillRect(20 + i * cw, top + j * chh, cw + 0.5, chh + 0.5);
            }
            if (x > 0 && x < L && (leak === 0 || colMax < leak)) leak = colMax;
          }
          U.tag(c, '源極', 20 + 4 * sx, top - 14, { align: 'center', size: 15 }); U.tag(c, '汲極', 20 + (span - 4) * sx, top - 14, { align: 'center', size: 15 });
          // 電子流：數量跟著算出來的電流
          const Ion = (T / 5) * (14 / L) * 0.5, flow = on ? Ion : leak * 8;
          const nE = Math.round(U.clamp(flow, 0, 1.2) * 14);
          for (let e = 0; e < nE; e++) { const f = (t * 0.3 + e / Math.max(1, nE)) % 1; U.electron(c, 20 + f * span * sx, top + T * ty * (0.2 + 0.6 * ((e * 7) % 10) / 10), 3.5, !on); }
          const lf = U.clamp((Math.log10(leak + 1e-9) + 4) / 4, 0, 1);
          if (!on) U.txt(c, nE > 0 ? '通道中央關不住 → 電子偷溜（紅框點）' : lf > 0.3 ? '大致關得住，但漏電偏高' : '整段都關得很緊 ✓', w / 2, h - 16, { align: 'center', size: 17, w: 700, color: nE > 0 ? '#b3261e' : lf > 0.3 ? '#a8660a' : '#1f7a4d' });
          else U.txt(c, '打開：整片都是電子，藍點在流動就是電流', w / 2, h - 16, { align: 'center', size: 17, w: 700, color: '#1f4fb5' });
          U.pLegend(c, w - 250, 8, ['e', 'bad']);
          U.setMeter(el, 'tc2-off', lf, lf > 0.6 ? '高' : lf > 0.3 ? '中' : '低', lf > 0.6 ? 'bad' : lf > 0.3 ? 'warn' : 'good');
          const of = U.clamp(Ion / 1.2, 0, 1);
          U.setMeter(el, 'tc2-on', of, of > 0.6 ? '大' : of > 0.3 ? '中' : '小', of > 0.3 ? 'good' : 'warn');
        });
      }
    }
  });

  /* TCAD 的困境：太理想、調不出 TEM 的樣子 → 還是得量測 */
  Fig.add('tcad2', { body: true,
    eyebrow: EY8, render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('td-m', ['① 模擬太理想', '② 試著調成 TEM'], 0)}</div>
        <div id="td-p0" style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0">${U.figHTML('tc1-cmp', '左：簡化模型的理想形狀　右：真實樣品的 TEM 剖面（研究用，同一個方向切開）', '')}</div>
        <div id="td-p1" hidden style="display:flex;flex-direction:column;gap:14px;flex:1;min-height:0">${U.figHTML('tc1-fit', '把 TCAD 的形狀（青色框）疊在 TEM 上，拖動旋鈕試著對齊', '')}
          <div class="controls">${U.range('tc1-w', '奈米片寬度', 20, 45, 0.5, 26, ' nm')}${U.range('tc1-t', '奈米片厚度', 5, 15, 0.2, 7, ' nm')}${U.range('tc1-g', '片與片間距', 10, 24, 0.5, 20, ' nm')}</div></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="td-h"></h4><p id="td-d" style="font-size:17px;margin:0"></p></div>`,
        extra: '<button class="btn primary" type="button" data-go="eyes">下一頁：廠裡怎麼量 →</button>'
      })}</div>`,
    init(el, ctx) {
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      const TDX = [
        ['① 模擬太理想', '簡化的模型用理想形狀和標準材料參數：直角、每片一樣。真實做出來的晶片有圓角、每片厚薄寬窄不一、邊緣粗糙、雜質位置隨機、介面有缺陷。差一點點，電流和漏電就差很多。'],
        ['② 試著調成 TEM', '模型手上的旋鈕只有寬度、厚度、間距，而且三片一起變。再怎麼調，吻合度都卡在八成左右：圓角、每片各自不同、底部不規則，模型裡根本沒有對應的旋鈕。剩下的差距只能靠量測補。']
      ];
      let cmp = null, fit = null, tab = 0, FW = 26, FT = 7, FG = 20;
      U.bind(el, 'tc1-w', v => FW = v, v => v.toFixed(1) + ' nm');
      U.bind(el, 'tc1-t', v => FT = v, v => v.toFixed(1) + ' nm');
      U.bind(el, 'tc1-g', v => FG = v, v => v.toFixed(1) + ' nm');
      U.onSeg(el, 'td-m', i => {
        tab = i + 2; [0, 1].forEach(k => U.$(el, '#td-p' + k).hidden = k !== i);
        U.$(el, '#td-h').textContent = TDX[i][0]; U.$(el, '#td-d').textContent = TDX[i][1];
        if (i === 0 && !cmp) { cmp = U.canvas(U.$(el, '#tc1-cmp')); cmp.img = new Image(); cmp.img.src = CREDITS.gaatem.f; }
        if (i === 1 && !fit) { fit = U.canvas(U.$(el, '#tc1-fit')); fit.img = new Image(); fit.img.src = CREDITS.gaatem.f; }
      });
      // ④ 把模型疊在 TEM 上調：只有寬、厚、間距三個旋鈕，三片一起變 → 吻合度有上限
      ctx.raf((dt, t) => {
        if (tab !== 3 || !fit) return;
        const { c, w, h } = fit; c.clearRect(0, 0, w, h);
        const ih = h - 30, iw = ih * 292 / 316, ix = 20, iy = 10, k = iw * 0.0074; // 每 nm 幾 px（依照片標的 32.5 nm 推估）
        if (fit.img.complete && fit.img.naturalWidth) c.drawImage(fit.img, ix, iy, iw, ih);
        const cx = ix + iw * 0.515, y0 = iy + ih * 0.23;
        c.strokeStyle = '#2fd3e0'; c.lineWidth = 3;
        for (let s = 0; s < 3; s++) { const sw = FW * k, sh = FT * k, cy = y0 + s * (FT + FG) * k * 0.77; c.strokeRect(cx - sw / 2, cy - sh / 2, sw, sh); }
        const err = Math.abs(FW - 32.5) * 2.2 + Math.abs(FT - 10.4) * 4 + Math.abs(FG - 15.5) * 3;
        const raw = U.clamp(100 - err, 0, 100), score = Math.min(raw, 78);
        // 右側：吻合度與「調不出來」的清單
        const rx = ix + iw + 30, rw = w - rx - 20;
        U.txt(c, '和 TEM 的吻合度', rx, 46, { size: 17, w: 700, color: '#17202b' });
        c.fillStyle = '#e8edf3'; c.fillRect(rx, 60, rw, 26); c.fillStyle = score >= 75 ? '#1f7a4d' : score > 50 ? '#d08a1e' : '#b3261e'; c.fillRect(rx, 60, rw * score / 100, 26);
        c.strokeStyle = '#b3261e'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(rx + rw * 0.78, 54); c.lineTo(rx + rw * 0.78, 92); c.stroke(); c.setLineDash([]);
        U.txt(c, Math.round(score) + '%（示意）', rx + rw, 110, { align: 'right', size: 22, w: 700, color: '#17202b' });
        U.txt(c, '紅虛線：再怎麼調都過不去', rx + rw * 0.78, 128, { align: 'center', size: 13, color: '#b3261e' });
        const stuck = raw >= 78;
        U.txt(c, stuck ? '卡住了！剩下的差距，旋鈕調不出來：' : '試著把三個旋鈕調到和 TEM 對齊…', rx, 176, { size: 16, w: 700, color: stuck ? '#b3261e' : '#3e4b5b' });
        if (stuck) {
          ['① 圓角：模型只有直角', '② 三片各自不同：模型三片一起變', '③ 底部不規則、邊緣粗糙'].forEach((s, i) => U.txt(c, s, rx, 210 + i * 30, { size: 15, color: '#17202b' }));
          const pulse = 0.55 + 0.45 * Math.sin(t * 4);
          c.strokeStyle = `rgba(232,89,12,${pulse})`; c.lineWidth = 3;
          [[0.40, 0.21, 14], [0.66, 0.36, 16], [0.31, 0.78, 22]].forEach(([fx, fy, r]) => { c.beginPath(); c.arc(ix + fx * iw, iy + fy * ih, r * iw / 292 * 1.6, 0, 7); c.stroke(); });
          U.txt(c, '→ 只能記成誤差範圍，或拿量測值去修模型', rx, 320, { size: 15, w: 700, color: '#1f7a4d' });
        }
      });
      ctx.raf(() => {
        if (tab !== 2 || !cmp) return;
        const { c, w, h } = cmp; c.clearRect(0, 0, w, h);
        const pw = w / 2 - 30, py = 40, ph = h - 110, lx = 20, rx = w / 2 + 10;
        // 左：理想形狀（直角、三片一樣）
        U.box(c, 'ox', lx, py + ph * 0.82, pw, ph * 0.18); U.box(c, 'metal', lx + pw * 0.22, py + ph * 0.04, pw * 0.56, ph * 0.74);
        const sw = pw * 0.36, sh = ph * 0.1;
        [0.12, 0.31, 0.5].forEach(f => { const x = lx + pw / 2 - sw / 2, y = py + ph * f; U.box(c, 'hk', x - 5, y - 5, sw + 10, sh + 10); U.box(c, 'si', x, y, sw, sh); });
        U.box(c, 'si', lx + pw * 0.38, py + ph * 0.68, pw * 0.24, ph * 0.32);
        U.txt(c, 'TCAD 模擬', lx, py - 14, { size: 16, w: 700, color: '#1f4fb5' });
        const ax = lx + pw / 2 - sw / 2, ay = py + ph * 0.12;
        U.arrow(c, lx + 8, ay - 22, ax - 2, ay - 2, '#1f4fb5', 2); U.tag(c, '直角', lx + 4, ay - 28, { size: 14, color: '#1f4fb5' });
        U.tag(c, '三片一樣', lx + 2, py + ph * 0.36, { size: 14, color: '#1f4fb5' });
        U.tag(c, '參數：標準值', lx + 2, py + ph * 0.6, { size: 14, color: '#1f4fb5' });
        // 右：真實 TEM
        const im = cmp.img, ih = ph, iw = ih * 292 / 316, ix = rx + (pw - iw) / 2;
        if (im.complete && im.naturalWidth) c.drawImage(im, ix, py, iw, ih);
        U.txt(c, '真實樣品（TEM，研究用）', rx, py - 14, { size: 16, w: 700, color: '#b3541e' });
        const P = (fx, fy) => [ix + fx * iw, py + fy * ih];
        const note = (txt, fx, fy, lx2, ly2) => { const [x, y] = P(fx, fy); U.arrow(c, lx2, ly2, x, y, '#e8590c', 2.5); U.tag(c, txt, lx2 + (lx2 < x ? -4 : 4), ly2 - 8, { align: lx2 < x ? 'right' : 'left', size: 14, color: '#b3541e' }); };
        note('圓角', 0.40, 0.21, ix - 8, py + ih * 0.12);
        note('每片不一樣', 0.40, 0.48, ix - 8, py + ih * 0.42);
        note('底部變形', 0.31, 0.78, ix - 8, py + ih * 0.86);
        U.txt(c, '差一點點形狀，電流和漏電就差很多 → 模擬一定要拿量測來校正（上一頁第 ④ 步）→ 下一頁：量測', w / 2, h - 18, { align: 'center', size: 16, w: 700, color: '#b3541e' });
        U.txt(c, '影像：' + CREDITS.gaatem.by + '（' + CREDITS.gaatem.lic + '）', rx + pw, py + ih + 16, { align: 'right', size: 11, color: '#6a7888' });
      });
    }
  });

  /* 量測、檢測、WAT 總覽：工廠的三種檢查（接在 TCAD 之後，帶出後面的順序：量尺寸 → 找缺陷 → SPC、APC → 晶圓做完：WAT） */
  const EYE_SITES = [[0, 0], [0.5, 0], [-0.5, 0], [0, 0.5], [0, -0.5], [0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]];
  Fig.add('eyes', { body: true,
    eyebrow: EY9, render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('ey-m', ['① 量測：尺寸對不對', '② 檢測：哪裡有缺陷', '③ WAT：電性對不對'], 0)}</div>
        ${U.figHTML('ey-cv', '同一片晶圓，三種檢查', '')}</div>
      ${U.pageSide({
        top: `<div class="card"><h4 style="margin-bottom:6px">三種檢查比一比</h4><table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.35">${[['', '量測', '檢測', 'WAT'], ['問什麼', '尺寸對不對', '哪裡有缺陷', '電性對不對'], ['什麼時候', '製程中', '製程中', '晶圓做完後'], ['得到', '線寬、膜厚、疊對', '缺陷位置和種類', '電壓、電流、電阻'], ['怎麼看', '抽幾片、量幾個點', '抽片後整片掃', '扎切割道測試結構'], ['工具', '膜厚機、CD-SEM、OCD、疊對機（TEM 當參考）', '光學掃描＋複檢 SEM、電子束', '探針卡＋測試機'], ['接下來', '交給 SPC（統計製程管制）、APC', '推回哪台機台', '放行或回推哪一站']].map((r, i) => `<tr style="border-top:${i ? '1px solid var(--line)' : '0'}">${r.map((x, j) => `<${i && j ? 'td' : 'th'} style="text-align:left;padding:4px 6px;${j === 0 ? 'color:var(--ink-3);font-weight:600;white-space:nowrap' : ''}">${x}</${i && j ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></div>
          <div class="card key"><h4>這一章跟著晶圓走</h4><div style="display:flex;flex-direction:column;gap:4px;font-size:15px;line-height:1.45">${[['製程中', '① 量尺寸 → ② 找缺陷 → ③ SPC、APC'], ['晶圓做完', '④ WAT 量電性，對照尺寸'], ['之後', '⑩ 從設計到量產 → CP、封裝（第三部分）']].map(([t, d]) => `<div style="display:flex;gap:10px;background:var(--paper);border:1px solid var(--line);border-radius:6px;padding:5px 8px"><b style="flex:none;width:4.5em">${t}</b><span>${d}</span></div>`).join('')}</div></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#ey-cv'));
      let m = 0, pt = 0;
      U.onSeg(el, 'ey-m', i => { m = i; pt = 0; });
      const dfs = wmDefects(0);
      ctx.raf((dt, t) => {
        pt += dt; c.clearRect(0, 0, w, h);
        const R = Math.min(h * 0.4, w * 0.27), cx = R + 40, cy = h / 2;
        c.fillStyle = '#eef2f6'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
        const ds = R * 0.18; c.strokeStyle = '#d3dbe4'; c.lineWidth = 1;
        for (let x = -R; x < R; x += ds) for (let y = -R; y < R; y += ds) if (Math.hypot(x + ds / 2, y + ds / 2) < R - ds * 0.6) c.strokeRect(cx + x, cy + y, ds, ds);
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        const rx = cx + R + 60, rw = w - rx - 20, zy = 50, zh = h - 150;
        if (m === 0) {
          // 量測：一個點一個點量，每點得到一個數字
          const n = Math.min(EYE_SITES.length, Math.floor(pt / 0.5) + 1), cur = n < EYE_SITES.length ? n - 1 : Math.floor(pt / 0.9) % EYE_SITES.length;
          EYE_SITES.slice(0, n).forEach(([x, y], k) => { const px = cx + x * R, py = cy + y * R, v = (15 + (hr(k + 40) - .5) * 0.6).toFixed(1); U.dot(c, px, py, 6, k === cur ? '#e8590c' : '#1f4fb5'); U.txt(c, v, px, py - 12, { align: 'center', size: 13, w: 700, color: '#1f4fb5' }); });
          const [sx, sy] = EYE_SITES[cur];
          c.strokeStyle = 'rgba(232,89,12,.6)'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx + sx * R + 8, cy + sy * R); c.lineTo(rx, zy + zh / 2); c.stroke(); c.setLineDash([]);
          // 放大：一條線的剖面＋線寬
          c.fillStyle = '#f7f9fb'; c.fillRect(rx, zy, rw, zh); c.strokeStyle = '#e8590c'; c.lineWidth = 2; c.strokeRect(rx, zy, rw, zh);
          const base = zy + zh * 0.72, lw2 = rw * 0.22;
          U.box(c, 'ox', rx + 20, base, rw - 40, zh * 0.18);
          [-1, 0, 1].forEach(k => U.box(c, 'si', rx + rw / 2 + k * rw * 0.32 - lw2 / 2, base - zh * 0.42, lw2, zh * 0.42));
          { const a = rx + rw / 2 - lw2 / 2, b = rx + rw / 2 + lw2 / 2, yy = base - zh * 0.42 - 12; U.arrow(c, a, yy, b, yy, '#e8590c', 2); U.arrow(c, b, yy, a, yy, '#e8590c', 2); }
          const val = (15 + (hr(cur + 40) - .5) * 0.6).toFixed(1);
          U.txt(c, `線寬 ${val} nm`, rx + rw / 2, base - zh * 0.42 - 24, { align: 'center', size: 20, w: 700, color: '#e8590c' });
          U.txt(c, '放大：量這一點的線寬', rx + 12, zy + 24, { size: 15, w: 700, color: '#17202b' });
          U.txt(c, '結果是數字 → 對不對？要不要調機台？', w / 2, h - 30, { align: 'center', size: 18, w: 700, color: '#1f4fb5' });
          U.txt(c, '抽幾片晶圓、每片量幾個點', 20, 24, { size: 15, w: 600, color: '#3e4b5b' });
        } else if (m === 1) {
          // 檢測：整片掃過去，標出可疑點
          const scan = U.clamp(pt / 2.5, 0, 1), sxp = cx - R + scan * 2 * R;
          if (scan < 1) { c.strokeStyle = 'rgba(31,79,181,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sxp, cy - R - 6); c.lineTo(sxp, cy + R + 6); c.stroke(); }
          dfs.forEach(([x, y, k]) => { const px = cx + x * R, py = cy + y * R; if (px <= sxp) U.dot(c, px, py, 4, '#b3261e'); });
          c.fillStyle = '#f7f9fb'; c.fillRect(rx, zy, rw, zh); c.strokeStyle = '#b3261e'; c.lineWidth = 2; c.strokeRect(rx, zy, rw, zh);
          U.txt(c, '放大：其中一個缺陷（複檢 SEM）', rx + 12, zy + 24, { size: 15, w: 700, color: '#17202b' });
          if (scan >= 1) {
            const s = Math.min(rw - 60, zh - 80), tx = rx + (rw - s) / 2, ty = zy + 44;
            const lab = semThumb(c, tx, ty, s, 0, 1); U.txt(c, lab + '（CMP 刮傷）', rx + rw / 2, ty + s + 24, { align: 'center', size: 16, w: 700, color: '#b3261e' });
            const d = dfs.find(q => q[2]); c.strokeStyle = 'rgba(179,38,30,.6)'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx + d[0] * R + 8, cy + d[1] * R); c.lineTo(rx, zy + zh / 2); c.stroke(); c.setLineDash([]);
          } else U.txt(c, '掃描中…', rx + rw / 2, zy + zh / 2, { align: 'center', size: 22, w: 700, color: '#9aa8b8' });
          U.txt(c, '結果是缺陷的位置 → 是什麼？哪台機台造成的？', w / 2, h - 30, { align: 'center', size: 18, w: 700, color: '#b3261e' });
          U.txt(c, '抽片後整片掃', 20, 24, { size: 15, w: 600, color: '#3e4b5b' });
        } else {
          // WAT：晶圓做完後，扎晶片之間走道（切割道）上的測試結構，量電
          const n = Math.min(EYE_SITES.length, Math.floor(pt / 0.5) + 1), cur = n < EYE_SITES.length ? n - 1 : Math.floor(pt / 0.9) % EYE_SITES.length;
          EYE_SITES.slice(0, n).forEach(([x, y], k) => {
            const gx = -R + Math.round((x * R + R) / ds) * ds, px = cx + gx, py = cy + y * R;
            c.fillStyle = k === cur ? '#e8590c' : '#c9a86a'; c.fillRect(px - 3, py - 9, 6, 18);
          });
          const [sx, sy] = EYE_SITES[cur], spx = cx - R + Math.round((sx * R + R) / ds) * ds;
          c.strokeStyle = 'rgba(232,89,12,.6)'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(spx + 6, cy + sy * R); c.lineTo(rx, zy + zh * 0.3); c.stroke(); c.setLineDash([]);
          c.fillStyle = '#f7f9fb'; c.fillRect(rx, zy, rw, zh); c.strokeStyle = '#1f7a4d'; c.lineWidth = 2; c.strokeRect(rx, zy, rw, zh);
          U.txt(c, '放大：晶片之間的走道（切割道）', rx + 12, zy + 24, { size: 15, w: 700, color: '#17202b' });
          // 上下是晶片，中間走道放一排測試墊；探針卡壓下來
          const ly = zy + zh * 0.36, lh = zh * 0.1, np = 6, pw = (rw - 40) / (np * 1.8), gap = (rw - 40 - np * pw) / np;
          c.fillStyle = '#9fb5e3'; c.fillRect(rx + 14, zy + 40, rw - 28, ly - zy - 46); c.fillRect(rx + 14, ly + lh + 6, rw - 28, zh * 0.06);
          c.fillStyle = '#f2c46b'; c.fillRect(rx + 14, ly, rw - 28, lh);
          const down = U.clamp(pt / 0.8, 0, 1), cardY = U.lerp(zy + 34, ly - 56, down);
          for (let k = 0; k < np; k++) {
            const x = rx + 20 + gap / 2 + k * (pw + gap); c.fillStyle = '#c9a86a'; c.fillRect(x, ly + lh * 0.2, pw, lh * 0.6); c.strokeStyle = '#8a6a2e'; c.lineWidth = 1; c.strokeRect(x, ly + lh * 0.2, pw, lh * 0.6);
            c.strokeStyle = '#17202b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + pw / 2 - 10, cardY + 22); c.lineTo(x + pw / 2, U.lerp(cardY + 46, ly + lh * 0.45, down)); c.stroke();
          }
          c.fillStyle = '#3e4b5b'; c.fillRect(rx + 24, cardY, rw - 48, 22); U.txt(c, '探針卡', rx + rw / 2, cardY + 16, { align: 'center', size: 13, w: 700, color: '#fff' });
          // 讀數一行一行跳出來，最後和規格比
          const RD = [['Vt 臨界電壓', '0.30 V'], ['Ion 開啟電流', '1.02 mA/µm'], ['Ioff 關閉漏電', '0.9 nA/µm'], ['導線孔鏈電阻', '正常']];
          const ty = ly + lh + zh * 0.06 + 34, vy = zy + zh - 18, st = Math.min(30, (vy - 34 - ty) / (RD.length - 1));
          RD.forEach(([a, b], k) => { c.globalAlpha = U.clamp((pt - 1 - k * 0.4) / 0.3, 0, 1); U.txt(c, a, rx + 24, ty + k * st, { size: 16, color: '#17202b' }); U.txt(c, b + ' ✓', rx + rw - 24, ty + k * st, { align: 'right', size: 16, w: 700, color: '#1f7a4d' }); c.globalAlpha = 1; });
          c.globalAlpha = U.clamp((pt - 2.8) / 0.4, 0, 1);
          U.txt(c, '全部在規格內 → 放行', rx + rw / 2, vy, { align: 'center', size: 18, w: 700, color: '#1f7a4d' });
          c.globalAlpha = 1;
          U.txt(c, '結果是電性數字 → 合格放行；不合格回推是哪一站', w / 2, h - 30, { align: 'center', size: 18, w: 700, color: '#1f7a4d' });
          U.txt(c, '晶圓做完後，扎切割道上的測試結構（金色）', 20, 24, { size: 15, w: 600, color: '#3e4b5b' });
        }
      });
    }
  });

  /* 量測與檢測（兩頁）：mloop 管制圖判定＋APC；insp 缺陷地圖猜原因 */
  const ML_V = {
    PASS: ['#1f7a4d', 'PASS 放行', '在管制線內，前面也沒有連續偏移：機台很穩，晶圓繼續往下一站。'],
    WATCH: ['#7a3fd8', 'PASS 放行＋偏移警報', '這一批在管制線內，產品放行；但前面已經出現連續偏移或超線，代表機台在漂。先確認不是量測出錯（重量一次、看標準片），再查機台、調參數。'],
    ADJUST: ['#a8660a', 'ADJUST 調機台', '還在規格內，產品通常沒問題；但已超出管制線，代表機台開始漂了。第一步先確認不是量測出錯，再依程序確認放行，同時調機台，或讓 APC 修下一批的參數。'],
    REWORK: ['#b3541e', 'REWORK 重工', '超出規格，但這是曝光後量的：先確認不是量測出錯，再把光阻洗掉、重新曝光，晶圓救得回來。'],
    SCRAP: ['#b3261e', 'HOLD 扣住評估（多半報廢）', '超出規格，而且已經蝕刻下去，挖掉的回不來。整批先扣住，先確認不是量測出錯，再由工程師評估：多半報廢或降級，少數電性沒問題可特准放行；同時追查是哪台機台出問題。']
  };
  // 每張地圖：答案、四個選項（原因編號）、提示、解答；地圖與原因都是常見的教科書型態，實際判讀要搭配複檢與機台紀錄
  const WM = [
    { ans: 1, opts: [1, 5, 6, 3], hint: '弧線像什麼在轉？', why: '一條弧線：研磨墊上卡了硬顆粒，跟著旋轉畫出弧形刮痕 → 查 CMP 機台的研磨墊和研磨液。' },
    { ans: 2, opts: [2, 3, 4, 0], hint: '每個曝光格都一樣，代表每次曝光都帶著它', why: '每個曝光格的同一個位置都有：光罩上有髒東西，每曝一格就印一次 → 查光罩。' },
    { ans: 0, opts: [0, 6, 4, 7], hint: '只在最外圈，代表晶圓邊緣的條件不一樣', why: '集中在最外圈：晶圓邊緣的電漿、氣流、溫度和中間不一樣 → 調蝕刻或沉積機台的邊緣參數。' },
    { ans: 3, opts: [3, 2, 1, 5], hint: '集中一團，像是某個東西掉下來', why: '一團擠在某個地方：機台腔體掉下一團微粒 → 停機清腔體。' },
    { ans: 4, opts: [4, 0, 3, 6], hint: '集中在正中央：哪些機台是繞著中心轉、或從正上方噴下來？', why: '集中在晶圓中心一片：旋轉塗佈時中心的液體或氣流條件不同，或沉積噴頭中央出問題 → 查塗佈機或噴頭。' },
    { ans: 5, opts: [5, 1, 2, 0], hint: 'CMP 刮出來的是弧線（墊子在轉）；直線代表是直直移動的東西', why: '一條筆直的線：搬運時被機械手臂或夾具刮到，手臂是直線移動 → 查搬運手臂和晶舟。' },
    { ans: 6, opts: [6, 0, 4, 1], hint: '一整圈、但不在最外圈：哪台機台是分成一圈一圈控制的？', why: '在半徑中間繞一整圈：CMP 研磨頭分好幾圈施壓，某一圈壓力不對 → 查研磨頭的分區壓力。' },
    { ans: 7, opts: [7, 0, 4, 3], hint: '只有一邊，代表左右兩邊的條件不一樣', why: '缺陷集中在半邊：晶圓放偏，或承載晶圓的夾盤一邊溫度不同 → 查晶圓放置位置和夾盤溫度。' }
  ];
  const WM_C = ['邊緣蝕刻／沉積不均', 'CMP 研磨刮傷', '光罩上有髒東西', '機台掉了一團微粒', '塗佈／噴頭中心不均', '搬運手臂刮傷', 'CMP 某一圈壓力不對', '晶圓放偏／夾盤一邊不均'];
  const hr = v => { const q = Math.sin(v * 12.9898 + 4.1) * 43758.5453; return q - Math.floor(q); };
  // 缺陷位置（單位圓座標）：[x, y, 是否屬於主要圖樣]
  const wmDefects = pi => {
    const d = [];
    for (let k = 0; k < 10; k++) { const r = Math.sqrt(hr(k + 50)) * 0.92, a = hr(k + 80) * 7; d.push([r * Math.cos(a), r * Math.sin(a), 0]); }
    if (pi === 0) for (let k = 0; k < 26; k++) { const a = -0.5 + k / 25 * 1.7, r = 0.62 + (hr(k) - .5) * 0.03; d.push([-0.25 + r * Math.cos(a), 0.15 - r * Math.sin(a), 1]); }
    if (pi === 1) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) { const x = i * 0.36 + 0.07, y = j * 0.36 - 0.05; if (x * x + y * y < 0.85) d.push([x, y, 1]); }
    if (pi === 2) for (let k = 0; k < 30; k++) { const a = hr(k + 3) * 7, r = 0.9 + hr(k + 9) * 0.07; d.push([r * Math.cos(a), r * Math.sin(a), 1]); }
    if (pi === 3) for (let k = 0; k < 24; k++) { const a = hr(k + 5) * 7, r = Math.sqrt(hr(k + 7)) * 0.16; d.push([0.35 + r * Math.cos(a), -0.3 + r * Math.sin(a), 1]); }
    if (pi === 4) for (let k = 0; k < 34; k++) { const a = hr(k + 11) * 7, r = Math.sqrt(hr(k + 13)) * 0.3; d.push([r * Math.cos(a), r * Math.sin(a), 1]); }
    if (pi === 5) for (let k = 0; k < 26; k++) { const f = k / 25, j = (hr(k + 17) - .5) * 0.025; d.push([-0.72 + f * 1.3 + j, -0.5 + f * 0.95 - j, 1]); }
    if (pi === 6) for (let k = 0; k < 36; k++) { const a = k / 36 * 6.283 + hr(k + 19) * 0.1, r = 0.55 + (hr(k + 21) - .5) * 0.05; d.push([r * Math.cos(a), r * Math.sin(a), 1]); }
    if (pi === 7) for (let k = 0; k < 32; k++) { const a = 1.7 + hr(k + 23) * 2.9, r = Math.sqrt(hr(k + 25)) * 0.9; d.push([r * Math.cos(a), r * Math.sin(a), 1]); }
    return d;
  };
  // SEM 複檢的放大圖（示意）
  function semThumb(c, x, y, s, pi, main) {
    c.fillStyle = '#3a4048'; c.fillRect(x, y, s, s);
    c.strokeStyle = '#5c646e'; c.lineWidth = s * 0.08; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + k * s / 4, y); c.lineTo(x + k * s / 4, y + s); c.stroke(); }
    c.fillStyle = '#d8dde3'; c.strokeStyle = '#d8dde3';
    if (!main) { U.dot(c, x + s * 0.55, y + s * 0.45, s * 0.05, '#aab2bb'); return '其他來源'; }
    if (pi === 0) { c.lineWidth = s * 0.06; c.beginPath(); c.moveTo(x + s * 0.1, y + s * 0.8); c.quadraticCurveTo(x + s * 0.5, y + s * 0.35, x + s * 0.9, y + s * 0.25); c.stroke(); return '刮痕'; }
    if (pi === 1) { c.fillRect(x + s * 0.25, y + s * 0.42, s * 0.5, s * 0.14); return '短路'; }
    if (pi === 2) { c.globalAlpha = .8; c.beginPath(); c.ellipse(x + s * 0.5, y + s * 0.5, s * 0.36, s * 0.22, 0.4, 0, 7); c.fill(); c.globalAlpha = 1; return '膜剝落'; }
    if (pi === 4) { c.globalAlpha = .55; c.beginPath(); c.ellipse(x + s * 0.5, y + s * 0.5, s * 0.38, s * 0.3, 0, 0, 7); c.fill(); c.globalAlpha = 1; return '膜厚不均'; }
    if (pi === 5) { c.lineWidth = s * 0.05; c.beginPath(); c.moveTo(x + s * 0.08, y + s * 0.85); c.lineTo(x + s * 0.92, y + s * 0.15); c.stroke(); return '直線刮痕'; }
    if (pi === 6) { c.beginPath(); c.moveTo(x + s * 0.3, y + s * 0.4); c.lineTo(x + s * 0.62, y + s * 0.3); c.lineTo(x + s * 0.7, y + s * 0.6); c.lineTo(x + s * 0.4, y + s * 0.68); c.fill(); return '研磨殘留'; }
    if (pi === 7) { [[0.3, 0.3], [0.6, 0.45], [0.42, 0.7], [0.72, 0.75]].forEach(([a, b]) => U.dot(c, x + s * a, y + s * b, s * 0.06, '#e6eaee')); return '殘留顆粒'; }
    U.dot(c, x + s * 0.5, y + s * 0.5, s * 0.2, '#e6eaee'); return '微粒';
  }
  const ML_LAD = [
    ['PASS', '管制線內、沒有連續偏移'],
    ['WATCH', '管制線內，但點一直往同一邊跑'],
    ['ADJUST', '超出管制線（OOC）、還在規格內'],
    ['REWORK', '超出規格（OOS），曝光後量的'],
    ['SCRAP', '超出規格（OOS），已經蝕刻下去']
  ];
  const ML_SC = [[0], [0.3], [0.8], [1.6]];
  // 47、48 共用的分工圖：量測 → SPC（判定有沒有異常，找人處理）→ APC（自動算下一批調多少）→ 機台；on＝這一頁講的那一段
  const ctlFlow = on => `<div class="minimap" style="flex-wrap:wrap">${[['量測', ''], ['SPC 統計製程管制', '判定機台有沒有變，異常就找人處理'], ['APC 先進製程控制', '自動算出下一批要調多少'], ['機台', '']].map(([n, d], i) => `${i ? '<span class="ar">→</span>' : ''}<span class="nd${i === on ? ' on' : ''}" title="${d}">${n}${d && i === on ? `<small style="font-weight:500;margin-left:8px;opacity:.9">${d}</small>` : ''}</span>`).join('')}</div>`;
  Fig.add('mloop', { body: true,
    eyebrow: EY9, render: () => `<div class="s-body w66">
      <div class="col">${ctlFlow(1)}<div class="controls">${U.seg('ml-sc', ['① 機台很穩', '② 開始漂', '③ 超出管制線', '④ 超出規格'], 0)}</div>
        ${U.figHTML('ml-spc', '蝕刻後線寬的管制圖：每個點是一批晶圓的平均（目標 15.0 nm）', '規則與處置為示意，依各廠規範')}
        <div class="controls">${U.range('ml-d', '機台漂移（也可以自己拖）', 0, 2, 0.05, 0, ' nm')}<span id="ml-st">${U.seg('ml-s', ['曝光後量（ADI）', '蝕刻後量（AEI）'], 1)}</span></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 style="margin-bottom:8px">判定：最新一批（大點）落在哪？</h4><div id="ml-lad" style="display:flex;flex-direction:column;gap:4px;margin-bottom:10px">${ML_LAD.map(([k, d]) => `<div data-v="${k}" style="display:flex;gap:10px;align-items:baseline;padding:3px 8px;border-radius:6px;border:2px solid transparent;transition:.2s"><b style="min-width:9.5em;color:${ML_V[k][0]}">${ML_V[k][1].replace('（多半報廢）', '')}</b><span style="font-size:15px;color:var(--ink-2)">${d}</span></div>`).join('')}</div><p id="ml-dd" style="font-size:16px;margin:0"></p></div>`
      })}</div>`,
    init(el, ctx) {
      let drift = 0, stn = 1, spc = U.canvas(U.$(el, '#ml-spc')), lastOut = null;
      const stSeg = U.$(el, '#ml-st');
      const D = U.$(el, '#ml-dd'), rows = U.$$(el, '#ml-lad [data-v]');
      const dr = U.bind(el, 'ml-d', v => drift = v, v => '每批多 ' + (v / 17).toFixed(2) + ' nm，到現在共 ' + v.toFixed(2) + ' nm');
      const spcT = U.$(el, '#ml-spc').closest('.fig').querySelector('.fig-title span');
      U.onSeg(el, 'ml-s', i => { stn = i; if (spcT) spcT.textContent = (i ? '蝕刻後' : '曝光後（光阻）') + '線寬的管制圖：每個點是一批晶圓的平均（目標 15.0 nm）'; });
      U.onSeg(el, 'ml-sc', i => dr.set(ML_SC[i][0]));
      const N = 24, T = 15, CL = 0.35, SL = 1.2; // 管制線＝機台平常變異的 ±3σ；規格線＝產品要求
      let lastV = '';
      ctx.raf((dt, t) => {
        const { c, w, h } = spc; c.clearRect(0, 0, w, h);
        // 模擬 24 批：第 7 批起機台慢慢漂（沒有 APC；APC 在下一頁）
        const vs = [];
        for (let k = 0; k < N; k++) {
          const d = Math.max(0, (k - 6) / (N - 7)) * drift, v = T + d + (hr(k + 200) - .5) * 0.36;
          vs.push(v);
        }
        const outAny = vs.some(v => Math.abs(v - T) > SL);
        if (outAny !== lastOut) { lastOut = outAny; stSeg.style.visibility = outAny ? '' : 'hidden'; }
        if (outAny) {
          // 上方流程條：在哪一站量？曝光後量，超規格可以洗掉重做；蝕刻後量，挖下去就回不來
          const FL = [['曝光', 0], ['量① 曝光後（光阻）', 1], ['蝕刻', 0], ['量② 蝕刻後', 1], ['下一站', 0]], fw = (w - 40) / FL.length;
          FL.forEach(([n, m], k) => {
            const bx = 20 + k * fw, on = m && (k === 1 ? stn === 0 : stn === 1);
            c.fillStyle = on ? '#1f4fb5' : m ? '#e8edf3' : '#f4f6f9'; c.fillRect(bx, 14, fw - 34, 34);
            c.strokeStyle = m ? '#1f4fb5' : '#9aa8b8'; c.lineWidth = 1.5; c.strokeRect(bx, 14, fw - 34, 34);
            U.txt(c, n, bx + (fw - 34) / 2, 37, { align: 'center', size: 15, w: on ? 700 : 500, color: on ? '#fff' : '#17202b' });
            if (k < FL.length - 1) U.arrow(c, bx + fw - 32, 31, bx + fw - 3, 31, '#9aa8b8', 2);
          });
          if (stn === 0) { const x0 = 20 + (fw - 34) / 2, x1 = 20 + fw + (fw - 34) / 2; c.strokeStyle = '#1f7a4d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x1, 50); c.quadraticCurveTo((x0 + x1) / 2, 84, x0 + 6, 52); c.stroke(); U.arrow(c, x0 + 14, 60, x0 + 4, 50, '#1f7a4d', 2.5); U.txt(c, '超規格 → 洗掉光阻、重新曝光（救得回來）', x1 + 26, 72, { size: 14, w: 700, color: '#1f7a4d' }); }
          else U.txt(c, '超規格 → 已經挖下去，回不來（多半報廢）', 20 + 3 * fw + (fw - 34) / 2, 72, { align: 'center', size: 14, w: 700, color: '#b3261e' });
        }
        const gx = 70, gw = w - gx - 150, gy = outAny ? 96 : 30, gh = h - gy - 54, lo = T - 2.2, hi = T + 2.2;
        const X = k => gx + (k + 0.5) / N * gw, Y = v => gy + gh - (U.clamp(v, lo, hi) - lo) / (hi - lo) * gh;
        // 三個區域：綠＝機台正常抖動；黃＝機台變了但產品還合格；紅＝產品不合格
        c.fillStyle = 'rgba(179,38,30,.06)'; c.fillRect(gx, gy, gw, Y(T + SL) - gy); c.fillRect(gx, Y(T - SL), gw, gy + gh - Y(T - SL));
        c.fillStyle = 'rgba(208,138,30,.08)'; c.fillRect(gx, Y(T + SL), gw, Y(T + CL) - Y(T + SL)); c.fillRect(gx, Y(T - CL), gw, Y(T - SL) - Y(T - CL));
        c.fillStyle = 'rgba(31,122,77,.09)'; c.fillRect(gx, Y(T + CL), gw, Y(T - CL) - Y(T + CL));
        U.txt(c, '產品不合格', gx + 8, Y(T + SL) - 10, { size: 13, color: '#b3261e' });
        U.txt(c, '機台變了，產品還合格', gx + 8, Y(T - CL) + 22, { size: 13, color: '#a8660a' });
        const hl = (v, col, dash, lab) => { c.strokeStyle = col; c.lineWidth = 2; c.setLineDash(dash); c.beginPath(); c.moveTo(gx, Y(v)); c.lineTo(gx + gw, Y(v)); c.stroke(); c.setLineDash([]); U.txt(c, lab, gx + gw + 8, Y(v) + 5, { size: 14, w: 600, color: col }); };
        hl(T + SL, '#b3261e', [], '規格上限'); hl(T - SL, '#b3261e', [], '規格下限');
        hl(T + CL, '#d08a1e', [7, 5], '管制上限 +3σ'); hl(T - CL, '#d08a1e', [7, 5], '管制下限 −3σ');
        hl(T, '#1f7a4d', [2, 4], '目標 15.0');
        for (let v = 13; v <= 17; v++) U.txt(c, v + ' nm', gx - 8, Y(v) + 5, { align: 'right', size: 13, color: '#6a7888' });
        U.txt(c, '批次（時間）→', gx + gw, h - 16, { align: 'right', size: 13, color: '#6a7888' });
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; c.beginPath(); vs.forEach((v, k) => k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v))); c.stroke();
        let first = -1;
        vs.forEach((v, k) => {
          const e = Math.abs(v - T), r = k === N - 1 ? 9 + Math.sin(t * 5) * 2 : 5; if (first < 0 && e > CL) first = k;
          if (e <= SL) { U.dot(c, X(k), Y(v), r, e > CL ? '#d08a1e' : '#1f4fb5'); return; }
          // 超規格：曝光後量＝空心綠圈＋↺（重做救回）；蝕刻後量＝紅色 ✕（報廢）
          if (stn === 0) { c.strokeStyle = '#1f7a4d'; c.lineWidth = 2.5; c.beginPath(); c.arc(X(k), Y(v), r + 1, 0, 7); c.stroke(); U.txt(c, '↺', X(k), Y(v) - r - 6, { align: 'center', size: 14, w: 700, color: '#1f7a4d' }); }
          else { U.dot(c, X(k), Y(v), r, '#b3261e'); c.strokeStyle = '#fff'; c.lineWidth = 2; const s = r * 0.55; c.beginPath(); c.moveTo(X(k) - s, Y(v) - s); c.lineTo(X(k) + s, Y(v) + s); c.moveTo(X(k) + s, Y(v) - s); c.lineTo(X(k) - s, Y(v) + s); c.stroke(); }
        });
        // 偏移（連串）規則：連續 7 點都在目標同一側，還沒超線也算異常（各廠規定 7–9 點不等）
        let run = -1; for (let k = 6; k < N && run < 0; k++) if (vs.slice(k - 6, k + 1).every(v => v > T)) run = k;
        if (run >= 0 && (first < 0 || run < first)) { c.strokeStyle = '#7a3fd8'; c.lineWidth = 2; c.setLineDash([4, 3]); c.strokeRect(X(run - 6) - 10, Y(T + CL) - 6, X(run) - X(run - 6) + 20, Y(T) - Y(T + CL) + 12); c.setLineDash([]); U.tag(c, '連續 7 點都偏上：還沒超線，但已經在漂（偏移）', X(run - 6) - 10, Y(T) + 26, { align: X(run - 6) > gx + gw / 2 ? 'right' : 'left', size: 14, color: '#7a3fd8' }); }
        if (first >= 0 && first < N - 1) U.tag(c, '第一次超出管制線：產品還合格，但機台在漂了', X(first), Y(T - CL) + 50, { align: first > N / 2 ? 'right' : 'left', size: 14, color: '#a8660a' });
        const last = vs[N - 1], e = Math.abs(last - T), warn = run >= 0 || (first >= 0 && first < N - 1);
        const V = e <= CL ? (warn ? 'WATCH' : 'PASS') : e <= SL ? 'ADJUST' : stn === 0 ? 'REWORK' : 'SCRAP';
        // 晚處理的代價：第一次超線之後又跑了幾批、其中幾批超出規格
        if (first >= 0 && first < N - 1) { const after = vs.slice(first + 1), bad = after.filter(v => Math.abs(v - T) > SL).length; U.tag(c, `第一次超線後又跑了 ${after.length} 批` + (bad ? `，其中 ${bad} 批超出規格` : ''), gx + gw - 4, Y(T - SL) + 34, { align: 'right', size: 14, color: bad ? '#b3261e' : '#a8660a' }); }
        const nBad = vs.filter(v => Math.abs(v - T) > SL).length;
        if (nBad) U.tag(c, stn === 0 ? `↺ ${nBad} 批洗掉重做：救回來了，但多花時間和成本` : `✕ ${nBad} 批已經蝕刻：多半報廢`, gx + gw - 4, Y(T - SL) + 62, { align: 'right', size: 15, color: stn === 0 ? '#1f7a4d' : '#b3261e' });
        U.txt(c, `最新一批（大點）：${last.toFixed(2)} nm`, gx, h - 16, { size: 15, w: 700, color: '#17202b' });
        if (V !== lastV) {
          lastV = V; D.textContent = ML_V[V][2];
          rows.forEach(r => { const on = r.dataset.v === V; r.style.opacity = on ? 1 : 0.4; r.style.borderColor = on ? ML_V[V][0] : 'transparent'; r.style.background = on ? '#fff' : ''; });
        }
      });
    }
  });

  /* APC：批次對批次的自動修正（回饋＋前饋）；修正力道、量測準不準、調整量的管制 */
  Fig.add('apc', { body: true,
    eyebrow: EY9, render: () => `<div class="s-body w66">
      <div class="col">${ctlFlow(2)}${U.figHTML('ap-cv', '上：APC 迴圈　中：每批的線寬（灰＝沒有 APC）　下：APC 每批調了多少', '')}
        <div class="controls">${U.range('ap-g', '修正力道（這批偏多少，下一批補幾成）', 0, 1.8, 0.05, 0.5, '')}${U.seg('ap-n', ['量測準', '量測不準'], 0)}${U.seg('ap-f', ['前饋 關', '前饋 開'], 0)}</div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="ap-h"></h4><p id="ap-d" style="font-size:16px;margin:0"></p></div>`,
        meters: [['ap-m', '線寬穩定度（比沒有 APC）']],
        extra: `<div class="card"><h4 style="margin-bottom:6px">SPC 和 APC 怎麼分工</h4><table style="width:100%;border-collapse:collapse;font-size:15px;line-height:1.35">${[['', 'SPC', 'APC'], ['做什麼', '監控：機台有沒有變', '修正：下一批調多少'], ['誰動手', '工程師判定、處置', '系統自動'], ['多快', '看趨勢，超線才動', '每一批都調'], ['怕什麼', '誤報、漏抓', '量不準；把機台問題藏起來']].map((r, i) => `<tr style="border-top:${i ? '1px solid var(--line)' : '0'}">${r.map((x, j) => `<${i && j ? 'td' : 'th'} style="text-align:left;padding:4px 6px;${j === 0 ? 'color:var(--ink-3);font-weight:600;white-space:nowrap' : ''}">${x}</${i && j ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</table></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#ap-cv'));
      let g = 0.5, noisy = 0, ff = 0;
      U.bind(el, 'ap-g', v => g = v, v => (v * 10).toFixed(1).replace('.0', '') + ' 成' + (v > 1 ? '（補過頭）' : ''));
      U.onSeg(el, 'ap-n', i => noisy = i);
      U.onSeg(el, 'ap-f', i => ff = i);
      const H = U.$(el, '#ap-h'), D = U.$(el, '#ap-d');
      const N = 30, T = 15, SL = 1.2, LIM = 1.0;
      let lastMsg = '';
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        // 模擬 30 批：機台慢慢漂（d）、進來的晶圓每批不一樣（u，上一站造成）、製程本身的抖動（p）、量測誤差（m）
        const sim = nz => {
          const off = [], on = [], knob = []; let x = 0;
          for (let k = 0; k < N; k++) {
            const d = 1.3 * k / (N - 1), u = (hr(k + 300) - .5) * 0.9, p = (hr(k + 400) - .5) * 0.18, m = (hr(k + 500) - .5) * (nz ? 2.4 : 0.08);
            const fwd = ff ? u + (hr(k + 600) - .5) * 0.1 : 0;          // 前饋：先量到 u，這批直接補掉（量得不完全準）
            const cd = T + d + u + p - x - fwd;
            off.push(T + d + u + p); on.push(cd); knob.push(x);
            x += g * (cd + m - T);                                       // 回饋：量到的誤差 × 修正力道，加到下一批
          }
          return { off, on, knob };
        };
        const { off, on, knob } = sim(noisy), acc = noisy ? sim(0).on : null;
        // 上：迴圈示意
        const B = [['曝光機', 0.08], ['晶圓', 0.3], ['量測機', 0.52], ['APC 電腦', 0.78]], by = 18, bh = 40, bw2 = w * 0.16;
        B.forEach(([n, f], k) => { const bx = w * f - bw2 / 2; c.fillStyle = k === 3 ? '#1f4fb5' : '#e8edf3'; c.fillRect(bx, by, bw2, bh); c.strokeStyle = '#1f4fb5'; c.lineWidth = 1.5; c.strokeRect(bx, by, bw2, bh); U.txt(c, n, w * f, by + 26, { align: 'center', size: 16, w: 700, color: k === 3 ? '#fff' : '#17202b' }); if (k < 3) U.arrow(c, bx + bw2 + 4, by + bh / 2, w * B[k + 1][1] - bw2 / 2 - 4, by + bh / 2, '#9aa8b8', 2); });
        U.txt(c, '量到：這批偏了多少', (w * 0.52 + w * 0.78) / 2, by - 4, { align: 'center', size: 13, color: '#6a7888' });
        const ly = by + bh + 26; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.beginPath(); c.moveTo(w * 0.78, by + bh + 2); c.lineTo(w * 0.78, ly); c.lineTo(w * 0.08, ly); c.stroke(); U.arrow(c, w * 0.08, ly, w * 0.08, by + bh + 4, '#1f4fb5', 2);
        U.tag(c, `下一批的劑量修正 ＝ 這批的修正 ＋ ${(g * 10).toFixed(1).replace('.0', '')} 成 × 這批偏多少`, w * 0.43, ly + 6, { align: 'center', size: 14, color: '#1f4fb5' });
        const ph = (t * 0.35) % 1, dx = ph < 0.75 ? U.lerp(w * 0.08, w * 0.78, ph / 0.75) : U.lerp(w * 0.78, w * 0.08, (ph - 0.75) / 0.25), dy = ph < 0.75 ? by + bh / 2 : ly;
        U.dot(c, dx, dy, 6, '#e8590c');
        if (ff) { const fx = w * 0.95; c.fillStyle = '#f3ecfd'; c.fillRect(fx - 52, by, 100, bh); c.strokeStyle = '#7a3fd8'; c.strokeRect(fx - 52, by, 100, bh); U.txt(c, '上一站量膜厚', fx - 2, by + 25, { align: 'center', size: 13, w: 700, color: '#7a3fd8' }); U.arrow(c, fx - 54, by + bh / 2, w * 0.78 + bw2 / 2 + 4, by + bh / 2, '#7a3fd8', 2); }
        // 中：線寬
        const gx = 66, gw = w - gx - 130, g1 = ly + 34, g1h = (h - g1 - 40) * 0.6, g2 = g1 + g1h + 26, g2h = h - g2 - 30;
        const X = k => gx + (k + 0.5) / N * gw, Y1 = v => g1 + g1h - (U.clamp(v, T - 2, T + 2) - (T - 2)) / 4 * g1h;
        c.fillStyle = 'rgba(31,122,77,.07)'; c.fillRect(gx, Y1(T + SL), gw, Y1(T - SL) - Y1(T + SL));
        [[T + SL, '#b3261e', '規格上限'], [T, '#1f7a4d', '目標 15.0'], [T - SL, '#b3261e', '規格下限']].forEach(([v, col, lab]) => { c.strokeStyle = col; c.lineWidth = 1.5; c.setLineDash(v === T ? [2, 4] : []); c.beginPath(); c.moveTo(gx, Y1(v)); c.lineTo(gx + gw, Y1(v)); c.stroke(); c.setLineDash([]); U.txt(c, lab, gx + gw + 8, Y1(v) + 5, { size: 13, w: 600, color: col }); });
        U.txt(c, '線寬', gx - 8, g1 + 12, { align: 'right', size: 13, color: '#6a7888' });
        const line = (arr, Y, col, lw2, dots) => { c.strokeStyle = col; c.lineWidth = lw2; c.beginPath(); arr.forEach((v, k) => k ? c.lineTo(X(k), Y(v)) : c.moveTo(X(k), Y(v))); c.stroke(); if (dots) arr.forEach((v, k) => U.dot(c, X(k), Y(v), 4, Math.abs(v - T) > SL ? '#b3261e' : col)); };
        line(off, Y1, '#c3ccd6', 2); if (acc) { c.setLineDash([5, 4]); line(acc, Y1, '#7fa6e8', 1.5); c.setLineDash([]); U.txt(c, '虛線：量測準的時候', gx + 8, g1 + 14, { size: 13, w: 600, color: '#5b86d6' }); } line(on, Y1, '#1f4fb5', 2, true);
        U.txt(c, '沒有 APC', X(N - 1) + 6, Y1(off[N - 1]) - 8, { align: 'right', size: 13, w: 600, color: '#8795a6' });
        // 下：調整量（把 APC 自己也畫成管制圖）
        const km = 2.2, Y2 = v => g2 + g2h - U.clamp(v / km, -0.1, 1) * g2h * 0.9;
        c.strokeStyle = '#d08a1e'; c.setLineDash([7, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, Y2(LIM)); c.lineTo(gx + gw, Y2(LIM)); c.stroke(); c.setLineDash([]);
        U.txt(c, '調整上限', gx + gw + 8, Y2(LIM) + 5, { size: 13, w: 600, color: '#d08a1e' });
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, Y2(0)); c.lineTo(gx + gw, Y2(0)); c.stroke();
        U.txt(c, '調整量', gx - 8, g2 + 12, { align: 'right', size: 13, color: '#6a7888' });
        line(knob, Y2, '#7a3fd8', 2, false);
        const over = knob.findIndex(v => v > LIM);
        if (over >= 0 && g > 0.05) U.tag(c, '調整量超過上限：不是 APC 壞了，是機台該保養了', X(over), Y2(LIM) - 12, { align: over > N / 2 ? 'right' : 'left', size: 13, color: '#a8660a' });
        U.txt(c, '批次（時間）→', gx + gw, h - 8, { align: 'right', size: 13, color: '#6a7888' });
        // 穩定度：最後 20 批相對目標的均方根，和沒有 APC 比
        const rms = a => Math.sqrt(a.slice(10).reduce((s, v) => s + (v - T) ** 2, 0) / (N - 10)), r0 = rms(off), r1 = rms(on), score = U.clamp(1 - r1 / r0, 0, 1), ra = acc ? rms(acc) : r1;
        if (g < 0.05) U.setMeter(el, 'ap-m', 0, '一樣（沒有修）', '');
        else U.setMeter(el, 'ap-m', score, r1 < r0 * 0.5 ? '穩很多' : r1 < r0 ? '有改善' : '更糟', r1 < r0 * 0.5 ? 'good' : r1 < r0 ? 'warn' : 'bad');
        const msg = g < 0.05 ? ['沒有修正', '修正力道是 0：機台漂多少，產品就跟著漂多少。'] :
          noisy ? ['量不準：APC 跟著雜訊亂調', `同樣的力道，線寬的抖動是量測準時的 ${(r1 / ra).toFixed(1)} 倍：量測誤差被當成真的偏差，去「修」本來沒問題的批次。力道越大越明顯；只能把力道調小、多批平均，根本解法是把量測顧好。`] :
          g < 0.3 ? ['太保守：追得慢', '每次只補一點點，機台一直在漂，線寬總是落後一截。'] :
          g <= 1.0 ? ['剛好：拉回目標附近', '每批補一部分，機台的漂移被抵銷，點留在目標附近。實務上常用比較保守的力道（約 2–4 成），等於把好幾批的偏差加權平均，減少雜訊的影響：這叫 EWMA，修正力道就是它的 λ。'] :
          r1 <= r0 ? ['太衝：補過頭、一上一下', '補的比偏的還多，下一批就偏到另一邊，開始來回擺盪；拉越大擺越兇，比剛好的時候差很多。'] :
          ['越修越糟：比不修還差', '每次都補過頭，線寬在目標兩邊大幅擺盪，比完全不修還差。'];
        const full = msg[0] + (ff ? '（前饋開：進來的晶圓差異先補掉）' : '');
        if (full !== lastMsg) { lastMsg = full; H.textContent = full; D.textContent = msg[1]; H.style.color = /剛好/.test(msg[0]) ? '#1f7a4d' : '#a8660a'; }
      });
    }
  });

  Fig.add('insp', { body: true,
    eyebrow: EY9, render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('ml-w', 'ABCDEFGH'.split(''), 0)}<button class="btn" type="button" id="ml-rp">↻ 重播</button></div>
        ${U.figHTML('ml-map', '缺陷地圖（wafer map）：光學掃描 → SEM 複檢 → 分類 → 猜是哪台機台', '')}
        <div class="controls"><span style="font-size:17px;color:var(--ink-2)">猜原因：</span><span id="ml-g" style="display:flex;gap:6px;flex-wrap:wrap"></span><span id="ml-sc2" style="margin-left:auto;font-size:16px;color:var(--ink-2)"></span></div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="ml-h"></h4><p id="ml-dd" style="font-size:17px;margin:0"></p></div>`
      })}</div>`,
    init(el, ctx) {
      let pi = 0, pt = 0, guess = -1;
      const map = U.canvas(U.$(el, '#ml-map'));
      const H = U.$(el, '#ml-h'), D = U.$(el, '#ml-dd');
      const setCard = () => {
        if (guess < 0) { H.textContent = '檢測：先找、再看、再分類'; H.style.color = ''; D.textContent = '光學機台整片掃，把每顆晶粒和隔壁晶粒比對，找出可疑點；再用複檢 SEM 抽幾個點放大看是什麼；分類後看分布的形狀，推回是哪台機台。看完動畫，在下面猜猜看原因。'; }
        else { const ok = WM[pi].ans === guess; H.textContent = ok ? '答對了！' : '再想想：看看分布的形狀'; H.style.color = ok ? '#1f7a4d' : '#b3261e'; D.textContent = ok ? WM[pi].why : '提示：' + WM[pi].hint; }
        const n = solved.filter(Boolean).length; U.$(el, '#ml-sc2').textContent = `已破解 ${n} / ${WM.length}`;
      };
      const solved = WM.map(() => false);
      U.onSeg(el, 'ml-w', i => {
        pi = i; pt = 0; guess = -1; setCard();
        U.$(el, '#ml-g').innerHTML = WM[i].opts.map(g => `<button class="btn" type="button" data-g="${g}" style="padding:6px 12px;font-size:16px">${WM_C[g]}</button>`).join('');
      });
      U.$(el, '#ml-rp').addEventListener('click', () => { pt = 0; });
      U.$(el, '#ml-g').addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (!b) return; guess = +b.dataset.g; if (guess === WM[pi].ans) solved[pi] = true; U.$$(el, '#ml-g button').forEach(x => x.classList.toggle('primary', x === b)); pt = Math.max(pt, 6); setCard(); });
      // 晶粒比對示意：三顆晶粒圖案一樣，中間那顆多了一個點 → 可疑點
      const dieCmp = (c, x, y, s, f) => {
        ['左邊晶粒', '這顆', '右邊晶粒'].forEach((lab, k) => {
          const dx = x + k * (s + 18);
          c.fillStyle = '#f4f6f9'; c.fillRect(dx, y, s, s); c.strokeStyle = k === 1 ? '#1f4fb5' : '#9aa8b8'; c.lineWidth = k === 1 ? 2.5 : 1.5; c.strokeRect(dx, y, s, s);
          c.fillStyle = '#9aa8b8'; for (let j = 0; j < 4; j++) c.fillRect(dx + s * 0.15, y + s * (0.15 + j * 0.2), s * 0.7, s * 0.07);
          if (k === 1) { U.dot(c, dx + s * 0.62, y + s * 0.47, 5, '#3e4b5b'); if (f > 0.5) { c.strokeStyle = '#b3261e'; c.lineWidth = 2.5; c.beginPath(); c.arc(dx + s * 0.62, y + s * 0.47, 13, 0, 7); c.stroke(); } }
          U.txt(c, lab, dx + s / 2, y + s + 20, { align: 'center', size: 14, color: k === 1 ? '#1f4fb5' : '#6a7888' });
        });
        if (f > 0.5) U.txt(c, '和左右都不一樣 → 可疑點（還不知道是什麼）', x, y + s + 48, { size: 15, w: 700, color: '#b3261e' });
      };
      ctx.raf((dt, t) => {
        pt += dt; const { c, w, h } = map; c.clearRect(0, 0, w, h);
        const R = Math.min(h * 0.42, w * 0.3), cx = R + 40, cy = h / 2 + 8, dfs = wmDefects(pi);
        const scan = U.clamp(pt / 2.5, 0, 1), rev = pt > 2.6, cls = pt > 4.6;
        c.fillStyle = '#eef2f6'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
        const ds = R * 0.18; c.strokeStyle = '#d3dbe4'; c.lineWidth = 1;
        for (let x = -R; x < R; x += ds) for (let y = -R; y < R; y += ds) if (Math.hypot(x + ds / 2, y + ds / 2) < R - ds * 0.6) c.strokeRect(cx + x, cy + y, ds, ds);
        if (pi === 1 && guess >= 0) {
          // 曝光格：缺陷都落在每一格裡的同一個相對位置（左上 1/3 處）
          c.strokeStyle = 'rgba(31,79,181,.6)'; c.lineWidth = 2;
          for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) { const x0 = i * 0.36 + 0.07 - 0.12, y0 = j * 0.36 - 0.05 - 0.12; if (Math.hypot(x0 + 0.18, y0 + 0.18) < 0.82) c.strokeRect(cx + x0 * R, cy + y0 * R, 0.36 * R, 0.36 * R); }
          U.tag(c, '藍框：一次曝光的範圍，每格同一個位置都有', cx, cy + R + 22, { align: 'center', size: 14, color: '#1f4fb5' });
        }
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
        const sx = cx - R + scan * 2 * R;
        if (scan < 1) { c.strokeStyle = 'rgba(31,79,181,.7)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx, cy - R - 6); c.lineTo(sx, cy + R + 6); c.stroke(); }
        const MAINC = '#b3261e';
        dfs.forEach(([x, y, m]) => { const px = cx + x * R, py = cy + y * R; if (px > sx) return; U.dot(c, px, py, 4, cls ? (m ? MAINC : '#9aa8b8') : '#3e4b5b'); });
        // 右邊：流程與 SEM 複檢
        const rx = cx + R + 50, rw = w - rx - 16;
        const stage = cls ? 2 : rev ? 1 : 0;
        ['① 光學掃描：和隔壁晶粒比對，找出可疑點', '② 複檢 SEM：抽幾個點放大看', '③ 分類：這次要找的（紅）／其他來源（灰）'].forEach((s, k) => U.txt(c, s, rx, 34 + k * 28, { size: 16, w: k === stage ? 700 : 500, color: k <= stage ? '#17202b' : '#9aa8b8' }));
        if (!rev) dieCmp(c, rx, 140, Math.min(90, rw / 3 - 14), (pt % 2.6) / 1.3);
        else {
          const picks = [dfs.find(d => d[2]), dfs.filter(d => d[2])[7] || dfs[11], dfs[2]], s = Math.min(110, rw / 3 - 14);
          picks.forEach((d, k) => {
            const tx = rx + k * (s + 16), ty = 130, px = cx + d[0] * R, py = cy + d[1] * R, f = U.clamp((pt - 2.6 - k * 0.4) / 0.4, 0, 1); if (f <= 0) return;
            c.globalAlpha = f; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 10, 0, 7); c.stroke();
            c.setLineDash([4, 4]); c.beginPath(); c.moveTo(px + 10, py); c.lineTo(tx, ty + s / 2); c.stroke(); c.setLineDash([]);
            const lab = semThumb(c, tx, ty, s, pi, d[2]); U.txt(c, lab, tx + s / 2, ty + s + 20, { align: 'center', size: 14, w: 600, color: d[2] ? MAINC : '#6a7888' }); c.globalAlpha = 1;
          });
        }
        if (cls) {
          const y0 = 330;
          U.txt(c, '④ 看分布的形狀：是哪台機台造成的？', rx, y0, { size: 18, w: 700, color: '#b3541e' });
          U.txt(c, guess < 0 ? '在下面選一個原因' : (WM[pi].ans === guess ? '✓ ' + WM_C[guess] : '✗ 不是「' + WM_C[guess] + '」'), rx, y0 + 34, { size: 17, w: 700, color: guess < 0 ? '#6a7888' : WM[pi].ans === guess ? '#1f7a4d' : '#b3261e' });
          if (guess >= 0 && WM[pi].ans === guess) U.txt(c, '→ 通知該機台：停機檢查、修好再放行', rx, y0 + 66, { size: 15, color: '#1f7a4d' });
        }
      });
    }
  });

  /* 4. 量測 */
  const MET = [
    { k: 'tem', n: '穿透式電子顯微鏡 TEM', d: '把晶片切成極薄的片，直接看到原子。最清楚，是大家拿來對照的「參考」，但晶片就毀了。', speed: .05, model: .1, real: 1, harm: 1 },
    { k: 'sem', n: '電子顯微鏡 SEM', d: '用電子束從上方掃描，看線寬（CD）有沒有對。只看得到表面。', speed: .6, model: .35, real: .7, harm: .1 },
    { k: 'ocd', n: '光學散射 OCD', d: '打一道光到切割道上的週期性量測靶，分析反射光譜，用模型反推 3D 形狀。', speed: .95, model: .9, real: .2, harm: 0 }
  ];
  Fig.add('metro', { body: true,
    eyebrow: EY9, render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('m1-m', MET.map(m => m.n), 0)}</div>${U.figHTML('m1-cv', '量測方式示意', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><p id="m1-d" style="font-size:20px;margin:0"></p></div>`,
        meters: [['m1-a', '速度'], ['m1-b', '靠模型反推'], ['m1-e', '量真實電路'], ['m1-c', '會破壞晶片']],
        extra: '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-go="tem" type="button">TEM 詳解 →</button><button class="btn" data-go="sem" type="button">SEM 詳解 →</button><button class="btn" data-go="ocd" type="button">OCD 詳解 →</button></div>'
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#m1-cv'));
      let m = 0;
      const tem = new Image(); tem.src = CREDITS.gaatem.f;
      const sem = new Image(); sem.src = CREDITS.cdsem.f;
      U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go));
      U.onSeg(el, 'm1-m', i => { m = i; const x = MET[i]; U.$(el, '#m1-d').textContent = x.d; U.setMeter(el, 'm1-a', x.speed, x.speed > .7 ? '快' : x.speed > .3 ? '中' : '很慢', x.speed > .3 ? 'good' : 'warn'); U.setMeter(el, 'm1-b', x.model, x.model > .7 ? '全靠模型' : x.model > .3 ? '靠演算法' : '直接看', x.model > .7 ? 'warn' : 'good'); U.setMeter(el, 'm1-e', x.real, x.real > .9 ? '能' : x.real > .5 ? '只看表面' : '只量靶', x.real > .5 ? 'good' : 'warn'); U.setMeter(el, 'm1-c', x.harm, x.harm > .5 ? '會' : '不會', x.harm > .5 ? 'bad' : 'good'); });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const base = h * 0.72, L = 40, R = w - 40;
        const fins = 9;
        const dim2 = (c, a, y, b) => { U.arrow(c, a, y, b, y, '#a8660a', 1.5); U.arrow(c, b, y, a, y, '#a8660a', 1.5); };
        const drawFins = (cut) => { U.box(c, 'si', L, base, R - L, 40); for (let k = 0; k < fins; k++) { const x = L + 30 + k * (R - L - 60) / fins; U.box(c, 'si', x, base - 90, 26, 90); U.box(c, 'metal', x - 6, base - 100, 38, 12, { a: .8 }); } };
        const k = MET[m].k;
        if (k === 'sem') {
          if (sem.complete && sem.naturalWidth) { const sc = Math.min((w - 80) / sem.width, (h - 60) / sem.height); c.drawImage(sem, (w - sem.width * sc) / 2, 20, sem.width * sc, sem.height * sc); }
          U.tag(c, '真實 CD-SEM 俯視照：38 nm 線條，邊緣最亮；下方白線是亮度曲線（Song et al.，CC BY 4.0）', w / 2, h - 14, { align: 'center', size: 13 });
        } else if (k === 'ocd') {
          // 週期性量測靶：一整排一樣的線，光斑同時照到很多條 → 量到的是整塊的平均
          drawFins();
          const sx0 = L + 20, sx1 = R - 20, top = base - 100;
          c.fillStyle = 'rgba(242,193,78,.28)'; c.beginPath(); c.moveTo(L + 60, 40); c.lineTo(L + 110, 40); c.lineTo(sx1 - 120, top); c.lineTo(sx0 + 40, top); c.fill();
          c.strokeStyle = 'rgba(208,138,30,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx0 + 40, top); c.lineTo(sx1 - 120, top); c.stroke();
          c.fillStyle = 'rgba(242,193,78,.2)'; c.beginPath(); c.moveTo(sx0 + 40, top); c.lineTo(sx1 - 120, top); c.lineTo(R - 60, 40); c.lineTo(R - 160, 40); c.fill();
          U.tag(c, '白光（各種波長）', L + 70, 30, { size: 14 }); U.tag(c, '反射光 → 光譜儀', R - 110, 30, { align: 'center', size: 14 });
          dim2(c, sx0 + 40, top - 14, sx1 - 120, top - 14);
          U.tag(c, '光斑照到上千條線：量到的是整塊的平均', (sx0 + sx1 - 80) / 2, top - 24, { align: 'center', size: 14, color: '#a8660a' });
          U.tag(c, '量測靶：放在切割道上、一整排一樣的線（週期性），不是真正的電路', w / 2, h - 14, { align: 'center', size: 14 });
        } else {
          if (tem.complete) { const s = Math.min((w - 80) / tem.width, (h - 60) / tem.height); c.drawImage(tem, (w - tem.width * s) / 2, 20, tem.width * s, tem.height * s); }
          U.tag(c, '真實 TEM 照片：環繞式電晶體剖面，三片奈米片被閘極包住（研究樣品，Qian et al.，CC BY 4.0）', w / 2, h - 14, { align: 'center', size: 13 });
        }
      });
    }
  });

  /* 量測 A：SEM */
  Fig.add('sem', { body: true,
    back: 'metro', eyebrow: EY9 + '：量測', render: () => `<div class="s-body">
      <div class="col">${U.figHTML('sm-cv', '左：電子束掃描（剖面）　右：一點一點拼出來的影像與亮度曲線', '')}
        <div class="controls">${U.range('sm-w', '實際線寬', 10, 40, 1, 22, ' nm')}</div></div>
      ${U.pageSide({
        top: `<div class="fact"><div class="v" id="sm-v">—</div><div class="d" id="sm-vd">SEM 報出的線寬（演算法從亮邊判定）</div></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#sm-cv'));
      let lw = 22, scan = 0;
      U.bind(el, 'sm-w', v => { lw = v; scan = 0; }, v => v + ' nm');
      ctx.raf((dt, t) => {
        scan = Math.min(1, scan + dt * 0.35);
        c.clearRect(0, 0, w, h);
        const half = w / 2 - 10, base = h * 0.62, L = 20, R = half - 10;
        const sp = (R - L) / 3, S = sp * 0.62 / 40, lines = [0, 1, 2].map(k => L + (k + 0.5) * sp);
        U.box(c, 'si', L, base, R - L, h - base - 20);
        lines.forEach(x => U.box(c, 'pr', x - lw * S / 2, base - 70, lw * S, 70));
        const bx = L + scan * (R - L);
        c.strokeStyle = 'rgba(31,79,181,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(bx, 30); c.lineTo(bx, base - (lines.some(x => Math.abs(bx - x) < lw * S / 2) ? 70 : 0)); c.stroke();
        U.dot(c, bx, 24, 9, '#1f4fb5'); U.tag(c, '電子束', bx > R - 60 ? bx - 56 : bx + 12, 30, { size: 13 });
        const edge = lines.some(x => Math.abs(Math.abs(bx - x) - lw * S / 2) < 5);
        for (let k = 0; k < (edge ? 10 : 3); k++) { const a = -Math.PI / 2 + (Math.random() - .5) * 2.4, r = 10 + Math.random() * 40; U.dot(c, bx + Math.cos(a) * r, base - 40 + Math.sin(a) * r, 2.5, '#e0a33a'); }
        U.tag(c, edge ? '邊緣：噴出很多電子（黃點）' : '平面：噴出的電子少', L + 6, h - 8, { size: 14, color: edge ? '#a8660a' : '#3e4b5b' });
        // 右側：影像與亮度曲線
        const ix = half + 20, iw = w - ix - 20, it = 30, ih = h * 0.42;
        const bright = x => { let v = 0.25; lines.forEach(lx => { const d = Math.abs(x - lx) - lw * S / 2; v += 0.75 * Math.exp(-(d * d) / 18); if (Math.abs(x - lx) < lw * S / 2) v += 0.12; }); return Math.min(1, v); };
        for (let px = 0; px < iw * scan; px++) { const x = L + px / iw * (R - L); const b = bright(x); c.fillStyle = `rgb(${b * 235 | 0},${b * 235 | 0},${b * 235 | 0})`; c.fillRect(ix + px, it, 1, ih); }
        c.strokeStyle = '#9aa8b8'; c.strokeRect(ix, it, iw, ih);
        U.tag(c, 'SEM 影像（從上面看）', ix + 4, it - 6, { size: 13 });
        const gy = it + ih + 30, gh = h - gy - 30;
        c.strokeStyle = '#9aa8b8'; c.beginPath(); c.moveTo(ix, gy); c.lineTo(ix, gy + gh); c.lineTo(ix + iw, gy + gh); c.stroke();
        c.strokeStyle = '#1f4fb5'; c.lineWidth = 2.5; c.beginPath();
        for (let px = 0; px < iw * scan; px++) { const b = bright(L + px / iw * (R - L)); const y = gy + gh - b * gh; px ? c.lineTo(ix + px, y) : c.moveTo(ix, y); } c.stroke();
        U.txt(c, '亮度', ix - 4, gy + 12, { align: 'right', size: 13, color: '#6a7888' });
        if (scan > 0.5) {
          const lx = lines[1], e1 = ix + ((lx - lw * S / 2) - L) / (R - L) * iw, e2 = ix + ((lx + lw * S / 2) - L) / (R - L) * iw;
          U.arrow(c, e1, gy - 8, e2, gy - 8, '#b3541e', 2); U.arrow(c, e2, gy - 8, e1, gy - 8, '#b3541e', 2);
          U.txt(c, '演算法：從亮度曲線判定兩個邊 → 線寬', (e1 + e2) / 2, gy - 14, { align: 'center', size: 13, color: '#b3541e' });
          U.$(el, '#sm-v').textContent = (lw + Math.sin(t * 2) * 0.2).toFixed(1) + ' nm';
        } else U.$(el, '#sm-v').textContent = '掃描中…';
      });
    }
  });

  /* 量測 B：TEM */
  function temStep(c, w, h, i, p, t, img) {
    const L = 40, R = w - 40, cx = w / 2;
    if (i === 0) {
      c.fillStyle = '#c8d3df'; c.beginPath(); c.arc(cx - 120, h / 2, Math.min(w, h) * 0.3, 0, 7); c.fill();
      for (let k = -4; k <= 4; k++) for (let j = -4; j <= 4; j++) { const x = cx - 120 + k * 24, y = h / 2 + j * 24; if (Math.hypot(x - cx + 120, y - h / 2) < Math.min(w, h) * 0.27) { c.fillStyle = '#9fb5e3'; c.fillRect(x - 10, y - 10, 20, 20); } }
      c.strokeStyle = '#b3541e'; c.lineWidth = 3; c.strokeRect(cx - 132, h / 2 - 12, 24, 24);
      U.arrow(c, cx - 100, h / 2, cx + 60, h / 2 - 40, '#b3541e', 2);
      c.fillStyle = '#eef2f6'; c.fillRect(cx + 70, h / 2 - 120, 220, 160); for (let k = 0; k < 8; k++) U.box(c, 'metal', cx + 90 + k * 24, h / 2 - 90, 12, 110);
      U.tag(c, '找到想看的那一顆電晶體', cx + 180, h / 2 + 70, { align: 'center', size: 15 });
    } else if (i === 1 || i === 2) {
      const base = h * 0.35;
      U.box(c, 'si', L, base, R - L, h - base - 30);
      for (let k = 0; k < 8; k++) U.box(c, 'metal', L + 40 + k * (R - L - 80) / 8, base - 16, 22, 16);
      const tw = 90 * (i === 1 ? p : 1), keep = i === 2 ? U.lerp(60, 14, p) : 60;
      c.fillStyle = '#fbfcfd'; c.fillRect(cx - keep / 2 - tw, base - 16, tw, h * 0.4); c.fillRect(cx + keep / 2, base - 16, tw, h * 0.4);
      if (i === 1) for (let k = 0; k < 6; k++) { const x = cx + (k % 2 ? 1 : -1) * (keep / 2 + tw * Math.random()); U.arrow(c, x, 20, x, base - 20, '#c0392b', 1.5); }
      U.tag(c, i === 1 ? '用聚焦離子束（紅）在兩側挖坑' : '把中間那片削到比電晶體還薄（約 10–30 nm）', cx, 30 + (i === 1 ? 0 : 0), { align: 'center', size: 16, color: '#17202b' });
      if (i === 2) U.tag(c, '← 薄片 →', cx, base + h * 0.2, { align: 'center', size: 14, color: '#b3541e' });
    } else if (i === 3) {
      const ly = h * 0.45;
      c.fillStyle = 'rgba(31,79,181,.18)'; c.beginPath(); c.moveTo(cx - 20, 20); c.lineTo(cx + 20, 20); c.lineTo(cx + 120, h - 60); c.lineTo(cx - 120, h - 60); c.fill();
      for (let k = 0; k < 10; k++) { const x = cx - 18 + k * 4, y = 20 + ((t * 200 + k * 30) % (h - 90)); U.dot(c, x + (y - 20) / (h - 80) * (k - 4.5) * 20, y, 3, '#1f4fb5'); }
      c.fillStyle = '#9fb5e3'; c.fillRect(cx - 60, ly - 4, 120, 8); U.tag(c, '超薄樣品', cx + 70, ly + 5, { size: 14 });
      c.fillStyle = '#2b3440'; c.fillRect(cx - 140, h - 56, 280, 20); U.tag(c, '偵測器：電子穿過多少，就是影像的明暗', cx, h - 14, { align: 'center', size: 14 });
      U.tag(c, '電子束穿過薄片', cx + 30, 40, { size: 14, color: '#1f4fb5' });
    } else {
      if (img.complete) { const s = Math.min((w - 40) / img.width, (h - 60) / img.height); c.drawImage(img, (w - img.width * s) / 2, 10, img.width * s, img.height * s); }
      U.tag(c, '真實 TEM 影像：連 1 nm 的絕緣層都看得清楚', cx, h - 12, { align: 'center', size: 15, color: '#1f7a4d' });
    }
  }
  Fig.add('tem', { body: true,
    back: 'metro', eyebrow: EY9 + '：量測', render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('tm-cv', 'TEM 樣品製作與成像（逐步）', '')}${U.stepperHTML('tm-st')}</div>
      ${U.pageSide({
        
      })}</div>`,
    init(el, ctx) {
      const img = new Image(); img.src = CREDITS.gaatem.f;
      const steps = ['找到位置', '挖兩個坑', '削成薄片', '電子穿過', '看到結果'].map((t, i) => ({ t, d: '', draw: (c, w, h, p, tt) => temStep(c, w, h, i, p, tt, img) }));
      U.animSteps(el, ctx, { canvas: 'tm-cv', stepper: 'tm-st', steps, interval: 2800 });
    }
  });

  /* 量測 C：OCD */
  // 題目：第 0 題是示範；第 3 題真實形狀底部多了「腳」，模型裡沒有這個參數，怎麼調都對不齊
  const OCD_Q = [{ wd: 17, ht: 42 }, { wd: 11, ht: 52 }, { wd: 25, ht: 30 }, { wd: 20, ht: 46, foot: 1 }];
  const OCD_S = [[26, 28], [20, 30], [12, 55], [14, 30]];
  const spec = (lam, wd, ht) => 0.5 + 0.22 * Math.cos(4 * Math.PI * ht * 15 / lam + wd * 0.04) + 0.14 * Math.cos(2 * Math.PI * wd * 25 / lam);
  Fig.add('ocd', { body: true,
    back: 'metro', eyebrow: EY9 + '：量測', render: () => `<div class="s-body">
      <div class="col">${U.figHTML('oc-cv', '左：形狀（實際的看不到）　右：反射光譜（各種顏色的強弱）', '')}
        <div class="controls">${U.range('oc-w', '猜測：鰭的寬度', 8, 30, 0.5, 26, ' nm')}${U.range('oc-h', '猜測：鰭的高度', 20, 60, 0.5, 28, ' nm')}<button class="btn primary" id="oc-auto" type="button">電腦自動比對</button><button class="btn" id="oc-q" type="button">出題：下一題 ▶</button></div></div>
      ${U.pageSide({
        meters: [['oc-m', '吻合程度']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#oc-cv'));
      let wd = 26, ht = 28, autoOn = false, qi = 0, Q = OCD_Q[0], best = null, done = false;
      const sw = U.bind(el, 'oc-w', v => wd = v, v => v + ' nm'), sh = U.bind(el, 'oc-h', v => ht = v, v => v + ' nm');
      const specT = lam => Q.foot ? spec(lam, Q.wd + 3.5, Q.ht) + 0.05 * Math.cos(2 * Math.PI * lam / 140 + 1) : spec(lam, Q.wd, Q.ht);  // 腳：光看起來像整根變胖，再加一點模型算不出來的部分
      const fit = (a, b) => { let e = 0; for (let lam = 300; lam <= 800; lam += 10) e += Math.abs(spec(lam, a, b) - specT(lam)); return U.clamp(1 - e / 51 / 0.18, 0, 1); };
      const setQ = i => {
        qi = i; Q = OCD_Q[i]; done = false; autoOn = false;
        // 先在滑桿範圍內找出「模型能做到最像」的那一組（有腳的那題，最像也對不齊）
        best = { m: 0 }; for (let a = 8; a <= 30; a += 0.5) for (let b = 20; b <= 60; b += 0.5) { const m = fit(a, b); if (m > best.m) best = { m, wd: a, ht: b }; }
        sw.set(OCD_S[i][0]); sh.set(OCD_S[i][1]);
      };
      setQ(0);
      U.$(el, '#oc-auto').onclick = () => { autoOn = true; };
      U.$(el, '#oc-q').onclick = () => setQ((qi + 1) % OCD_Q.length);
      ctx.raf((dt, t) => {
        if (autoOn) {
          wd += (best.wd - wd) * Math.min(1, dt * 2.5); ht += (best.ht - ht) * Math.min(1, dt * 2.5);
          sw.el.value = wd; sh.el.value = ht;
          U.$(el, '#oc-w-o').textContent = wd.toFixed(1) + ' nm'; U.$(el, '#oc-h-o').textContent = ht.toFixed(1) + ' nm';
          if (Math.abs(wd - best.wd) < 0.1 && Math.abs(ht - best.ht) < 0.1) autoOn = false;
        }
        c.clearRect(0, 0, w, h);
        const lw = w * 0.36, base = h * 0.8, S = 2.6;
        const match = fit(wd, ht), goal = Q.foot ? best.m - 0.02 : 0.95;
        if (match >= goal) done = true;
        // 形狀
        U.box(c, 'si', 20, base, lw - 20, 30);
        [[lw * 0.3, Q, done ? 1 : 0, '實際形狀'], [lw * 0.88, { wd, ht }, 1, '電腦的猜測']].forEach(([x, sp, vis, n]) => {
          // 實際的量測靶是一整排週期性的線；電腦的模型只算一個週期
          const real = n === '實際形狀', xs = real ? [x - 78, x, x + 78] : [x];
          if (vis) xs.forEach(xx => { const ft = real && sp.foot ? 12 : 0; c.fillStyle = real ? '#2b3440' : 'rgba(31,79,181,.8)'; c.beginPath(); c.moveTo(xx - sp.wd * S / 2 - 6 - ft, base); if (ft) c.lineTo(xx - sp.wd * S / 2 - 5, base - 14); c.lineTo(xx - sp.wd * S / 2, base - sp.ht * S); c.lineTo(xx + sp.wd * S / 2, base - sp.ht * S); if (ft) c.lineTo(xx + sp.wd * S / 2 + 5, base - 14); c.lineTo(xx + sp.wd * S / 2 + 6 + ft, base); c.fill(); });
          if (vis && real && sp.foot) U.tag(c, '真實形狀：底部有「腳」', x, base + 21, { align: 'center', size: 13, color: '#b3261e' });
          if (!vis) { c.strokeStyle = '#9aa8b8'; c.setLineDash([5, 4]); c.strokeRect(x - 110, base - 150, 220, 150); c.setLineDash([]); U.txt(c, '?', x, base - 65, { align: 'center', size: 44, w: 700, color: '#9aa8b8' }); }
          U.txt(c, real ? '量測靶（一整排）' : '猜測（一個週期）', x, base + (real ? 46 : 72), { align: 'center', size: 15, w: 600, color: real ? '#17202b' : '#1f4fb5' });
        });
        // 入射光與反射
        for (let k = 0; k < 6; k++) { c.strokeStyle = `hsla(${k * 50},80%,55%,.7)`; c.lineWidth = 2; c.beginPath(); c.moveTo(lw * 0.1 + k * 6, 30); c.lineTo(lw * 0.3, base - (done ? Q.ht * S : 150) - 6); c.lineTo(lw * 0.56 + k * 10, 30); c.stroke(); }
        // 光譜
        const gx = lw + 40, gw = w - gx - 20, gy = 40, gh = h - 100;
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
        const grad = c.createLinearGradient(gx, 0, gx + gw, 0); ['#7a3fd8', '#3a6fe0', '#2bb3a0', '#8cc63f', '#f2c14e', '#f28b3b', '#d9453b'].forEach((col, k) => grad.addColorStop(k / 6, col));
        c.fillStyle = grad; c.fillRect(gx, gy + gh + 6, gw, 10);
        U.txt(c, '紫光', gx, gy + gh + 34, { size: 13, color: '#6a7888' }); U.txt(c, '紅光', gx + gw, gy + gh + 34, { size: 13, color: '#6a7888', align: 'right' });
        const plot = (f, col, wdt, dash) => { c.strokeStyle = col; c.lineWidth = wdt; c.setLineDash(dash || []); c.beginPath(); for (let k = 0; k <= 100; k++) { const lam = 300 + k * 5, y = gy + gh - f(lam) * gh; k ? c.lineTo(gx + k / 100 * gw, y) : c.moveTo(gx, y); } c.stroke(); c.setLineDash([]); };
        plot(specT, '#2b3440', 3.5);
        U.txt(c, qi ? `第 ${qi} 題／共 ${OCD_Q.length - 1} 題` : '示範題', 20, 24, { size: 15, w: 700, color: '#7a3fd8' });
        plot(l => spec(l, wd, ht), '#1f4fb5', 2.5, [7, 5]);
        U.txt(c, '黑線：實際量到的光譜', gx + 8, gy + 14, { size: 14, w: 600, color: '#2b3440' });
        U.txt(c, '藍虛線：用猜測形狀算出來的光譜', gx + 8, gy + 34, { size: 14, w: 600, color: '#1f4fb5' });
        if (done && !Q.foot) U.tag(c, `吻合！你：寬 ${wd.toFixed(1)}、高 ${ht.toFixed(1)} nm；答案：寬 ${Q.wd}、高 ${Q.ht} nm`, gx + gw / 2, gy + gh - 20, { align: 'center', size: 16, color: '#1f7a4d' });
        if (done && Q.foot) { U.tag(c, `最像也只有 ${Math.round(best.m * 100)}%：模型裡沒有「腳」這個參數`, gx + gw / 2, gy + gh - 46, { align: 'center', size: 16, color: '#b3261e' }); U.tag(c, `硬對最像的：寬 ${wd.toFixed(1)} nm，真的上寬是 ${Q.wd} nm → 把腳算成整根變胖`, gx + gw / 2, gy + gh - 18, { align: 'center', size: 15, color: '#b3261e' }); }
        U.setMeter(el, 'oc-m', match, done && Q.foot ? '對不齊' : match > .95 ? '吻合' : match > .6 ? '接近' : '差很多', done && Q.foot ? 'warn' : match > .95 ? 'good' : match > .6 ? 'warn' : 'bad');
      });
    }
  });

  /* 第二部分小結 */
  const RECAP = [
    ['litho1', '① 微影', '用光畫出圖案', '光越細，畫得越細；EUV 是目前最細的光', 'pen'],
    ['etch1', '② 蝕刻', '挖掉不要的部分', '電漿讓牆壁又直又深', 'shovel'],
    ['depo4', '③ 沉積', '鋪上新的薄膜', 'ALD 一輪一薄層，每個角落都一樣厚', 'paint'],
    ['dope1', '④ 摻雜與磊晶', '調整導電性、長出晶體', '源汲極改成長晶體時就摻好', 'bullet'],
    ['hk1', '⑤ 閘極與高介電', '做出最關鍵的開關', '換成更厚但一樣有效的絕緣牆，擋住漏電', 'wall'],
    ['cmp1', '⑥ 平坦化', '把每一層磨平', '好幾種材料要一起磨到一樣平', 'sand'],
    ['gaaflow', '⑦ 環繞式與導線', '把技術組合起來', '疊千層、挖夾心做出奈米片，再接上十幾層導線', 'bread'],
    ['tcad1', '⑧ 模擬', '電腦裡的虛擬工廠', '先算再做，但一定要拿真實量測來校正', 'chip'],
    ['eyes', '⑨ 檢測量測', '工廠的三種檢查', '量尺寸、找缺陷，SPC 判定、APC 修正；做完用 WAT 量電性', 'eye'],
    ['d2m', '⑩ 從設計到量產', '從設計圖到量產', 'PDK 定規則、下線做光罩；靠 TV 和良率學習爬到量產', 'road']
  ];
  Fig.add('p2sum', { body: true,
    eyebrow: '第二部分 · 小結', render: () => `<div style="flex:1;display:grid;grid-template-columns:repeat(5,1fr);gap:12px;min-height:0">
      ${RECAP.map(([id, n, what, key, ic]) => `<button type="button" class="fig" data-go="${id}" style="text-align:left;cursor:pointer;font:inherit;gap:10px;justify-content:flex-start;padding:22px 16px">
        <div style="display:flex;gap:12px;align-items:center"><div class="analogy" style="padding:0;border:0;background:none;grid-template-columns:44px"><div class="ic" style="width:44px;height:44px">${U.icon(ic)}</div></div><div class="bigword" style="font-size:22px">${n}</div></div>
        <div style="font-size:19px;color:var(--accent);font-weight:700">${what}</div>
        <div style="font-size:18.5px;color:var(--ink-2);line-height:1.5">${key}</div></button>`).join('')}
</div>`,
    init(el) { U.$$(el, '[data-go]').forEach(b => b.onclick = () => Deck.goId(b.dataset.go)); }
  });
})();
