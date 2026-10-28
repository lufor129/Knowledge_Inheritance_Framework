/* 主管報告版（30 分鐘：20 分鐘報告＋10 分鐘討論）
   前面載入的原頁照舊註冊；這個檔案在最後載入，負責：
   1. 兩頁合成一頁（上方分頁切換，兩頁的互動元件都保留）
   2. 新增三頁：真實畫面、試點計畫、需要您決定的事
   3. 重排頁序：主頁約 20 分鐘，其餘放進附錄（不計時，Q&A 時跳過去） */
(function () {
  const A = Deck.add.bind(Deck);
  const ORIG = Object.assign({}, Deck.PARTS);
  const NEW = { 0: '開場', 1: '問題與做法', 2: '怎麼運作', 3: '成果', 4: '下一步', 8: '附錄' };
  Object.keys(Deck.PARTS).forEach(k => delete Deck.PARTS[k]);
  Object.assign(Deck.PARTS, NEW);

  const get = id => Deck.slides.find(s => s.id === id);
  const take = id => { const i = Deck.slides.findIndex(s => s.id === id); return i < 0 ? null : Deck.slides.splice(i, 1)[0]; };
  Deck.slides.forEach(s => { s.chap = 0; }); // 原本的章節列會跳到已合併的頁，一律關掉

  /* ---------- 兩頁合成一頁 ---------- */
  function merge(o) {
    const subs = o.parts.map(([id]) => take(id));
    const self = {
      id: o.id, part: o.part, raw: true, cls: 'merged', minutes: o.minutes, short: o.short, title: o.title, thesis: o.thesis,
      render: i => `${U.seg('mt-' + o.id, o.parts.map(([, l], k) => `${'①②③'[k]} ${l}`), 0).replace('class="seg"', 'class="seg mtabs"')}
        ${subs.map((s, k) => {
          const v = Object.assign({}, s, { part: o.part, eyebrow: `${self.eyebrow || NEW[self.part]} · ${o.short}　${k + 1}/${subs.length}` });
          return `<div class="slide mlayer ${s.cls || ''}" data-k="${k}"${k ? ' style="visibility:hidden"' : ''}>${s.raw ? s.render(i) : Deck.head(v, i) + s.render(i) + Deck.foot(s)}</div>`;
        }).join('')}`,
      init(el, ctx) {
        const layers = U.$$(el, '.mlayer');
        subs.forEach((s, k) => { if (s.init) { try { s.init(layers[k], ctx); } catch (e) { console.error('init error in', s.id, e); } } });
        U.onSeg(el, 'mt-' + o.id, k => layers.forEach((L, j) => { L.style.visibility = j === k ? 'visible' : 'hidden'; L.style.zIndex = j === k ? 2 : 1; }));
      },
      notes: o.notes
    };
    A(self);
  }

  /* ---------- GitHub 實際紀錄（用 GitHub API 抓下來重畫，不是截圖）----------
     來源：github.com/lufor129/Knowledge_Inheritance_Framework；時間換成台北時間。
     這些是情境測試留下的紀錄，小美、老王是測試角色。 */
  const GH_SRC = 'GitHub lufor129/Knowledge_Inheritance_Framework 的實際紀錄（情境測試；小美、老王是測試角色）';
  const KIND = { issue: 'issue', pr: '變更提案', ci: 'CI 檢查', rel: 'Release', cm: '提案上的留言' };
  const STATE = { open: '開啟中', closed: '已關閉', merged: '已合併', ok: '通過' };
  const LB = l => /^來歷/.test(l) ? 'src' : /待回答/.test(l) ? 'q' : /勘誤/.test(l) ? 'err' : /情境測試/.test(l) ? 'test' : '';
  const ghCard = r => `<div class="ghc">
    <div class="gh-top"><span class="gh-kind">${KIND[r.kind]}</span>${r.n ? `<span class="gh-num">#${r.n}</span>` : ''}${r.st ? `<span class="gh-state s-${r.st}">${STATE[r.st]}</span>` : ''}<span class="gh-time">${r.time || ''}</span></div>
    ${r.title ? `<div class="gh-title">${r.title}</div>` : ''}
    ${r.labels ? `<div class="gh-labels">${r.labels.map(l => `<span class="lb ${LB(l)}">${l}</span>`).join('')}</div>` : ''}
    ${r.lines ? `<div class="gh-body">${r.lines.map(x => `<p>${x}</p>`).join('')}</div>` : ''}
  </div>`;
  const GH = {
    i4: { kind: 'issue', n: 4, st: 'open', time: '10-25 00:10', title: '機台保養（PM）多久做一次？', labels: ['待回答', 'kb:semiconductor', '情境測試'],
      lines: ['<b>🤖 由 Agent 產生</b>', '<b>問題</b>：機台保養（PM）多久做一次？', '<b>新人當時在讀哪一章</b>：檢測量測。目前只寫到「看到異常才保養」，定期保養的週期沒寫。', '<b>誰問的</b>：小美'] },
    i5: { kind: 'issue', n: 5, st: 'closed', time: '10-25 00:12', title: 'hk2：氧化層每薄 0.2 nm，漏電是多 10 倍還是 5 倍？', labels: ['勘誤', 'kb:semiconductor', '情境測試'],
      lines: ['<b>🤖 由 Agent 產生</b>', '<b>原文</b>：牆每薄 0.2 nm，漏電大約多 10 倍。', '<b>為什麼覺得不對</b>：小美在新人訓練講義看到「約 5 倍」；而且這句沒有附出處。', '<b>修正時一起改</b>：同一個數字還出現在三個地方（已列出）'] },
    p6: { kind: 'pr', n: 6, st: 'merged', time: '10-25 00:16', title: 'semiconductor：檢測量測新增「機台保養 PM」（回答 #4）', labels: ['kb:semiconductor', '來歷:訪談', '情境測試'],
      lines: ['<b>🤖 由 Agent 產生</b>', '<b>來歷</b>：訪談：老王（製程整合）口述，一共問了一輪五題，老王確認了草稿。', '<b>影響</b>：檢查 0 個錯誤；讀者測試 32/32 題答對。讀者看不懂「均勻度」，已補上白話說明。', '<b>Closes #4</b>'] },
    p6r: { kind: 'cm', time: '10-25 00:32', lines: ['<b>🤖 由 Agent 代 老王 發出</b>', '<b>✅ 核准</b>', '大保養「一季或一年一次」也是老王口述，已補上出處註腳。'] },
    p8: { kind: 'pr', n: 8, st: 'merged', time: '10-25 00:40', title: 'semiconductor：hk2 漏電倍數補出處（修正勘誤 #5）', labels: ['kb:semiconductor', '來歷:研究'],
      lines: ['<b>🤖 由 Agent 產生</b>', '<b>改了什麼</b>：查證後「每薄 0.2 nm 漏電約多 10 倍」是對的，數字不改；補兩個出處，寫明前提（約 1 V、1–3 nm）。', '<b>來歷</b>：研究：Hu, <i>Modern Semiconductor Devices for ICs</i> §7.4；APS March Meeting 2007 N20.6', '<b>影響</b>：重看了簡報頁 hk1，說法一致；讀者測試 6/6 題答對。', '<b>Closes #5</b>'] },
    c8: { kind: 'ci', st: 'ok', time: '10-25 00:40', title: '檢查與建置 › check', lines: ['提案 #8 一開出來就自動跑，<b>5 秒</b>通過。', '沒過的話誰都不能合併。'] },
    runs: { kind: 'ci', st: 'ok', time: '最近三次', title: '檢查與建置', lines: ['✓ 提案「入口網站用圖示和互動」：9 秒', '✓ 合併進主線（#23）：12 秒', '✓ 合併進主線（#24）：13 秒，接著自動建置 Release'] },
    m8: { kind: 'pr', n: 8, st: 'merged', time: '10-25 00:40', title: 'CI 通過後合併進主線', lines: ['這筆是知識庫維護者自己開的提案，CI 通過就自己合併。', '別人的提案要等維護者核准才合併（例如提案 #6）。', '合併後，簡報的正式內容就更新了。'] },
    c5: { kind: 'issue', n: 5, st: 'closed', time: '10-25 00:40', title: 'issue #5 自動關閉', lines: ['合併後 <b>1 秒</b>，因為提案說明寫了「Closes #5」。', '從回報勘誤到修正合併，一共 <b>28 分鐘</b>。'] },
    rel: { kind: 'rel', time: '10-26 19:53', title: '入口網站與簡報 a0ac3a1', lines: ['主線更新後自動建置。新人下載 portal.zip，解開後打開 index.html。', '📦 portal.zip（2.8 MB）　📦 semiconductor-deck.html（4.7 MB）'] }
  };
  /* GitHub 分頁：左邊是紀錄卡，右邊是重點 */
  function ghTab(o) {
    A({
      id: o.id, part: o.part, minutes: 0, short: o.title, title: o.title, en: 'On GitHub', thesis: o.thesis, src: GH_SRC,
      render: () => `<div class="s-body"><div class="col ghcol">${o.cards.map(k => ghCard(GH[k])).join('')}</div>${U.side(o.side)}</div>`
    });
  }
  ghTab({ id: 'gh-write', part: 2, title: 'GitHub 上的實際紀錄：一筆訪談來的知識',
    thesis: '提案說明由 Agent 寫好：<b>來歷、檢查結果、讀者測試</b>都在上面，維護者一看就知道怎麼審。',
    cards: ['p6', 'p6r'],
    side: { points: ['<b>來歷:訪談</b> 標籤：維護者知道這是老手口述', '每則都以 <b>🤖</b> 開頭：分得出哪些是 Agent 寫的', '<b>Closes #4</b>：這筆知識是在回答新人的問題'], fact: { v: '16 分鐘', d: '從提案開出來到維護者核准、合併' } } });
  ghTab({ id: 'gh-quality', part: 2, title: 'GitHub 上的實際紀錄：研究來的內容要附真出處',
    thesis: '研究來的提案寫清楚<b>出處和查證結果</b>；每個提案 CI 都會自動檢查，<b>沒過不能合併</b>。',
    cards: ['p8', 'c8', 'runs'],
    side: { points: ['勘誤說「5 倍」，Agent <b>查證後維持 10 倍</b>，附兩個出處', '改一個數字，<b>相關的簡報頁一起重看</b>', 'CI 每次 5–13 秒，<b>每個提案都跑</b>'], fact: { v: '5 秒', d: '提案 #8 的自動檢查時間' } } });
  ghTab({ id: 'gh-learn', part: 2, title: 'GitHub 上的實際紀錄：新人的問題和下載的入口網站',
    thesis: '新人問到簡報沒寫的，Agent <b>開成 issue</b>；主線一更新，CI <b>自動打包入口網站</b>。',
    cards: ['i4', 'rel'],
    side: { points: ['新人不用懂 Git：說一句，Agent 寫好 issue', 'issue 裡寫明<b>在讀哪一章、誰問的</b>，老手好接手', '入口網站每次合併後自動建置，<b>下載就能看</b>'], fact: { v: 'portal.zip', d: '2.8 MB，離線就能打開' } } });

  /* ---------- 新頁：誰來審（審查角色） ---------- */
  const REVIEWERS = [
    { who: '程式', t: '規則檢查', what: '頁 id 撞名、引用找不到、深入頁接錯、新寫的數字沒附出處', how: '每次開提案，CI 自動跑 check.py', ex: '新頁的 id 和別頁撞名，換一個才過', fail: '擋下，Agent 照錯誤訊息修好再送' },
    { who: 'Agent', t: '程式審查', what: '互動圖的程式：會不會出錯、離線能不能播、拖到極端值還正不正常', how: '打開改過的頁，把每個按鈕、滑桿都操作一遍', ex: '滑桿拖到最底，數字變成 NaN', fail: '退回，修好互動圖再送' },
    { who: 'Agent', t: '事實查核', what: '每個說法對照出處：出處有沒有真的這樣寫、數字和單位對不對', how: '一句一句找出處原文，對不上的標出來', ex: '「每薄 0.2 nm，漏電多 10 倍」要找得到支持這個數字的出處（勘誤 #5）', fail: '補出處或改說法；找不到出處就不寫' },
    { who: 'Agent', t: '外行讀者', what: '沒有背景知識的人只讀這一章，看不看得懂', how: '只給這一章的文字，回答章末的自我檢查', ex: 'EOT 沒解釋，三題都答不出來', fail: '改寫成白話，再測一次' },
    { who: 'Agent', t: '故事流暢', what: '整章的順序、前後頁的銜接、一頁一個概念、有沒有跳步', how: '從頭到尾順讀一遍，標出卡住的地方', ex: '「功函數」先用了，下一頁才解釋', fail: '調整頁序，或補一句銜接' },
    { who: 'Agent', t: '審核助理', what: '把上面的結果和研究來的說法，整理成維護者看得懂的白話', how: '列出改了哪幾頁，研究來的說法逐條附出處', ex: '維護者一頁看完要注意的地方', fail: '—' },
    { who: '人', t: '維護者', what: '最後決定核准或退回', how: '看審核助理的整理，打開改過的頁', ex: '內容對不對，只有人能負責', fail: '退回附逐條意見，傳承者照著改' }
  ];
  A({
    id: 'reviewers', part: 2, minutes: 0, short: '誰來審',
    title: '誰來審：五個角色一起把關，維護者最後決定', en: 'Reviewers',
    thesis: '機器審得準的交給 <b>Agent</b>：程式、事實、看不看得懂、順不順；內容對不對由<b>人</b>決定。',
    render: () => `<div class="s-body">
      <div class="col">
        <div class="flow7"><div class="fz">草稿</div>${REVIEWERS.map((r, k) => `<div class="fs${k === 6 ? ' human' : ''}" data-k="${k}"><div class="who">${r.who}</div><div class="t">${r.t}</div></div>`).join('')}</div>
        <div class="fig grow rvstage"><div class="fig-title"><span id="rv-n"></span><span id="rv-who"></span></div>
          <dl class="rv"><dt>審什麼</dt><dd id="rv-what"></dd><dt>怎麼審</dt><dd id="rv-how"></dd><dt>擋下的例子</dt><dd id="rv-ex" class="ex"></dd><dt>沒過怎麼辦</dt><dd id="rv-fail"></dd></dl></div>
        ${U.stepperHTML('rv-st')}
      </div>
      ${U.side({ points: ['五個審查角色<b>同時審</b>，不用排隊', '審核助理把結果整理成白話給維護者', '<b>維護者核准</b>，才會變成正式內容'], fact: { v: '5 個', d: '審查角色：規則、程式、事實、讀者、故事' }, analogy: { icon: 'stack', t: '比喻', p: '像出版社：校對、事實查核、試讀、編輯各看一遍，最後總編輯決定出不出。' } })}
    </div>`,
    init(el, ctx) {
      const fs = U.$$(el, '.fs');
      const st = U.stepper(el, 'rv-st', REVIEWERS.map(r => ({ t: r.t, d: '' })), i => {
        const r = REVIEWERS[i];
        fs.forEach((x, k) => x.classList.toggle('on', k === i));
        U.$(el, '#rv-n').textContent = `${i + 1} / ${REVIEWERS.length}　${r.t}`;
        U.$(el, '#rv-who').textContent = r.who === '人' ? '人' : r.who === '程式' ? '程式（不是 Agent）' : 'Agent';
        ['what', 'how', 'ex', 'fail'].forEach(f => { U.$(el, '#rv-' + f).textContent = r[f]; });
      }, ctx, { interval: 2800 });
      fs.forEach((x, k) => x.onclick = () => st.show(k));
    }
  });

  merge({
    id: 'm-users', part: 1, minutes: 2, short: '誰用、怎麼用', title: '誰用、怎麼用：每個人都只要跟 Agent 說話',
    parts: [['roles', '四種角色'], ['usecases', '實際情境']],
    notes: `右上角可以切兩個畫面。先看「四種角色」：角色看的是當下在做的事，同一個人看簡報時是新人，補內容時就是傳承者。

切到「實際情境」，今天只看兩個人就好。新人小美：第一天下載入口網站，看不懂就在簡報上按「問 Agent」；簡報沒寫的問題，Agent 幫她記成待回答。傳承者老王：開工時認領這一題，跟 Agent 用說的，Agent 做成簡報頁、送審。

重點只有一句：所有 Git 操作都由 Agent 代勞，四種角色都只要跟 Agent 說話，不用學新工具。`
  });
  merge({
    id: 'm-write', part: 2, minutes: 2, short: '知識怎麼寫進去', title: '知識怎麼寫進去：用說的，Agent 做成簡報頁',
    parts: [['modes', '三種方式'], ['reviewers', '誰來審'], ['gh-write', 'GitHub 實際紀錄']],
    notes: `老手留下經驗有三種方式：只給主題讓 Agent 研究、給一份舊資料讓 Agent 整理、或直接口述讓 Agent 訪談。訪談是唯一能收進「只在人腦袋裡」的知識的方式，也是這套框架最大的價值。

切到「誰來審」，按自動播放。草稿送出去之後，五個角色同時審：規則檢查是程式，擋格式和沒附出處的數字；程式審查看互動圖會不會壞；事實查核一句一句對出處；外行讀者看不看得懂；故事流暢看整章順不順。審核助理把結果整理成白話，最後由維護者決定核准或退回。所以 Agent 寫錯，不會直接傳給新人。

切到「GitHub 實際紀錄」：這是情境測試時真的開在 GitHub 上的提案 #6。標籤寫著「來歷:訪談」，說明裡有檢查結果和讀者測試 32/32；下面是代老王發出的「✅ 核准」。每一則都以 🤖 開頭，分得出哪些是 Agent 寫的。從開提案到合併 16 分鐘。

【提示】目前實際在跑的是規則檢查、外行讀者、審核助理和維護者；程式審查、事實查核、故事流暢三個角色是設計，還沒實作。被問到時照實說，可以接到第 9 頁的驗證計畫。`
  });
  merge({
    id: 'm-quality', part: 2, minutes: 2, short: '品質怎麼把關', title: '品質怎麼把關：程式擋、讀者測試、維護者審',
    parts: [['gates', '三層把關'], ['reader', '讀者測試'], ['gh-quality', 'GitHub 實際紀錄']],
    notes: `老闆最常問的會是：Agent 說錯怎麼辦？答案是三層把關。判斷得準的交給程式擋，例如數字沒附出處；寫得清不清楚交給讀者測試；內容對不對，最後由維護者決定。點下面任一個問題，看它掉在哪一層。

切到「讀者測試」：讓一個沒有背景知識的 Agent 只讀這一章，答不出題目就要改寫。改寫前三題都答不出來，改寫後都答得出來。這等於每次修改都先找一位「新人」試讀。

切到「GitHub 實際紀錄」：新人回報「漏電是 10 倍還是 5 倍」，Agent 查證後維持 10 倍、補了兩個真的出處，說明寫得清清楚楚。中間是 CI：提案一開就自動檢查，5 秒通過，沒過誰都不能合併。`
  });
  merge({
    id: 'm-learn', part: 2, minutes: 2, short: '新人怎麼學', title: '新人怎麼學：入口網站開始，看不懂就問 Agent',
    parts: [['learn', '入口網站與簡報'], ['ask', '問 Agent'], ['gh-learn', 'GitHub 實際紀錄']],
    notes: `新人從入口網站開始：一個壓縮檔，解開就能離線看，不用裝任何東西。照學習路徑一章一章看簡報；一頁一個概念，想多知道再按「看深入」。

切到「問 Agent」：Agent 只根據簡報回答，一定附出處頁；簡報沒寫就直說，不自己編，再問要不要記成待回答。這一點很重要，新人拿到的答案都查得到來源。

切到「GitHub 實際紀錄」：左邊是新人問到簡報沒寫的事，Agent 開成的 issue #4，寫明在讀哪一章、誰問的；右邊是主線一更新，CI 自動打包好的入口網站，新人下載解開就能看。

下一頁看真實的畫面，和一筆勘誤在 GitHub 上從頭到尾走一次。`
  });
  merge({
    id: 'm-proof', part: 3, minutes: 2, short: '成果與證據', title: '成果與證據：已經在半導體實際跑過一輪',
    thesis: '22 個變更提案都走完檢查和核准；情境測試 17 個情境、109 項全部通過。',
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
    id: 'shots', part: 3, minutes: 0, short: '真實畫面',
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

  /* ---------- 新頁：一筆勘誤在 GitHub 上走一次 ---------- */
  const FLOW = [
    { k: 'i5', who: '新人', t: '回報勘誤', d: '小美覺得數字不對，跟 Agent 說一聲，Agent 寫好 issue #5。' },
    { k: 'p8', who: 'Agent', t: '查證、開提案', d: 'Agent 查證後維持原本的數字、補上兩個出處，開提案 #8，說明寫「Closes #5」。' },
    { k: 'c8', who: 'CI', t: '自動檢查', d: '提案一開出來 CI 就跑，5 秒通過。' },
    { k: 'm8', who: '維護者', t: '合併', d: '維護者自己的提案，CI 通過就合併；別人的提案要先經維護者核准。' },
    { k: 'c5', who: 'GitHub', t: 'issue 自動關閉', d: '合併後 1 秒，issue #5 自動關閉。從回報到修好合併，一共 28 分鐘。' },
    { k: 'rel', who: 'CI', t: '自動打包', d: '主線一更新，CI 自動建置入口網站和簡報，新人下載新版就看得到。（圖是最近一次的 Release）' }
  ];
  A({
    id: 'ghflow', part: 3, minutes: 0, short: '一筆勘誤在 GitHub 上走一次',
    title: '一筆勘誤在 GitHub 上走一次', en: 'On GitHub', src: GH_SRC,
    thesis: '新人說一句「好像寫錯了」，到修好、上線，<b>每一步都留在 GitHub 上</b>；人只要說話和核准。',
    render: () => `<div class="s-body">
      <div class="col">
        <div class="flow6">${FLOW.map((f, k) => `<div class="fs" data-k="${k}"><div class="who">${f.who}</div><div class="t">${k + 1}. ${f.t}</div></div>`).join('')}</div>
        <div class="fig grow ghstage" id="gf-card"></div>
        ${U.stepperHTML('gf-st')}
      </div>
      ${U.side({ points: ['<b>人</b>只做兩件事：說哪裡不對、決定合併', '<b>Agent</b> 寫 issue、查證、開提案', '<b>CI</b> 檢查、打包；<b>GitHub</b> 自動關 issue'], fact: { v: '28 分鐘', d: '從回報勘誤到修正合併（情境測試的實際紀錄）' } })}
    </div>`,
    init(el, ctx) {
      const fs = U.$$(el, '.fs');
      const st = U.stepper(el, 'gf-st', FLOW.map(f => ({ t: `${f.who}：${f.t}`, d: f.d })), i => {
        fs.forEach((x, k) => x.className = 'fs' + (k === i ? ' on' : k < i ? ' done' : ''));
        U.$(el, '#gf-card').innerHTML = ghCard(GH[FLOW[i].k]);
      }, ctx, { interval: 2800 });
      fs.forEach((x, k) => x.onclick = () => st.show(k));
    }
  });
  merge({
    id: 'm-shots', part: 3, minutes: 2.5, short: '真實畫面', title: '真實畫面：新人看到的，和 GitHub 上的紀錄',
    parts: [['shots', '新人看到的'], ['ghflow', 'GitHub 上走一次']],
    notes: `前面講的多是示意，這一頁是真的。先看「新人看到的」，四張都是從 repo 直接建置出來的畫面：入口網站、學習路徑、簡報主頁、深入頁。

切到「GitHub 上走一次」，按自動播放：新人說一句「好像寫錯了」，Agent 寫好 issue；Agent 查證、開提案；CI 5 秒檢查通過；合併；issue 1 秒後自動關閉；CI 自動打包新版入口網站。從回報到修好 28 分鐘，人只做了兩件事：說哪裡不對、決定合併。這筆是維護者自己的提案，所以 CI 過了就合併；別人的提案要等維護者核准，像前面看過的提案 #6。

【提示】這些是情境測試時真的開在 GitHub 上的紀錄，小美和老王是測試角色。時間夠的話，可以直接打開入口網站點一章示範。`
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

  /* ---------- 新頁：上線前要驗證的三件事 ---------- */
  const TODO = [
    { t: '公司 GitLab 能不能全自動',
      what: '自動檢查和建置、機器人審核留言、Agent 用 glab 開 MR 和 issue',
      how: '把現在的 GitHub CI 改寫成 .gitlab-ci.yml，設定切到 GitLab，再把「勘誤 → MR → 合併 → issue 關閉」走一次',
      pass: '開 issue、開 MR、CI、機器人留言、合併後 issue 關閉，五步都不用人手動',
      need: 'GitLab 專案、Runner、bot 帳號' },
    { t: '地端模型做的簡報夠不夠好',
      what: '換成公司 on-prem 模型之後，新增和修改簡報頁的品質',
      how: '跑同一組 17 個情境、109 個檢查項，和 Claude（目前全部通過）比較；再請維護者抽查幾頁',
      pass: '（草案）情境測試的通過率接近 Claude，抽查的頁維護者願意核准',
      need: '模型端點，和能接地端模型的 Agent 工具' },
    { t: '同仁用起來順不順手',
      what: '新人和老手實際用的時候，卡在哪裡',
      how: '2 位新人看一章、問 3 題；1 位老手用口述補一頁。旁邊記下卡住的地方和要按「允許」的次數',
      pass: '（草案）不用教就能做完，事後問卷說願意繼續用',
      need: '2–3 位同仁，每人約 1 小時' }
  ];
  A({
    id: 'todo', part: 4, minutes: 2.5, short: '上線前要驗證的三件事',
    title: '上線前要驗證的三件事', en: 'To-do',
    thesis: '框架在 GitHub＋Claude 上已經跑通；換到<b>公司環境</b>之前，先驗證這三件事。',
    render: () => `<div class="s-body" style="grid-template-columns:1fr;grid-template-rows:1fr auto">
      <div class="todos">${TODO.map((x, k) => `<div class="todo" data-k="${k}">
        <div class="th"><span class="n">${'①②③'[k]}</span><h3>${x.t}</h3></div>
        <dl><dt>驗證什麼</dt><dd>${x.what}</dd><dt>怎麼測</dt><dd>${x.how}</dd><dt>怎樣算通過</dt><dd>${x.pass}</dd><dt>需要公司提供</dt><dd class="need">${x.need}</dd></dl>
        <div class="dst">${U.seg('td-' + k, ['未開始', '進行中', '通過'], 0)}</div></div>`).join('')}</div>
      <div class="card" style="display:flex;gap:24px;align-items:center;background:#fff">
        <h4 style="margin:0;white-space:nowrap">需要公司提供的</h4>
        <span>GitLab 專案、Runner、bot 帳號</span><span>地端模型端點</span><span>2–3 位試用同仁</span>
        <button type="button" class="btn" id="td-appx" style="margin-left:auto">看附錄（細節）→</button>
      </div></div>`,
    init(el) {
      TODO.forEach((_, k) => U.onSeg(el, 'td-' + k, i => { U.$(el, `.todo[data-k="${k}"]`).dataset.s = i; }));
      U.$(el, '#td-appx').onclick = () => Deck.goId('appx');
    },
    notes: `前面看到的都在 GitHub 和 Claude 上跑通了。要在公司裡用，還有三件事要先驗證，每一張卡都寫了驗證什麼、怎麼測、怎樣算通過，和需要公司提供什麼。

第一，公司的 GitLab 能不能做到一樣的自動化：自動檢查、機器人審核、Agent 開 MR 和 issue。框架當初就只用 GitHub 和 GitLab 都有的功能，指令對照也寫好了，主要是 CI 要改寫、要一個 bot 帳號。

第二，換成地端模型，做出來的簡報品質夠不夠。我們有現成的尺：同一組 17 個情境、109 個檢查項，Claude 目前全部通過，地端模型跑同一組就能比；再請維護者抽查幾頁，看願不願意核准。

第三，同仁實際用起來順不順手：找 2 位新人、1 位老手，各給一個任務，看卡在哪裡。

【提示】接下來的討論就停在這一頁。每張卡下面可以點「進行中／通過」；通過標準標了「草案」的，可以請主管直接調整。問到細節時，按右下「看附錄」。`
  });

  /* ---------- 附錄目錄＋附錄頁 ---------- */
  const APPX = [
    ['m-proof', '成果與證據'], ['pilot', '試點計畫（舊版）'], ['decide', '需要您決定的事（舊版）'], ['pipeline', '一筆知識的旅程（七站）'],
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
      const s = get(id); return s ? `<button type="button" class="appc" data-go="${id}"><span class="p">${s.origLabel || ''}</span><b>${t}</b><span class="q">${String(s.thesis || '').replace(/<[^>]+>/g, '')}</span></button>` : '';
    }).join('')}</div></div>`,
    init(el) { U.$$(el, '[data-go]').forEach(c => c.onclick = () => Deck.goId(c.dataset.go)); },
    notes: '附錄目錄：老闆問到細節時才用。點卡片跳到那一頁，講完按 B 回來。'
  });
  APPX.forEach(([id]) => { const s = get(id); if (s) { s.origLabel = ['m-proof', 'pilot', 'decide'].includes(id) ? '前一版的主頁' : ORIG[s.part] || ''; s.eyebrow = `附錄 · ${s.origLabel}`; s.part = 8; s.minutes = 0; s.back = 'appx'; } });

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
  const ORDER = ['cover', 'why', 'summary', 'm-users', 'm-write', 'm-quality', 'm-learn', 'm-shots', 'todo', 'appx'].concat(APPX.map(a => a[0]));
  const rest = Deck.slides.filter(s => !ORDER.includes(s.id));
  if (rest.length) console.warn('沒有排進頁序的頁：', rest.map(s => s.id));
  Deck.slides.splice(0, Deck.slides.length, ...ORDER.map(get).filter(Boolean), ...rest);
})();
