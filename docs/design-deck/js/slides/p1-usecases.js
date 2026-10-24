/* 第一部分：各角色的使用情境與結果（一頁，接在「四種角色」後面）；每個情境下方附 Git 圖示 */
(function () {
  const ROWS = [['情境', ''], ['你說', 'me'], ['Agent 做什麼', 'ai'], ['結果', 'ok']];
  const STEPS = [{ t: '情境', d: '先看是什麼情況。' }, { t: '你說', d: '用中文跟 Agent 說，不用記指令。' }, { t: 'Agent 做什麼', d: 'Agent 和程式在背後做的事；下面的圖是 Git 主機上的變化。' }, { t: '結果', d: '最後得到什麼。' }];

  /* Git 圖示的狀態：issues（issue 卡片）、br（分支上的修改數）、pr（變更提案）、merged、release、dl（新人下載）、read（只讀主線）、kbList、ciAll、note */
  const I12 = (st, who) => ({ no: 12, lab: '待回答', st, who });
  const I15 = (st, who) => ({ no: 15, lab: '勘誤', st, who });
  const PR = (o, rv) => Object.assign({}, o, { rv });
  const P31 = { no: 31, closes: 12, tags: ['訪談'], ci: 'ok' }, P32 = { no: 32, tags: ['研究'], ci: 'ok' }, P33 = { no: 33, who: '小陳', tags: ['整理'], ci: 'ok' };
  const UC = [
    { n: '新人', person: '小美，製程整合部新人', cases: [
      { n: '第一天', r: ['小美剛進製程整合部，主管請她先熟悉半導體。', '「打開半導體的簡報。」或從首頁的知識庫清單下載。', '從 Git 主機拿 CI 建好的簡報；沒有的話，Agent 現場建置後打開。', '先看全景圖和每章速覽，兩小時內抓到全貌；看不懂的術語查術語表。'],
        g: [{}, {}, { release: 1, dl: 1, note: 'CI 在主線更新後建好簡報，放在 Release' }, { release: 1, dl: 1, note: '小美下載單一 HTML，離線也能看' }] },
      { n: '看不懂', r: ['讀到 OPC，看不懂它跟光罩有什麼關係。', '「OPC 是什麼？跟光罩有什麼關係？」', '只根據手冊回答，附上出處：微影 › litho6；要的話接著帶讀，出一題小題目。', '懂了，也知道要回哪一節再看一次。'],
        g: [{ read: 1, note: '這個情境不動 Git' }, { read: 1, note: '這個情境不動 Git' }, { read: 1, note: 'Agent 只讀主線上的手冊來回答' }, { read: 1, note: '這個情境不動 Git' }] },
      { n: '手冊沒寫', r: ['想知道機台保養多久做一次，手冊沒寫。', '「機台保養（PM）多久做一次？」接著說「好，記下來」。', '直說手冊沒寫、不自己編；查過沒有一樣的題目，開成 issue，標上待回答和 kb:semiconductor。', '傳承者認領回答，合併後小美收到通知，常見問題多了一題。'],
        g: [{ read: 1, note: 'Agent 先讀主線上的手冊：沒有寫' }, { read: 1, note: 'Agent 先讀主線上的手冊：沒有寫' }, { issues: [I12('open')], note: '開 issue #12，標上待回答和 kb:semiconductor' }, { issues: [I12('closed', '老王')], br: 2, pr: PR(P31, 'ok'), merged: 1, release: 1, note: '老王回答、合併後，#12 自動關閉' }] },
      { n: '覺得寫錯', r: ['hk1 寫漏電多 10 倍，小美看到另一份資料寫 5 倍。', '「hk1 這一句好像寫錯了。」', '開成勘誤 issue，附上是哪一節、哪一句、為什麼覺得不對。', '傳承者認領修正，出處一起補上；小美不用自己改。'],
        g: [{ read: 1, note: '小美讀的是主線上的手冊' }, { read: 1, note: '小美讀的是主線上的手冊' }, { issues: [I15('open')], note: '開 issue #15，標上勘誤和 kb:semiconductor' }, { issues: [I15('closed', '老王')], br: 1, pr: PR({ no: 35, closes: 15, tags: ['研究'], ci: 'ok' }, 'ok'), merged: 1, release: 1, note: '修正合併後，#15 自動關閉' }] }] },
    { n: '傳承者', person: '老王，資深製程工程師', cases: [
      { n: '開工', r: ['老王早上打開 Claude Code。', '「有什麼待回答是我可以回答的？」', '列出他關心的知識庫的 issue：#12 機台保養多久做一次、#15 勘誤 hk1。', '老王說「我來回答 #12」，issue 指派給他。'],
        g: [{ issues: [I12('open'), I15('open')] }, { issues: [I12('open'), I15('open')] }, { issues: [I12('open'), I15('open')], note: 'Agent 用標籤 kb:semiconductor 篩出待回答和勘誤' }, { issues: [I12('open', '老王'), I15('open')], note: '#12 指派給老王' }] },
      { n: '回答待回答', r: ['#12 只有老王知道，沒有任何文件寫過。', '口述：「保養週期要看機台類型，例如……」', '用訪談反問三題，寫成常見問題的一題，出處寫「老王（製程整合）口述，2026-10」；跑檢查和讀者測試，開變更提案連到 #12，貼上「訪談」。', '維護者核准合併，#12 自動關閉，小美收到通知。'],
        g: [{ issues: [I12('open', '老王')] }, { issues: [I12('open', '老王')], br: 1, note: 'Agent 開一個分支，開始寫' }, { issues: [I12('open', '老王')], br: 2, pr: PR(P31, 'wait'), note: '變更提案連到 #12；CI 檢查通過，等維護者審' }, { issues: [I12('closed', '老王')], br: 2, pr: PR(P31, 'ok'), merged: 1, release: 1, note: '合併後 #12 自動關閉，CI 重新建置' }] },
      { n: '研究新主題', r: ['主管希望大家了解 High-NA EUV。', '「幫我研究 High-NA EUV，放進微影那章。」', '用自己的知識和找到的資料寫草稿，數字附出處；老王確認後開變更提案，貼上「研究」。', '維護者特別仔細審；核准後成為正式內容，對應的簡報頁被點名要重看。'],
        g: [{}, { br: 1, note: 'Agent 開一個分支，開始寫' }, { br: 2, pr: PR(P32, 'wait'), note: '變更提案貼上「研究」；CI 檢查通過' }, { br: 2, pr: PR(P32, 'ok'), merged: 1, release: 1, note: '核准合併，成為正式內容' }] },
      { n: '被要求修改', r: ['維護者在提案上留意見：「第二段的數字要補出處。」', '「照維護者的意見改。」', '讀提案上的意見，補上出處，重新跑檢查，推上去。', '維護者核准合併。'],
        g: [{ br: 2, pr: PR(P32, 'chg'), note: '維護者要求修改，附上意見' }, { br: 2, pr: PR(P32, 'chg'), note: '維護者要求修改，附上意見' }, { br: 3, pr: PR(P32, 'wait'), note: '補上出處，再推一次，CI 重跑' }, { br: 3, pr: PR(P32, 'ok'), merged: 1, release: 1, note: '核准合併' }] }] },
    { n: '維護者', person: '老王，半導體製程的維護者', cases: [
      { n: '審別人的提案', r: ['小陳開了一個變更提案，主機請老王審。', '「幫我審這個變更提案。」', '用白話整理改了什麼、來歷是整理、影響哪幾頁簡報和哪幾題常見問題；CI 檢查已經通過。', '老王核准、合併；CI 重新建置手冊網站和簡報。'],
        g: [{ br: 2, pr: PR(P33, 'wait'), note: '主機請維護者審' }, { br: 2, pr: PR(P33, 'wait'), note: '主機請維護者審' }, { br: 2, pr: PR(P33, 'wait'), note: 'Agent 用白話整理這個提案' }, { br: 2, pr: PR(P33, 'ok'), merged: 1, release: 1, note: '核准合併，CI 重新建置' }] },
      { n: '研究來的提案', r: ['這個提案貼著「研究」標籤。', '「把研究來的段落列給我看。」', '逐段列出 Agent 自己寫的說法和出處，標出沒有出處的數字。', '老王發現一個數字不對，要求修改並附上意見。'],
        g: [{ br: 2, pr: PR(P32, 'wait') }, { br: 2, pr: PR(P32, 'wait') }, { br: 2, pr: PR(P32, 'wait'), note: '逐段看研究來的說法和出處' }, { br: 2, pr: PR(P32, 'chg'), note: '要求修改，附上意見' }] },
      { n: '自己的提案', r: ['老王自己補了一節。', '「開變更提案，檢查過了就合併。」', '開提案、CI 檢查通過；再把研究來的段落列出來，讓他多看一眼。', '自己合併，不用等別人。'],
        g: [{ br: 1, note: '老王的分支' }, { br: 2, pr: PR({ no: 34, tags: ['整理'], ci: 'run' }, 'self'), note: '開變更提案，CI 檢查中' }, { br: 2, pr: PR({ no: 34, tags: ['整理'], ci: 'ok' }, 'self'), note: 'CI 檢查通過' }, { br: 2, pr: PR({ no: 34, tags: ['整理'], ci: 'ok' }, 'self'), merged: 1, release: 1, note: '檢查過了，自己合併' }] }] },
    { n: '框架維護者', person: '你，框架維護者', cases: [
      { n: '核准新知識庫', r: ['阿哲想開「電腦視覺」知識庫，骨架已經建好。', '「幫我看 CV 的骨架提案。」', '整理骨架：部分和章、維護者、全景圖草稿、術語表；檢查已經通過。', '核准合併，CV 知識庫成立，首頁的知識庫清單自動多一列。'],
        g: [{ br: 1, pr: PR({ no: 40, title: 'CV 骨架', tags: ['kb:cv'], ci: 'ok' }, 'wait') }, { br: 1, pr: PR({ no: 40, title: 'CV 骨架', tags: ['kb:cv'], ci: 'ok' }, 'wait') }, { br: 1, pr: PR({ no: 40, title: 'CV 骨架', tags: ['kb:cv'], ci: 'ok' }, 'wait'), note: 'Agent 整理骨架的內容' }, { br: 1, pr: PR({ no: 40, title: 'CV 骨架', tags: ['kb:cv'], ci: 'ok' }, 'ok'), merged: 1, kbList: 1, note: 'CV 成立，首頁清單多一列' }] },
      { n: '改引擎', r: ['有人想讓簡報引擎支援影片。', '「這個修改會影響哪些知識庫？」', 'CI 把每個知識庫的手冊網站和簡報都建置一次，列出結果。', '全部建置成功才核准，不會弄壞別的知識庫。'],
        g: [{ br: 1, pr: PR({ no: 41, title: '引擎支援影片', ci: 'run' }, 'wait') }, { br: 1, pr: PR({ no: 41, title: '引擎支援影片', ci: 'run' }, 'wait') }, { br: 1, pr: PR({ no: 41, title: '引擎支援影片', ci: 'ok' }, 'wait'), ciAll: 1, note: 'CI 把每個知識庫都建置一次' }, { br: 1, pr: PR({ no: 41, title: '引擎支援影片', ci: 'ok' }, 'ok'), ciAll: 1, merged: 1, release: 1, note: '全部成功才核准合併' }] },
      { n: '要不要加規則', r: ['同一個錯出現第二次：有人又把常見問題寫成一大段。', '「這個錯出現第二次了，要不要加規則？」', '先看能不能用程式檢查；能，就加進檢查程式，不能，才寫進 AGENTS.md。', '只加這一條；還沒發生過的錯，不預先加規則。'],
        g: [{}, {}, { br: 1, pr: PR({ no: 42, title: '檢查程式加一條規則', ci: 'ok' }, 'wait'), note: '修改的是框架，由框架維護者審' }, { br: 1, pr: PR({ no: 42, title: '檢查程式加一條規則', ci: 'ok' }, 'ok'), merged: 1, note: '合併後，每次檢查都會跑這條規則' }] }] }
  ];

  /* 畫 Git 圖示 */
  const C = { ink: '#17202b', ink2: '#3e4b5b', ink3: '#6a7888', line: '#c3cdd8', acc: '#1f4fb5', acc2: '#b3541e', good: '#1f7a4d', bad: '#b3261e', warn: '#a8660a', closed: '#6a4bb5' };
  function tagw(c, s) { c.font = '600 12.5px "PingFang TC","Noto Sans TC",sans-serif'; return c.measureText(s).width + 14; }
  function tag(c, s, x, y, col) {
    const w = tagw(c, s);
    c.fillStyle = col + '22'; c.strokeStyle = col; c.lineWidth = 1; U.rrect(c, x, y - 13, w, 19, 9); c.fill(); c.stroke();
    U.txt(c, s, x + 7, y + 1, { size: 12.5, w: 600, color: col }); return w;
  }
  function gdraw(c, w, h, s) {
    c.clearRect(0, 0, w, h);
    // 左：issue
    U.txt(c, 'ISSUE', 4, 16, { size: 12, w: 600, color: C.ink3 });
    const iss = s.issues || [];
    if (!iss.length) { c.save(); c.setLineDash([5, 5]); c.strokeStyle = C.line; U.rrect(c, 2, 28, 214, 62, 6); c.stroke(); c.restore(); U.txt(c, '（沒有 issue）', 109, 64, { align: 'center', size: 13.5, color: C.ink3 }); }
    iss.forEach((it, k) => {
      const y = 28 + k * 74, closed = it.st === 'closed';
      c.fillStyle = closed ? '#f3f0fa' : '#fff'; c.strokeStyle = closed ? C.closed : C.line; c.lineWidth = 1.5; U.rrect(c, 2, y, 214, 66, 6); c.fill(); c.stroke();
      U.dot(c, 16, y + 17, 5, closed ? C.closed : C.good);
      U.txt(c, `#${it.no} ${closed ? '已關閉' : '開啟中'}`, 28, y + 22, { size: 14.5, w: 700, color: C.ink });
      let x = 10; x += tag(c, it.lab, x, y + 43, it.lab === '勘誤' ? C.bad : C.warn) + 5; tag(c, 'kb:semiconductor', x, y + 43, C.acc);
      U.txt(c, it.who ? '負責：' + it.who : '還沒人認領', 210, y + 22, { align: 'right', size: 12.5, w: 600, color: it.who ? C.acc : C.warn });
    });
    // 中：主線與分支
    const gx0 = 250, gx1 = w - 180, my = h - 62, by = h - 132;
    c.strokeStyle = s.read ? C.acc : C.ink3; c.lineWidth = s.read ? 5 : 3; c.beginPath(); c.moveTo(gx0, my); c.lineTo(gx1, my); c.stroke();
    U.txt(c, 'main（正式內容）', gx0, my + 26, { size: 13, w: 600, color: s.read ? C.acc : C.ink3 });
    if (s.read) U.txt(c, '← Agent 讀這裡的手冊', gx0 + 150, my + 26, { size: 13, w: 700, color: C.acc });
    [0, 60, 120].forEach(dx => { U.dot(c, gx0 + 20 + dx, my, 7, C.ink3); });
    const bx0 = gx0 + 140, bx1 = gx1 - 70;
    if (s.br) {
      c.strokeStyle = C.acc2; c.lineWidth = 3; c.beginPath(); c.moveTo(bx0, my); c.bezierCurveTo(bx0 + 30, my, bx0 + 20, by, bx0 + 60, by); c.lineTo(bx1, by); c.stroke();
      for (let k = 0; k < s.br; k++) U.dot(c, bx0 + 90 + k * 45, by, 7, C.acc2);
      U.txt(c, '分支', bx0 + 8, by - 8, { size: 13, w: 600, color: C.acc2 });
    }
    if (s.pr) {
      const p = s.pr, py = by - 66;
      const title = `PR #${p.no}${p.closes ? ' · Closes #' + p.closes : ''}${p.title ? ' · ' + p.title : ''}${p.who ? ' · ' + p.who + '提的' : ''}`;
      c.fillStyle = '#fff'; c.strokeStyle = C.acc; c.lineWidth = 1.5; U.rrect(c, bx0 + 60, py, bx1 - bx0 - 40, 50, 6); c.fill(); c.stroke();
      U.txt(c, title, bx0 + 72, py + 20, { size: 13.5, w: 700, color: C.ink });
      let x = bx0 + 72; (p.tags || []).forEach(t => { x += (t.startsWith('kb:') ? tag(c, t, x, py + 42, C.acc) : tag(c, '來歷：' + t, x, py + 42, C.acc2)) + 5; });
      const ci = p.ci === 'ok' ? ['CI ✓', C.good] : p.ci === 'fail' ? ['CI ✗', C.bad] : ['CI 檢查中', C.warn];
      x += tag(c, ci[0], x, py + 42, ci[1]) + 5;
      const rv = { wait: ['等維護者審', C.warn], chg: ['要求修改', C.bad], ok: ['已核准', C.good], self: ['自己合併', C.acc] }[p.rv];
      if (rv) tag(c, rv[0], x, py + 42, rv[1]);
      c.strokeStyle = C.acc; c.lineWidth = 1; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(bx0 + 120, py + 50); c.lineTo(bx0 + 120, by - 8); c.stroke(); c.setLineDash([]);
    }
    if (s.merged) {
      c.strokeStyle = C.acc2; c.lineWidth = 3; c.beginPath(); c.moveTo(bx1, by); c.bezierCurveTo(bx1 + 30, by, bx1 + 20, my, gx1 - 20, my); c.stroke();
      U.dot(c, gx1 - 20, my, 10, C.good); U.txt(c, '合併', gx1 - 20, my - 16, { align: 'center', size: 13, w: 700, color: C.good });
    }
    if (s.ciAll) {
      const y0 = by - 66, x0 = gx0;
      U.txt(c, 'CI 建置每個知識庫：', x0, y0 + 14, { size: 13, w: 700, color: C.ink2 });
      let x = x0; ['半導體 ✓', 'CV ✓'].forEach(t => { x += tag(c, t, x, y0 + 38, C.good) + 5; });
    }
    // 右：Release 與下載
    const rx = w - 160;
    if (s.release || s.kbList) {
      c.strokeStyle = C.ink3; c.lineWidth = 2; U.arrow(c, gx1, my, rx - 4, my, C.ink3, 2);
      c.fillStyle = '#fff'; c.strokeStyle = C.good; c.lineWidth = 1.5; U.rrect(c, rx, my - 34, 156, 64, 6); c.fill(); c.stroke();
      U.txt(c, s.kbList ? '首頁知識庫清單' : 'Release', rx + 78, my - 10, { align: 'center', size: 14.5, w: 700, color: C.ink });
      U.txt(c, s.kbList ? '多了一列：CV' : '手冊網站、簡報', rx + 78, my + 14, { align: 'center', size: 13, color: C.ink2 });
    }
    if (s.dl) { U.arrow(c, rx + 78, my + 32, rx + 78, h - 10, C.acc, 2); U.txt(c, '小美下載', rx + 70, h - 14, { align: 'right', size: 13, w: 700, color: C.acc }); }
    if (s.note) U.txt(c, s.note, gx0, 18, { size: 14.5, w: 600, color: C.ink, bg: 'rgba(242,245,248,.95)' });
  }

  Deck.add({
    id: 'usecases', part: 1, minutes: 2.5, short: '各角色的使用情境',
    title: '各角色的使用情境：說了什麼，得到什麼', en: 'Use Cases',
    thesis: '四種角色都只要<b>跟 Agent 說話</b>：新人看和問，傳承者寫，維護者判斷內容，框架維護者管規矩。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="controls">${U.seg('uc-role', UC.map(u => u.n), 0)}<span id="uc-scbox"></span></div>
        <div class="fig grow"><div class="fig-title"><span id="uc-who"></span><span id="uc-person"></span></div>
          <div class="ritems" id="uc-rows" style="gap:6px"></div>
          <div style="position:relative;height:240px;flex:none;border-top:1px dashed var(--line);margin-top:2px"><canvas id="uc-git" style="position:absolute;inset:8px 0 0 0;width:100%;height:calc(100% - 8px);display:block"></canvas></div></div>
        ${U.stepperHTML('uc-st')}</div>
      ${U.side({
        points: ['<b>新人</b>：看、問、記下問題、回報錯誤', '<b>傳承者</b>：用說的新增，只花時間確認草稿', '<b>維護者</b>：只判斷內容對不對，不對就退回附意見', '<b>框架維護者</b>：管新知識庫、引擎和規則'],
        fact: { v: '只要說話', d: '四種角色都不用記 Git 指令，下面的圖由 Agent 代勞' },
        analogy: { icon: 'film', t: '比喻', p: '像一齣戲：同一個舞台，每個角色只要知道自己什麼時候上場、說什麼台詞。' }
      })}</div>`,
    init(el, ctx) {
      let role = 0, sc = 0, step = 0, st = null;
      const box = U.$(el, '#uc-rows');
      const cv = U.$(el, '#uc-git'), r = cv.parentElement;
      const gw = r.clientWidth, gh = r.clientHeight - 8, dpr = Math.min(2, window.devicePixelRatio || 1) * Math.max(1, Deck.scale || 1);
      cv.width = Math.round(gw * dpr); cv.height = Math.round(gh * dpr);
      const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const draw = () => {
        const u = UC[role], k = u.cases[sc];
        U.$(el, '#uc-who').textContent = `${u.n}｜情境：${k.n}`;
        U.$(el, '#uc-person').textContent = u.person;
        box.innerHTML = ROWS.map(([lab, kk], i) => {
          const bg = kk === 'me' ? 'var(--accent-soft)' : kk === 'ok' ? '#dcefe4' : '#fff';
          const bd = kk === 'me' ? '#bfcfee' : kk === 'ok' ? '#a7d3b9' : 'var(--line)';
          return `<div style="display:grid;grid-template-columns:104px 1fr;gap:10px;align-items:start;padding:6px 12px;border:1px solid ${bd};background:${bg};border-radius:6px;transition:opacity .3s;opacity:${i <= step ? 1 : .12}">
            <span class="lbl4" style="margin:0;padding-top:2px">${lab}</span><span style="font-size:17px;line-height:1.45">${k.r[i]}</span></div>`;
        }).join('');
        gdraw(c, gw, gh, k.g[step] || {});
      };
      const restart = () => { if (st) st.show(0); else draw(); };
      U.onSeg(el, 'uc-role', i => {
        role = i; sc = 0;
        U.$(el, '#uc-scbox').innerHTML = U.seg('uc-sc', UC[i].cases.map(x => x.n), 0);
        U.onSeg(el, 'uc-sc', j => { sc = j; restart(); });
      });
      st = U.stepper(el, 'uc-st', STEPS, i => { step = i; draw(); }, ctx, { interval: 2000 });
    },
    notes: `這一頁用情境看四種角色實際怎麼用。上面先選角色、再選情境，按「下一步」依序看：情境、你說什麼、Agent 做什麼、最後的結果。下方的圖是 Git 主機上同時發生的事：左邊是 issue，中間是主線和分支、變更提案、CI 和審核，右邊是 CI 建好的 Release。

新人小美：第一天從 Release 下載簡報；看不懂就問，Agent 只讀主線上的手冊；手冊沒寫就開 issue #12；覺得寫錯就開勘誤 #15。傳承者老王：開工時認領 #12，開分支、開變更提案連到 #12，合併後 issue 自動關閉。維護者：審別人的提案，研究來的逐段看，自己的提案自己合併。框架維護者：核准新知識庫、看引擎修改有沒有弄壞別的知識庫、同一個錯出現第二次才加規則。

圖上的 Git 操作全部由 Agent 代勞，四種角色都只要跟 Agent 說話。`
  });

  /* 放到「四種角色」後面 */
  Deck.move('usecases', 'roles');
})();
