/* 第四部分：要設計的 skill，以及可以參考的外部 skill */
(function () {
  const A = Deck.add.bind(Deck);

  /* 五個 skill：點一列看功能和參考 */
  const SK = [
    { id: 'kb-add', n: '新增：研究、整理、訪談', who: '傳承者', inv: '自動判斷',
      f: ['開工時列出待回答、勘誤 issue 和可以補出處的簡報頁，說「我來回答 #12」就認領', '判斷用研究、整理還是訪談，各走自己的前半段', '先做簡報頁草稿：套互動圖樣板、數字附出處；一頁放不下時建議接深入頁，傳承者決定', '傳承者確認（本機預覽改過的頁）→ 自動檢查 → 讀者測試', '開變更提案：連到 issue、貼來歷標籤；沒有主機時走手動模式'],
      ref: [['grilling', 'mattpocock', '訪談：一輪問完，每題附建議答案'], ['to-questionnaire', 'mattpocock', '老手沒空當面講時，先把問題寫下來給老手'], ['research', 'mattpocock', '研究：只查第一手來源，每個說法附出處'], ['doc-coauthoring', 'Anthropic', '讀者測試的做法'], ['pr', 'mattpocock', '變更提案說明的寫法']] },
    { id: 'kb-change', n: '修改、刪除、合併、補出處', who: '傳承者', inv: '自動判斷',
      f: ['找出簡報頁或深入頁的所有引用：頁序、深入頁的「深入：」、自我檢查、術語表、頁碼引用、角色路徑', '在同一個變更提案裡改掉所有引用，不留舊 id', '改主頁時一起看後面的深入頁；刪主頁時，深入頁接到別頁或一起刪', '補出處、修正勘誤時，提案連到那個 issue', '自動檢查 → 讀者測試 → 開變更提案'],
      ref: [['pr', 'mattpocock', '變更提案說明的寫法'], ['gen-qa.py', '半導體範例', '引用檢查、禁止寫死頁碼的做法'], ['doc-coauthoring', 'Anthropic', '讀者測試的做法']] },
    { id: 'kb-learn', n: '查找、帶讀、打開', who: '新人（所有人）', inv: '自動判斷',
      f: ['第一次用：問你關心哪些知識庫，記在本機', '查找：先看索引（速覽、頁、自我檢查、術語），再讀主頁和後面的深入頁；附出處頁，兩頁說法不同兩種都列', '從簡報貼來「我在看……這一頁」：先讀那一頁和後面的深入頁', '沒寫或寫錯：問一句、查重複，開待回答或勘誤 issue；帶讀：白話解釋、出小題目', '打開入口網站或簡報：下載 Release，或現場建置'],
      ref: [['teach', 'mattpocock', '出題：選項等長、答案位置輪換、先想再看'], ['triage', 'mattpocock', 'issue 的標籤用語和分類'], ['Explore 子 agent', 'Claude Code 內建', '要掃很多章時，交給唯讀的子 agent 找']] },
    { id: 'kb-review', n: '檢查、審核', who: '維護者、框架維護者', inv: '只能手動叫',
      f: ['跑檢查程式，用白話解釋錯誤', '整理提案：改了什麼、來歷、影響範圍；打開改過的簡報頁和深入頁看圖、互動和出處', '研究來的段落逐段列出，標出沒有出處的數字', '核准就合併（自己的提案自己合併）；要修改就留意見', 'Agent 留的意見開頭標明「由 Agent 產生」'],
      ref: [['code-review', 'mattpocock', '分兩個角度審：照不照規範、有沒有做到要求'], ['triage', 'mattpocock', 'Agent 在 issue、PR 上的留言要標明是 AI 產生']] },
    { id: 'kb-new', n: '建立新知識庫', who: '發起人；框架維護者核准', inv: '只能手動叫',
      f: ['訪談發起人：領域、讀者、部分和章、每章的速覽和先修、維護者、現有資料', '用 new_kb.py 建骨架：README、術語表、簡報的頁序和章檔（每章開頭寫速覽和先修）', '開變更提案給框架維護者', '核准後，首頁的知識庫清單自動多一列'],
      ref: [['grilling', 'mattpocock', '訪談發起人'], ['setup-matt-pocock-skills', 'mattpocock', '一次性設定：先看現況、提出建議，確認後才寫'], ['domain-modeling', 'mattpocock', '術語表的格式：詞、定義、避用詞']] }
  ];
  A({
    id: 'skills', part: 4, minutes: 2.5, short: '要設計的 skill',
    title: '五個 skill：新增、修改、學習、審核、建立知識庫', en: 'Skills',
    thesis: '五個 skill 放在 repo 的 <b>.claude/skills/</b>，拿到 repo 就能用；平常直接講中文，Agent 自己挑。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點一列看功能和參考</span><span>自動判斷＝直接講中文就會用到</span></div>
        <table class="t" style="font-size:16px"><thead><tr><th style="width:17%">skill</th><th>做什麼</th><th style="width:24%">誰用</th><th style="width:16%">怎麼叫起來</th></tr></thead>
          <tbody>${SK.map((s, i) => `<tr class="clickable" data-i="${i}"><td class="mono"><b>/${s.id}</b></td><td>${s.n}</td><td>${s.who}</td><td class="${s.inv === '自動判斷' ? 'y' : 'm'}">${s.inv}</td></tr>`).join('')}</tbody></table>
        <div style="flex:1;min-height:0;display:grid;grid-template-columns:1.15fr 1fr;gap:14px">
          <div class="card" style="background:#fff"><h4 id="sk-h">功能</h4><ol class="points num" id="sk-f" style="gap:6px"></ol></div>
          <div class="card" style="background:#fff"><h4>參考的 skill</h4><div class="ritems" id="sk-r" style="gap:6px"></div></div>
        </div></div></div>
      ${U.side({
        points: ['寫 skill 時照 <b>writing-for-agents</b> 的原則', '改了之後跑<b>情境測試</b>，跟改之前的版本比', '重複的工作做成<b>工具</b>，skill 寫清楚做到哪裡算完成', '外部 skill 只借做法，不要求大家另外安裝'],
        fact: { v: '5 個 skill', d: '新增、修改、學習、審核、建立知識庫' },
        analogy: { icon: 'chip', t: '比喻', p: '像一套刀具：五把刀各有用途，切什麼拿哪一把，不用每次重新發明。' }
      })}</div>`,
    init(el) {
      const rows = U.$$(el, 'tr[data-i]');
      const show = i => {
        const s = SK[i]; rows.forEach((r, k) => r.classList.toggle('hl', k === i));
        U.$(el, '#sk-h').textContent = `/${s.id} 的功能`;
        U.$(el, '#sk-f').innerHTML = s.f.map(x => `<li style="font-size:16px">${x}</li>`).join('');
        U.$(el, '#sk-r').innerHTML = s.ref.map(([n, src, why]) => `<div class="ritem"><b class="mono">${n}</b> <span class="tag ${src === 'mattpocock' ? 'a' : src === 'Anthropic' ? 'g' : ''}">${src}</span><span class="ids" style="font-family:var(--font-cjk);font-size:14.5px">${why}</span></div>`).join('');
      };
      rows.forEach((r, i) => r.onclick = () => show(i));
      show(0);
    },
    notes: `框架要設計五個 skill，對應五個短指令，都放在 repo 的 .claude/skills/ 底下，拿到 repo 就能用。平常不用記指令，直接講中文，Agent 會依說明自己挑；只有審核和建立知識庫要手動叫，因為那是維護者和發起人才會做的事。

點表格的每一列看功能和參考。新增是最大的一個：開工認領 issue，用研究、整理或訪談寫草稿，確認、檢查、讀者測試，最後開變更提案。修改負責把所有引用一起改掉。學習給新人用：查找、帶讀、開 issue、打開簡報。審核給維護者用，Agent 的留言會標明是 Agent 產生的。建立知識庫負責訪談發起人、建骨架。

右邊是寫 skill 本身的方法：照 writing-for-agents 的原則寫；改了之後跑情境測試，跟改之前的版本比。重複的工作做成工具，skill 裡寫清楚什麼時候用、做到哪裡算完成。自動檢查交給 hook 和 CI，不寫成 skill。外部 skill 只借做法，不要求大家另外安裝。`
  });

  /* 外部 skill：mattpocock 系列、Anthropic 官方、其他 */
  const EX = {
    mattpocock: [
      ['grilling', '改來用', '一輪問完、每題附建議答案', '新增（訪談）、建立知識庫'],
      ['to-questionnaire', '改來用', '老手沒空當面講時，先把問題寫下來，有空再回', '新增（訪談）'],
      ['research', '改來用', '只查第一手來源、附出處；我們另外允許用 Agent 的知識，但標來歷', '新增（研究）'],
      ['teach', '改來用', '出題規則；不在 repo 留新人的學習紀錄', '學習（帶讀）'],
      ['writing-for-agents', '採用', '寫 AGENTS.md 和 skill 的原則：刪掉多餘指示、每個意思只寫一次', '寫框架本身'],
      ['domain-modeling', '採用', 'GLOSSARY、ADR、術語表的格式', '框架本身、建立知識庫'],
      ['triage', '改來用', 'issue 標籤用語；Agent 的留言要標明是 AI 產生', '學習、審核'],
      ['code-review', '改來用', '分兩個角度審：照不照規範、有沒有做到要求', '審核'],
      ['pr', '改來用', '變更提案說明的寫法，用 GLOSSARY 的詞', '新增、修改'],
      ['setup-matt-pocock-skills', '改來用', '一次性設定：先看現況、提出建議，確認後才寫', '建立知識庫'],
      ['git-guardrails-claude-code', '改來用', '用 hook 擋危險的 git 指令；保留推分支，只擋強制推送、直接推主線、reset --hard、刪分支', '框架的 hook'],
      ['wizard', '改來用', '一步一步帶人做只有人能做的事，例如安裝、登入主機', '第一天指南'],
      ['tdd、to-spec、to-tickets、implement…', '不採用', '寫程式用的流程，和知識維護無關', '—']
    ],
    Anthropic: [
      ['skill-creator', '採用', '評估 skill、調整說明的觸發率', '五個 skill 寫好之後'],
      ['doc-coauthoring', '改來用', '讀者測試：沒有背景的子 agent 回答問題', '新增、修改'],
      ['pptx、docx', '不採用', '我們用自寫引擎做單一 HTML 簡報（ADR-0004）', '—'],
      ['web-artifacts-builder', '不採用', '要 React、Vite 一整套，比現有打包重', '—']
    ],
    其他: [
      ['Claude Code hook', '採用', '每次修改自動跑檢查程式', '檢查'],
      ['Explore 子 agent', '採用', '要掃很多章時，唯讀地找', '學習（查找）'],
      ['Karpathy 的 LLM wiki', '改來用', '程式產生的索引，給查找先讀', '學習（查找）'],
      ['wiki-curator（本機）', '不採用', '在背景用 bypassPermissions 寫檔，不適合共用的 repo', '—'],
      ['andrej-karpathy-skills', '不採用', '寫程式的行為準則，不是 Karpathy 本人寫的', '—']
    ]
  };
  A({
    id: 'extskills', part: 4, minutes: 2.5, short: '外部 skill 怎麼參考',
    title: '外部 skill：mattpocock 系列可以參考，借做法不加依賴', en: 'External Skills',
    thesis: 'mattpocock 系列有 <b>12 個用得上</b>，大多是「改來用」；寫程式用的流程不採用。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('ex-seg', Object.keys(EX).map(k => k === 'mattpocock' ? 'mattpocock 系列' : k === 'Anthropic' ? 'Anthropic 官方' : '其他'), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>依 docs/research/existing-approaches.md，以及 GitHub 上 mattpocock/skills 的 main</span><span id="ex-n"></span></div>
          <div style="flex:1;min-height:0;overflow:auto"><table class="t" style="font-size:15px"><thead><tr><th style="width:24%">skill</th><th style="width:10%">判斷</th><th>借用什麼／為什麼不用</th><th style="width:20%">用在哪</th></tr></thead><tbody id="ex-b"></tbody></table></div></div></div>
      ${U.side({
        points: ['<b>可以參考</b>：訪談、研究、出題、審核、issue、寫 skill 都有現成做法', '它的原則也適用：<b>先看到錯誤才加規則</b>、能組合就不新增 skill', '<b>git-guardrails</b> 很重要：Agent 替大家操作 Git，要擋危險指令', '寫程式用的流程（tdd、to-spec……）不採用'],
        fact: { v: '借做法，不加依賴', d: '做法寫進我們自己的 5 個 skill，同仁不用另外安裝 mattpocock' },
        analogy: { icon: 'bread', t: '比喻', p: '像參考別家的食譜：學他們的手法，寫進自己的菜單，不是每道菜都去他們店裡買。' }
      })}</div>`,
    init(el) {
      const keys = Object.keys(EX);
      U.onSeg(el, 'ex-seg', i => {
        const rows = EX[keys[i]];
        U.$(el, '#ex-n').textContent = `${rows.length} 項`;
        U.$(el, '#ex-b').innerHTML = rows.map(([n, v, why, where]) => `<tr><td class="mono"><b>${n}</b></td><td class="${v === '採用' ? 'y' : v === '改來用' ? 'm' : 'n'}">${v}</td><td>${why}</td><td>${where}</td></tr>`).join('');
      });
    },
    notes: `你問 mattpocock 這系列能不能參考：可以。我查了 GitHub 上 mattpocock/skills 的 main，和本機裝的 1.3.1 一樣。跟知識維護有關、用得上的有 12 個，大多是「改來用」。例如 grilling 用在訪談，to-questionnaire 是老手沒空時的問卷，teach 的出題規則用在帶讀，code-review 的兩個角度用在審核，triage 讓 Agent 的留言標明是 AI 產生，writing-for-agents 是我們寫 skill 的原則。

特別提一個：git-guardrails。因為 Agent 會替不懂 Git 的同仁操作 Git，要用 hook 擋掉強制推送、直接推主線、reset --hard 這些危險指令；原版會擋掉所有 push，我們要改成保留推分支。

切到「Anthropic 官方」和「其他」看另外兩類。原則是借做法、不加依賴：把做法寫進我們自己的 5 個 skill，同仁不用另外安裝 mattpocock。寫程式用的流程，例如 tdd、to-spec，不採用。`
  });

  /* 放在「技術選擇」後面 */
  Deck.move('skills', 'tools'); Deck.move('extskills', 'skills');
})();
