/* 第四部分：怎麼開始（技術選擇、搬半導體、新增知識庫） */
(function () {
  const A = Deck.add.bind(Deck);

  /* 技術選擇：點一列看理由 */
  const COLS = ['單一 HTML、離線可開', '看的人不用裝', '不用重寫現有簡報', '建置要裝'];
  const ROWS = [
    { n: '自寫引擎', v: [['y', '✓ 可以'], ['y', '✓'], ['y', '✓'], ['', '只要 Python']], d: '沿用半導體的簡報引擎：每份簡報是單一 HTML，互動元件沿用現有寫法。當初還加了手冊模式（單一 HTML 裡內嵌 Markdown 轉換器），10-26 拿掉手冊時一起拿掉。<b>這是我們的選擇（ADR-0004）。</b>' },
    { n: 'Quarto', v: [['m', '△ 單一文件模式才行'], ['y', '✓'], ['n', '✗ 要整份重寫'], ['', 'Quarto CLI']], d: '網站模式不能做成單一檔；單一文件＋reveal.js 可以，但 89 頁簡報要整份重寫，建置的人也要另外安裝 Quarto。列為備案。' },
    { n: 'MkDocs Material', v: [['n', '✗ 輸出一整個資料夾'], ['y', '✓'], ['n', '✗'], ['', 'Python 套件']], d: '輸出一整個資料夾，做不成單一 HTML；而且已經進入維護模式。' },
    { n: 'Slidev', v: [['n', '✗ 要用伺服器開'], ['m', '△ 要有人架伺服器'], ['n', '✗'], ['', 'Node.js']], d: '輸出要用伺服器開的資料夾，不能直接離線打開單一檔。' }
  ];
  A({
    id: 'tools', part: 4, minutes: 2, short: '技術選擇',
    title: '技術選擇：沿用半導體的自寫引擎', en: 'Why Our Own Engine',
    thesis: '第一條件是<b>單一 HTML、離線能開、看的人不用裝東西</b>，研究過的主流工具都做不到。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點一列看理由</span><span>依 docs/research/existing-approaches.md</span></div>
        <table class="t" style="font-size:17px"><thead><tr><th style="width:24%">做法</th>${COLS.map(c => `<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${ROWS.map((r, i) => `<tr class="clickable" data-i="${i}"><td><b>${r.n}</b></td>${r.v.map(([k, t]) => `<td class="${k}">${t}</td>`).join('')}</tr>`).join('')}</tbody></table>
        <div class="card key" id="tl-d" style="font-size:18px;margin-top:auto"></div></div></div>
      ${U.side({
        points: ['全景圖由入口網站<b>自動畫</b>：照部分和章排，先修畫成箭頭', '查找用 <b>grep＋程式產生的索引</b>，不需要向量檢索', 'Agent 流程放在 repo 的 <b>.claude/skills/</b>，拿到就能用', '入口網站也一樣：一個資料夾，離線打開'],
        fact: { v: '只要 Python', d: '建置只用 Python 標準函式庫，不用裝套件' },
        analogy: { icon: 'chip', t: '比喻', p: '像寄一份 PDF：對方點開就能看，不用先裝軟體，也不用連網路。' }
      })}</div>`,
    init(el) {
      const rows = U.$$(el, 'tr[data-i]');
      const show = i => { rows.forEach((r, k) => r.classList.toggle('hl', k === i)); U.$(el, '#tl-d').innerHTML = `<b>${ROWS[i].n}</b>：${ROWS[i].d}`; };
      rows.forEach((r, i) => r.onclick = () => show(i));
      show(0);
    },
    notes: `第四部分，怎麼開始。先講技術選擇。當初選工具時有一個硬條件：單一 HTML、離線能開、看的人不用裝任何東西，因為新人不一定會裝工具。

點表格每一列看理由。Quarto 的單一文件模式可以，但 89 頁簡報要整份重寫，列為備案；MkDocs Material 輸出一整個資料夾；Slidev 要用伺服器開。所以沿用半導體的自寫引擎。當初還加了手冊模式，10-26 拿掉手冊時一起拿掉，現在只有簡報引擎和入口網站。查找也不需要向量檢索，一百多頁用 grep 加索引就夠了。`
  });

  /* 搬半導體：逐步看檔案搬到哪裡 */
  const LEFT = [['gen-qa.py、build-artifact.py', 1], ['js/engine.js、widgets/', 2], ['css/deck.css', 2], ['js/slides/*.js（89 頁）', 3], ['index.html 的 Deck.move', 3], ['assets/img/、js/credits.js', 3], ['docs/qa-by-topic.md（197 題）', 4]];
  const RIGHT = [['AGENTS.md、CLAUDE.md、README.md', 1], ['framework/tools/check.py、build.py', 1], ['CI 設定（主線只強制檢查）', 1], ['framework/engine/', 2], ['kb/semiconductor/deck/slides/（90 頁，原樣）', 3], ['kb/semiconductor/deck/order.md', 3], ['kb/semiconductor/assets/＋SOURCES.md', 3], ['handbook/：微影、閘極、檢測量測', 4, 7], ['各章常見問題、深入題', 4, 7], ['.claude/skills/kb-add … kb-new', 5], ['deck/<部分>/<章>.md（15 個章檔）', 6], ['deck/figures/（互動圖）＋ 樣板', 6], ['各章的「## 自我檢查」（197 題）', 6], ['28 頁深入頁（頁 id 加 -d）', 7], ['每章開頭的速覽和先修', 7]];
  const STEPS = [
    { t: '建框架骨架', d: '寫 AGENTS.md 和 README（第一天指南），放上 GitHub，設定 CI，主線只強制檢查要過；換成框架的檢查、建置程式。' },
    { t: '抽出共用引擎', d: '簡報引擎、互動元件工具和樣式搬進 framework/engine/；半導體專用的工具留在 kb/semiconductor/widgets/。' },
    { t: '搬簡報，照舊能播', d: '90 頁原樣搬進 kb/semiconductor/deck/；Deck.move 改成頁序檔；credits.js 改成圖片清單。' },
    { t: '每章一個提案，抽出手冊', d: '抽出 3 章：閘極（#1）、微影（#2）、檢測量測（#3）。手冊是選配，其他章只有簡報頁。' },
    { t: '補上五個流程', d: 'kb-add、kb-change、kb-learn、kb-review、kb-new；後來把重複的工作做成工具，寫清楚做到哪裡算完成。' },
    { t: '簡報頁的文字搬到 Markdown', d: '90 頁的文字搬到 15 個簡報章檔，互動圖改成 Fig.add 放在 deck/figures/；197 題照主題搬進各章的「## 自我檢查」；整理出三種互動圖樣板。' },
    { t: '只留簡報：手冊搬成深入頁', d: '手冊三章的 28 個小節，原文照搬成 28 頁深入頁，接在主頁後面；手冊的常見問題併進自我檢查，handbook/ 刪掉；15 章都寫好速覽和先修。' }
  ];
  A({
    id: 'plan', part: 4, minutes: 2, short: '把半導體搬進來',
    title: '把半導體搬進來：全部搬完了', en: 'Migration',
    thesis: '先讓 90 頁簡報<b>照舊能播</b>，再抽出 3 章手冊、把文字搬進<b>簡報章檔</b>，最後把手冊搬成<b>深入頁</b>。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fileflow">
          <div class="fbox"><h4>Semi_Conductor_Manufactor/（搬之前）</h4>${LEFT.map(([t, s]) => `<div class="fchip" data-s="${s}">${t}</div>`).join('')}</div>
          <div class="farrow">→</div>
          <div class="fbox"><h4>Knowledge_Inheritance_Framework/（搬完）</h4>${RIGHT.map(([t, s, g]) => `<div class="fchip" data-r="${s}"${g ? ` data-g="${g}"` : ''}>${t}</div>`).join('')}</div>
        </div>${U.stepperHTML('pl-st')}</div>
      ${U.side({
        points: ['先讓簡報<b>照舊能播</b>，再一步一步整理', '手冊先抽出 3 章、28 個小節，後來搬成 <b>28 頁深入頁</b>', '每一頁的文字搬進 <b>15 個簡報章檔</b>，互動圖只畫圖', '題目照主題搬進各章的<b>自我檢查</b>，現在共 200 題'],
        fact: { v: '90＋28 頁', d: '主頁和深入頁都寫成 Markdown；題目在各章的自我檢查' },
        analogy: { icon: 'shovel', t: '比喻', p: '像搬家：先把家具原樣搬過去，確定能住，再一間一間整理收納。' }
      })}</div>`,
    init(el, ctx) {
      U.stepper(el, 'pl-st', STEPS, i => {
        const s = i + 1;
        U.$$(el, '[data-s]').forEach(c => { const k = +c.dataset.s; c.className = 'fchip' + (k === s ? ' now' : k < s ? ' gone' : ''); });
        U.$$(el, '[data-r]').forEach(c => { const k = +c.dataset.r, g = +c.dataset.g || 99; c.className = 'fchip' + (s >= g ? (s === g ? ' now gone' : ' gone') : k === s ? ' now' : k < s ? ' new' : ' wait'); });
      }, ctx, { interval: 2400 });
    },
    notes: `把半導體搬成第一個知識庫，已經全部做完。按「下一步」看檔案搬到哪裡，橘框是這一步正在動的檔案。

框架骨架、共用引擎先做好，再把 90 頁簡報原樣搬進去，照舊能播。手冊用每章一個變更提案抽出了閘極、微影、檢測量測三章；那時手冊是選配，其他章只有簡報頁。五個流程的 skill 也寫好了。

第六步是新人以簡報為主之後加的：每一頁的文字搬進 15 個簡報章檔，互動圖改成 Fig.add 放在 deck/figures/，197 題照主題搬進各章的自我檢查，也整理出三種互動圖樣板。原本打算把互動元件一個一個抽出來，改成新頁先套樣板。

最後一步是 10-26 只留簡報時做的：手冊三章的 28 個小節，原文照搬成 28 頁深入頁，接在主頁後面；手冊的常見問題併進自我檢查，handbook/ 整個刪掉，畫刪除線的就是拿掉的東西；15 章也都寫好了速覽和先修。`
  });
  /* 新增一個知識庫：以 CV 為例 */
  const NK_FILES = [['kb/cv/README.md', '介紹、維護者；全景圖在入口網站自動畫', 2], ['kb/cv/terms.md', '術語表：CNN、mAP、IoU……', 2], ['deck/order.md', '頁序：部分和頁面', 2], ['deck/1-basics/01-image-formation.md……', '一章一個章檔，開頭寫速覽和先修', 2], ['主頁、深入頁', '一章一個變更提案補內容', 4]];
  const NK_STEPS = [
    { t: '發起人開口', d: '「我想開一個電腦視覺的知識庫。」用 /kb-new，或直接這樣說。' },
    { t: 'Agent 訪談、建骨架', d: 'Agent 問：領域是什麼、讀者是誰、大概分哪幾個部分和章、每章的速覽和先修、誰當維護者、手上有沒有現成資料；問完用 new_kb.py 一次建好骨架。' },
    { t: '框架維護者核准', d: '骨架是一個變更提案。核准後知識庫就成立，發起人是第一位維護者，首頁的知識庫清單自動多一列。' },
    { t: '一章一章補內容', d: '用研究、整理、訪談補上各章；有舊簡報和文件就整批整理，但還是一章一個提案。術語表跟著長。' },
    { t: '新人開始用', d: '新人從入口網站挑 CV 來讀、來問；還沒有頁時，全景圖和速覽就看得到；待回答和勘誤標上 kb:cv。' },
    { t: '只有簡報', d: '新增知識時 Agent 做成簡報頁，先套互動圖樣板；一頁放不下的細節，建議接一頁深入頁。' }
  ];
  A({
    id: 'newkb', part: 4, minutes: 2, short: '新增一個知識庫',
    title: '新增一個知識庫：以 CV 為例，先建骨架再補內容', en: 'New Knowledge Base',
    thesis: '「大主題」就是一個知識庫，和半導體並列；<b>/kb-new</b> 訪談、用 new_kb.py 建簡報骨架，框架維護者核准就成立。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>按「下一步」看 CV 知識庫怎麼長出來</span><span>kb:cv</span></div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="fbox"><h4>kb/cv/</h4>${NK_FILES.map(([f, n, s]) => `<div class="fchip" data-s="${s}"><b>${f}</b><br><span style="font-size:13px">${n}</span></div>`).join('')}</div>
          <div class="fbox"><h4>首頁的知識庫清單（程式自動產生）</h4>
            <table class="t" style="font-size:15px"><thead><tr><th>知識庫</th><th>維護者</th><th>簡報</th></tr></thead>
            <tbody><tr><td>半導體製程</td><td>（維護者）</td><td class="y">有</td></tr><tr id="nk-row"><td><b>電腦視覺</b></td><td>（發起人）</td><td class="m">骨架</td></tr></tbody></table></div>
        </div></div>${U.stepperHTML('nk-st')}</div>
      ${U.side({
        points: ['和半導體<b>並列</b>，有自己的維護者和簡報', '先建<b>骨架</b>，框架維護者核准才成立', '內容一章一個提案；有現成資料就整批整理', '每個知識庫有自己的<b>術語表</b>'],
        fact: { v: '1 個指令', d: '/kb-new：訪談、用 new_kb.py 建骨架、開變更提案' },
        analogy: { icon: 'seed', t: '比喻', p: '像開一家分店：先談好地點和店長、掛上招牌，總部核准開幕，菜單再一道一道上。' }
      })}</div>`,
    init(el, ctx) {
      const row = U.$(el, '#nk-row');
      U.stepper(el, 'nk-st', NK_STEPS, i => {
        const s = i + 1;
        U.$$(el, '[data-s]').forEach(c => { const k = +c.dataset.s; c.className = 'fchip' + (k === s ? ' now' : k < s ? ' new' : ' wait'); });
        row.style.opacity = s >= 3 ? 1 : .15;
        row.style.background = s === 3 ? 'var(--accent-2-soft)' : '';
      }, ctx, { interval: 2400 });
    },
    notes: `第二步是之後最常發生的事：新增一個知識庫。你說的「大主題」，在框架裡就是一個知識庫，例如電腦視覺，和半導體並列，有自己的簡報、維護者和術語表。

按「下一步」看它怎麼長出來。發起人說「我想開一個電腦視覺的知識庫」，Agent 先訪談：領域、讀者、大概分哪幾個部分和章、誰當維護者、有沒有現成資料。問完建好骨架，交給框架維護者核准；核准後知識庫就成立，首頁的知識庫清單自動多一列。

內容之後一章一章補。CV 團隊手上的舊簡報和文件可以整批整理，但還是一章一個提案，維護者一次審一章。

只留簡報之後，骨架就是簡報：new_kb.py 建頁序和每一章的章檔，每章開頭寫好速覽和先修，入口網站的全景圖馬上看得到。電腦視覺當初（#9）建的是手冊骨架，#21 改成了簡報骨架：13 章，還沒有頁。`
  });
})();
