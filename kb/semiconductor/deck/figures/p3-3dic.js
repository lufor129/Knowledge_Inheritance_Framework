/* 第三部分 ① 先進封裝：3DIC 深入三頁（接在 SoIC 之後、光學封裝之前；整頁可略）
   ① 散熱問題　② 散熱怎麼解　③ 設計與測試（翹曲與應力在玻璃基板頁） */
(function () {
  const EP = '第三部分 · ① 先進封裝';

  /* ---------- ① 散熱問題：為什麼 3DIC 特別難散熱 ---------- */
  // 共用的熱模型（示意）：由下往上的晶片 [名稱, 功率 W]；每道接合面熱阻 ri（°C/W），散熱器那一端 ts°C
  const stackT = (dies, ri, ts) => dies.map((_, j) => { let T = ts; for (let k = j; k < dies.length - 1; k++) T += ri * dies.slice(0, k + 1).reduce((a, d) => a + d[1], 0); return T; });
  const heatCol = T => { const f = U.clamp((T - 50) / 60, 0, 1); return `rgb(${Math.round(80 + 175 * f)},${Math.round(140 - 90 * f)},${Math.round(220 - 190 * f)})`; };
  const PROB = [
    { n: '① 熱變集中', h: '同一塊面積，熱疊在一起', d: '疊起來佔的面積沒變，熱卻是好幾顆晶片加在一起。' },
    { n: '② 熱要穿過每一層', h: '熱只能往上走，每一層都是關卡', d: '散熱器在最上面，最下面那顆的熱要穿過每一道接合面。如果運算晶片放在最下面（好供電），熱要穿過每一層；也有產品把熱的放上面，下一頁會看到。' },
    { n: '③ 熱點攤不開', h: '磨薄的晶片，熱點攤不開', d: '厚的矽像一塊鐵板，會把熱點往旁邊攤平；疊之前要磨到幾十微米，熱沒地方攤，熱點就更燙。' },
    { n: '④ 太熱會怎樣', h: '太熱的四個後果', d: '降頻變慢、漏電變多（越熱越漏、越漏越熱）、記憶體要更常刷新、壽命變短。' }
  ];
  Fig.add('therm3d', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('th-m', PROB.map(x => x.n), 0)}</div>${U.figHTML('th-cv', '', '')}
        <div class="controls" id="th-c0">${U.range('th-n', '疊幾層記憶體／快取', 0, 4, 1, 2, ' 層')}${U.range('th-w', '運算晶片耗電', 100, 700, 50, 400, ' W')}</div>
        <div class="controls" id="th-c2" hidden>${U.range('th-d', '晶片厚度', 10, 775, 5, 775, ' µm')}</div>
        <div class="controls" id="th-c3" hidden>${U.range('th-t', '晶片溫度', 50, 125, 5, 70, '°C')}</div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="th-h"></h4><div class="bigword" id="th-v"></div><p id="th-p" style="font-size:16.5px"></p></div>`,
        meters: [['th-m1', '有多嚴重']]
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#th-cv'));
      const ft = U.$(el, '#th-cv').closest('.fig').querySelector('.fig-title span');
      let m = 0, n = 2, P = 400, D = 775, T = 70;
      U.onSeg(el, 'th-m', i => { m = i; ['th-c0', 'th-c0', 'th-c2', 'th-c3'].forEach((id, k) => { if (k !== 1) U.$(el, '#' + id).hidden = true; }); U.$(el, '#' + ['th-c0', 'th-c0', 'th-c2', 'th-c3'][i]).hidden = false; U.$(el, '#th-h').textContent = PROB[i].h; ft.textContent = ['同一塊面積上的熱（示意）', '剖面：散熱器在最上面，電從最下面送進來（示意）', '晶片上視的溫度分布：中間有一個熱點（示意）', '溫度升高時（示意）'][i]; });
      U.bind(el, 'th-n', v => { n = v; }, v => v + ' 層'); U.bind(el, 'th-w', v => { P = v; }, v => v + ' W');
      U.bind(el, 'th-d', v => { D = v; }, v => v + ' µm'); U.bind(el, 'th-t', v => { T = v; }, v => v + '°C');
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const area = 8, dies = [['運算晶片', P], ...Array(n).fill(['記憶體／快取', 15])];
        if (m === 0) {
          // 功率密度：同一塊 8 cm² 的面積，疊幾層就加幾份熱
          const tot = dies.reduce((a, d) => a + d[1], 0), dens = tot / area;
          const L = 60, base = h - 70, bw = 80, bx = L + 40;
          dies.forEach(([nm, pw], j) => { const hh = Math.max(16, pw * 0.9); const y = base - dies.slice(0, j + 1).reduce((a, d) => a + Math.max(16, d[1] * 0.9), 0); c.fillStyle = j ? '#7f8fd6' : '#c46a6a'; c.fillRect(bx, y, bw * 2, hh - 2); U.txt(c, `${nm} ${pw} W`, bx + bw, y + hh / 2 + 4, { align: 'center', size: 13, w: 700, color: '#fff' }); });
          U.txt(c, `同一塊 ${area} cm²`, bx + bw, base + 24, { align: 'center', size: 14, color: '#3e4b5b' });
          const rx = bx + bw * 2 + 80, rw = w - rx - 40, sc = v => Math.min(1, v / 50) * rw;
          [['電爐爐面', 10, '#9aa1a9'], ['這一疊', dens, dens > 25 ? '#e03131' : '#e8590c']].forEach(([nm, v, col], k) => { const y = 80 + k * 70; U.txt(c, nm, rx, y - 8, { size: 15, w: 700, color: '#17202b' }); c.fillStyle = col; c.fillRect(rx, y, sc(v), 30); U.txt(c, `約 ${Math.round(v)} W/cm²`, rx + sc(v) + 8, y + 21, { size: 16, w: 700, color: col }); });
          U.txt(c, '熱點處還會再高好幾倍', rx, 250, { size: 14, color: '#b3261e' });
          U.$(el, '#th-v').textContent = `約 ${Math.round(dens)} W/cm²`; U.$(el, '#th-p').textContent = PROB[0].d + (dens > 10 ? `每平方公分要排掉的熱，是電爐爐面的 ${(dens / 10).toFixed(1)} 倍。` : '這個組合還比電爐爐面低。');
          U.setMeter(el, 'th-m1', dens / 40, `${Math.round(dens)} W/cm²`, dens > 25 ? 'bad' : 'warn');
        } else if (m === 1) {
          const temps = stackT(dies, 0.025, 35 + 0.15 * dies.reduce((a, d) => a + d[1], 0)), L = 60, W = w * 0.5, dh = Math.min(56, (h - 150) / (dies.length + 1)), base = h - 40;
          dies.forEach(([nm, pw], j) => { const y = base - (j + 1) * dh; c.fillStyle = heatCol(temps[j]); c.fillRect(L, y, W, dh - 6); U.txt(c, `${nm}（${pw} W）`, L + 12, y + dh / 2 + 2, { size: 14, w: 700, color: '#fff' }); U.txt(c, `${Math.round(temps[j])}°C`, L + W + 14, y + dh / 2 + 2, { size: 16, w: 700, color: temps[j] > 105 ? '#b3261e' : '#17202b' }); if (j < dies.length - 1) { c.fillStyle = '#e8590c'; c.fillRect(L, y - 6, W, 3); } });
          const yTop = base - (dies.length + 1) * dh;
          c.fillStyle = '#7a8a9c'; c.fillRect(L - 20, yTop - 6, W + 40, dh - 6); for (let q = 0; q < 8; q++) c.fillRect(L - 10 + q * (W + 20) / 7, yTop - 28, 6, 22);
          U.txt(c, '散熱器', L + W / 2, yTop + dh / 2 - 4, { align: 'center', size: 15, w: 700, color: '#fff' });
          for (let q = 0; q < 4; q++) { const f = (t * 0.4 + q / 4) % 1, x = L + W * 0.62 + q * W * 0.08; U.arrow(c, x, base - f * (base - yTop), x, base - f * (base - yTop) - 14, 'rgba(232,89,12,.7)', 2); }
          U.txt(c, '橘線：每一道接合面都是一道關卡', L + W + 70, yTop + 20, { size: 14, color: '#e8590c' });
          U.txt(c, '底下接封裝基板：電從下面送進來', L + W / 2, base + 22, { align: 'center', size: 14, color: '#3e4b5b' });
          const hot = temps[0];
          U.$(el, '#th-v').textContent = `運算晶片 約 ${Math.round(hot)}°C`; U.$(el, '#th-p').textContent = hot > 105 ? '超過約 105°C 的上限：晶片得降速，或改設計。' : PROB[1].d;
          U.setMeter(el, 'th-m1', (hot - 50) / 70, `${Math.round(hot)}°C`, hot > 105 ? 'bad' : hot > 90 ? 'warn' : 'good');
        } else if (m === 2) {
          // 熱點：厚的矽把熱往旁邊攤開；越薄，熱點越尖
          const gx = 40, gy = 20, gw = Math.min(w * 0.5, h - 60), gh = gw, N = 30, sig = 0.06 + 0.22 * Math.sqrt(D / 775), peak = 12 * (0.35 / sig);
          for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) { const u = a / (N - 1) - 0.5, v = b / (N - 1) - 0.5, Tq = 70 + peak * Math.exp(-(u * u + v * v) / (2 * sig * sig)); c.fillStyle = heatCol(Tq); c.fillRect(gx + a * gw / N, gy + b * gh / N, gw / N + 0.5, gh / N + 0.5); }
          c.strokeStyle = '#17202b'; c.strokeRect(gx, gy, gw, gh);
          const Tmax = 70 + peak, sx = gx + gw + 40;
          U.txt(c, '剖面：同一個熱點', sx, gy + 20, { size: 15, w: 700, color: '#17202b' });
          const thk = Math.max(14, D / 775 * 180), cw2 = Math.min(280, w - sx - 20); c.fillStyle = '#a9bcd0'; c.fillRect(sx, gy + 40, cw2, thk); c.fillStyle = '#e03131'; c.fillRect(sx + cw2 / 2 - 12, gy + 40 + thk, 24, 8);
          c.fillStyle = 'rgba(232,89,12,.35)'; c.beginPath(); c.moveTo(sx + cw2 / 2 - 12, gy + 40 + thk); c.lineTo(sx + cw2 / 2 + 12, gy + 40 + thk); c.lineTo(sx + cw2 / 2 + 12 + Math.min(cw2 / 2 - 12, thk * 0.7), gy + 40); c.lineTo(sx + cw2 / 2 - 12 - Math.min(cw2 / 2 - 12, thk * 0.7), gy + 40); c.closePath(); c.fill();
          U.txt(c, '熱點在底部（電晶體那一面），往上走時攤開', sx, gy + 40 + thk + 30, { size: 13.5, color: '#3e4b5b' });
          U.txt(c, D > 400 ? '厚：熱往上走時順便攤開' : '薄：熱還沒攤開就到頂了', sx, gy + 96 + thk, { size: 14, color: D > 400 ? '#1f7a4d' : '#b3261e' });
          U.txt(c, '一般晶片約 775 µm；3D 疊之前要磨到幾十 µm', sx, gy + 124 + thk, { size: 13.5, color: '#3e4b5b' });
          U.$(el, '#th-v').textContent = `熱點 約 ${Math.round(Tmax)}°C`; U.$(el, '#th-p').textContent = PROB[2].d;
          U.setMeter(el, 'th-m1', (Tmax - 50) / 70, `${Math.round(Tmax)}°C`, Tmax > 105 ? 'bad' : Tmax > 90 ? 'warn' : 'good');
        } else {
          // 太熱的四個後果（示意倍率）
          const dT = T - 70, leak = Math.pow(2, dT / 20), life = Math.pow(0.5, dT / 10), refresh = T > 85 ? 2 : 1, freq = T > 105 ? Math.max(0.5, 1 - (T - 105) * 0.03) : 1;
          const items = [['速度', freq, '超過上限就自動降頻', freq < 1], ['漏電', leak, '越熱越漏，漏電又變成熱', leak > 1.5], ['記憶體刷新', refresh, '超過 85°C 要刷新兩倍快，變慢又更耗電', refresh > 1], ['壽命', life, '每熱 10°C 壽命約少一半（示意）', life < 0.6]];
          const cw = (w - 60) / 2, ch = (h - 60) / 2;
          items.forEach(([nm, v, d, bad], k) => {
            const x = 20 + (k % 2) * (cw + 20), y = 20 + Math.floor(k / 2) * (ch + 20);
            c.fillStyle = bad ? '#fdecea' : '#f4f6f9'; U.rrect(c, x, y, cw, ch, 10); c.fill();
            U.txt(c, nm, x + 18, y + 32, { size: 18, w: 700, color: '#17202b' });
            U.txt(c, `× ${v < 0.1 ? v.toFixed(2) : v.toFixed(v < 10 ? 1 : 0)}`, x + 18, y + 80, { size: 34, w: 700, color: bad ? '#b3261e' : '#1f7a4d' });
            U.txt(c, d, x + 18, y + ch - 20, { size: 14, color: '#3e4b5b' });
          });
          if (T > 95) { U.tag(c, '漏電 → 更熱 → 更漏電：失控就叫熱失控', w / 2, h / 2 + 10, { align: 'center', size: 15, color: '#b3261e' }); }
          U.$(el, '#th-v').textContent = `${T}°C`; U.$(el, '#th-p').textContent = PROB[3].d + '（和 70°C 相比，數字為示意）';
          U.setMeter(el, 'th-m1', (T - 50) / 70, `${T}°C`, T > 105 ? 'bad' : T > 85 ? 'warn' : 'good');
        }
      });
    }
  });

  /* ---------- ② 散熱怎麼解：從設計、晶片內、封裝到系統 ---------- */
  // 每一招對溫度的效果（示意）：ri＝每道接合面熱阻倍率、ts＝散熱器那一端溫度變化、hs＝熱點額外溫度倍率、top＝運算晶片改放上面
  const COOL = [
    { g: '設計', n: '熱的放上面', top: 1, d: '最耗電的運算晶片放在最上面、貼著散熱器；例：AMD 第二代 3D V-Cache 把快取改放到 CPU 下面。', cost: '電要穿過下面幾層才送得上來，供電變難；運算晶片的熱還是要穿過散熱器，下面的記憶體也被烤' },
    { g: '設計', n: '熱點錯開＋溫度感測', hs: 0.5, d: '上下最熱的區塊不要疊在一起；晶片裡分散放很多溫度感測器，哪裡太熱就調低那一區的速度。', cost: '佈局受限制；降頻就是犧牲效能' },
    { g: '晶片內', n: '導熱銅柱', ri: 0.6, d: '層和層之間多放不接電、專門導熱的銅柱（假凸塊）或導熱矽穿孔，替熱開一條往上的路。', cost: '佔面積，接點和走線要讓位' },
    { g: '晶片內', n: '混合鍵合取代凸塊', ri: 0.7, d: '銅對銅直接接、中間沒有填膠，接合面薄又導熱好，比微凸塊好散熱。', cost: '製程更難（前面混合鍵合那一頁）' },
    { g: '晶片內', n: '高導熱材料（研發）', ri: 0.85, hs: 0.6, d: '接合層或基底加鑽石、碳化矽這類導熱很好的薄層，把熱點的熱先往旁邊攤開。', cost: '研發中：材料貴、和製程整合難' },
    { g: '晶片內', n: '晶片內微流道（研發）', ri: 0.5, sink: 0.85, hs: 0.5, d: '在矽裡直接挖幾十微米寬的水道，冷卻液流過熱點正下方，熱不用一層層穿上去。業界和台積電都發表過研究。', cost: '研發中：防漏、密封、泵浦，整套系統要重新設計' },
    { g: '封裝', n: '更好的導熱介面', tim: 0.5, d: '晶片和散熱蓋之間的導熱膏換成液態金屬、銦焊料或石墨片。', cost: '液態金屬會導電、會流動；焊料要高溫組裝' },
    { g: '封裝', n: '均溫板／拿掉散熱蓋', lid: 0.5, hs: 0.8, d: '散熱蓋換成內部有液體蒸發、冷凝的均溫板，把熱點攤平；或拿掉蓋子讓散熱器直接貼晶片。', cost: '晶片直接受力、容易壓裂，組裝要更精準' },
    { g: '系統', n: '冷板液冷', cold: 0.03, d: '風扇吹不動了，改用貼在晶片上的金屬冷板，裡面流冷卻水；新一代 AI 伺服器多半已經改用液冷。', cost: '機房要有水路、防漏、冷卻水塔' },
    { g: '系統', n: '浸沒式液冷', cold: 0.05, d: '整台伺服器泡在不導電的冷卻液裡，所有元件一起降溫；單相浸沒的效果通常不如冷板，和冷板二選一。', cost: '液體貴、維修麻煩，機房要重新設計' }
  ];
  const T2 = COOL.map(() => 0);
  Fig.add('therm3d2', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls" id="t2-c0" style="gap:6px">${COOL.map((x, i) => `<button class="btn" type="button" data-k="${i}" style="padding:4px 10px;font-size:14.5px">${x.n}</button>`).join('')}<button class="btn" type="button" id="t2-rs" style="padding:4px 10px;font-size:14.5px">↺ 全部取消</button></div>
        ${U.figHTML('t2-cv', '運算晶片 400 W＋3 層記憶體（各 15 W），示意', '')}</div>
      ${U.pageSide({
        top: `<div class="card key"><h4>運算晶片／記憶體最熱的地方</h4><div class="bigword" id="t2-v"></div><p id="t2-d" style="font-size:16px"></p></div>`,
        extra: `<div class="card"><h4>你選的招式，代價是</h4><p id="t2-cl" style="font-size:15px;margin:2px 0"></p></div>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#t2-cv'));
      // 選了哪些招式存在模組裡：按 B 回來、視窗縮放重建時保留
      const on = T2, btns = U.$$(el, '#t2-c0 [data-k]'); let lastK = -1;
      btns.forEach(b => { b.classList.toggle('primary', !!on[+b.dataset.k]); b.onclick = () => { const k = +b.dataset.k; on[k] = 1 - on[k]; lastK = k; if (on[k] && COOL[k].cold) { const o = k === 8 ? 9 : 8; on[o] = 0; btns[o].classList.remove('primary'); } b.classList.toggle('primary', !!on[k]); }; });
      U.$(el, '#t2-rs').onclick = () => { on.fill(0); lastK = -1; btns.forEach(b => b.classList.remove('primary')); };
      // 熱阻串聯模型（示意）：冷卻端 35°C → 散熱器 → 散熱蓋 → 導熱介面 → 最上層晶片 → 每道接合面 → 下層晶片；運算晶片另加熱點
      const model = o => {
        let ri = 0.025, tim = 0.04, lid = 0.03, sink = 0.08, hs = 15, top = 0;
        COOL.forEach((x, k) => { if (!o[k]) return; ri *= x.ri || 1; tim *= x.tim || 1; lid *= x.lid || 1; sink = x.cold ? Math.min(sink, x.cold) : sink * (x.sink || 1); hs *= x.hs || 1; if (x.top) top = 1; });
        const dies = top ? [['記憶體', 15], ['記憶體', 15], ['記憶體', 15], ['運算晶片', 400]] : [['運算晶片', 400], ['記憶體', 15], ['記憶體', 15], ['記憶體', 15]];
        const P = dies.reduce((a, d) => a + d[1], 0), temps = stackT(dies, ri, 35 + (tim + lid + sink) * P), ci = top ? 3 : 0; temps[ci] += hs;
        const mem = Math.max(...temps.filter((_, j) => j !== ci));
        return { dies, temps, comp: temps[ci], mem, ok: temps[ci] <= 105 && mem <= 95, top };
      };
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const base = model(COOL.map(() => 0)), cur = model(on), lim = 105;
        // 上：長條（運算晶片溫度；從 20°C 起算）
        const L = 150, R = w - 220, y0 = 24, bh = 28, sc = v => U.clamp((v - 20) / (170 - 20), 0, 1) * (R - L);
        c.strokeStyle = '#b3261e'; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(L + sc(lim), y0 - 8); c.lineTo(L + sc(lim), y0 + 2 * (bh + 10) + 4); c.stroke(); c.setLineDash([]);
        U.txt(c, `上限約 ${lim}°C`, L + sc(lim) + 6, y0, { size: 13.5, color: '#b3261e' });
        [['什麼都不做', base, '#9aa1a9'], ['你選的組合', cur, cur.ok ? '#1f7a4d' : '#e03131']].forEach(([nm, s, col], k) => {
          const y = y0 + 8 + k * (bh + 10); U.txt(c, nm, L - 12, y + bh / 2 + 5, { align: 'right', size: 15, w: 700, color: '#17202b' });
          c.fillStyle = col; c.fillRect(L, y, sc(s.comp), bh); U.txt(c, `${Math.round(s.comp)}°C`, L + sc(s.comp) + 8, y + bh / 2 + 6, { size: 16, w: 700, color: col });
          U.txt(c, `記憶體 ${Math.round(s.mem)}°C`, R + 70, y + bh / 2 + 6, { size: 14, w: 700, color: s.mem > 95 ? '#e03131' : '#1f7a4d' });
        });
        U.txt(c, '記憶體上限約 95°C', R + 70, y0, { size: 13, color: '#b3261e' });
        // 下：剖面，選了哪一招就畫出來
        const top = y0 + 2 * (bh + 10) + 34, H = h - top - 8, X = 150, W = w * 0.48, lh = Math.min(24, H / 13);
        let y = top + H - 14;
        if (on[9]) { c.fillStyle = 'rgba(116,192,252,.25)'; c.fillRect(X - 30, top - 6, W + 60, H); U.txt(c, '不導電冷卻液', X - 24, top + 10, { size: 13, color: '#1971c2' }); }
        const layer = (hh, fill, label, col) => { y -= hh; c.fillStyle = fill; c.fillRect(X, y, W, hh - 2); if (label) U.txt(c, label, X - 10, y + hh / 2 + 4, { align: 'right', size: 13, color: col || '#3e4b5b' }); return y; };
        layer(lh, '#8fae7a', '封裝基板');
        cur.dies.forEach(([nm], j) => {
          if (j) { if (on[4]) { c.fillStyle = '#ced4da'; c.fillRect(X, y - 3, W, 3); y -= 3; } if (on[3]) { c.fillStyle = '#d9a35b'; c.fillRect(X, y - 2, W, 2); y -= 3; } else { for (let q = 0; q < 14; q++) U.dot(c, X + 8 + q * (W - 16) / 13, y - 3, 2.5, '#9aa1a9'); y -= 6; } if (on[2]) for (let q = 0; q < 7; q++) U.box(c, 'cu', X + 10 + q * (W - 20) / 6 - 3, y, 6, 6, { stroke: false }); }
          const yy = layer(lh * 1.05, heatCol(cur.temps[j]), nm === '運算晶片' ? '運算晶片' : (j === (cur.top ? 1 : 2) ? '記憶體 ×3' : ''));
          if (nm === '運算晶片') { if (on[5]) for (let q = 0; q < 6; q++) { const xx = X + 20 + q * (W - 40) / 5; c.fillStyle = '#e7f5ff'; c.fillRect(xx - 5, yy + 4, 10, lh - 10); U.dot(c, xx, yy + 4 + ((t * 30 + q * 7) % (lh - 10)), 2.5, '#1971c2'); } const hsx = X + W * (on[1] ? 0.75 : 0.5); c.fillStyle = `rgba(224,49,49,${on[1] ? .35 : .7})`; c.beginPath(); c.arc(hsx, yy + lh / 2, 7, 0, 7); c.fill(); }
        });
        layer(lh * 0.5, on[6] ? '#c9b8e8' : '#e4e9f0', '導熱介面', on[6] ? '#7c3aed' : '');
        layer(lh * 0.9, on[7] ? '#9fd3c7' : '#adb5bd', on[7] ? '均溫板（直接貼）' : '散熱蓋', on[7] ? '#0c8599' : '');
        if (on[8]) { const yy = layer(lh * 1.4, '#868e96', '冷板（液冷）', '#1971c2'); for (let q = 0; q < 3; q++) U.dot(c, X + ((t * 120 + q * W / 3) % W), yy + lh * 0.7, 3.5, '#74c0fc'); }
        else if (!on[9]) { const yy = layer(lh * 0.8, '#868e96', '散熱片＋風扇'); c.fillStyle = '#868e96'; for (let q = 0; q < 10; q++) c.fillRect(X + 6 + q * (W - 12) / 9, yy - lh, 4, lh); }
        // 右：四層清單
        const gx = X + W + 40; let gy = top - 6;
        ['設計', '晶片內', '封裝', '系統'].forEach(gn => { U.txt(c, gn, gx, gy + 14, { size: 14, w: 700, color: '#17202b' }); gy += 19; COOL.forEach((x2, k) => { if (x2.g !== gn) return; U.txt(c, (on[k] ? '● ' : '○ ') + x2.n, gx + 8, gy + 14, { size: 13.5, w: on[k] ? 700 : 500, color: on[k] ? '#1f7a4d' : '#8a97a8' }); gy += 19; }); gy += 5; });
        const sel = COOL.filter((_, k) => on[k]), last = COOL[lastK];
        U.$(el, '#t2-v').textContent = `${Math.round(cur.comp)}°C／${Math.round(cur.mem)}°C ${cur.ok ? '✓' : '✗'}`;
        U.$(el, '#t2-d').textContent = last && on[lastK] ? `${last.g} · ${last.n}：${last.d}` : '點上面的按鈕，一招一招加上去，看溫度降多少、剖面哪裡變了。';
        U.$(el, '#t2-cl').textContent = sel.length ? sel.map(x => `${x.n}：${x.cost}`).join('；') : '還沒選。每一招都有代價，實際上要看產品挑組合。';
      });
    }
  });

  /* ---------- ③ 設計與測試：疊之前先確認是好的 ---------- */
  const DES = [
    { n: '接點要對齊', d: '上下兩顆晶片各自的接點，位置要一模一樣才疊得起來；改一顆就要兩顆一起改。' },
    { n: '矽穿孔的禁區', d: '矽穿孔周圍的矽會被拉扯，旁邊的電晶體特性會變，所以要留一圈不放電晶體的禁區（keep-out zone）。' },
    { n: '電要穿過下層', d: '上層晶片的電要穿過下層才送得上來：下層要留出供電用的矽穿孔，電壓也會掉一些。' },
    { n: '熱點不要疊在一起', d: '上下最熱的區塊不要正好疊在一起，不然熱集中、更難散。' }
  ];
  const TFLOW = [
    { n: '① 晶圓針測', d: '還沒切開時先測每一顆。真正的接點太小太密（幾微米），探針扎不下去，所以要另外留比較大的測試墊，或在晶片裡做自我測試電路（BIST）。', who: '設計時預留測試墊與 BIST' },
    { n: '② 挑出好晶片', d: '把測過的晶片分好壞，只拿好的（KGD）去疊。分得越細（例如速度分級），疊起來的整組越平均。', who: '測試結果 → 挑片' },
    { n: '③ 疊上去', d: '一顆一顆放上去、接合。這一步本身也有良率：對偏、微粒、空洞都可能讓一組報廢。', who: '接合良率' },
    { n: '④ 疊後測試', d: '中間那層摸不到，要靠設計時預埋的測試路徑，一層一層往上測（業界有 3D 測試的共同標準，IEEE 1838）。同時要測上下層之間的接點有沒有通。', who: 'DFT：預埋測試路徑' },
    { n: '⑤ 壞了能修嗎', d: '記憶體會多做幾排備用的格子，壞了就切換過去；HBM 也有備用的通道和穿孔。邏輯晶片裡的 SRAM 也有備用行列，或關掉壞的核心降級出貨；但接合本身壞了救不回來，所以前面的 KGD 更重要。', who: '備援設計' },
    { n: '⑥ 封裝後測', d: '整顆封裝好再做成品測試（FT）和燒機，確認速度、功耗、溫度都合格。', who: 'FT（第十章旅程最後一站）' }
  ];
  Fig.add('dt3d', { body: true,
    eyebrow: EP,
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('dt-t', ['① 疊法與良率', '② 一起設計', '③ 測試流程'], 0)}<span id="dt-sw">${U.seg('dt-m', ['晶圓對晶圓（W2W）', '晶片對晶圓（C2W＋KGD）'], 0)}</span><span id="dt-sw2" hidden>${U.seg('dt-d', DES.map(x => x.n), 0)}</span><span id="dt-sw3" hidden>${U.seg('dt-f', TFLOW.map(x => x.n), 0)}</span></div>
        ${U.figHTML('dt-cv', '', '')}
        <div class="controls" id="dt-c1">${U.range('dt-y', '每一層晶片的良率', 70, 99, 1, 85, '%')}${U.range('dt-n', '疊幾層', 2, 4, 1, 2, ' 層')}</div></div>
      ${U.pageSide({
        top: `<div class="card key"><h4 id="dt-h"></h4><div class="bigword" id="dt-r"></div><p id="dt-p" style="font-size:16.5px"></p></div>`,
        extra: `<table class="t" id="dt-tb" style="font-size:14.5px"><thead><tr><th></th><th>W2W</th><th>C2W</th></tr></thead><tbody>
          <tr><td>怎麼疊</td><td>兩整片晶圓對疊</td><td>切好的晶片一顆顆放到晶圓上</td></tr>
          <tr><td>速度</td><td>快（一次整片）</td><td>慢（一顆一顆）</td></tr>
          <tr><td>壞的會疊上去嗎</td><td>會</td><td>不會（先挑 KGD）</td></tr>
          <tr><td>上下晶片大小</td><td>必須一樣大</td><td>可以不一樣</td></tr>
          <tr><td>例子</td><td>良率高的：3D NAND、影像感測器</td><td>大而貴的運算晶片</td></tr>
          <tr><td colspan="3" style="font-size:13.5px;color:var(--ink-3)">台積電 SoIC 兩種都有；HBM 是一顆顆疊，不是整片疊</td></tr></tbody></table>`
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#dt-cv'));
      const ft = U.$(el, '#dt-cv').closest('.fig').querySelector('.fig-title span');
      let tab = 0, m = 0, Y = 0.85, n = 2, di = 0, fi = 0, g = 0;
      const seed = Array.from({ length: 480 }, Math.random), seedB = Array.from({ length: 480 }, Math.random); // 固定的隨機數：拖滑桿時格子不會亂跳
      U.onSeg(el, 'dt-t', i => { tab = i; g = 0; U.$(el, '#dt-sw').hidden = i !== 0; U.$(el, '#dt-sw2').hidden = i !== 1; U.$(el, '#dt-sw3').hidden = i !== 2; U.$(el, '#dt-c1').hidden = i !== 0; U.$(el, '#dt-tb').hidden = i !== 0; ft.textContent = ['每一格是一組疊好的晶片（上視，示意）', '上下兩顆晶片（上視，疊起來時重疊在一起）', '3DIC 的測試流程'][i]; });
      U.onSeg(el, 'dt-m', i => { m = i; });
      U.onSeg(el, 'dt-d', i => { di = i; g = 0; });
      U.onSeg(el, 'dt-f', i => { fi = i; g = 0; });
      U.bind(el, 'dt-y', v => { Y = v / 100; }, v => v + '%'); U.bind(el, 'dt-n', v => { n = v; }, v => v + ' 層');
      const BOND = 0.99; // 每一道接合的良率（示意）
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h); g = Math.min(1, g + dt * 1.5);
        if (tab === 0) {
          const cols = 12, rows = 9, cs = Math.min((w - 60) / cols, (h - 70) / rows), x0 = (w - cs * cols) / 2, y0 = 16;
          let good = 0;
          for (let k = 0; k < cols * rows; k++) {
            // W2W：每一層各自隨機好壞，疊起來全部要好；C2W：每層都先挑好的，只剩接合良率
            let ok = true, badLayer = -1;
            for (let L = 0; L < n; L++) if (m === 0 && seed[L * 120 + k] > Y) { ok = false; badLayer = L; break; }
            if (ok) for (let L = 0; L < n - 1; L++) if (seedB[L * 120 + k] > BOND) { ok = false; badLayer = -2; } // 接合本身失敗
            if (ok) good++;
            const x = x0 + (k % cols) * cs, y = y0 + Math.floor(k / cols) * cs;
            c.fillStyle = ok ? '#cfe8d6' : '#f6c9c5'; c.fillRect(x + 2, y + 2, cs - 4, cs - 4);
            if (!ok) U.txt(c, badLayer >= 0 ? String(badLayer + 1) : '接', x + cs / 2, y + cs / 2 + 5, { align: 'center', size: 13, w: 700, color: '#b3261e' });
          }
          const tot = cols * rows, r = good / tot, formula = m === 0 ? Math.pow(Y, n) * Math.pow(BOND, n - 1) : Math.pow(BOND, n - 1);
          U.txt(c, m === 0 ? `紅格數字＝第幾層壞了、「接」＝接合失敗。公式：${Math.round(Y * 100)}% 的 ${n} 次方 × 接合 ≈ ${Math.round(formula * 100)}%` : `每層都先測過、只拿好的疊：剩下接合本身的損失 ≈ ${Math.round(formula * 100)}%`, w / 2, h - 14, { align: 'center', size: 15, w: 700, color: m === 0 ? '#b3261e' : '#1f7a4d' });
          U.$(el, '#dt-h').textContent = '疊好之後能用的比例';
          U.$(el, '#dt-r').textContent = `平均約 ${Math.round(formula * 100)}%`;
          U.$(el, '#dt-p').textContent = (m === 0 ? '整片直接疊：一層壞就整組報廢，層數越多掉越快。拖兩個滑桿看看。' : '每顆先經 CP 測過（KGD）才疊：良率高，代價是慢、對準難；CP 也會有少數漏網的壞晶片。') + `左圖這一批剛好 ${good} / ${tot}（${Math.round(r * 100)}%），每批會有高低。`;
        } else if (tab === 1) {
          // 上下兩顆晶片的平面圖：下層（藍）、上層（橘，半透明疊上去）
          const W2 = Math.min(w * 0.6, (h - 60) * 1.3), H2 = W2 / 1.3, x0 = 30, y0 = 30, sx = x0 + W2 + 30;
          c.fillStyle = '#dbe6f7'; c.fillRect(x0, y0, W2, H2); c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; c.strokeRect(x0, y0, W2, H2);
          c.fillStyle = 'rgba(232,140,60,.18)'; c.fillRect(x0 + 10, y0 + 10, W2 - 20, H2 - 20); c.strokeStyle = '#c9793b'; c.setLineDash([6, 4]); c.strokeRect(x0 + 10, y0 + 10, W2 - 20, H2 - 20); c.setLineDash([]);
          U.txt(c, '下層晶片（藍）', x0, y0 + H2 + 22, { size: 14, w: 700, color: '#1f4fb5' }); U.txt(c, '上層晶片（橘虛線）', x0 + 130, y0 + H2 + 22, { size: 14, w: 700, color: '#b3541e' });
          const hl = k => di === k ? 1 : 0.25;
          // ① 接點陣列
          c.globalAlpha = hl(0); for (let a = 0; a < 6; a++) for (let b = 0; b < 4; b++) { const x = x0 + W2 * 0.12 + a * W2 * 0.045, y = y0 + H2 * 0.15 + b * H2 * 0.06; c.fillStyle = '#c9793b'; c.fillRect(x - 3, y - 3, 6, 6); c.strokeStyle = '#1f4fb5'; c.strokeRect(x - 5, y - 5, 10, 10); } c.globalAlpha = 1;
          // ② 矽穿孔與禁區
          c.globalAlpha = hl(1); [[0.6, 0.3], [0.75, 0.3], [0.6, 0.55]].forEach(([a, b]) => { const x = x0 + W2 * a, y = y0 + H2 * b; c.fillStyle = 'rgba(179,38,30,.15)'; c.beginPath(); c.arc(x, y, 22, 0, 7); c.fill(); U.dot(c, x, y, 6, '#7a8a9c'); }); c.globalAlpha = 1;
          // ③ 供電穿孔
          c.globalAlpha = hl(2); for (let q = 0; q < 8; q++) { const x = x0 + W2 * (0.12 + q * 0.1), y = y0 + H2 * 0.85; c.fillStyle = '#b3541e'; c.fillRect(x - 4, y - 4, 8, 8); } c.globalAlpha = 1;
          // ④ 熱點
          c.globalAlpha = hl(3); const hx = x0 + W2 * 0.35, hy = y0 + H2 * 0.6, ox = di === 3 ? W2 * 0.3 * g : 0; c.fillStyle = 'rgba(224,49,49,.35)'; c.beginPath(); c.arc(hx, hy, 34, 0, 7); c.fill(); c.fillStyle = 'rgba(232,89,12,.35)'; c.beginPath(); c.arc(hx + ox, hy - 4, 26, 0, 7); c.fill(); c.globalAlpha = 1;
          const lab = [['接點陣列：上下要對齊', x0 + W2 * 0.12, y0 + H2 * 0.1], ['矽穿孔＋周圍禁區', x0 + W2 * 0.6, y0 + H2 * 0.18], ['供電用的穿孔', x0 + W2 * 0.12, y0 + H2 * 0.78], [di === 3 && g > .9 ? '熱點錯開 ✓' : '熱點疊在一起', hx, hy + 52]];
          U.tag(c, lab[di][0], lab[di][1], lab[di][2], { size: 14, color: '#b3261e' });
          const tips = ['兩顆晶片不能各畫各的：', '要一起規劃位置、一起模擬：', '時序、電壓降、溫度、應力', '業界有共同的描述格式（例如', '台積電推的 3Dblox），讓不同', '公司的設計工具看得懂同一個', '3D 設計。'];
          tips.forEach((s, k) => U.txt(c, s, sx, y0 + 20 + k * 26, { size: 15, w: k === 0 ? 700 : 500, color: '#17202b' }));
          U.$(el, '#dt-h').textContent = `一起設計 · ${DES[di].n}`; U.$(el, '#dt-r').textContent = ''; U.$(el, '#dt-p').textContent = DES[di].d;
        } else {
          // 測試流程：六站，亮目前這一站
          const N = TFLOW.length, bw = (w - 40) / 3, bh = (h - 70) / 2;
          TFLOW.forEach((s, k) => {
            const col = k % 3, row = Math.floor(k / 3), x = 20 + (row ? 2 - col : col) * bw, y = 20 + row * (bh + 30), onn = k === fi, done = k < fi;
            c.fillStyle = onn ? '#1f4fb5' : done ? '#eef3fc' : '#fff'; U.rrect(c, x + 8, y, bw - 16, bh, 10); c.fill(); c.strokeStyle = onn ? '#1f4fb5' : '#c3ccd6'; c.lineWidth = onn ? 2.5 : 1.2; c.stroke();
            U.txt(c, s.n, x + bw / 2, y + 30, { align: 'center', size: 18, w: 700, color: onn ? '#fff' : '#17202b' });
            U.txt(c, s.who, x + bw / 2, y + 56, { align: 'center', size: 13.5, color: onn ? '#dbe6fb' : '#5b6878' });
            // 小圖
            const ix = x + bw / 2, iy = y + bh * 0.68;
            const ink = onn ? '#fff' : '#7a8a9c';
            if (k === 0) { c.strokeStyle = ink; c.lineWidth = 2; c.strokeRect(ix - 40, iy - 14, 80, 28); for (let q = 0; q < 3; q++) { c.beginPath(); c.moveTo(ix - 20 + q * 20, iy - 34); c.lineTo(ix - 20 + q * 20, iy - 14); c.stroke(); } }
            if (k === 1) for (let q = 0; q < 5; q++) { c.fillStyle = q === 2 ? '#e03131' : '#40c057'; c.fillRect(ix - 50 + q * 21, iy - 10, 16, 16); }
            if (k === 2) { U.box(c, 'si', ix - 40, iy, 80, 14); U.box(c, 'si', ix - 26, iy - 18 + 6 * Math.sin(t * 3) * (onn ? 1 : 0), 52, 14); }
            if (k === 3) { for (let q = 0; q < 3; q++) U.box(c, 'si', ix - 40 + q * 4, iy + 12 - q * 16, 80 - q * 8, 13); if (onn) { c.strokeStyle = '#ffd43b'; c.lineWidth = 2; c.beginPath(); c.moveTo(ix + 30, iy + 25); c.lineTo(ix + 30, iy - 22); c.stroke(); } }
            if (k === 4) { for (let q = 0; q < 4; q++) { c.fillStyle = q === 1 ? '#e03131' : ink; c.fillRect(ix - 40, iy - 18 + q * 9, 70, 6); } c.fillStyle = '#40c057'; c.fillRect(ix - 40, iy + 18, 70, 6); }
            if (k === 5) { c.fillStyle = onn ? '#fff' : '#3e4b5b'; U.rrect(c, ix - 30, iy - 18, 60, 36, 6); c.fill(); U.txt(c, 'FT', ix, iy + 6, { align: 'center', size: 15, w: 700, color: onn ? '#1f4fb5' : '#fff' }); }
            if (k < N - 1) { const nx = k === 2 ? x + bw / 2 : x + (row ? 0 : bw), ny = k === 2 ? y + bh + 4 : y + bh / 2; if (k === 2) U.arrow(c, nx, ny, nx, ny + 22, '#9aa8b8', 2); else if (row) U.arrow(c, x + 6, ny, x - 6, ny, '#9aa8b8', 2); else U.arrow(c, x + bw - 6, ny, x + bw + 6, ny, '#9aa8b8', 2); }
          });
          U.$(el, '#dt-h').textContent = `測試流程 · ${TFLOW[fi].n}`; U.$(el, '#dt-r').textContent = ''; U.$(el, '#dt-p').textContent = TFLOW[fi].d;
        }
      });
    }
  });
})();
