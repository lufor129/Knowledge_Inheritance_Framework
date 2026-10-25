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
│  ├─ engine/        入口網站、簡報、手冊網站的共用引擎；
│  │                 figures/ 是互動圖樣板
│  ├─ tools/         check、build、read、index、who、proposal、
│  │                 get、reader_test、new_kb
│  ├─ guide/         簡報、寫作、讀者測試、Git 主機、改框架
│  ├─ templates/     新知識庫的範本
│  ├─ tests/         情境測試
│  └─ paths.md       入口網站的角色路徑
└─ kb/
   ├─ semiconductor/
   │  ├─ README.md   介紹、維護者、全景圖
   │  ├─ terms.md    術語表
   │  ├─ deck/       order.md（頁序）、<部分>/<章>.md（15 個章檔，
   │  │              90 頁的文字和自我檢查）、figures/（互動圖）
   │  ├─ handbook/   部分 → 章 → 小節（3 章、28 個小節）
   │  ├─ widgets/    互動圖共用的程式
   │  ├─ assets/     圖片＋SOURCES.md
   │  └─ dist/       建置結果，不進版控
   └─ cv/            電腦視覺：手冊骨架（4 個部分、15 章），還沒有簡報` },
    { label: 'kb/semiconductor/README.md', d: 1, note: '知識庫的首頁：介紹、維護者名單，以及全景圖（建議有）。', code: `# 半導體製程

給半導體新人的知識庫：從電晶體結構演進、
十章製程與量產，到先進封裝與背面供電。

## 維護者
- （維護者名字）

