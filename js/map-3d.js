/* 府邸 3D 沙盘 —— 把舆图的 panels / rooms 和 map-art.js 的水系草木“立”起来。
 *
 *   坐标  直接沿用舆图的 1000×700：x 向东，z 向南（即舆图的 y），y 向上，1 单位 = 舆图 1px。
 *         所以这里没有第二份布局数据，改 tools/lore_data.py 两张图一起变。
 *   依赖  three.js 随仓库放在 js/ 下，第一次进 3D 才动态加载；其余页面仍是零依赖。
 *   画法  每种 kind 一个小工厂（堂、楼、合院、门、桥亭、水榭、假山、园），
 *         全部由基础几何体拼出，纹理用 canvas 现画，没有任何图片 / 模型文件。
 */
(function () {
  'use strict';

  let T, M, S;                       // three 模块、共享材质、已建好的场景（只建一次）
  let seed = 17;
  const rnd = () => (seed = seed * 16807 % 2147483647) / 2147483647;   // 固定种子：草木山石每次打开都在原处
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s || '').replace(/[&<>"]/g, c => '&#' + c.charCodeAt(0) + ';');

  /* 游览路线只列院落 id；解说词直接用舆图数据里的 basis（每处所据回目），不另写一份 */
  const TOURS = {
    yuan: { name: '游园 · 第17回', ids: ['gate', 'qujing', 'qinfang', 'xiang', 'daoxiang', 'hengwu', 'daguanlou', 'yihong'].map(s => 'map-yuan-' + s) },
    rong: { name: '进府 · 第3回', ids: ['gate', 'jiamu', 'jiashe', 'xitang', 'zheng'].map(s => 'map-rong-' + s) }
  };
  const GROUND = { rong: '#dfe3cd', yuan: '#cfe0c2', ning: '#e6dcc8' };

  /* ------------------------------------------------------------ 基础件 */

  function mesh(g, geo, mat, x, y, z) {
    const m = new T.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0); m.castShadow = m.receiveShadow = true; g.add(m);
    return m;
  }
  const box = (g, mat, w, h, d, x, y, z) => mesh(g, new T.BoxGeometry(w, h, d), mat, x, y, z);
  const cyl = (g, mat, r, h, x, z, y0) => mesh(g, new T.CylinderGeometry(r, r, h, 8), mat, x, (y0 || 0) + h / 2, z);
  const sub = (g, x, z, y) => { const o = new T.Group(); o.position.set(x, y || 0, z); g.add(o); return o; };
  const leaf = c => M[c] || (M[c] = new T.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true, side: T.DoubleSide }));
  const blob = (g, c, r, x, y, z) => mesh(g, new T.IcosahedronGeometry(r, 1), leaf(c), x, y, z);
  const trunk = (g, h) => cyl(g, M.wood, .9, h, 0, 0);
  const uv = (geo, a, b) => { const u = geo.attributes.uv; for (let i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * a, u.getY(i) * b); return geo; };

  function tex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'));
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace;
    return t;
  }

  function materials() {
    const m = (color, o) => new T.MeshStandardMaterial(Object.assign({ color: color, roughness: .85 }, o));
    /* 瓦垄：沿屋脊方向重复的明暗条，贴在屋面上就是一垄一垄的瓦 */
    const tile = tex(4, 16, g => { g.fillStyle = '#fff'; g.fillRect(0, 0, 4, 16); g.fillStyle = '#8d8d8d'; g.fillRect(0, 0, 4, 5); });
    tile.repeat.set(1, .5);
    const ripple = tex(128, 128, g => {
      g.fillStyle = '#fff'; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(70,120,125,.55)'; g.lineWidth = 2;
      for (let i = 0; i < 26; i++) { const x = 6 + rnd() * 90, y = 6 + rnd() * 116; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 12, y - 4, x + 26, y); g.stroke(); }
    });
    const glow = tex(64, 64, g => {
      const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, '#fff'); r.addColorStop(.3, 'rgba(255,255,255,.5)'); r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    });
    M = {
      stone: m('#cfc8b4'), wall: m('#f3eee2'), brick: m('#c9c1ab'), ochre: m('#d9b974'), red: m('#8c1f28'),
      wood: m('#6f5a42'), rock: m('#aaa696', { flatShading: true }), ridge: m('#4f575a'),
      grey: m('#77848a', { map: tile }), zhu: m('#c0614a', { map: tile }),
      win: m('#5c4636', { emissive: '#ffae4a', emissiveIntensity: 0 }),            // 夜里亮灯的槅扇
      lamp: m('#d8402f', { emissive: '#ff5a2a', emissiveIntensity: .4 }),
      water: m('#93cfc9', { map: ripple, roughness: .2, transparent: true, opacity: .93 }),
      glow: new T.SpriteMaterial({ map: glow, color: '#ffab5e', blending: T.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }),
      dot: glow
    };
  }

  /* ------------------------------------------------------------ 建筑 */

  /* 屋顶：一条下凹的坡面曲线沿屋脊拉伸；再把上半向里收（庑殿的斜脊），四角往上挑（飞檐） */
  function roofGeo(w, d, h, hip) {
    const s = new T.Shape(), e = d / 2;
    s.moveTo(-e, 0); s.quadraticCurveTo(-e * .3, h * .2, 0, h); s.quadraticCurveTo(e * .3, h * .2, e, 0);
    const g = new T.ExtrudeGeometry(s, { depth: w, steps: 12, bevelEnabled: false, curveSegments: 8 });
    g.translate(0, 0, -w / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i), z = p.getZ(i);
      p.setZ(i, z * (1 - hip * y / h));
      p.setY(i, y + Math.pow(Math.abs(z) / (w / 2), 4) * Math.pow(Math.abs(p.getX(i)) / e, 2) * h * .3);
    }
    g.rotateY(Math.PI / 2); g.computeVertexNormals();
    return g;
  }

  function lantern(g, x, y, z) {
    mesh(g, new T.SphereGeometry(1.3, 8, 6), M.lamp, x, y, z).scale.y = 1.25;
    const s = new T.Sprite(M.glow); s.position.set(x, y, z); s.scale.setScalar(20); g.add(s);
  }

  /* 一座殿屋：台基、屋身、前檐红柱、槅扇、屋顶。返回上层的起始高度，楼阁靠它往上叠 */
  function hall(g, w, d, o) {
    o = o || {};
    const y = o.y || 0, h = o.h || clamp(w * .16, 7, 14), rh = d * .4 + 3, n = Math.max(2, Math.round(w / 13));
    if (!y) box(g, M.stone, w + 5, 2, d + 5, 0, 1, 0);
    if (!o.open) {
      box(g, M.wall, w * .92, h, d * .7, 0, y + 2 + h / 2, -d * .08);
      box(g, M.win, w * .7, h * .62, .6, 0, y + 2 + h * .5, d * .27 + .2);
    }
    for (let i = 0; i <= n; i++) (o.open ? [-1, 1] : [1]).forEach(s => cyl(g, M.red, .8, h, (i / n - .5) * (w - 2), s * (d / 2 - 1.5), y + 2));
    mesh(g, roofGeo(w + 8, d + 9, rh, .3), o.roof || M.grey, 0, y + 2 + h, 0);
    box(g, M.ridge, (w + 8) * .7 + 2, 1.5, 1.8, 0, y + 2.3 + h + rh, 0);
    if (o.lamp) [-1, 1].forEach(s => lantern(g, s * w * .3, y + h - 1, d / 2 + 1.5));
    return y + 2 + h + rh * .3;
  }

  /* 墙：粉墙黛瓦。只有东西向、南北向两种，所以不用算旋转 */
  function wall(g, s, h, mat) {
    const ns = s[0] === s[2], L = Math.abs(ns ? s[3] - s[1] : s[2] - s[0]) + 1.6, x = (s[0] + s[2]) / 2, z = (s[1] + s[3]) / 2;
    box(g, mat, ns ? 1.6 : L, h, ns ? L : 1.6, x, h / 2, z);
    box(g, M.ridge, ns ? 3 : L + .6, 1.2, ns ? L + .6 : 3, x, h + .6, z);
  }

  /* 合院：围墙一圈、南面留门，正房坐北；进深够就添东西厢房 */
  function court(g, w, d, roof, mat) {
    const a = w / 2 - 4, b = d / 2 - 3, md = clamp(d * .34, 11, 20);
    [[-a, -b, a, -b], [-a, -b, -a, b], [a, -b, a, b], [-a, b, -6, b], [6, b, a, b]].forEach(s => wall(g, s, 6, mat || M.wall));
    hall(sub(g, 0, -b + md / 2 + 4), w * .5, md, { roof: roof, lamp: 1 });
    if (d > 56) [-1, 1].forEach(s => { const k = sub(g, s * (a - 9), 8); k.rotation.y = -s * Math.PI / 2; hall(k, d * .34, 10, { h: 7 }); });
  }

  /* 攒尖顶亭子：四根柱 + 一条下凹曲线绕轴转四面 */
  function pavilion(g, r, y) {
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(p => cyl(g, M.red, .7, 9, p[0] * r * .6, p[1] * r * .6, y));
    const pts = [[r * 1.3, 0], [r * .55, 2], [r * .2, 6], [.01, 10]].map(p => new T.Vector2(p[0], p[1]));
    const geo = new T.LatheGeometry(pts, 4).toNonIndexed(); geo.computeVertexNormals();
    mesh(g, geo, M.grey, 0, y + 9, 0).rotation.y = Math.PI / 4;
  }

  function rocks(g, w, d, n) {
    for (let i = 0; i < n; i++) {
      const r = 4 + rnd() * 6, m = mesh(g, new T.DodecahedronGeometry(r, 0), M.rock, (rnd() - .5) * w, r * .6, (rnd() - .5) * d);
      m.scale.y = 1 + rnd() * 1.5; m.rotation.y = rnd() * 6;
    }
  }

  function pond(g, x, z, rx, rz, y) {
    const m = mesh(g, uv(new T.CircleGeometry(1, 40), 3, 3), M.water, x, y || .35, z);
    m.rotation.x = -Math.PI / 2; m.scale.set(rx, rz, 1); m.castShadow = false;
  }

  function walk(g, points, width, material, y) {
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i], dx = b[0] - a[0], dz = b[1] - a[1];
      const slab = box(g, material, Math.hypot(dx, dz), .55, width, (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2);
      slab.rotation.y = -Math.atan2(dz, dx);
    }
    points.forEach(p => box(g, material, width, .55, width, p[0], y, p[1]));
  }

  /* 低层附屋按无名建筑群渲染，不带地点标签；布局是填充空间的示意肌理。 */
  function accessory(g, w, d) {
    box(g, M.wall, w, 7, d * .68, 0, 4.5, 0);
    mesh(g, roofGeo(w + 3, d + 3, d * .35 + 2, .08), M.grey, 0, 8, 0);
    box(g, M.wood, w * .25, 4, .5, 0, 4, d * .36);
  }

  const BUILD = {
    '正堂': (g, w, d) => hall(g, w * .82, d * .5, { roof: M.zhu, lamp: 1 }),
    '厅': (g, w, d) => hall(g, w * .7, d * .5, { lamp: 1 }),
    '正房': (g, w, d) => court(g, w, d, M.zhu),
    '院落': (g, w, d) => court(g, w, d, M.grey),
    '庵': (g, w, d) => { court(g, w, d, M.grey, M.ochre); cyl(g, M.wood, .4, 26, w * .34, d * .2); box(g, M.lamp, 5, 3, .3, w * .34 + 2.8, 24, d * .2); },
    '楼': (g, w, d) => { const o = { roof: M.zhu, lamp: 1 }; hall(g, w * .56, d * .42, Object.assign({ y: hall(g, w * .78, d * .6, o) - 2 }, o)); },
    '门': g => { hall(g, 40, 13, { open: 1, lamp: 1, h: 11 }); box(g, M.red, 17, 9, 1, 0, 6.5, 0); },
    '亭': g => { box(g, M.stone, 20, 2, 20, 0, 1, 0); pavilion(g, 9, 2); },
    /* 沁芳亭：第17回“桥上有亭” —— 一道石拱跨溪，亭子压在拱顶 */
    '桥': g => {
      const s = new T.Shape(); s.absarc(0, -19.2, 29.2, 2.425, .717, true); s.absarc(0, -19.2, 26.5, .717, 2.425, false);
      mesh(g, new T.ExtrudeGeometry(s, { depth: 13, bevelEnabled: false, curveSegments: 16 }), M.stone, 0, 0, -6.5);
      pavilion(g, 7, 9.5);
    },
    '榭': (g, w, d) => { box(g, M.stone, w * .5, 1, d * .9, 0, 3.5, 0); hall(g, w * .42, d * .6, { open: 1, y: 2, h: 8 }); },
    '景': (g, w, d) => rocks(g, w * .8, d * .7, 9),
    /* 会芳园：一池、一山、几株梅（第11回赏梅），与平面图同一套布置 */
    '园林': (g, w, d) => {
      pond(g, -w * .16, -d * .08, w * .22, d * .17);
      rocks(sub(g, w * .25, -d * .1), w * .3, d * .2, 8);
      [['plum', -.28, .22], ['plum', -.06, .3], ['pine', .22, .24], ['bamboo', .36, .06]].forEach(p => plant(g, p[0], w * p[1], d * p[2], 1.2));
    }
  };

  /* ------------------------------------------------------------ 草木（种类与位置都来自 map-art.js） */

  const PLANT = {
    pine: g => { trunk(g, 8); for (let i = 0; i < 3; i++) mesh(g, new T.ConeGeometry(8 - i * 2.2, 9, 7), leaf('#4c6b50'), 0, 9 + i * 5.5, 0); },
    bamboo: g => {
      for (let i = 0; i < 7; i++) {
        const x = rnd() * 12 - 6, z = rnd() * 12 - 6, h = 15 + rnd() * 10;
        mesh(g, new T.CylinderGeometry(.3, .4, h, 5), leaf('#86a86c'), x, h / 2, z); blob(g, '#7fa56a', 2.4, x, h, z).scale.y = 1.8;
      }
    },
    willow: g => { trunk(g, 11); blob(g, '#a3bb82', 7.5, 0, 14, 0).scale.y = .7; mesh(g, new T.CylinderGeometry(7, 9, 9, 9, 1, true), leaf('#a3bb82'), 0, 9.5, 0); },
    plum: g => { trunk(g, 7); for (let i = 0; i < 4; i++) blob(g, '#d98b97', 2.6 + rnd() * 1.5, rnd() * 8 - 4, 8 + rnd() * 4, rnd() * 8 - 4); },
    apricot: g => { trunk(g, 8); for (let i = 0; i < 3; i++) blob(g, i ? '#f0cfd0' : '#e9b9bd', 5 + rnd() * 2, rnd() * 7 - 3.5, 11 + rnd() * 3, rnd() * 7 - 3.5); },
    banana: g => { for (let i = 0; i < 6; i++) { const l = mesh(g, new T.SphereGeometry(1, 6, 5).translate(0, 1, 0), leaf('#6f9f58')); l.scale.set(2.4, 7, .5); l.rotation.set(0, i * 1.05, .5); } },
    vine: g => { [[-5, -3], [5, -3], [5, 3], [-5, 3]].forEach(p => cyl(g, M.wood, .4, 7, p[0], p[1])); blob(g, '#87996d', 7, 0, 7.5, 0).scale.set(1, .22, .7); },
    lotus: g => { for (let i = 0; i < 4; i++) { const x = rnd() * 16 - 8, z = rnd() * 10 - 5; mesh(g, new T.CylinderGeometry(3, 3, .3, 9), leaf('#8fb07f'), x, .2, z); if (i < 2) blob(g, '#e7a4b2', 1, x, 1.2, z); } }
  };
  function plant(g, s, x, z, k, y) { const o = sub(g, x, z, y); o.scale.setScalar(k); PLANT[s](o); return o; }

  /* ------------------------------------------------------------ 场景 */

  function build(el, map, opt) {
    materials();
    const A = window.MAP_ART.data, rooms = map.rooms.filter(r => !r.unplaced);
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(40, 1, 2, 7000);
    const gl = new T.WebGLRenderer({ antialias: true });
    gl.setPixelRatio(Math.min(devicePixelRatio, 2)); gl.shadowMap.enabled = true; gl.shadowMap.type = T.PCFSoftShadowMap;

    el.innerHTML = '<div class="m3-labels"></div><div class="m3-bar">' +
      Object.keys(TOURS).map(k => '<button data-tour="' + k + '">▶ ' + TOURS[k].name + '</button>').join('') +
      '<button data-act="night">入夜</button><button data-act="home">全景</button>' +
      (el.requestFullscreen ? '<button data-act="fs">全屏</button>' : '') + '</div>' +
      '<div class="m3-card" hidden></div><p class="m3-tip">拖动旋转 · 滚轮缩放 · 右键或 Shift 拖动平移 · WASD 漫游 · 点建筑看依据</p>';
    const cv = gl.domElement, layer = el.firstChild, card = el.querySelector('.m3-card'); el.prepend(cv);

    /* 光：白天一盏暖日头，入夜换成冷月，槅扇与灯笼自己亮起来 */
    const DAY = new T.Color('#e9e6d8'), NIGHT = new T.Color('#0c1228'), SUN = new T.Color('#fff0d8'), MOON = new T.Color('#8ea4ff');
    const hemi = new T.HemisphereLight('#ffffff', '#b8b09a', 1.5), sun = new T.DirectionalLight(SUN, 2.3);
    sun.position.set(40, 620, 250); sun.target.position.set(500, 0, 340); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0004; sun.shadow.normalBias = 1.5;
    Object.assign(sun.shadow.camera, { left: -640, right: 640, top: 520, bottom: -520, near: 100, far: 1900 });
    sun.shadow.camera.updateProjectionMatrix();
    scene.background = DAY.clone(); scene.fog = new T.Fog(DAY.clone(), 1500, 4200);
    scene.add(hemi, sun, sun.target);

    /* 地面、三块地、府墙（南面给大门留口）、宁荣街、石狮 */
    const m = c => new T.MeshStandardMaterial({ color: c, roughness: 1 });
    const land = mesh(scene, new T.PlaneGeometry(12000, 12000), m('#e2ddcb'), 500, 0, 340); land.rotation.x = -Math.PI / 2; land.castShadow = false;
    box(scene, m('#d6ccb4'), 892, 1, 36, 498, .5, 634);
    map.panels.forEach(p => {
      const x0 = p.x, x1 = p.x + p.w, z0 = p.y, z1 = p.y + p.h, yuan = p.id === 'yuan';
      const gate = rooms.find(r => r.panel === p.id && r.kind === '门'), gx = gate ? gate.x + gate.w / 2 : x0 + 20;
      box(scene, m(GROUND[p.id] || '#e0e5d1'), p.w, 1.6, p.h, x0 + p.w / 2, .8, z0 + p.h / 2);
      [[x0, z0, x1, z0], [x0, z0, x0, z1], [x1, z0, x1, z1], [x0, z1, gx - 21, z1], [gx + 21, z1, x1, z1]]
        .forEach(s => wall(scene, s, yuan ? 9 : 13, yuan ? M.wall : M.brick));
      box(scene, M.stone, 16, .6, 20, gx, 1, z1 + 9);                                   // 门前甬道，接到街上
      if (gate && !yuan) [-1, 1].forEach(s => {                                         // 第3回：大门前蹲着两个大石狮子
        const l = sub(scene, gx + s * 30, z1 + 9);
        box(l, M.stone, 7, 3, 7, 0, 1.5, 0); box(l, M.rock, 4, 5, 6, 0, 5.5, 0); mesh(l, new T.SphereGeometry(2.6, 8, 6), M.rock, 0, 9, 2);
      });
    });

    /* 大观园：沿水而行的石板游径、夹岸小径与临水汀步。点线坐标与平面图共用。 */
    A.gardenPaths.forEach(points => walk(scene, points, 5.5, M.stone, 2.2));

    /* 无名附屋群：复用舆图肌理数据，不生成地点标签，也不响应地点词条跳转。 */
    A.fabric.forEach(b => {
      const g = sub(scene, b[0] + b[2] / 2, b[1] + b[3] / 2, 1.6);
      accessory(g, b[2], b[3]);
    });

    /* 沁芳溪：把平面图的三段贝塞尔接成一条曲线，拉一根压扁的管子当水面 */
    const path = new T.CurvePath();
    A.water.forEach(d => {
      const n = d.match(/[\d.]+/g).map(Number), P = j => new T.Vector3(n[j], 0, n[j + 1]);
      for (let i = 2; i < n.length; i += 6) path.add(new T.CubicBezierCurve3(P(i - 2), P(i), P(i + 2), P(i + 4)));
    });
    const brook = mesh(scene, uv(new T.TubeGeometry(path, 140, 7, 8), 18, 2), M.water, 0, 1.25, 0); brook.scale.y = .1; brook.castShadow = false;
    pond(scene, A.pool.cx, A.pool.cy, A.pool.rx, A.pool.ry + 6, 1.95);

    /* 院落：每处一个组，userData 挂回舆图数据，点选、标签、游览都靠它 */
    const grow = [], labels = [], R = {}, groups = [];
    function label(text, sub2, x, y, z, big) {
      const e = document.createElement('div'); e.className = 'm3-lb' + (big ? ' big' : '');
      e.innerHTML = esc(text) + (sub2 ? '<em>' + esc(sub2) + '</em>' : ''); layer.appendChild(e);
      const L = { el: e, pos: new T.Vector3(x, y, z), big: big, w: e.offsetWidth || 90 }; labels.push(L);
      return L;
    }
    rooms.forEach(r => {
      const p = map.panels.find(q => q.id === r.panel), owner = opt.byId[r.owner];
      /* 大门不画在地块中间，而是嵌进南墙的缺口里 */
      const g = sub(scene, r.x + r.w / 2, r.kind === '门' && p ? p.y + p.h : r.y + r.h / 2, 1.6);
      (BUILD[r.kind] || BUILD['院落'])(g, r.w, r.h);
      const top = new T.Box3().setFromObject(g).max.y;
      const o = R[r.id] = g.userData.room = { r: r, g: g, owner: owner, L: label(r.name, owner && owner.name, g.position.x, top + 5, g.position.z) };
      o.L.el.onclick = () => select(o);
      groups.push(g); grow.push([g, .5 + (600 - g.position.z) / 420 + rnd() * .15, 1, true]);   // 自南向北依次拔地而起
    });
    A.trees.concat(A.lotus.map(l => ({ s: 'lotus', x: l.x, y: l.y, k: .8 }))).forEach(t =>          // 荷叶浮在藕香榭的水面上
      grow.push([plant(scene, t.s, t.x, t.y, t.k * 1.25, t.s === 'lotus' ? 2 : 1.6), 1.6 + rnd() * 1.2, t.k * 1.25]));
    A.rocks.forEach(k => rocks(sub(scene, k.x + k.w / 2, k.y + k.h / 2, 1.6), k.w * .8, k.h * .6, 7));
    map.panels.forEach(p => label(p.name, '', p.x + p.w / 2, 70, p.y - 6, true));
    label('宁 荣 街', '', 498, 2, 634, true);

    /* 落花（“花谢花飞飞满天”，第27回）与星空：都是一把点，CPU 上挪一挪就够了 */
    const N = 520, pp = new Float32Array(N * 3), sp = new Float32Array(900 * 3);
    for (let i = 0; i < N; i++) pp.set([400 + rnd() * 440, rnd() * 90, 70 + rnd() * 530], i * 3);
    for (let i = 0; i < 900; i++) {
      const a = rnd() * 6.283, b = Math.acos(rnd() * .95);
      sp.set([500 + 5000 * Math.sin(b) * Math.cos(a), 5000 * Math.cos(b), 340 + 5000 * Math.sin(b) * Math.sin(a)], i * 3);
    }
    const points = (arr, o) => {
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(arr, 3));
      const pts = new T.Points(g, new T.PointsMaterial(Object.assign({ map: M.dot, transparent: true, depthWrite: false }, o)));
      pts.frustumCulled = false; scene.add(pts);
      return pts;
    };
    const petals = points(pp, { color: '#f0a9b8', size: 4.5 });
    const stars = points(sp, { color: '#fff', size: 3, sizeAttenuation: false, fog: false, opacity: 0 });
    const mark = box(scene, new T.MeshBasicMaterial({ color: '#b3262f', transparent: true, opacity: .22, depthWrite: false }), 1, .3, 1, 0, 1.8, 0);
    mark.castShadow = mark.receiveShadow = mark.visible = false;

    /* ---------- 机位：C 是当前值，G 是目标值，每帧让 C 追 G，所有运镜（拖动、飞行、游览）只改 G ---------- */
    const C = { x: 500, z: 345, r: 1500, phi: .02, th: 0 }, G = Object.assign({}, C);      // 开场从正俯视的“舆图”立起来
    const fit = r => r * Math.max(1, 1 / cam.aspect);                                   // 竖屏时退远一些，保证看得全
    const unwind = () => { C.th = G.th = Math.atan2(Math.sin(C.th), Math.cos(C.th)); };   // 转了几圈之后，回正时走最近的方向
    const home = () => { unwind(); Object.assign(G, { x: 500, z: 372, r: fit(860), phi: .9, th: 0 }); };
    const fitPanel = p => Math.max(p.w * 1.15 / Math.max(.01, cam.aspect), p.h * 1.15);
    function move(rt, fw) {
      G.x = clamp(G.x + Math.cos(G.th) * rt - Math.sin(G.th) * fw, 0, 1000);
      G.z = clamp(G.z - Math.sin(G.th) * rt - Math.cos(G.th) * fw, 0, 720);
    }

    let tour = null, sel = null, hot = null, cur = '', night = 0, nf = 0, t = 0, last = 0, lw = 0, lh = 0;
    function select(o, keep) {
      if (!keep) stopTour();
      if (sel) sel.L.el.classList.remove('on');
      sel = o; card.hidden = !o; mark.visible = !!o;
      if (!o) return;
      const r = o.r;
      o.L.el.classList.add('on'); mark.position.set(o.g.position.x, 1.8, o.g.position.z); mark.scale.set(r.w, 1, r.kind === '门' ? 30 : r.h);
      Object.assign(G, { x: o.g.position.x, z: o.g.position.z, r: Math.max(r.w, r.h) * 1.5 + 90, phi: 1.08 });
      card.innerHTML = (tour ? '<i>' + TOURS[tour.key].name + ' · ' + (tour.i + 1) + ' / ' + tour.ids.length + '</i>' : '') +
        '<b>' + esc(r.name) + '</b><span>' + esc(r.kind) + '</span>' +
        (o.owner ? '<button data-go="' + esc(o.owner.id) + '">' + esc(o.owner.name) + ' ›</button>' : '') + '<p>' + esc(r.basis) + '</p>';
    }
    function stopTour() { tour = null; el.querySelectorAll('[data-tour]').forEach(b => b.classList.remove('on')); }
    function focus(id) {
      const p = map.panels.find(q => q.id === id);
      cur = id; select(null); unwind();
      p ? Object.assign(G, { x: p.x + p.w / 2, z: p.y + p.h / 2 + 20, r: fitPanel(p), phi: .9, th: 0 }) : home();
    }

    /* ---------- 交互 ---------- */
    const ray = new T.Raycaster(), ndc = new T.Vector2(), ptr = new Map();
    let moved = 0, pinch = 0;
    function pick(e) {
      const b = cv.getBoundingClientRect();
      ray.setFromCamera(ndc.set((e.clientX - b.left) / b.width * 2 - 1, 1 - (e.clientY - b.top) / b.height * 2), cam);
      let o = (ray.intersectObjects(groups, true)[0] || {}).object;
      while (o && !o.userData.room) o = o.parent;
      return o ? o.userData.room : null;
    }
    cv.onpointerdown = e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, e); moved = 0; };
    cv.onpointermove = e => {
      const p = ptr.get(e.pointerId);
      if (!p) {                                                  // 没按下：只做悬停提示
        const o = pick(e);
        if (o !== hot) { if (hot) hot.L.el.classList.remove('hot'); if (o) o.L.el.classList.add('hot'); hot = o; cv.style.cursor = o ? 'pointer' : ''; }
        return;
      }
      const dx = e.clientX - p.clientX, dy = e.clientY - p.clientY, k = C.r * .0016;
      ptr.set(e.pointerId, e);
      if ((moved += Math.abs(dx) + Math.abs(dy)) > 4) stopTour();
      if (ptr.size > 1) {                                        // 双指：捏合缩放 + 平移
        const q = Array.from(ptr.values()), d = Math.hypot(q[0].clientX - q[1].clientX, q[0].clientY - q[1].clientY);
        if (pinch) G.r = clamp(G.r * pinch / d, 60, 2400);
        pinch = d; move(-dx * k / 2, dy * k / 2);
      } else if (e.buttons & 2 || e.shiftKey) move(-dx * k, dy * k);
      else { G.th -= dx * .005; G.phi = clamp(G.phi - dy * .005, .12, 1.5); }
    };
    cv.onpointerup = cv.onpointercancel = e => { ptr.delete(e.pointerId); pinch = 0; if (moved < 5 && e.type === 'pointerup') select(pick(e)); };
    cv.oncontextmenu = e => e.preventDefault();
    cv.addEventListener('wheel', e => { e.preventDefault(); stopTour(); G.r = clamp(G.r * Math.exp(e.deltaY * .0012), 60, 2400); }, { passive: false });
    const keys = {};
    addEventListener('keydown', e => { if (el.clientWidth && !e.metaKey && !e.ctrlKey && !/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) keys[e.key.toLowerCase()] = 1; });
    addEventListener('keyup', e => { keys[e.key.toLowerCase()] = 0; });
    card.onclick = e => { const id = e.target.getAttribute('data-go'); if (id) opt.open(id); };
    el.querySelector('.m3-bar').onclick = e => {
      const b = e.target.closest('button'), k = b && (b.dataset.tour || b.dataset.act);
      if (!b) return;
      if (b.dataset.tour) {
        const again = tour && tour.key === k;
        select(null); if (again) return home();
        tour = { key: k, ids: TOURS[k].ids.filter(id => R[id]), i: -1, t: 0 }; b.classList.add('on');
      } else if (k === 'night') { night = 1 - night; b.textContent = night ? '天明' : '入夜'; el.classList.toggle('night', !!night); }
      else if (k === 'home') { select(null); home(); }
      else if (k === 'fs') document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen();
    };

    /* ---------- 每帧 ---------- */
    const v = new T.Vector3(), back = x => 1 + 2.70158 * Math.pow(x - 1, 3) + 1.70158 * Math.pow(x - 1, 2);
    function frame(now) {
      requestAnimationFrame(frame);
      const W = el.clientWidth, H = el.clientHeight;
      if (!W) { last = 0; return; }                              // 切到别的栏目时不渲染
      if (W !== lw || H !== lh) { gl.setSize(lw = W, lh = H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); if (!t) focus(cur); }
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dt;

      if (t < 5) grow.forEach(a => { const s = back(clamp((t - a[1]) / .7, 0, 1)) * a[2] || 1e-4; a[3] ? a[0].scale.y = s : a[0].scale.setScalar(s); });

      if (tour && (tour.t -= dt) <= 0) {                         // 游览：每站停 6.5 秒，镜头绕着慢慢转
        if (++tour.i >= tour.ids.length) { select(null); home(); } else { select(R[tour.ids[tour.i]], true); tour.t = 6.5; }
      }
      if (tour) G.th += dt * .11;
      const fw = (keys.w || 0) - (keys.s || 0), rt = (keys.d || 0) - (keys.a || 0), ro = (keys.e || 0) - (keys.q || 0);
      if (fw || rt || ro) { stopTour(); move(rt * dt * G.r * .8, fw * dt * G.r * .8); G.th += ro * dt * 1.3; }

      const k = 1 - Math.exp(-dt * 3);
      for (const i in G) C[i] += (G[i] - C[i]) * k;
      cam.position.set(C.x + C.r * Math.sin(C.phi) * Math.sin(C.th), C.r * Math.cos(C.phi) + 6, C.z + C.r * Math.sin(C.phi) * Math.cos(C.th));
      cam.lookAt(C.x, 6, C.z);

      if (Math.abs(night - nf) > .001 || t < .1) {               // 昼夜渐变
        nf += (night - nf) * Math.min(1, dt * 2.5);
        scene.background.lerpColors(DAY, NIGHT, nf); scene.fog.color.copy(scene.background);
        hemi.intensity = 1.5 - 1.3 * nf; sun.intensity = 2.3 - 1.9 * nf; sun.color.lerpColors(SUN, MOON, nf);
        M.win.emissiveIntensity = nf * 2.2; M.lamp.emissiveIntensity = .4 + nf * 2; M.glow.opacity = nf * .9;
        stars.material.opacity = nf; petals.material.opacity = 1 - nf * .55;
      }
      M.water.map.offset.x -= dt * .12;
      for (let i = 0; i < N; i++) {
        pp[i * 3] += Math.sin(t * .7 + i) * dt * 5; pp[i * 3 + 1] -= dt * (5 + i % 7);
        if (pp[i * 3 + 1] < 1) pp[i * 3 + 1] = 90;
      }
      petals.geometry.attributes.position.needsUpdate = true;
      gl.render(scene, cam);

      /* 文字标签：三维点投到屏幕上；选中的、近的先占位，被压住的先收起来，拉近了自然露出 */
      const used = [], rank = L => (sel && sel.L === L ? -2 : hot && hot.L === L ? -1 : L.d);
      labels.forEach(L => { v.copy(L.pos).project(cam); L.x = (v.x + 1) * W / 2; L.y = (1 - v.y) * H / 2; L.d = v.z; });
      labels.sort((a, b) => rank(a) - rank(b)).forEach(L => {
        const on = L.d < 1 && L.x > 0 && L.x < W && L.y > 0 && L.y < H + 20 && !(L.big && cur !== 'all') && (L.big ? C.r > 380 :
          !used.some(u => Math.abs(u.x - L.x) < (u.w + L.w) / 2 + 3 && Math.abs(u.y - L.y) < 23));
        L.el.style.display = on ? '' : 'none';
        if (!on) return;
        L.el.style.transform = 'translate(-50%,-100%) translate(' + L.x.toFixed(1) + 'px,' + L.y.toFixed(1) + 'px)';
        L.el.style.zIndex = Math.round((1 - L.d) * 1e5);
        if (!L.big) used.push(L);
      });
    }
    requestAnimationFrame(frame);
    return { focus: focus };
  }

  window.MAP_3D = {
    /** 进入 3D：首次调用时加载 three.js 并建场景，之后只移动镜头。失败（无 WebGL / 加载不到）时 reject，由调用方退回平面图 */
    show: function (el, map, opt) {
      const ready = S ? Promise.resolve() : import('./three.module.min.js').then(mod => { T = mod; S = build(el, map, opt); });
      return ready.then(() => S.focus(opt.focus));
    }
  };
})();
