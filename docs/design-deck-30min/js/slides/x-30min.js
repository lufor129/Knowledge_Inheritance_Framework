/* 主管報告版（30 分鐘：20 分鐘報告＋10 分鐘討論）
   前面載入的原頁照舊註冊；這個檔案在最後載入，負責：
   1. 兩頁合成一頁（上方分頁切換，兩頁的互動元件都保留）
   2. 新增三頁：真實畫面、試點計畫、需要您決定的事
   3. 重排頁序：主頁約 20 分鐘，其餘放進附錄（不計時，Q&A 時跳過去） */
(function () {
  const A = Deck.add.bind(Deck);
  const ORIG = Object.assign({}, Deck.PARTS);
  const NEW = { 0: '開場', 1: '問題與做法', 2: '怎麼運作', 3: '成果', 4: '推行與決策', 8: '附錄' };
  Object.keys(Deck.PARTS).forEach(k => delete Deck.PARTS[k]);
  Object.assign(Deck.PARTS, NEW);

  const get = id => Deck.slides.find(s => s.id === id);
  const take = id => { const i = Deck.slides.findIndex(s => s.id === id); return i < 0 ? null : Deck.slides.splice(i, 1)[0]; };
  Deck.slides.forEach(s => { s.chap = 0; }); // 原本的章節列會跳到已合併的頁，一律關掉

  /* ---------- 兩頁合成一頁 ---------- */
  function merge(o) {
    const subs = o.parts.map(([id]) => take(id));
    A({
      id: o.id, part: o.part, raw: true, cls: 'merged', minutes: o.minutes, short: o.short, title: o.title,
      render: i => `${U.seg('mt-' + o.id, o.parts.map(([, l], k) => `${'①②'[k]} ${l}`), 0).replace('class="seg"', 'class="seg mtabs"')}
        ${subs.map((s, k) => {
          const v = Object.assign({}, s, { part: o.part, eyebrow: `${NEW[o.part]} · ${o.short}　${k + 1}/${subs.length}` });
          return `<div class="slide mlayer ${s.cls || ''}" data-k="${k}"${k ? ' style="visibility:hidden"' : ''}>${s.raw ? s.render(i) : Deck.head(v, i) + s.render(i) + Deck.foot(s)}</div>`;
        }).join('')}`,
      init(el, ctx) {
        const layers = U.$$(el, '.mlayer');
        subs.forEach((s, k) => { if (s.init) { try { s.init(layers[k], ctx); } catch (e) { console.error('init error in', s.id, e); } } });
        U.onSeg(el, 'mt-' + o.id, k => layers.forEach((L, j) => { L.style.visibility = j === k ? 'visible' : 'hidden'; L.style.zIndex = j === k ? 2 : 1; }));
      },
      notes: o.notes
    });
  }

  merge({
    id: 'm-users', part: 1, minutes: 2, short: '誰用、怎麼用', title: '誰用、怎麼用：每個人都只要跟 Agent 說話',
    parts: [['roles', '四種角色'], ['usecases', '實際情境']],
    notes: `右上角可以切兩個畫面。先看「四種角色」：角色看的是當下在做的事，同一個人看簡報時是新人，補內容時就是傳承者。

切到「實際情境」，今天只看兩個人就好。新人小美：第一天下載入口網站，看不懂就在簡報上按「問 Agent」；簡報沒寫的問題，Agent 幫她記成待回答。傳承者老王：開工時認領這一題，跟 Agent 用說的，Agent 做成簡報頁、送審。

重點只有一句：所有 Git 操作都由 Agent 代勞，四種角色都只要跟 Agent 說話，不用學新工具。`
  });
  merge({
    id: 'm-write', part: 2, minutes: 2, short: '知識怎麼寫進去', title: '知識怎麼寫進去：用說的，Agent 做成簡報頁',
    parts: [['modes', '三種方式'], ['pipeline', '送審流程']],
    notes: `老手留下經驗有三種方式：只給主題讓 Agent 研究、給一份舊資料讓 Agent 整理、或直接口述讓 Agent 訪談。訪談是唯一能收進「只在人腦袋裡」的知識的方式，也是這套框架最大的價值。

切到「送審流程」，按自動播放。草稿要傳承者確認，接著程式檢查、讀者測試，最後維護者核准，才會變成正式內容。所以 Agent 寫錯，不會直接傳給新人。`
  });
  merge({
    id: 'm-quality', part: 2, minutes: 2, short: '品質怎麼把關', title: '品質怎麼把關：程式擋、讀者測試、維護者審',
    parts: [['gates', '三層把關'], ['reader', '讀者測試']],
    notes: `老闆最常問的會是：Agent 說錯怎麼辦？答案是三層把關。判斷得準的交給程式擋，例如數字沒附出處；寫得清不清楚交給讀者測試；內容對不對，最後由維護者決定。點下面任一個問題，看它掉在哪一層。

切到「讀者測試」：讓一個沒有背景知識的 Agent 只讀這一章，答不出題目就要改寫。改寫前三題都答不出來，改寫後都答得出來。這等於每次修改都先找一位「新人」試讀。`
  });
  merge({
    id: 'm-learn', part: 2, minutes: 2, short: '新人怎麼學', title: '新人怎麼學：入口網站開始，看不懂就問 Agent',
    parts: [['learn', '入口網站與簡報'], ['ask', '問 Agent']],
    notes: `新人從入口網站開始：一個壓縮檔，解開就能離線看，不用裝任何東西。照學習路徑一章一章看簡報；一頁一個概念，想多知道再按「看深入」。

切到「問 Agent」：Agent 只根據簡報回答，一定附出處頁；簡報沒寫就直說，不自己編，再問要不要記成待回答。這一點很重要，新人拿到的答案都查得到來源。

下一頁看真實的畫面。`
  });
  merge({
    id: 'm-proof', part: 3, minutes: 2, short: '成果與證據', title: '成果與證據：已經在半導體實際跑過一輪',
    parts: [['status', '已完成'], ['tests', '情境測試']],
    notes: `這不是只有設計。已經合併 22 個變更提案，每一個都走完檢查和核准：半導體 90 頁主頁、28 頁深入頁、入口網站，電腦視覺也建好了 13 章的骨架。待回答、勘誤、刪除這些流程都真的走過一次。

切到「情境測試」：每次改規則，都用全新的 Agent 跑一組情境，另一個模型扮演使用者，改之前、改之後比較。目前 17 個情境、109 個檢查項全部通過，一輪花費約 8 美元；同仁要按「允許」的次數也從 174 次降到 43 次。日常用比較便宜的 Sonnet 就夠，花費大約三分之一。`
  });

  /* ---------- 新頁：真實畫面 ---------- */
  const SHOTS = [
    { t: '入口網站', img: 'assets/img/shot-portal.jpg', p: ['新人第一次打開看到的頁面', '依角色分三頁：新人、傳承者、維護者', '上面五步驟時間軸，點一站看示意動畫'], f: ['一個壓縮檔', '解開就能離線看，不用架伺服器'] },
    { t: '學習路徑', img: 'assets/img/shot-path.jpg', p: ['半導體一章一張卡片，照順序看', '卡片上標頁數、時間、先修和深入頁數量', '圈圈顯示看了多少'], f: ['15 章', '半導體知識庫的學習路徑'] },
    { t: '簡報主頁', img: 'assets/img/shot-main.jpg', p: ['一頁一個概念：左邊互動圖，右邊重點', '下方三個按鈕：旁白、看深入、問 Agent', '拖滑桿、切材料，看結果怎麼變'], f: ['90 頁', '半導體主頁，每頁都有圖'] },
    { t: '深入頁', img: 'assets/img/shot-deep.jpg', p: ['一頁放不下的長說明，接在主頁後面', '平常翻頁不經過，按「看深入」才進去', '想抓重點的人不會被拖慢'], f: ['28 頁', '從原本的手冊原文搬過來'] }
  ];
  A({
    id: 'shots', part: 3, minutes: 1.5, short: '真實畫面',
    title: '真實畫面：新人實際看到的樣子', en: 'Screenshots',
    thesis: '以下都是從 repo 直接建置出來的<b>實際畫面</b>，不是示意圖。',
    render: () => `<div class="s-body" style="grid-template-columns:66fr 34fr">
      <div class="col"><div class="controls">${U.seg('sh-seg', SHOTS.map(s => s.t), 0)}</div>
        <div class="fig grow" style="padding:8px"><div class="shotbox">${SHOTS.map((s, k) => `<img src="${s.img}" alt="${s.t}截圖" data-k="${k}"${k ? ' hidden' : ''}>`).join('')}</div></div></div>
      <div class="col"><ul class="points" id="sh-p"></ul>
        <div class="fact"><div class="v" id="sh-v"></div><div class="d" id="sh-d"></div></div>
        <div class="card key" style="margin-top:auto"><h4>現場示範</h4><p style="margin:0">時間允許的話，直接打開入口網站點一章給您看（約 1 分鐘）。</p></div></div>
    </div>`,
    init(el) {
      U.onSeg(el, 'sh-seg', i => {
        U.$$(el, '.shotbox img').forEach((m, k) => { m.hidden = k !== i; });
        U.$(el, '#sh-p').innerHTML = SHOTS[i].p.map(x => `<li>${x}</li>`).join('');
        U.$(el, '#sh-v').textContent = SHOTS[i].f[0]; U.$(el, '#sh-d').textContent = SHOTS[i].f[1];
      });
    },
    notes: `上一頁講的都是示意，這一頁是真的畫面，全部從 repo 直接建置出來。切上面四個分頁：入口網站是新人第一次打開看到的；學習路徑是半導體的 15 章，一章一張卡片；簡報主頁一頁一個概念，可以拖、可以切；深入頁是長說明，按了才進去。

【提示】如果時間夠，直接打開入口網站點一章示範，比截圖更有說服力；時間不夠就跳過。`
  });

  /* ---------- 新頁：試點計畫 ---------- */
  const WEEKS = [
    { t: '第 0 週：準備', who: '主管・框架維護者', d: '確定 Git 主機和帳號、指定維護者；把入口網站發給試點的新人和老手。', out: ['Git 帳號開好', '維護者名單', '入口網站壓縮檔發下去'] },
    { t: '第 1 週：新人上手', who: '新人', d: '2 位新人從入口網站開始看半導體簡報，看不懂就問 Agent；簡報沒寫的，記成待回答。', out: ['新人的提問紀錄', '待回答 issue 清單'] },
    { t: '第 2 週：老手補內容', who: '傳承者', d: '老手開工時問 Agent「有什麼我可以做的」，認領待回答，也從 44 頁待補清單挑幾頁補出處。', out: ['新的簡報頁（變更提案）', '補上的出處'] },
    { t: '第 3 週：審核節奏', who: '維護者', d: '維護者每週固定一段時間審變更提案；我們記下提案等多久、退回幾次，每週跑一次情境測試。', out: ['提案等待時間、退回次數', '情境測試結果'] },
    { t: '第 4 週：檢討', who: '主管・全員', d: '對照右邊的成功標準回報，決定擴大到電腦視覺，或先調整流程。', out: ['試點報告', '擴大或調整的建議'] }
  ];
  const GOALS = ['2 位新人靠入口網站和簡報上手，不必一直找老手', '傳承者回答 5 個以上待回答或勘誤', '補一批舊頁的出處（目前 44 頁待補）', '每週情境測試都通過，沒有退步'];
  A({
    id: 'pilot', part: 4, minutes: 1.5, short: '試點計畫',
    title: '試點計畫：半導體團隊，4 週', en: 'Pilot',
    thesis: '先在<b>已經有 90 頁內容</b>的半導體試，同時測「新人學」和「老手寫」；第 4 週回報。',
    render: () => `<div class="s-body">
      <div class="col">
        <div class="weeks">${WEEKS.map((w, k) => `<div class="wk" data-k="${k}"><div class="n">W${k}</div><div class="t">${w.t.split('：')[1]}</div><div class="who">${w.who}</div></div>`).join('')}</div>
        <div class="fig grow"><div class="fig-title"><span>這一週做什麼</span><span id="pl-who"></span></div><p id="pl-d" style="margin:0;font-size:26px;line-height:1.6"></p>
          <div class="pl-out"><h4>這一週的產出</h4><ul class="points" id="pl-out"></ul></div></div>
        ${U.stepperHTML('pl-st')}
      </div>
      <div class="col">
        <div class="card" style="background:#fff"><h4>成功標準（草案，可以調整）</h4><ul class="points goals">${GOALS.map(g => `<li>${g}</li>`).join('')}</ul></div>
        <div class="fact"><div class="v">4 週</div><div class="d">不用架伺服器；試點結束一樣留下可以繼續用的內容</div></div>
        <div class="analogy"><div class="ic">${U.icon('ruler')}</div><div><h4>為什麼選半導體</h4><p>內容已經有了，試點可以直接看「新人有沒有學得比較快」，不用先等內容寫出來。</p></div></div>
      </div></div>`,
    init(el, ctx) {
      const wk = U.$$(el, '.wk');
      const st = U.stepper(el, 'pl-st', WEEKS.map(w => ({ t: w.t, d: '' })), i => {
        wk.forEach((x, k) => x.className = 'wk' + (k === i ? ' on' : k < i ? ' done' : ''));
        U.$(el, '#pl-d').textContent = WEEKS[i].d; U.$(el, '#pl-out').innerHTML = WEEKS[i].out.map(x => `<li>${x}</li>`).join(''); U.$(el, '#pl-who').textContent = '誰：' + WEEKS[i].who;
      }, ctx, { interval: 2600 });
      wk.forEach((x, k) => x.onclick = () => st.show(k));
    },
    notes: `接下來想做的是半導體團隊試點 4 週。選半導體是因為內容已經有 90 頁，可以直接看新人有沒有學得比較快，同時也測老手補內容順不順。

按下一步走一遍：第 0 週準備，需要今天請您決定的三件事；第 1 週 2 位新人開始用；第 2 週老手回答新人的問題、補出處；第 3 週看維護者審核的負擔；第 4 週對照右邊的成功標準回報。

【提示】成功標準是草案，討論時可以請老闆直接調整數字。`
  });

  /* ---------- 新頁：需要您決定的事 ---------- */
  const ASKS = [
    { t: '確定 Git 主機與帳號', why: '變更提案、待回答、自動建置都放在 Git 主機上；GitHub、GitLab 都接得上。', no: '沒有主機也能先用手動模式，但新人開 issue、自動建置入口網站都要等。' },
    { t: '指定半導體知識庫的維護者', why: '內容對不對只有人看得出來；維護者核准，內容才算數。', no: '提案沒人審，老手補的內容進不了正式版。' },
    { t: '核准 4 週試點', why: '用半導體團隊實際跑一次，第 4 週用數字回報。', no: '框架做好了，但沒有真的新人和老手在用，看不出效果。' }
  ];
  A({
    id: 'decide', part: 4, minutes: 1.5, short: '需要您決定的事',
    title: '需要您決定的三件事', en: 'Decisions',
    thesis: '需要的資源很少：<b>一個 Git repo、一位維護者、4 週時間</b>；不用架伺服器。',
    render: () => `<div class="s-body" style="grid-template-columns:1fr;grid-template-rows:1fr auto">
      <div class="asks">${ASKS.map((a, k) => `<div class="ask" data-k="${k}">
        <div class="n">${'①②③'[k]}</div><h3>${a.t}</h3>
        <p><b>為什麼需要</b>${a.why}</p><p class="no"><b>不決定的話</b>${a.no}</p>
        <div class="dst">${U.seg('dc-' + k, ['討論中', '同意', '再研究'], 0)}</div></div>`).join('')}</div>
      <div class="card" style="display:flex;gap:28px;align-items:center;background:#fff">
        <h4 style="margin:0;white-space:nowrap">討論時也可以談</h4>
        <span>Claude Code 授權給試點同仁</span><span>電腦視覺什麼時候加入</span><span>公司若用 GitLab，再實測下載流程</span>
        <button type="button" class="btn" id="dc-appx" style="margin-left:auto">看附錄（細節）→</button>
      </div></div>`,
    init(el) {
      ASKS.forEach((_, k) => U.onSeg(el, 'dc-' + k, i => { U.$(el, `.ask[data-k="${k}"]`).dataset.s = i; }));
      U.$(el, '#dc-appx').onclick = () => Deck.goId('appx');
    },
    notes: `最後是今天想請您決定的三件事。第一，確定 Git 主機和帳號，GitHub 或 GitLab 都可以。第二，指定半導體知識庫的維護者，給他固定的審核時間。第三，核准 4 週試點。

需要的資源很少：不用架伺服器，一個 Git repo、一位維護者、4 週時間。

【提示】接下來 10 分鐘討論就停在這一頁。每一張卡片下面可以點「同意／再研究」，當場記下結論。問到細節時，按右下「看附錄」跳到附錄目錄。`
  });

  /* ---------- 附錄目錄＋附錄頁 ---------- */
  const APPX = [
    ['struct', '知識怎麼存'], ['canon', '主頁和深入頁'], ['refs', '修改與刪除'], ['map', '全景圖'],
    ['gitmap', '對到 Git 上'], ['review', '誰能合併'], ['issues', '待回答與勘誤'],
    ['tools', '技術選擇'], ['skills', '五個 skill'], ['extskills', '外部 skill'],
    ['plan', '把半導體搬進來'], ['newkb', '新增一個知識庫'], ['deckonly', '只留簡報的 26 件事'], ['next', '之後還可以做的事'], ['check', '自我檢查']
  ];
  A({
    id: 'appx', part: 8, minutes: 0, short: '附錄目錄',
    title: '附錄：問到細節時從這裡跳', en: 'Appendix',
    thesis: '不在 20 分鐘報告裡；點一張卡片跳過去，到了那頁按 <b>B</b> 或左上角「回到第 N 頁」回來。',
    render: () => `<div class="s-body" style="grid-template-columns:1fr"><div class="appx">${APPX.map(([id, t]) => {
      const s = get(id); return s ? `<button type="button" class="appc" data-go="${id}"><span class="p">${ORIG[s.origPart] || ''}</span><b>${t}</b><span class="q">${String(s.thesis || '').replace(/<[^>]+>/g, '')}</span></button>` : '';
    }).join('')}</div></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); },
    notes: '附錄目錄：老闆問到細節時才用。點卡片跳到那一頁，講完按 B 回來。'
  });
  APPX.forEach(([id]) => { const s = get(id); if (s) { s.origPart = s.part; s.eyebrow = `附錄 · ${ORIG[s.part] || ''}`; s.part = 8; s.minutes = 0; s.back = 'appx'; } });

  /* ---------- 保留的原頁：時間與講稿改成給主管聽的版本 ---------- */
  Object.assign(get('cover'), {
    minutes: 0.5,
    notes: `大家好，今天用 20 分鐘報告「知識傳承框架」，留 10 分鐘討論。

一句話：讓 Agent 幫忙，把老手的經驗整理成新人看得懂的互動簡報。右邊的圖就是整件事：藍點是知識，從老手出發，經過 Agent 整理、維護者核准，流到新人身上；橘點是新人的問題，回到老手手上，變成下一筆要補的知識。

左邊最下面那張卡片，是今天最後想請您決定的三件事。`
  });
  Object.assign(get('why'), {
    minutes: 1.5,
    notes: `先講為什麼。左邊預設是「沒有框架」：把時間往右拖，老手調走，他身上的知識跟著消失；筆記還在，但沒人知道哪份才對。

切到「有框架」再拖一次：知識一點一點寫進簡報，老手調走之後，新人照樣拿得到，每一版誰改了什麼都有紀錄。

【提示】數字和動畫都是示意，重點是把知識從人身上搬到有版本紀錄的地方。`
  });
  Object.assign(get('summary'), {
    part: 1, minutes: 3,
    notes: `這一頁是整件事的一頁版，後面各頁只是展開。

左邊按「下一步」看四條流程。寫進去：老手用說的，Agent 做成簡報頁、送審，維護者核准才算數。發出去：自動建置，新人下載就能離線看。學出來：看不懂就問 Agent，答案一定附出處。問回來：簡報沒寫的問題回到老手手上，答完自動結案。

右邊分頁依序點：問題與做法、好處、需要什麼、風險與對策、現況。風險這一頁可以多停一下：Agent 可能說錯，所以有三層把關，後面會講。`
  });

  /* ---------- 頁序：主頁＋附錄；議程不用 ---------- */
  take('agenda');
  const ORDER = ['cover', 'why', 'summary', 'm-users', 'm-write', 'm-quality', 'm-learn', 'shots', 'm-proof', 'pilot', 'decide', 'appx'].concat(APPX.map(a => a[0]));
  const rest = Deck.slides.filter(s => !ORDER.includes(s.id));
  if (rest.length) console.warn('沒有排進頁序的頁：', rest.map(s => s.id));
  Deck.slides.splice(0, Deck.slides.length, ...ORDER.map(get).filter(Boolean), ...rest);
})();
