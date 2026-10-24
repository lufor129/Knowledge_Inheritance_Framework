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
├─ .claude/skills/   kb-add、kb-change、kb-learn、kb-review、kb-new
├─ framework/        共用引擎、範本、check.py、build.py
├─ CI 設定           GitHub Actions 或 GitLab CI：檢查、建置、發布
└─ kb/
   └─ semiconductor/
      ├─ README.md   介紹、維護者、全景圖
      ├─ terms.md    術語表
      ├─ handbook/   部分 → 章 → 小節
      ├─ widgets/    互動元件
      ├─ assets/     圖片＋SOURCES.md
      ├─ deck/       order.md、slides/、presenter-guide.md
      └─ dist/       建置結果，不進版控` },
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
    { label: 'handbook/2-manufacturing/', d: 1, note: '部分就是一個資料夾，只用來分組；資料夾名稱前的數字決定順序，沒有程度高低。', code: `handbook/
├─ 1-evolution/          演進與現況
├─ 2-manufacturing/      製造：從電晶體到量產
│  ├─ README.md          這個部分的簡介
│  ├─ 01-litho.md        微影
│  ├─ 02-etch.md         蝕刻
│  ├─ …
│  └─ 05-gate.md         閘極
└─ 3-beyond-moore/       突破摩爾定律` },
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
    { label: 'deck/order.md', d: 1, note: '簡報自己的頁序：由上到下就是播放順序，每頁記錄對應的小節和指紋。', code: `# 頁序（格式示意）

## 第一場（約 2 小時）
- cover
- mosfet   → mosfet@3fa2, nfetpfet@91c0
- hk1      → hk1@7d4e

## 第二場
- ocd      → ocd@b12a
- ocdb     → ocd@b12a, tem@44f1
- refs

@ 後面是小節文字的指紋，由程式產生，人不用管。` },
    { label: 'assets/SOURCES.md', d: 1, note: '圖片清單：每張圖片的說明和出處；不在清單上的圖片不能用。', code: `# 圖片清單

| 檔名             | 說明         | 出處           |
|------------------|--------------|----------------|
| wafer-12inch.jpg | 12 吋晶圓    | 網址           |
| tem-gaa.jpg      | 環繞式 TEM   | 論文、第幾張圖 |

