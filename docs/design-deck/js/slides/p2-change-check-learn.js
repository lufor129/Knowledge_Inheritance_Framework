/* 第二部分 ③④⑤ 修改與刪除、檢查與審核、新人怎麼學 */
(function () {
  const A = Deck.add.bind(Deck);
  const C3 = { chap: 3, eyebrow: '第二部分 · ③ 修改與刪除' };
  const C4 = { chap: 4, eyebrow: '第二部分 · ④ 檢查與審核' };
  const C5 = { chap: 5, eyebrow: '第二部分 · ⑤ 新人怎麼學' };

  /* ③ 引用：改一節、刪一節會牽動哪些地方 */
  const SECS = [{ id: 'litho6', t: 'OPC 光學鄰近校正', ch: '微影' }, { id: 'hk1', t: '閘極絕緣層', ch: '閘極' }, { id: 'ocd', t: 'OCD 光學量測', ch: '檢測量測' }, { id: 'tem', t: 'TEM 電子顯微鏡', ch: '檢測量測' }, { id: 'wat', t: 'WAT 電性測試', ch: '檢測量測' }];
  const PAGES = [{ id: 'litho6', s: ['litho6'] }, { id: 'hk1', s: ['hk1'] }, { id: 'tem', s: ['tem'] }, { id: 'ocd', s: ['ocd'] }, { id: 'ocdf', s: ['ocd'] }, { id: 'ocdb', s: ['ocd', 'tem'] }, { id: 'wat', s: ['wat'] }];
  const FAQS = [{ q: '電晶體會壞嗎？可以用多久？', s: ['hk1', 'wat'] }, { q: 'OCD 量到的就是真的尺寸嗎？', s: ['ocd', 'tem'] }, { q: 'OPC 是什麼？跟光罩有什麼關係？', s: ['litho6'] }];
  A(Object.assign({
    id: 'refs', part: 2, minutes: 2, short: '修改與刪除',
    title: '修改與刪除：引用在同一個提案裡一起改', en: 'Edit & Remove',
    thesis: 'Agent 列出所有<b>引用</b>，在<b>同一個變更提案</b>裡處理完，不留舊 id。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('rf-act', ['修改', '刪除'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>點一個小節</span><span></span></div>
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.25fr 1fr 1.15fr;gap:14px">
            <div class="rcol"><h4>手冊的小節</h4><div class="ritems" id="rf-secs"></div></div>
            <div class="rcol"><h4>簡報頁（頁序）</h4><div class="ritems" id="rf-pages"></div></div>
            <div class="rcol"><h4>常見問題</h4><div class="ritems" id="rf-faqs"></div></div>
          </div>
          <div class="card" id="rf-res" style="font-size:18px"></div></div></div>
      ${U.side({
        points: ['<b>修改</b>：另一邊（簡報頁或小節）、常見問題、自我檢查一起確認', '<b>刪除、合併</b>：所有引用在同一個提案裡改掉', '刪掉的內容，Git 歷史找得回來'],
        fact: { v: '0 個舊 id', d: '全部在同一個 repo，引用都看得到，直接改掉' },
        analogy: { icon: 'gate', t: '比喻', p: '像搬家改地址：把所有會寄信給你的人都通知一遍，舊地址就不用留了。' }
      })}</div>`,
    init(el) {
      let act = 0, picked = 'ocd';
      const render = () => {
        U.$(el, '#rf-secs').innerHTML = SECS.map(s => `<button type="button" class="ritem click ${s.id === picked ? 'sel' : ''}" data-id="${s.id}">${s.t}<span class="ids">${s.ch} › ${s.id}</span></button>`).join('');
        const hc = act ? 'ritem hit del' : 'ritem hit';
        const hp = PAGES.filter(p => p.s.includes(picked)), hf = FAQS.filter(f => f.s.includes(picked));
        U.$(el, '#rf-pages').innerHTML = PAGES.map(p => `<div class="${p.s.includes(picked) ? hc : 'ritem'}">${p.id}<span class="ids">→ ${p.s.join(', ')}</span></div>`).join('');
        U.$(el, '#rf-faqs').innerHTML = FAQS.map(f => `<div class="${f.s.includes(picked) ? hc : 'ritem'}">${f.q}<span class="ids">相關：${f.s.join('、')}</span></div>`).join('');
        const s = SECS.find(x => x.id === picked), list = hp.map(p => p.id).join('、') || '無', shared = hp.filter(p => p.s.length > 1).map(p => p.id);
        U.$(el, '#rf-res').innerHTML = !act
          ? `<b>修改「${s.t}」</b>：${hp.length} 頁簡報要重看（${list}），${hf.length} 題常見問題的答案也一起確認，都在同一個提案裡。`
          : `<b>刪除「${s.t}」</b>：${hp.length} 頁簡報（${list}）和 ${hf.length} 題常見問題，在同一個提案裡改指向、一起刪掉，或合併。${shared.length ? `其中 ${shared.join('、')} 還對應其他小節，拿掉這個對應就好。` : ''}`;
        U.$$(el, '#rf-secs [data-id]').forEach(b => b.onclick = () => { picked = b.dataset.id; render(); });
      };
      U.onSeg(el, 'rf-act', i => { act = i; render(); });
    },
    notes: `第三章，修改和刪除。先選動作，再點左邊一個小節。修改 ocd 時，對應的三頁簡報要重看，指向它的常見問題也要確認。

切到「刪除」：Agent 先列出所有引用，包括簡報頁、常見問題、自我檢查、頁碼引用和別的知識庫，在同一個提案裡改指向、一起刪或合併。簡報頁也一樣：頁 id 建立後不改名，刪掉時所有指向它的地方一起改。因為全在同一個 repo，引用都看得到，所以不留舊 id。刪掉的內容，Git 歷史隨時找得回來。`
  }, C3));

  /* ④ 誰把關：丟一個問題進篩子，看它在哪一層被抓到 */
  const LAY = [['程式擋', '本機每次修改＋CI；沒過不能合併', '#b3261e', '負責：傳承者照錯誤修正（Agent 代勞）'], ['程式提醒', '判斷不準，只提醒、不擋', '#a8660a', '負責：維護者決定補出處或拿掉'], ['讀者測試', 'Agent 看寫得清不清楚', '#1f4fb5', '負責：傳承者改寫到答得出來'], ['維護者審核', '人決定內容對不對', '#1f7a4d', '負責：維護者核准或要求修改']];
  const PB = [
    { n: 'id 重複', stop: 0, msg: '<b>程式擋下</b>：小節 id 不能重複。Agent 換一個 id 再跑一次檢查。' },
    { n: '引用找不到', stop: 0, msg: '<b>程式擋下</b>：常見問題指向的小節不存在。Agent 修正引用。' },
    { n: '一邊改了沒跟上', stop: 0, msg: '<b>程式擋下</b>：頁序裡的指紋對不上。簡報頁改了點名小節，小節改了點名簡報頁，對照好再更新指紋。' },
    { n: '新頁的數字沒出處', stop: 0, msg: '<b>程式擋下</b>：這次新增或改過的簡報頁，數字一定要附出處；補出處，或改成不帶數字的說法。' },
    { n: '舊頁的數字沒出處', stop: 3, flag: true, msg: '<b>程式提醒、不擋</b>：搬進來的舊頁和手冊裡沒附出處的數字只提醒；舊頁用 index.py --todo 列出來（半導體現在 22 頁），傳承者慢慢補。到了<b>維護者審核</b>，決定補出處還是拿掉。' },
    { n: '寫得太難懂', stop: 2, msg: '<b>讀者測試抓到</b>：沒有背景的 Agent 答不出這章的常見問題，回去改寫。' },
    { n: '內容說錯了', stop: 3, msg: '<b>維護者審核抓到</b>：內容對不對，最後由人判斷。退回並附上意見。' },
    { n: '小節沒有簡報頁', stop: 0, msg: '<b>程式擋下</b>：每個小節都要有簡報頁講到。在講它的那一頁後面加上對應，沒有的話做一頁。' },
    { n: '頁沒有圖', stop: 0, msg: '<b>程式擋下</b>：每一頁都要寫「圖：」，放互動圖、圖片或影片；互動圖名稱找不到也會擋。' }
  ];
  A(Object.assign({
    id: 'gates', part: 2, minutes: 2, short: '誰把關什麼',
    title: '誰把關什麼：一層一層篩，每層都有人負責', en: 'Checks',
    thesis: '<b>判斷得準的交給程式擋</b>，寫得清不清楚交給讀者測試，內容對不對由維護者決定。',
    render: () => `<div class="s-body">
      <div class="col">${U.figHTML('gt-cv', '點下面一個問題，看它在哪一層被抓到、由誰處理', '')}
        <div class="controls" id="gt-btns">${PB.map((q, i) => `<button class="btn" type="button" data-i="${i}">${q.n}</button>`).join('')}</div>
        <div class="step-text" id="gt-msg">先點一個問題。</div></div>
      ${U.side({
        points: ['<b>傳承者</b>：修正檢查擋下的錯，改寫到讀者測試通過', '<b>維護者</b>：決定沒出處的數字，判斷內容對不對', '<b>框架維護者</b>：維護檢查程式和規則', '<b>Agent</b>：自動跑檢查、做讀者測試、照錯誤修正'],
        fact: { v: '先看到錯誤', d: '才新增規則，避免規則越疊越重' },
        analogy: { icon: 'sand', t: '比喻', p: '像一疊篩子：粗的石頭第一層就擋下，細沙才流到下一層，最後由人用眼睛挑。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#gt-cv'));
      const LY = k => h * (.2 + k * .21);
      let ball = null;
      U.$$(el, '#gt-btns button').forEach(b => b.onclick = () => {
        U.$$(el, '#gt-btns button').forEach(x => x.classList.toggle('on', x === b));
        ball = { y: 14, vy: 0, q: PB[+b.dataset.i], flagged: false, done: false };
        U.$(el, '#gt-msg').textContent = '往下掉……';
      });
      ctx.raf(dt => {
        c.clearRect(0, 0, w, h);
        const bx = w * .66, r = 16;
        LAY.forEach(([n, d, col, who], k) => {
          const y = LY(k), hit = ball && ball.done && ball.q.stop === k, fl = ball && ball.flagged && k === 1;
          c.fillStyle = hit ? col : fl ? '#e9b45a' : '#d3dbe4';
          for (let x = w * .34; x < w * .97; x += 28) c.fillRect(x, y - 4, 20, 8);
          U.txt(c, n, w * .03, y + 4, { size: 20, w: 700, color: col });
          U.txt(c, d, w * .03, y + 28, { size: 14, color: '#6a7888' });
          U.txt(c, who, w * .03, y + 50, { size: 14, w: 700, color: hit ? col : '#3e4b5b' });
        });
        if (!ball) { U.txt(c, '↓', bx, LY(0) - 40, { align: 'center', size: 30, color: '#9aa8b8' }); return; }
        if (!ball.done) {
          ball.vy += 1900 * dt; ball.y += ball.vy * dt;
          if (ball.q.flag && !ball.flagged && ball.y >= LY(1)) ball.flagged = true;
          const ty = LY(ball.q.stop) - 4 - r;
          if (ball.y >= ty) {
            ball.y = ty;
            if (Math.abs(ball.vy) < 140) { ball.done = true; U.$(el, '#gt-msg').innerHTML = ball.q.msg; }
            else ball.vy = -ball.vy * .32;
          }
        }
        if (ball.done) { c.fillStyle = LAY[ball.q.stop][2]; c.fillRect(w * .34, LY(ball.q.stop) - 4, w * .63, 8); }
        c.fillStyle = ball.done ? LAY[ball.q.stop][2] : ball.flagged ? '#a8660a' : '#3e4b5b';
        c.beginPath(); c.arc(bx, ball.y, r, 0, 7); c.fill();
        U.txt(c, ball.q.n, bx + 26, ball.y + 6, { size: 16, w: 700, color: '#17202b', bg: 'rgba(255,255,255,.92)' });
        if (ball.flagged) U.txt(c, '⚑ 提醒', bx - 26, LY(1) - 12, { align: 'right', size: 14, w: 700, color: '#a8660a' });
      });
    },
    notes: `第四章，檢查和審核。每一層都標出由誰負責：程式擋下的錯，由傳承者請 Agent 修正；程式提醒的數字，由維護者決定補出處還是拿掉；讀者測試沒過，由傳承者改寫；內容對不對，由維護者決定。檢查程式和規則本身，由框架維護者維護。

研究時查到：寫在規則檔裡的指示，Agent 不保證每次都遵守。所以一定要成立的規則，交給程式來擋。

點下面一個問題，看它掉到哪一層。id 重複、引用找不到、一邊改了沒跟上，第一層就擋下。舊頁的數字沒附出處只提醒，由維護者決定；寫得太難懂由讀者測試抓到；內容說錯了，只有人看得出來。

右邊的元規則：先實際看到某個錯誤，才新增對應的規則。

新人以簡報為主之後，程式多擋三件事：小節沒有簡報頁、頁沒有圖、這次新增或改過的簡報頁數字沒附出處。搬進來的舊頁沒附出處只提醒，用 index.py --todo 列出來慢慢補。`
  }, C4));

  /* ④ 讀者測試：改寫前後的對比 */
  const RT = [
    { ex: '換成 HfO₂ 之後，<span class="term">EOT</span> 可以維持在 1 nm 以下，<span class="term">Vt</span> 由 <span class="term">WFM</span> 決定。', qa: [[0, '為什麼要換掉二氧化矽？', '這章沒有說原因，我答不出來。'], [0, 'EOT 是什麼？', '這章沒有解釋 EOT，我答不出來。'], [0, '換了材料，牆是變厚還是變薄？', '這章沒有提到厚度怎麼變。']] },
    { ex: '牆太薄，電子會直接穿過去（漏電）。換成二氧化鉿（HfO₂，High-k）之後，<span class="fix">牆可以做厚，電場照樣過得去</span>。<span class="fix">「等效厚度」（EOT）就是：這道新牆的效果，相當於多厚的二氧化矽。</span>', qa: [[1, '為什麼要換掉二氧化矽？', '因為牆太薄，電子會穿過去漏電。'], [1, 'EOT 是什麼？', '新牆的效果相當於多厚的二氧化矽。'], [1, '換了材料，牆是變厚還是變薄？', '變厚，電場照樣過得去。']] }
  ];
  A(Object.assign({
    id: 'reader', part: 2, minutes: 2, short: '讀者測試',
    title: '讀者測試：讓一個外行人讀讀看', en: 'Reader Test',
    thesis: '沒有背景知識的 Agent <b>只讀這一章</b>，答不出來的地方就要改寫。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('rt-seg', ['改寫前', '改寫後'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>改過的那一章（節錄）</span><span id="rt-score"></span></div>
          <div class="excerpt" id="rt-ex"></div>
          <div class="lbl4" style="margin-top:6px">沒有背景的 Agent 只讀上面這些，回答常見問題：</div>
          <div class="ritems" id="rt-qa"></div></div></div>
      ${U.side({
        points: ['只能根據這一章回答，<b>不能用自己的知識</b>', '答不出來 → 回去改寫，再測一次', 'ELI5 是方向：先白話、再術語、能比喻就比喻', '<b>簡報也測</b>：只給那一章每一頁的文字和旁白'],
        fact: { v: '1 個測試', d: '取代一長串寫作原則清單' },
        analogy: { icon: 'eye', t: '比喻', p: '請一位完全外行的朋友讀一遍：他問「這是什麼意思？」的地方，就是你要改的地方。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'rt-seg', i => {
        const r = RT[i], ok = r.qa.filter(x => x[0]).length;
        U.$(el, '#rt-ex').innerHTML = r.ex;
        U.$(el, '#rt-qa').innerHTML = r.qa.map(([y, q, a]) => `<div class="qa-row"><span class="mk ${y ? 'y' : 'n'}">${y ? '✓' : '✗'}</span><div><div class="q">${q}</div><div class="a">${a}</div></div></div>`).join('');
        U.$(el, '#rt-score').textContent = `答對 ${ok} / ${r.qa.length}`;
      });
    },
    notes: `以前想列一長串寫作原則，現在改成一個測試：讓沒有背景知識的 Agent 只讀改過的那一章，回答這章的常見問題。

看「改寫前」：EOT、Vt、WFM 三個縮寫都沒解釋，三題都答不出來。切到「改寫後」：先講白話，再解釋等效厚度，三題都答得出來。這個 Agent 只能根據這一章回答，和查找是同一條規則。

簡報也一樣測：沒有背景的 Agent 只讀那一章每一頁的文字和旁白，回答自我檢查的題目，改過的頁沒有題目就臨時補一題。互動圖它看不到，所以要讓新人讀的文字都寫在 Markdown。`
  }, C4));

  /* ⑤ 新人看到的樣子：入口網站、簡報的一頁、簡報的整份結構、手冊網站 */
  const DECK_RULE = {
    head: ['標題列', '眉標寫部分和章；右上角是章節列，點了可以跳章；標題下面一句話講結論。'],
    widget: ['主圖', '每頁都要有圖，沒有會擋。會動、會變、有因果的概念做成可以操作的互動圖，先套樣板（Fig.canvas、Fig.steps、Fig.parts）；其他可以用圖片、圖表、影片。'],
    points: ['重點', '三到四點短句，每點一個重點。'],
    fact: ['數字卡', '一句話數字；新增或改過的頁，數字沒附出處會擋。點數字後面的小標號看出處。'],
    analogy: ['比喻卡', '用生活經驗解釋這頁的概念；卡片標題可以自己寫。'],
    learn: ['給新人的按鈕', '<b>旁白</b>：講稿去掉給講者的段落，預設收起；<b>看詳細和出處</b>：打開手冊網站對應的小節（有對應才出現）；<b>問 Agent</b>：複製「哪個知識庫、哪一頁（頁 id）」，貼到 Claude Code 接著問。'],
    notes: ['講稿', '上台講解時按 N 或「講稿」，比旁白多了給講者的【可略】【提示】段落和計時。']
  };
  const DECK_FLOW = [['封面', ''], ['議程', ''], ['內容頁 × N', '每頁一個概念'], ['章末自我檢查', '自動產生：章檔的題目＋手冊的常見問題'], ['出處頁', '自動整理每頁的註腳'], ['常見問題附錄', '建置時由各章題目產生']];
  A(Object.assign({
    id: 'learn', part: 2, minutes: 2.5, short: '新人看到的樣子',
    title: '新人看到的樣子：入口網站、簡報、手冊網站', en: 'Learn',
    thesis: '新人從<b>入口網站</b>開始，主要看<b>簡報</b>；細節在手冊網站，小節旁可以跳回簡報頁。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('ln-seg', ['入口網站', '簡報：一頁', '簡報：整份', '手冊網站'], 0)}</div>
        <div class="mock" id="ln-mock"></div></div>
      ${U.side({
        points: ['從<b>入口網站</b>開始：卡片、學習路徑、角色路徑、看到哪裡、搜尋', '簡報下面有<b>旁白、看詳細和出處、問 Agent</b>', '每章最後有<b>自我檢查</b>，先想再展開答案', '<b>簡報必備、手冊選配</b>'],
        fact: { v: '1 個壓縮檔', d: 'portal.zip：入口網站、所有簡報和手冊網站，解開就能離線看' },
        analogy: { icon: 'road', t: '比喻', p: '像逛博物館：入口拿一張導覽圖（入口網站），每個展間有說明牌（簡報），想聽解說再戴耳機（旁白）。' }
      })}</div>`,
    init(el) {
      const mock = U.$(el, '#ln-mock');
      const site = `<div class="mbar"><i></i><i></i><i></i><span>kb/semiconductor · 手冊網站</span></div>
        <div class="pg">
          <div class="lbl4" style="margin:0">全景圖</div>
          <div class="chips"><span>演進與現況</span><span class="ar">→</span><span>製造：從電晶體到量產</span><span class="ar">→</span><span>突破摩爾定律</span></div>
          <div style="font-size:24px;font-weight:700;margin-top:4px">閘極</div>
          <div class="ov-box"><b>速覽</b>　閘極隔著一道很薄的絕緣牆，用電場開關電晶體。這章講牆為什麼不能再薄，換成 High-k 之後怎麼兩全。</div>
          <div style="font-size:19px;font-weight:700">閘極絕緣層 <span class="tag">hk1</span> <span class="tag a">▶ 看簡報</span></div>
          <p style="margin:0;font-size:17px">牆要薄，電場才夠強；太薄，電子會直接穿過去（量子穿隧，Quantum Tunneling）。</p>
          <div class="lbl4" style="margin:4px 0 0">常見問題（點開看答案）</div>
          <details class="faqi"><summary>電晶體會壞嗎？可以用多久？</summary><p>正常使用可以用十年以上。長期高溫、高電壓會讓絕緣層慢慢劣化。</p><div class="rel">相關：hk1、wat</div></details>
        </div>`;
      const portal = `<div class="mbar"><i></i><i></i><i></i><span>入口網站 · 解開壓縮檔，打開 index.html（示意）</span></div>
        <div class="pg">
          <div style="font-size:24px;font-weight:700">知識傳承入口</div>
          <div style="border:1.5px solid var(--line-strong);border-radius:6px;padding:6px 12px;color:var(--ink-3);font-size:16px;background:#fff">搜尋：所有知識庫的簡報頁、手冊小節、術語</div>
          <div class="cards">
            <div class="card" style="background:#fff;border-color:var(--accent)"><h4>半導體製程</h4><p>90 頁 · 約 4 小時 12 分 · 看過 18 / 90 頁</p><div class="sbar" style="height:8px"><i style="width:20%;background:var(--good)"></i></div></div>
            <div class="card" style="background:#fff"><h4>電腦視覺</h4><p>簡報還沒做 · 手冊只有骨架</p></div>
          </div>
          <div class="lbl4" style="margin:0">學習路徑：照簡報的章排，時間用每頁的建議分鐘數加起來（另外有角色路徑、搜尋）</div>
          <div class="ritems">${[['開場', '3 頁 · 6 分', 'ok'], ['第一部分 · 演進與現況', '12 頁 · 26 分', 'ok'], ['① 微影', '8 頁 · 19 分', 'sel'], ['② 蝕刻', '3 頁 · 8 分', '']].map(([t, m, c]) => `<div class="ritem ${c}" style="display:flex;justify-content:space-between;padding:4px 10px"><span>${c === 'ok' ? '✓ ' : c === 'sel' ? '◐ ' : '○ '}${t}</span><span class="ids" style="display:inline">${m}</span></div>`).join('')}</div>
        </div>`;
      const b = (k, style, inner) => `<button type="button" class="ritem click" data-k="${k}" style="${style}">${inner}</button>`;
      const one = `${b('head', 'padding:10px 14px', '<span class="ids">03 第二部分 · ⑤ 閘極　　［① ② ③ ④ ⑤ 章節列］</span><b style="font-size:20px">絕緣牆的兩難：電場要過得去，電子不要過去</b><span class="ids">一句話講結論……</span>')}
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:58fr 42fr;gap:10px">
          ${b('widget', 'display:grid;place-items:center;font-size:20px;font-weight:700', '左：主圖<br><span class="ids">拖動厚度，看漏電怎麼變</span>')}
          <div style="display:flex;flex-direction:column;gap:8px">${b('points', 'flex:1', '<b>重點</b><span class="ids">• 牆越薄，控制力越強<br>• 太薄，電子穿過去</span>')}${b('fact', '', '<b>數字卡</b><span class="ids">約 1.2 nm：只剩約 5 層原子</span>')}${b('analogy', '', '<b>比喻卡</b><span class="ids">隔著牆用磁鐵吸鐵片</span>')}</div>
        </div><div style="display:flex;gap:8px">${b('learn', 'flex:1;padding:6px 14px;text-align:center', '<span class="ids" style="display:inline">［旁白］［看詳細和出處］［問 Agent］</span>')}${b('notes', 'padding:6px 14px', '<span class="ids" style="display:inline">講稿（按 N）</span>')}</div>`;
      const whole = `<div class="flowrow" style="margin-top:6px">${DECK_FLOW.map(([t, d]) => `<div class="st core" style="font-size:16px">${t}${d ? `<br><span class="gloss" style="font-size:13px;font-weight:400">${d}</span>` : ''}</div>`).join('<span class="ar">→</span>')}</div>`;
      const frame = (bar, inner) => `<div class="mbar"><i></i><i></i><i></i><span>${bar}</span></div>
        <div class="pg" style="flex:1;min-height:0"><div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px">${inner}</div><div class="card key" id="ln-rule" style="font-size:18px"></div></div>`;
      const pick = k => { U.$$(mock, '[data-k]').forEach(x => x.classList.toggle('sel', x.dataset.k === k)); U.$(mock, '#ln-rule').innerHTML = `<b>${DECK_RULE[k][0]}</b>：${DECK_RULE[k][1]}`; };
      U.onSeg(el, 'ln-seg', i => {
        if (i === 0) { mock.innerHTML = portal; return; }
        if (i === 3) { mock.innerHTML = site; return; }
        mock.innerHTML = frame(i === 1 ? 'kb/semiconductor · 簡報的一頁（點一個區塊看規則）' : 'kb/semiconductor · 簡報的整份結構', i === 1 ? one : whole);
        if (i === 1) { U.$$(mock, '[data-k]').forEach(x => x.onclick = () => pick(x.dataset.k)); pick('learn'); }
        else U.$(mock, '#ln-rule').innerHTML = '<b>章末自我檢查</b>和<b>出處頁</b>由程式自動產生：題目寫在簡報章檔的「## 自我檢查」，加上手冊同一章的常見問題；半導體每一章都有。<b>常見問題附錄</b>在建置時由各章題目照主題整理，不用手寫。';
      });
    },
    notes: `第五章，新人怎麼學。新人以看簡報為主，從入口網站開始。

先看「入口網站」：CI 把入口頁、所有簡報和手冊網站打包成 portal.zip，新人解開就能離線看。入口頁有知識庫卡片、學習路徑、角色路徑、記住看到哪裡，和跨知識庫搜尋。

切到「簡報：一頁」，點各個區塊看規則。下面那一排是給新人的按鈕：旁白、看詳細和出處、問 Agent。「簡報：整份」可以看到每章最後自動多一頁自我檢查，最後還有自動整理的出處頁和常見問題附錄。

「手冊網站」放細節：全景圖、速覽、小節和常見問題，每個小節標題旁有「看簡報」連回簡報頁。`
  }, C5));

  /* ⑤ 查找與帶讀 */
  const LOOK = [
    { q: 'OPC 是什麼？跟光罩有什麼關係？', a: 'OPC（光學鄰近校正，Optical Proximity Correction）是先把光罩上的圖形「故意改形狀」，抵消曝光時光造成的變形，讓印在晶圓上的線條接近設計。所以 OPC 改的就是光罩本身。', cite: '出處：半導體製程 › 微影 › litho6' },
    { q: '機台保養（PM）多久做一次？', a: '簡報和手冊都沒有寫到這件事，我不自己編答案。要記成「待回答」嗎？', gap: true },
    { q: '乾式蝕刻為什麼挖得比較直？', a: '手冊沒有蝕刻這一章，但簡報有：乾式用電漿，離子從正上方打下來，只往下挖，所以牆很直；濕式泡藥水，會四面八方一起溶。', cite: '出處：半導體製程 › 簡報 › 蝕刻 › 〈蝕刻：把不要的地方挖掉，關鍵是「只往下挖」〉（etch1）' }
  ];
  const QZ = [['牆可以做厚一點，電場照樣過得去', 1], ['牆可以做薄一點，電子更容易通過', 0], ['牆變成導體，閘極直接接上通道', 0]];
  A(Object.assign({
    id: 'ask', part: 2, minutes: 2, short: '查找與帶讀',
    title: '查找與帶讀：不懂就問 Agent', en: 'Lookup & Guided Reading',
    thesis: '<b>查找</b>根據簡報和手冊回答、附出處，沒寫就直說；<b>帶讀</b>用白話解釋、出小題目確認懂了。',
    render: () => `<div class="s-body">
      <div class="col">
        <div class="fig grow"><div class="fig-title"><span>查找：點一題</span><span></span></div>
          <div class="controls">${LOOK.map((x, i) => `<button class="btn" type="button" data-i="${i}">${x.q}</button>`).join('')}</div>
          <div class="chat" id="ak-chat" style="flex:1;min-height:0;overflow:auto"></div></div>
        <div class="fig"><div class="fig-title"><span>帶讀：小題目</span><span>選項長度差不多</span></div>
          <p style="margin:0;font-size:19px">把閘極的絕緣牆從二氧化矽換成二氧化鉿（High-k），主要是為了什麼？</p>
          <div class="quiz" id="ak-quiz">${QZ.map(([t], i) => `<button type="button" data-i="${i}">${t}</button>`).join('')}</div>
          <div class="fb" id="ak-fb"></div></div>
      </div>
      ${U.side({
        points: ['<b>查找</b>：簡報頁和小節都算，附上出處', '兩邊說法不同，<b>兩種都列</b>，問要不要記勘誤', '都沒寫的問題，可以記成<b>待回答</b>', '<b>帶讀</b>：用 ELI5 解釋、反問、出小題目，最後指回那一頁或那一節'],
        fact: { v: '不自己編', d: '沒寫就說沒寫，問要不要記成待回答' },
        analogy: { icon: 'stack', t: '比喻', p: '好的圖書館員：只拿館藏回答你，找不到就老實說，再登記成要採購的書。' }
      })}</div>`,
    init(el) {
      const box = U.$(el, '#ak-chat');
      const ask = i => {
        const x = LOOK[i]; box.innerHTML = '';
        U.$$(el, '.controls [data-i]').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
        box.insertAdjacentHTML('beforeend', `<div class="bub me show"><span class="by">新人</span>${x.q}</div>`);
        box.insertAdjacentHTML('beforeend', `<div class="bub ai show"><span class="by">Agent</span>${x.a}${x.cite ? `<br><span class="cite">${x.cite}</span>` : ''}${x.gap ? '<br><button class="btn" type="button" id="ak-gap" style="margin-top:8px">好，記成待回答</button>' : ''}</div>`);
        const g = U.$(el, '#ak-gap');
        if (g) g.onclick = () => {
          g.remove();
          box.insertAdjacentHTML('beforeend', '<div class="bub me show"><span class="by">新人</span>好，記成待回答</div>');
          box.insertAdjacentHTML('beforeend', '<div class="bub ai show"><span class="by">Agent</span>已經開成 issue #12，傳承者開工時會看到；答完你會收到通知。</div>');
          box.scrollTop = box.scrollHeight;
        };
      };
      U.$$(el, '.controls [data-i]').forEach(b => b.onclick = () => ask(+b.dataset.i));
      ask(0);
      const qb = U.$$(el, '#ak-quiz button');
      qb.forEach(b => b.onclick = () => {
        const ok = QZ[+b.dataset.i][1];
        qb.forEach(x => x.classList.remove('right', 'wrong')); b.classList.add(ok ? 'right' : 'wrong');
        U.$(el, '#ak-fb').innerHTML = ok ? '答對了。二氧化鉿傳電場的能力比較強，牆做厚、電子穿不過去，閘極照樣控制得住。<span class="cite">回到小節：閘極 › hk1</span>'
          : '再想想：牆太薄，電子會直接穿過去。換材料是想要「厚」還是「薄」？<span class="cite">回到小節：閘極 › hk1</span>';
      });
    },
    notes: `看不懂時，新人可以請 Agent 查找或帶讀。點第一題：手冊有寫，出處是小節。點第三題：手冊沒寫、但簡報有，Agent 就用那一頁回答，出處寫那一頁；兩邊說法不同時，兩種都列。點第二題：兩邊都沒寫，Agent 就直說，不自己編，再問要不要記成待回答；待回答怎麼處理，第三部分再講。新人在簡報上按「問 Agent」貼過來的，Agent 先讀那一頁和它對應的小節。

左下是帶讀：Agent 陪新人讀，反問、出小題目。三個選項長度差不多，不會從格式猜到答案；答完一樣指回小節。`
  }, C5));
})();
