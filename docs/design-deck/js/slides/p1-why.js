/* 第一部分：為什麼、給誰 */
(function () {
  const A = Deck.add.bind(Deck);

  /* 知識只在人腦袋裡：切換「沒有框架／有框架」，拖時間看老手調走之後新人還拿不拿得到 */
  A({
    id: 'why', part: 1, minutes: 2, short: '知識只在人腦袋裡',
    title: '為什麼：知識只在人腦袋裡，人一調走就沒了', en: 'Why',
    thesis: '把經驗寫成<b>有版本紀錄的簡報和手冊</b>，人換了，知識還在。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('w-m', ['沒有框架', '有框架'], 0)}</div>
        ${U.figHTML('w-cv', '一位老手、三位新人', '藍點＝知識')}
        <div class="controls">${U.range('w-t', '時間（往右拖）', 0, 100, 1, 20, '')}</div></div>
      ${U.side({
        meters: [['w-m1', '新人拿得到']],
        points: ['經驗散在<b>腦袋、個人筆記、舊簡報</b>裡', '新人不知道從哪看起，也不知道問誰', '寫成<b>簡報和手冊</b>：人調走了，知識留下來'],
        fact: { v: '版本紀錄', d: '每次修改都記一筆，誰改了什麼都查得到' },
        analogy: { icon: 'bread', t: '比喻', p: '阿嬤的拿手菜：只靠口述，阿嬤不在就失傳；寫成食譜本，每次改良記一筆，孫子照著做也做得出來。' }
      })}</div>`,
    init(el, ctx) {
      const { c, w, h } = U.canvas(U.$(el, '#w-cv'));
      let mode = 0, tt = .2;
      U.onSeg(el, 'w-m', i => mode = i);
      U.bind(el, 'w-t', v => tt = v / 100, v => v < 50 ? '老手還在' : '老手調走了');
      const S = [w * .15, h * .42], H = [w * .5, h * .42], NW = [[w * .85, h * .17], [w * .85, h * .45], [w * .85, h * .73]];
      const K = 18;
      const person = (p, a, col, lab) => {
        c.save(); c.globalAlpha = a; c.fillStyle = col;
        c.beginPath(); c.arc(p[0], p[1] - 24, 15, 0, 7); c.fill();
        U.rrect(c, p[0] - 21, p[1] - 5, 42, 34, 10); c.fill(); c.restore();
        U.txt(c, lab, p[0], p[1] + 50, { align: 'center', size: 15, w: 600, color: '#3e4b5b' });
      };
      ctx.raf((dt, t) => {
        c.clearRect(0, 0, w, h);
        const gone = tt >= .5, sA = gone ? Math.max(.12, 1 - (tt - .5) * 5) : 1;
        if (mode) {
          c.fillStyle = '#e3ebfa'; c.strokeStyle = '#1f4fb5'; c.lineWidth = 2;
          U.rrect(c, H[0] - 72, H[1] - 92, 144, 184, 8); c.fill(); c.stroke();
          U.txt(c, '手冊', H[0], H[1] - 102, { align: 'center', size: 17, w: 700, color: '#1f4fb5' });
          U.txt(c, '有版本紀錄', H[0], H[1] + 116, { align: 'center', size: 14, color: '#3e4b5b' });
          [['v1', .12], ['v2', .32], ['v3 新人補了一題', .7]].forEach(([s, at], k) => { if (tt > at) U.tag(c, s, H[0] + 84, H[1] - 66 + k * 30, { size: 13 }); });
        } else {
          [[-58, 6, -8], [-6, -32, 6], [44, 18, -4], [2, 58, 10]].forEach(([dx, dy, r]) => {
            c.save(); c.translate(H[0] + dx, H[1] + dy + 30); c.rotate(r * Math.PI / 180); c.globalAlpha = gone ? .35 : .9;
            c.fillStyle = '#fff'; c.strokeStyle = '#9aa8b8'; c.lineWidth = 1.2; c.fillRect(-26, -18, 52, 36); c.strokeRect(-26, -18, 52, 36);
            c.strokeStyle = '#d3dbe4'; c.beginPath(); c.moveTo(-18, -6); c.lineTo(18, -6); c.moveTo(-18, 4); c.lineTo(10, 4); c.stroke(); c.restore();
          });
          U.txt(c, '散落的筆記、舊簡報', H[0], H[1] + 116, { align: 'center', size: 14, color: '#6a7888' });
          if (gone) U.txt(c, '放在哪？誰知道？', H[0], H[1] - 56, { align: 'center', size: 16, w: 600, color: '#a8660a' });
        }
        for (let k = 0; k < K; k++) {
          const ang = k / K * Math.PI * 2 + t * .6;
          const orb = [S[0] + Math.cos(ang) * 64, S[1] - 6 + Math.sin(ang) * 64];
          let p = orb, a = 1;
          if (mode) {
            const tau = .04 + k / K * .4;
            if (tt > tau) {
              const u = U.ease(U.clamp((tt - tau) / .06, 0, 1));
              const slot = [H[0] - 45 + (k % 4) * 30, H[1] - 62 + Math.floor(k / 4) * 28];
              p = [U.lerp(orb[0], slot[0], u), U.lerp(orb[1], slot[1], u)];
            }
          } else if (gone) a = Math.max(0, 1 - (tt - .5) * 4);
          c.globalAlpha = a; U.dot(c, p[0], p[1], 6, '#1f4fb5'); c.globalAlpha = 1;
        }
        person(S, sA, '#b3541e', gone ? '老手調走了' : '老手');
        const got = mode ? U.clamp(.15 + tt * 1.2, 0, .95) : (gone ? .22 : .1 + tt * .5);
        const src = mode ? H : S, on = mode ? tt > .1 : !gone;
        if (on) NW.forEach((p, k) => { for (let j = 0; j < 3; j++) { const u = (t * .5 + j / 3 + k * .17) % 1; U.dot(c, U.lerp(src[0] + 50, p[0] - 32, u), U.lerp(src[1], p[1], u), 3.5, mode ? '#1f4fb5' : '#b3541e'); } });
        NW.forEach(p => {
          person(p, 1, '#1f4fb5', '新人');
          c.fillStyle = '#e8edf3'; c.fillRect(p[0] - 40, p[1] + 60, 80, 8);
          c.fillStyle = got > .6 ? '#1f7a4d' : got > .35 ? '#a8660a' : '#b3261e'; c.fillRect(p[0] - 40, p[1] + 60, 80 * got, 8);
        });
        U.setMeter(el, 'w-m1', got, got > .6 ? '多' : got > .35 ? '中' : '少', got > .6 ? 'good' : got > .35 ? 'warn' : 'bad');
      });
    },
    notes: `左邊預設是「沒有框架」：知識繞在老手身上，旁邊是散落的筆記和舊簡報。把時間往右拖，過了一半老手調走，他身上的知識跟著消失；筆記還在，但沒人知道放在哪、哪份才對。

切到「有框架」再拖一次：知識一點一點寫進手冊，老手調走之後，新人照樣拿得到。手冊旁邊的 v1、v2、v3 是版本紀錄，最後一版是新人自己補的一題。

【提示】數字和互動元件都是示意，重點是把知識從人身上搬到有版本紀錄的地方。`
  });

  /* 四種角色 */
  const ROLES = [
    { n: '新人', does: ['從入口網站挑知識庫，照學習路徑看簡報', '看簡報時打開旁白、看詳細和出處，或按「問 Agent」', '看不懂就請 Agent 查找或帶讀', '簡報或手冊沒寫、寫錯，跟 Agent 說一聲'], say: ['打開入口網站', 'OPC 是什麼？跟光罩有什麼關係？', '我在看〈半導體製程〉簡報的〈絕緣牆的兩難〉這一頁（頁 id：hk1），想問：……'], cmd: '/kb-learn' },
    { n: '傳承者', does: ['開工時看待回答、勘誤和可以補出處的簡報頁，認領要做的', '用研究、整理、訪談新增知識：先做簡報頁，一頁放不下才寫手冊', '修改、刪除或合併簡報頁和小節', '維護者留意見時，請 Agent 照意見改'], say: ['有什麼我可以做的？', '我來回答 #12', '幫我研究 High-NA EUV，放進微影那章'], cmd: '/kb-add、/kb-change、/kb-new' },
    { n: '維護者', does: ['每個知識庫至少一位，名單寫在 README', '審核變更提案：打開改過的簡報頁，核准或退回附意見', '自己的提案自己審', '來歷是「研究」的提案要特別仔細看'], say: ['幫我審這個變更提案', '第二段說錯了，請他修改並附上意見'], cmd: '/kb-review' },
    { n: '框架維護者', does: ['一開始就是建立框架的人', '核准規則、範本、引擎的修改', '核准新知識庫的建立', '先看到錯誤，才決定要不要加規則'], say: ['阿哲想開「電腦視覺」知識庫，幫我看骨架', '這個錯出現第二次了，要不要加規則？'], cmd: '/kb-review' }
  ];
  A({
    id: 'roles', part: 1, minutes: 2, short: '四種角色',
    title: '四種角色：依你當下在做的事來分', en: 'Roles',
    thesis: '同一個人讀手冊時是<b>新人</b>，提出變更時就是<b>傳承者</b>。',
    render: () => `<div class="s-body">
      <div class="col"><div class="controls">${U.seg('r-seg', ROLES.map(r => r.n), 0)}</div>
        <div class="fig grow"><div class="fig-title"><span id="r-tt"></span><span>點上面的角色，直接講中文就好</span></div><div id="r-body" style="flex:1;min-height:0"></div></div></div>
      ${U.side({
        points: ['<b>新人</b>：讀、問，也可以提出變更', '<b>傳承者</b>：透過 Agent 新增、修改、刪除', '<b>維護者</b>：決定哪些內容算正式', '<b>框架維護者</b>：管規則、引擎和新知識庫'],
        fact: { v: '至少 1 位', d: '每個知識庫都有維護者；建立知識庫的人就是第一位' },
        analogy: { icon: 'fire', t: '比喻', p: '一間廚房：學徒在旁邊學、師傅把拿手菜寫成食譜、主廚試過才上菜單，老闆管整間廚房的規矩。' }
      })}</div>`,
    init(el) {
      const body = U.$(el, '#r-body'), tt = U.$(el, '#r-tt');
      U.onSeg(el, 'r-seg', i => {
        const r = ROLES[i];
        tt.textContent = r.n;
        body.innerHTML = `<div class="role-card">
          <div><h4>你會做的事</h4><ul class="points">${r.does.map(x => `<li>${x}</li>`).join('')}</ul></div>
          <div><h4>跟 Agent 這樣說</h4><div class="say">${r.say.map(x => `<span>「${x}」</span>`).join('')}</div>
            <p class="gloss" style="margin-top:18px">對應的短指令：<b>${r.cmd}</b>（不用也可以）</p></div></div>`;
      });
    },
    notes: `角色看的是你當下在做的事。同一個人讀手冊時是新人，提出變更時就是傳承者，所以新人發現少了一題，也可以自己補。

點上面的按鈕看每個角色會做什麼、怎麼跟 Agent 說。每個角色都有對應的短指令，不用也沒關係，直接講中文，Agent 會自己挑對的流程。`
  });

  /* 全景圖：橢圓上的 11 格，逐步播放或點任一格 */
  const FLOW = [
    { t: '傳承者', who: '人', lane: 'in', d: '想補充或修改知識的人，包括新人，用中文跟 Agent 說。' },
    { t: '研究・整理・訪談', who: 'Agent', lane: 'in', d: '給主題、給資料，或口述經驗。' },
    { t: '草稿', who: 'Agent → 人', lane: 'in', d: 'Agent 先做簡報頁草稿，一頁放不下才寫手冊小節；傳承者改到滿意才往下走。' },
    { t: '檢查＋讀者測試', who: '程式＋Agent', lane: 'in', d: '程式擋判斷得準的錯誤；讀者測試看寫得清不清楚。' },
    { t: '變更提案', who: 'Agent', lane: 'in', d: 'Agent 開變更提案，寫好說明和來歷。' },
    { t: '維護者審核', who: '人＋Agent', lane: 'in', d: 'Agent 用白話整理改了什麼，維護者核准或退回。' },
    { t: '正式內容', who: '簡報＋手冊', lane: 'core', d: '核准後併入主線，就是正式內容。簡報必備、手冊選配，兩邊一樣重要；說法不同時兩種都列（ADR-0006）。' },
    { t: '入口網站', who: 'CI', lane: 'out', d: '主線一更新，CI 就重新建置簡報和手冊網站，打包成入口網站 portal.zip，放在 Git 主機上供人下載。' },
    { t: '新人', who: '人', lane: 'out', d: '從入口網站照學習路徑看簡報；看不懂就按簡報下面的「問 Agent」。' },
    { t: '查找・帶讀', who: 'Agent', lane: 'out', d: '查找根據簡報和手冊回答、附出處，說法不同兩種都列；帶讀用白話解釋、出小題目。' },
    { t: '待回答', who: 'Agent → 人', lane: 'out', d: '簡報和手冊都沒寫的問題開成 issue，等傳承者認領，回到第一格。' }
  ];
  A({
    id: 'map', part: 1, minutes: 2.5, short: '全景圖',
    title: '全景圖：知識怎麼寫進去，又怎麼學出來', en: 'Big Picture',
    thesis: '上半圈<b>寫進去</b>，下半圈<b>學出來</b>，「待回答」把新人的問題送回起點。',
    render: () => `<div class="s-body w66">
      <div class="col"><div class="fig grow"><div class="fig-title"><span>點任一格，或按「自動播放」走一圈</span><span>虛線＝流動方向</span></div>
        <div class="fig-canvas" id="mp-box"><svg id="mp-svg"></svg></div></div>
        ${U.stepperHTML('mp-st')}</div>
      ${U.side({
        points: ['<b>寫進去</b>：傳承者 → Agent → 草稿 → 檢查 → 提案 → 審核', '<b>正式內容</b>：核准後的簡報和手冊，兩邊一樣重要', '<b>學出來</b>：入口網站、簡報 → 新人 → 查找、帶讀'],
        fact: { v: '4 個地方要人', d: '提問、認領、確認草稿、核准，其他交給 Agent 和 CI' },
        analogy: { icon: 'rain', t: '比喻', p: '像水循環：海水蒸發成雲、下雨流成河，最後又回到海裡。知識也在圈裡轉，越轉越完整。' }
      })}</div>`,
    init(el, ctx) {
      const box = U.$(el, '#mp-box'), svg = U.$(el, '#mp-svg');
      const { w, h } = U.fit(svg);
      const cx = w / 2, cy = h / 2, rx = w * .40, ry = h * .37;
      const step = Math.PI * 2 / FLOW.length, th0 = -6 * step;
      U.svg('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: '#e8edf3', 'stroke-width': 10 }, svg);
      const flow = U.svg('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: '#1f4fb5', 'stroke-width': 3, 'stroke-dasharray': '3 15', 'stroke-linecap': 'round', opacity: .7 }, svg);
      FLOW.forEach((_, k) => {
        const th = th0 + (k + .5) * step, x = cx + rx * Math.cos(th), y = cy + ry * Math.sin(th);
        const a = Math.atan2(ry * Math.cos(th), -rx * Math.sin(th)) * 180 / Math.PI;
        U.svg('path', { d: 'M-7,-7 L5,0 L-7,7', fill: 'none', stroke: '#6a7888', 'stroke-width': 2.5, 'stroke-linecap': 'round', transform: `translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${a.toFixed(1)})` }, svg);
      });
      [['寫進去', cx, cy - ry * .5], ['學出來', cx, cy + ry * .5]].forEach(([t, x, y]) => { const d = document.createElement('div'); d.className = 'lane-lbl'; d.style.left = x + 'px'; d.style.top = y + 'px'; d.textContent = t; box.appendChild(d); });
      const nodes = FLOW.map((n, k) => {
        const th = th0 + k * step, b = document.createElement('button');
        b.type = 'button'; b.className = 'node ' + n.lane;
        b.style.left = (cx + rx * Math.cos(th)) + 'px'; b.style.top = (cy + ry * Math.sin(th)) + 'px';
        b.innerHTML = `${n.t}<span class="w">${n.who}</span>`;
        box.appendChild(b); return b;
      });
      const st = U.stepper(el, 'mp-st', FLOW.map(n => ({ t: n.t, d: n.d })), i => nodes.forEach((b, k) => b.classList.toggle('on', k === i)), ctx, { interval: 2200 });
      nodes.forEach((b, k) => b.onclick = () => st.show(k));
      ctx.raf((dt, t) => flow.setAttribute('stroke-dashoffset', String(-t * 30)));
    },
    notes: `這張全景圖把整件事畫成一個圈。上半圈是寫進去：傳承者跟 Agent 說，Agent 先做簡報頁草稿，傳承者確認，跑過檢查和讀者測試，開變更提案，等維護者審核。核准後就是右邊的正式內容：簡報和手冊。

下半圈是學出來：CI 把它們建置好、打包成入口網站，新人從入口網站照學習路徑看簡報，不懂就請 Agent 查找或帶讀。沒寫到的問題記成待回答，回到起點等傳承者補。每一站後面都會細講，先按「自動播放」走一圈。`
  });
})();
