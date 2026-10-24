/* 第四部分：怎麼開始（技術選擇、搬半導體、新增知識庫） */
(function () {
  const A = Deck.add.bind(Deck);

  /* 技術選擇：點一列看理由 */
  const COLS = ['單一 HTML、離線可開', '看的人不用裝', '不用重寫現有簡報', '建置要裝'];
  const ROWS = [
    { n: '自寫引擎＋手冊模式', v: [['y', '✓ 可以'], ['y', '✓'], ['y', '✓'], ['', '只要 Python']], d: '沿用半導體的簡報引擎，再加上手冊模式：單一 HTML 裡內嵌 Markdown 轉換器（markdown-it），在瀏覽器裡轉。互動元件沿用現有寫法，全景圖用 Mermaid。<b>這是我們的選擇（ADR-0004）。</b>' },
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
        points: ['全景圖用 <b>Mermaid</b>：Git 主機的網頁也畫得出來', '查找用 <b>grep＋程式產生的索引</b>，不需要向量檢索', 'Agent 流程放在 repo 的 <b>.claude/skills/</b>，拿到就能用'],
        fact: { v: '只要 Python', d: '建置只用 Python 標準函式庫，不用裝套件' },
        analogy: { icon: 'chip', t: '比喻', p: '像寄一份 PDF：對方點開就能看，不用先裝軟體，也不用連網路。' }
      })}</div>`,
    init(el) {
      const rows = U.$$(el, 'tr[data-i]');
      const show = i => { rows.forEach((r, k) => r.classList.toggle('hl', k === i)); U.$(el, '#tl-d').innerHTML = `<b>${ROWS[i].n}</b>：${ROWS[i].d}`; };
      rows.forEach((r, i) => r.onclick = () => show(i));
      show(0);
    },
    notes: `第四部分，怎麼開始。先講技術選擇。手冊網站有一個硬條件：單一 HTML、離線能開、看的人不用裝任何東西，因為新人不一定會裝工具。

