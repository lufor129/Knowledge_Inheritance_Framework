/* 第二部分 ⑨：OCD 補充兩頁——建答案本（參數化形狀＋n、k → RCWA → 光譜）、查 CD 並用 TEM 對答案、參數相關與混合量測
   兩頁都用簡化公式示意光譜，不是真的電磁計算；重點在流程與取捨 */
(function () {
  const EY = '第二部分 · ⑨ 檢測量測';
  const L0 = 250, L1 = 800; // 光譜範圍（nm）

  /* 示意光譜：上寬 top、下寬 bot、高度 h、硬遮罩厚度 f（nm） */
  const specP = (lam, s) => {
    const mid = (s.top + s.bot) / 2, swa = s.bot - s.top;
    const v = 0.45 + 0.2 * Math.cos(2 * Math.PI * (700 + 6 * s.h + 3 * s.f) / lam)
      + 0.12 * Math.cos(2 * Math.PI * (25 * mid + 4 * swa) / lam + 0.5)
      + 0.05 * Math.cos(2 * Math.PI * (300 + 8 * s.bot) / lam);
    return U.clamp(v, 0.04, 0.96);
  };

  /* 畫一條梯形的鰭（含頂部硬遮罩）；S：每 nm 幾 px */
  function fin(c, cx, base, S, s, o) {
    o = o || {};
    const tb = s.bot * S / 2, tt = s.top * S / 2, hh = s.h * S, ff = s.f * S;
    c.globalAlpha = o.a ?? 1;
    c.fillStyle = o.fill || U.MAT.si; c.beginPath(); c.moveTo(cx - tb, base); c.lineTo(cx - tt, base - hh); c.lineTo(cx + tt, base - hh); c.lineTo(cx + tb, base); c.closePath(); c.fill();
    if (!o.noFilm) { c.fillStyle = o.film || U.MAT.nit; c.fillRect(cx - tt, base - hh - ff, tt * 2, ff); }
    if (o.stroke) { c.globalAlpha = 1; c.strokeStyle = o.stroke; c.lineWidth = o.lw || 2; c.setLineDash(o.dash || []); c.beginPath(); c.moveTo(cx - tb, base); c.lineTo(cx - tt, base - hh); c.lineTo(cx + tt, base - hh); c.lineTo(cx + tb, base); c.stroke(); c.setLineDash([]); }
    c.globalAlpha = 1;
  }
  /* 在 (x,y,w,h) 的框裡畫光譜 */
  function plot(c, x, y, w, h, f, col, lw, dash, a) {
    c.save(); c.globalAlpha = a ?? 1; c.strokeStyle = col; c.lineWidth = lw || 2; c.setLineDash(dash || []); c.beginPath();
    for (let k = 0; k <= 110; k++) { const lam = L0 + k * (L1 - L0) / 110, yy = y + h - f(lam) * h; k ? c.lineTo(x + k / 110 * w, yy) : c.moveTo(x, yy); }
    c.stroke(); c.restore();
  }
  function axes(c, x, y, w, h, lab) {
    c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h); c.lineTo(x + w, y + h); c.stroke();
    if (lab !== false) {
      const g = c.createLinearGradient(x, 0, x + w, 0); ['#7a3fd8', '#3a6fe0', '#2bb3a0', '#8cc63f', '#f2c14e', '#f28b3b', '#d9453b'].forEach((col, k) => g.addColorStop(k / 6, col));
      c.fillStyle = g; c.fillRect(x, y + h + 4, w, 6);
      U.txt(c, '波長 →', x + w, y + h + 24, { align: 'right', size: 12, color: '#6a7888' });
      U.txt(c, '反射率', x + 4, y + 12, { size: 12, color: '#6a7888' });
    }
  }
  function dim(c, x1, y1, x2, y2, t, col, tx, ty, align) {
    U.arrow(c, x1, y1, x2, y2, col, 1.6); U.arrow(c, x2, y2, x1, y1, col, 1.6);
    U.tag(c, t, tx, ty, { size: 14, color: col, align: align || 'center' });
  }


  /* 光譜示意的誤差：切層數 N、諧波數 M 不夠時，算出來的光譜會偏掉 */
  const g1 = l => Math.sin(2 * Math.PI * 900 / l + 1.3), g2 = l => Math.cos(2 * Math.PI * 520 / l + 0.2);
  const ACC = [{ n: '粗略', N: 3, M: 2 }, { n: '標準', N: 10, M: 8 }, { n: '精細', N: 20, M: 20 }];
  const fmtT = s => s < 1 ? (s * 1000).toFixed(s < 0.01 ? 1 : 0) + ' 毫秒' : s < 60 ? s.toFixed(1) + ' 秒' : (s / 60).toFixed(1) + ' 分鐘';
  const rcwaSpec = (s, a) => { const eN = 0.5 / a.N, eM = 1.1 / (a.M + 1.2); return l => U.clamp(specP(l, s) + 0.32 * eN * g1(l) + 0.22 * eM * g2(l), 0, 1); };

  /* 兩頁共用：小地圖（on：要亮的節點）＋右欄「目的／原因／做法」 */
  const MAP = [['TEM＋設計值', ''], ['參數化形狀', '建模'], ['光譜', 'RCWA'], ['CD', '查表'], ['TEM', '⇄']];
  const minimap = on => `<div class="minimap">${MAP.map(([n, ar], i) => `${i ? `<span class="ar${on.includes(i) && on.includes(i - 1) ? ' on' : ''}">${ar === '⇄' ? '⇄' : `<small>${ar}</small>→`}</span>` : ''}<span class="nd${on.includes(i) ? ' on' : ''}">${n}</span>`).join('')}</div>`;
  const ppw = o => `<div class="col ppw">
    <div class="card pp" id="${o.id}-why"><h4>目的</h4><p>${o.goal}</p></div>
    <div class="card pp" id="${o.id}-cause"><h4>原因</h4><p>${o.cause}</p></div>
    <div class="card pp how"><h4>做法</h4><ol>${o.how.map((x, i) => `<li data-s="${i + 1}">${x}</li>`).join('')}</ol></div>
    ${o.extra || ''}
    <div class="analogy" style="margin-top:auto"><div class="ic">${U.icon(o.icon)}</div><div><h4>比喻</h4><p>${o.analogy}</p></div></div>
  </div>`;
  /* 導覽：第 i 步亮起做法的第 hi[i] 項（0＝不亮，'all'＝全亮），最後一步打開旋鈕 */
  function guide(el, ctx, id, steps, hi, onStep) {
    const ctl = U.$(el, '#' + id + '-ctl');
    return U.stepper(el, id + '-st', steps, i => {
      U.$$(el, '.how li').forEach(li => li.classList.toggle('on', hi[i] === 'all' || +li.dataset.s === hi[i]));
      U.$(el, '#' + id + '-cause').classList.toggle('on', hi[i] === 0);
      ctl.classList.toggle('live', i === steps.length - 1);
      onStep(i);
    }, ctx, { interval: 4200 });
  }

  /* ---------- OCD 補充①：正著算——依設計＋TEM 寫出參數化形狀、填 n、k，RCWA 算出光譜，存成對照表 ---------- */
  const NOM = { top: 14, bot: 26, h: 48, f: 8 };
  const VARS = [{ top: 12, bot: 22, h: 44, f: 8 }, NOM, { top: 16, bot: 30, h: 52, f: 8 }]; // 參數範圍內的三種形狀
  const VCOL = ['#3a6fe0', '#1f4fb5', '#7a3fd8'];
  const NK = [['si', '矽（鰭）', '3.9', '0.02'], ['nit', '硬遮罩（氮化矽）', '2.02', '0'], ['ox', '氧化矽（底下）', '1.46', '0']];
  const F_STEPS = [
    { t: '問題', d: '機台只量到一條「各種顏色的反射率」曲線。光譜不會直接告訴你形狀，那 14.1 nm 是怎麼來的？' },
    { t: '參數化形狀', d: '先從設計值出發（有時也用 TCAD 估一下）；再拿 TEM 切片看實際的圓角、斜邊、尺寸；最後把形狀寫成幾個參數：上寬、下寬、高、硬遮罩厚。' },
    { t: '填入光學常數 n、k', d: '每種材料對每個顏色的光，會折多少（n）、吸多少（k）。先用薄膜樣品量好，填進模型；n、k 錯了，整本答案本都會偏。' },
    { t: 'RCWA：形狀 → 光譜', d: 'RCWA 把形狀切成一層層薄片，假設左右無限重複（量測靶是週期性的），解光的波動方程，算出每個形狀「應該」反射出什麼光譜。' },
    { t: '存成對照表', d: '把參數範圍內的形狀都算一遍，存成「形狀 ↔ 光譜」對照表，也就是 OCD 的答案本。' },
    { t: '自己試試', d: '拖下面的形狀參數：形狀變了，光譜也跟著變。切換 RCWA 精度：切得太粗，光譜就算不準。' }
  ];
  Fig.add('ocdf', { body: true,
    eyebrow: EY, render: () => `<div class="s-body w66">
      <div class="col">${minimap([0, 1, 2])}
        ${U.figHTML('of-cv', '', '')}
        ${U.stepperHTML('of-st')}
        <div class="controls guided" id="of-ctl">${U.range('of-d', '上寬', 10, 18, 0.5, 14, '')}${U.range('of-t', '高', 36, 60, 1, 48, '')}${U.range('of-p', '側壁角', 78, 89, 0.5, 83, '')}${U.seg('of-a', ACC.map(a => `RCWA ${a.n}`), 1)}</div></div>
      ${ppw({ id: 'of', goal: '建出 OCD 的「答案本」：每種形狀會反射出什麼光譜。', cause: 'OCD 只量得到光譜，光譜不會直接告訴你形狀；沒有答案本，就查不出線寬。',
        how: ['設計值（TCAD 可輔助）→ <b>TEM</b> 看實際形狀 → 寫成幾個參數', '填入各材料的光學常數 <b>n、k</b>', '<b>RCWA</b> 算出每個形狀的光譜，存成對照表'], icon: 'bread',
        analogy: '先看食譜，再切一塊實物看清楚，把蛋糕寫成「多高、多寬、奶油多厚」，查好每種材料的音色（n、k），再預測敲起來的聲音（RCWA），記成一本表。' })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#of-cv'));
      let top = 14, ht = 48, ang = 83, acc = 1, s = NOM, step = 0, t0 = 0;
      // 側壁角換算成下寬：角度越大越直，下寬越接近上寬
      const upd = () => { s = { top, bot: top + 2 * ht / Math.tan(ang * Math.PI / 180), h: ht, f: 8 }; };
      U.bind(el, 'of-d', v => { top = v; upd(); }, v => v.toFixed(1) + ' nm');
      U.bind(el, 'of-t', v => { ht = v; upd(); }, v => v + ' nm');
      U.bind(el, 'of-p', v => { ang = v; upd(); }, v => v.toFixed(1) + '°（越大越直）');
      U.onSeg(el, 'of-a', i => { acc = i; });
      guide(el, ctx, 'of', F_STEPS, [0, 1, 2, 3, 3, 'all'], i => { step = i; t0 = 0; });
      const tem = new Image(); tem.src = CREDITS.gaatem.f;
      const box = (x, y, bw, bh, a, b) => { c.fillStyle = '#1f4fb5'; U.rrect(c, x, y, bw, bh, 8); c.fill(); U.txt(c, a, x + bw / 2, y + bh / 2 - 2, { align: 'center', size: 22, w: 700, color: '#fff' }); U.txt(c, b, x + bw / 2, y + bh / 2 + 22, { align: 'center', size: 13, color: '#e3ebfa' }); };
      const slices = (cx, base, S, sh, N, col) => { for (let j = 0; j < N; j++) { const yc = (j + 0.5) / N, wd = (sh.bot + (sh.top - sh.bot) * yc) * S, y0 = base - (j + 1) / N * sh.h * S; c.fillStyle = col || 'rgba(31,79,181,.55)'; c.fillRect(cx - wd / 2, y0, wd, sh.h * S / N); c.strokeStyle = '#fff'; c.lineWidth = 1; c.strokeRect(cx - wd / 2, y0, wd, sh.h * S / N); } };
      const dims = (cx, base, S, sh, col) => {
        const ty = base - sh.h * S - sh.f * S;
        dim(c, cx - sh.top * S / 2, ty - 12, cx + sh.top * S / 2, ty - 12, `上寬 ${sh.top.toFixed(1)}`, col, cx, ty - 20);
        dim(c, cx - sh.bot * S / 2, base + 30, cx + sh.bot * S / 2, base + 30, `下寬 ${sh.bot.toFixed(1)}`, col, cx, base + 54);
        dim(c, cx + sh.bot * S / 2 + 18, base, cx + sh.bot * S / 2 + 18, base - sh.h * S, `高 ${sh.h.toFixed(0)}`, col, cx + sh.bot * S / 2 + 24, base - sh.h * S / 2, 'left');
        dim(c, cx - sh.top * S / 2 - 16, base - sh.h * S, cx - sh.top * S / 2 - 16, ty, `硬遮罩厚 ${sh.f}`, col, cx - sh.top * S / 2 - 22, base - sh.h * S - sh.f * S / 2 + 4, 'right');
      };
      ctx.raf((dt, t) => {
        t0 = Math.min(1, t0 + dt * 0.8); const p = U.ease(t0);
        c.clearRect(0, 0, w, h);
        if (step === 0) {
          const gx = 60, gw = w * 0.55, gy = 40, gh = h - 110;
          axes(c, gx, gy, gw, gh);
          plot(c, gx, gy, gw, gh, l => specP(l, NOM) + 0.005 * Math.sin(l * 1.7), '#2b3440', 3.5);
          U.txt(c, '機台量到的：各種顏色的反射率', gx + 60, gy + 14, { size: 15, w: 600, color: '#2b3440' });
          const rx = gx + gw + 50, rw = w - rx - 20;
          U.arrow(c, gx + gw + 8, h / 2 - 20, rx - 8, h / 2 - 20, '#b3541e', 3);
          c.globalAlpha = p; U.txt(c, '?', rx + rw / 2, h / 2 - 10, { align: 'center', size: 96, w: 700, color: '#b3541e' });
          U.txt(c, '線寬 = 14.1 nm', rx + rw / 2, h / 2 + 50, { align: 'center', size: 24, w: 700, color: '#17202b' });
          U.txt(c, '怎麼知道的？', rx + rw / 2, h / 2 + 82, { align: 'center', size: 17, color: '#6a7888' }); c.globalAlpha = 1;
        } else if (step === 1) {
          // 左：TCAD 先估形狀 → TEM 切片對照 → 右：修正後寫成參數化的梯形
          const lw = w * 0.42, cw2 = (lw - 40) / 2, iy = 64, ih = h - iy - 70;
          U.txt(c, '先看設計值', 14 + cw2 / 2, 40, { align: 'center', size: 16, w: 700, color: '#1f4fb5' });
          c.fillStyle = '#f2f5f8'; c.fillRect(14, iy, cw2, ih);
          const tS = Math.min(cw2 / 40, ih / 80); c.fillStyle = U.MAT.ox; c.fillRect(14, iy + ih - 24, cw2, 24);
          c.fillStyle = U.MAT.si; c.fillRect(14 + cw2 / 2 - 7 * tS, iy + ih - 24 - 48 * tS, 14 * tS, 48 * tS); c.fillStyle = U.MAT.nit; c.fillRect(14 + cw2 / 2 - 7 * tS, iy + ih - 24 - 56 * tS, 14 * tS, 8 * tS);
          U.txt(c, '直角（TCAD 也類似）', 14 + cw2 / 2, iy + ih + 20, { align: 'center', size: 13, color: '#3e4b5b' });
          U.arrow(c, 14 + cw2 + 2, iy + ih / 2, 14 + cw2 + 22, iy + ih / 2, '#1f4fb5', 2.5);
          const tx = 14 + cw2 + 26, tw = Math.min(cw2, ih * 292 / 316);
          U.txt(c, '再拿 TEM 對照', tx + tw / 2, 40, { align: 'center', size: 16, w: 700, color: '#b3541e' });
          if (tem.complete && tem.naturalWidth) c.drawImage(tem, tx, iy, tw, tw * 316 / 292);
          U.txt(c, '實際：圓角、斜邊、尺寸不同', tx + tw / 2, iy + ih + 20, { align: 'center', size: 13, color: '#3e4b5b' }); U.txt(c, '（示意：借用奈米片的 TEM 照片）', tx + tw / 2, iy + ih + 38, { align: 'center', size: 13, color: '#6a7888' });
          U.arrow(c, lw + 4, h / 2 - 20, lw + 44, h / 2 - 20, '#1f4fb5', 3);
          const cx = lw + 60 + (w - lw - 60) / 2, base = h - 90, S = Math.min(6, (base - 70) / 70);
          c.fillStyle = U.MAT.ox; c.fillRect(lw + 80, base, w - lw - 100, 18);
          c.globalAlpha = p; fin(c, cx, base, S, NOM); dims(cx, base, S, NOM, '#b3541e'); c.globalAlpha = 1;
          U.txt(c, '最後寫成 4 個參數', cx, 28, { align: 'center', size: 17, w: 700, color: '#17202b' });
          U.txt(c, '參數範圍看 TEM 和製程經驗定；量產後 TEM 還會再拿來對答案（下一頁）', cx, h - 14, { align: 'center', size: 14, color: '#6a7888' });
        } else if (step === 2) {
          // n、k：每種材料一組，硬遮罩這一層後面會出事
          const lw = w * 0.4, base = h - 70, S = Math.min(5.5, (base - 60) / 70), cx = lw / 2;
          c.fillStyle = U.MAT.ox; c.fillRect(20, base, lw - 40, 22); fin(c, cx, base, S, NOM);
          U.tag(c, '矽', cx, base - NOM.h * S / 2, { align: 'center', size: 14 }); U.tag(c, '硬遮罩', cx + NOM.top * S / 2 + 8, base - NOM.h * S - 2, { size: 13 }); U.tag(c, '氧化矽', 30, base + 18, { size: 13 });
          const tx = lw + 30, tw = w - tx - 20, ry = 60, rh = 64;
          U.txt(c, '光學常數（示意，波長 633 nm 附近）', tx, 36, { size: 15, w: 700, color: '#17202b' });
          U.txt(c, 'n 折多少', tx + tw * 0.62, ry + 4, { align: 'center', size: 14, color: '#6a7888' }); U.txt(c, 'k 吸多少', tx + tw * 0.86, ry + 4, { align: 'center', size: 14, color: '#6a7888' });
          NK.forEach(([m, n, nv, kv], i) => {
            const y = ry + 16 + i * rh, f = U.clamp(p * 3 - i, 0, 1); c.globalAlpha = f;
            c.fillStyle = '#f2f5f8'; c.fillRect(tx, y, tw, rh - 10); c.fillStyle = U.MAT[m]; c.fillRect(tx + 10, y + 12, 30, rh - 34);
            U.txt(c, n, tx + 52, y + 34, { size: 17, w: 600, color: '#17202b' });
            U.txt(c, nv, tx + tw * 0.62, y + 36, { align: 'center', size: 22, w: 700, color: '#1f4fb5' }); U.txt(c, kv, tx + tw * 0.86, y + 36, { align: 'center', size: 22, w: 700, color: '#1f4fb5' });
            c.globalAlpha = 1;
          });
          U.txt(c, 'n、k 會隨波長改變，實際上要填整條曲線', tx, ry + 16 + 3 * rh + 14, { size: 14, color: '#3e4b5b' });
          U.txt(c, '材料配方一改，n、k 就變 → 下一頁會看到出事的例子', tx, ry + 16 + 3 * rh + 40, { size: 14, w: 600, color: '#b3541e' });
        } else if (step === 3) {
          const lw = w * 0.42, sp = lw / 3, base = h - 70, S = Math.min(3.6, (base - 60) / 70);
          c.fillStyle = U.MAT.ox; c.fillRect(10, base, lw - 10, 14);
          VARS.forEach((v, k) => { fin(c, 10 + sp * (k + .5), base, S, v, { a: .25 }); slices(10 + sp * (k + .5), base, S, v, 6, VCOL[k] + 'cc'); });
          U.txt(c, '切成一層層薄片（色塊），左右無限重複', lw / 2, 30, { align: 'center', size: 14, w: 600, color: '#17202b' });
          U.arrow(c, lw + 6, h / 2 - 20, lw + 40, h / 2 - 20, '#1f4fb5', 3);
          box(lw + 46, h / 2 - 75, 130, 110, 'RCWA', '解光的波動方程');
          U.arrow(c, lw + 182, h / 2 - 20, lw + 216, h / 2 - 20, '#1f4fb5', 3);
          const gx = lw + 230, gw = w - gx - 14, gy = 30, gh = h - 90;
          axes(c, gx, gy, gw, gh);
          VARS.forEach((v, k) => { if (p * 3 > k) plot(c, gx, gy, gw, gh, l => specP(l, v), VCOL[k], 2.6); });
          U.txt(c, '每個形狀一條光譜（顏色對應）', gx + 60, gy + 14, { size: 14, w: 600, color: '#17202b' });
        } else if (step === 4) {
          const cols = 6, rows = 3, cw = (w - 20) / cols, ch = (h - 90) / rows;
          for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
            const j = r * cols + q, f = U.clamp(p * 1.3 * cols * rows - j, 0, 1); if (f <= 0) continue;
            const tp = 11 + q, v = { top: tp, bot: tp + 9 + r * 2 + (q % 2) * 2, h: 42 + r * 5 + (q % 3) * 2, f: 8 }, x = 10 + q * cw, y = 10 + r * ch;
            c.globalAlpha = f; c.strokeStyle = '#d3dbe4'; c.strokeRect(x + 3, y + 3, cw - 6, ch - 6);
            fin(c, x + 30, y + ch - 14, 0.9, v, { noFilm: true });
            plot(c, x + 56, y + 12, cw - 66, ch - 28, l => specP(l, v), '#1f4fb5', 1.5); c.globalAlpha = 1;
          }
          U.txt(c, `對照表：已存 ${Math.round(p * 810000).toLocaleString()} 組「形狀 ↔ 光譜」`, w / 2, h - 46, { align: 'center', size: 21, w: 700, color: '#1f4fb5' });
          U.txt(c, '例如 4 個參數 × 每個取 30 個值 = 30⁴ ≈ 81 萬組，量產前先用電腦叢集算好（也可以量的時候即時算）', w / 2, h - 18, { align: 'center', size: 14.5, color: '#3e4b5b' });
        } else {
          const a = ACC[acc], lw = w * 0.4, base = h - 70, S = Math.min(7, (base - 50) / 76), cx = lw / 2;
          c.fillStyle = U.MAT.ox; c.fillRect(14, base, lw - 28, 22);
          fin(c, cx, base, S, NOM, { a: 0, stroke: '#9aa8b8', lw: 1.5, dash: [5, 4] });
          fin(c, cx, base, S, s, { a: .3 }); slices(cx, base, S, s, a.N);
          c.fillStyle = U.MAT.nit; c.fillRect(cx - s.top * S / 2, base - s.h * S - s.f * S, s.top * S, s.f * S);
          const col = '#b3541e', ty = base - s.h * S - s.f * S;
          dim(c, cx - s.top * S / 2, ty - 12, cx + s.top * S / 2, ty - 12, `上寬 ${s.top.toFixed(1)}`, col, cx, ty - 20);
          dim(c, cx - s.bot * S / 2, base + 36, cx + s.bot * S / 2, base + 36, `下寬 ${s.bot.toFixed(1)}`, col, cx, base + 60);
          dim(c, cx + s.bot * S / 2 + 18, base, cx + s.bot * S / 2 + 18, base - s.h * S, `高 ${s.h.toFixed(0)}`, col, cx + s.bot * S / 2 + 24, base - s.h * S / 2, 'left');
          U.txt(c, '灰虛線：設計的形狀', 14, 18, { size: 14, color: '#6a7888' });
          const gx = lw + 40, gw = w - gx - 14, gy = 30, gh = h - 90;
          axes(c, gx, gy, gw, gh);
          plot(c, gx, gy, gw, gh, rcwaSpec(NOM, a), '#9aa8b8', 2, [5, 4]);
          plot(c, gx, gy, gw, gh, rcwaSpec(s, a), '#1f4fb5', 3);
          const sec = 100 * a.N * Math.pow(2 * a.M + 1, 3) * 2e-9 + 0.0005;
          U.txt(c, `藍線：RCWA 算出的光譜（${a.n}：切 ${a.N} 層，算一條約 ${fmtT(sec)}）`, gx + 60, gy + 14, { size: 14, w: 600, color: '#1f4fb5' });
          U.txt(c, '灰虛線：設計形狀的光譜', gx + 60, gy + 34, { size: 14, w: 600, color: '#6a7888' });
        }
      });
    }
  });

  /* ---------- OCD 補充②：反著查——光譜 → CD，再用 TEM 對答案、修模型 ---------- */
  const TEMCD = [12.4, 13.1, 13.8, 14.2, 14.9, 15.5, 16.0, 16.8, 17.3, 18.1, 18.9, 19.6, 20.4, 21.2];
  const JIT = [0.2, -0.3, 0.1, 0.25, -0.15, 0.3, -0.2, 0.05, -0.3, 0.2, 0.1, -0.25, 0.15, -0.1];
  // 校正前：硬遮罩的折射率用了舊值 → OCD 系統性偏差（細的量太粗、粗的量太細）
  const ocdOf = (tem, j, k) => U.lerp(0.78 * tem + 4.2 + JIT[j], tem + JIT[j] * 0.8, k);
  const N_OLD = 2.02, N_NEW = 1.95;
  const B_STEPS = [
    { t: '查表報出 CD', d: '量到光譜，在答案本裡找最像的那一組，報出那一組的線寬。光譜完全吻合，看起來很完美。' },
    { t: '抽幾個點做 TEM 對照', d: '同一批位置切開做 TEM，量線寬當參考值。結果：細的量太粗、粗的量太細，OCD 有系統性偏差。' },
    { t: '找原因、修模型', d: '硬遮罩配方改了，折射率 n 跟著變，模型還用舊值。重新量 n、更新答案本，點就回到一致線上。' },
    { t: '參數相關：吻合也可能錯', d: '上寬寬一點、側壁直一點，光譜幾乎一模一樣：兩個參數互相代償，模型分不出來。解法是混合量測：CD-SEM 最擅長量上寬，先量好固定給 OCD，OCD 只解側壁和高度。' },
    { t: '自己試試', d: '切換校正前後，或換一個量測點，看 OCD 和 TEM 差多少。' }
  ];
  Fig.add('ocdb', { body: true,
    eyebrow: EY, render: () => `<div class="s-body w66">
      <div class="col">${minimap([2, 3, 4])}
        ${U.figHTML('ob-cv', '', '')}
        ${U.stepperHTML('ob-st')}
        <div class="controls guided" id="ob-ctl">${U.seg('ob-m', ['校正前的模型', '用 TEM 校正後'], 0)}<button class="btn" id="ob-n" type="button">換一個量測點</button></div></div>
      ${ppw({ id: 'ob', goal: '從量到的光譜得到線寬（CD），而且確定這個數字是對的。', cause: '答案來自模型。模型錯了，光譜照樣吻合，數字卻會偏掉，自己看不出來。',
        how: ['查表：找最像的光譜，報出 CD', '抽幾個點做 <b>TEM</b>，當參考值對照', '偏了就找原因、修模型；參數分不開，就用別的量測固定一個'], icon: 'ruler',
        extra: '<div class="card pp" id="ob-ap"><h4>準度 vs 精度</h4><p><b>精度</b>：同一點重複量，數字穩不穩。<b>準度</b>：數字和參考值一不一樣。OCD 精度很好，準度要靠 TEM 校正。量測機台也要天天量標準片、同型機台互相比對，誤差要遠小於規格範圍。</p></div>',
        analogy: '家裡的體脂計每天量（OCD），定期拿到醫院的標準儀器對照（TEM）；差太多就要調整。' })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#ob-cv'));
      let step = 0, k = 0, target = 0, t0 = 0, site = 0;
      U.onSeg(el, 'ob-m', i => { target = i; });
      U.$(el, '#ob-n').onclick = () => { site = (site + 5) % TEMCD.length; t0 = 0; };
      const seg = U.$(el, '#ob-m');
      let ct = 0; // 第 ④ 步自己的計時：先示範分不開，再示範混合量測
      guide(el, ctx, 'ob', B_STEPS, [1, 2, 3, 3, 'all'], i => {
        step = i; t0 = 0; site = 0; ct = 0;
        target = i >= 2 && i <= 3 ? 1 : i < 2 ? 0 : target;
        if (i < 4) U.$$(seg, 'button').forEach((b, j) => b.classList.toggle('on', j === target));
      });
      // ④ 參數相關：上寬變寬、下寬變窄（中間寬度不變），側壁跟著變直；示意模型裡光譜主要看中間寬度 → 兩者互相代償
      //    混合量測：CD-SEM 從上面看、最擅長量上寬，量好固定給 OCD，只剩一個解
      const angOf = tw => Math.atan2(48, (40 - 2 * tw) / 2) * 180 / Math.PI;   // 中間寬度固定 20 nm：下寬 = 40 − 上寬
      const corr = ct => {
        const hyb = ct > 4, m = hyb ? U.clamp(1 - (ct - 4) * 1.5, 0, 1) * (0.5 + 0.5 * Math.sin(ct * 2)) : 0.5 + 0.5 * Math.sin(ct * 2);
        const tw = 14 + 2.5 * m, an = angOf(tw);
        const lw = w * 0.3, S = Math.min(4.2, (h - 150) / 74), base = h - 82, cx = lw / 2;
        c.fillStyle = U.MAT.si; c.fillRect(20, base, lw - 40, 12);
        fin(c, cx, base, S, { top: tw, bot: 40 - tw, h: 48, f: 6 });
        U.tag(c, `上寬 ${tw.toFixed(1)}`, cx, base - 54 * S - 14, { align: 'center', size: 15, color: '#b3541e' });
        U.tag(c, `側壁角 ${an.toFixed(1)}°`, cx + (40 - tw) / 2 * S + 6, base - 20 * S, { size: 15, color: '#1f4fb5' });
        U.txt(c, '上寬寬一點、側壁直一點…', cx, 28, { align: 'center', size: 16, w: 700, color: '#17202b' });
        // 中：光譜——量到的（黑）和這個形狀算出來的（虛線）一直重疊
        const gx = lw + 20, gw = w * 0.32, gy = 50, gh = h - 150;
        axes(c, gx, gy, gw, gh);
        plot(c, gx, gy, gw, gh, l => specP(l, { top: 14, bot: 26, h: 48, f: 8 }), '#2b3440', 3.5);
        plot(c, gx, gy, gw, gh, l => specP(l, { top: 14, bot: 26, h: 48, f: 8 }) + 0.004 * m * Math.sin(l / 23), '#1f7a4d', 2.2, [6, 4]);
        U.txt(c, '…光譜還是一模一樣', gx + gw / 2, 28, { align: 'center', size: 16, w: 700, color: '#17202b' });
        U.txt(c, '模型分不出是哪一組 → 線寬也可能跟著報錯', gx + gw / 2, h - 36, { align: 'center', size: 15, w: 600, color: '#b3261e' });
        // 右：參數空間——一整條線都吻合；混合量測把氧化層固定，只剩一個點
        const px = gx + gw + 60, pw = w - px - 20, py = 50, ph = h - 150;
        const X = v => px + (v - 12) / 6 * pw, Y = v => py + ph - (v - 80) / 8 * ph;
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.strokeRect(px, py, pw, ph);
        U.txt(c, '上寬（nm）→', px + pw, py + ph + 22, { align: 'right', size: 14, color: '#3e4b5b' });
        U.txt(c, '↑ 側壁角（越上越直）', px + 8, py + 20, { size: 14, color: '#3e4b5b' });
        c.strokeStyle = 'rgba(31,122,77,.35)'; c.lineWidth = 12; c.beginPath();
        for (let v = 12; v <= 18.01; v += 0.25) { const yy = Y(angOf(v)); v === 12 ? c.moveTo(X(v), yy) : c.lineTo(X(v), yy); } c.stroke();
        U.txt(c, '這整條線都吻合', X(15.2), Y(angOf(15.2)) + 34, { size: 14, w: 600, color: '#1f7a4d' });
        if (hyb) {
          c.strokeStyle = '#b3541e'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(X(14), py); c.lineTo(X(14), py + ph); c.stroke(); c.setLineDash([]);
          U.tag(c, 'CD-SEM 先量上寬：14.0', X(14) + 8, py + ph - 14, { size: 14, color: '#b3541e' });
        }
        U.dot(c, X(tw), Y(an), 8, hyb && m < 0.02 ? '#b3541e' : '#1f4fb5');
        U.txt(c, hyb ? '混合量測：只剩一個解' : '光看光譜，答案不唯一', px + pw / 2, 28, { align: 'center', size: 16, w: 700, color: hyb ? '#b3541e' : '#17202b' });
        if (hyb) U.txt(c, `→ 側壁角 = ${angOf(14).toFixed(1)}°`, px + pw / 2, h - 36, { align: 'center', size: 16, w: 700, color: '#1f7a4d' });
      };
      const stats = kk => {
        const xs = TEMCD, ys = TEMCD.map((x, j) => ocdOf(x, j, kk)), n = xs.length;
        const mx = xs.reduce((a, b) => a + b) / n, my = ys.reduce((a, b) => a + b) / n;
        let sxy = 0, sxx = 0; for (let j = 0; j < n; j++) { sxy += (xs[j] - mx) * (ys[j] - my); sxx += (xs[j] - mx) ** 2; }
        const sl = sxy / sxx; return { sl, it: my - sl * mx, bias: ys.reduce((a, y, j) => a + Math.abs(y - xs[j]), 0) / n };
      };
      ctx.raf(dt => {
        t0 = Math.min(1, t0 + dt * 0.6); const tg = step === 2 && t0 < 0.6 ? 0 : target; // 第 ③ 步：先停在「錯的」狀態一下，再修正
        k += (tg - k) * Math.min(1, dt * (step === 2 ? 1.2 : 3));
        c.clearRect(0, 0, w, h);
        const lw = w * 0.42;
        const tem = TEMCD[site], ocd = ocdOf(tem, site, k);
        if (step === 3) { ct += dt; corr(ct); return; }
        if (step === 2) {
          // 左：找原因——硬遮罩的折射率
          const base = h - 140, S = Math.min(5, (base - 40) / 62), cx = lw / 2, s = { top: 14, bot: 26, h: 48, f: 14 };
          c.fillStyle = U.MAT.ox; c.fillRect(20, base, lw - 40, 20);
          fin(c, cx, base, S, s, { noFilm: true });
          const fy = base - s.h * S - s.f * S, pulse = 0.5 + 0.5 * Math.sin(performance.now() / 250);
          c.fillStyle = U.MAT.nit; c.fillRect(cx - s.top * S / 2, fy, s.top * S, s.f * S);
          c.strokeStyle = `rgba(179,38,30,${0.4 + 0.6 * pulse})`; c.lineWidth = 3; c.strokeRect(cx - s.top * S / 2 - 4, fy - 4, s.top * S + 8, s.f * S + 8);
          U.tag(c, '硬遮罩：配方改了', cx + s.top * S / 2 + 12, fy + 14, { size: 14, color: '#b3261e' });
          const nv = U.lerp(N_OLD, N_NEW, k);
          const bY = h - 112; c.fillStyle = '#f2f5f8'; U.rrect(c, 20, bY, lw - 40, 100, 6); c.fill();
          U.txt(c, `模型用的折射率：${nv.toFixed(2)}`, 36, bY + 32, { size: 18, w: 700, color: k > 0.9 ? '#1f7a4d' : '#b3261e' });
          U.txt(c, `實際量到的折射率：${N_NEW.toFixed(2)}`, 36, bY + 62, { size: 16, color: '#3e4b5b' });
          U.txt(c, k > 0.9 ? '→ 更新答案本，重新查表' : '→ 用舊值算的答案本，整本都偏了', 36, bY + 86, { size: 13.5, color: k > 0.9 ? '#1f7a4d' : '#b3261e' });
        } else {
          // 左：光譜比對 → CD
          const gx = 14, gy = 20, gw = lw - 24, gh = h * 0.5;
          axes(c, gx, gy, gw, gh, false);
          const truth = { top: tem, bot: tem + 12, h: 48, f: 8 };
          plot(c, gx, gy, gw, gh, l => specP(l, truth) + 0.005 * Math.sin(l * 1.7), '#2b3440', 3);
          // 查表：答案本是用模型（含當時的 n）算的。找到的那一組「上寬 = OCD 報的數字」，
          // 它在模型裡算出的光譜和量到的一樣，所以吻合；模型的 n 錯了，這個數字就和真實（TEM）不同
          const lock = t0 > 0.6, cand = { top: 11 + ((t0 * 37) | 0) % 10, bot: 24, h: 48, f: 8 };
          plot(c, gx, gy, gw, gh, lock ? (l => specP(l, truth)) : (l => specP(l, cand)), lock ? '#1f7a4d' : '#1f4fb5', 2.2, [6, 4]);
          U.txt(c, lock ? `光譜吻合 ✓ 答案本裡的那一組：上寬 ${ocd.toFixed(1)} nm` : '黑：量到的光譜　虛線：答案本裡的候選', gx + 6, gy + 14, { size: 14, w: 600, color: lock ? '#1f7a4d' : '#3e4b5b' });
          const by = gy + gh + 30;
          U.arrow(c, lw / 2, gy + gh + 6, lw / 2, by - 4, '#1f4fb5', 2);
          c.fillStyle = lock ? '#e2f1e8' : '#f2f5f8'; U.rrect(c, gx, by, gw, h - by - 10, 6); c.fill();
          U.txt(c, lock ? 'OCD 報出的線寬' : '查表中…', gx + gw / 2, by + 26, { align: 'center', size: 15, w: 600, color: lock ? '#1f7a4d' : '#6a7888' });
          if (lock) {
            U.txt(c, ocd.toFixed(1) + ' nm', gx + gw / 2, by + 62, { align: 'center', size: 30, w: 700, color: '#17202b' });
            if (step >= 1) U.txt(c, `同一點切開做 TEM：${tem.toFixed(1)} nm（差 ${(ocd - tem >= 0 ? '+' : '') + (ocd - tem).toFixed(1)}）`, gx + gw / 2, by + 90, { align: 'center', size: 13.5, w: 600, color: Math.abs(ocd - tem) > 0.8 ? '#b3261e' : '#1f7a4d' });
          }
        }
        // 右：OCD vs TEM 散佈圖（第 ① 步還沒做 TEM，先蓋起來）
        const px = lw + 56, pw = w - px - 16, py = 16, ph = h - 64, lo = 11, hi = 23;
        const X = v => px + (v - lo) / (hi - lo) * pw, Y = v => py + ph - (v - lo) / (hi - lo) * ph;
        c.strokeStyle = '#9aa8b8'; c.lineWidth = 1; c.strokeRect(px, py, pw, ph);
        if (step === 0) {
          c.fillStyle = '#f2f5f8'; c.fillRect(px + 1, py + 1, pw - 2, ph - 2);
          U.txt(c, '數字看起來很合理……', px + pw / 2, py + ph / 2 - 12, { align: 'center', size: 20, w: 700, color: '#3e4b5b' });
          U.txt(c, '但它準嗎？下一步拿 TEM 參考值來對答案', px + pw / 2, py + ph / 2 + 20, { align: 'center', size: 16, color: '#6a7888' });
          return;
        }
        for (let v = 12; v <= 22; v += 2) { U.txt(c, v + '', X(v), py + ph + 16, { align: 'center', size: 13, color: '#6a7888' }); U.txt(c, v + '', px - 6, Y(v) + 4, { align: 'right', size: 12, color: '#6a7888' }); }
        U.txt(c, 'TEM 量到的線寬（nm），當參考值 →', px + pw, py + ph + 36, { align: 'right', size: 14, color: '#3e4b5b' });
        c.save(); c.translate(px - 34, py + ph / 2); c.rotate(-Math.PI / 2); U.txt(c, 'OCD 報出的線寬（nm）→', 0, 0, { align: 'center', size: 13, color: '#3e4b5b' }); c.restore();
        c.strokeStyle = '#1f7a4d'; c.setLineDash([6, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(lo), Y(lo)); c.lineTo(X(hi), Y(hi)); c.stroke(); c.setLineDash([]);
        U.tag(c, '完全一致的線', X(21.6), Y(22.3), { size: 12, color: '#1f7a4d', align: 'right' });
        const st = stats(k), n = step === 1 ? Math.ceil(U.clamp(t0 * 1.6, 0, 1) * TEMCD.length) : TEMCD.length;
        if (n === TEMCD.length) { c.strokeStyle = '#b3541e'; c.lineWidth = 2; c.beginPath(); c.moveTo(X(lo), Y(st.sl * lo + st.it)); c.lineTo(X(hi), Y(st.sl * hi + st.it)); c.stroke(); }
        TEMCD.slice(0, n).forEach((x, j) => U.dot(c, X(x), Y(ocdOf(x, j, k)), j === site ? 7 : 5, j === site ? '#b3541e' : '#1f4fb5'));
        if (k < 0.5) { U.tag(c, '細的量太粗、粗的量太細', px + 48, py + ph - 40, { size: 14, color: '#b3261e' }); U.tag(c, '點都貼著同一條線：趨勢一致，但整條偏了（準度差）', px + 8, py + ph - 12, { size: 14, color: '#b3261e' }); }
        U.txt(c, `平均差 ${st.bias.toFixed(2)} nm　斜率 ${st.sl.toFixed(2)}`, px + 10, py + 22, { size: 15, w: 700, color: st.bias < 0.4 ? '#1f7a4d' : '#b3261e' });
      });
    }
  });
})();
