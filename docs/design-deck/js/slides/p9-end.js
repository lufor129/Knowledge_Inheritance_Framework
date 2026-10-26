/* 結尾：自我檢查、帶走三句話 */
(function () {
  const A = Deck.add.bind(Deck);

  const QS = [
    { q: '兩頁簡報的說法不一樣時，Agent 怎麼做？', o: [['兩種說法都列出來，問要不要記勘誤', 1], ['聽主頁的，把深入頁照主頁改掉', 0], ['看哪一頁比較新，就只講哪一頁', 0]], why: '查找只根據簡報，主頁和深入頁一樣算數：兩種都列、各附出處頁，再問要不要記成勘誤，由傳承者查清楚再改。' },
    { q: '研究來的內容，維護者審核時要怎麼做？', o: [['直接核准，Agent 已經查過了', 0], ['特別仔細看，Agent 可能說錯', 1], ['一律退回，請傳承者重寫', 0]], why: '研究可以用 Agent 自己的知識，而 Agent 說錯時語氣一樣肯定。所以變更提案會寫一行來歷，提醒維護者仔細看。' },
    { q: '合併兩頁簡報之後，舊的頁 id 怎麼辦？', o: [['舊 id 留著，自動轉到新的 id', 0], ['保留舊的那頁，標成已過時', 0], ['引用全部一起改掉，不留舊 id', 1]], why: '所有東西都在同一個 repo，引用全部看得到，Agent 在同一個變更提案裡一次改掉。' },
    { q: '新人問了一題簡報沒寫的問題，會變成什麼？', o: [['Agent 自己編一個答案給新人', 0], ['開成 issue，等傳承者認領回答', 1], ['直接寫進那一章的自我檢查', 0]], why: '查找只根據正式內容回答。簡報沒寫，Agent 問一句就開成 issue；答案做成簡報頁併入後 issue 關閉，題目也可以加進自我檢查。' }
  ];
  A({
    id: 'check', part: 9, minutes: 1.5, short: '自我檢查',
    title: '自我檢查：先自己想，再看答案', en: 'Self-check',
    thesis: '章末的自我檢查和帶讀都用這個做法：<b>先想、再打開</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('ck-seg', QS.map((_, i) => `第 ${i + 1} 題`), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span id="ck-n"></span><span></span></div>
          <p id="ck-q" style="margin:0;font-size:26px;font-weight:700"></p>
          <div class="quiz" id="ck-o"></div>
          <div class="fb" id="ck-fb"></div></div></div>
      ${U.side({
        points: ['答案先收起來，讓人先自己想', '答完一定說<b>為什麼</b>，再指回出處', '答不出來的題目，也可以記成待回答'],
        fact: { v: '4 題', d: '兩頁說法、來歷、舊 id、待回答，各一題' },
        analogy: { icon: 'ruler', t: '比喻', p: '像考前自己出題考自己：比再讀一遍課本，更容易發現哪裡還不懂。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'ck-seg', i => {
        const q = QS[i];
        U.$(el, '#ck-n').textContent = `第 ${i + 1} / ${QS.length} 題`;
        U.$(el, '#ck-q').textContent = q.q;
        U.$(el, '#ck-fb').textContent = '';
        const box = U.$(el, '#ck-o');
        box.innerHTML = q.o.map(([t], k) => `<button type="button" data-k="${k}">${t}</button>`).join('');
        U.$$(box, 'button').forEach(b => b.onclick = () => {
          const ok = q.o[+b.dataset.k][1];
          U.$$(box, 'button').forEach(x => x.classList.remove('right', 'wrong')); b.classList.add(ok ? 'right' : 'wrong');
          U.$(el, '#ck-fb').innerHTML = (ok ? '<b style="color:var(--good)">答對了。</b>' : '<b style="color:var(--bad)">再想想。</b>') + q.why;
        });
      });
    },
    notes: `最後來個自我檢查，共四題。這就是章末自我檢查和帶讀的做法：答案先收起來，先想再打開，可以請台下先想再選。

第一題，主頁和深入頁一樣算數，兩頁說法不一樣時兩種都列，再問要不要記勘誤。第二題，研究來的內容要仔細審，Agent 說錯時語氣一樣肯定。第三題，引用全部一起改掉，不留舊 id。第四題，簡報沒寫的問題會開成 issue，等傳承者回答。`
  });

  /* 總結：給主管的一頁說明。左邊是整個框架的運作圖，右邊分頁說明 */
  const NODES = {
    cont: [90, 110, '傳承者', '老手的經驗', '#b3541e', 130], learn: [90, 350, '新人', '看、問', '#1f4fb5', 130],
    agent: [300, 230, 'Agent', '寫、查、開 issue', '#1f4fb5', 160],
    issue: [580, 80, 'issue', '待回答、勘誤', '#a8660a', 150], pr: [580, 170, '變更提案', 'PR／MR', '#1f4fb5', 150],
    hb: [580, 260, '簡報', '正式內容', '#17202b', 150], ci: [580, 370, 'CI', '檢查、建置', '#b3541e', 150],
    maint: [765, 170, '維護者', '核准', '#1f7a4d', 120], fm: [765, 265, '框架維護者', '規則、引擎', '#1f7a4d', 120],
    out: [765, 370, '入口網站', 'portal.zip', '#1f7a4d', 130]
  };
  const FLOWS = [
    { t: '寫進去', col: '#b3541e', nodes: ['cont', 'agent', 'pr', 'hb', 'maint'], path: [['cont', 'agent'], ['agent', 'pr'], ['pr', 'hb']], side: [['maint', 'pr']], labels: [['cont', 'agent', '研究、整理、訪談'], ['agent', 'pr', '開變更提案'], ['maint', 'pr', '核准']], d: '老手用說的，Agent 做成簡報頁、開變更提案；檢查通過、維護者核准後，併進正式內容。' },
    { t: '發出去', col: '#1f7a4d', nodes: ['hb', 'ci', 'out', 'learn'], path: [['hb', 'ci'], ['ci', 'out'], ['out', [765, 440]], [[765, 440], [90, 440]], [[90, 440], 'learn']], labels: [['hb', 'ci', 'CI 建置'], [[765, 440], [90, 440], '新人下載，離線就能看']], d: '主線一更新，CI 就重新建置簡報，和入口網站一起打包成 portal.zip；新人下載解開就能看。' },
    { t: '學出來', col: '#1f4fb5', nodes: ['learn', 'agent', 'hb'], path: [['learn', 'agent'], ['agent', 'hb']], labels: [['learn', 'agent', '查找、帶讀'], ['agent', 'hb', '附出處回答']], d: '新人看不懂就問 Agent；答案根據簡報（主頁、深入頁、自我檢查），一定附出處頁，說法不同兩種都列。' },
    { t: '問回來', col: '#a8660a', nodes: ['agent', 'issue', 'cont'], path: [['agent', 'issue'], ['issue', 'cont']], labels: [['agent', 'issue', '簡報沒寫、覺得寫錯'], ['issue', 'cont', '認領回答']], d: '簡報沒寫的問題變成 issue，回到老手手上；答完併入，issue 自動關閉。' }
  ];
  const TABS = [
    ['問題與做法', ['<b>問題</b>：經驗只在老手腦袋、個人筆記和舊簡報裡，人一調走就沒了；新人不知道從哪看起、該問誰', '<b>做法</b>：Agent 把經驗寫成<b>互動簡報</b>：一頁講一個概念，放不下的長說明接在後面的深入頁；每次修改都經過檢查和維護者審核', '新人從入口網站的全景圖開始看簡報，看不懂就問 Agent，答案一定附出處', '簡報沒寫的問題變成 issue，回到老手手上']],
    ['好處', ['老手<b>用說的</b>就能留下經驗：研究、整理、訪談三種方式', '新人自己查、自己學，不用一直打斷老手', '知識缺口變成<b>看得見的待辦清單</b>（issue）', '每次修改都有紀錄：誰改了什麼、為什麼改，都查得到', '同一套框架，半導體之後，CV 等新領域照同樣方式加進來']],
    ['需要什麼', ['一個 Git repo，GitHub 或 GitLab 都可以，全公司可看', '會用 Claude Code 的同仁；新人只要會跟 Agent 說話', '每個知識庫至少一位<b>維護者</b>，負責審核內容', '不用架伺服器：建置只要 Python；入口網站是一個壓縮檔，每份簡報是單一 HTML，離線就能開']],
    ['風險與對策', ['<b>Agent 可能說錯</b> → 研究來的內容標來歷，經過讀者測試和維護者審核', '<b>規則太多沒人遵守</b> → 判斷得準的交給程式擋；先看到錯誤才加規則', '<b>改了規則反而變差</b> → 情境測試：改之前、改之後各跑一次比較', '<b>維護者忙，提案會等</b> → 目前不特別處理，看實際情況再調整', '<b>公司 Git 方案未定</b> → GitHub、GitLab 都支援；沒有主機時退回手動模式']],
    ['現況', ['<b>已完成</b>：入口網站、半導體 90 頁簡報和 28 頁深入頁、五個流程、電腦視覺的簡報骨架、情境測試（20 個變更提案）', '<b>只留簡報</b>：拿掉手冊，長說明做成深入頁；入口網站有全景圖、速覽、先修、主題索引（ADR-0007）', '<b>之後</b>：44 頁補出處、有真的角色再寫角色路徑、Edge 實測、電腦視覺補內容', '需要的支持：確定 Git 主機和帳號、指定各知識庫的維護者']]
  ];
  A({
    id: 'summary', part: 1, minutes: 3, short: '總覽：給主管的一頁說明',
    title: '總覽：給主管的一頁說明', en: 'Executive Summary',
    thesis: '讓老手的經驗<b>留得下來</b>、新人<b>學得起來</b>；增刪修改都跟 Agent 說，Git 主機把每一步記下來。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('sm-cv', '整個框架怎麼運作', '四條流程，按「下一步」逐一看')}
        ${U.stepperHTML('sm-st')}</div>
      <div class="col">
        <div class="controls">${U.seg('sm-tab', TABS.map(t => t[0]), 0)}</div>
        <div class="card" style="background:#fff;flex:1;min-height:0;padding:14px 18px"><ul class="points" id="sm-body" style="gap:12px"></ul></div>
        <div class="fact"><div class="v">20 個提案</div><div class="d">已合併：入口網站、半導體簡報、電腦視覺骨架、情境測試</div></div>
        <div class="analogy"><div class="ic">${U.icon('stack')}</div><div><h4>比喻</h4><p>像一座會自己長大的圖書館：老手捐書、館員審書、新人借書，借不到的書自動登記採購。</p></div></div>
      </div></div>`,
    init(el, ctx) {
      U.onSeg(el, 'sm-tab', i => { U.$(el, '#sm-body').innerHTML = TABS[i][1].map(x => `<li style="font-size:18px">${x}</li>`).join(''); });
      const { c, w, h } = U.canvas(U.$(el, '#sm-cv'));
      const sx = w / 840, sy = h / 460;
      const P = k => Array.isArray(k) ? [k[0] * sx, k[1] * sy] : [NODES[k][0] * sx, NODES[k][1] * sy];
      const segs = f => f.path.map(([a, b]) => [P(a), P(b)]);
      const lenOf = ss => ss.reduce((s, [a, b]) => s + Math.hypot(b[0] - a[0], b[1] - a[1]), 0);
      const at = (ss, u) => { let L = lenOf(ss) * u; for (const [a, b] of ss) { const l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L <= l) return [U.lerp(a[0], b[0], L / l), U.lerp(a[1], b[1], L / l)]; L -= l; } const z = ss[ss.length - 1][1]; return z; };
      let cur = 0; // 0＝全貌，1..4＝各流程
      const steps = [{ t: '全貌', d: '四條流程同時在轉：寫進去、發出去、學出來、問回來。' }].concat(FLOWS.map(f => ({ t: f.t, d: f.d })));
      U.stepper(el, 'sm-st', steps, i => cur = i, ctx, { interval: 3000 });
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        // Git 主機框
        const g0 = P([500, 34]), g1 = P([660, 420]);
        c.fillStyle = '#f2f5f8'; c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5; U.rrect(c, g0[0], g0[1], g1[0] - g0[0], g1[1] - g0[1], 10); c.fill(); c.stroke();
        U.txt(c, 'Git 主機（一個 repo）', g0[0] + 6, g0[1] - 8, { size: 13.5, w: 700, color: '#3e4b5b' });
        // 線
        FLOWS.forEach((f, k) => {
          const on = cur === 0 || cur === k + 1;
          c.strokeStyle = on ? f.col : '#d3dbe4'; c.lineWidth = cur === k + 1 ? 3.5 : 2; c.globalAlpha = on ? (cur === 0 ? .55 : 1) : .6;
          segs(f).concat((f.side || []).map(([a, b]) => [P(a), P(b)])).forEach(([a, b]) => { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); });
          c.globalAlpha = 1;
        });
        // 粒子
        FLOWS.forEach((f, k) => {
          if (!(cur === 0 || cur === k + 1)) return;
          const ss = segs(f), n = cur === 0 ? 3 : 6;
          for (let j = 0; j < n; j++) { const p = at(ss, (t * .12 + j / n) % 1); U.dot(c, p[0], p[1], cur === 0 ? 4 : 5.5, f.col); }
        });
        // 節點
        const act = cur ? FLOWS[cur - 1].nodes : null;
        Object.entries(NODES).forEach(([k, [x, y, t1, t2, col, bw]]) => {
          const [px, py] = P(k), W = bw * sx, H = 50, on = !act || act.includes(k);
          c.fillStyle = '#fff'; U.rrect(c, px - W / 2, py - H / 2, W, H, 8); c.fill();
          if (act && on) { c.fillStyle = col + '1a'; U.rrect(c, px - W / 2, py - H / 2, W, H, 8); c.fill(); }
          c.globalAlpha = on ? 1 : .35;
          c.strokeStyle = col; c.lineWidth = act && on ? 2.5 : 1.5;
          U.rrect(c, px - W / 2, py - H / 2, W, H, 8); c.stroke();
          U.txt(c, t1, px, py - 2, { align: 'center', size: 16, w: 700, color: '#17202b' });
          U.txt(c, t2, px, py + 16, { align: 'center', size: 12.5, color: '#6a7888' });
          c.globalAlpha = 1;
        });
        // 線上的說明（只在單一流程時顯示）
        if (cur) FLOWS[cur - 1].labels.forEach(([a, b, s]) => { const pa = P(a), pb = P(b); U.txt(c, s, (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 - 8, { align: 'center', size: 14, w: 700, color: FLOWS[cur - 1].col, bg: 'rgba(255,255,255,.95)' }); });
        if (!cur) U.txt(c, '框架維護者管規則、引擎和新知識庫；維護者管各知識庫的內容', w / 2, h - 6, { align: 'center', size: 13, color: '#6a7888' });
      });
    },
    notes: `這一頁是給主管的總覽，先把整件事一次講完，後面各頁再展開細節。我們要解決的問題是：經驗只在老手的腦袋、個人筆記和舊簡報裡，人一調走就沒了，新人也不知道從哪裡看起、該問誰。做法是讓 Agent 把經驗寫成互動簡報，一頁講一個概念，放不下的長說明接在後面的深入頁；每一次修改都經過檢查和維護者審核，全部記在一個 Git repo 裡。新人從入口網站開始，先看全景圖和每章的速覽。

左邊的圖有四條流程，按「下一步」逐一看。寫進去：老手用說的，Agent 做成簡報頁、開變更提案，維護者核准後併入正式內容。發出去：CI 自動建置簡報、和入口網站一起打包，新人下載解開就能看。學出來：新人看不懂就問 Agent，答案根據簡報、一定附出處頁。問回來：簡報沒寫的問題變成 issue，回到老手手上，答完自動關閉。

右邊分頁說明好處、需要什麼、風險和現況。需要的資源很少：一個 Git repo、會用 Claude Code 的同仁、每個知識庫一位維護者，不用架伺服器。

現況：20 個變更提案已經合併，入口網站、半導體 90 頁簡報和 28 頁深入頁、電腦視覺的簡報骨架、情境測試都在正式內容上。10-26 起拿掉手冊，只留簡報。之後是慢慢補的工作，例如 44 頁補出處。需要的支持是確定 Git 主機和帳號，以及指定各知識庫的維護者。`
  });
  /* 放到第 4 頁：「知識只在人腦袋裡」之後 */
  Deck.move('summary', 'why');
})();
