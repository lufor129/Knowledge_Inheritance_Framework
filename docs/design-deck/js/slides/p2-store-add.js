/* 第二部分 ①② 知識怎麼存、新增 */
(function () {
  const A = Deck.add.bind(Deck);
  const C1 = { chap: 1, eyebrow: '第二部分 · ① 知識怎麼存' };
  const C2 = { chap: 2, eyebrow: '第二部分 · ② 新增' };

  /* ① 檔案結構：點左邊的檔案看內容 */
  const FILES = [
    { label: 'Knowledge_Inheritance_Framework/', d: 0, note: '整個框架和所有知識庫都在這一個 repo，全公司都能看（ADR-0003）。', code: `Knowledge_Inheritance_Framework/
├─ AGENTS.md         所有 Agent 共用的核心規則
├─ CLAUDE.md         只有一行：@AGENTS.md
├─ README.md         第一天指南、知識庫清單、框架維護者
├─ GLOSSARY.md       用語表
├─ docs/adr/         決策紀錄
├─ .claude/          skills/（五個流程）、settings.json（允許清單、擋危險 git 指令）
├─ .github/          CI：檢查、建置、發布到 Release
├─ framework/
│  ├─ engine/        入口網站和簡報的共用引擎；
│  │                 figures/ 是互動圖樣板
│  ├─ tools/         check、build、read、index、who、proposal、
│  │                 get、reader_test、new_kb
│  ├─ guide/         簡報、寫作、讀者測試、Git 主機、改框架
│  ├─ templates/     新知識庫的範本
│  ├─ tests/         情境測試
│  └─ paths.md       入口網站的角色路徑
└─ kb/
   ├─ semiconductor/
   │  ├─ README.md   介紹、維護者
   │  ├─ terms.md    術語表（主題索引從它產生）
   │  ├─ deck/       order.md（頁序）、<部分>/<章>.md（15 個章檔：
   │  │              速覽、先修、主頁、深入頁、自我檢查）、figures/（互動圖）
   │  ├─ widgets/    互動圖共用的程式
   │  ├─ assets/     圖片＋SOURCES.md
   │  └─ dist/       建置結果，不進版控
   └─ cv/            電腦視覺：簡報骨架（4 個部分、13 章，還沒有頁）` },
    { label: 'kb/semiconductor/README.md', d: 1, note: '知識庫的首頁：介紹和維護者名單。全景圖不用畫：入口網站照部分和章自動排。', code: `# 半導體製程

給半導體新人的知識庫：從電晶體結構演進、
十章製程與量產，到先進封裝與背面供電。

## 維護者
- （維護者名字）

## 全景圖
全景圖在入口網站：照部分和章自動排，
先修畫成箭頭，點一章看它在講什麼。` },
    { label: 'deck/order.md', d: 1, note: '頁序：由上到下就是播放順序，一行一頁；深入頁緊接在它的主頁後面。', code: `# 頁序（節錄）

## 章節列
- 1：微影 → litho1
- 5：閘極 → hk1
（沒寫的話，照章檔的「# 章名」自動產生）

## 頁面
- cover
- etch1
- hk1
- hk1-d
- hk2-d
- hk3-d
- hk4-d
- cmp1` },
    { label: 'deck/2-manufacturing/05-gate.md', d: 1, note: '章檔：開頭是速覽和先修，接著一頁一個「錨點＋## 標題」，最後是這一章的自我檢查。', code: `# 閘極

- 速覽：閘極不碰通道，而是隔著一道很薄的絕緣牆，
  用電場控制通道開或關……
- 先修：第一部分 · 演進與現況

<a name="hk1"></a>
## 絕緣牆的兩難：電場要過得去，電子不要過去

- 建議：5.2 分
- 圖：hk1              互動圖在 deck/figures/

結論：閘極隔著一道絕緣牆，用**電場**控制通道……

重點：
- **電場要過得去**：牆越薄，閘極越控制得住通道
- 二氧化鉿傳電場的能力約是二氧化矽的 **4–6 倍**

比喻（wall）：隔著牆用磁鐵（閘極）吸鐵片……

旁白：
第五章：閘極。回到電晶體的核心……

（後面接 hk1-d … hk4-d 四頁深入頁，下一頁看）

## 自我檢查

<details>
<summary>為什麼選二氧化鉿？</summary>
它傳遞電場的能力約是二氧化矽的 4–6 倍……
相關：hk1、hk3-d
</details>` },
    { label: '…　深入頁 hk3-d', d: 2, note: '深入頁也是簡報頁：「深入：」寫它接在哪一頁後面；畫面放圖和重點，「說明：」的長文放在畫面下方。', code: `<a name="hk3-d"></a>
## 換成二氧化鉿：牆做厚，電場照樣過得去

- 深入：hk1
- 圖：同主頁           沿用 hk1 的互動圖
- 建議：3 分

重點：
- 換材料：傳電場能力（介電常數 k）高的牆，可以做厚
- 二氧化鉿和矽接觸時比較穩定，但怕高溫，要最後才鋪

說明：
既然二氧化矽不能再薄，解法就是換材料……

### 實際的牆：介面層加上二氧化鉿

比較兩道不同材料的牆時，業界用等效氧化層厚度……` },
    { label: 'deck/figures/', d: 1, note: '互動圖只畫圖、管操作；要讓新人讀的文字寫在章檔（重點、圖說、說明、旁白）。新做的頁先套三種樣板。', code: `// 拉桿看變化、切換比較
Fig.add('hk-wall', Fig.canvas({
  title: '閘極與通道之間',
  segs: [{ id: 'k', items: ['二氧化矽', '二氧化鉿'] }],
  sliders: [{ id: 't', label: '厚度', min: 0.6, max: 4,
              step: 0.1, value: 2.5, unit: ' nm' }],
  draw(c, w, h, v) { … }
}));

// 一步步播放：每一步的說明寫在章檔的「圖說：」
Fig.add('gaa-flow', Fig.steps({ … }));

// 可以點的結構圖：每個零件的說明也寫在「圖說：」
Fig.add('mos-parts', Fig.parts({ … }));

套不上的才自己寫 Fig.add('名稱', { render, init })。
樣板在 framework/engine/figures/templates.js。` },
    { label: 'assets/SOURCES.md', d: 1, note: '圖片清單：每張圖片的說明和出處；不在清單上的圖片不能用。', code: `# 圖片清單

| 檔名             | 說明         | 出處           |
|------------------|--------------|----------------|
| wafer-12inch.jpg | 12 吋晶圓    | 網址           |
| tem-gaa.jpg      | 環繞式 TEM   | 論文、第幾張圖 |

只寫出處，不用寫授權（框架只在公司內部使用）。` }
  ];
  A(Object.assign({
    id: 'struct', part: 2, minutes: 2, short: '知識怎麼存',
    title: '知識怎麼存：一章一個章檔，主頁加深入頁', en: 'Structure',
    thesis: '內容只有<b>簡報</b>一份：章檔開頭是<b>速覽和先修</b>，接著是主頁和接在後面的<b>深入頁</b>，最後是自我檢查。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點左邊的檔案看內容</span><span>路徑英文、內容繁中</span></div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:290px 1fr;gap:14px">
          <div class="tree" id="st-tree">${FILES.map((f, i) => `<button type="button" class="d${f.d}" data-i="${i}">${f.label}</button>`).join('')}</div>
          <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0"><p class="caption" id="st-note" style="margin:0;font-size:16px"></p><pre class="code" id="st-code" style="flex:1;min-height:0"></pre></div>
        </div></div></div>
      ${U.side({
        points: ['<b>一個 repo</b> 放所有知識庫，全公司都能看', '頁 id 用短英文（hk1、深入頁 hk3-d），<b>建立後不改名</b>', '數字用註腳附出處；圖片要列進<b>圖片清單</b>', '文字寫在 <b>Markdown</b> 章檔，互動圖寫在程式'],
        fact: { v: '90 ＋ 28 頁', d: '半導體的主頁和深入頁，寫在 15 個章檔；200 題自我檢查' },
        analogy: { icon: 'tile', t: '比喻', p: '像一本圖解書：每一頁講一件事，想多知道一點就翻後面的「延伸閱讀」，不想看就跳過。' }
      })}</div>`,
    init(el) {
      const btns = U.$$(el, '#st-tree button');
      const show = i => { btns.forEach((b, k) => b.classList.toggle('on', k === i)); U.$(el, '#st-note').textContent = FILES[i].note; U.$(el, '#st-code').textContent = FILES[i].code; };
      btns.forEach((b, i) => b.onclick = () => show(i));
      show(3);
    },
    notes: `第一章，知識怎麼存。框架和所有知識庫都放在同一個 repo，每個知識庫是 kb 底下的一個資料夾。2026-10-26 起，知識庫的內容只有簡報一份，沒有手冊了。

點左邊的 deck/2-manufacturing/05-gate.md 看章檔：開頭是這一章的速覽和先修，入口網站會顯示；接著一頁是一個錨點加標題，底下是結論、重點、數字卡、比喻、旁白；最後是這一章的自我檢查。一頁放不下的長說明，做成接在後面的深入頁，點 hk3-d 看：「深入：」寫它接在哪一頁後面，圖可以沿用主頁的，長文寫在「說明：」。

頁 id 建立之後就不改名。頁序 order.md 一行一頁，深入頁緊接在主頁後面。路徑用英文，內容用繁體中文。`
  }, C1));

  /* ① 主頁和深入頁（ADR-0007） */
  const DP_MAIN = [{ id: 'hk1', t: '絕緣牆的兩難' }, { id: 'cmp1', t: 'CMP：把每一層都磨到平' }];
  const DP_DEEP = [{ id: 'hk1-d', t: '絕緣牆的兩難（長說明）' }, { id: 'hk2-d', t: '太薄就漏電：量子穿隧' }, { id: 'hk3-d', t: '換成二氧化鉿' }, { id: 'hk4-d', t: '金屬閘極' }];
  const DP_EV = [
    { n: '照順序翻', m: { hk1: 'sel', cmp1: 'sel' }, d: {}, x: '照順序翻只會經過主頁：hk1 的下一頁就是 cmp1，四頁深入頁不會出現。頁碼、學習路徑的時間和進度都只算主頁：閘極這一章 1 頁、約 5 分，另有 4 頁深入（選看）。' },
    { n: '按「看深入」', m: { hk1: 'sel' }, d: { 'hk1-d': 'hit' }, x: '主頁下面的「看深入（4 頁）」翻到第一頁深入頁，頁碼顯示成「主頁的頁碼 · 深入 1/4」。畫面縮到上面，說明放在下面、預設展開；圖沿用主頁的互動圖。' },
    { n: '在深入頁上翻', m: { cmp1: 'sel' }, d: { 'hk1-d': 'sel', 'hk2-d': 'sel', 'hk3-d': 'sel', 'hk4-d': 'sel' }, x: '深入頁之間照順序翻；看完最後一頁 hk4-d 再翻，就到下一個主頁 cmp1。不想看完，按「跳過深入」直接到 cmp1，或按「回主頁」回到 hk1。' },
    { n: '改了主頁 hk1', m: { hk1: 'sel' }, d: { 'hk3-d': 'hit' }, x: '改主頁時，Agent 一起看後面的深入頁和指向它的自我檢查，說法要一致。只有一份內容，沒有另一份文件要對照，也沒有指紋要更新。' },
    { n: '新寫一段沒出處', m: {}, d: { 'hk3-d': 'hit del' }, x: '<b>擋下</b>：深入頁說明裡新寫的一段有數字、沒有出處。原本就有、還沒出處的只提醒，列在 index.py --todo 慢慢補。' }
  ];
  A(Object.assign({
    id: 'canon', part: 2, minutes: 2.5, short: '主頁和深入頁', badge: '10-26 起',
    title: '主頁和深入頁：一頁放不下的，接在後面', en: 'Main & Deep-dive',
    thesis: '主頁一頁講一個概念；推導、表格、很多出處做成<b>深入頁</b>，平常翻頁不會經過，<b>按「看深入」才進去</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('cn-seg', DP_EV.map(x => x.n), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>閘極這一章：主頁 → 深入頁 → 下一章</span><span>ADR-0007</span></div>
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.3fr;gap:16px">
            <div class="rcol"><h4>主頁（照順序翻會看到）</h4><div class="ritems" id="cn-main"></div></div>
            <div class="rcol"><h4>深入頁（接在 hk1 後面，按了才進去）</h4><div class="ritems" id="cn-deep"></div></div>
          </div>
          <div class="card" id="cn-res" style="font-size:18px"></div></div></div>
      ${U.side({
        points: ['<b>只有簡報一份</b>：不用兩份對照、不用指紋', '深入頁按「看深入」才進去，<b>頁碼和學習路徑不算</b>它', '說明可以有表格、圖片、公式、出處註腳', '一頁放不下時，Agent <b>建議</b>做深入頁，傳承者決定'],
        fact: { v: '28 頁', d: '手冊三章的 28 個小節，原文照搬成深入頁，接在 22 個主頁後面' },
        analogy: { icon: 'film', t: '比喻', p: '像影片的延伸片段：主線照順序播，想多知道一點再點進去看，看完接著播下一段。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'cn-seg', k => {
        const e = DP_EV[k];
        U.$(el, '#cn-main').innerHTML = DP_MAIN.map(p => `<div class="ritem ${e.m[p.id] || ''}">${p.t}<span class="ids">${p.id}</span></div>`).join('');
        U.$(el, '#cn-deep').innerHTML = DP_DEEP.map(p => `<div class="ritem ${e.d[p.id] || ''}" style="border-style:dashed">${p.t}<span class="ids">${p.id} · 深入：hk1</span></div>`).join('');
        U.$(el, '#cn-res').innerHTML = e.x;
      });
    },
    notes: `2026-10-26 起拿掉手冊，只留簡報，寫在 ADR-0007。一頁放不下的長說明，做成接在主頁後面的深入頁。

點上面幾種情況看看。照順序翻只會經過主頁，深入頁不會出現；在主頁按「看深入」才進去，說明放在畫面下方、預設展開。深入頁之間照順序翻，看完最後一頁再翻就到下一個主頁。頁碼、學習路徑的時間和進度都只算主頁，深入頁另外標「選看」。原本定案是照順序翻會經過、可以一鍵跳過，10-26 試用後改成平常不經過。

改主頁的時候，Agent 一起看後面的深入頁和自我檢查，說法要一致；因為只有一份內容，不用再兩邊對照、更新指紋。深入頁說明裡新寫的一段有數字沒出處，檢查會擋。

半導體原本手冊三章的 28 個小節，原文照搬成 28 頁深入頁。`
  }, C1));

  /* ② 三種新增方式：對話逐句出現 */
  const MODES = [
    { n: '研究', me: '傳承者', chat: [['me', '幫我研究 High-NA EUV，放進微影那章。'], ['ai', '好。我會用自己的知識和找到的資料，整理它和現在的 EUV 差在哪、為什麼要做、代價是什麼。數字一定附出處，找不到出處的就不寫。'], ['ai', '簡報頁草稿好了，放在微影那章的最後，頁 id 我建議用 litho9；一頁放得下，不用另做深入頁。你看看哪裡要改？']] },
    { n: '整理', me: '傳承者', chat: [['me', '參考這份《黃光區新人 SOP》第 3–8 頁，整理進微影那章。'], ['ai', '這幾頁有 5 個步驟和 2 個常見錯誤。我會做成兩頁簡報：步驟用一步步播放的樣板，常見錯誤放重點，再補一個比喻。原檔不放進知識庫，出處寫「黃光區新人 SOP，第 3–8 頁」加上它的存放位置。'], ['ai', '草稿好了。第 6 頁有一個數字我看不懂單位，請你確認一下。']] },
    { n: '訪談', me: '老王（傳承者）', chat: [['me', '我想講一下光罩為什麼怕汙染。'], ['ai', '先問三題：一、汙染通常是什麼東西？二、出事時產線最先看到什麼？三、新人最常誤會哪一點？沒空當面講，我也可以先把問題寫下來，你有空再回。'], ['me', '最怕的是微粒，一顆很小的粒子就可能讓整批重做……'], ['ai', '了解。這段的出處會寫成「老王（製程整合）口述，2026-10」。簡報頁草稿好了，也加了一題自我檢查，你看看有沒有說錯？']] }
  ];
  A(Object.assign({
    id: 'modes', part: 2, minutes: 2, short: '三種新增方式',
    title: '三種新增方式：研究、整理、訪談', en: 'Add',
    thesis: '給主題、給資料或直接口述都可以，<b>後半段流程都一樣</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('md-seg', MODES.map(m => m.n), 0)}<button class="btn" id="md-replay" type="button">↻ 重播</button></div>
        <div class="fig grow"><div class="fig-title"><span id="md-tt"></span><span></span></div>
          <div class="chat" id="md-chat" style="flex:1;min-height:0;overflow:auto;padding:4px"></div></div></div>
      ${U.side({
        points: ['<b>研究</b>：只給主題，Agent 寫；數字要附出處', '<b>整理</b>：給參考資料，Agent 改寫成白話；原檔不放進知識庫', '<b>訪談</b>：口述經驗，Agent 反問到懂了才寫'],
        fact: { v: '訪談', d: '是唯一能收進「只在人腦袋裡」的知識的方式' },
        analogy: { icon: 'camera', t: '比喻', p: '像記者寫報導：可以自己查資料、讀別人給的文件，也可以直接找當事人問。' }
      })}</div>`,
    init(el, ctx) {
      const box = U.$(el, '#md-chat'); let timers = [], cur = 0;
      const clearT = () => { timers.forEach(clearTimeout); timers = []; };
      ctx.onCleanup(clearT);
      const play = i => {
        cur = i; clearT(); box.innerHTML = '';
        const m = MODES[i]; U.$(el, '#md-tt').textContent = '方式：' + m.n;
        m.chat.forEach(([who, t], k) => timers.push(setTimeout(() => {
          const d = document.createElement('div'); d.className = 'bub show ' + who;
          d.innerHTML = `<span class="by">${who === 'me' ? m.me : 'Agent'}</span>${t}`; box.appendChild(d); box.scrollTop = box.scrollHeight;
        }, 250 + k * 1300)));
      };
      U.onSeg(el, 'md-seg', play);
      U.$(el, '#md-replay').onclick = () => play(cur);
    },
    notes: `第二章，新增。切上面的按鈕看三種方式的對話。研究是只給主題，Agent 用自己的知識和找到的資料寫，數字一定附出處。整理是給一份參考資料，Agent 改寫成白話，原檔不放進知識庫，只寫明它在哪裡。

訪談是口述經驗，Agent 反問到自己懂了才寫，出處就是誰口述、哪一天。這是唯一能收進只在人腦袋裡的知識的方式。三種方式的後半段都一樣，下一頁來看。`
  }, C2));

  /* ② 一筆知識的旅程：逐步播放 */
  const ST = [
    { n: '寫草稿', who: 'Agent', col: '#1f4fb5', d: '做簡報頁：結論、重點、互動圖（先套樣板）、旁白，數字附出處；一頁放不下才建議做深入頁。' },
    { n: '傳承者確認', who: '人', col: '#1f7a4d', d: '看草稿、改到滿意，確認之前不會往下走。' },
    { n: '自動檢查', who: '程式', col: '#b3541e', d: '每改一次就自動跑，沒過就擋；開變更提案後 CI 再跑一次。' },
    { n: '讀者測試', who: 'Agent', col: '#1f4fb5', d: '沒有背景知識的 Agent 只讀這一章（每一頁的文字、深入頁的說明和旁白），答不出來就回去改寫。' },
    { n: '變更提案', who: 'Agent', col: '#1f4fb5', d: '開變更提案，連到要回答的 issue，寫一行來歷：研究、整理或訪談。' },
    { n: '維護者審核', who: '人＋Agent', col: '#1f7a4d', d: 'Agent 用白話整理改了什麼，打開改過的簡報頁和深入頁；維護者核准或留意見。' },
    { n: '正式內容', who: '簡報', col: '#17202b', d: '併進正式內容；CI 重新建置入口網站，新人看得到了。' }
  ];
  function doc(c, x, y, i, p) {
    const bw = 250, bh = 128;
    c.save(); c.fillStyle = '#fff'; c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5;
    c.shadowColor = 'rgba(20,30,45,.12)'; c.shadowBlur = 12; U.rrect(c, x - bw / 2, y - bh / 2, bw, bh, 6); c.fill(); c.shadowBlur = 0; c.stroke(); c.restore();
    U.txt(c, '簡報頁 litho9：High-NA EUV', x - bw / 2 + 14, y - bh / 2 + 24, { size: 15, w: 700, color: '#17202b' });
    const lines = i === 0 ? Math.round(p * 4) : 4;
    for (let k = 0; k < lines; k++) { c.fillStyle = '#d3dbe4'; c.fillRect(x - bw / 2 + 14, y - bh / 2 + 40 + k * 14, [200, 170, 190, 120][k], 6); }
    const note = (s, col) => U.txt(c, s, x - bw / 2 + 14, y + bh / 2 - 14, { size: 14, w: 600, color: col });
    if (i === 1) note('✎ 傳承者：改了兩處', '#1f7a4d');
    if (i === 2) p < .55 ? note('✗ id litho9 已經被用了', '#b3261e') : note('✓ 改成 litho10，檢查通過', '#1f7a4d');
    if (i === 3) note('✓ 沒有背景的 Agent：3 題答對 3 題', '#1f7a4d');
    if (i === 4) note('來歷：研究（請仔細審）', '#b3541e');
    if (i >= 5) {
      c.save(); c.translate(x + 70, y - 8); c.rotate(-.2); c.scale(i === 5 ? .6 + .4 * p : 1, i === 5 ? .6 + .4 * p : 1); c.globalAlpha = i === 5 ? p : 1;
      c.strokeStyle = '#1f7a4d'; c.lineWidth = 3; U.rrect(c, -44, -20, 88, 40, 6); c.stroke();
      U.txt(c, '核准', 0, 8, { align: 'center', size: 22, w: 700, color: '#1f7a4d' }); c.restore();
    }
  }
  function drawPipe(c, w, h, i, p) {
    const y = h * .3, x0 = w * .07, x1 = w * .93, xs = ST.map((_, k) => U.lerp(x0, x1, k / (ST.length - 1)));
    c.strokeStyle = '#e8edf3'; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    const head = i === 0 ? x0 : U.lerp(xs[i - 1], xs[i], p);
    c.strokeStyle = '#9fb5e3'; c.beginPath(); c.moveTo(x0, y); c.lineTo(head, y); c.stroke();
    ST.forEach((s, k) => {
      const on = k === i, done = k < i;
      c.fillStyle = on ? s.col : '#fff'; c.strokeStyle = s.col; c.lineWidth = on ? 4 : 2;
      c.beginPath(); c.arc(xs[k], y, on ? 20 : 15, 0, 7); c.fill(); c.stroke();
      if (done) U.txt(c, '✓', xs[k], y + 6, { align: 'center', size: 17, w: 700, color: s.col });
      U.txt(c, s.n, xs[k], y - 36, { align: 'center', size: on ? 18 : 15, w: on ? 700 : 500, color: on ? '#17202b' : '#6a7888' });
      U.txt(c, s.who, xs[k], y + 44, { align: 'center', size: 13.5, w: 600, color: s.col });
    });
    if (i === 6) {
      c.fillStyle = '#e3ebfa'; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2; U.rrect(c, w * .66, h * .55, w * .3, h * .4, 8); c.fill(); c.stroke();
      U.txt(c, '簡報（正式內容）', w * .81, h * .55 + 26, { align: 'center', size: 16, w: 700, color: '#1f4fb5' });
      U.txt(c, '新人看得到了', w * .81, h * .95 - 14, { align: 'center', size: 14, color: '#3e4b5b' });
    }
    const target = i === 6 ? [w * .81, h * .76] : [U.clamp(xs[i], 140, w - 140), h * .7];
    const prev = i === 0 ? [U.clamp(xs[0], 140, w - 140), h * .7] : [U.clamp(xs[i - 1], 140, w - 140), h * .7];
    const u = U.ease(p);
    doc(c, U.lerp(prev[0], target[0], u), U.lerp(prev[1], target[1], u), i, p);
  }
  A(Object.assign({
    id: 'pipeline', part: 2, minutes: 2, short: '一筆知識的旅程',
    title: '一筆知識的旅程：從草稿到正式內容', en: 'Pipeline',
    thesis: '<b>傳承者確認、維護者核准</b>之前，什麼都不會變成正式內容。',
    render: () => `<div class="s-body w66">
      <div class="col">${U.figHTML('pp-cv', '研究 High-NA EUV 的一筆知識', '')}${U.stepperHTML('pp-st')}</div>
      ${U.side({
        points: ['<b>藍色</b>是 Agent、<b>綠色</b>是人、<b>橘色</b>是程式', '檢查沒過，錯誤直接交給 Agent 修', '來歷是「研究」的提案，維護者要特別仔細看', '第一站<b>做簡報頁</b>，一頁放不下才做深入頁'],
        fact: { v: '7 站', d: '從草稿到正式內容，每站都有人或程式把關' },
        analogy: { icon: 'stairs', t: '比喻', p: '像出版一本書：寫稿、自己校對、排版檢查、找人試讀，再送編輯審，通過才印。' }
      })}</div>`,
    init(el, ctx) {
      U.animSteps(el, ctx, { canvas: 'pp-cv', stepper: 'pp-st', dur: 1.1, interval: 2600, steps: ST.map((s, k) => ({ t: s.n, d: s.d, draw: (c, w, h, p) => drawPipe(c, w, h, k, p) })) });
    },
    notes: `這頁看一筆知識走過的七站，按「下一步」一站一站看，或按「自動播放」。

Agent 寫草稿，傳承者確認。接著是自動檢查，這裡示範 id 撞名被擋下，Agent 換一個 id 就過了。讀者測試答得出來，才開變更提案，寫一行來歷；這筆是研究，提醒維護者仔細審。

維護者核准後，它就是正式內容，CI 重新建置入口網站。誰能合併、怎麼合併，第三部分再講。

第一站是做簡報頁：結論、重點、互動圖、旁白，一頁放不下才建議做深入頁。讀者測試只給那一章每一頁的文字、深入頁的說明和旁白。`
  }, C2));
})();
