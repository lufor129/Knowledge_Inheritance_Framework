/* 第三部分：跟 Git 主機結合（ADR-0005） */
(function () {
  const A = Deck.add.bind(Deck);

  /* 對到 Git 上 */
  const GM = [
    ['變更提案', 'PR', 'MR', '推上分支，產生訊息貼給維護者'],
    ['審核、退回', 'PR 審查：核准或要求修改', 'MR 審查：核准或留意見', '維護者看完訊息後合併'],
    ['待回答', 'issue（標籤：待回答）', 'issue（標籤：待回答）', '寫進那一章的自我檢查，標成【待回答】'],
    ['勘誤', 'issue（標籤：勘誤）', 'issue（標籤：勘誤）', '直接開變更提案'],
    ['檢查', '本機 hook＋GitHub Actions', '本機 hook＋GitLab CI', '只有本機 hook'],
    ['入口網站、簡報', 'CI 建置，入口網站打包成 portal.zip，放在 Release 下載', 'CI 建置，放在 Release 下載（下載指令還沒實測）', '請 Agent 現場建置'],
    ['標籤', '種類、kb:知識庫、來歷', '種類、kb:知識庫、來歷', '（不用）'],
    ['Agent 用的指令', 'gh', 'glab', 'git']
  ];
  A({
    id: 'gitmap', part: 3, minutes: 2, short: '對到 Git 上',
    title: '對到 Git 上：GitHub、GitLab，或沒有主機', en: 'Git Mapping',
    thesis: '框架只用兩邊都有的功能，<b>Agent 依設定檔選 gh 或 glab</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('gm-seg', ['GitHub', 'GitLab', '手動模式'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>框架的說法 → 實際用到的東西</span><span>正式內容＝主線</span></div>
          <table class="t" style="font-size:18px"><thead><tr><th style="width:30%">框架</th><th id="gm-h">GitHub</th></tr></thead><tbody id="gm-b"></tbody></table></div></div>
      ${U.side({
        points: ['只用 issue、PR／MR、標籤、指派、CI 這些<b>兩邊都有</b>的功能', '沒有主機時退回<b>手動模式</b>，Agent 要分辨現在是哪一種', '提問和回報都透過 Agent，不另外做 issue 範本'],
        fact: { v: 'gh／glab', d: '同一套流程，兩種主機都能用' },
        analogy: { icon: 'lego', t: '比喻', p: '像旅行用的轉接頭：插頭不變，換個接頭就能插不同國家的插座。' }
      })}</div>`,
    init(el) {
      U.onSeg(el, 'gm-seg', i => {
        U.$(el, '#gm-h').textContent = ['GitHub', 'GitLab', '手動模式'][i];
        U.$(el, '#gm-b').innerHTML = GM.map(r => `<tr${i === 2 && r[3] !== r[1] ? ' class="hl"' : ''}><td><b>${r[0]}</b></td><td>${r[i + 1]}</td></tr>`).join('');
      });
    },
    notes: `第三部分，跟 Git 主機結合。框架裡的每個詞，在 Git 主機上都有對應的東西：變更提案是 PR 或 MR，待回答和勘誤是貼了標籤的 issue，檢查是本機 hook 加上 CI。框架只用兩邊都有的功能，公司最後用哪一個都接得上。

切到「手動模式」：這是沒有 Git 主機時的備援，藍底的列和有主機時不同。提案靠貼訊息，待回答寫進那一章的自我檢查，勘誤直接開變更提案。`
  });

  /* 誰能合併：主線只強制檢查，核准靠約定和 Agent 提醒 */
  A({
    id: 'review', part: 3, minutes: 2, short: '誰能合併',
    title: '誰能合併：主線只強制檢查，核准靠約定', en: 'Merging',
    thesis: '主線只強制 <b>CI 檢查要過</b>；別人的提案要等維護者核准，這一點靠<b>約定和 Agent 提醒</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('rv-who', ['維護者自己的提案', '別人的提案'], 1)}${U.seg('rv-ck', ['檢查通過', '檢查沒過'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>一個變更提案怎麼進到主線</span><span></span></div>
          <div class="flowrow" id="rv-flow" style="margin-top:14px"></div>
          <div class="card" id="rv-note" style="font-size:18px;margin-top:18px"></div>
          <div class="cards" style="margin-top:auto">
            <div class="card"><h4>主線規則</h4><p>只強制「CI 檢查要過」；誰能合併不另外限制。設定簡單，GitHub、GitLab 用哪種方案都一樣。</p></div>
            <div class="card"><h4>維護者不在</h4><p>不特別處理，提案就等著；維護者離職時，再由框架維護者找人接手。</p></div>
          </div></div></div>
      ${U.side({
        points: ['<b>自己的提案</b>：檢查過了，自己合併', '<b>別人的提案</b>：Agent 請維護者審，核准後才合併', 'Git 主機不擋「沒核准就合併」，合併前 Agent 會提醒'],
        fact: { v: '只強制檢查', d: '誰能合併不另外限制；核准靠約定和 Agent 提醒' },
        analogy: { icon: 'road', t: '比喻', p: '像開車：闖紅燈有照相機一定抓（CI 檢查）；路口禮讓行人靠大家自覺，路邊的標誌（Agent）提醒你。' }
      })}</div>`,
    init(el) {
      let who = 1, ok = 0;
      const upd = () => {
        const st = (t, k, x) => `<div class="st ${k}${x ? ' skip' : ''}">${t}</div>`;
        const steps = [st('開變更提案', 'ag'), st(ok ? 'CI 檢查 ✗' : 'CI 檢查 ✓', 'prog')];
        if (!ok) steps.push(...(who ? [st('Agent 請維護者審', 'ag'), st('維護者核准', 'hum'), st('合併', 'hum')] : [st('自己合併', 'hum')]), st('正式內容', 'core'));
        else steps.push(st('不能合併', 'prog'));
        U.$(el, '#rv-flow').innerHTML = steps.join('<span class="ar">→</span>');
        U.$(el, '#rv-note').innerHTML = ok ? '<b style="color:var(--bad)">檢查沒過：</b>誰都不能合併。Agent 看 CI 的錯誤訊息修正，再推一次。'
          : who ? '<b>別人的提案：</b>開提案時，Agent 請這個知識庫的維護者審；維護者看過白話整理，核准後才合併，要修改就留意見。還沒有人核准就要合併時，Agent 會提醒。'
          : '<b>維護者自己的提案：</b>GitHub 不讓提出的人核准自己的提案，所以檢查過了就自己合併。Agent 會把研究來的內容標出來，幫忙多看一眼。';
      };
      U.onSeg(el, 'rv-who', i => { who = i; upd(); });
      U.onSeg(el, 'rv-ck', i => { ok = i; upd(); });
    },
    notes: `我們決定維護者自己的提案自己審，但 GitHub 不讓提出的人核准自己的提案。所以主線只強制一件事：CI 檢查要過。誰能合併也不另外限制，設定最簡單，GitHub、GitLab 用哪種方案都一樣。

切換看看。別人的提案：Agent 開提案時請維護者審，核准後才合併；還沒人核准就要合併，Agent 會提醒。這一點靠約定，Git 主機不會擋。自己的提案：檢查過了就自己合併。切到「檢查沒過」：誰都不能合併。`
  });

  /* 待回答與勘誤：issue 的一生 */
  const IS = {
    q: ['機台保養（PM）多久做一次？', '「hk1 說牆每薄 0.2 nm 漏電多 10 倍，可是我看到另一份資料寫 5 倍？」'],
    lab: ['待回答', '勘誤'],
    body: ['章：從設計到量產（新人猜的，傳承者可以改）', '簡報頁：閘極 › hk1；哪一句：「牆每薄 0.2 nm…」；理由：另一份資料寫 5 倍'],
    done: ['簡報多了一頁和一題自我檢查，附上答案和出處', '簡報頁 hk1 和後面的深入頁一起修正，出處一起補上'],
    mode: ['訪談', '研究']
  };
  const ISTEPS = [
    { t: '新人跟 Agent 說', d: '查找時簡報沒寫，或覺得哪裡寫錯了。' },
    { t: '先查重複', d: '有一樣的 issue，就在那題留言「我也想知道」。' },
    { t: '開 issue', d: 'Agent 問一句「要記下來嗎？」，新人說好就開，不用審核。' },
    { t: '傳承者認領', d: '開工時 Agent 列出傳承者關心的知識庫的 issue（第一次問過就記在本機）；老王說「我來回答 #12」。' },
    { t: '變更提案連到 issue', d: '說明裡寫「Closes #12」，貼上來歷標籤；CI 檢查通過。' },
    { t: '合併，issue 關閉', d: '維護者核准合併後，issue 自動關閉。' }
  ];
  A({
    id: 'issues', part: 3, minutes: 2, short: '待回答與勘誤',
    title: '待回答與勘誤：新人說一句，就變成 issue', en: 'Issues',
    thesis: '新人不用懂 Git，<b>跟 Agent 說就好</b>；答案併入後 issue 自動關閉。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('is-k', ['待回答', '勘誤'], 0)}</div>
        <div class="fig grow"><div class="fig-title"><span>一個 issue 的一生</span><span>#12</span></div>
          <div id="is-view" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px"></div></div>
        ${U.stepperHTML('is-st')}</div>
      ${U.side({
        points: ['Agent 先查重複，再問一句就開，<b>不用審核</b>', '傳承者開工時看到，說「我來回答」就<b>認領</b>', '<b>勘誤</b>附上哪一頁、哪一句、為什麼不對', '簡報不放沒有答案的題目，手動模式例外'],
        fact: { v: '自動關閉', d: '答案併入主線，issue 就關閉，題目也可以加進自我檢查' },
        analogy: { icon: 'target', t: '比喻', p: '像醫院掛號：病人掛號、醫師叫號看診、看完歸檔，沒有人會在走廊上等著沒人理。' }
      })}</div>`,
    init(el, ctx) {
      let k = 0, i = 0;
      const view = U.$(el, '#is-view');
      const draw = () => {
        const labs = `<span class="tag ${k ? 'b' : 'w'}">${IS.lab[k]}</span> <span class="tag a">kb:semiconductor</span>`;
        const parts = [];
        parts.push(`<div class="bub me show" style="align-self:flex-start;max-width:100%"><span class="by">新人</span>${IS.q[k]}</div>`);
        if (i >= 1) parts.push(`<div class="bub ai" style="max-width:100%"><span class="by">Agent</span>查過了，沒有一樣的題目。要記下來嗎？</div>`);
        if (i >= 2) parts.push(`<div class="card" style="background:#fff;${i >= 5 ? 'opacity:.75' : ''}"><h4>issue #12 ${i >= 5 ? '· 已關閉 ✓' : '· 開啟中'}</h4><p style="font-size:18px;font-weight:600;color:var(--ink)">${k ? '勘誤：閘極 hk1 的漏電倍數' : IS.q[0]}</p><p>${labs}　${i >= 3 ? '<span class="tag g">負責人：老王</span>' : '<span class="tag">還沒人認領</span>'}</p><p>${IS.body[k]}</p></div>`);
        if (i >= 4) parts.push(`<div class="card key"><h4>變更提案 #31 · Closes #12</h4><p><span class="tag">來歷：${IS.mode[k]}</span> <span class="tag g">CI ✓</span>${i >= 5 ? ' <span class="tag g">已合併</span>' : ''}</p></div>`);
        if (i >= 5) parts.push(`<div class="card" style="background:#dcefe4;border-color:#a7d3b9"><p style="font-size:18px;color:var(--ink)">✓ ${IS.done[k]}</p></div>`);
        view.innerHTML = parts.join('');
      };
      U.onSeg(el, 'is-k', j => { k = j; draw(); });
      U.stepper(el, 'is-st', ISTEPS, j => { i = j; draw(); }, ctx, { interval: 2200 });
    },
    notes: `這頁看一個 issue 的一生，選「待回答」，再按「下一步」。新人問了簡報沒寫的問題，Agent 先查有沒有一樣的 issue，沒有就問一句要不要記下來，新人說好就開，不用審核。

老王開工時看到這題，說「我來回答 #12」就認領。寫好後開變更提案，說明裡寫 Closes #12，合併後 issue 自動關閉，簡報多了一頁和一題自我檢查。切到「勘誤」：流程一樣，issue 裡附上哪一頁、哪一句、為什麼覺得不對。`
  });
})();
