/* 第二部分 ③④⑤ 修改與刪除、檢查與審核、新人怎麼學 */
(function () {
  const A = Deck.add.bind(Deck);
  const C3 = { chap: 3, eyebrow: '第二部分 · ③ 修改與刪除' };
  const C4 = { chap: 4, eyebrow: '第二部分 · ④ 檢查與審核' };
  const C5 = { chap: 5, eyebrow: '第二部分 · ⑤ 新人怎麼學' };

  /* ③ 引用：改一頁、刪一頁會牽動哪些地方 */
  const PG = [{ id: 'litho6', t: 'OPC：光罩要故意畫歪', ch: '微影' }, { id: 'hk1', t: '絕緣牆的兩難', ch: '閘極' }, { id: 'hk3-d', t: '換成二氧化鉿', ch: '閘極', of: 'hk1' }, { id: 'ocd', t: '光學散射 OCD', ch: '檢測量測' }, { id: 'tem', t: '穿透式電子顯微鏡 TEM', ch: '檢測量測' }];
  const DEEP = [{ id: 'litho6-d', of: 'litho6' }, { id: 'hk1-d', of: 'hk1' }, { id: 'hk2-d', of: 'hk1' }, { id: 'hk3-d', of: 'hk1' }, { id: 'hk4-d', of: 'hk1' }, { id: 'ocd-d', of: 'ocd' }, { id: 'tem-d', of: 'tem' }];
  const FAQS = [{ q: '光罩為什麼要故意畫歪？', s: ['litho6', 'litho6-d'] }, { q: '為什麼選二氧化鉿？', s: ['hk1', 'hk3-d'] }, { q: 'OCD 量的是真正的電路嗎？', s: ['ocd', 'ocd-d'] }, { q: 'SEM 會不會打壞晶片？', s: ['tem', 'tem-d'] }];
  A(Object.assign({
    id: 'refs', part: 2, minutes: 2, short: '修改與刪除',
    title: '修改與刪除：引用在同一個提案裡一起改', en: 'Edit & Remove',
    thesis: 'Agent 列出所有<b>引用</b>，在<b>同一個變更提案</b>裡處理完，不留舊 id。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('rf-act', ['修改', '刪除'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>點一頁</span><span></span></div>
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.2fr 1fr 1.2fr;gap:14px">
            <div class="rcol"><h4>簡報頁</h4><div class="ritems" id="rf-secs"></div></div>
            <div class="rcol"><h4>深入頁（深入：主頁）</h4><div class="ritems" id="rf-pages"></div></div>
            <div class="rcol"><h4>自我檢查（相關：）</h4><div class="ritems" id="rf-faqs"></div></div>
          </div>
          <div class="card" id="rf-res" style="font-size:18px"></div></div></div>
      ${U.side({
        points: ['<b>修改</b>：主頁後面的深入頁、指向它的自我檢查一起確認，說法要一致', '<b>刪除、合併</b>：頁序、深入頁、自我檢查、術語表、頁碼引用在同一個提案裡改掉', '刪掉的內容，Git 歷史找得回來'],
        fact: { v: '0 個舊 id', d: '全部在同一個 repo，引用都看得到，直接改掉' },
        analogy: { icon: 'gate', t: '比喻', p: '像搬家改地址：把所有會寄信給你的人都通知一遍，舊地址就不用留了。' }
      })}</div>`,
    init(el) {
      let act = 0, picked = 'hk1';
      const render = () => {
        const pg = PG.find(x => x.id === picked);
        U.$(el, '#rf-secs').innerHTML = PG.map(s => `<button type="button" class="ritem click ${s.id === picked ? 'sel' : ''}" data-id="${s.id}">${s.of ? '<span class="ids" style="display:inline">深入</span> ' : ''}${s.t}<span class="ids">${s.ch} › ${s.id}</span></button>`).join('');
        const hc = act ? 'ritem hit del' : 'ritem hit';
        const isHit = d => pg.of ? d.id === picked || d.id === pg.of : d.of === picked;
        const hd = DEEP.filter(isHit), hf = FAQS.filter(f => f.s.includes(picked));
        U.$(el, '#rf-pages').innerHTML = DEEP.map(d => `<div class="${isHit(d) ? hc : 'ritem'}" style="border-style:dashed">${d.id}<span class="ids">深入：${d.of}</span></div>`).join('');
        U.$(el, '#rf-faqs').innerHTML = FAQS.map(f => `<div class="${f.s.includes(picked) ? hc : 'ritem'}">${f.q}<span class="ids">相關：${f.s.join('、')}</span></div>`).join('');
        const list = hd.map(d => d.id).join('、') || '沒有';
        U.$(el, '#rf-res').innerHTML = pg.of
          ? (!act ? `<b>修改深入頁「${pg.t}」</b>：和主頁 ${pg.of} 的說法要一致；${hf.length} 題自我檢查的答案一起確認。` : `<b>刪除深入頁「${pg.t}」</b>：頁序拿掉這一頁；指向它的 ${hf.length} 題自我檢查改指向主頁 ${pg.of}，或一起刪；術語表的「第一次出現」也一起改。`)
          : (!act ? `<b>修改「${pg.t}」</b>：後面的深入頁（${list}）一起看，${hf.length} 題自我檢查的答案也一起確認，說法要一致，都在同一個提案裡。` : `<b>刪除「${pg.t}」</b>：後面的深入頁（${list}）接到別的主頁或一起刪；${hf.length} 題自我檢查改指向或一起刪；頁序、術語表、頁碼引用也在同一個提案裡改完。`);
        U.$$(el, '#rf-secs [data-id]').forEach(b => b.onclick = () => { picked = b.dataset.id; render(); });
      };
      U.onSeg(el, 'rf-act', i => { act = i; render(); });
    },
    notes: `第三章，修改和刪除。先選動作，再點左邊一頁。修改主頁 hk1 時，後面的四頁深入頁要一起看，指向它的自我檢查也要確認，說法要一致。點深入頁 hk3-d，修改時要和主頁 hk1 的說法一致。

切到「刪除」：Agent 先列出所有引用，包括頁序、深入頁的「深入：」、自我檢查、術語表、頁碼引用和角色路徑，在同一個提案裡改指向、一起刪或合併。刪主頁時，它後面的深入頁要接到別的主頁，或一起刪。頁 id 建立後不改名；因為全在同一個 repo，引用都看得到，所以不留舊 id。刪掉的內容，Git 歷史隨時找得回來。`
  }, C3));

  /* ④ 誰把關：丟一個問題進篩子，看它在哪一層被抓到 */
  const LAY = [['程式擋', '本機每次修改＋CI；沒過不能合併', '#b3261e', '負責：傳承者照錯誤修正（Agent 代勞）'], ['程式提醒', '判斷不準，只提醒、不擋', '#a8660a', '負責：維護者決定補出處或拿掉'], ['讀者測試', 'Agent 看寫得清不清楚', '#1f4fb5', '負責：傳承者改寫到答得出來'], ['維護者審核', '人決定內容對不對', '#1f7a4d', '負責：維護者核准或要求修改']];
  const PB = [
    { n: 'id 重複', stop: 0, msg: '<b>程式擋下</b>：頁 id 不能重複。Agent 換一個 id 再跑一次檢查。' },
    { n: '引用找不到', stop: 0, msg: '<b>程式擋下</b>：自我檢查、頁碼引用或術語表指向的頁不存在。Agent 修正引用。' },
    { n: '章沒有速覽', stop: 0, msg: '<b>程式擋下</b>：每個章檔開頭都要有速覽，入口網站點一章就看得到。先修也要指到存在的章。' },
    { n: '新寫的數字沒出處', stop: 0, msg: '<b>程式擋下</b>：這次新寫或改到的說法（深入頁說明的每一段也算），數字一定要附出處；補出處，或改成不帶數字的說法。' },
    { n: '原本就沒出處', stop: 3, flag: true, msg: '<b>程式提醒、不擋</b>：原本就有、沒附出處的數字（搬進來的舊頁和深入頁）只提醒；用 index.py --todo 列出來（半導體現在 44 頁），傳承者慢慢補。到了<b>維護者審核</b>，決定補出處還是拿掉。' },
    { n: '寫得太難懂', stop: 2, msg: '<b>讀者測試抓到</b>：沒有背景的 Agent 答不出這章的自我檢查，回去改寫。' },
    { n: '內容說錯了', stop: 3, msg: '<b>維護者審核抓到</b>：內容對不對，最後由人判斷。退回並附上意見。' },
    { n: '深入頁接錯', stop: 0, msg: '<b>程式擋下</b>：深入頁的「深入：」要指到存在的主頁，寫在同一個章檔，頁序裡緊接在主頁後面。' },
    { n: '頁沒有圖', stop: 0, msg: '<b>程式擋下</b>：每一頁都要寫「圖：」，放互動圖、圖片或影片；深入頁可以寫「同主頁」或「表格」。互動圖名稱找不到也會擋。' }
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

點下面一個問題，看它掉到哪一層。id 重複、引用找不到、章沒有速覽、深入頁接錯，第一層就擋下。原本就有、沒附出處的數字只提醒，由維護者決定；寫得太難懂由讀者測試抓到；內容說錯了，只有人看得出來。

右邊的元規則：先實際看到某個錯誤，才新增對應的規則。

只留簡報之後，程式擋的事也跟著變：拿掉小節和兩邊的指紋，多擋章沒有速覽、先修指錯、深入頁接錯、術語表指到不存在的頁；新寫的數字沒附出處照樣擋，深入頁的說明也算。原本就有的只提醒，用 index.py --todo 列出來慢慢補。`
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
          <div class="lbl4" style="margin-top:6px">沒有背景的 Agent 只讀上面這些，回答這一章的自我檢查：</div>
          <div class="ritems" id="rt-qa"></div></div></div>
      ${U.side({
        points: ['只能根據這一章回答，<b>不能用自己的知識</b>', '答不出來 → 回去改寫，再測一次', 'ELI5 是方向：先白話、再術語、能比喻就比喻', '測的是每一頁的文字、<b>深入頁的說明</b>和旁白'],
        fact: { v: '1 個測試', d: '取代一長串寫作原則清單' },
        analogy: { icon: 'eye', t: '比喻', p: '請一位完全外行的朋友讀一遍：朋友問「這是什麼意思？」的地方，就是你要改的地方。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'rt-seg', i => {
        const r = RT[i], ok = r.qa.filter(x => x[0]).length;
        U.$(el, '#rt-ex').innerHTML = r.ex;
        U.$(el, '#rt-qa').innerHTML = r.qa.map(([y, q, a]) => `<div class="qa-row"><span class="mk ${y ? 'y' : 'n'}">${y ? '✓' : '✗'}</span><div><div class="q">${q}</div><div class="a">${a}</div></div></div>`).join('');
        U.$(el, '#rt-score').textContent = `答對 ${ok} / ${r.qa.length}`;
      });
    },
    notes: `以前想列一長串寫作原則，現在改成一個測試：讓沒有背景知識的 Agent 只讀改過的那一章，回答這章的自我檢查。

看「改寫前」：EOT、Vt、WFM 三個縮寫都沒解釋，三題都答不出來。切到「改寫後」：先講白話，再解釋等效厚度，三題都答得出來。這個 Agent 只能根據這一章回答，和查找是同一條規則。

題目卷是那一章每一頁的文字、深入頁的說明和旁白；改過的頁沒有題目，就臨時補一題。互動圖它看不到，所以要讓新人讀的文字都寫在 Markdown。`
  }, C4));

  /* ⑤ 新人看到的樣子：入口網站、簡報的一頁、深入頁、簡報的整份結構 */
  const DECK_RULE = {
    head: ['標題列', '眉標寫部分和章；右上角是章節列，點了可以跳章；標題下面一句話講結論。'],
    widget: ['主圖', '每頁都要有圖，沒有會擋。會動、會變、有因果的概念做成可以操作的互動圖，先套樣板（Fig.canvas、Fig.steps、Fig.parts）；其他可以用圖片、圖表、影片。'],
    points: ['重點', '三到四點短句，每點一個重點。'],
    fact: ['數字卡', '一句話數字；這次新寫或改到的數字沒附出處會擋。點數字後面的小標號看出處。'],
    analogy: ['比喻卡', '用生活經驗解釋這頁的概念；卡片標題可以自己寫。'],
    learn: ['給新人的按鈕', '<b>旁白</b>：講稿去掉給講者的段落，預設收起；<b>看深入</b>：後面有深入頁才出現，翻到第一頁深入頁（平常翻頁不會經過）；<b>問 Agent</b>：複製「哪個知識庫、哪一頁（頁 id）」，貼到 Claude Code 接著問。'],
    notes: ['講稿', '上台講解時按 N 或「講稿」，比旁白多了給講者的【可略】【提示】段落和計時。'],
    dhead: ['深入頁的標題', '標題旁標「深入」，頁碼顯示成「04 · 深入 3/4」。平常翻頁不會經過，在主頁按「看深入」才進去；看完最後一頁再翻，就到下一個主頁。'],
    dfig: ['深入頁的圖', '可以寫「同主頁」沿用主頁的互動圖，或「表格」把說明裡的第一個表格放在這裡。'],
    dpts: ['深入頁的重點', '三到五點，講這一頁的說明在講什麼；新寫的，帶數字就要附出處。'],
    dmore: ['說明', '長說明放在畫面下方，深入頁預設展開，簡報自動縮到上面；可以有多段、小標題、清單、表格、圖片和出處註腳。收起之後，接下來的深入頁也先收著。']
  };
  const DECK_FLOW = [['封面', ''], ['議程', ''], ['主頁 × N', '每頁一個概念'], ['深入頁', '接在主頁後面，按「看深入」才進去'], ['章末自我檢查', '自動產生：章檔的題目'], ['出處頁', '自動整理每頁的註腳'], ['問答附錄', '建置時由各章題目產生']];
  A(Object.assign({
    id: 'learn', part: 2, minutes: 2.5, short: '新人看到的樣子',
    title: '新人看到的樣子：入口網站和簡報', en: 'Learn',
    thesis: '新人從<b>入口網站</b>開始，先看全景圖和速覽，再照學習路徑看<b>簡報</b>；想多知道一點，翻後面的<b>深入頁</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('ln-seg', ['入口網站', '簡報：一頁', '簡報：深入頁', '簡報：整份'], 0)}</div>
        <div class="mock" id="ln-mock"></div></div>
      ${U.side({
        points: ['從<b>入口網站</b>開始：全景圖、學習路徑、主題索引、看到哪裡、搜尋', '簡報下面有<b>旁白、看深入、問 Agent</b>', '深入頁按「看深入」才進去，說明在下方預設展開', '每章最後有<b>自我檢查</b>，先想再展開答案'],
        fact: { v: '1 個壓縮檔', d: 'portal.zip：入口網站和所有簡報，解開就能離線看' },
        analogy: { icon: 'road', t: '比喻', p: '像逛博物館：入口拿一張導覽圖（全景圖），每個展間有說明牌（簡報），想聽解說戴耳機（旁白），想看更多走進旁邊的小展間（深入頁）。' }
      })}</div>`,
    init(el) {
      const mock = U.$(el, '#ln-mock');
      const portal = `<div class="mbar"><i></i><i></i><i></i><span>入口網站 · 解開壓縮檔，打開 index.html（示意）</span></div>
        <div class="pg">
          <div style="font-size:24px;font-weight:700">知識傳承入口</div>
          <div style="border:1.5px solid var(--line-strong);border-radius:6px;padding:6px 12px;color:var(--ink-3);font-size:16px;background:#fff">搜尋：所有知識庫的簡報頁、深入頁、術語</div>
          <div class="cards">
            <div class="card" style="background:#fff;border-color:var(--accent)"><h4>半導體製程</h4><p>90 頁 · 約 4 小時 12 分 · 另有 28 頁深入 · 看過 18 / 90 頁</p><div class="sbar" style="height:8px"><i style="width:20%;background:var(--good)"></i></div></div>
            <div class="card" style="background:#fff"><h4>電腦視覺</h4><p>規劃了 13 章，還沒有頁</p></div>
          </div>
          <div class="lbl4" style="margin:0">全景圖：照部分和章自動排，橘色箭頭是先修；點一章看速覽</div>
          <div class="chips"><span>① 微影</span><span class="ar">→</span><span>② 蝕刻</span><span class="ar">…</span><span>⑤ 閘極</span><span class="ar">→</span><span style="background:var(--accent);color:#fff;border-color:var(--accent)">⑦ 環繞式</span></div>
          <div class="ov-box"><b>⑦ 環繞式</b>　前面幾章的技術，在這一章組成一顆環繞式電晶體……<br><span class="gloss">先修：蝕刻、沉積、摻雜磊晶、閘極（還沒看完：建議先看完，照樣可以打開）</span></div>
          <div class="lbl4" style="margin:0">下面還有學習路徑（時間和進度只算主頁）、主題索引（從術語表產生）、角色路徑</div>
        </div>`;
      const b = (k, style, inner) => `<button type="button" class="ritem click" data-k="${k}" style="${style}">${inner}</button>`;
      const one = `${b('head', 'padding:10px 14px', '<span class="ids">03 第二部分 · ⑤ 閘極　　［① ② ③ ④ ⑤ 章節列］</span><b style="font-size:20px">絕緣牆的兩難：電場要過得去，電子不要過去</b><span class="ids">一句話講結論……</span>')}
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:58fr 42fr;gap:10px">
          ${b('widget', 'display:grid;place-items:center;font-size:20px;font-weight:700', '左：主圖<br><span class="ids">拖動厚度，看漏電怎麼變</span>')}
          <div style="display:flex;flex-direction:column;gap:8px">${b('points', 'flex:1', '<b>重點</b><span class="ids">• 牆越薄，控制力越強<br>• 太薄，電子穿過去</span>')}${b('fact', '', '<b>數字卡</b><span class="ids">約 1.2 nm：只剩約 5 層原子</span>')}${b('analogy', '', '<b>比喻卡</b><span class="ids">隔著牆用磁鐵吸鐵片</span>')}</div>
        </div><div style="display:flex;gap:8px">${b('learn', 'flex:1;padding:6px 14px;text-align:center', '<span class="ids" style="display:inline">［旁白］［看深入（4 頁）］［問 Agent］</span>')}${b('notes', 'padding:6px 14px', '<span class="ids" style="display:inline">講稿（按 N）</span>')}</div>`;
      const deep = `${b('dhead', 'padding:10px 14px', '<span class="ids">04 · 深入 3/4　第二部分 · ⑤ 閘極</span><b style="font-size:20px">換成二氧化鉿：牆做厚，電場照樣過得去 <span style="font-size:13px;color:var(--accent-2);border:1.5px dashed var(--accent-2);border-radius:10px;padding:1px 8px">深入</span></b>')}
        <div style="display:grid;grid-template-columns:58fr 42fr;gap:10px;min-height:120px">
          ${b('dfig', 'display:grid;place-items:center;font-size:18px;font-weight:700', '圖：同主頁<br><span class="ids">沿用 hk1 的互動圖</span>')}
          ${b('dpts', '', '<b>重點</b><span class="ids">• 傳電場能力（k）高的牆可以做厚<br>• 怕高溫，要最後才鋪</span>')}
        </div>
        ${b('dmore', 'flex:1;display:flex;flex-direction:column;gap:6px;padding:10px 14px;background:#fff;border-top:3px solid var(--accent-2)', '<span class="ids">說明（預設展開）</span><span>既然二氧化矽不能再薄，解法就是換材料：找一種讓電場更容易通過的牆，牆就可以做厚，電子不容易穿過去……</span><span><b>### 為什麼是二氧化鉿</b></span><span class="ids" style="display:inline">表格、清單、圖片、出處註腳都可以放</span><span class="ids" style="margin-top:auto">［旁白］［說明］［跳過深入］［回主頁］［問 Agent］</span>')}`;
      const whole = `<div class="flowrow" style="margin-top:6px">${DECK_FLOW.map(([t, d]) => `<div class="st core" style="font-size:16px">${t}${d ? `<br><span class="gloss" style="font-size:13px;font-weight:400">${d}</span>` : ''}</div>`).join('<span class="ar">→</span>')}</div>`;
      const frame = (bar, inner) => `<div class="mbar"><i></i><i></i><i></i><span>${bar}</span></div>
        <div class="pg" style="flex:1;min-height:0"><div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px">${inner}</div><div class="card key" id="ln-rule" style="font-size:18px"></div></div>`;
      const pick = k => { U.$$(mock, '[data-k]').forEach(x => x.classList.toggle('sel', x.dataset.k === k)); U.$(mock, '#ln-rule').innerHTML = `<b>${DECK_RULE[k][0]}</b>：${DECK_RULE[k][1]}`; };
      U.onSeg(el, 'ln-seg', i => {
        if (i === 0) { mock.innerHTML = portal; return; }
        const bars = ['', 'kb/semiconductor · 簡報的一頁（點一個區塊看規則）', 'kb/semiconductor · 深入頁（點一個區塊看規則）', 'kb/semiconductor · 簡報的整份結構'];
        mock.innerHTML = frame(bars[i], i === 1 ? one : i === 2 ? deep : whole);
        if (i < 3) { U.$$(mock, '[data-k]').forEach(x => x.onclick = () => pick(x.dataset.k)); pick(i === 1 ? 'learn' : 'dmore'); }
        else U.$(mock, '#ln-rule').innerHTML = '<b>章末自我檢查</b>和<b>出處頁</b>由程式自動產生：題目寫在章檔的「## 自我檢查」，半導體每一章都有。<b>問答附錄</b>在建置時由各章題目照主題整理，不用手寫。';
      });
    },
    notes: `第五章，新人怎麼學。新人以看簡報為主，從入口網站開始。

先看「入口網站」：CI 把入口頁和所有簡報打包成 portal.zip，新人解開就能離線看。每個知識庫有一張自動排的全景圖，橘色箭頭是先修；點一章看它的速覽，先修還沒看完會提醒，但照樣能打開。下面還有學習路徑、主題索引和角色路徑。

切到「簡報：一頁」，點各個區塊看規則。下面那一排是給新人的按鈕：旁白、看深入、問 Agent。切到「簡報：深入頁」：平常翻頁不會經過，在主頁按「看深入」才進去；標題旁標「深入」，圖可以沿用主頁的，長說明放在下方、預設展開。「簡報：整份」可以看到每章最後自動多一頁自我檢查，最後還有出處頁和問答附錄。`
  }, C5));

  /* ⑤ 查找與帶讀 */
  const LOOK = [
    { q: 'OPC 是什麼？跟光罩有什麼關係？', a: 'OPC（光學鄰近校正，Optical Proximity Correction）是先把光罩上的圖形「故意改形狀」，抵消曝光時光造成的變形，讓印在晶圓上的線條接近設計。所以 OPC 改的就是光罩本身。', cite: '出處：半導體製程 › 簡報 › 微影 › 〈OPC：光罩要故意畫歪，印出來才會是正的〉（litho6、深入頁 litho6-d）' },
    { q: '機台保養（PM）多久做一次？', a: '簡報沒有寫到這件事，我不自己編答案。要記成「待回答」嗎？', gap: true },
    { q: '乾式蝕刻為什麼挖得比較直？', a: '乾式用電漿，離子從正上方打下來，只往下挖，所以牆很直；濕式泡藥水，會四面八方一起溶。', cite: '出處：半導體製程 › 簡報 › 蝕刻 › 〈蝕刻：把不要的地方挖掉，關鍵是「只往下挖」〉（etch1）' }
  ];
  const QZ = [['牆可以做厚一點，電場照樣過得去', 1], ['牆可以做薄一點，電子更容易通過', 0], ['牆變成導體，閘極直接接上通道', 0]];
  A(Object.assign({
    id: 'ask', part: 2, minutes: 2, short: '查找與帶讀',
    title: '查找與帶讀：不懂就問 Agent', en: 'Lookup & Guided Reading',
    thesis: '<b>查找</b>根據簡報回答（主頁、深入頁、自我檢查）、附出處頁，沒寫就直說；<b>帶讀</b>用白話解釋、出小題目確認懂了。',
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
        points: ['<b>查找</b>：主頁、深入頁、自我檢查都算，附上出處頁', '兩頁說法不同，<b>兩種都列</b>，問要不要記勘誤', '簡報沒寫的問題，可以記成<b>待回答</b>', '<b>帶讀</b>：用 ELI5 解釋、反問、出小題目，最後指回那一頁'],
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
        U.$(el, '#ak-fb').innerHTML = ok ? '答對了。二氧化鉿傳電場的能力比較強，牆做厚、電子穿不過去，閘極照樣控制得住。<span class="cite">回到那一頁：閘極 › hk1（深入頁 hk3-d 有長說明）</span>'
          : '再想想：牆太薄，電子會直接穿過去。換材料是想要「厚」還是「薄」？<span class="cite">回到那一頁：閘極 › hk1</span>';
      });
    },
    notes: `看不懂時，新人可以請 Agent 查找或帶讀。Agent 只根據簡報回答：主頁、深入頁、自我檢查都算。點第一題：出處是主頁 litho6，長說明在它後面的深入頁。點第三題：用蝕刻那一頁回答，出處寫那一頁；兩頁說法不同時，兩種都列。點第二題：簡報沒寫，Agent 就直說，不自己編，再問要不要記成待回答；待回答怎麼處理，第三部分再講。新人在簡報上按「問 Agent」貼過來的，Agent 先讀那一頁和它後面的深入頁。

左下是帶讀：Agent 陪新人讀，反問、出小題目。三個選項長度差不多，不會從格式猜到答案；答完一樣指回那一頁。`
  }, C5));
})();
