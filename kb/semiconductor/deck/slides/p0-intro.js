/* 開場：封面、議程、尺度縮放 */
(function () {
  const A = Deck.add.bind(Deck);

  /* 1. 封面 */
  A({
    id: 'cover', part: 0, raw: true, cls: 'cover', minutes: 1.5, short: '封面',
    title: '先進製程技術演進',
    render: () => `
      <div class="cover-grid">
        <div class="cover-left">
          <div>
            <div class="s-eyebrow">SEMICONDUCTOR PROCESS TECHNOLOGY · 2026</div>
            <h1>半導體先進製程<br>技術演進</h1>
            <div class="sub">從 7 奈米到埃米世代：<br>電晶體怎麼做出來，以及下一步往哪裡走</div>
          </div>
          <div class="cards c3" style="margin-top:28px">
            <div class="card"><h4>第一部分</h4><p><b>演進與現況</b><br>FinFET → GAA，三大廠路線圖</p></div>
            <div class="card"><h4>第二部分</h4><p><b>製造：從電晶體到量產（十章）</b><br>畫圖、挖洞、鋪膜、摻雜與長晶、閘極、磨平，再組成電晶體、量測把關，最後走到量產</p></div>
            <div class="card"><h4>第三部分</h4><p><b>突破摩爾定律：系統性解決</b><br>先進封裝、背面供電</p></div>
          </div>
          <div class="meta">約 4 小時 10 分（分兩場）· 89 頁＋Q&A 附錄 · 資料更新至 2026 年 9 月</div>
        </div>
        <div class="cover-right">
          <img src="assets/img/wafer-12inch.jpg" alt="12 吋矽晶圓，表面布滿晶粒" style="position:absolute;inset:60px 60px 150px;width:calc(100% - 120px);height:calc(100% - 210px);object-fit:cover;border-radius:4px;border:1px solid var(--line)">
          <div style="position:absolute;left:60px;right:60px;bottom:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            <div class="card key"><h4>晶圓直徑</h4><div class="big">300 mm</div></div>
            <div class="card key"><h4>一顆手機晶片</h4><div class="big">≈200 億</div><p style="margin:0;font-size:14px">個電晶體</p></div>
            <div class="card key"><h4>一根頭髮的寬度</h4><div class="big">≈1,700</div><p style="margin:0;font-size:14px">個閘極並排</p></div>
          </div>
          <div class="caption" style="position:absolute;right:60px;top:26px;font-size:12px">照片：12-inch silicon wafer，Peellden／Wikimedia Commons，CC BY-SA 3.0</div>
        </div>
      </div>`,
    notes: `大家好，今天全部大約四小時十分，分兩場，主題是半導體先進製程的技術演進，重點放在 7 奈米以下這幾個世代。

右邊是一片 12 吋晶圓，直徑 300 毫米，上面每一小格是一顆晶粒。右下角兩個數字讓大家先有感覺：一顆手機晶片裡大約有兩百億個電晶體；一根頭髮的寬度，可以並排大約一千七百個閘極。今天要談的最小結構，奈米片只有 5 奈米左右厚，大約是 9 個矽晶格疊起來那麼薄。

我們分三部分走：先看電晶體結構怎麼演進、三大廠目前走到哪裡；再拆解「做出一顆電晶體」的十章：六大製程技術，加上把它們組起來，怎麼模擬、怎麼量測，以及從設計走到量產的路；最後看先進封裝、背面供電這些從系統下手、延續摩爾定律的關鍵。`
  });

  /* 2. 議程 */
  A({
    id: 'agenda', part: 0, minutes: 1.5, short: '議程與全場地圖',
    title: '今天的路線：先看結構，再看怎麼做，最後看系統',
    thesis: '先懂電晶體為什麼要變形，就看得懂每一項製程技術<b>在解決什麼問題</b>。',
    render: () => {
      const parts = [
        { n: '1', t: '先進製程的演進與現況', m: '約 26 分', to: 'p1', tr: '趨勢 1：結構越包越緊', items: ['電晶體：電壓控制的水龍頭', '縮太小會漏電 → 結構變形', '「2 奈米」名字的真相', '三大廠走到哪裡'] },
        { n: '2', t: '製造：從電晶體到量產（十章）', m: '約 149 分', to: 'p2', tr: '趨勢 2：精準到原子，也要量得到', items: ['① 微影　② 蝕刻　③ 沉積', '④ 摻雜與磊晶　⑤ 閘極', '⑥ 磨平　⑦ 環繞式電晶體與導線', '⑧ 模擬　⑨ 檢測量測　⑩ 從設計到量產'] },
        { n: '3', t: '未來突破摩爾定律的關鍵：系統性解決', m: '約 70 分', to: 'p3', tr: '趨勢 3：從系統下手，不只靠縮小', items: ['先進封裝：2.5D、3D 堆疊與散熱、光通訊', '把電線搬到背面', '加碼：上下疊的電晶體'] }
      ];

      return `<div class="s-body three">${parts.map(p => `
        <div class="fig" style="cursor:pointer" data-go="${p.to}">
          <div class="fig-title"><span>PART ${p.n}</span><span>${p.m}</span></div>
          <div style="font-size:26px;font-weight:700;line-height:1.3">${p.t}</div>
          <div style="font-size:17px;font-weight:700;color:var(--accent)">${p.tr}</div>
          <ul class="points">${p.items.map(i => `<li>${i}</li>`).join('')}</ul>
          <div style="margin-top:auto" class="caption">點擊跳到此部分 →</div>
        </div>`).join('')}</div>
        <div class="card" style="margin-top:16px;display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center">
          <h4 style="margin:0">閱讀方式</h4>
          <p style="margin:0">每頁左邊是可以動手玩的動畫，右邊是三個重點和一個生活比喻。第二部分右上角的章節列會標出「現在在第幾章」。標題旁的<b style="color:var(--accent-2)">橘色標籤</b>標出「2 nm 世代新技術」「A16 起新技術」「新技術」「未來技術」。</p>
        </div>`;
    },
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); },
    notes: `整場有一條主線：結構決定製程。第一部分先講電晶體為什麼從平面變成鰭式，再變成環繞閘極。理解「為什麼要變形」之後，第二部分的每一項製程技術就很好懂，因為它們都在回答同一個問題：怎麼用原子等級的精度把這些 3D 結構做出來。

第一部分大約二十六分鐘。第二部分是重頭戲，大約兩個半小時。第三部分約七十分鐘，看未來十年延續摩爾定律的技術。每一部分都對應一個趨勢，寫在卡片上，最後一頁會收在一起。

每一頁的版面都一樣：左邊是可以動手玩的動畫，右邊是三個重點和一個生活比喻。`
  });

  /* 3. 尺度縮放：真實照片，連續放大（像地圖一樣拉近） */
  // fw＝畫面寬度（公尺）；m、q＝下一張照片在這張照片裡的位置（中心、相對寬度）
  const SCALES = [
    { k: 'wafer', n: '12 吋晶圓', v: '300 mm', fw: 0.32, m: [0.535, 0.39], q: 0.09, d: '一片晶圓可以切出數百顆晶片。每一個小方格，就是一顆晶片。' },
    { k: 'die', n: '一顆晶片', v: '約 10 mm', fw: 0.010, m: [0.425, 0.396], q: 0.25, d: 'AMD Zen 2 處理器晶片（7 奈米，台積電製造）。拆掉外殼後，用顯微鏡拍下的表面。' },
    { k: 'diezoom', n: '晶片局部', v: '約 2.5 mm', fw: 0.0025, m: [0.55, 0.45], q: 0.16, d: '同一顆晶片的局部：規則的格子是記憶體，雜亂的區域是運算電路。' },
    { k: 'sram', n: '晶片裡的記憶體陣列', v: '每格約 1.5 µm', fw: 15e-6, m: [0.5, 0.5], q: 0.14, d: '電子顯微鏡下的真實晶片（較舊製程的微控制器）：一格一格重複的圖案，就是 SRAM 記憶體單元，每格由 6 個電晶體組成。' },
    { k: 'finsem', n: '10 奈米線條（上視）', v: '線寬約 10 nm', fw: 400e-9, m: [0.5, 0.5], q: 0.23, d: '電子顯微鏡從上方看研究樣品：一條條亮線是 10 奈米寬的二氧化矽線條，紅、綠是軟體判定的下緣和上緣（NIST 的 3D 電子顯微鏡量測研究；畫面寬度為估計）。下一步換一個樣品，把一根鰭切開看剖面。' },
    { k: 'finstemA', n: '鰭式電晶體（剖面）', v: '鰭寬約 40 nm', fw: 91e-9, m: [0.5, 0.42], q: 0.055, d: '電子顯微鏡把一根「鰭」切開來看：中間深色直立的就是矽鰭，閘極會像馬鞍一樣跨在它的三面。這是另一個研究樣品，鰭比量產晶片粗。' },
    { k: 'atoms', n: '矽原子', v: '約 0.3 nm', fw: 5e-9, d: '掃描穿隧顯微鏡下的矽原子，每一顆亮點就是一個原子。' }
  ];
  const fmtLen = m => m >= 0.01 ? `${+(m * 100).toPrecision(2)} 公分` : m >= 1e-3 ? `${+(m * 1e3).toPrecision(2)} 毫米` : m >= 1e-6 ? `${+(m * 1e6).toPrecision(2)} 微米` : `${+(m * 1e9).toPrecision(2)} 奈米`;
  const fmtBar = m => m >= 0.01 ? `${+(m * 100).toPrecision(2)} cm` : m >= 1e-3 ? `${+(m * 1e3).toPrecision(2)} mm` : m >= 1e-6 ? `${+(m * 1e6).toPrecision(2)} µm` : `${+(m * 1e9).toPrecision(2)} nm`;
  A({
    id: 'scale', part: 0, minutes: 2.5, short: '尺度縮放（真實照片）',
    title: '從晶圓到原子：用真實照片一路放大', en: 'Powers of Ten',
    thesis: '按「一路放大」或拖滑桿、滾滑鼠。<b>橘框就是下一步要放大的地方</b>，右上角顯示畫面實際有多寬。',
    render: () => `
      <div class="s-body" style="grid-template-columns:62fr 38fr">
        <div class="col">
          <div class="fig grow" style="padding:0;overflow:hidden;background:#111">
            <div class="fig-canvas"><canvas id="sc-cv" style="cursor:zoom-in"></canvas></div>
            <div style="position:absolute;left:12px;top:10px;background:rgba(255,255,255,.93);padding:4px 12px;border-radius:3px;font-weight:700;font-size:22px" id="sc-name"></div>
            <div style="position:absolute;right:12px;top:10px;background:rgba(255,255,255,.93);padding:4px 12px;border-radius:3px;text-align:right"><div style="font-size:13px;color:var(--ink-3)">畫面寬度</div><div style="font-family:var(--font-mono);font-size:24px;color:var(--accent);font-weight:700;font-variant-numeric:tabular-nums" id="sc-fw"></div></div>
            <div style="position:absolute;left:0;right:0;bottom:0;background:rgba(255,255,255,.88);padding:3px 10px;font-size:12px;color:var(--ink-3)" id="sc-cr"></div>
          </div>
          <div class="controls"><button class="btn primary" id="sc-play" type="button">▶ 一路放大</button><button class="btn" id="sc-back" type="button">⟲ 回到晶圓</button><div class="ctl" style="flex:1"><label>放大程度<output id="sc-z-o"></output></label><input type="range" id="sc-z" min="0" max="${SCALES.length - 1}" step="0.001" value="0"></div></div>
        </div>
        <div class="col">
          <div id="sc-ladder" style="display:flex;flex-direction:column;gap:4px">${SCALES.map((s, i) => `<button type="button" class="btn sc-row" data-i="${i}" style="justify-content:space-between;padding:5px 12px;font-size:17px"><span><b style="font-family:var(--font-mono);color:var(--ink-3);margin-right:8px">${i + 1}</b>${s.n}</span><span class="mono" style="color:var(--ink-3)">${s.v}</span></button>`).join('')}</div>
          <div class="card key"><p id="sc-desc" style="font-size:19px;margin:0"></p><p id="sc-step" style="font-size:16px;margin:6px 0 0;color:var(--accent-2)"></p></div>
          <div class="analogy" style="margin-top:auto"><div class="ic">${U.icon('ruler')}</div><div><h4>比喻</h4><p>如果晶圓放大成台灣那麼大，一個電晶體大約只有一張 A4 紙寬。</p></div></div>
        </div>
      </div>`,
    init(el, ctx) {
      const cv = U.$(el, '#sc-cv'), { c, w, h } = U.canvas(cv);
      const imgs = SCALES.map(s => { const im = new Image(); im.src = CREDITS[s.k].f; return im; });
      const N = SCALES.length, C = [w / 2, h / 2];
      const rectOf = im => { const iw = im.naturalWidth || 1, ih = im.naturalHeight || 1, sc = Math.min(w / iw, h / ih); return [C[0] - iw * sc / 2, C[1] - ih * sc / 2, iw * sc, ih * sc]; };
      // 第 i 張到第 i+1 張：縮放倍率 S 與固定點 F（讓下一張剛好從橘框長成全畫面）
      const seg = i => {
        const s = SCALES[i], r = rectOf(imgs[i]), rn = rectOf(imgs[i + 1]);
        const M = [r[0] + s.m[0] * r[2], r[1] + s.m[1] * r[3]], S = rn[2] / (s.q * r[2]);
        const F = [(M[0] - C[0] / S) / (1 - 1 / S), (M[1] - C[1] / S) / (1 - 1 / S)];
        return { r, rn, S, F };
      };
      const tf = (r, F, k) => [F[0] + (r[0] - F[0]) * k, F[1] + (r[1] - F[1]) * k, r[2] * k, r[3] * k];
      const sm = (a, b, x) => { const t = U.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
      let z = 0, target = 0, playing = false, lastI = -1;
      const sl = U.$(el, '#sc-z'), rows = U.$$(el, '.sc-row'), playBtn = U.$(el, '#sc-play');
      const setPlay = on => { playing = on; playBtn.textContent = on ? '❚❚ 暫停' : '▶ 一路放大'; };
      sl.oninput = () => { setPlay(false); target = +sl.value; };
      rows.forEach(r => r.onclick = () => { setPlay(false); target = +r.dataset.i; });
      playBtn.onclick = () => { if (playing) return setPlay(false); if (target >= N - 1.001) { target = z = 0; } setPlay(true); };
      U.$(el, '#sc-back').onclick = () => { setPlay(false); target = 0; };
      cv.addEventListener('wheel', e => { e.preventDefault(); setPlay(false); target = U.clamp(target - e.deltaY * 0.0022, 0, N - 1); }, { passive: false });
      cv.addEventListener('click', () => { setPlay(false); target = Math.min(N - 1, Math.floor(target + 1e-6) + 1); });
      const draw = (im, r, a) => { if (!im.complete || !im.naturalWidth) return; c.globalAlpha = a; c.drawImage(im, r[0], r[1], r[2], r[3]); c.globalAlpha = 1; };
      ctx.raf((dt, t) => {
        if (playing) {
          const fr = target % 1, sp = 0.12 + 0.55 * Math.sin(Math.PI * U.clamp(fr, 0.02, 0.98)); // 每張照片前放慢
          target = Math.min(N - 1, target + dt * sp);
          if (target >= N - 1) setPlay(false);
        }
        z = U.reduced() ? target : z + (target - z) * Math.min(1, dt * 6);
        if (Math.abs(target - z) < 1e-4) z = target;
        const i = Math.min(N - 2, Math.floor(z)), f = z - i;
        c.imageSmoothingQuality = 'high';
        c.fillStyle = '#111'; c.fillRect(0, 0, w, h);
        const g = seg(i), k = Math.pow(g.S, f);
        draw(imgs[i], tf(g.r, g.F, k), 1);
        const rn = tf(g.rn, g.F, k / g.S);
        const a = sm(0.45, 0.85, f);
        if (a > 0) draw(imgs[i + 1], rn, a);
        // 下一步要放大的橘框
        const boxA = f < 0.5 ? 1 - f * 2 : 0;
        if (boxA > 0 && z < N - 1 - 1e-3) {
          const pulse = 0.75 + 0.25 * Math.sin(t * 4);
          c.strokeStyle = `rgba(0,0,0,${boxA * 0.5})`; c.lineWidth = 7; c.strokeRect(rn[0], rn[1], rn[2], rn[3]);
          c.strokeStyle = `rgba(255,150,40,${boxA * pulse})`; c.lineWidth = 4; c.strokeRect(rn[0], rn[1], rn[2], rn[3]);
          if (f < 0.08) U.tag(c, `放大這裡 ${Math.round(SCALES[i].fw / SCALES[i + 1].fw).toLocaleString()} 倍`, rn[0] + rn[2] / 2, Math.max(22, rn[1] - 8), { align: 'center', size: 16, color: '#b3541e' });
        }
        // 比例尺與畫面寬度（對數內插）
        const fw = Math.exp(U.lerp(Math.log(SCALES[i].fw), Math.log(SCALES[i + 1].fw), f));
        const raw = fw / 5, e = Math.pow(10, Math.floor(Math.log10(raw))), nice = [1, 2, 5, 10].map(m => m * e).filter(v => v <= raw).pop() || e;
        const bw = nice / fw * w;
        c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(12, h - 60, bw + 20, 30);
        c.fillStyle = '#17202b'; c.fillRect(22, h - 38, bw, 5);
        U.txt(c, fmtBar(nice), 22 + bw / 2, h - 43, { align: 'center', size: 13, w: 700, color: '#17202b' });
        U.$(el, '#sc-fw').textContent = fmtLen(fw);
        const near = Math.round(z);
        if (near !== lastI) {
          lastI = near; const s = SCALES[near], cr = CREDITS[s.k];
          U.$(el, '#sc-name').textContent = s.n; U.$(el, '#sc-desc').textContent = s.d;
          U.$(el, '#sc-cr').textContent = `影像：${cr.t} · ${cr.by} · ${cr.lic}`;
          U.$(el, '#sc-step').textContent = near < N - 1 ? `下一張再放大約 ${Math.round(s.fw / SCALES[near + 1].fw).toLocaleString()} 倍` : `從晶圓到這裡，總共放大了約 ${Math.round(SCALES[0].fw / s.fw / 1e4).toLocaleString()} 萬倍`;
          rows.forEach((r, k) => r.classList.toggle('primary', k === near));
        }
        if (document.activeElement !== sl) sl.value = z;
        U.$(el, '#sc-z-o').textContent = `${near + 1} / ${N}`;
      });
    },
    notes: `先建立尺度感。這一頁全部是真實照片，按「一路放大」，畫面會像地圖一樣連續拉近。每張照片上的橘色框，就是下一步要放大的位置；右上角是畫面實際的寬度，左下角是比例尺。

第一張是 12 吋晶圓，每一個小方格是一顆晶片。放大進去，是一顆真實的處理器晶片：AMD 的 Zen 2，7 奈米，台積電製造，大約一平方公分大。再放大局部：規則重複的格子是記憶體，雜亂的區域是運算電路。

接著用電子顯微鏡看記憶體陣列：一格一格重複的圖案就是 SRAM 記憶體單元，每格由 6 個電晶體組成。這張是較舊製程的微控制器，格子比先進製程大很多。再往下是研究樣品：電子顯微鏡從上方看 10 奈米寬的線條，紅色和綠色是軟體判定的邊緣，這正是第九章量測要做的事。

最後兩張：一根鰭的剖面，以及矽原子本身，畫面只有 5 奈米寬。從晶圓到原子，總共放大了約六千萬倍。今天的主戰場在最後幾張：在這個尺度，多一層、少一層原子，電晶體的表現就不一樣。

注意：照片都是開放授權，來源標在畫面下方；第四到第六張是不同的樣品，用來代表那個尺度看到的東西。`
  });
})();
