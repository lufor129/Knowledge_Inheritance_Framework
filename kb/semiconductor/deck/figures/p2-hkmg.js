/* 第二部分 ⑤ 閘極與高介電材料 */
(function () {
  const F = { chap: 5, eyebrow: '第二部分 · ⑤ 閘極' };

  /* 共用：畫「閘極 — 絕緣牆 — 通道」與穿牆電子 */
  function wall(c, x, y, wh, thick, col, label, leakRate, t, seeds, pull) {
    c.fillStyle = U.MAT.metal; c.fillRect(x - 120, y, 110, wh);
    U.tag(c, '閘極', x - 65, y + 22, { align: 'center', size: 15 });
    c.fillStyle = col; c.fillRect(x - 10, y, thick, wh);
    c.fillStyle = U.MAT.si; c.fillRect(x - 10 + thick, y, 130, wh);
    U.tag(c, '通道', x + thick + 55, y + 22, { align: 'center', size: 15 });
    U.tag(c, label, x - 10 + thick / 2, y + wh + 22, { align: 'center', size: 14 });
    // 閘極的電場：控制力越強，箭頭越深、伸進通道越遠
    for (let k = 0; k < 4; k++) U.arrow(c, x - 40, y + 30 + k * (wh - 50) / 3, x + thick + 8 + pull * 80, y + 30 + k * (wh - 50) / 3, `rgba(179,84,30,${0.2 + 0.6 * pull})`, 1 + pull * 3);
    // 通道裡被閘極吸到牆邊的電子（通道打開）：控制力越強越多
    const nCh = Math.round(pull * pull * 14);
    for (let k = 0; k < nCh; k++) { const yy = y + 14 + ((k * 0.618) % 1) * (wh - 28), xx = x + thick + 4 + ((k * 0.37) % 1) * 14 + Math.sin(t * 3 + k) * 1.5; U.electron(c, xx, yy, 3.5); }
    if (pull > 0.85) U.tag(c, '通道打開', x + thick + 70, y + 50, { align: 'center', size: 13, color: '#1f4fb5' });
    // 穿牆電子（漏電）：閘極加正電，通道牆邊的電子直接穿過牆、跑進閘極（從右往左）；進了閘極就淡出，免得看起來像從閘極冒出來
    let n = 0;
    const x1 = x - 10 + thick + 10, x2 = x - 10 - 36;
    seeds.forEach(s => {
      const ph = (t * 0.5 + s.p) % 1;
      if (s.q > leakRate) return;
      n++;
      c.globalAlpha = ph < 0.7 ? 1 : (1 - ph) / 0.3;
      U.electron(c, U.lerp(x1, x2, ph), y + s.y * wh, 3.5, true);
      c.globalAlpha = 1;
    });
    if (n) { U.arrow(c, x + thick + 40, y - 16, x - 70, y - 16, '#b3261e', 2.5); U.tag(c, '漏電：通道的電子穿牆跑進閘極', x - 76, y - 12, { align: 'right', size: 14, color: '#b3261e' }); }
    return n;
  }

  /* canvas 文字自動換行（逐字切，中文適用） */
  function wrap(c, s, x, y, maxW, lh, o) {
    c.save(); c.font = `${o.w || 500} ${o.size || 15}px "PingFang TC","Noto Sans TC",sans-serif`;
    let line = '', yy = y; const out = [];
    for (const ch of s) { if (c.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch; }
    out.push(line); c.restore();
    out.forEach((l, i) => U.txt(c, l, x, yy + i * lh, o));
    return out.length;
  }

  /* 閘極絕緣層（原 37、38 頁合併）：電場要過得去，電子不要過去 */
  const HKM = [
    { n: '二氧化矽', col: U.MAT.ox, k: 1 },
    { n: '二氧化鉿（高介電）', col: U.MAT.hk, k: 5, il: 0.5 }
  ];
  Fig.add('hk1', Object.assign({ body: true,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('h1-k', HKM.map(x => x.n), 0)}</div>${U.figHTML('h1-cv', '閘極與通道之間（剖面放大）：橘色箭頭是電場；通道牆邊的藍點＝被閘極吸過來的電子', '')}
        <div class="controls">${U.range('h1-t', '絕緣牆厚度', 0.6, 4, 0.1, 2.5, ' nm')}</div></div>
      ${U.pageSide({
        meters: [['h1-c', '電場過得去（閘極控制力）'], ['h1-m', '電子穿過去（漏電）']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#h1-cv'));
      let th = 2.5, km = 0;
      U.bind(el, 'h1-t', v => th = v, v => v.toFixed(1) + ' nm（約 ' + Math.round(v / 0.25) + ' 層原子）');
      U.onSeg(el, 'h1-k', i => km = i);
      const seeds = Array.from({ length: 30 }, () => ({ y: Math.random() * .9 + .05, p: Math.random(), q: Math.random() }));
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        // 二氧化鉿底下還墊著約 0.5 nm 的二氧化矽介面層：實際厚度 = 介面層＋二氧化鉿，等效厚度 = 介面層＋二氧化鉿 / k
        const M = HKM[km], il = M.il || 0, phys = il + th, eot = il + th / M.k;
        const ctrl = U.clamp(0.9 / eot, 0, 1);               // 示意：等效厚度約 1 nm 以下控制力才夠（今天的需求）
        const leak = U.clamp(Math.pow(10, -(phys - 1.3) * 5), 0, 1); // 漏電看「實際」厚度：每薄 0.2 nm 約多 10 倍
        const X0 = w * 0.42, Y0 = 60, WH = h - 170;
        wall(c, X0, Y0, WH, phys * 22, M.col, M.n + (km ? `（含介面層，等效二氧化矽 ${eot.toFixed(2)} nm）` : ''), leak, t, seeds, ctrl);
        if (il) { c.fillStyle = U.MAT.ox; c.fillRect(X0 - 10 + th * 22, Y0, il * 22, WH); U.tag(c, '介面層', X0 - 10 + phys * 22 + 6, Y0 + WH - 12, { size: 13 }); }
        U.pLegend(c, w - 212, 6, ['e', 'bad']);
        const ok = ctrl > .85 && leak < .05;
        const msg = ok ? '電場過得去、電子過不去 ✓' : ctrl <= .85 && leak >= .05 ? '電場不夠強，電子卻已經在漏' : ctrl <= .85 ? `太厚了：等效 ${eot.toFixed(2)} nm，電場不夠強，閘極控制不住通道` : '電場夠了，但大量電子穿牆：漏電太嚴重！';
        U.txt(c, msg, w / 2, h - 30, { align: 'center', size: 19, w: 700, color: ok ? '#1f7a4d' : leak >= .3 ? '#b3261e' : '#a8660a' });
        // 電子跑進閘極的後果（右側卡片）＋整顆晶片的待機漏電（示意，對數刻度）
        const bx = X0 + 270, bw = w - bx - 16, by = 56, bad = leak >= .05;
        c.fillStyle = bad ? 'rgba(179,38,30,.06)' : 'rgba(31,122,77,.07)'; c.strokeStyle = bad ? 'rgba(179,38,30,.4)' : 'rgba(31,122,77,.4)'; c.lineWidth = 1.5;
        c.fillRect(bx, by, bw, 316); c.strokeRect(bx, by, bw, 316);
        U.txt(c, bad ? '電子跑進閘極，會怎樣？' : '漏電很低 ✓', bx + 14, by + 28, { size: 17, w: 700, color: bad ? '#b3261e' : '#1f7a4d' });
        const lines = bad ? [['① 關著也在耗電', '每顆漏一點，上百億顆加起來，手機放著也掉電'], ['② 發熱', '漏掉的電變成熱，晶片更燙、只好降速'], ['③ 絕緣牆被打壞', '電子長期衝過去留下缺陷，最後擊穿，壽命變短']]
          : [['待機省電', '電晶體關著時，閘極幾乎沒有電流'], ['不發熱', '電都用在開關，不是漏掉'], ['耐用', '絕緣牆不會被電子慢慢打壞']];
        lines.forEach(([a, b], k) => { U.txt(c, a, bx + 14, by + 62 + k * 72, { size: 16, w: 700, color: '#17202b' }); wrap(c, b, bx + 14, by + 84 + k * 72, bw - 28, 18, { size: 14, color: '#3e4b5b' }); });
        const lg = U.clamp((Math.log10(Math.max(leak, 1e-6)) + 6) / 6, 0, 1);
        U.txt(c, '整顆晶片的待機漏電（示意）', bx + 14, by + 276, { size: 14, w: 600, color: '#3e4b5b' });
        c.fillStyle = '#e8edf3'; c.fillRect(bx + 14, by + 286, bw - 28, 14); c.fillStyle = lg > .8 ? '#b3261e' : lg > .5 ? '#d08a1e' : '#1f7a4d'; c.fillRect(bx + 14, by + 286, (bw - 28) * lg, 14);
        U.setMeter(el, 'h1-c', ctrl, ctrl > .85 ? '夠' : ctrl > .5 ? '偏弱' : '不夠', ctrl > .85 ? 'good' : ctrl > .5 ? 'warn' : 'bad');
        U.setMeter(el, 'h1-m', Math.sqrt(leak), leak > .3 ? '很高' : leak > .05 ? '有' : '很低', leak > .3 ? 'bad' : leak > .05 ? 'warn' : 'good');
      });
    }
  }, F));
})();
