/* 府邸渲染图的“素材库” —— 纯 SVG 图形，无外部图片依赖。
 *
 * 为什么不用 <symbol> + <use>：
 *   <use> 会生成 shadow tree，文档里的 `.m-glyph .g-roof{...}` 这类选择器
 *   进不去（只有可继承属性会传下去），结果所有图形都用默认黑色填充。
 *   所以这里把图形存成字符串，渲染时按方框算好 scale，直接内联输出。
 *
 * 画风约定（与站点配色一致）：
 *   屋顶  正堂/正房/楼 = 淡朱（主子居所，视觉重心）
 *         其余        = 青灰（附属建筑、景点、仆役居所）
 *   草木  只画“书里写过”的：潇湘馆竹、栊翠庵松、稻香村杏、紫菱洲柳、
 *         蘅芜苑藤萝、怡红院芭蕉、会芳园梅——不做无根据的均匀撒点。
 *   坐标  建筑在 120×50 的画布内，草木在 60×70 内，缩放由外层 transform 负责。
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------ 建筑 */

  var SHAPES = {
    /* 庑殿顶正堂：台基 + 抬梁 + 五间柱 + 门 */
    hall: '' +
      '<path class="g-base" d="M4 44h112v4H4z"/>' +
      '<path class="g-roof" d="M8 32 L28 12 H92 L112 32 Z"/>' +
      '<path class="g-ridge" d="M28 12 H92"/>' +
      '<path class="g-tile" d="M24 20h72M18 26h84"/>' +
      '<path class="g-col" d="M20 32v12M40 32v12M60 32v12M80 32v12M100 32v12"/>' +
      '<path class="g-door" d="M52 34h16v10H52z"/>',

    /* 悬山顶正房 */
    house: '' +
      '<path class="g-base" d="M10 44h100v4H10z"/>' +
      '<path class="g-roof" d="M14 30 L26 16 H94 L106 30 Z"/>' +
      '<path class="g-ridge" d="M26 16 H94"/>' +
      '<path class="g-col" d="M26 30v12M46 30v12M74 30v12M94 30v12"/>' +
      '<path class="g-door" d="M52 32h16v10H52z"/>',

    /* 重檐楼 */
    tower: '' +
      '<path class="g-base" d="M10 49h100v4H10z"/>' +
      '<path class="g-roof" d="M16 30 L28 20 H92 L104 30 Z"/>' +
      '<path class="g-tile" d="M22 26h76"/>' +
      '<path class="g-roof" d="M10 20 L26 4 H94 L110 20 Z"/>' +
      '<path class="g-ridge" d="M26 4 H94"/>' +
      '<path class="g-col" d="M28 30v19M92 30v19"/>' +
      '<path class="g-door" d="M50 34h20v15H50z"/>',

    /* 院落：围墙 + 月亮门 + 内屋 */
    court: '' +
      '<path class="g-wall" d="M6 46V18h108v28"/>' +
      '<path class="g-tile" d="M6 22h108"/>' +
      '<path class="g-roof" d="M34 26 L44 14 H76 L86 26 Z"/>' +
      '<path class="g-col" d="M44 26v16M76 26v16"/>' +
      '<path class="g-door" d="M54 30h12v12H54z"/>' +
      '<path class="g-moon" d="M14 46v-7a6 6 0 0 1 12 0v7"/>',

    /* 门楼：脊 + 双扇门 + 石阶 */
    gate: '' +
      '<path class="g-base" d="M18 44h84v4H18z"/>' +
      '<path class="g-roof" d="M12 26 L26 10 H94 L108 26 Z"/>' +
      '<path class="g-ridge" d="M26 10 H94"/>' +
      '<path class="g-tile" d="M20 18h80"/>' +
      '<path class="g-col" d="M28 26v18M92 26v18"/>' +
      '<path class="g-door" d="M52 28h16v16H52z"/>' +
      '<path class="g-doorline" d="M60 28v16"/>',

    /* 亭：攒尖顶 + 四柱栏杆 */
    pavilion: '' +
      '<path class="g-base" d="M30 44h60v4H30z"/>' +
      '<path class="g-roof" d="M24 26 L60 6 L96 26 Z"/>' +
      '<path class="g-col" d="M32 26v18M60 26v18M88 26v18"/>' +
      '<path class="g-rail" d="M32 38h56"/>',

    /* 水榭：半架水上 */
    xie: '' +
      '<path class="g-roof" d="M16 26 L28 14 H92 L104 26 Z"/>' +
      '<path class="g-ridge" d="M28 14 H92"/>' +
      '<path class="g-col" d="M28 26v14M60 26v14M92 26v14"/>' +
      '<path class="g-rail" d="M28 36h64"/>' +
      '<path class="g-waterline" d="M8 47q10-4 20 0t20 0 20 0 20 0 20 0"/>',

    /* 拱桥 */
    bridge: '' +
      '<path class="g-arch" d="M8 44q52-34 104 0"/>' +
      '<path class="g-rail" d="M8 44q52-34 104 0"/>' +
      '<path class="g-col" d="M30 30v10M60 20v16M90 30v10"/>' +
      '<path class="g-waterline" d="M4 48q28-6 56 0t56 0"/>',

    /* 庵：殿 + 幡竿 */
    abbey: '' +
      '<path class="g-base" d="M12 44h84v4H12z"/>' +
      '<path class="g-roof" d="M16 32 L30 16 H78 L92 32 Z"/>' +
      '<path class="g-ridge" d="M30 16 H78"/>' +
      '<path class="g-col" d="M30 32v12M78 32v12"/>' +
      '<path class="g-door" d="M46 34h16v10H46z"/>' +
      '<path class="g-pole" d="M104 46V10"/>' +
      '<path class="g-flag" d="M104 10h14l-5 6 5 6h-14"/>',

    /* 假山 */
    rock: '' +
      '<path class="g-rock" d="M8 46 L20 22 L34 30 L48 12 L64 26 L78 18 L94 34 L112 46 Z"/>' +
      '<path class="g-cun" d="M34 30l6 8M48 12l4 12M64 26l-3 10M78 18l3 10"/>',

    /* 园：山石 + 曲水 */
    garden: '' +
      '<path class="g-rock" d="M6 54 L22 28 L34 40 L48 20 L60 38 L72 26 L86 44 L98 32 L114 54 Z"/>' +
      '<path class="g-cun" d="M22 28l5 10M48 20l3 14M72 26l-4 12"/>' +
      '<path class="g-waterline" d="M8 58q18-6 36 0t36 0 36 0"/>'
  };

  var RATIO = { hall: 2.4, house: 2.4, tower: 2.22, court: 2.4, gate: 2.4, pavilion: 2.4,
    xie: 2.4, bridge: 2.4, abbey: 2.4, rock: 2.4, garden: 2.0 };

  /* ------------------------------------------------------------ 草木 */

  var PLANTS = {
    /* 竹：潇湘馆“后院植竹”，第17、26回 */
    bamboo: '' +
      '<path class="g-stem" d="M20 68V16M32 68V10M44 68V22"/>' +
      '<path class="g-node" d="M20 30h0M20 44h0M20 56h0M32 24h0M32 38h0M32 52h0M44 34h0M44 48h0"/>' +
      '<path class="g-leaf" d="M20 20q-10-6-14-2 6 5 14 2M32 14q10-8 14-4-5 6-14 4M32 30q-10-4-13 1 6 4 13-1M44 26q10-6 13-2-5 5-13 2M20 38q-9-5-13 0 6 4 13 0M44 40q9-5 12 0-5 4-12 0"/>',

    /* 松：栊翠庵一带 */
    pine: '' +
      '<path class="g-trunk" d="M30 68V34"/>' +
      '<path class="g-canopy" d="M30 8 L44 30 H16 Z"/>' +
      '<path class="g-canopy" d="M30 20 L48 44 H12 Z"/>' +
      '<path class="g-canopy" d="M30 34 L52 56 H8 Z"/>',

    /* 柳：紫菱洲临水 */
    willow: '' +
      '<path class="g-trunk" d="M30 68V30"/>' +
      '<path class="g-willow-c" d="M30 30q-16-6-18 6 10-2 18-6M30 30q16-6 18 6-10-2-18-6"/>' +
      '<path class="g-willow-d" d="M14 36q-2 14 2 24M20 34q-2 16 0 28M40 34q2 16 0 28M46 36q2 14-2 24"/>',

    /* 梅：会芳园赏梅、栊翠庵 */
    plum: '' +
      '<path class="g-trunk" d="M28 68V42l8-10M28 50l-10-8M36 42l10-6"/>' +
      '<g class="g-blossom"><circle cx="22" cy="26" r="3"/><circle cx="36" cy="22" r="3"/>' +
      '<circle cx="46" cy="30" r="2.6"/><circle cx="30" cy="36" r="2.6"/><circle cx="14" cy="34" r="2.4"/></g>',

    /* 杏：稻香村“杏花菜畦” */
    apricot: '' +
      '<path class="g-trunk" d="M30 68V36"/>' +
      '<circle class="g-canopy" cx="30" cy="26" r="16"/>' +
      '<circle class="g-canopy" cx="16" cy="32" r="10"/>' +
      '<circle class="g-canopy" cx="44" cy="32" r="10"/>' +
      '<g class="g-blossom"><circle cx="24" cy="20" r="2.2"/><circle cx="34" cy="26" r="2.2"/>' +
      '<circle cx="40" cy="18" r="2"/><circle cx="18" cy="28" r="2"/><circle cx="30" cy="34" r="2"/></g>',

    /* 藤萝：蘅芜苑“无花只草” */
    vine: '' +
      '<path class="g-trellis" d="M12 46h36M16 46V20M44 46V20M16 20h28"/>' +
      '<path class="g-vine-s" d="M18 22q4 8 8 2t8 4 8-2 6 4M18 30q5 7 11 1t10 5 7-3"/>' +
      '<path class="g-leaf" d="M26 36q-4 6 0 10 5-3 0-10M38 34q4 6 0 10-5-3 0-10"/>',

    /* 芭蕉：怡红院 */
    /* 荷：藕香榭水面 */
    lotus: '' +
      '<ellipse class="g-pad" cx="20" cy="52" rx="14" ry="7"/>' +
      '<ellipse class="g-pad" cx="42" cy="56" rx="11" ry="6"/>' +
      '<path class="g-pad-line" d="M20 45v14M42 50v12"/>',

    banana: '' +
      '<path class="g-trunk" d="M30 68V34"/>' +
      '<path class="g-canopy" d="M30 34q-18-4-20-20 14 4 20 20M30 34q18-4 20-20-14 4-20 20"/>' +
      '<path class="g-canopy" d="M30 30q-6-18 0-28 6 10 0 28"/>'
  };

  var PLANT_WH = { lotus: [26, 22], bamboo: [44, 52], pine: [42, 50], willow: [44, 50], plum: [40, 44],
    apricot: [44, 46], vine: [40, 42], banana: [40, 44] };

  /* ------------------------------------------------------------ 场景数据 */

  /* 大观园水系：自东北沁芳闸入园，经沁芳桥、稻香村，从西南出园（第16、17、40回） */
  var YUAN_WATER = [
    'M604 96 C588 130 566 150 548 172 C528 196 512 226 508 258',
    'M508 258 C504 300 502 330 500 360 C498 392 500 420 498 452',
    'M498 452 C494 484 480 508 458 526 C440 540 424 556 414 570'
  ];
  var YUAN_POOL = { cx: 520, cy: 168, rx: 52, ry: 21 };

  /* 草木：种类与位置都取自文本 */
  var TREES = [
    { s: 'bamboo', x: 426, y: 470, k: 1 },     // 潇湘馆后：竹（第17、26回）
    { s: 'banana', x: 604, y: 468, k: 1 },     // 怡红院：芭蕉（第17、25回）
    { s: 'apricot', x: 508, y: 396, k: .9 },   // 稻香村：杏花（第17回）
    { s: 'pine', x: 592, y: 356, k: .95 },     // 栊翠庵：松（第41、50回）
    { s: 'plum', x: 468, y: 346, k: .85 },     // 栊翠庵：梅
    { s: 'willow', x: 468, y: 292, k: .9 },    // 紫菱洲：临水多柳（第79回）
    { s: 'vine', x: 612, y: 296, k: .85 },     // 蘅芜苑：藤萝（第17回）
    { s: 'apricot', x: 592, y: 232, k: .8 },   // 秋爽斋后
    { s: 'bamboo', x: 466, y: 232, k: .8 },    // 蓼风轩一带
    { s: 'pine', x: 74, y: 156, k: .9 },       // 荣府西侧老树
    { s: 'apricot', x: 300, y: 202, k: .85 },  // 梨香院：梨花（第4回）
    { s: 'willow', x: 74, y: 496, k: .8 },     // 荣府后院
    { s: 'plum', x: 676, y: 140, k: 1 },       // 会芳园：梅（第5、11回）
    { s: 'plum', x: 800, y: 132, k: .9 },
    { s: 'pine', x: 676, y: 246, k: .85 },
    { s: 'bamboo', x: 812, y: 252, k: .8 },
    { s: 'willow', x: 664, y: 536, k: .8 },
    /* 以下只作空地补景，不指认具体故事 */
    { s: 'apricot', x: 116, y: 250, k: .85 },
    { s: 'pine', x: 344, y: 250, k: .8 },
    { s: 'plum', x: 106, y: 330, k: .8 },
    { s: 'bamboo', x: 250, y: 150, k: .8 },
    { s: 'apricot', x: 690, y: 330, k: .8 },
    { s: 'pine', x: 900, y: 250, k: .8 },
    { s: 'willow', x: 700, y: 500, k: .8 }
  ];

  /* 山石：曲径通幽的假山（第17回） */
  var ROCKS = [{ x: 470, y: 470, w: 104, h: 34 }];

  /* 甬道：街门直入正堂的石板路（第3回黛玉进府路线） */
  var PATHS = [
    { x: 238, y: 520, d: 'M238 548V486', w: 9 },
    { x: 238, y: 466, d: 'M238 474V460', w: 9 },
    { x: 796, y: 545, d: 'M796 548V542', w: 9 },
    { x: 500, y: 520, d: 'M500 548V490', w: 8 },
    { x: 500, y: 447, d: 'M500 452V442', w: 8 },
    { x: 300, y: 424, d: 'M302 424h-14', w: 7 },
    { x: 862, y: 424, d: 'M860 424h14', w: 7 }
  ];

  /* 石狮：第3回“宁荣二府大门前各有石狮” */
  var LIONS = [{ x: 158, y: 590 }, { x: 318, y: 590 }, { x: 716, y: 590 }, { x: 876, y: 590 }];

  /* 荷叶：藕香榭水面 */
  var LOTS = [{ x: 468, y: 158 }, { x: 552, y: 172 }];

  /* 无名附屋与游径只补空间肌理，不对应原文可定位的单体建筑。 */
  var FABRIC = [
    [76, 92, 54, 28], [142, 92, 42, 26], [208, 98, 44, 25], [270, 184, 26, 38],
    [82, 474, 50, 28], [146, 484, 34, 24], [326, 210, 42, 26], [326, 244, 42, 24],
    [670, 276, 44, 26], [676, 318, 36, 24], [884, 104, 42, 28], [884, 154, 42, 30],
    [882, 214, 44, 26], [660, 506, 42, 26], [876, 494, 46, 26], [666, 548, 34, 22]
  ];
  var GARDEN_PATHS = [
    [[500, 540], [476, 516], [448, 500], [438, 472], [454, 444], [488, 430], [522, 414], [548, 390]],
    [[488, 430], [470, 408], [452, 382], [458, 352], [482, 330], [506, 316]],
    [[522, 414], [546, 388], [554, 358], [540, 332], [516, 312], [506, 282]],
    [[482, 330], [462, 300], [462, 270], [480, 244], [506, 232]],
    [[540, 332], [566, 302], [566, 270], [550, 244], [530, 226]],
    [[506, 232], [490, 210], [486, 190], [500, 174]],
    [[550, 244], [578, 218], [578, 190], [560, 170]],
    [[438, 472], [426, 446], [424, 426]], [[554, 358], [584, 344], [594, 326]]
  ];

  /* ------------------------------------------------------------ 渲染 */

  function inBox(panel, x, y) {
    return x >= panel.x - 6 && x <= panel.x + panel.w + 6 && y >= panel.y - 6 && y <= panel.y + panel.h + 6;
  }

  function shape(name, x, y, w, h, cls) {
    var ratio = RATIO[name] || 2.4;
    if (h > w / ratio) h = w / ratio; else w = h * ratio;
    var s = w / (name === 'garden' ? 120 : 120);
    return '<g class="m-art ' + (cls || '') + '" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) +
      ') scale(' + s.toFixed(3) + ')">' + SHAPES[name] + '</g>';
  }

  function plant(species, x, y, k) {
    var wh = PLANT_WH[species] || [32, 36];
    var w = wh[0] * (k || 1), h = wh[1] * (k || 1);
    var s = w / 60;
    return '<g class="m-plant-group">' +
      '<ellipse class="m-plant-sh" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' +
      (w * 0.34).toFixed(1) + '" ry="' + (h * 0.07).toFixed(1) + '"/>' +
      '<g class="m-art m-plant" transform="translate(' + (x - w / 2).toFixed(1) + ',' + (y - h).toFixed(1) +
      ') scale(' + s.toFixed(3) + ')">' + PLANTS[species] + '</g></g>';
  }

  /* 纹理：地面点状噪点 + 全图纸纹（feTurbulence 静态渲染，不耗动画帧） */
  var TEXTURE_DEFS = '<defs>' +
    '<pattern id="mDots" width="13" height="13" patternUnits="userSpaceOnUse">' +
    '<circle cx="2.2" cy="2.2" r="0.75" fill="#8a8468" opacity="0.16"/>' +
    '<circle cx="8.5" cy="9.5" r="0.6" fill="#8a8468" opacity="0.12"/></pattern>' +
    '<pattern id="mPaving" width="22" height="9" patternUnits="userSpaceOnUse">' +
    '<path d="M0 8.5h12M14 8.5h8" stroke="#bcab8b" stroke-width="0.8" opacity="0.55"/></pattern>' +
    '<filter id="mGrain" x="0" y="0" width="100%" height="100%">' +
    '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/>' +
    '<feColorMatrix type="saturate" values="0"/>' +
    '<feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer></filter>' +
    '</defs>';

  window.MAP_ART = {
    defs: TEXTURE_DEFS,
    /** 场景数据原样暴露给 js/map-3d.js：3D 沙盘与平面图共用同一份水系、草木、山石 */
    data: { water: YUAN_WATER, pool: YUAN_POOL, trees: TREES, rocks: ROCKS, lotus: LOTS,
      fabric: FABRIC, gardenPaths: GARDEN_PATHS },
    /** 建筑：按 kind 选图形，塞进给定方框（保持比例，水平居中、顶端留白） */
    glyph: function (kind, box, variant) {
      var name = kind === '正堂' || kind === '厅' ? 'hall'
        : kind === '正房' ? 'house'
        : kind === '楼' ? 'tower'
        : kind === '门' ? 'gate'
        : kind === '亭' ? 'pavilion'
        : kind === '榭' ? 'xie'
        : kind === '桥' ? 'bridge'
        : kind === '庵' ? 'abbey'
        : kind === '景' ? 'rock'
        : kind === '园林' ? 'garden'
        : 'court';
      if (kind === '园林') {
        /* 会芳园：第11回在此赏梅、登仙阁；第16回建园时“借着东府里花园起”。
           画一池、一山、几株梅，比一整块山更像园子。 */
        var bx = box.x, by = box.y, bw = box.w, bh = box.h;
        return '<g class="m-art m-compound">' +
          '<ellipse class="m-water-pool" cx="' + (bx + bw * 0.34) + '" cy="' + (by + bh * 0.42) +
          '" rx="' + (bw * 0.2) + '" ry="' + (bh * 0.11) + '"/>' +
          '<path class="m-ripple" d="M' + (bx + bw * 0.26) + ' ' + (by + bh * 0.42) + 'q4-3 8 0t8 0"/>' +
          shape('rock', bx + bw * 0.54, by + bh * 0.3, bw * 0.42, bh * 0.22, 'is-bg') +
          plant('plum', bx + bw * 0.22, by + bh * 0.72, 1) +
          plant('plum', bx + bw * 0.44, by + bh * 0.8, .9) +
          plant('pine', bx + bw * 0.72, by + bh * 0.74, .95) +
          plant('bamboo', bx + bw * 0.86, by + bh * 0.58, .8) +
          '</g>';
      }
      var ratio = RATIO[name];
      var wash = variant === 'is-wash';
      var w = box.w - (wash ? 12 : 8);
      var h = w / ratio;
      if (h > box.h) { h = box.h; w = h * ratio; }
      var x = box.x + (box.w - w) / 2;
      var y = box.y + box.h - h - (wash ? 2 : 0);
      if (!wash) y = box.y + 2;
      var main = (kind === '正堂' || kind === '正房' || kind === '楼') ? 'is-main' : '';
      if (name === 'garden') wash = true;
      return '<g class="m-art ' + main + (wash ? ' is-wash' : '') + '" transform="translate(' + x.toFixed(1) + ',' +
        y.toFixed(1) + ') scale(' + (w / 120).toFixed(3) + ')">' + SHAPES[name] + '</g>';
    },

    /** 院墙：府墙是实墙加瓦垄，园墙是虚线的园墙（两者本来不同） */
    wall: function (panel, dashed) {
      var x = panel.x, y = panel.y, w = panel.w, h = panel.h;
      if (dashed) {
        return '<rect class="m-garden-wall" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
          '" rx="6"/>';
      }
      var out = '<rect class="m-wall-band" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="5"/>';
      out += '<rect class="m-wall-in" x="' + (x + 5) + '" y="' + (y + 5) + '" width="' + (w - 10) +
        '" height="' + (h - 10) + '" rx="3"/>';
      var ticks = '';
      for (var i = x + 16; i < x + w - 12; i += 18) {
        ticks += 'M' + i + ' ' + y + 'v5M' + i + ' ' + (y + h) + 'v-5';
      }
      for (var j = y + 16; j < y + h - 12; j += 18) {
        ticks += 'M' + x + ' ' + j + 'h5M' + (x + w) + ' ' + j + 'h-5';
      }
      return out + '<path class="m-wall-tile" d="' + ticks + '"/>';
    },

    /** 地面、水系、甬道、草木、山石、石狮：全部画在房间之下 */
    scenery: function (panel) {
      var out = '';
      if (panel.id === 'yuan') {
        out += '<ellipse class="m-water-pool" cx="' + YUAN_POOL.cx + '" cy="' + YUAN_POOL.cy +
          '" rx="' + YUAN_POOL.rx + '" ry="' + YUAN_POOL.ry + '"/>';
        YUAN_WATER.forEach(function (d) {
          out += '<path class="m-water-edge" d="' + d + '"/><path class="m-water" d="' + d + '"/>';
        });
        /* 水纹：几道短弧，别让溪流看起来像一根色带 */
        [[500, 240], [502, 300], [500, 360], [496, 420], [470, 500], [440, 540]].forEach(function (w, i) {
          out += '<path class="m-ripple" d="M' + (w[0] - 7) + ' ' + w[1] + 'q3.5-3 7 0t7 0"/>';
        });
        [[496, 160], [520, 176], [544, 164]].forEach(function (w) {
          out += '<path class="m-ripple" d="M' + (w[0] - 6) + ' ' + w[1] + 'q3-2.6 6 0t6 0"/>';
        });
        LOTS.forEach(function (l) { out += plant('lotus', l.x, l.y, .9); });
      }
      PATHS.forEach(function (p) {
        if (!inBox(panel, p.x, p.y)) return;
        out += '<path class="m-path" d="' + p.d + '" style="stroke-width:' + p.w + '"/>';
      });
      if (panel.id === 'yuan') GARDEN_PATHS.forEach(function (points) {
        out += '<path class="m-garden-walk-edge" d="' + points.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('') + '"/>';
        out += '<path class="m-garden-walk" d="' + points.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ' ' + p[1]; }).join('') + '"/>';
      });
      FABRIC.forEach(function (b) {
        if (!inBox(panel, b[0] + b[2] / 2, b[1] + b[3] / 2)) return;
        out += '<rect class="m-fabric-base" x="' + b[0] + '" y="' + b[1] + '" width="' + b[2] + '" height="' + b[3] + '" rx="2"/>' +
          '<path class="m-fabric-roof" d="M' + (b[0] - 2) + ' ' + (b[1] + 9) + 'l' + (b[2] / 2) + ' -8 ' + (b[2] / 2 + 4) + ' 8v3h-' + (b[2] + 4) + 'z"/>';
      });
      TREES.forEach(function (t) {
        if (inBox(panel, t.x, t.y)) out += plant(t.s, t.x, t.y, t.k);
      });
      ROCKS.forEach(function (r) {
        if (inBox(panel, r.x, r.y)) out += shape('rock', r.x, r.y, r.w, r.h, 'is-bg');
      });
      return out;
    },

    /** 府门前的石狮（第3回：“宁荣二府大门前各有石狮”） */
    lions: function () {
      return LIONS.map(function (l) {
        return '<g class="m-art m-lion" transform="translate(' + (l.x - 11) + ',' + (l.y - 20) + ') scale(0.62)">' +
          '<path class="g-base" d="M2 34h30v4H2z"/>' +
          '<path class="g-lion-b" d="M8 34V20c0-6 4-9 8-9h4c5 0 8 4 8 9v14z"/>' +
          '<circle class="g-lion-h" cx="18" cy="9" r="6"/>' +
          '<path class="g-lion-e" d="M12 6q2-4 6-4M24 6q-2-4-6-4"/>' +
          '<path class="g-lion-f" d="M16 34V24m4 10V24M14 27h8"/></g>';
      }).join('');
    },

    /** 图题、印章、比例说明：画在街下方的留白带里，避免压住面板标题 */
    cartouche: function () {
      return '<g class="m-cartouche">' +
        '<path class="m-cart-rule" d="M56 672h888"/>' +
        '<text class="m-cart-t" x="56" y="692">宁荣二府大观园图</text>' +
        '<text class="m-cart-s" x="212" y="691">方位依第 3、16、17、40 回推定 · 工笔示意，非实测比例</text>' +
        '<g class="m-seal" transform="translate(908 664)">' +
        '<rect width="30" height="30" rx="3"/>' +
        '<text x="15" y="22" text-anchor="middle">红</text></g>' +
        '</g>';
    },

    /** 街面铺装：几条横向石板缝，别让街看起来是一块纯色 */
    street: function () {
      var out = '<rect class="m-street" x="52" y="616" width="892" height="36" rx="4"/>';
      out += '<rect class="m-street-pave" x="56" y="619" width="884" height="30" rx="3"/>';
      out += '<text class="m-street-t" x="500" y="639" text-anchor="middle">宁 荣 街</text>';
      return out;
    }
  };
})();
