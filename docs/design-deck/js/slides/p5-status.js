/* 第五部分：現況（10-26 更新）：已合併的變更提案、情境測試和工具、「新人以簡報為主」做成什麼樣、之後還可以做的事 */
(function () {
  const A = Deck.add.bind(Deck);

  /* ---------- 已經做完的：主線上的每一個變更提案 ---------- */
  const LOG = [
    ['f2b388a', '10-24', '框架', '建立知識傳承框架，並把半導體簡報搬成第一個知識庫'],
    ['#1', '10-25', '半導體', '抽出「閘極」一章（hk1–hk4）'],
    ['#2', '10-25', '半導體', '抽出「微影」一章（litho1–cmask、field、reso、mpat）'],
    ['#3', '10-25', '半導體', '抽出「檢測量測」一章（eyes–wat4）'],
    ['#7', '10-25', '半導體', '補強微影「High-NA EUV」小節（litho5）'],
    ['#6', '10-25', '半導體', '檢測量測新增「機台保養 PM」（回答待回答 #4）'],
    ['#8', '10-25', '半導體', 'hk2 漏電倍數補出處與前提（修正勘誤 #5）'],
    ['#9', '10-25', '電腦視覺', '新增知識庫：電腦視覺（cv）骨架'],
    ['#10', '10-25', '框架', '簡報頁可以放影片（內嵌進單一 HTML，離線能播）'],
    ['#11', '10-25', '框架', 'check.py 數字提醒補上 V、顆、點、吋與中文數字，常見問題也檢查'],
    ['#12', '10-25', '框架', '修情境測試發現的小問題'],
    ['#13', '10-25', '半導體', '刪除檢測量測的「機台保養 PM」小節'],
    ['#14', '10-25', '框架', '加上情境測試'],
    ['#15', '10-25', '框架', '重複的工作做成工具，skill 寫清楚什麼時候用、做到哪裡算完成'],
    ['#16', '10-25', '框架', '首頁註明 Sonnet 和 Opus 都測過'],
    ['#17', '', '框架', '提案①：入口網站、簡報下面的旁白／看詳細和出處／問 Agent、章末自我檢查、出處頁'],
    ['提案②', '', '半導體', '90 頁的文字搬到 15 個簡報章檔，互動圖改成 Fig.add；197 題搬進各章的自我檢查'],
    ['提案③', '', '框架', '規則和五個 skill 改成新人以簡報為主；ADR-0006 取代 ADR-0002；check.py 新規則、雙向指紋']
  ];
  const KIND = ['全部', '框架', '半導體', '電腦視覺'];
  A({
    id: 'status', part: 5, minutes: 2.5, short: '已經做完的',
    title: '已經做完的：17 個變更提案都走過完整流程', en: 'Done',
    thesis: '入口網站、半導體 90 頁簡報（Markdown）和 3 章手冊、電腦視覺骨架、情境測試，都<b>在正式內容上</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('stt-k', KIND, 0)}<span class="caption" id="stt-n"></span></div>
        <div class="fig grow"><div class="fig-title"><span>主線上的歷史（git log）</span><span></span></div>
          <div class="tl" id="stt-l">${LOG.map(([no, d, k, t]) => `<div class="ev" data-k="${k}"><span class="no">${no}</span><span>${t}</span><span class="tag ${k === '框架' ? 'a' : k === '半導體' ? 'g' : 'w'}">${k}${d ? ' · ' + d : ''}</span></div>`).join('')}</div></div></div>
      ${U.side({
        points: ['<b>半導體</b>：90 頁簡報寫在 15 個章檔；手冊 3 章、28 個小節', '<b>流程都走過</b>：待回答（#4 → #6）、勘誤（#5 → #8）、刪除小節（#13）', '<b>電腦視覺</b>：手冊骨架，4 個部分、15 章；內容和簡報還沒做', '<b>框架</b>：入口網站、五個流程、九個工具、情境測試'],
        fact: { v: '17 個提案', d: '每一個都有檢查和核准紀錄' },
        analogy: { icon: 'stairs', t: '比喻', p: '像新店試營運：每道菜（流程）都真的端給客人吃過一次，哪裡卡住就當場改。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'stt-k', i => {
        let n = 0;
        U.$$(el, '#stt-l .ev').forEach(r => { const on = i === 0 || r.dataset.k === KIND[i]; r.classList.toggle('hide', !on); n += on; });
        U.$(el, '#stt-n').textContent = `${n} 筆`;
      });
    },
    notes: `第五部分講現況。先看已經做完的：主線上的每一筆都是一個走完檢查和核准的變更提案，上面可以篩框架、半導體、電腦視覺。

半導體的 90 頁簡報都寫成 Markdown，放在 15 個簡報章檔；手冊有微影、閘極、檢測量測三章，共 28 個小節。每一種流程都真的走過一次：新人問倒手冊開待回答 #4，傳承者回答成 #6；勘誤 #5 修正成 #8；也試過刪除一個小節（#13）。電腦視覺只有手冊骨架，內容和簡報還沒做。

最後三筆是新人以簡報為主的三個提案：#17 做入口網站和給新人的按鈕，提案②把簡報搬成 Markdown，提案③改規則和流程。`
  });

  /* ---------- 情境測試和工具（#14、#15、#16） ---------- */
  const RES = [
    { n: '舊版', pass: 88, cost: 18.39, allow: 174, col: '#9aa8b8' },
    { n: '新版 · Opus', pass: 93, cost: 16.08, allow: 43, col: '#1f4fb5' },
    { n: '新版 · Sonnet', pass: 93, cost: 5.55, allow: 44, col: '#1f7a4d' }
  ];
  const MET = [['pass', '通過的檢查項（共 94）', v => `${v} / 94`, 94], ['cost', '15 個情境的花費（美元）', v => `$${v.toFixed(2)}`, 20], ['allow', '估計同仁要按「允許」幾次', v => `${v} 次`, 180]];
  const TOOLS = [['read.py', '讀正式內容：小節、整章、常見問題，或找某些字寫在哪'], ['index.py', '索引：小節、常見問題、術語在哪裡'], ['who.py', '使用者是誰、維護哪些知識庫'], ['check.py', '檢查；開變更提案之前一定要過'], ['reader_test.py', '讀者測試的題目卷和答案卷'], ['proposal.py', '變更提案的說明草稿、標題、標籤'], ['get.py', '下載或建置手冊網站、簡報'], ['new_kb.py', '建立新知識庫的骨架'], ['build.py', '建置手冊網站和簡報']];
  A({
    id: 'tests', part: 5, minutes: 2.5, short: '情境測試和工具',
    title: '情境測試：改了規則，跑一次就知道有沒有變好', en: 'Scenario Tests',
    thesis: '全新的 Claude Code 跑 15 個情境，另一個模型<b>扮演使用者</b>，程式和評分模型打分；改之前、改之後各跑一次比較。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('ts-v', ['怎麼測', '比較結果', '工具', '模型'], 1)}</div>
        <div class="fig grow"><div class="fig-title"><span id="ts-h"></span><span></span></div><div id="ts-b" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px"></div></div></div>
      ${U.side({
        points: ['改了 skill、AGENTS.md、寫作指引之後跑一次，<b>跟改之前比</b>', '只在測試 repo <b>lufor129/kif-test</b> 跑，不碰正式 repo', '重複的工作做成<b>工具</b>，skill 寫清楚做到哪裡算完成', '日常用 <b>Sonnet</b> 就夠：結果差不多，花費約三分之一'],
        fact: { v: '174 → 43', d: '同樣 15 個情境，同仁要按「允許」的次數' },
        analogy: { icon: 'road', t: '比喻', p: '像新車改裝前後各跑同一條測試路線：油耗、故障次數一比就知道改得好不好。' }
      })}</div>`,
    init(el) {
      const box = U.$(el, '#ts-b'), h = U.$(el, '#ts-h');
      let met = 0;
      const bars = () => {
        const [k, lab, fmt, max] = MET[met];
        U.$(el, '#ts-bars').innerHTML = RES.map(r => `<div style="display:grid;grid-template-columns:130px 1fr 90px;gap:10px;align-items:center;font-size:17px">
          <b>${r.n}</b><div class="sbar"><i style="width:${(r[k] / max * 100).toFixed(1)}%;background:${r.col}"></i></div><span class="mono" style="font-family:var(--font-mono)">${fmt(r[k])}</span></div>`).join('');
        U.$(el, '#ts-cap').textContent = lab;
      };
      U.onSeg(el, 'ts-v', i => {
        h.textContent = ['一個情境怎麼跑', '舊版 vs 新版（15 個情境）', 'framework/tools/ 的九個工具', '用哪個模型'][i];
        if (i === 0) box.innerHTML = `<div class="flowrow" style="row-gap:12px">${[['重置測試 repo', 'prog'], ['建立前置狀態', 'prog'], ['全新的 Claude Code', 'ag'], ['另一個模型扮演使用者', 'ag'], ['程式檢查＋評分模型', 'prog'], ['報告', 'core']].map(([t, c]) => `<span class="st ${c}">${t}</span>`).join('<span class="ar">→</span>')}</div>
          <ul class="points tight"><li>情境照 docs/design.md：新人第一天、看不懂、手冊沒寫、覺得寫錯、傳承者開工、研究、訪談、審核、刪除小節……</li><li>給 Agent 的複本只拉這次重置之後的歷史，看不到別的情境留下的東西</li><li>程式檢查結果（issue、提案、留言），評分模型看對話判斷做得對不對</li><li>結果的格式和 skill-creator 一樣，可以用它的檢視頁面看</li></ul>`;
        if (i === 1) { box.innerHTML = `<div class="controls">${U.seg('ts-m', ['通過', '花費', '要按「允許」'], met)}</div><div class="caption" id="ts-cap"></div><div id="ts-bars" style="display:flex;flex-direction:column;gap:14px"></div>
          <p class="caption" style="margin-top:auto">10-25 改進 skill 時的結果（新人以簡報為主之前）。舊版是改進之前；新版是改進後、修完測試找到的問題再跑的結果，94 個檢查項裡各剩 1 項沒過。</p>`; U.onSeg(el, 'ts-m', j => { met = j; bars(); }); }
        if (i === 2) box.innerHTML = `<table class="t" style="font-size:16.5px"><tbody>${TOOLS.map(([n, d]) => `<tr><td style="width:28%;font-family:var(--font-mono)"><b>${n}</b></td><td>${d}</td></tr>`).join('')}</tbody></table>
          <p class="caption" style="margin:0">Agent 每次都要做的事寫成工具，結果一樣、不用每次重寫；skill 裡寫清楚什麼時候用、做到哪裡算完成。</p>`;
        if (i === 3) box.innerHTML = `<div class="cards"><div class="card key"><h4>Sonnet</h4><div class="big" style="font-size:30px">93 / 94</div><p>15 個情境約 $5.55</p></div><div class="card"><h4>Opus</h4><div class="big" style="font-size:30px">93 / 94</div><p>15 個情境約 $16.08</p></div></div>
          <p style="margin:0;font-size:18px">兩個都用情境測試測過，結果差不多；Sonnet 的花費大約是 Opus 的三分之一。skill 不指定模型，首頁寫明「日常用 Sonnet 就夠」。</p>`;
      });
    },
    notes: `框架的規則和 skill 會一直改，改了怎麼知道有沒有變好？10-25 加上了情境測試。全新的 Claude Code 跑 15 個情境，另一個模型扮演使用者回話，最後由程式和評分模型打分。只在另一個測試 repo 跑，不碰正式的。

切到「比較結果」：同樣 15 個情境、94 個檢查項，舊版過 88 項；改進後的新版，Opus 和 Sonnet 都過 93 項。花費也降了，最明顯的是同仁要按「允許」的次數，從 174 次降到 43 次，因為重複的工作做成了工具，事先放進允許清單。

「工具」是那九個工具；「模型」是結論：兩個模型結果差不多，Sonnet 的花費大約三分之一，所以首頁寫明日常用 Sonnet 就夠。之後改規則，都先跑一次跟改之前比。`
  });

  /* ---------- 新人以簡報為主：23 件事做成什麼樣，和多做的 ---------- */
  const DEC = [
    ['新人怎麼看', '自學為主，有時有人帶', '自學的人看「旁白」；講者照舊用 N、講者視窗'],
    ['新人怎麼看', '旁白預設收起，想看才打開', '每頁下面的「旁白」按鈕，去掉【可略】【提示】段落'],
    ['新人怎麼看', '以 Chrome、Edge 為準', 'Chrome 實測過進度和連結；Edge 還沒實測'],
    ['入口網站', '做成一個資料夾，下載就能看', 'CI 打包 portal.zip 放在 Release；get.py portal 下載或在本機建置'],
    ['入口網站', '卡片、學習路徑、記住看到哪裡、搜尋', '四樣都有；搜尋一次找所有知識庫的簡報頁、小節、術語'],
    ['入口網站', '學習路徑照章節；角色路徑先做機制', '時間用每頁的建議分鐘數算；角色路徑寫在 framework/paths.md，目前還沒有角色'],
    ['入口網站', '一章每頁都翻過就算看完', '進度存在新人自己的瀏覽器（kif.<知識庫>.seen），入口網站讀同一份'],
    ['簡報裡的配套', '看詳細和出處、章末自我檢查、問 Agent', '三個按鈕；章末自我檢查和出處頁自動產生'],
    ['簡報裡的配套', '沒有手冊題目的章用附錄題目', '<b>做法不同</b>：197 題直接搬進各章的「## 自我檢查」，照主題分組，所以每章都有'],
    ['簡報裡的配套', '題目不強制', '沒有題目的章就沒有自我檢查頁'],
    ['簡報和手冊', '簡報必備；每個小節都要有簡報頁', 'check.py 擋：小節沒有簡報頁講到'],
    ['簡報和手冊', '簡報頁可以沒有小節，不另外標示', '68 頁沒有對應小節，照樣算數'],
    ['簡報和手冊', '簡報也算出處；說法不同兩種都列', 'AGENTS.md、kb-learn；read.py --page、--find 讀簡報頁；ADR-0006 取代 ADR-0002'],
    ['簡報和手冊', '雙向點名', '頁序寫成「頁id@頁指紋 → 小節@指紋」，哪一邊改了都點名另一邊'],
    ['簡報和手冊', '新寫和改到的說法要附出處，原本就有的豁免', '這次新寫或改到的句子沒出處會擋；原本就有的只提醒，index.py --todo 列出 22 頁'],
    ['簡報和手冊', '讀者測試也測簡報', 'reader_test.py 也出簡報章的題目卷：只給每一頁的文字和旁白'],
    ['簡報和手冊', '部分和章由簡報決定', '手冊用同樣的編號；章節列沒寫的話照章檔自動產生'],
    ['新增知識', '可以只做簡報頁，手冊選配', 'kb-add 先做簡報頁，一頁放不下才建議寫手冊小節'],
    ['新增知識', '同一個提案裡一起做簡報頁', 'kb-add、kb-change；get.py --here --page 在本機預覽改過的頁'],
    ['新增知識', '每頁都要有圖，機制類要能操作', 'check.py 擋沒有圖的頁；能不能操作由維護者審核時看'],
    ['新增知識', '先整理互動圖樣板', 'Fig.canvas、Fig.steps、Fig.parts；說明文字寫在章檔的「圖說：」'],
    ['工程', '簡報頁文字搬到 Markdown', '90 頁搬到 15 個章檔；互動圖改成 Fig.add，放在 deck/figures/'],
    ['工程', '分三個提案', '#17 引擎和入口網站、提案② 搬移、提案③ 規則和流程，都合併了']
  ];
  const EXTRA = [
    ['網址記頁 id', '簡報網址寫 deck.html#hk1，頁序調整了連結也不會跳錯；舊的頁碼網址（#36）照樣能開。'],
    ['頁碼引用', '文字裡寫 [[頁:頁id]]，顯示時換成「第 N 頁」；插入自動產生的頁也不會指錯。'],
    ['手冊連回簡報', '手冊網站每個小節標題旁有「看簡報」，打開講到它的那一頁。'],
    ['出處頁', '每一頁的註腳在簡報最後自動整理成一頁；頁面上點數字後面的小標號也看得到。'],
    ['常見問題附錄', '不再手寫：建置時由各章的自我檢查題目照主題整理。'],
    ['頁面欄位', 'Markdown 頁多了「標籤」（標題旁的橘色標籤）、「資料」（頁尾來源）、比喻卡可以自訂標題、「圖說：」給樣板用。'],
    ['預覽改過的頁', 'get.py --here --page <頁id>：用這個分支在本機建置，直接打開那一頁，傳承者確認、維護者審核都用。'],
    ['章節列', '頁序沒寫章節列時，照簡報章檔的「# 章名」自動產生，分部分顯示。'],
    ['可以補出處的頁', 'index.py --todo 列出還有數字沒附出處的頁；傳承者開工時也會看到。']
  ];
  const GROUPS = ['全部', ...new Set(DEC.map(d => d[0]))];
  A({
    id: 'deckfirst', part: 5, minutes: 3, short: '新人以簡報為主：做成什麼樣', badge: '10-25 定案',
    title: '新人以簡報為主：23 件事做成什麼樣', en: 'Deck First',
    thesis: '簡報必備、手冊選配、簡報也算出處（<b>ADR-0006 取代 ADR-0002</b>）；新人從<b>入口網站</b>開始。三個提案都合併了。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('df-v', ['23 件事', '多做的'], 0)}<span id="df-gbox"></span></div>
        <div style="flex:1;min-height:0;overflow:auto;background:#fff;border:1px solid var(--line);border-radius:4px" id="df-box"></div></div>
      ${U.side({
        points: ['新人主要看<b>簡報</b>：簡報必備、手冊選配', '簡報的說法也算出處；兩邊說法不同<b>兩種都列</b>', '<b>入口網站</b>：portal.zip，解開就能離線看', '和原本計畫不一樣的：自我檢查題目直接搬進各章的章檔'],
        fact: { v: '23 件事', d: '七輪問答定下來，分三個提案做完' },
        analogy: { icon: 'onion', t: '比喻', p: '像把教材從「課本為主、投影片輔助」改成「投影片為主、課本放細節」：兩份都留著，但新人先拿到的是投影片。' }
      })}</div>`,
    init(el) {
      const box = U.$(el, '#df-box');
      const table = g => `<table class="t" style="font-size:15px"><thead><tr><th style="width:14%">分類</th><th style="width:33%">決定</th><th>做成什麼樣</th></tr></thead><tbody>${DEC.filter(d => g === 0 || d[0] === GROUPS[g]).map(([k, y, how]) =>
        `<tr><td style="font-family:var(--font-mono);font-size:13px;color:var(--accent)">${k}</td><td>${y}</td><td>${how}</td></tr>`).join('')}</tbody></table>`;
      U.onSeg(el, 'df-v', v => {
        if (v === 1) {
          U.$(el, '#df-gbox').innerHTML = '';
          box.innerHTML = `<table class="t" style="font-size:16px"><thead><tr><th style="width:20%">多做的</th><th>是什麼</th></tr></thead><tbody>${EXTRA.map(([n, d]) => `<tr><td><b>${n}</b></td><td>${d}</td></tr>`).join('')}</tbody></table>`;
          return;
        }
        U.$(el, '#df-gbox').innerHTML = U.seg('df-g', GROUPS, 0);
        U.onSeg(el, 'df-g', g => { box.innerHTML = table(g); });
      });
    },
    notes: `10-25 用七輪問答定下來一個大改變：新人以看簡報為主，因為互動和圖像比較好吸收。這一頁列出那 23 件事，和實際做成什麼樣子。

最重要的三件：簡報必備、手冊選配；簡報的說法也算出處，兩邊說法不同時兩種都列，寫在 ADR-0006，取代原本「以手冊為準」的 ADR-0002；簡報頁的文字寫在 Markdown，互動圖只畫圖。

和原本計畫不一樣的地方：自我檢查的題目原本打算從附錄分過去，實際是把 197 題直接搬進各章的章檔，所以每一章都有自我檢查。切到「多做的」，看當初沒講、但做的時候順手補上的東西，例如網址記頁 id、頁碼引用、在本機預覽改過的頁。`
  });

  /* ---------- 之後還可以做的事（都是已經知道、還沒做的，不另外編新計畫） ---------- */
  const LATER = [
    { n: '舊頁補出處', who: '傳承者', why: '搬進來的舊頁有 22 頁的數字還沒有出處，檢查程式只提醒、不擋。', how: '跟 Agent 說「有什麼我可以做的？」，或 <code>python3 framework/tools/index.py semiconductor --todo</code>；一次補一頁或一章，照一般的變更提案。' },
    { n: '角色路徑', who: '框架維護者', why: '入口網站的角色路徑已經做好，但還沒有真的角色，所以先不編。', how: '有真的角色時，跟 Agent 說「加一個新進製程工程師的路徑」，寫進 <code>framework/paths.md</code>；頁 id 寫錯檢查程式會擋。' },
    { n: 'Edge 實測', who: '框架維護者', why: '入口網站的進度和連結只在 Chrome 實測過；Edge 用同一套核心，應該一樣，但還沒實際打開。', how: '用 Edge 打開解開的 portal.zip：看過的頁有沒有打勾、簡報和手冊網站互相連不連得過去。' },
    { n: '電腦視覺的內容', who: '傳承者', why: '電腦視覺只有手冊骨架（4 個部分、15 章），內容和簡報都還沒有。', how: '補內容時照現在的做法：先做簡報頁，一頁放不下才寫手冊小節。' },
    { n: 'GitLab', who: '框架維護者', why: '入口網站的下載用 glab 的寫法還沒實測過；公司確定用 GitLab 時才需要。', how: '在 GitLab 上跑一次 CI 發布，再用 get.py portal 下載看看。' }
  ];
  A({
    id: 'next', part: 5, minutes: 2, short: '之後還可以做的事',
    title: '之後還可以做的事：慢慢補，和等真的需要', en: 'Later',
    thesis: '三個提案都做完了；剩下的是<b>慢慢補</b>的工作，和<b>等真的需要</b>才做的事。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('nx-s', LATER.map(x => x.n), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span id="nx-h"></span><span id="nx-w"></span></div>
          <div class="card" style="background:#fff"><h4>為什麼還沒做</h4><p id="nx-a" style="font-size:18px;color:var(--ink)"></p></div>
          <div class="card key"><h4>怎麼開始</h4><p id="nx-c" style="font-size:18px;color:var(--ink)"></p></div></div></div>
      ${U.side({
        points: ['舊頁補出處：傳承者開工時就會看到', '角色路徑：有真的角色再寫，不先編', '需要的支持：確定 Git 主機和帳號、指定各知識庫的維護者'],
        fact: { v: '22 頁', d: '數字還沒有出處的舊頁（index.py --todo）' },
        analogy: { icon: 'seed', t: '比喻', p: '像搬完家：大件都就位了，剩下的是慢慢整理抽屜，和等有客人來再添椅子。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'nx-s', i => {
        const x = LATER[i];
        U.$(el, '#nx-h').textContent = x.n;
        U.$(el, '#nx-w').textContent = '誰做：' + x.who;
        U.$(el, '#nx-a').innerHTML = x.why;
        U.$(el, '#nx-c').innerHTML = x.how;
      });
    },
    notes: `最後是之後還可以做的事。這些都是已經知道、還沒做的，不是新的計畫。

最常碰到的是舊頁補出處：搬進來的舊頁有 22 頁的數字還沒有出處，檢查程式只提醒，傳承者開工時問「有什麼我可以做的」就會看到。角色路徑的機制做好了，但還沒有真的角色，有了再寫。入口網站只在 Chrome 實測過，Edge 還沒實際打開。電腦視覺只有手冊骨架，補內容時照現在的做法先做簡報頁。GitLab 的下載寫法也還沒實測，公司確定用 GitLab 時再做。

需要的支持還是一樣：確定 Git 主機和帳號，以及指定各知識庫的維護者。`
  });
})();