## 全景圖
\`\`\`mermaid
flowchart LR
  A[演進與現況] --> B[製造：從電晶體到量產]
  B --> C[突破摩爾定律]
\`\`\`
部分和章的方塊由程式從資料夾自動產生，
人只補上「章和章之間的關係」。` },
    { label: 'handbook/2-manufacturing/', d: 1, note: '部分就是一個資料夾，只用來分組；編號跟簡報一樣。手冊是選配：半導體寫了 3 章。', code: `handbook/
├─ 1-evolution/          演進與現況（只有部分的簡介）
├─ 2-manufacturing/      製造：從電晶體到量產
│  ├─ README.md          這個部分的簡介
│  ├─ 01-litho.md        微影
│  ├─ 05-gate.md         閘極
│  └─ 09-metrology.md    檢測量測
└─ 3-beyond-moore/       突破摩爾定律（只有部分的簡介）

其他章只有簡報頁。手冊是選配：
一頁簡報放不下的細節才寫，不用每章都有。` },
    { label: '05-gate.md', d: 2, note: '一章一個檔案：速覽（建議有）、小節、常見問題（有題目才建）。小節內容格式自由。', code: `# 閘極

> 速覽：閘極隔著一道很薄的絕緣牆，用電場開關電晶體。
> 這章講牆為什麼不能再薄，換成 High-k 之後怎麼兩全。

<a name="hk1"></a>
## 閘極絕緣層

牆要薄，電場才夠強；太薄，電子會直接穿過去
（量子穿隧，Quantum Tunneling）。
牆每薄 0.2 nm，漏電大約多 10 倍[^hk1-1]。

<!-- 元件: gate-leakage -->

[^hk1-1]: 出處（論文、文件位置或網址）

## 常見問題

<details>
<summary>電晶體會壞嗎？可以用多久？</summary>
正常使用可以用十年以上……
相關：hk1、wat
</details>` },
    { label: 'deck/order.md', d: 1, note: '頁序：由上到下就是播放順序；有對應小節的頁記下兩邊的指紋，哪一邊改了，檢查程式就點名另一邊。', code: `# 頁序（節錄）

## 章節列
- 1：微影 → litho1
- 5：閘極 → hk1
（沒寫的話，照簡報章檔的「# 章名」自動產生）

## 頁面
- cover
- etch1
- hk1@f0cc3a → hk1@4c046b, hk2@b86b6a, hk3@e3a45c, hk4@9e6156
- ocd@c8420c → ocd@7654cc

頁 id@頁的指紋 → 小節@小節的指紋：
簡報頁改了，點名小節；小節改了，點名簡報頁。
指紋由 check.py --fp 產生，人不用管。` },
    { label: 'deck/2-manufacturing/05-gate.md', d: 1, note: '簡報章檔：一章一個檔，編號跟手冊一樣。一頁是「錨點＋## 標題」，底下是欄位；最後的「## 自我檢查」是這一章的題目。', code: `# 閘極

<a name="hk1"></a>
## 絕緣牆的兩難：電場要過得去，電子不要過去

- 短標題：閘極絕緣層：電場過、電子不過
- 建議：5.2 分
- 圖：hk1              互動圖在 deck/figures/

結論：閘極隔著一道絕緣牆，用**電場**控制通道……

重點：
- **電場要過得去**：牆越薄，閘極越控制得住通道
- 二氧化鉿傳電場的能力約是二氧化矽的 **4–6 倍**

數字卡：約 1.2 nm｜2000 年代初期二氧化矽已經薄到這裡

比喻（wall）：隔著牆用磁鐵（閘極）吸鐵片……

旁白：
第五章：閘極。回到電晶體的核心……

## 自我檢查

<details>
<summary>為什麼選二氧化鉿？</summary>
它傳遞電場的能力約是二氧化矽的 4–6 倍……
相關：hk1
</details>` },
    { label: 'deck/figures/', d: 1, note: '互動圖只畫圖、管操作；要讓新人讀的文字寫在章檔（重點、圖說、旁白）。新做的頁先套三種樣板。', code: `// 拉桿看變化、切換比較
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
    title: '知識怎麼存：簡報章檔和手冊，編號一樣', en: 'Structure',
    thesis: '簡報頁寫在<b>簡報章檔</b>，手冊分<b>部分 → 章 → 小節</b>；固定的只有 id、題目的格式和數字的出處註腳。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點左邊的檔案看內容</span><span>路徑英文、內容繁中</span></div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:290px 1fr;gap:14px">
          <div class="tree" id="st-tree">${FILES.map((f, i) => `<button type="button" class="d${f.d}" data-i="${i}">${f.label}</button>`).join('')}</div>
          <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0"><p class="caption" id="st-note" style="margin:0;font-size:16px"></p><pre class="code" id="st-code" style="flex:1;min-height:0"></pre></div>
        </div></div></div>
      ${U.side({
        points: ['<b>一個 repo</b> 放所有知識庫，全公司都能看', '頁 id、小節 id 用短英文（hk1），<b>建立後不改名</b>', '數字用註腳附出處；圖片要列進<b>圖片清單</b>', '簡報頁的文字寫在 <b>Markdown</b>，互動圖寫在程式'],
        fact: { v: '15 個章檔', d: '半導體 90 頁簡報的文字和 197 題自我檢查' },
        analogy: { icon: 'tile', t: '比喻', p: '像一座書架：一層放一個部分，一本書是一章，書裡每一節都有固定的頁籤，別人引用時說「第幾節」就找得到。' }
      })}</div>`,
    init(el) {
      const btns = U.$$(el, '#st-tree button');
      const show = i => { btns.forEach((b, k) => b.classList.toggle('on', k === i)); U.$(el, '#st-note').textContent = FILES[i].note; U.$(el, '#st-code').textContent = FILES[i].code; };
      btns.forEach((b, i) => b.onclick = () => show(i));
      show(5);
    },
    notes: `第一章，知識怎麼存。框架和所有知識庫都放在同一個 repo，每個知識庫是 kb 底下的一個資料夾。手冊分三層：部分是資料夾，只用來分組；章是檔案；小節是一個概念。

點左邊的 deck/2-manufacturing/05-gate.md 看簡報章檔：一頁是一個錨點加標題，底下是結論、重點、數字卡、比喻、旁白這些欄位，最後是這一章的自我檢查題目。互動圖寫在 deck/figures/，先套樣板。頁 id 和小節 id 一樣，建立之後就不改名。

手冊照舊是部分、章、小節，編號跟簡報一樣；手冊是選配，半導體寫了微影、閘極、檢測量測三章。頁序 order.md 記下每一頁對應哪些小節，和兩邊的指紋。路徑用英文，內容用繁體中文。`
  }, C1));

  /* ① 簡報和手冊：簡報必備、手冊選配，兩邊一樣重要，雙向點名（ADR-0006） */
  const CN_SECS = [{ id: 'hk1', t: '閘極絕緣層' }, { id: 'ocd', t: 'OCD 光學量測' }, { id: 'tem', t: 'TEM 電子顯微鏡' }];
  const CN_PAGES = [{ id: 'cover', s: [] }, { id: 'hk1', s: ['hk1'] }, { id: 'ocd', s: ['ocd'] }, { id: 'ocdf', s: ['ocd'] }, { id: 'ocdb', s: ['ocd', 'tem'] }, { id: 'etch1', s: [] }];
  const CN_EV = [
    { n: '原本', p: {}, s: {}, m: '<b style="color:var(--good)">✓ 全部對得上</b>：頁序記的兩邊指紋都和現在一樣。etch1 沒有對應小節，照樣算數。' },
    { n: '改了簡報頁 ocdb', p: { ocdb: 'sel' }, s: { ocd: 'hit', tem: 'hit' }, m: '<b>點名小節</b>：簡報頁 ocdb 改了，它對應的小節 ocd、tem 要重看，說法要一致。Agent 對照好兩邊，跑 check.py --fp 更新指紋，才能開提案。' },
    { n: '改了小節 ocd', p: { ocd: 'hit', ocdf: 'hit', ocdb: 'hit' }, s: { ocd: 'sel' }, m: '<b>點名簡報頁</b>：小節 ocd 改了，對應的 3 頁簡報要重看。' },
    { n: '兩邊說法不一樣', p: { hk1: 'hit' }, s: { hk1: 'hit' }, m: '<b>兩種都列</b>：Agent 查找時發現兩邊寫的不一樣，兩種說法都告訴使用者、各附出處，再問要不要記成勘誤。沒有哪一邊自動算對。' },
    { n: '新增小節沒做簡報頁', p: {}, s: { hk5: 'hit del' }, m: '<b>擋下</b>：每個小節都要有簡報頁講到。反過來可以：簡報頁可以沒有小節（例如 etch1）。' }
  ];
  A(Object.assign({
    id: 'canon', part: 2, minutes: 2.5, short: '簡報和手冊', badge: '10-25 起',
    title: '簡報和手冊：簡報必備、手冊選配，兩邊一樣重要', en: 'Deck & Handbook',
    thesis: '<b>每個小節都要有簡報頁</b>，簡報頁可以沒有小節；頁序記下兩邊的指紋，<b>哪一邊改了，另一邊就要重看</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('cn-seg', CN_EV.map(x => x.n), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>手冊小節 ⇄ 簡報頁序</span><span>ADR-0006 取代 ADR-0002</span></div>
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.3fr;gap:16px">
            <div class="rcol"><h4>手冊的小節（選配）</h4><div class="ritems" id="cn-secs"></div></div>
            <div class="rcol"><h4>簡報頁序 deck/order.md（必備）</h4><div class="ritems" id="cn-pages"></div></div>
          </div>
          <div class="card" id="cn-res" style="font-size:18px"></div></div></div>
      ${U.side({
        points: ['<b>簡報必備、手冊選配</b>：新人主要看簡報', '每個小節都要有簡報頁講到；簡報頁可以沒有小節', '指紋是<b>雙向</b>的：哪一邊改了，另一邊就要重看', '說法不同：查找時<b>兩種都列</b>，問要不要記勘誤'],
        fact: { v: '22 / 90 頁', d: '半導體有對應小節的簡報頁；其他 68 頁只有簡報，照樣算數' },
        analogy: { icon: 'pen', t: '比喻', p: '像中英對照的合約：兩份一樣有效，改了一份，另一份一定要跟著對一次。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'cn-seg', k => {
        const e = CN_EV[k];
        U.$(el, '#cn-secs').innerHTML = CN_SECS.map(s => `<div class="ritem ${e.s[s.id] || ''}">${s.t}<span class="ids">${s.id}</span></div>`).join('')
          + (e.s.hk5 ? `<div class="ritem ${e.s.hk5}">新的小節<span class="ids">hk5 · 沒有簡報頁講到</span></div>` : '');
        U.$(el, '#cn-pages').innerHTML = CN_PAGES.map(p => `<div class="ritem ${e.p[p.id] || ''}">${p.id}<span class="ids">${p.s.length ? `${p.id}@頁指紋 → ` + p.s.map(x => x + '@指紋').join(', ') : '（不對應小節，照樣算數）'}</span></div>`).join('');
        U.$(el, '#cn-res').innerHTML = e.m;
      });
    },
    notes: `新人主要看簡報，所以簡報必備、手冊選配，兩邊一樣重要。這是 10-25 定的，寫在 ADR-0006，取代原本「手冊是正本」的 ADR-0002。

點上面幾件事看看。改了簡報頁 ocdb：檢查程式點名它對應的小節 ocd、tem 要重看；改了小節 ocd：點名對應的三頁簡報。頁序裡每一頁都記下兩邊的指紋，Agent 對照好之後跑 check.py --fp 更新，才能開提案。兩邊說法不一樣時，Agent 兩種都列，再問要不要記勘誤。新增小節卻沒做簡報頁，會被擋下；反過來，簡報頁可以沒有小節。

半導體 90 頁簡報裡，22 頁有對應小節，其他 68 頁只有簡報，照樣算數。`
  }, C1));

  /* ② 三種新增方式：對話逐句出現 */
  const MODES = [
    { n: '研究', me: '傳承者', chat: [['me', '幫我研究 High-NA EUV，放進微影那章。'], ['ai', '好。我會用自己的知識和找到的資料，整理它和現在的 EUV 差在哪、為什麼要做、代價是什麼。數字一定附出處，找不到出處的就不寫。'], ['ai', '簡報頁草稿好了，放在微影那章的最後，頁 id 我建議用 litho9；一頁放得下，不另外寫手冊。你看看哪裡要改？']] },
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
    { n: '寫草稿', who: 'Agent', col: '#1f4fb5', d: '先做簡報頁：結論、重點、互動圖（先套樣板）、旁白，數字附出處；一頁放不下才寫手冊小節。' },
    { n: '傳承者確認', who: '人', col: '#1f7a4d', d: '看草稿、改到滿意，確認之前不會往下走。' },
    { n: '自動檢查', who: '程式', col: '#b3541e', d: '每改一次就自動跑，沒過就擋；開變更提案後 CI 再跑一次。' },
    { n: '讀者測試', who: 'Agent', col: '#1f4fb5', d: '沒有背景知識的 Agent 只讀這一章（簡報是每一頁的文字和旁白），答不出來就回去改寫。' },
    { n: '變更提案', who: 'Agent', col: '#1f4fb5', d: '開變更提案，連到要回答的 issue，寫一行來歷：研究、整理或訪談。' },
    { n: '維護者審核', who: '人＋Agent', col: '#1f7a4d', d: 'Agent 用白話整理改了什麼，打開改過的簡報頁；維護者核准或留意見。' },
    { n: '正式內容', who: '簡報＋手冊', col: '#17202b', d: '併進正式內容；CI 重新建置入口網站，新人看得到了。' }
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
      U.txt(c, '簡報＋手冊（正式內容）', w * .81, h * .55 + 26, { align: 'center', size: 16, w: 700, color: '#1f4fb5' });
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
        points: ['<b>藍色</b>是 Agent、<b>綠色</b>是人、<b>橘色</b>是程式', '檢查沒過，錯誤直接交給 Agent 修', '來歷是「研究」的提案，維護者要特別仔細看', '第一站<b>先做簡報頁</b>，一頁放不下才寫手冊'],
        fact: { v: '7 站', d: '從草稿到正式內容，每站都有人或程式把關' },
        analogy: { icon: 'stairs', t: '比喻', p: '像出版一本書：寫稿、自己校對、排版檢查、找人試讀，再送編輯審，通過才印。' }
      })}</div>`,
    init(el, ctx) {
      U.animSteps(el, ctx, { canvas: 'pp-cv', stepper: 'pp-st', dur: 1.1, interval: 2600, steps: ST.map((s, k) => ({ t: s.n, d: s.d, draw: (c, w, h, p) => drawPipe(c, w, h, k, p) })) });
    },
    notes: `這頁看一筆知識走過的七站，按「下一步」一站一站看，或按「自動播放」。

Agent 寫草稿，傳承者確認。接著是自動檢查，這裡示範 id 撞名被擋下，Agent 換一個 id 就過了。讀者測試答得出來，才開變更提案，寫一行來歷；這筆是研究，提醒維護者仔細審。

維護者核准後，它就是正式內容，CI 重新建置入口網站。誰能合併、怎麼合併，第三部分再講。

第一站是先做簡報頁：結論、重點、互動圖、旁白，一頁放不下才建議寫手冊小節。讀者測試也測簡報：只給那一章每一頁的文字和旁白。`
  }, C2));
})();
