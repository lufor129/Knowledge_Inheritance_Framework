/* 互動圖樣板：新做的簡報頁先套這三種，套不上才自己寫 Fig.add。
   要讓新人讀的文字（每一步的說明、每個零件的說明）寫在頁面 Markdown 的「圖說：」，這裡只管畫圖和操作。
     Fig.add('hk-wall', Fig.canvas({ … }))   拉桿看變化、切換比較：例如閘極那頁拖動厚度、切換材料
     Fig.add('gaa-flow', Fig.steps({ … }))   一步步播放：例如環繞式電晶體的製造步驟
     Fig.add('mos-parts', Fig.parts({ … }))  可以點的結構圖：例如電晶體的零件 */
(function () {
  let n = 0;
  const uid = p => `${p}${++n}`;
  const caps = p => (p && p.captions) || [];

  /* 拉桿看變化、切換比較：上面是切換，下面是拉桿，中間一張畫布，數值一變就重畫
     { title, note, segs: [{ id, items: ['二氧化矽', '二氧化鉿'], value }], sliders: [{ id, label, min, max, step, value, unit, fmt }],
       meters: [[id, 標籤]], layout, draw(c, w, h, v, t)：v 是 { 切換或拉桿的 id: 目前的值 }, update(el, v)：更新量條（U.setMeter）、文字 } */
  Fig.canvas = o => {
    const id = uid('fc');
    return {
      meters: o.meters, layout: o.layout,
      render: () => (o.segs ? `<div class="controls">${o.segs.map(s => U.seg(`${id}-${s.id}`, s.items, s.value || 0)).join('')}</div>` : '')
        + U.figHTML(id, o.title || '', o.note || '')
        + (o.sliders ? `<div class="controls">${o.sliders.map(s => U.range(`${id}-${s.id}`, s.label, s.min, s.max, s.step, s.value, s.unit)).join('')}</div>` : ''),
      init(el, ctx) {
        const { c, w, h } = U.canvas(U.$(el, '#' + id));
        const v = {};
        (o.segs || []).forEach(s => U.onSeg(el, `${id}-${s.id}`, i => { v[s.id] = i; }));
        (o.sliders || []).forEach(s => U.bind(el, `${id}-${s.id}`, x => { v[s.id] = x; }, s.fmt));
        ctx.raf((dt, t) => { c.clearRect(0, 0, w, h); o.draw(c, w, h, v, t); if (o.update) o.update(el, v); });
      }
    };
  };

  /* 一步步播放：每一步的標題和說明寫在「圖說：」（- 標題：說明），每一步怎麼畫寫在 draw
     { title, note, layout, interval, draw(c, w, h, 第幾步, 進度 0→1, t) } */
  Fig.steps = o => {
    const id = uid('fs');
    return {
      layout: o.layout,
      render: () => U.figHTML(id, o.title || '', o.note || '') + U.stepperHTML(id + '-st'),
      init(el, ctx, page) {
        const steps = caps(page).map(([t, d], i) => ({ t, d, draw: (c, w, h, p, time) => o.draw(c, w, h, i, p, time) }));
        if (steps.length) U.animSteps(el, ctx, { canvas: id, stepper: id + '-st', steps, interval: o.interval });
      }
    };
  };

  /* 可以點的結構圖：每個零件的名稱和說明寫在「圖說：」，點了圖上亮起來（draw 收到第幾個被點，-1 是都沒點）
     { title, hint, layout, draw(c, w, h, 第幾個, t) } */
  Fig.parts = o => {
    const id = uid('fp');
    return {
      layout: o.layout,
      render: page => U.figHTML(id, o.title || '', '')
        + `<div class="controls" id="${id}-b">${caps(page).map(([t], i) => `<button class="btn" type="button" data-i="${i}">${t}</button>`).join('')}</div>`
        + `<div class="step-text" id="${id}-t">${o.hint || '點一個零件，看它是什麼。'}</div>`,
      init(el, ctx, page) {
        const { c, w, h } = U.canvas(U.$(el, '#' + id));
        let sel = -1;
        U.$$(el, `#${id}-b button`).forEach(b => b.onclick = () => {
          sel = +b.dataset.i;
          U.$$(el, `#${id}-b button`).forEach(x => x.classList.toggle('primary', x === b));
          const [t, d] = caps(page)[sel];
          U.$(el, `#${id}-t`).innerHTML = `<b>${t}</b>　${d}`;
        });
        ctx.raf((dt, t) => { c.clearRect(0, 0, w, h); o.draw(c, w, h, sel, t); });
      }
    };
  };
})();