點表格每一列看理由。Quarto 的單一文件模式可以，但 89 頁簡報要整份重寫，列為備案；MkDocs Material 輸出一整個資料夾；Slidev 要用伺服器開。所以沿用半導體的自寫引擎，加上手冊模式。查找也不需要向量檢索，幾百個小節用 grep 加索引就夠了。`
  });

  /* 搬半導體：逐步看檔案搬到哪裡 */
  const LEFT = [['gen-qa.py、build-artifact.py', 1], ['js/engine.js、widgets/', 2], ['css/deck.css', 2], ['js/slides/*.js（89 頁）', 3], ['index.html 的 Deck.move', 3], ['assets/img/、js/credits.js', 3], ['docs/qa-by-topic.md（197 題）', 4]];
  const RIGHT = [['AGENTS.md、CLAUDE.md、README.md', 1], ['framework/tools/check.py、build.py', 1], ['CI 設定（主線只強制檢查）', 1], ['framework/engine/', 2], ['kb/semiconductor/deck/slides/', 3], ['kb/semiconductor/deck/order.md', 3], ['kb/semiconductor/assets/＋SOURCES.md', 3], ['handbook/ 各章（每章一個提案）', 4], ['各章常見問題、深入題', 4], ['deck/presenter-guide.md', 4], ['.claude/skills/kb-add … kb-new', 5], ['widgets/（一個一個抽）', 6]];
  const STEPS = [
    { t: '建框架骨架', d: '寫 AGENTS.md 和 README（第一天指南），放上 GitHub 或 GitLab，設定 CI，主線只強制檢查要過；產生問題清單和打包的腳本，換成框架的檢查、建置程式。' },
    { t: '抽出共用引擎', d: '把簡報引擎、互動元件工具和樣式搬進 framework/engine/，所有知識庫共用；材料配色、畫電子這類半導體專用的工具，留在 kb/semiconductor/widgets/。' },
    { t: '搬簡報，照舊能播', d: '第一個變更提案：89 頁搬進 kb/semiconductor/deck/；Deck.move 改成頁序檔；credits.js 改成圖片清單。' },
    { t: '每章一個提案，抽出手冊', d: '從簡報抽出手冊，一次一章給維護者審；197 題拆進各章的常見問題，給有經驗的人的題目變成深入題，上台的提醒放進講者須知。' },
    { t: '補上五個流程', d: '寫 kb-add、kb-change、kb-learn、kb-review、kb-new 五個 skill。' },
    { t: '之後：互動元件一個一個抽', d: '哪個元件值得在手冊網站裡操作，再用變更提案一個一個抽出來。' }
  ];
  A({
    id: 'plan', part: 4, minutes: 2, short: '把半導體搬進來',
    title: '第一步：把半導體搬成第一個知識庫', en: 'Migration',
    thesis: '骨架和搬遷一起做，用半導體試過每一條規則，<b>每章一個變更提案</b>。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fileflow">
          <div class="fbox"><h4>Semi_Conductor_Manufactor/（現在）</h4>${LEFT.map(([t, s]) => `<div class="fchip" data-s="${s}">${t}</div>`).join('')}</div>
          <div class="farrow">→</div>
          <div class="fbox"><h4>Knowledge_Inheritance_Framework/（搬完）</h4>${RIGHT.map(([t, s]) => `<div class="fchip" data-r="${s}">${t}</div>`).join('')}</div>
        </div>${U.stepperHTML('pl-st')}</div>
      ${U.side({
        points: ['先讓簡報<b>照舊能播</b>，再慢慢抽出手冊', '互動元件先不抽，之後一個一個來', 'GitHub 上的公開版維持現狀，不再同步', '不保留舊的 git 歷史；舊資料夾確認後才刪'],
        fact: { v: '89 頁、197 題', d: '半導體的簡報和問題全部搬進來' },
        analogy: { icon: 'shovel', t: '比喻', p: '像搬家：先把家具原樣搬過去，確定能住，再一間一間整理收納。' }
      })}</div>`,
    init(el, ctx) {
      U.stepper(el, 'pl-st', STEPS, i => {
        const s = i + 1;
        U.$$(el, '[data-s]').forEach(c => { const k = +c.dataset.s; c.className = 'fchip' + (k === s ? ' now' : k < s ? ' gone' : ''); });
        U.$$(el, '[data-r]').forEach(c => { const k = +c.dataset.r; c.className = 'fchip' + (k === s ? ' now' : k < s ? ' new' : ' wait'); });
      }, ctx, { interval: 2400 });
    },
    notes: `第一步：把半導體搬成第一個知識庫。按「下一步」看檔案搬到哪裡，橘框是這一步正在動的檔案。

先建框架骨架、抽出共用引擎，再把 89 頁簡報原樣搬進去，搬完要照舊能播。接著每章一個變更提案抽出手冊，一次只審一章，197 題拆進各章的常見問題。最後補上五個流程的 skill，互動元件之後再一個一個抽。

GitHub 上的公開版維持現狀，不再同步；舊資料夾等搬遷確認沒問題才刪。`
  });
  /* 新增一個知識庫：以 CV 為例 */
  const NK_FILES = [['kb/cv/README.md', '介紹、維護者、全景圖草稿', 2], ['kb/cv/terms.md', '術語表：CNN、mAP、IoU……', 2], ['handbook/1-basics/', '部分：影像基礎（只有章名）', 2], ['handbook/2-models/', '部分：模型（只有章名）', 2], ['01-image.md、02-conv.md……', '一章一個變更提案補內容', 4], ['deck/', '選配：要上課再做，照簡報的規範', 6]];
  const NK_STEPS = [
    { t: '發起人開口', d: '「我想開一個電腦視覺的知識庫。」用 /kb-new，或直接這樣說。' },
    { t: 'Agent 訪談、建骨架', d: 'Agent 問：領域是什麼、讀者是誰、大概分哪幾個部分和章、誰當維護者、手上有沒有現成資料；問完建好骨架。' },
    { t: '框架維護者核准', d: '骨架是一個變更提案。核准後知識庫就成立，發起人是第一位維護者，首頁的知識庫清單自動多一列。' },
    { t: '一章一章補內容', d: '用研究、整理、訪談補上各章；有舊簡報和文件就整批整理，但還是一章一個提案。術語表跟著長。' },
    { t: '新人開始用', d: '新人從知識庫清單挑 CV 來讀、來問；待回答和勘誤標上 kb:cv。' },
    { t: '之後：要上課再做簡報', d: '簡報是選配；要做就照半導體範例的樣子，互動元件一開始就寫成共用元件。' }
  ];
  A({
    id: 'newkb', part: 4, minutes: 2, short: '新增一個知識庫',
    title: '新增一個知識庫：以 CV 為例，先建骨架再補內容', en: 'New Knowledge Base',
    thesis: '「大主題」就是一個知識庫，和半導體並列；<b>/kb-new</b> 訪談、建骨架，框架維護者核准就成立。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>按「下一步」看 CV 知識庫怎麼長出來</span><span>kb:cv</span></div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="fbox"><h4>kb/cv/</h4>${NK_FILES.map(([f, n, s]) => `<div class="fchip" data-s="${s}"><b>${f}</b><br><span style="font-size:13px">${n}</span></div>`).join('')}</div>
          <div class="fbox"><h4>首頁的知識庫清單（程式自動產生）</h4>
            <table class="t" style="font-size:15px"><thead><tr><th>知識庫</th><th>維護者</th><th>簡報</th></tr></thead>
            <tbody><tr><td>半導體製程</td><td>（維護者）</td><td class="y">有</td></tr><tr id="nk-row"><td><b>電腦視覺</b></td><td>（發起人）</td><td class="m">還沒有</td></tr></tbody></table></div>
        </div></div>${U.stepperHTML('nk-st')}</div>
      ${U.side({
        points: ['和半導體<b>並列</b>，有自己的維護者和手冊', '先建<b>骨架</b>，框架維護者核准才成立', '內容一章一個提案；有現成資料就整批整理', '每個知識庫有自己的<b>術語表</b>'],
        fact: { v: '1 個指令', d: '/kb-new：訪談、建骨架、開變更提案' },
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
    notes: `第二步是之後最常發生的事：新增一個知識庫。你說的「大主題」，在框架裡就是一個知識庫，例如電腦視覺，和半導體並列，有自己的手冊、維護者和術語表。

按「下一步」看它怎麼長出來。發起人說「我想開一個電腦視覺的知識庫」，Agent 先訪談：領域、讀者、大概分哪幾個部分和章、誰當維護者、有沒有現成資料。問完建好骨架，交給框架維護者核准；核准後知識庫就成立，首頁的知識庫清單自動多一列。

內容之後一章一章補。CV 團隊手上的舊簡報和文件可以整批整理，但還是一章一個提案，維護者一次審一章。簡報是選配，要上課再做，照半導體範例的樣子。`
  });
})();
