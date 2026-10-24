/* Transistor3D：可旋轉的電晶體 3D 模型（Planar / FinFET / GAA / Forksheet / CFET）
   座標：x = 源極→汲極（通道方向），y = 往上，z = 通道寬度方向 */
(function () {
  const TYPES = ['planar', 'finfet', 'gaa', 'forksheet', 'cfet'];
  const NAMES = { planar: '平面 Planar', finfet: '鰭式 FinFET', gaa: '環繞閘極 GAA', forksheet: '叉型片 Forksheet', cfet: '互補堆疊 CFET' };

  function mount(host, ctx, opts) {
    opts = opts || {};
    if (!window.THREE) { host.innerHTML = '<p class="caption">Three.js 未載入</p>'; return null; }
    const T = THREE;
    const w = host.clientWidth, h = host.clientHeight;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1) * Math.max(1, Deck.scale || 1));
    renderer.setSize(w, h);
    renderer.localClippingEnabled = true;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;cursor:grab;touch-action:none';

    const labelLayer = document.createElement('div');
    labelLayer.style.cssText = 'position:absolute;inset:0;pointer-events:none;font-size:14px;';
    host.appendChild(labelLayer);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, w / h, 0.1, 200);
    scene.add(new T.AmbientLight(0xffffff, 0.75));
    const d1 = new T.DirectionalLight(0xffffff, 1.35); d1.position.set(6, 10, 7); scene.add(d1);
    const d2 = new T.DirectionalLight(0xdfe8ff, 0.5); d2.position.set(-8, 4, -6); scene.add(d2);

    const M = U.MAT;
    const mat = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: .62, metalness: .05 }, o || {}));
    const mats = {
      si: mat(M.si), ox: mat(M.ox, { transparent: true, opacity: .75 }), nit: mat(M.nit), n: mat(M.n), p: mat(M.p),
      hk: mat(M.hk), sige: mat(M.sige), chN: mat('#8fb0e0'), chP: mat('#e7a58f'), wall: mat(M.nit),
      gate: mat(M.metal, { transparent: true, opacity: .9, metalness: .35, roughness: .4 }),
      gateP: mat('#8d8a9c', { transparent: true, opacity: .9, metalness: .35, roughness: .4 }),
      cont: mat(M.w, { metalness: .4 }), bpr: mat(M.cu, { metalness: .5, roughness: .35 })
    };
    const edgeMat = new T.LineBasicMaterial({ color: 0x1b2430, transparent: true, opacity: .28 });
    // 切面：一個可移動的平面，把模型切開看裡面（雙面材質讓切口看得到內部）
    const clipPlane = new T.Plane(new T.Vector3(-1, 0, 0), 99);
    Object.values(mats).concat([edgeMat]).forEach(m => { m.clippingPlanes = [clipPlane]; m.side = T.DoubleSide; });

    let group = new T.Group(); scene.add(group);
    let boxes = [];          // 記錄每個方塊，切面時用來補上實心的截面
    let capGroup = new T.Group(); scene.add(capGroup);
    const capEdge = new T.LineBasicMaterial({ color: 0x1b2430, transparent: true, opacity: .45 });
    let labels = [];
    let gateMeshes = [];
    let lanes = [];          // 電子流動的車道：{y, z0, z1, col}
    let flowGroup = new T.Group(); scene.add(flowGroup);
    let current = opts.current ?? false;
    const eGeo = new T.SphereGeometry(0.075, 10, 8);
    const eMat = { n: new T.MeshBasicMaterial({ color: 0x1f4fb5, depthTest: false, transparent: true, opacity: .95 }), p: new T.MeshBasicMaterial({ color: 0xc0392b, depthTest: false, transparent: true, opacity: .95 }) };
    function lane(y, z0, z1, kind) { lanes.push({ y, z0, z1, kind: kind || 'n' }); }

    function box(g, m, x0, x1, y0, y1, z0, z1, isGate) {
      const geo = new T.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
      const mesh = new T.Mesh(geo, m);
      mesh.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
      g.add(mesh);
      const e = new T.LineSegments(new T.EdgesGeometry(geo), edgeMat); e.position.copy(mesh.position); g.add(e);
      boxes.push({ m, x0, x1, y0, y1, z0, z1, vol: (x1 - x0) * (y1 - y0) * (z1 - z0) });
      if (isGate) { gateMeshes.push(mesh); mesh.renderOrder = 2; }
      return mesh;
    }
    function label(text, x, y, z, color) { labels.push({ text, v: new T.Vector3(x, y, z), color }); }
    // 地面上的佔地外框（比較不同結構佔多少面積）
    // 半透明橘色面＋粗邊框（WebGL 的線只有 1px，投影看不到，所以用扁平方塊當邊框）
    const fpFill = new T.MeshBasicMaterial({ color: 0xf08a3c, transparent: true, opacity: .38, depthWrite: false, side: T.DoubleSide });
    const fpEdge = new T.MeshBasicMaterial({ color: 0xc2551a });
    function outline(g, x0, x1, z0, z1, y) {
      const fill = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0), fpFill);
      fill.rotation.x = -Math.PI / 2; fill.position.set((x0 + x1) / 2, y + 0.01, (z0 + z1) / 2); fill.renderOrder = 3; g.add(fill);
      const t = 0.09, e = (a0, a1, b0, b1) => { const m = new T.Mesh(new T.BoxGeometry(a1 - a0, 0.05, b1 - b0), fpEdge); m.position.set((a0 + a1) / 2, y + 0.03, (b0 + b1) / 2); g.add(m); };
      e(x0, x1, z0 - t, z0 + t); e(x0, x1, z1 - t, z1 + t); e(x0 - t, x0 + t, z0, z1); e(x1 - t, x1 + t, z0, z1);
    }

    const builders = {
      planar(g) {
        box(g, mats.si, -3, 3, -1.6, 0, -2, 2);
        box(g, mats.n, -3, -0.85, -0.55, 0.02, -1.6, 1.6);
        box(g, mats.n, 0.85, 3, -0.55, 0.02, -1.6, 1.6);
        box(g, mats.hk, -0.6, 0.6, 0, 0.1, -1.6, 1.6);
        box(g, mats.nit, -0.85, -0.6, 0, 1.2, -1.6, 1.6);
        box(g, mats.nit, 0.6, 0.85, 0, 1.2, -1.6, 1.6);
        box(g, mats.gate, -0.6, 0.6, 0.1, 1.2, -1.6, 1.6, true);
        box(g, mats.cont, -2.2, -1.5, 0.02, 1.4, -0.35, 0.35);
        box(g, mats.cont, 1.5, 2.2, 0.02, 1.4, -0.35, 0.35);
        label('閘極 Gate', 0, 1.35, 0); label('源極 S', -2.4, 0.2, 1.7); label('汲極 D', 2.4, 0.2, 1.7);
        lane(0.04, -1.3, 1.3);
        label('通道只在表面一層', 0, -0.25, 1.9, '#b3541e');
      },
      finfet(g) {
        box(g, mats.si, -3, 3, -1.6, -0.6, -2, 2);
        box(g, mats.ox, -3, 3, -0.6, 0.2, -2, 2);
        [-0.7, 0.7].forEach(z => {
          box(g, mats.si, -3, 3, -0.6, 1.5, z - 0.18, z + 0.18); boxes[boxes.length - 1].top = 1; // 鰭被高介電層包住：切面時鰭要畫在高介電層上面
          box(g, mats.n, -3, -1.1, 0.2, 1.65, z - 0.28, z + 0.28);
          box(g, mats.n, 1.1, 3, 0.2, 1.65, z - 0.28, z + 0.28);
          box(g, mats.hk, -0.6, 0.6, 0.2, 1.58, z - 0.26, z + 0.26);
        });
        box(g, mats.nit, -0.85, -0.6, 0.2, 2.3, -1.6, 1.6);
        box(g, mats.nit, 0.6, 0.85, 0.2, 2.3, -1.6, 1.6);
        box(g, mats.gate, -0.6, 0.6, 0.2, 2.3, -1.6, 1.6, true);
        label('閘極包住鰭的三面', 0, 2.5, 0); label('源極 S', -2.4, 1.95, 0.7); label('汲極 D', 2.4, 1.95, 0.7);
        [-0.7, 0.7].forEach(z => { lane(0.55, z - 0.1, z + 0.1); lane(0.95, z - 0.1, z + 0.1); lane(1.3, z - 0.1, z + 0.1); });
      },
      gaa(g) {
        box(g, mats.si, -3, 3, -1.6, -0.2, -2, 2);
        box(g, mats.ox, -3, 3, -0.2, 0.35, -2, 2);
        box(g, mats.si, -0.6, 0.6, -0.2, 0.55, -0.7, 0.7);
        const ys = [0.85, 1.35, 1.85];
        ys.forEach(y => {
          box(g, mats.chN, -1.1, 1.1, y - 0.1, y + 0.1, -0.65, 0.65);
          box(g, mats.hk, -0.6, 0.6, y - 0.15, y + 0.15, -0.7, 0.7);
          box(g, mats.nit, -0.85, -0.6, y - 0.25, y - 0.12, -0.7, 0.7);
          box(g, mats.nit, 0.6, 0.85, y - 0.25, y - 0.12, -0.7, 0.7);
        });
        box(g, mats.n, -3, -0.85, 0.35, 2.15, -0.8, 0.8);
        box(g, mats.n, 0.85, 3, 0.35, 2.15, -0.8, 0.8);
        box(g, mats.nit, -0.85, -0.6, 2.05, 2.7, -1.5, 1.5);
        box(g, mats.nit, 0.6, 0.85, 2.05, 2.7, -1.5, 1.5);
        box(g, mats.gate, -0.6, 0.6, 0.55, 2.7, -1.5, 1.5, true);
        label('閘極 360° 環繞每一片', 0, 2.95, 0); label('奈米片 ×3', 0.2, 1.35, 1.6, '#1f4fb5'); label('源極 S', -2.4, 2.35, 0.8); label('汲極 D', 2.4, 2.35, 0.8);
        ys.forEach(y => lane(y, -0.5, 0.5));
        if (!opts.noSpacer) label('內間隔層', -1.25, 0.15, 1.1, '#1f7a4d');
      },
      // nFET 與 pFET 並排的一對環繞式電晶體（共用閘極），用來和叉型片、CFET 比較佔地
      gaapair(g) {
        box(g, mats.si, -3, 3, -1.6, -0.2, -2.6, 2.6);
        box(g, mats.ox, -3, 3, -0.2, 0.35, -2.6, 2.6);
        const ys = [0.85, 1.35, 1.85];
        [[-1.3, mats.chN, mats.n, 'n'], [1.3, mats.chP, mats.p, 'p']].forEach(([zc, cm, sd, kind]) => {
          ys.forEach(y => { box(g, cm, -1.1, 1.1, y - 0.1, y + 0.1, zc - 0.55, zc + 0.55); box(g, mats.hk, -0.6, 0.6, y - 0.15, y + 0.15, zc - 0.6, zc + 0.6); });
          box(g, sd, -3, -0.85, 0.35, 2.15, zc - 0.65, zc + 0.65); box(g, sd, 0.85, 3, 0.35, 2.15, zc - 0.65, zc + 0.65);
          ys.forEach(y => lane(y, zc - 0.45, zc + 0.45, kind));
        });
        box(g, mats.nit, -0.85, -0.6, 2.05, 2.7, -2.2, 2.2); box(g, mats.nit, 0.6, 0.85, 2.05, 2.7, -2.2, 2.2);
        box(g, mats.gate, -0.6, 0.6, 0.55, 2.7, -2.2, 2.2, true);
        outline(g, -3, 3, -2.1, 2.1, 0.37);
        label('nFET', 0, 2.95, -1.3, '#1f4fb5'); label('pFET', 0, 2.95, 1.3, '#b3541e'); label('佔地：兩個並排（橘色區域）', 2.2, 0.5, 2.3, '#b3541e');
      },
      forksheet(g) {
        box(g, mats.si, -3, 3, -1.6, -0.2, -2.6, 2.6);
        box(g, mats.ox, -3, 3, -0.2, 0.35, -2.6, 2.6);
        box(g, mats.wall, -3, 3, 0.35, 2.3, -0.1, 0.1);
        const ys = [0.85, 1.35, 1.85];
        [[-1, mats.chN, mats.n], [1, mats.chP, mats.p]].forEach(([s, cm, sd]) => {
          const z0 = s < 0 ? -1.1 : 0.1, z1 = s < 0 ? -0.1 : 1.1;
          ys.forEach(y => { box(g, cm, -1.1, 1.1, y - 0.1, y + 0.1, z0, z1); box(g, mats.hk, -0.6, 0.6, y - 0.15, y + 0.15, s < 0 ? z0 - 0.05 : z0, s < 0 ? z1 : z1 + 0.05); });
          box(g, sd, -3, -0.85, 0.35, 2.15, s < 0 ? z0 - 0.1 : z0, s < 0 ? z1 : z1 + 0.1);
          box(g, sd, 0.85, 3, 0.35, 2.15, s < 0 ? z0 - 0.1 : z0, s < 0 ? z1 : z1 + 0.1);
        });
        box(g, mats.gate, -0.6, 0.6, 0.35, 2.7, -1.6, -0.1, true);
        box(g, mats.gateP, -0.6, 0.6, 0.35, 2.7, 0.1, 1.6, true);
        label('介電牆 Wall', 1.8, 2.55, 0, '#1f7a4d'); label('佔地：比並排小（橘色區域）', 2.2, 0.5, 1.7, '#b3541e'); label('nFET', 0, 2.95, -0.9, '#1f4fb5'); label('pFET', 0, 2.95, 0.9, '#b3541e');
        outline(g, -3, 3, -1.25, 1.25, 0.37);
        ys.forEach(y => { lane(y, -1.0, -0.2, 'n'); lane(y, 0.2, 1.0, 'p'); });
      },
      cfet(g) {
        box(g, mats.si, -3, 3, -1.6, -0.2, -2.6, 2.6);
        box(g, mats.ox, -3, 3, -0.2, 0.35, -2.6, 2.6);
        const bot = [0.8, 1.25], top = [2.2, 2.65];
        // 公開示範（台積電、Intel IEDM 2023、imec 路線圖）多為 nFET 在上、pFET 在下
        bot.forEach(y => { box(g, mats.chP, -1.1, 1.1, y - 0.1, y + 0.1, -0.65, 0.65); box(g, mats.hk, -0.6, 0.6, y - 0.15, y + 0.15, -0.7, 0.7); });
        top.forEach(y => { box(g, mats.chN, -1.1, 1.1, y - 0.1, y + 0.1, -0.65, 0.65); box(g, mats.hk, -0.6, 0.6, y - 0.15, y + 0.15, -0.7, 0.7); });
        box(g, mats.ox, -3, 3, 1.55, 1.9, -0.9, 0.9);
        box(g, mats.p, -3, -0.85, 0.35, 1.5, -0.8, 0.8); box(g, mats.p, 0.85, 3, 0.35, 1.5, -0.8, 0.8);
        box(g, mats.n, -3, -0.85, 1.95, 2.95, -0.8, 0.8); box(g, mats.n, 0.85, 3, 1.95, 2.95, -0.8, 0.8);
        box(g, mats.gateP, -0.6, 0.6, 0.45, 1.6, -1.5, 1.5, true);
        box(g, mats.gate, -0.6, 0.6, 1.6, 3.05, -1.5, 1.5, true);
        label('上層 nFET', 2.1, 3.25, 0, '#1f4fb5'); label('下層 pFET', 2.1, 0.15, 1.2, '#b3541e'); label('中間隔離層', -2.2, 1.72, 1.1, '#6a7888');
        label('佔地省三到五成（橘色區域）', 0, 3.5, 0, '#b3541e');
        outline(g, -3, 3, -1.0, 1.0, 0.37);
        bot.forEach(y => lane(y, -0.5, 0.5, 'p')); top.forEach(y => lane(y, -0.5, 0.5, 'n'));
      }
    };

    let gateOpacity = opts.gateOpacity ?? .88;
    function build(type) {
      scene.remove(group);
      group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      group = new T.Group(); labels = []; gateMeshes = []; lanes = []; boxes = [];
      builders[type](group);
      scene.remove(flowGroup); flowGroup = new T.Group(); scene.add(flowGroup);
      lanes.forEach(l => { for (let k = 0; k < 7; k++) { const m = new T.Mesh(eGeo, eMat[l.kind]); m.userData = { l, x: Math.random(), z: U.lerp(l.z0, l.z1, Math.random()), v: U.rand(.7, 1.3) }; m.renderOrder = 10; flowGroup.add(m); } });
      flowGroup.visible = current;
      scene.add(group);
      setGate(gateOpacity);
      rebuildCaps();
      labelLayer.innerHTML = labels.map(l => `<span style="position:absolute;white-space:nowrap;transform:translate(-50%,-50%);background:rgba(255,255,255,.86);padding:1px 6px;border-radius:2px;color:${l.color || '#17202b'};border:1px solid rgba(0,0,0,.08)">${l.text}</span>`).join('');
    }
    /* 實心截面：找出被切面穿過的方塊，在切口補一片同色、不透明的平板。
       小方塊的平板畫在大方塊前面（polygonOffset），避免重疊處閃爍 */
    let clipDir = 'x', clipOn = false;
    function rebuildCaps() {
      capGroup.children.forEach(o => { o.geometry.dispose(); if (o.material !== capEdge) o.material.dispose(); });
      scene.remove(capGroup); capGroup = new T.Group(); scene.add(capGroup);
      if (!clipOn) return;
      const pos = clipPlane.constant, e = 1e-4;
      const area = b => (b.y1 - b.y0) * (clipDir === 'x' ? b.z1 - b.z0 : b.x1 - b.x0); // 截面積大的先畫、小的蓋在上面
      const hit = boxes.filter(b => clipDir === 'x' ? (b.x0 < pos - e && b.x1 > pos + e) : (b.z0 < pos - e && b.z1 > pos + e)).sort((a, b) => (a.top || 0) - (b.top || 0) || area(b) - area(a));
      hit.forEach((b, rank) => {
        const yc = (b.y0 + b.y1) / 2, geo = clipDir === 'x' ? new T.PlaneGeometry(b.z1 - b.z0, b.y1 - b.y0) : new T.PlaneGeometry(b.x1 - b.x0, b.y1 - b.y0);
        const mt = b.m.clone(); mt.clippingPlanes = []; mt.transparent = false; mt.opacity = 1; mt.depthWrite = true; mt.side = T.DoubleSide;
        mt.polygonOffset = true; mt.polygonOffsetFactor = -1; mt.polygonOffsetUnits = -2 * (rank + 1);
        const cap = new T.Mesh(geo, mt);
        if (clipDir === 'x') { cap.rotation.y = Math.PI / 2; cap.position.set(pos, yc, (b.z0 + b.z1) / 2); }
        else cap.position.set((b.x0 + b.x1) / 2, yc, pos);
        capGroup.add(cap);
        const ed = new T.LineSegments(new T.EdgesGeometry(geo), capEdge); ed.position.copy(cap.position); ed.rotation.copy(cap.rotation); capGroup.add(ed);
      });
    }
    function setGate(o) {
      gateOpacity = o;
      [mats.gate, mats.gateP].forEach(m => { m.opacity = o; m.depthWrite = o > .95; });
    }

    // 簡易軌道控制
    let theta = opts.theta ?? 0.75, phi = opts.phi ?? 1.05, dist = opts.dist ?? 16.5, auto = opts.auto ?? false;
    let drag = null;
    const cv = renderer.domElement;
    const onDown = e => { drag = { x: e.clientX, y: e.clientY, t: theta, p: phi }; cv.setPointerCapture(e.pointerId); cv.style.cursor = 'grabbing'; };
    const onMove = e => { if (!drag) return; const s = 0.008 / (Deck.scale || 1); theta = drag.t - (e.clientX - drag.x) * s; phi = U.clamp(drag.p - (e.clientY - drag.y) * s, 0.2, 1.55); };
    const onUp = () => { drag = null; cv.style.cursor = 'grab'; };
    const onWheel = e => { e.preventDefault(); dist = U.clamp(dist * (1 + e.deltaY * 0.001), 7, 24); };
    cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointermove', onMove);
    cv.addEventListener('pointerup', onUp); cv.addEventListener('wheel', onWheel, { passive: false });

    const tmp = new T.Vector3();
    ctx.raf(dt => {
      if (auto && !drag) theta += dt * 0.35;
      if (current) flowGroup.children.forEach(m => {
        const d = m.userData; d.x += dt * 0.28 * d.v; if (d.x > 1) d.x -= 1;
        // 電子由源極（-x）往汲極（+x）；p 型通道的電洞方向相反
        const x = d.l.kind === 'p' ? U.lerp(2.8, -2.8, d.x) : U.lerp(-2.8, 2.8, d.x);
        m.position.set(x, d.l.y, d.z);
        m.visible = true;
        // 順著電流切開時，把電子放在切口表面上流動；橫切時藏在實心截面後面
        if (clipOn && clipDir === 'x' && x > clipPlane.constant) m.visible = false;
        if (clipOn && clipDir === 'z') { const pz = clipPlane.constant; if (pz > d.l.z0 - 0.2 && pz < d.l.z1 + 0.2) m.position.z = pz + 0.03; else m.visible = false; }
      });
      const target = new T.Vector3(0, 0.5, 0);
      camera.position.set(target.x + dist * Math.sin(phi) * Math.sin(theta), target.y + dist * Math.cos(phi), target.z + dist * Math.sin(phi) * Math.cos(theta));
      camera.lookAt(target);
      renderer.render(scene, camera);
      const spans = labelLayer.children;
      labels.forEach((l, i) => {
        tmp.copy(l.v).project(camera);
        const sp = spans[i]; if (!sp) return;
        sp.style.display = clipPlane.distanceToPoint(l.v) < -0.05 ? 'none' : '';
        sp.style.left = ((tmp.x + 1) / 2 * w) + 'px';
        sp.style.top = ((1 - tmp.y) / 2 * h) + 'px';
      });
    });
    ctx.onCleanup(() => {
      group.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      capGroup.children.forEach(o => { o.geometry.dispose(); if (o.material !== capEdge) o.material.dispose(); }); capEdge.dispose();
      Object.values(mats).forEach(m => m.dispose()); eGeo.dispose(); eMat.n.dispose(); eMat.p.dispose();
      renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
    });

    build(opts.type || 'finfet');
    const setCurrent = v => { current = v; flowGroup.visible = v; };
    // dir：'x' 橫切（切面垂直於電流方向）、'z' 順著電流切；pos 超出模型範圍＝不切
    const setClip = (dir, pos) => {
      clipDir = dir; clipOn = pos < 50;
      clipPlane.normal.set(dir === 'z' ? 0 : -1, 0, dir === 'z' ? -1 : 0); clipPlane.constant = pos;
      eMat.n.depthTest = eMat.p.depthTest = clipOn; // 實心時電子不再透過材料顯示
      rebuildCaps();
    };
    const setView = (th, ph, ds) => { theta = th; if (ph != null) phi = ph; if (ds != null) dist = ds; };
    return { setType: build, setGate, setAuto: v => { auto = v; }, setCurrent, setClip, setView, TYPES, NAMES };
  }

  window.T3D = { mount, TYPES, NAMES };
})();
