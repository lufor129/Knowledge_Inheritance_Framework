/* 第二部分 ⑥ 化學機械平坦化：磨平 */
(function () {
  const A = Deck.add.bind(Deck);
  const F = { chap: 6, eyebrow: '第二部分 · ⑥ 化學機械平坦化' };

  /* 1. CMP 機台與磨平 */
  A(Object.assign({
    id: 'cmp1', part: 2, minutes: 2.0, short: 'CMP：把每一層磨平',
    title: 'CMP：把每一層都磨到平', en: 'Chemical Mechanical Planarization',
    thesis: '蓋完一層，表面會高低不平。不磨平，下一層曝光就對不準焦。拖動壓力看：<b>太輕磨得慢，太重會凹陷、刮傷</b>。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('c1-cv', '左：研磨機（上視）　右：晶圓表面（剖面）', '')}
        <div class="controls">${U.range('c1-p', '研磨壓力', 1, 10, 1, 5, '')}</div></div>
      ${U.side({
        meters: [['c1-a', '平坦程度'], ['c1-b', '刮傷風險']],
        points: ['<b>化學</b>：研磨液把表面軟化', '<b>機械</b>：研磨墊把軟化的部分磨掉', '磨完後，晶片局部高低差只有幾奈米', '👁 磨前量、磨後量，自動調下一片（APC，第九章）'],
        fact: { v: '幾奈米', d: '磨完後晶片局部的高低差；不夠平，下一層曝光就對不準焦' },
        analogy: { icon: 'sand', t: '比喻', p: '用牙膏刷牙：牙膏（化學）先軟化污垢，牙刷（機械）再刷掉。太用力會刷傷牙齒。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#c1-cv'));
      let P = 5, g = 0;
      U.bind(el, 'c1-p', v => { P = v; g = 0; }, v => v < 4 ? '輕' : v > 7 ? '重' : '適中');
      ctx.raf((dt, t) => {
        g = U.reduced() ? 1 : Math.min(1, g + dt * 0.25); // 磨一次就停在結果；調壓力會重磨
        const reach = P < 4 ? 0.25 + 0.12 * P : 1; // 壓力太輕：磨得慢，同樣的時間還留著起伏
        c.clearRect(0, 0, w, h);
        // 上視研磨機
        const cx = w * 0.26, cy = h * 0.5, R = Math.min(w * 0.22, h * 0.4);
        c.save(); c.translate(cx, cy); c.rotate(t * 0.8);
        c.fillStyle = '#c9d2dc'; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill();
        c.strokeStyle = '#b4bfcc'; for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(0, 0, R * k / 6, 0, 7); c.stroke(); }
        c.restore();
        U.tag(c, '研磨墊（旋轉）', cx, cy + R + 22, { align: 'center', size: 14 });
        const wx = cx + R * 0.45, wy = cy - R * 0.1;
        c.save(); c.translate(wx, wy); c.rotate(t * 1.6);
        c.fillStyle = '#7f97b0'; c.beginPath(); c.arc(0, 0, R * 0.36, 0, 7); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.lineTo(R * 0.36, 0); c.stroke();
        c.restore();
        U.tag(c, '晶圓（同方向旋轉、往下壓）', wx, wy - R * 0.45, { align: 'center', size: 14 });
        for (let k = 0; k < 10; k++) { const y = cy - R - 30 + ((t * 80 + k * 14) % 40); U.dot(c, cx - R * 0.3, y, 3.5, 'rgba(240,210,120,.9)'); }
        U.tag(c, '研磨液', cx - R * 0.3, cy - R - 38, { align: 'center', size: 14 });
        // 剖面
        const x0 = w * 0.54, x1 = w - 30, base = h * 0.62;
        const bumps = [0.1, 0.28, 0.46, 0.64, 0.82];
        const minH = 30;
        const flat = U.clamp(g * 1.2, 0, 1) * reach;
        U.box(c, 'si', x0, base, x1 - x0, h - base - 30);
        c.fillStyle = U.MAT.ox; c.beginPath(); c.moveTo(x0, base);
        for (let x = x0; x <= x1; x += 2) {
          const f = (x - x0) / (x1 - x0);
          let y = base - minH - bumps.reduce((a, b) => a + 34 * Math.exp(-((f - b) ** 2) / 0.003), 0) * (1 - flat);
          // 壓力太大：中間凹陷（碟形）＋兩道刮痕
          if (P > 7) y += (P - 7) * 5 * flat * Math.exp(-((f - 0.55) ** 2) / 0.004) + ((Math.abs(f - 0.28) < 0.008 || Math.abs(f - 0.8) < 0.008) ? (P - 7) * 4 * flat : 0);
          c.lineTo(x, y);
        }
        c.lineTo(x1, base); c.closePath(); c.fill();
        const padY = base - minH - 34 * (1 - flat) + 2; // 研磨墊貼著最高點
        c.fillStyle = '#9aa8b8'; c.fillRect(x0, padY - 16, x1 - x0, 14);
        U.tag(c, '研磨墊', x0 + 8, padY - 22, { size: 14 });
        for (let k = 0; k < P; k++) U.arrow(c, x0 + (k + .5) * (x1 - x0) / P, padY - 70, x0 + (k + .5) * (x1 - x0) / P, padY - 22, '#b3541e', 2);
        const done = g >= 1 / 1.2;
        if (P > 7 && done) { const sy = base - minH; U.tag(c, '凹陷', x0 + 0.55 * (x1 - x0), sy - 18, { align: 'center', size: 13, color: '#b3261e' }); U.tag(c, '刮痕', x0 + 0.28 * (x1 - x0), sy - 18, { align: 'center', size: 13, color: '#b3261e' }); }
        U.tag(c, !done ? '磨平中…' : reach < 1 ? '壓力太輕：磨得慢，同樣時間還沒磨平' : P > 7 ? '平了，但容易刮傷、凹陷' : '磨平了 ✓', (x0 + x1) / 2, h - 10, { align: 'center', size: 17, color: done && reach === 1 && P <= 7 ? '#1f7a4d' : '#a8660a' });
        U.setMeter(el, 'c1-a', flat, flat > .95 ? '平' : done ? '不夠平' : '進行中', flat > .95 ? 'good' : 'warn');
        U.setMeter(el, 'c1-b', P / 10, P > 7 ? '高' : P > 4 ? '中' : '低', P > 7 ? 'bad' : P > 4 ? 'warn' : 'good');
      });
    },
    notes: `第六章：平坦化。每蓋完一層，表面都會高低不平。如果不磨平，下一層曝光時，高的地方和低的地方沒辦法同時對準焦，圖案就會糊掉。

CMP 化學機械平坦化，就是把表面磨平的技術。左邊是研磨機的上視圖：底下是一個大的旋轉研磨墊，晶圓倒過來壓在上面，和研磨墊朝同一個方向旋轉，轉速差不多，這樣晶圓上每一點被磨的速度才一樣；同時滴入研磨液。研磨液裡有化學藥劑把表面軟化，還有極細的顆粒；研磨墊再把軟化的部分磨掉。化學加機械，所以叫 CMP。

右邊看剖面，拖動壓力滑桿，每次調整都會重新磨一次：壓力太輕，磨得很慢，同樣的時間還留著起伏，要磨更久，產能就差；壓力適中，磨得又平又乾淨；壓力太重，雖然很快就平了，表面卻容易刮傷、凹陷，整片也不均勻。磨完之後，晶片局部的高低差只有幾奈米。就像用牙膏刷牙，牙膏軟化、牙刷刷掉，但太用力會刷傷牙齒。

那要磨多久？首先，研磨機會邊磨邊偵測，用光或電流感測厚度，磨到了自動停，叫終點偵測。在這之上，CMP 也是量測回饋最經典的例子：磨之前先量這片有多厚，算好要磨幾秒，叫前饋；磨完再量一次，把誤差回饋給下一片，叫回饋。這套系統叫先進製程控制 APC，第九章會再看到這個迴圈。`
  }, F));

  /* 2. 銅鑲嵌與碟形凹陷 */
  function dam(c, w, h, i, p) {
    const base = h * 0.72, top = h * 0.36, L = 30, R = w - 30;
    const tr = [[0.12, 0.26], [0.36, 0.44], [0.54, 0.6], [0.7, 0.9]].map(([a, b]) => [L + a * (R - L), L + b * (R - L)]);
    U.box(c, 'si', L, base, R - L, h - base - 30);
    const d = i === 0 ? p : 1;
    U.box(c, 'ox', L, top, R - L, base - top);
    tr.forEach(([a, b]) => { c.fillStyle = '#fbfcfd'; c.fillRect(a, top, b - a, (base - top - 20) * d); });
    if (i >= 1) { const a = i === 1 ? p : 1; c.globalAlpha = a; c.fillStyle = U.MAT.tin; if (i <= 2 || (i === 3 && p < .85)) c.fillRect(L, top - 5, R - L, 5); /* 溝槽外的阻障層也要磨掉，否則導線全連在一起 */ tr.forEach(([x0, x1]) => { c.fillRect(x0, top, 5, base - top - 20); c.fillRect(x1 - 5, top, 5, base - top - 20); c.fillRect(x0, base - 25, x1 - x0, 5); }); c.globalAlpha = 1; }
    if (i >= 2) {
      const over = i === 2 ? 40 * p : i === 3 ? 40 * (1 - p) : 0;
      const fillA = i === 2 ? p : 1;
      tr.forEach(([x0, x1]) => { c.fillStyle = U.MAT.cu; c.globalAlpha = fillA; c.fillRect(x0 + 5, top, x1 - x0 - 10, base - top - 25); c.globalAlpha = 1; });
      if (over > 0) { c.fillStyle = U.MAT.cu; c.fillRect(L, top - 5 - over, R - L, over); }
      if (i === 3 && p < 1) { c.fillStyle = '#9aa8b8'; c.fillRect(L, top - 5 - over - 16, R - L, 14); }
      if (i === 4) {
        tr.forEach(([x0, x1]) => {
          const wide = (x1 - x0) > (R - L) * 0.15;
          const dip = (wide ? 22 : 6) * p;
          c.fillStyle = '#fbfcfd'; c.beginPath(); c.moveTo(x0 + 5, top); c.quadraticCurveTo((x0 + x1) / 2, top + dip * 2, x1 - 5, top); c.fill();
          if (wide && p > .5) U.tag(c, '寬的銅線被磨凹了', (x0 + x1) / 2, top + dip + 34, { align: 'center', size: 14, color: '#b3261e' });
        });
        c.fillStyle = '#9aa8b8'; c.fillRect(L, top - 20, R - L, 14);
      }
    }
    const txt = ['在絕緣層上挖出導線的溝槽', '鋪阻障層（防銅亂跑）＋一層薄銅晶種（電鍍的種子）', '電鍍銅：把溝槽灌滿，還會溢出來', '用 CMP 磨掉多餘的銅和表面的阻障層，只留溝裡的', '磨過頭：寬的銅線會被磨凹（碟形凹陷）'][i];
    U.txt(c, txt, w / 2, 40, { align: 'center', size: 19, w: 700, color: i === 4 ? '#b3261e' : '#17202b' });
  }
  A(Object.assign({
    id: 'cmp2', part: 2, minutes: 1.6, short: '銅導線：先挖再灌再磨',
    title: '銅導線的做法：先挖溝、再灌銅、最後磨平', en: 'Copper Damascene',
    thesis: '銅很難直接蝕刻，所以反過來：<b>先挖好溝，再把銅灌滿、磨掉多餘的</b>。磨過頭，寬的銅線就會凹下去。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('c2-cv', '導線層剖面', '')}${U.stepperHTML('c2-st')}</div>
      ${U.side({
        points: ['這種「先挖再灌」的做法叫鑲嵌', '晶片上有十幾層這樣的銅導線', '磨的時間與力道要非常精準'],
        extra: U.legendHTML(['ox', 'tin', 'cu']),
        analogy: { icon: 'bread', t: '比喻', p: '在蛋糕上挖溝、灌滿巧克力醬，再用刮刀刮平，只留溝裡的巧克力。' }
      })}</div>`,
    init(el, ctx) {
      const steps = ['挖溝', '阻障層＋晶種', '電鍍銅', 'CMP 磨平', '磨過頭會凹'].map((t, i) => ({ t, d: '', draw: (c, w, h, p) => dam(c, w, h, i, p) }));
      U.animSteps(el, ctx, { canvas: 'c2-cv', stepper: 'c2-st', steps });
    },
    notes: `CMP 最重要的應用之一是做銅導線。銅很難用蝕刻的方式雕出形狀，因為銅和蝕刻氣體反應後的產物不會變成氣體，抽不走，所以工程師反過來做。

第一步，在絕緣層上先挖好導線的溝槽。第二步，鋪一層很薄的阻障層，防止銅原子跑到旁邊去，再鋪一層很薄的銅當晶種，電鍍要有導電的種子才長得上去。第三步，用電鍍把銅灌滿溝槽，銅會溢出來蓋住整個表面。第四步，用 CMP 把多餘的銅磨掉，連溝槽外面那層阻障層也要磨掉，只留下溝裡面的銅；否則阻障層會導電，所有導線就連在一起短路了。這種做法叫鑲嵌，就像在蛋糕上挖溝、灌滿巧克力醬，再用刮刀刮平。

最後一步看一個常見的問題：研磨液對銅磨得比較快，研磨墊又會往寬的溝裡彎下去，如果磨過頭，寬的銅線中間會被磨凹下去，像一個碟子，所以叫碟形凹陷。一顆晶片上有十幾層銅導線，每一層都要精準控制。凹了多深，要用輪廓儀或原子力顯微鏡量；銅有沒有殘留、短路，則靠缺陷檢測去找。`
  }, F));

  /* 3. 多材料同時研磨 */
  const SL = [
    { n: '只對銅快', r: { cu: 1, ox: 0.15, nit: 0.1 } },
    { n: '只對絕緣層快', r: { cu: 0.2, ox: 1, nit: 0.5 } },
    { n: '調配平衡', r: { cu: 0.55, ox: 0.5, nit: 0.45 } }
  ];
  A(Object.assign({
    id: 'cmp3', part: 2, minutes: 1.4, short: '同時磨好幾種材料',
    title: '先進製程的難題：好幾種材料要一起磨，而且要一樣平', en: 'Multi-Material CMP',
    thesis: '銅、絕緣層、氮化矽和研磨液的化學反應都不同。換一種研磨液試試：<b>磨得太快的材料會凹、太慢的會凸</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('c3-m', SL.map(s => s.n), 0)}</div>${U.figHTML('c3-cv', '磨完後的表面（剖面放大）', '')}</div>
      ${U.side({
        meters: [['c3-a', '整體平坦']],
        points: ['每種材料被磨掉的速度都不同（主要看研磨液的化學，不是硬度）', '有時反而要它「碰到停止層就停」', '還要控制刮痕、殘留顆粒等缺陷'],
        fact: { v: '數十次', d: '一顆先進晶片從頭到尾要做的 CMP 次數' },
        analogy: { icon: 'sand', t: '比喻', p: '同時打磨一塊嵌著金屬和石頭的木板：砂紙要選對，才不會木頭凹下去、金屬凸出來。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#c3-cv'));
      let m = 0, g = 0;
      U.onSeg(el, 'c3-m', i => { m = i; g = 0; });
      const seq = ['ox', 'cu', 'ox', 'nit', 'ox', 'cu', 'cu', 'ox', 'nit', 'ox'];
      ctx.raf(() => {
        g = Math.min(1, g + 0.012);
        c.clearRect(0, 0, w, h);
        const base = h * 0.7, L = 30, R = w - 30, bw = (R - L) / seq.length;
        U.box(c, 'si', L, base, R - L, h - base - 40);
        let worst = 0;
        seq.forEach((k, i) => {
          const r = SL[m].r[k];
          const dh = (r - 0.5) * 60 * g;
          worst = Math.max(worst, Math.abs(dh));
          U.box(c, k, L + i * bw, base - 120 + dh, bw, 120 - dh);
        });
        c.setLineDash([6, 4]); c.strokeStyle = '#1f4fb5'; c.beginPath(); c.moveTo(L, base - 120); c.lineTo(R, base - 120); c.stroke(); c.setLineDash([]);
        U.tag(c, '藍色虛線：理想的平面', L + 6, base - 130, { size: 14, color: '#1f4fb5' });
        U.tag(c, '橘：銅　黃：絕緣層　綠：氮化矽', L + 6, h - 12, { size: 14 });
        const f = 1 - worst / 30;
        U.setMeter(el, 'c3-a', U.clamp(f, 0.05, 1), f > .8 ? '平' : '高低不平', f > .8 ? 'good' : 'bad');
      });
    },
    notes: `到了先進製程，CMP 的難度又升級了：常常要同時磨好幾種材料，例如銅、絕緣層、氮化矽，而且磨完要一樣平。

問題是每種材料被磨掉的速度都不一樣。選「只對銅快」的研磨液，銅被磨得比較多，就凹下去。選「只對絕緣層快」的，反過來銅就凸出來。只有調配平衡的研磨液，才能讓所有材料一起磨到藍色虛線這個理想平面。快慢主要看研磨液和每種材料的化學反應，不是看硬度。

不過不是每一步都要平衡。有些步驟反而故意讓研磨液只磨上面那層，碰到底下的「停止層」就幾乎磨不動，自動停下來，例如銅磨到阻障層就停。

研磨液的配方是各家公司的機密。一顆先進晶片從頭到尾要做數十次 CMP，每次都要做到接近完美，還要控制刮痕和殘留顆粒這些缺陷。CMP 刮出來的刮痕，在整片晶圓的缺陷地圖上常常排成一條弧線，第九章檢測那一頁會請大家猜猜看。`
  }, F));
})();
