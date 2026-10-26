/* 開場：封面、議程 */
(function () {
  const A = Deck.add.bind(Deck);
  const total = () => `${Deck.slides.length} 頁，約 ${Math.round(Deck.slides.reduce((a, x) => a + (x.minutes || 0), 0))} 分鐘`;

  /* 1. 封面：右側是一筆知識從傳承者流到新人、再從新人的問題流回來的示意圖 */
  A({
    id: 'cover', part: 0, raw: true, cls: 'cover', minutes: 1, short: '封面',
    title: '知識傳承框架',
    render: () => `
      <div class="cover-grid">
        <div class="cover-left">
          <div>
            <div class="s-eyebrow">KNOWLEDGE INHERITANCE FRAMEWORK · 2026</div>
            <h1>知識傳承框架</h1>
            <div class="sub">老手的經驗，變成新人看得懂的互動簡報；<br>增刪修改，跟 Agent 說就好</div>
          </div>
          <div class="cards" style="margin-top:28px;grid-template-columns:repeat(2,1fr)">
            <div class="card"><h4>第一部分</h4><p><b>為什麼、給誰</b><br>知識只在人腦袋裡、給主管的總覽、四種角色與使用情境、全景圖</p></div>
            <div class="card"><h4>第二部分</h4><p><b>怎麼運作</b><br>五章：知識怎麼存、新增、修改與刪除、檢查與審核、新人怎麼學</p></div>
            <div class="card"><h4>第三部分</h4><p><b>跟 Git 主機結合</b><br>對到 Git 上、誰能合併、待回答與勘誤</p></div>
            <div class="card"><h4>第四部分</h4><p><b>怎麼開始</b><br>技術選擇、skill 設計、搬半導體、新增知識庫</p></div>
            <div class="card" style="grid-column:1/-1;background:var(--accent-2-soft);border-color:#eccab4"><h4>第五部分</h4><p><b>現況</b><br>已合併的 20 個變更提案、情境測試、只留簡報（ADR-0007）實際做成的樣子，和之後還可以做的事</p></div>
          </div>
          <div class="meta">設計說明 · 10-24 定案，10-26 更新 · ${total()}<br>每頁左邊的互動元件都可以操作；對話與情境為示意</div>
        </div>
        <div class="cover-right">
          <div style="position:absolute;left:50px;right:50px;top:50px;bottom:200px"><canvas id="cv-cover" style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas></div>
          <div style="position:absolute;left:50px;right:50px;bottom:40px;display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            <div class="card key"><h4>從哪開始</h4><div class="big" style="font-size:28px">入口網站</div><p style="margin:0;font-size:14px">一個壓縮檔，離線能看</p></div>
            <div class="card key"><h4>新人主要看</h4><div class="big" style="font-size:28px">簡報</div><p style="margin:0;font-size:14px">主頁＋按了才看的深入頁</p></div>
            <div class="card key"><h4>怎麼改</h4><div class="big" style="font-size:28px">跟 Agent 說</div><p style="margin:0;font-size:14px">維護者核准才算數</p></div>
          </div>
        </div>
      </div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#cv-cover'));
      const A0 = [w * .13, h * .36], B0 = [w * .43, h * .36], C0 = [w * .71, h * .36];
      const L = [[w * .91, h * .14], [w * .91, h * .36], [w * .91, h * .58]];
      const lerp2 = (p, q, u) => [U.lerp(p[0], q[0], u), U.lerp(p[1], q[1], u)];
      const bz = [[L[2][0], L[2][1] + 24], [w * .96, h * .99], [w * .08, h * .99], [A0[0], A0[1] + 34]];
      const bez = u => { const m = 1 - u; return [0, 1].map(k => m * m * m * bz[0][k] + 3 * m * m * u * bz[1][k] + 3 * m * u * u * bz[2][k] + u * u * u * bz[3][k]); };
      const node = (p, t1, t2, bw, col) => {
        const bh = t2 ? 62 : 44;
        c.fillStyle = '#fff'; c.strokeStyle = col; c.lineWidth = 2;
        U.rrect(c, p[0] - bw / 2, p[1] - bh / 2, bw, bh, 8); c.fill(); c.stroke();
        U.txt(c, t1, p[0], p[1] + (t2 ? -4 : 7), { align: 'center', size: 19, w: 700, color: '#17202b' });
        if (t2) U.txt(c, t2, p[0], p[1] + 20, { align: 'center', size: 13.5, color: '#6a7888' });
      };
      const seg = (p, q) => { c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); };
      const dots = Array.from({ length: 27 }, (_, k) => ({ ph: k / 27, lane: k % 3 }));
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        c.strokeStyle = '#c3cdd8'; c.lineWidth = 2.5;
        seg(A0, B0); seg(B0, C0); L.forEach(p => seg(C0, p));
        c.save(); c.setLineDash([7, 7]); c.strokeStyle = '#d9a17f'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(bz[0][0], bz[0][1]); c.bezierCurveTo(bz[1][0], bz[1][1], bz[2][0], bz[2][1], bz[3][0], bz[3][1]); c.stroke(); c.restore();
        const g = lerp2(B0, C0, .5);
        c.fillStyle = '#1f7a4d'; c.fillRect(g[0] - 3, g[1] - 24, 6, 48);
        U.txt(c, '維護者核准', g[0], g[1] - 32, { align: 'center', size: 14, w: 600, color: '#1f7a4d' });
        dots.forEach(d => {
          const s = (d.ph + t * .08) % 1; let p;
          if (s < .34) p = lerp2(A0, B0, s / .34);
          else if (s < .67) p = lerp2(B0, C0, (s - .34) / .33);
          else p = lerp2(C0, L[d.lane], (s - .67) / .33);
          U.dot(c, p[0], p[1], 5.5, '#1f4fb5');
        });
        for (let k = 0; k < 5; k++) { const p = bez((k / 5 + t * .06) % 1); U.dot(c, p[0], p[1], 5, '#b3541e'); }
        U.txt(c, '待回答：簡報沒寫的問題，就變成下一筆要補的知識', w * .52, h * .9, { align: 'center', size: 15, w: 600, color: '#b3541e', bg: 'rgba(242,245,248,.94)' });
        node(A0, '傳承者', '老手的經驗', 140, '#b3541e');
        node(B0, 'Agent', '研究・整理・訪談', 160, '#1f4fb5');
        node(C0, '簡報', '新人看這裡', 150, '#17202b');
        L.forEach(p => node(p, '新人', '', 96, '#1f4fb5'));
      });
    },
    notes: `大家好，今天介紹「知識傳承框架」：讓 Agent 幫忙，把各領域老手的經驗整理成新人看得懂的互動簡報。

右邊這張圖就是整件事。藍點是知識，從傳承者出發，經過 Agent 整理、維護者核准，進到簡報，再流到新人身上。橘點反過來走：簡報沒寫的問題，回到傳承者手上，變成下一筆要補的知識。

這份是 10-24 定案的設計說明，10-26 更新成現在的樣子。中間有兩次大改變：10-25 定案「新人以簡報為主」（ADR-0006），新人從入口網站開始看簡報；10-26 再定案「只留簡報」（ADR-0007），拿掉手冊，一頁放不下的長說明做成接在主頁後面的深入頁（平常翻頁不經過，按「看深入」才進去），入口網站多了全景圖、速覽、先修和主題索引。兩次都分三個變更提案做完了。

前四部分講設計，第五部分講已經做完的、實際做成什麼樣子，和之後還可以做的事。每頁左邊都可以動手操作。`
  });

  /* 2. 議程 */
  A({
    id: 'agenda', part: 0, minutes: 1, short: '議程',
    title: '今天的路線：從為什麼講到第一步',
    thesis: '主角是<b>新人</b>；增刪修改知識，是讓新人一直學得到東西的手段。第五部分是<b>現況</b>。',
    render: () => {
      const parts = [
        { n: '1', t: '為什麼、給誰', m: '約 12 分', to: 'why', items: ['知識只在人腦袋裡', '給主管的總覽', '四種角色與使用情境', '全景圖'] },
        { n: '2', t: '怎麼運作', m: '約 19 分', to: 'struct', items: ['① 知識怎麼存　② 新增', '③ 修改與刪除', '④ 檢查與審核', '⑤ 新人怎麼學'] },
        { n: '3', t: '跟 Git 主機結合', m: '約 6 分', to: 'gitmap', items: ['對到 Git 上', '誰能合併', '待回答與勘誤'] },
        { n: '4', t: '怎麼開始', m: '約 11 分', to: 'tools', items: ['技術選擇', '要設計的 skill 與參考', '把半導體搬進來', '新增一個知識庫'] },
        { n: '5', t: '現況', m: '約 10 分', to: 'status', items: ['已經做完的', '情境測試和工具', '新人以簡報為主：做成什麼樣', '之後還可以做的事'] }
      ];
      return `<div class="s-body three" style="grid-template-columns:repeat(5,1fr)">${parts.map(p => `
        <div class="fig" style="cursor:pointer" data-go="${p.to}">
          <div class="fig-title"><span>PART ${p.n}</span><span>${p.m}</span></div>
          <div style="font-size:26px;font-weight:700;line-height:1.3">${p.t}</div>
          <ul class="points">${p.items.map(i => `<li>${i}</li>`).join('')}</ul>
          <div style="margin-top:auto" class="caption">點一下跳到這個部分 →</div>
        </div>`).join('')}</div>`;
    },
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); },
    notes: `今天分四部分。第一部分講為什麼需要這套框架、誰會用它，最後用一張全景圖串起來。第二部分是重點，分五章講它怎麼運作。

第三部分講怎麼跟 GitHub 或 GitLab 結合；第四部分講技術選擇、要設計的 skill，和第一步要做什麼。第五部分是現況：已經合併了哪些變更提案、情境測試的結果、「只留簡報」實際做成什麼樣子，以及之後還可以做的事。點任何一張卡片可以直接跳過去。`
  });
})();