只寫出處，不用寫授權（框架只在公司內部使用）。` }
  ];
  A(Object.assign({
    id: 'struct', part: 2, minutes: 2, short: '知識怎麼存',
    title: '知識怎麼存：部分 → 章 → 小節', en: 'Structure',
    thesis: '小節內容<b>格式自由</b>，固定的只有 id、常見問題的格式和數字的出處註腳。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點左邊的檔案看內容</span><span>路徑英文、內容繁中</span></div>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:290px 1fr;gap:14px">
          <div class="tree" id="st-tree">${FILES.map((f, i) => `<button type="button" class="d${f.d}" data-i="${i}">${f.label}</button>`).join('')}</div>
          <div style="display:flex;flex-direction:column;gap:8px;min-height:0;min-width:0"><p class="caption" id="st-note" style="margin:0;font-size:16px"></p><pre class="code" id="st-code" style="flex:1;min-height:0"></pre></div>
        </div></div></div>
      ${U.side({
        points: ['<b>一個 repo</b> 放所有知識庫，全公司都能看', '小節 id 用短英文（hk1），<b>建立後不改名</b>', '數字用註腳附出處；圖片要列進<b>圖片清單</b>'],
        fact: { v: '3 層', d: '部分是資料夾、章是檔案、小節是一個概念' },
        analogy: { icon: 'tile', t: '比喻', p: '像一座書架：一層放一個部分，一本書是一章，書裡每一節都有固定的頁籤，別人引用時說「第幾節」就找得到。' }
      })}</div>`,
    init(el) {
      const btns = U.$$(el, '#st-tree button');
      const show = i => { btns.forEach((b, k) => b.classList.toggle('on', k === i)); U.$(el, '#st-note').textContent = FILES[i].note; U.$(el, '#st-code').textContent = FILES[i].code; };
      btns.forEach((b, i) => b.onclick = () => show(i));
      show(3);
    },
    notes: `第一章，知識怎麼存。框架和所有知識庫都放在同一個 repo，每個知識庫是 kb 底下的一個資料夾。手冊分三層：部分是資料夾，只用來分組；章是檔案；小節是一個概念。

點左邊的 05-gate.md 看一章的樣子：開頭是速覽，中間是小節，最後是常見問題。小節 id 寫在標題前一行，建立之後就不改名。內容格式自由，固定的只有 id、常見問題的格式和出處註腳；路徑用英文，內容用繁體中文。`
  }, C1));

  /* ① 正本與指紋 */
  const CN_SECS = [{ id: 'hk1', t: '閘極絕緣層', fp: '7d4e' }, { id: 'ocd', t: 'OCD 光學量測', fp: 'b12a', fp2: 'c9e0' }, { id: 'tem', t: 'TEM 電子顯微鏡', fp: '44f1' }];
  const CN_PAGES = [{ id: 'cover', s: [] }, { id: 'hk1', s: ['hk1'] }, { id: 'ocd', s: ['ocd'] }, { id: 'ocdf', s: ['ocd'] }, { id: 'ocdb', s: ['ocd', 'tem'] }, { id: 'tem', s: ['tem'] }];
  A(Object.assign({
    id: 'canon', part: 2, minutes: 2, short: '手冊是正本',
    title: '手冊是正本：簡報可以自己寫，但要跟得上', en: 'Source of Truth',
    thesis: '簡報可以改寫講法，<b>說法以手冊為準</b>；小節一改，檢查程式用<b>指紋</b>點名要重看的簡報頁。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('cn-seg', ['原本', '改了小節 ocd', 'Agent 跟上了'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>手冊小節 ⇄ 簡報頁序（@ 後面是指紋）</span><span></span></div>
          <div style="flex:1;min-height:0;display:grid;grid-template-columns:1fr 1.3fr;gap:16px">
            <div class="rcol"><h4>手冊的小節（正本）</h4><div class="ritems" id="cn-secs"></div></div>
            <div class="rcol"><h4>簡報頁序 deck/order.md</h4><div class="ritems" id="cn-pages"></div></div>
          </div>
          <div class="card" id="cn-res" style="font-size:18px"></div></div></div>
      ${U.side({
        points: ['說法不一致時，<b>聽手冊的</b>', '一頁可以對應好幾個小節，一個小節也能出現在好幾頁', '指紋對不上就<b>不能開變更提案</b>，人不用記'],
        fact: { v: '指紋', d: '小節文字的短雜湊值，記在頁序裡' },
        analogy: { icon: 'pen', t: '比喻', p: '原文和譯本：原文改了一段，翻譯就得回頭對照譯本的那幾頁。指紋就是幫你標出「哪幾頁要對照」的書籤。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'cn-seg', st => {
        const fpNow = s => st >= 1 && s.fp2 ? s.fp2 : s.fp;
        U.$(el, '#cn-secs').innerHTML = CN_SECS.map(s => `<div class="ritem ${st === 1 && s.fp2 ? 'hit' : ''}">${s.t}<span class="ids">${s.id} · 指紋 ${fpNow(s)}${st >= 1 && s.fp2 ? '（內容改了）' : ''}</span></div>`).join('');
        let bad = [];
        U.$(el, '#cn-pages').innerHTML = CN_PAGES.map(p => {
          const parts = p.s.map(id => { const s = CN_SECS.find(x => x.id === id); const rec = st === 2 || !s.fp2 ? fpNow(s) : s.fp; return { id, rec, ok: rec === fpNow(s) }; });
          const off = parts.some(x => !x.ok); if (off) bad.push(p.id);
          const cls = off ? 'hit del' : st === 2 && p.s.includes('ocd') ? 'ok' : '';
          return `<div class="ritem ${cls}">${p.id}<span class="ids">${parts.length ? '→ ' + parts.map(x => `${x.id}@${x.rec}`).join(', ') : '（不對應小節）'}${off ? '　≠ 現在的指紋，要重看' : st === 2 && p.s.includes('ocd') ? '　已更新' : ''}</span></div>`;
        }).join('');
        U.$(el, '#cn-res').innerHTML = st === 0 ? '<b style="color:var(--good)">✓ 全部對得上</b>：手冊和簡報說的是同一件事。'
          : st === 1 ? `<b style="color:var(--bad)">✗ ${bad.length} 頁簡報要重看：${bad.join('、')}</b>。檢查沒過，還不能開變更提案。`
          : '<b style="color:var(--good)">✓ 對得上了</b>：Agent 改好或確認過這 3 頁，再更新指紋，可以開變更提案。';
      });
    },
    notes: `簡報可以有自己的文字，因為上台要配合互動元件重新編排，講法也和閱讀時不同。說法不一致時，一律以手冊為準。

改了手冊，誰記得改簡報？這件事交給檢查程式：頁序裡每一頁都記下對應小節的指紋。切到「改了小節 ocd」：指紋變了，記著舊指紋的三頁被點名，檢查不過。切到「Agent 跟上了」：Agent 改好或確認過這三頁，更新指紋，就能開變更提案。`
  }, C1));

  /* ② 三種新增方式：對話逐句出現 */
  const MODES = [
    { n: '研究', me: '傳承者', chat: [['me', '幫我研究 High-NA EUV，放進微影那章。'], ['ai', '好。我會用自己的知識和找到的資料，整理它和現在的 EUV 差在哪、為什麼要做、代價是什麼。數字一定附出處，找不到出處的就不寫。'], ['ai', '草稿好了，放在「微影」那章的最後，小節 id 我建議用 litho9。你看看哪裡要改？']] },
    { n: '整理', me: '傳承者', chat: [['me', '參考這份《黃光區新人 SOP》第 3–8 頁，整理進微影那章。'], ['ai', '這幾頁有 5 個步驟和 2 個常見錯誤。我會改寫成白話、補一個比喻。原檔不放進知識庫，出處寫「黃光區新人 SOP，第 3–8 頁」加上它的存放位置。'], ['ai', '草稿好了。第 6 頁有一個數字我看不懂單位，請你確認一下。']] },
    { n: '訪談', me: '老王（傳承者）', chat: [['me', '我想講一下光罩為什麼怕汙染。'], ['ai', '先問三題：一、汙染通常是什麼東西？二、出事時產線最先看到什麼？三、新人最常誤會哪一點？沒空當面講，我也可以先把問題寫下來，你有空再回。'], ['me', '最怕的是微粒，一顆很小的粒子就可能讓整批重做……'], ['ai', '了解。這段的出處會寫成「老王（製程整合）口述，2026-10」。草稿好了，你看看有沒有說錯？']] }
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
    { n: '寫草稿', who: 'Agent', col: '#1f4fb5', d: '依新增方式寫成小節，建議比喻和圖解；術語第一次出現附英文。' },
    { n: '傳承者確認', who: '人', col: '#1f7a4d', d: '看草稿、改到滿意，確認之前不會往下走。' },
    { n: '自動檢查', who: '程式', col: '#b3541e', d: '每改一次就自動跑，沒過就擋；開變更提案後 CI 再跑一次。' },
    { n: '讀者測試', who: 'Agent', col: '#1f4fb5', d: '沒有背景知識的 Agent 只讀這一章，答不出來就回去改寫。' },
    { n: '變更提案', who: 'Agent', col: '#1f4fb5', d: '開變更提案，連到要回答的 issue，寫一行來歷：研究、整理或訪談。' },
    { n: '維護者審核', who: '人＋Agent', col: '#1f7a4d', d: 'Agent 用白話整理改了什麼，維護者核准或留意見。' },
    { n: '正式內容', who: '手冊', col: '#17202b', d: '併進手冊，新人看得到了；CI 重新建置手冊網站和簡報。' }
  ];
  function doc(c, x, y, i, p) {
    const bw = 250, bh = 128;
    c.save(); c.fillStyle = '#fff'; c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.5;
    c.shadowColor = 'rgba(20,30,45,.12)'; c.shadowBlur = 12; U.rrect(c, x - bw / 2, y - bh / 2, bw, bh, 6); c.fill(); c.shadowBlur = 0; c.stroke(); c.restore();
    U.txt(c, '小節 litho9：High-NA EUV', x - bw / 2 + 14, y - bh / 2 + 24, { size: 15, w: 700, color: '#17202b' });
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
      U.txt(c, '手冊（正式內容）', w * .81, h * .55 + 26, { align: 'center', size: 16, w: 700, color: '#1f4fb5' });
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
        points: ['<b>藍色</b>是 Agent、<b>綠色</b>是人、<b>橘色</b>是程式', '檢查沒過，錯誤直接交給 Agent 修', '來歷是「研究」的提案，維護者要特別仔細看'],
        fact: { v: '7 站', d: '從草稿到正式內容，每站都有人或程式把關' },
        analogy: { icon: 'stairs', t: '比喻', p: '像出版一本書：寫稿、自己校對、排版檢查、找人試讀，再送編輯審，通過才印。' }
      })}</div>`,
    init(el, ctx) {
      U.animSteps(el, ctx, { canvas: 'pp-cv', stepper: 'pp-st', dur: 1.1, interval: 2600, steps: ST.map((s, k) => ({ t: s.n, d: s.d, draw: (c, w, h, p) => drawPipe(c, w, h, k, p) })) });
    },
    notes: `這頁看一筆知識走過的七站，按「下一步」一站一站看，或按「自動播放」。

Agent 寫草稿，傳承者確認。接著是自動檢查，這裡示範 id 撞名被擋下，Agent 換一個 id 就過了。讀者測試答得出來，才開變更提案，寫一行來歷；這筆是研究，提醒維護者仔細審。

維護者核准後，它就是手冊裡的正式內容。誰能合併、怎麼合併，第三部分再講。`
  }, C2));
})();
