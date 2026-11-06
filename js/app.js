/* 红楼梦图谱 — 前端（零依赖） */
(function () {
  'use strict';

  var D = null, byId = {}, famById = {}, state = {
    view: 'lineage', geo: 'rong', gfilter: 'all', family: 'all', role: 'all',
    q: '', selected: null, list: [], lgZoom: 1, lgZoomManual: false, showEvents: false
  };
  var G = { W: 1500, H: 980, pad: 50 };
  var gState = { nodes: [], edges: [], nodeMap: {}, pos: {}, laid: false, zoom: 1, tx: 0, ty: 0,
    hover: null, sel: null, edgeSel: null, edgeHover: null };
  var CAT = { people: '人物', event: '事件', fate: '判词', poetry: '诗词', place: '地点', chapter: '回目' };
  var KIN = ['父子', '父女', '母子', '母女', '兄弟', '兄妹', '姐妹', '姐弟', '祖孙', '外祖母', '曾祖母',
    '姑祖母', '夫妻', '妾室', '嫡母', '养父女', '堂兄弟', '堂姐妹', '姑嫂', '姨甥', '叔侄', '姑侄', '舅甥', '继母女', '翁媳', '岳婿', '族亲', '未婚夫妻'];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function refHTML(r) {
    if (r && typeof r === 'object') {
      if (!r.url) return esc(r.label || '');
      return '<a href="' + esc(r.url) + '" target="_blank" rel="noopener noreferrer">' +
        esc(r.label || r.url) + '</a>';
    }
    return esc(r);
  }

  function catName(c) { return CAT[c] || c; }

  // 每个人关联的事件（出场 / 涉及）
  var EVENT_MAP = {};
  function buildEventMap() {
    EVENT_MAP = {};
    D.relations.forEach(function (r) {
      if (r.label !== '出场' && r.label !== '涉及') return;
      var ev = byId[r.a], pe = byId[r.b];
      if (!ev || !pe || ev.cat !== 'event' || pe.cat !== 'people') return;
      (EVENT_MAP[pe.id] = EVENT_MAP[pe.id] || []).push({ ev: ev, kind: r.label });
    });
  }
  function eventCount(pid) { return (EVENT_MAP[pid] || []).length; }

  // 每人对应的判词（谶语）：fate —对应→ people
  var FATE_MAP = {}, FATED = {};
  function buildFateMap() {
    FATE_MAP = {}; FATED = {};
    var cnt = {};
    D.relations.forEach(function (r) {
      if (r.label !== '对应') return;
      var f = byId[r.a], p = byId[r.b];
      if (!f || !p || f.cat !== 'fate' || p.cat !== 'people') return;
      cnt[f.id] = (cnt[f.id] || 0) + 1;
    });
    D.relations.forEach(function (r) {
      if (r.label !== '对应') return;
      var f = byId[r.a], p = byId[r.b];
      if (!f || !p || f.cat !== 'fate' || p.cat !== 'people') return;
      if (cnt[f.id] > 3) return; // 总览类判词（如「金陵十二钗」）不在个人页展开
      (FATE_MAP[p.id] = FATE_MAP[p.id] || []).push(f);
      FATED[p.id] = 1;
    });
  }

  // 两人共同出场/涉及的事件
  function sharedEvents(a, b) {
    var mb = {};
    (EVENT_MAP[b] || []).forEach(function (x) { mb[x.ev.id] = x.kind; });
    var out = [];
    (EVENT_MAP[a] || []).forEach(function (x) {
      if (mb[x.ev.id]) out.push({ ev: x.ev, ka: x.kind, kb: mb[x.ev.id] });
    });
    out.sort(function (x, y) { return (x.ev.seq || 0) - (y.ev.seq || 0); });
    return out;
  }
  function itemsOf(cat) { return D.items.filter(function (i) { return i.cat === cat; }); }

  /* ---------------- 路由 ---------------- */
  function route() {
    var h = (location.hash || '#lineage').replace(/^#/, '');
    var parts = h.split('/');
    var v = parts[0] || 'lineage';
    if (v === 'item' && parts[1]) { openItem(decodeURIComponent(parts[1])); return; }
    if ($('#view-' + v)) state.view = v;
    $$('.view').forEach(function (el) { el.classList.toggle('active', el.id === 'view-' + state.view); });
    $$('[data-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === state.view); });
    $('#mainnav').classList.remove('open');
    if (state.view !== 'graph' && isGraphFs()) setGraphFs(false);
    window.scrollTo({ top: 0 });
    if (v === 'lineage') renderLineage(parts[1]);
    if (v === 'graph') renderGraph();
    if (v === 'people') renderPeople();
    if (v === 'events') renderEvents();
    if (v === 'fate') renderFate();
    if (v === 'poetry') renderPoetry();
    if (v === 'places') renderPlaces();
    if (v === 'chapters') renderChapters();
    if (v === 'data') renderData();
  }

  /* ---------------- 谱系图 ---------------- */
  function renderLineage(fam) {
    if (fam) state.geo = fam;
    var fams = D.families.filter(function (f) {
      return D.genealogy.some(function (g) { return g.family === f.id; });
    });
    $('#lineageTabs').innerHTML = fams.map(function (f) {
      return '<button class="chip ' + (state.geo === f.id ? 'on' : '') + '" data-fam="' + f.id + '">' +
        '<i class="dot" style="display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:6px;background:' +
        f.color + '"></i>' + esc(f.name) + '</button>';
    }).join('');
    $$('#lineageTabs .chip').forEach(function (b) {
      b.addEventListener('click', function () { location.hash = '#lineage/' + b.getAttribute('data-fam'); });
    });

    var g = D.genealogy.filter(function (x) { return x.family === state.geo; });
    var set = {}, rowIds = {};
    g.forEach(function (x) { set[x.id] = x; rowIds[x.id] = 1; });

    var NW = 128, NH = 50, SP = 46, ROW = 118, L = 64, T = 62, GAP = 20;
    var SW = NW - 8;
    var children = {};
    g.forEach(function (x) {
      if (x.parent && set[x.parent]) (children[x.parent] = children[x.parent] || []).push(x.id);
    });
    // 同辈按长幼排序（ord 小的在左），没有 ord 的按原顺序排在后面
    Object.keys(children).forEach(function (k) {
      children[k].sort(function (a, b) {
        return (set[a].ord || 0) - (set[b].ord || 0);
      });
    });
    var roots = g.filter(function (x) { return !x.parent || !set[x.parent]; }).map(function (x) { return x.id; });

    // 按像素游标排布：只有真的带配偶的节点才多占一个配偶位，
    // 不再给每个人预留固定槽位，兄弟姊妹之间就不会空出大片
    function ownW(x) {
      return NW + (attachedSpouse(x) ? SP + SW : 0);
    }
    var cursor = L, pos = {};
    function walk(id) {
      var kids = children[id] || [];
      var self = set[id];
      if (!kids.length) {
        var left = cursor;
        cursor += ownW(self) + GAP;
        pos[id] = left + ownW(self) / 2;
        return pos[id];
      }
      var blockLeft = cursor;
      var xs = kids.map(walk);
      var c = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      // 父节点自身也占横向空间（尤其带配偶时），否则会和同辈兄弟姊妹的方框压在一起
      c = Math.max(c, blockLeft + ownW(self) / 2);
      pos[id] = c;
      cursor = Math.max(cursor, c + ownW(self) / 2 + GAP);
      return c;
    }
    roots.forEach(walk);

    var maxGen = Math.max.apply(null, g.map(function (x) { return x.gen; }));
    var W = Math.max(cursor + 40, 360);
    var H = T + maxGen * ROW + 30;
    var svg = $('#lgSvg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('height', 'auto');
    // 默认按容器宽度自适应（整棵树一屏看完）；用户手动缩放后不再自动改
    if (!state.lgZoomManual) {
      var fitBox = $('#lgScroll');
      var fitW = fitBox ? fitBox.clientWidth : 0;
      if (fitW && W > fitW) state.lgZoom = Math.max(0.45, Math.min(1, fitW / W));
      else state.lgZoom = 1;
    }
    syncLgZoom();

    function rowLeft(id) { return pos[id] - ownW(set[id]) / 2; }
    function rowTop(gen) { return T + (gen - 1) * ROW; }
    function attachedSpouse(x) {
      return x.spouse && byId[x.spouse] && !rowIds[x.spouse];
    }
    // 有配偶时，子代连线从“夫妻中点”出发；否则从本人中心出发
    function parentAnchor(x) {
      var base = rowLeft(x.id) + NW / 2;
      if (attachedSpouse(x)) {
        var spCenter = rowLeft(x.id) + NW + SP + (NW - 6) / 2;
        return (base + spCenter) / 2;
      }
      if (x.spouse && rowIds[x.spouse]) {
        return (base + rowLeft(x.spouse) + NW / 2) / 2;
      }
      return base;
    }

    var parts = [];
    // 世代底纹与标签
    for (var gi = 1; gi <= maxGen; gi++) {
      var y = T + (gi - 1) * ROW - NH / 2 - 10;
      parts.push('<rect class="lg-band" x="0" y="' + y + '" width="' + W + '" height="' + ROW + '"/>');
      parts.push('<text class="lg-gen-label" x="18" y="' + (y + ROW / 2 + 4) + '">' +
        (['一', '二', '三', '四', '五', '六', '七'][gi - 1] || gi) + '代</text>');
    }

    // 亲子连接线
    g.forEach(function (x) {
      if (!x.parent || !set[x.parent]) return;
      var p = set[x.parent], px = parentAnchor(p);
      var cx = rowLeft(x.id) + NW / 2;
      var py = rowTop(p.gen) + NH / 2 + 6;
      var cy = rowTop(x.gen) - NH / 2 - 6;
      var midY = (py + cy) / 2;
      var skip = x.gen - p.gen > 1;
      parts.push('<path class="lg-link' + (skip ? ' skip' : '') + '" d="M' + px + ',' + py +
        ' L' + px + ',' + midY + ' L' + cx + ',' + midY + ' L' + cx + ',' + cy + '"/>');
      if (skip) {
        parts.push('<text class="lg-link-label" x="' + ((px + cx) / 2) + '" y="' + (midY - 4) + '">隔代</text>');
      }
    });

    // 节点 + 外挂配偶
    g.forEach(function (x) {
      var bx = rowLeft(x.id), by = rowTop(x.gen);
      var isVirtual = x.id.indexOf('vg-') === 0;
      if (!isVirtual && byId[x.id]) {
        parts.push(nodeSVG(byId[x.id], bx, by, NW, NH, false, x));
      } else {
        parts.push(virtualSVG(x, bx, by, NW, NH));
      }
      if (attachedSpouse(x)) {
        var sp = byId[x.spouse];
        parts.push('<path class="lg-marriage" d="M' + (bx + NW) + ',' + (by + NH / 2) +
          ' L' + (bx + NW + SP) + ',' + (by + NH / 2) + '"/>');
        if (sp) parts.push(nodeSVG(sp, bx + NW + SP, by, NW - 6, NH, true, null));
      }
    });

    // 若夫妻双方都在本图中，画一条横向婚线，避免重复节点
    var drawnMarriage = {};
    g.forEach(function (x) {
      if (!x.spouse || !rowIds[x.spouse] || x.spouse === x.id) return;
      var key = x.id < x.spouse ? x.id + '|' + x.spouse : x.spouse + '|' + x.id;
      if (drawnMarriage[key]) return;
      drawnMarriage[key] = 1;
      var a = set[x.id], b = set[x.spouse];
      if (!a || !b || a.gen !== b.gen) return;
      var left = rowLeft(a.id) < rowLeft(b.id) ? a : b;
      var right = left === a ? b : a;
      var yy = rowTop(left.gen) + NH / 2;
      parts.push('<path class="lg-marriage" d="M' + (rowLeft(left.id) + NW) + ',' + yy +
        ' L' + rowLeft(right.id) + ',' + yy + '"/>');
    });

    svg.innerHTML = parts.join('');
    $$('.lg-node[data-id]', svg).forEach(function (el) {
      var id = el.getAttribute('data-id');
      el.addEventListener('click', function () { openItem(id); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openItem(id); }
      });
    });
    $('#lgNote').textContent = (D.genealogyNotes || {})[state.geo] || '';
    // 小屏时谱系宽度大于容器，首次渲染把根节点滚到视野中间
    var sc0 = $('#lgScroll');
    var centerRoot = function () {
      if (!sc0 || !roots.length) return;
      var realW = svg.getBoundingClientRect().width || W;
      sc0.scrollLeft = (pos[roots[0]] || 0) * (realW / W) - sc0.clientWidth / 2;
    };
    requestAnimationFrame(centerRoot);
    setTimeout(centerRoot, 120);

    // 横向可拖动
    var sc = $('#lgScroll');
    if (!sc.dataset.drag) {
      sc.dataset.drag = '1';
      var dg = null;
      sc.addEventListener('mousedown', function (e) {
        if (e.target.closest('.lg-node')) return;
        dg = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop };
      });
      window.addEventListener('mousemove', function (e) {
        if (!dg) return;
        sc.scrollLeft = dg.l - (e.clientX - dg.x);
        sc.scrollTop = dg.t - (e.clientY - dg.y);
        sc.classList.add('dragging');
      });
      window.addEventListener('mouseup', function () { dg = null; sc.classList.remove('dragging'); });
    }
  }

  // 谱系里的「名佚」节点：没有词条，用 genealogy.label 拼一个只读节点
  function virtualItem(g) {
    if (!g || !g.id) return null;
    var label = (g.label || g.id).replace(/\n/g, ' ').trim();
    var name = label.split(' ')[0];
    var rest = label.slice(name.length).replace(/[（）()]/g, '').trim();
    return { id: g.id, name: name, alias: rest || '名佚', family: g.family, virtual: true };
  }

  function clip(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
  }

  function nodeSVG(it, x, y, w, h, isSpouse, g) {
    var color = famById[it.family] ? famById[it.family].color : '#8a8073';
    var name = it.name.length > 6 ? it.name.slice(0, 6) : it.name;
    // 谱系附注：排行（嫡长子 / 庶次女）+ 爵位官职
    var rk = g && g.rk ? g.rk : '';
    var title = g && g.title ? g.title : '';
    var meta = rk || title ? [rk, title].filter(Boolean).join(' · ')
      : (it.alias ? String(it.alias).split('、')[0] : (it.role || ''));
    var born = /庶/.test(rk) ? ' shu' : (/嫡/.test(rk) ? ' di' : '');
    var cls = 'lg-node' + (isSpouse ? ' spouse' : '') + born + (g && g.inher ? ' inher' : '');
    var aria = [it.name, rk, title, g && g.inher ? '承袭爵位' : '', g && g.house ? g.house : '']
      .filter(Boolean).join(' · ');
    var parts = ['<g class="' + cls + '" data-id="' + esc(it.id) +
      '" tabindex="0" role="button" aria-label="' + esc(aria) + '">',
      '<title>' + esc(aria) + '</title>',
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" stroke="' + color + '"/>'];
    // 左色条：嫡（朱）/ 庶（青灰）
    if (born) {
      parts.push('<rect class="lg-born' + born + '" x="' + (x + 1) + '" y="' + (y + 1) +
        '" width="3" height="' + (h - 2) + '" rx="1.5"/>');
    }
    parts.push('<text class="lg-name" x="' + (x + w / 2) + '" y="' + (y + 20) + '">' + esc(name) + '</text>');
    if (meta) {
      parts.push('<text class="lg-sub" x="' + (x + w / 2) + '" y="' + (y + h - 11) + '">' +
        esc(clip(meta, Math.max(6, Math.floor((w - 14) / 9.2)))) + '</text>');
    }
    // 袭爵角标 / 房分
    if (g && g.inher) {
      parts.push('<rect class="lg-inher-badge" x="' + (x + w - 19) + '" y="' + (y + 4) +
        '" width="15" height="15" rx="2"/>' +
        '<text class="lg-inher-t" x="' + (x + w - 11.5) + '" y="' + (y + 15) + '">爵</text>');
    }
    if (g && g.house) {
      parts.push('<text class="lg-house" x="' + (x + 2) + '" y="' + (y - 4) + '">' + esc(g.house) + '</text>');
    }
    parts.push('</g>');
    return parts.join('');
  }

  function virtualSVG(x, x0, y0, w, h) {
    var lines = String(x.label || '名佚').split('\n');
    var name = lines[0] || '名佚';
    var sub = [x.rk, lines.slice(1).join(' ')].filter(Boolean).join(' · ');
    return '<g class="lg-node virtual" role="img" aria-label="' + esc([lines.join(' '), x.rk || ''].join(' ')) + '">' +
      '<rect x="' + x0 + '" y="' + y0 + '" width="' + w + '" height="' + h + '" rx="3"/>' +
      '<text class="lg-name" x="' + (x0 + w / 2) + '" y="' + (y0 + 20) + '">' + esc(name) + '</text>' +
      (sub ? '<text class="lg-sub" x="' + (x0 + w / 2) + '" y="' + (y0 + h - 11) + '">' + esc(clip(sub, Math.max(6, Math.floor((w - 14) / 9.2)))) + '</text>' : '') +
      '</g>';
  }

  function syncLgZoom() {
    var svg = $('#lgSvg');
    if (!svg) return;
    // 按 viewBox 原始像素铺开：100% 就是「1 个图单位 = 1px」，
    // 谱系较宽时在容器里横向滚动，而不是把整棵树压扁塞进一屏
    var vb = (svg.getAttribute('viewBox') || '0 0 1000 500').split(/\s+/);
    var vw = parseFloat(vb[2]) || 1000;
    var px = Math.max(320, Math.round(vw * state.lgZoom));
    svg.style.width = px + 'px';
    // 内容比容器窄时居中（margin auto），比容器宽时自动靠左并可横向滚动
    svg.style.margin = '0 auto';
    svg.style.minWidth = '0';
    var lbl = $('#lgZoomLabel');
    if (lbl) lbl.textContent = Math.round(state.lgZoom * 100) + '%';
  }

  /* ---------------- 关系图 ---------------- */
  function famColor(it) {
    var f = famById[it.family];
    return f ? f.color : '#6b6458';
  }

  // 关系权重：数值越大越"根本"。一对人有多重关系时，图上只画权重最高的一条，
  // 其余在关系卡里并列（血缘 > 婚姻 > 主仆 > 诗社等具体身份 > 泛泛同人 > 事件）
  var REL_W = {
    '父子': 100, '父女': 100, '母子': 100, '母女': 100,
    '同父同母兄妹': 99, '同父同母姐妹': 99, '同父同母兄弟': 99, '同父同母姐弟': 99,
    '同父异母兄妹': 97, '同父异母姐妹': 97, '同父异母兄弟': 97, '同父异母姐弟': 97,
    '嫡母': 96, '继母女': 92, '养父女': 92,
    '兄妹': 90, '姐妹': 90, '兄弟': 90, '姐弟': 90,
    '祖孙': 89, '外祖母': 89, '外祖父': 89, '曾祖母': 89, '姑祖母': 89, '外孙女': 87,
    '叔侄': 84, '姑侄': 84, '舅甥': 84, '婶侄': 84,
    '堂兄弟': 82, '堂姐妹': 82, '堂兄妹': 82,
    '族兄妹': 78, '族姐妹': 78, '族亲': 72, '宗族': 72, '族中长辈': 70, '远亲': 60,
    '夫妻': 86, '未婚夫妻': 85, '妾室': 78, '翁婿': 74, '岳婿': 74, '翁媳': 72, '姑嫂': 68,
    '主仆': 58, '陪房': 57, '老仆': 57, '大管家': 56, '乳母': 56, '小厮': 54,
    '奶兄': 46, '同房': 40,
    '恋人': 76, '情人': 74, '知己': 70, '相思': 60,
    '诗社发起': 50, '诗社社长': 48, '诗友': 44, '诗社同人': 30,
    '同窗': 36, '同班': 34, '世交': 38, '旧识': 32, '旧交': 32, '友人': 36,
    '清客': 28, '方外之交': 34, '镜像': 34, '私交': 30, '同僚': 30, '同侪': 30
  };

  function relWeight(label) {
    if (REL_W[label] != null) return REL_W[label];
    var c = relCat(label);
    return c === 'kin' ? 80 : c === 'love' ? 70 : c === 'servant' ? 55 :
      c === 'friend' ? 35 : c === 'event' ? 5 : 20;
  }

  function relCat(label) {
    if (/主仆|大管家|老仆|乳母|陪房|管家|心腹|小厮|奶兄/.test(label)) return 'servant';
    if (KIN.indexOf(label) >= 0 ||
        /父|母|兄|弟|姐|妹|祖|孙|叔|侄|姑|舅|姨|堂|族|嫡|养|继|婿|媳|嫂/.test(label)) return 'kin';
    if (/知己|夫妻|妾室|未婚|恋人|情人|通房|情/.test(label)) return 'love';
    if (/同人|同窗|同伴|友人|诗友|诗社|方外|旧交|旧识|世交|盟友/.test(label)) return 'friend';
    return 'other';
  }

  // 连线的视觉分类：亲缘 / 情缘 / 主仆 / 同人 / 事件 / 其他
  var EDGE_STYLE = {
    kin:     { color: '#b07a3a', label: '亲缘' },
    love:    { color: '#a83a41', label: '情缘' },
    servant: { color: '#7d8a93', label: '主仆' },
    friend:  { color: '#3f7d6b', label: '同人' },
    event:   { color: '#8a6a30', label: '事件' },
    other:   { color: '#b3a78d', label: '其他' }
  };
  var EDGE_ORDER = ['kin', 'love', 'servant', 'friend', 'event', 'other'];

  function buildGraphModel() {
    var people = itemsOf('people');
    var ids = {};
    people.forEach(function (p) { ids[p.id] = p; });

    // 同一对人可能有多重关系（兄妹 + 诗社发起 + 诗社同人），图上只画一根线，
    // 取权重最高的一条作主关系；其余留到关系卡里并列
    var seen = {}, edges = [], byPair = {};
    D.relations.forEach(function (r) {
      if (!ids[r.a] || !ids[r.b]) return;
      var pair = r.a < r.b ? r.a + '|' + r.b : r.b + '|' + r.a;
      if (state.gfilter !== 'all' && relCat(r.label) !== state.gfilter) return;
      var e = byPair[pair];
      if (!e) {
        e = { a: r.a, b: r.b, label: r.label, labels: [r.label] };
        byPair[pair] = e;
        edges.push(e);
      } else {
        e.labels.push(r.label);
        if (relWeight(r.label) > relWeight(e.label)) e.label = r.label;
      }
    });

    // 可选：把事件作为节点接进来
    if (state.showEvents) {
      itemsOf('event').forEach(function (ev) {
        var cast = D.relations.filter(function (r) {
          return r.a === ev.id && (r.label === '出场' || r.label === '涉及') && ids[r.b];
        });
        if (!cast.length) return;
        ids[ev.id] = ev;
        cast.forEach(function (r) {
          edges.push({ a: ev.id, b: r.b, label: r.label });
        });
      });
    }

    var deg = {};
    edges.forEach(function (e) { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; });
    var nodes = Object.keys(deg).map(function (id, i) {
      return { id: id, item: ids[id], deg: deg[id], i: i, x: 0, y: 0, vx: 0, vy: 0 };
    });
    return { nodes: nodes, edges: edges, edgesAll: edges.length,
      total: people.length, events: itemsOf('event').length };
  }

  /* 分簇布局：每个家族拆成「主仆两侧」两个岛，按人数定半径后货架式排布 */
  var ROLE_ORDER = ['主子', '妾室', '亲戚', '僧道', '外人', '清客', '仆役', '丫鬟', '小厮'];
  var INNER_ROLES = ['主子', '妾室', '亲戚', '僧道', '外人', '清客'];

  function layout(model) {
    var nodes = model.nodes;
    if (!nodes.length) return;

    // 归入岛：family + 主/仆；人数过少的家族并入「其他家族」，避免一堆碎岛
    var famCount = {};
    nodes.forEach(function (nd) { var f = nd.item.family || 'other'; famCount[f] = (famCount[f] || 0) + 1; });
    var clusters = [];
    var index = {};
    nodes.forEach(function (nd) {
      var raw = nd.item.cat === 'event' ? 'events' : (nd.item.family || 'other');
      // 主岛白名单；其余小家族（李、甄、尤、邢、史等）并入「其他家族」
      var f = (['rong', 'ning', 'xue', 'wang', 'lin', 'other', 'events'].indexOf(raw) >= 0) ? raw : 'minor';
      var inner = INNER_ROLES.indexOf(nd.item.role) >= 0;
      var key = f + (inner ? '#m' : '#s');
      if (!index[key]) {
        var fam = famById[f];
        index[key] = { key: key, family: f, inner: inner, nodes: [],
          title: f === 'events' ? '情节事件'
            : f === 'minor' ? ('其他家族' + (inner ? '' : ' · 仆从'))
            : ((fam ? fam.name : '其他') + (inner ? '' : ' · 仆从')),
          color: f === 'events' ? '#7a6a52' : (fam ? fam.color : '#8a8073') };
        clusters.push(index[key]);
      }
      index[key].nodes.push(nd);
    });

    // 只含两三个人的小岛统一并成「零散人物」，避免右侧堆一堆碎标签
    var tiny = clusters.filter(function (c) { return c.nodes.length <= 4 && c.family !== 'events' && !c.inner; });
    if (tiny.length > 1) {
      var merged = { key: 'tiny', family: 'minor', inner: false, nodes: [],
        title: '零散人物', color: '#8a8073' };
      tiny.forEach(function (c) { merged.nodes = merged.nodes.concat(c.nodes); });
      clusters = clusters.filter(function (c) { return tiny.indexOf(c) < 0; });
      clusters.push(merged);
    }

    clusters.forEach(function (c) {
      c.nodes.sort(function (a, b) {
        var ra = ROLE_ORDER.indexOf(a.item.role); ra = ra < 0 ? 99 : ra;
        var rb = ROLE_ORDER.indexOf(b.item.role); rb = rb < 0 ? 99 : rb;
        return ra - rb || a.item.name.localeCompare(b.item.name, 'zh-Hans-CN');
      });
      c.R = c.nodes.length <= 3 ? 46 : 26 + 22 * Math.sqrt(c.nodes.length);
    });
    var famTotal = {};
    clusters.forEach(function (c) { famTotal[c.family] = (famTotal[c.family] || 0) + c.nodes.length; });
    clusters.sort(function (a, b) {
      var fa = famTotal[a.family] || 0, fb = famTotal[b.family] || 0;
      if (fa !== fb) return fb - fa;                 // 家族总人数多的排前面
      if (a.family === b.family) return (a.inner ? 0 : 1) - (b.inner ? 0 : 1);  // 主子岛在前，仆从岛紧随
      return 0;
    });

    // ---- 岛与岛之间：货架式排布（大岛在前，每行居中），整体等比缩放到一屏 ----
    var TARGET_W = 1440, TARGET_H = 880, PAD = 44, GAP = 50;
    var availW = TARGET_W - PAD * 2, availH = TARGET_H - PAD * 2;

    clusters.sort(function (a, b) { return b.R - a.R; });
    var rows = [], row = { items: [], w: 0, h: 0 }, used = 0;
    clusters.forEach(function (c) {
      var d = c.R * 2;
      var add = (row.items.length ? GAP : 0) + d;
      if (used + add > availW && row.items.length) {
        rows.push(row);
        row = { items: [], w: 0, h: 0 };
        used = 0;
        add = d;
      }
      row.items.push(c);
      row.w += add;
      row.h = Math.max(row.h, d);
      used += add;
    });
    if (row.items.length) rows.push(row);

    var totalH = rows.reduce(function (acc, r) { return acc + r.h + GAP; }, -GAP);
    var k = Math.min(1.12, availH / Math.max(1, totalH));
    var y = PAD + (availH - totalH * k) / 2;
    rows.forEach(function (r) {
      var x = PAD + (availW - r.w * k) / 2;
      r.items.forEach(function (c) {
        c.R = c.R * k;
        c.cx = x + c.R;
        c.cy = y + (r.h * k) / 2;
        x += c.R * 2 + GAP * k;
      });
      y += (r.h + GAP) * k;
    });

    // ---- 岛内：向日葵式均匀铺点，比同心环更透气 ----
    clusters.forEach(function (c) {
      var n = c.nodes.length;
      var maxR = Math.max(26, c.R * 0.86);
      c.nodes.forEach(function (nd, i) {
        var rr = maxR * Math.sqrt((i + 0.5) / n);
        var ang = i * 2.399963229728653;
        nd.x = c.cx + Math.cos(ang) * rr;
        nd.y = c.cy + Math.sin(ang) * rr;
      });
    });

    G.W = TARGET_W;
    G.H = TARGET_H;
    model.clusters = clusters;
  }

  function renderGraph() {
    var model = buildGraphModel();
    var svg = $('#gSvg');

    $('#gLegend').innerHTML = D.families.map(function (f) {
      return '<span><i style="background:' + f.color + '"></i>' + esc(f.name) + '</span>';
    }).join('') + EDGE_ORDER.map(function (k) {
      return '<span class="el"><i style="border-color:' + EDGE_STYLE[k].color + '"></i>' + EDGE_STYLE[k].label + '</span>';
    }).join('') + '<span class="el ring"><i></i>有判词</span>';
    $('#gCount').textContent = model.nodes.length + ' 个节点 · ' + model.edges.length + ' 条关联' +
      (state.showEvents ? '（含 ' + itemsOf('event').length + ' 个事件）' : '（人物库 ' + model.total + '）');
    var hint = $('#graphHint');
    if (hint) hint.textContent = '悬停高亮邻域；点节点看简介、谶语、脂评与结局；点连线看两人关系与共同事件。';

    if (!model.nodes.length) {
      svg.innerHTML = '';
      syncZoom();
      return;
    }

    // 复用已有坐标，避免切换时塌缩
    var prev = gState.pos;
    var need = !gState.laid;
    model.nodes.forEach(function (nd) {
      var p = prev[nd.id];
      if (p) { nd.x = p[0]; nd.y = p[1]; } else { need = true; }
    });
    if (need) layout(model);
    gState.laid = true;
    gState.pos = {};
    model.nodes.forEach(function (nd) { gState.pos[nd.id] = [nd.x, nd.y]; });
    gState.nodeMap = {};
    model.nodes.forEach(function (nd) { gState.nodeMap[nd.id] = nd; });
    gState.edges = model.edges;
    gState.nodes = model.nodes;

    var parts = ['<g id="gViewport">'];
    // 每个岛的名称（与分簇布局一致）
    (model.clusters || []).forEach(function (c) {
      var top = Math.min.apply(null, c.nodes.map(function (nd) { return nd.y; }));
      parts.push('<text class="g-fam" x="' + c.cx.toFixed(1) + '" y="' + (top - 14).toFixed(1) +
        '" fill="' + c.color + '">' + esc(c.title) + '</text>');
    });
    model.edges.forEach(function (e) {
      var a = gState.nodeMap[e.a], b = gState.nodeMap[e.b];
      if (!a || !b) return;
      var cat = (a.item.cat === 'event' || b.item.cat === 'event') ? 'event' : relCat(e.label);
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      var cross = (a.item.family || 'other') !== (b.item.family || 'other');
      parts.push('<g class="g-edge-g ' + cat + (cross ? ' cross' : '') + '" data-a="' + e.a + '" data-b="' + e.b +
        '" data-cat="' + cat + '" data-label="' + esc(e.label) + '">' +
        '<line class="g-edge-hit" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
        '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>' +
        '<line class="g-edge" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
        '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>' +
        '<text class="g-edge-label" x="' + mx.toFixed(1) + '" y="' + (my - 3).toFixed(1) + '" text-anchor="middle">' +
        esc(e.label) + '</text></g>');
    });
    model.nodes.forEach(function (nd) {
      var r = Math.min(8.5, 3.0 + Math.sqrt(nd.deg) * (model.nodes.length > 100 ? 1.5 : 1.8));
      var isEv = nd.item.cat === 'event';
      var fated = !isEv && FATED[nd.id];
      parts.push('<g class="g-node' + (isEv ? ' ev' : '') + (fated ? ' fated' : '') +
        ((isEv || nd.deg < (model.nodes.length > 100 ? 5 : 3)) ? ' minor' : '') +
        '" data-id="' + nd.id + '" tabindex="0" role="button">' +
        (isEv
          ? '<rect class="dot" x="' + (nd.x - r).toFixed(1) + '" y="' + (nd.y - r).toFixed(1) +
            '" width="' + (r * 2).toFixed(1) + '" height="' + (r * 2).toFixed(1) + '" rx="2" fill="#7a6a52"/>'
          : '<circle class="hit" cx="' + nd.x.toFixed(1) + '" cy="' + nd.y.toFixed(1) +
            '" r="' + (r + 2.5).toFixed(1) + '"/>' +
            '<circle class="dot" cx="' + nd.x.toFixed(1) + '" cy="' + nd.y.toFixed(1) + '" r="' + r.toFixed(1) +
            '" fill="' + famColor(nd.item) + '"/>' +
            (fated ? '<circle class="ring" cx="' + nd.x.toFixed(1) + '" cy="' + nd.y.toFixed(1) +
              '" r="' + (r + 2.6).toFixed(1) + '"/>' : '')) +
        '<text class="g-label" x="' + (nd.x + r + 3).toFixed(1) + '" y="' + (nd.y + 3.2).toFixed(1) + '">' +
        esc(nd.item.name) + '</text></g>');
    });
    parts.push('</g>');
    svg.innerHTML = parts.join('');
    // 全屏下保留适配后的 viewBox，只重排节点，不恢复整图视野
    if (!(document.body.classList.contains('graph-fs') && FS_VIEWBOX)) {
      svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
    }
    applyTransform();
    bindGraph();
    syncZoom();
    var st = $('#gStage');
    var centerStage = function () {
      if (st && st.scrollWidth > st.clientWidth + 4) {
        st.scrollLeft = (st.scrollWidth - st.clientWidth) / 2;
        st.scrollTop = (st.scrollHeight - st.clientHeight) / 2;
      }
    };
    requestAnimationFrame(centerStage);
    setTimeout(centerStage, 120);
    highlight(gState.sel);
    // 全屏中切换筛选后，按新内容重新铺满
    if (document.body.classList.contains('graph-fs')) {
      fitSvgToStage(true);
      syncZoom();
    }
  }

  function applyTransform() {
    var vp = $('#gViewport');
    if (vp) vp.setAttribute('transform', 'translate(' + gState.tx + ',' + gState.ty + ') scale(' + gState.zoom + ')');
    if (document.body.classList.contains('graph-fs')) positionEdgePanel();
  }
  function syncZoom() {
    $('#gZoomLabel').textContent = Math.round(gState.zoom * 100) + '%';
    var f = $('#fsZoomLabel');
    if (f) f.textContent = Math.round(gState.zoom * 100) + '%';
  }
  /* ---------- 关系列表视图 ---------- */
  var GV_LABEL = { kin: '亲缘', servant: '主仆', love: '情缘', friend: '同人', event: '事件', other: '其他' };

  function gvRows() {
    var rows = [];
    D.relations.forEach(function (r) {
      var a = byId[r.a], b = byId[r.b];
      if (!a || !b) return;
      var isEdge = (a.cat === 'people' || a.cat === 'event') && (b.cat === 'people' || b.cat === 'event');
      if (!isEdge) return;
      if (!state.showEvents && (a.cat === 'event' || b.cat === 'event')) return;
      var cat = (a.cat === 'event' || b.cat === 'event') ? 'event' : relCat(r.label);
      if (state.gfilter !== 'all' && cat !== state.gfilter) return;
      rows.push({ a: a, b: b, label: r.label, cat: cat });
    });
    var q = (state.gq || '').trim().toLowerCase();
    if (q) {
      rows = rows.filter(function (x) {
        return (x.a.name + ' ' + x.b.name + ' ' + x.label + ' ' + GV_LABEL[x.cat]).toLowerCase().indexOf(q) >= 0;
      });
    }
    rows.sort(function (x, y) {
      if (x.cat !== y.cat) return Object.keys(GV_LABEL).indexOf(x.cat) - Object.keys(GV_LABEL).indexOf(y.cat);
      return x.a.name.localeCompare(y.a.name, 'zh-Hans-CN') || x.b.name.localeCompare(y.b.name, 'zh-Hans-CN');
    });
    return rows;
  }

  function renderGraphList() {
    var rows = gvRows();
    $('#gListCount').textContent = rows.length + ' 条关系';
    var body = $('#gListBody');
    if (!rows.length) {
      body.innerHTML = '<div class="glist-empty">没有符合条件的关系。</div>';
      return;
    }
    var html = '', lastCat = null;
    rows.forEach(function (r) {
      if (r.cat !== lastCat) {
        lastCat = r.cat;
        html += '<div class="glist-head">' + GV_LABEL[r.cat] + '</div>';
      }
      html += '<button class="glist-row" data-a="' + r.a.id + '" data-b="' + r.b.id +
        '" data-label="' + esc(r.label) + '">' +
        '<span class="gl-a">' + esc(r.a.name) + '</span>' +
        '<span class="gl-rel">' + esc(r.label) + '</span>' +
        '<span class="gl-b">' + esc(r.b.name) + '</span></button>';
    });
    body.innerHTML = html;
    $$('#gListBody .glist-row').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openEdgeModal(btn.getAttribute('data-a'), btn.getAttribute('data-b'), btn.getAttribute('data-label'));
      });
    });
  }

  /* 把某个人物/事件在图上定位出来：必要时恢复全量筛选，居中并放大 */
  function focusGraphNode(id) {
    if (!byId[id]) return false;
    if (!gState.nodeMap[id]) {
      if (byId[id].cat === 'event' && !state.showEvents) {
        state.showEvents = true;
        var t = $('#evToggle');
        if (t) { t.classList.add('on'); t.textContent = '隐藏事件节点'; }
      }
      state.gfilter = 'all';
      $$('.seg-btn[data-gfilter]').forEach(function (x) {
        x.classList.toggle('on', x.getAttribute('data-gfilter') === 'all');
      });
      gState.laid = false; gState.pos = {}; gState.sel = null;
      clearEdgeSel();
      renderGraph();
    }
    var nd = gState.nodeMap[id];
    if (!nd) return false;
    setGraphView('graph');
    gState.sel = id;
    clearEdgeSel();
    var z = Math.max(1.15, gState.zoom);
    gState.zoom = z;
    gState.tx = clampPan(G.W / 2 - nd.x * z);
    gState.ty = clampPan(G.H / 2 - nd.y * z);
    applyTransform();
    syncZoom();
    highlight(id);
    var g = document.querySelector('.g-node[data-id="' + id + '"]');
    if (g) {
      g.classList.remove('pulse');
      void g.getBoundingClientRect();
      g.classList.add('pulse');
      setTimeout(function () { g.classList.remove('pulse'); }, 2600);
    }
    return true;
  }

  function setGraphView(v) {
    state.gview = v;
    $$('#gViewSeg [data-gview]').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-gview') === v);
    });
    var isList = v === 'list';
    $('#gListWrap').hidden = !isList;
    $('#gStage').hidden = isList;
    var legend = $('#gLegend');
    if (legend) legend.hidden = isList;
    var tools = $('#stageTools');
    if (tools && !isList) tools.style.display = '';
    if (isList) setGraphFs(false);
    if (isList) renderGraphList();
  }

  function clampPan(v) { var lim = G.W * 0.5; return Math.max(-lim, Math.min(lim, v)); }

  /* 网页全屏：只用页面内覆盖层，不调用浏览器原生 Fullscreen（不抢占整个浏览器）。
     进入时把 viewBox 收到人物范围，让画布真正放大到铺满屏幕 */
  var FS_VIEWBOX = null, FS_TRANSFORM = null, FS_KEEP = false;

  function graphContentBBox() {
    var minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, n = 0;
    Object.keys(gState.nodeMap).forEach(function (id) {
      var nd = gState.nodeMap[id];
      if (!nd) return;
      minX = Math.min(minX, nd.x); maxX = Math.max(maxX, nd.x);
      minY = Math.min(minY, nd.y); maxY = Math.max(maxY, nd.y);
      n++;
    });
    return n ? { minX: minX, minY: minY, maxX: maxX, maxY: maxY } : null;
  }

  // 只按当前舞台尺寸重算 viewBox 与铺满样式，不改动已保存的“退出还原点”
  function applyFsViewBox() {
    var svg = $('#gSvg');
    if (!svg || !document.body.classList.contains('graph-fs')) return false;
    var bb = graphContentBBox();
    if (!bb) return false;
    var sr = $('#gStage').getBoundingClientRect();
    var aspect = Math.max(0.2, sr.width / Math.max(1, sr.height));
    // 内容范围 + 内边距；viewBox 宽高比对齐舞台，保证放大后铺满
    var padX = 60, padTop = 90, padBottom = 70;
    var cw = (bb.maxX - bb.minX) + padX * 2;
    var ch = (bb.maxY - bb.minY) + padTop + padBottom;
    var vw, vh;
    if (aspect < 0.95) {
      // 竖屏（手机）：塞下整张横铺的图谱会缩成中间一条细带，
      // 按高度铺满又会只剩两三个点；折中到约 60% 缩放，横向留出可拖动余量
      vw = Math.max(ch * aspect, sr.width / 0.62);
      vh = vw / aspect;
    } else if (cw / ch >= aspect) { vw = cw; vh = cw / aspect; }
    else { vh = ch; vw = ch * aspect; }
    var cx = (bb.minX + bb.maxX) / 2, cy = (bb.minY + bb.maxY) / 2;
    // 若刚搜索定位过某人，且当前视野装不下整张图，就以这个人为中心，别让他跑到屏幕外
    var sel = gState.sel && gState.nodeMap[gState.sel];
    if (sel && (vw < cw || vh < ch)) { cx = sel.x; cy = sel.y; }
    var x = cx - vw / 2, y = cy - vh / 2;
    svg.setAttribute('viewBox', x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + vw.toFixed(1) + ' ' + vh.toFixed(1));
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.maxWidth = 'none';
    // 窄屏样式给 #gSvg 设了 min-width:760px（平时靠横向滚动看图），
    // 全屏时如果不解除，SVG 会保持 760 宽，viewBox 是按舞台（约 390）算的，右侧就被裁掉
    svg.style.minWidth = '0';
    gState.zoom = 1; gState.tx = 0; gState.ty = 0;
    applyTransform();
    return true;
  }

  function fitSvgToStage(on) {
    var svg = $('#gSvg');
    if (!svg) return;
    if (on) {
      // 只在“第一次进入全屏”时记录还原点；之后的 resize / 二次对齐都只重算 viewBox，
      // 否则会把用户搜索定位后的缩放和平移状态覆盖掉，退出全屏就跳回原点
      if (!FS_VIEWBOX) {
        FS_VIEWBOX = svg.getAttribute('viewBox') || ('0 0 ' + G.W + ' ' + G.H);
        FS_TRANSFORM = { zoom: gState.zoom, tx: gState.tx, ty: gState.ty };
        // 横屏且用户已经自己缩放/平移到某处（比如搜索定位过某人）：
        // 全屏只把画布铺满，保持原视野，避免"一进全屏就把画面重置"的跳变
        var sr0 = $('#gStage').getBoundingClientRect();
        FS_KEEP = (gState.zoom !== 1 || gState.tx !== 0 || gState.ty !== 0) &&
          (sr0.width / Math.max(1, sr0.height)) >= 0.95;
      }
      if (FS_KEEP) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.maxWidth = 'none';
        svg.style.minWidth = '0';
        applyTransform();
      } else {
        applyFsViewBox();
      }
    } else {
      if (FS_VIEWBOX) svg.setAttribute('viewBox', FS_VIEWBOX);
      svg.style.width = ''; svg.style.height = ''; svg.style.maxWidth = ''; svg.style.minWidth = '';
      if (FS_TRANSFORM) {
        gState.zoom = FS_TRANSFORM.zoom; gState.tx = FS_TRANSFORM.tx; gState.ty = FS_TRANSFORM.ty;
      }
      FS_VIEWBOX = null; FS_TRANSFORM = null; FS_KEEP = false;
      applyTransform();
    }
  }

  function fsFallback(on) {
    // 用占位块保住原高度，避免画布脱离文档流后整页塌陷（闪动的根因）
    var el = $('#gStage'), sp = $('#stageSpacer');
    if (sp) {
      if (on) {
        sp.style.height = el.offsetHeight + 'px';
        sp.hidden = false;
      } else {
        sp.hidden = true;
        sp.style.height = '';
      }
    }
    document.body.classList.add('fs-switching');
    document.body.classList.toggle('graph-fs', on);
    setTimeout(function () { document.body.classList.remove('fs-switching'); }, 260);
    fitSvgToStage(on);
    if (on) {
      requestAnimationFrame(function () {
        // 首帧时筛选条刚从文档流变为 fixed，舞台尺寸可能还没稳定，按最终尺寸再对齐一次
        if (!document.body.classList.contains('graph-fs') || FS_KEEP) return;
        applyFsViewBox();
        syncZoom();
      });
    }
    syncFsUi(on);
  }

  function syncFsUi(on) {
    var btn = $('#fsToggle');
    if (btn) btn.textContent = on ? '退出全屏' : '全屏';
    var tools = $('#stageTools');
    if (tools) tools.style.display = '';
    if (on) {
      requestAnimationFrame(function () {
        var st = $('#gStage');
        if (st && st.scrollWidth > st.clientWidth + 4) {
          st.scrollLeft = (st.scrollWidth - st.clientWidth) / 2;
          st.scrollTop = (st.scrollHeight - st.clientHeight) / 2;
        }
      });
    }
  }

  function isGraphFs() {
    return document.body.classList.contains('graph-fs');
  }

  function setGraphFs(on) {
    if (on === isGraphFs()) return;
    fsFallback(on);
  }

  function toggleGraphFs() { setGraphFs(!isGraphFs()); }

  function paintEdges() {
    var focusNode = gState.edgeHover ? null : (gState.hover || gState.sel);  // 连线悬停优先
    var eid = gState.edgeSel, hov = gState.edgeHover;
    var any = !!focusNode || !!eid || !!hov;
    // 聚焦时把相关的人名都显出来（密集区默认隐藏的标签也一并显示）
    var show = {}, nbr = {};
    if (hov) { show[hov.a] = 1; show[hov.b] = 1; }
    if (eid) { show[eid.a] = 1; show[eid.b] = 1; }
    if (focusNode) {
      show[focusNode] = 1;
      nbr[focusNode] = 1;
      gState.edges.forEach(function (e) {
        if (e.a === focusNode) { show[e.b] = 1; nbr[e.b] = 1; }
        if (e.b === focusNode) { show[e.a] = 1; nbr[e.a] = 1; }
      });
    }
    var eFocus = hov || eid;
    $$('.g-node').forEach(function (g) {
      var nid2 = g.getAttribute('data-id');
      var isEnd = !!eFocus && (nid2 === eFocus.a || nid2 === eFocus.b);
      g.classList.toggle('elabel', !!show[nid2]);
      g.classList.toggle('nbr', !!nbr[nid2]);
      // 悬停/选中连线：两端高亮，其余节点置灰
      g.classList.toggle('ehot', isEnd);
      g.classList.toggle('eof', !!eFocus && !isEnd);
    });
    $$('.g-edge-g').forEach(function (g) {
      var a = g.getAttribute('data-a'), b = g.getAttribute('data-b');
      var onNode = !!focusNode && (a === focusNode || b === focusNode);
      var onEdge = !!eid && a === eid.a && b === eid.b;
      var onHov = !!hov && a === hov.a && b === hov.b;
      var on = onNode || onEdge || onHov;
      g.classList.toggle('show', on);
      g.classList.toggle('sel', onEdge);
      g.querySelector('.g-edge').classList.toggle('hl', on);
      g.querySelector('.g-edge').classList.toggle('dim', any && !on);
    });
  }

  function highlight(id) {
    var near = {};
    if (id) {
      near[id] = 1;
      gState.edges.forEach(function (e) {
        if (e.a === id) near[e.b] = 1;
        if (e.b === id) near[e.a] = 1;
      });
    }
    $$('.g-node').forEach(function (g) {
      var nid = g.getAttribute('data-id');
      g.classList.toggle('faded', !!id && !near[nid]);
      g.classList.toggle('sel', nid === gState.sel);
    });
    paintEdges();
    var tip = $('#gTip');
    if (gState.edgeHover || gState.edgeSel) { tip.hidden = true; return; }
    if (id && gState.nodeMap[id]) {
      tip.innerHTML = '<b>' + esc(gState.nodeMap[id].item.name) + '</b>' +
        esc((gState.nodeMap[id].item.alias || gState.nodeMap[id].item.role || ''));
      tip.hidden = false;
    } else tip.hidden = true;
  }

  function clearEdgeSel() {
    gState.edgeSel = null;
    gState.edgeHover = null;
    var p = $('#gEdgePanel');
    if (p) p.hidden = true;
    paintEdges();
  }

  function castIds(eid) {
    return D.relations.filter(function (r) { return r.a === eid && r.label === '出场' && byId[r.b]; })
      .map(function (r) { return byId[r.b]; });
  }

  /* 点击连线：两人关系 + 共同事件 */
  function openEdge(a, b, label) {
    gState.edgeSel = { a: a, b: b };
    paintEdges();
    renderEdgePanel(a, b, label);
    positionEdgePanel();
  }

  function hideEdgePanel() {
    var p = $('#gEdgePanel');
    if (p) p.hidden = true;
  }

  /* 全屏时关系卡跟随连线中点；非全屏保持右上角固定 */
  function svgToStagePt(x, y) {
    var svg = $('#gSvg'), stage = $('#gStage');
    if (!svg || !stage) return null;
    var m = svg.getScreenCTM();
    if (!m) return null;
    var pt = svg.createSVGPoint();
    pt.x = gState.tx + x * gState.zoom;
    pt.y = gState.ty + y * gState.zoom;
    var p = pt.matrixTransform(m);
    var sr = stage.getBoundingClientRect();
    return { x: p.x - sr.left, y: p.y - sr.top };
  }

  function positionEdgePanel() {
    var panel = $('#gEdgePanel'), stage = $('#gStage');
    if (!panel || !stage) return;
    // 非全屏或窄屏（移动端）保持固定位置：右上角 / 底部抽屉
    if (!document.body.classList.contains('graph-fs') || window.innerWidth <= 820) {
      panel.style.left = ''; panel.style.top = ''; panel.style.right = '';
      return;
    }
    if (panel.hidden || !gState.edgeSel) return;
    var A = gState.nodeMap[gState.edgeSel.a], B = gState.nodeMap[gState.edgeSel.b];
    if (!A || !B) return;
    var pt = svgToStagePt((A.x + B.x) / 2, (A.y + B.y) / 2);
    if (!pt) return;
    var pw = panel.offsetWidth, ph = panel.offsetHeight;
    var sr = stage.getBoundingClientRect();
    // 顶部筛选条下方留出安全区，避免卡片被压住
    var topSafe = 10;
    var bar = document.querySelector('.filterbar.stack');
    if (bar && getComputedStyle(bar).visibility !== 'hidden') {
      topSafe = Math.max(topSafe, bar.getBoundingClientRect().bottom - sr.top + 8);
    }
    var x = pt.x + 22, y = pt.y - ph / 2;
    if (x + pw > sr.width - 10) x = pt.x - pw - 22;
    x = Math.max(10, Math.min(x, sr.width - pw - 10));
    y = (ph > sr.height - topSafe - 10) ? topSafe
      : Math.max(topSafe, Math.min(y, sr.height - ph - 10));
    panel.style.right = 'auto';
    panel.style.left = Math.round(x) + 'px';
    panel.style.top = Math.round(y) + 'px';
  }

  function renderEdgePanel(a, b, label) {
    var A = byId[a], B = byId[b];
    var panel = $('#gEdgePanel');
    if (!A || !B || !panel) { hideEdgePanel(); return; }
    var html = '<div class="edge-head">' +
      '<button class="edge-p" data-go="' + a + '"><small>' + esc(A.familyName || A.role || catName(A.cat)) + '</small>' +
      esc(A.name) + '</button>' +
      '<span class="edge-rel">' + esc(label) + '</span>' +
      '<button class="edge-p" data-go="' + b + '"><small>' + esc(B.familyName || B.role || catName(B.cat)) + '</small>' +
      esc(B.name) + '</button></div>';
    var inv = INV_LABEL[label] || label;
    html += '<p class="edge-note">' + esc(A.name) + ' 对 ' + esc(B.name) + ' 是「' + label +
      '」；从 ' + esc(B.name) + ' 一方看则是「' + inv + '」。' +
      (REL_NOTE[label] ? esc(REL_NOTE[label]) + ' ' : '') + '点姓名可看人物详情。</p>';
    // 同一对人可能有多重关系：主关系之外的分层次列出来
    var pairLabels = [];
    D.relations.forEach(function (r) {
      if ((r.a === a && r.b === b) || (r.a === b && r.b === a)) {
        if (pairLabels.indexOf(r.label) < 0) pairLabels.push(r.label);
      }
    });
    pairLabels.sort(function (x, y) { return relWeight(y) - relWeight(x); });
    var extra = pairLabels.filter(function (l) { return l !== label; });
    if (extra.length) {
      html += '<p class="edge-also">同一对人物另有：' +
        extra.map(function (l) { return '「' + esc(l) + '」'; }).join('') + '</p>';
    }

    if (A.cat === 'event' || B.cat === 'event') {
      var ev = A.cat === 'event' ? A : B;
      var cast = castIds(ev.id);
      html += '<div class="edge-events"><h4>事件 · ' + esc(ev.alias || '') + '</h4>' +
        '<p class="edge-evsum">' + esc(ev.summary || '') + '</p>' +
        '<div class="m-rel"><div class="grp"><span class="lb">出场</span>' +
        cast.map(function (p) { return '<button data-go="' + p.id + '">' + esc(p.name) + '</button>'; }).join('') +
        '</div></div></div>';
    } else {
      var shared = sharedEvents(a, b);
      if (shared.length) {
        html += '<div class="edge-events"><h4>两人相关的事件（' + shared.length + '）</h4><div class="m-ev">' +
          shared.map(function (x) {
            return '<button data-go="' + x.ev.id + '"><span class="e-ch">' + esc(x.ev.alias || '') + '</span>' +
              '<span>' + esc(x.ev.name) + ' — ' + esc(x.ev.summary || '') + '</span></button>';
          }).join('') + '</div></div>';
      } else {
        html += '<div class="edge-events"><h4>两人相关的事件</h4>' +
          '<p class="edge-none">两人在本库中没有共同出场或涉及的事件。</p>' +
          '<p class="edge-none">' + esc(A.name) + ' 关联 ' + eventCount(a) + ' 个事件 · ' +
          esc(B.name) + ' 关联 ' + eventCount(b) + ' 个事件。</p></div>';
      }
      var fates = (FATE_MAP[a] || []).concat(FATE_MAP[b] || []);
      if (fates.length) {
        html += '<div class="edge-events"><h4>谶语线索</h4><div class="m-rel"><div class="grp">' +
          fates.map(function (f) { return '<button data-go="' + f.id + '">判词 · ' + esc(f.name) + '</button>'; }).join('') +
          '</div></div></div>';
      }
    }
    // 精确切换：列出 A 的其他关系，点一下即选中对应连线
    var others = D.relations.filter(function (r) {
      if (!byId[r.a] || !byId[r.b]) return false;
      if (!(r.a === a || r.b === a)) return false;
      if ((r.a === a && r.b === b) || (r.a === b && r.b === a)) return false;  // 同一对人已在上面并列
      return true;
    }).slice(0, 12);
    if (others.length) {
      html += '<div class="edge-events"><h4>' + esc(A.name) + ' 的其他关系</h4><div class="edge-more">' +
        others.map(function (r) {
          var other = byId[r.a === a ? r.b : r.a];
          var lab = r.a === a ? r.label : (INV_LABEL[r.label] || r.label);
          return '<button data-edge="' + (r.a === a ? r.a : r.b) + '|' +
            (r.a === a ? r.b : r.a) + '|' + esc(r.label) + '">' +
            '<span class="em-lab">' + esc(lab) + '</span>' + esc(other.name) + '</button>';
        }).join('') + '</div></div>';
    }

    html += '<div class="edge-foot"><button class="edge-more-btn" id="edgeExpand">查看完整关系 ↗</button>' +
      '<span class="edge-tip">Esc 或点空白处关闭</span></div>';

    // 关闭按钮放在最前，避免 innerHTML 覆盖掉index.html里的原始按钮
    panel.innerHTML = '<button class="edge-close" id="gEdgeClose" aria-label="关闭">✕</button>' + html;
    panel.hidden = false;
    $$('#gEdgePanel [data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () { hideEdgePanel(); openItem(btn.getAttribute('data-go')); });
    });
    var expand = $('#edgeExpand');
    if (expand) expand.addEventListener('click', function () { openEdgeModal(a, b, label); });
    $$('#gEdgePanel [data-edge]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-edge').split('|');
        openEdge(p[0], p[1], p[2]);
      });
    });
  }

  /* 完整关系弹窗：长文阅读用，侧栏做主入口 */
  function openEdgeModal(ida, idb, label) {
    var a = byId[ida], b = byId[idb];
    if (!a || !b) return;
    var inv = INV_LABEL[label] || label;
    var shared = sharedEvents(ida, idb);
    var fates = (FATE_MAP[ida] || []).concat(FATE_MAP[idb] || []);
    var others = D.relations.filter(function (r) {
      return (r.a === ida || r.b === ida) && byId[r.a] && byId[r.b] &&
        !(r.a === ida && r.b === idb && r.label === label);
    }).slice(0, 10);

    var html = '<div class="m-eyebrow">关系 · ' + esc(label) + '</div>' +
      '<h2><span class="rel-a">' + esc(a.name) + '</span><span class="rel-arrow">—' + esc(label) + '→</span>' +
      '<span class="rel-b">' + esc(b.name) + '</span></h2>' +
      '<div class="m-sub">' + esc(REL_NOTE[label] || '') + '　反向写作「' + esc(inv) + '」</div>' +
      '<div class="m-tags">' +
        (a.familyName ? '<span class="tag f">' + esc(a.familyName) + '</span>' : '') +
        '<span class="tag">' + esc(a.role || '') + '</span>' +
        (b.familyName ? '<span class="tag f">' + esc(b.familyName) + '</span>' : '') +
        '<span class="tag">' + esc(b.role || '') + '</span></div>' +
      '<div class="m-rel2">' +
        '<button data-go="' + a.id + '"><b>' + esc(a.name) + '</b><span>' + esc(a.summary || '') + '</span></button>' +
        '<button data-go="' + b.id + '"><b>' + esc(b.name) + '</b><span>' + esc(b.summary || '') + '</span></button>' +
      '</div>' +
      (shared.length
        ? '<div class="m-sec"><h3>共同事件（' + shared.length + '）</h3><div class="m-ev">' +
          shared.sort(function (x, y) { return (x.ev.seq || 0) - (y.ev.seq || 0); }).map(function (x) {
            var ev = x.ev;
            return '<button data-go="' + ev.id + '"><span class="e-ch">' + esc(ev.alias || '') + '</span>' +
              '<span>' + esc(ev.name) + ' — ' + esc(ev.summary || '') + '</span></button>';
          }).join('') + '</div></div>'
        : '<div class="m-sec"><h3>共同事件</h3><p class="m-none">两人在现有条目中没有共同出场的事件。</p></div>') +
      (fates.length
        ? '<div class="m-sec"><h3>谶语线索</h3><div class="m-rel"><div class="grp">' +
          fates.map(function (f) { return '<button data-go="' + f.id + '">' + esc(f.name) + '</button>'; }).join('') +
          '</div></div></div>' : '') +
      (others.length
        ? '<div class="m-sec"><h3>' + esc(a.name) + ' 的其他关系</h3><div class="edge-more">' +
          others.map(function (r) {
            var other = byId[r.a === ida ? r.b : r.a];
            var lab = r.a === ida ? r.label : (INV_LABEL[r.label] || r.label);
            return '<button data-switch="' + (r.a === ida ? r.a : r.b) + '|' +
              (r.a === ida ? r.b : r.a) + '|' + esc(r.label) + '"><span class="em-lab">' +
              esc(lab) + '</span>' + esc(other.name) + '</button>';
          }).join('') + '</div></div>' : '');

    $('#modalBody').innerHTML = html;
    $$('#modalBody [data-go]').forEach(function (btn) {
      btn.addEventListener('click', function () { openItem(btn.getAttribute('data-go')); });
    });
    $$('#modalBody [data-switch]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var p = btn.getAttribute('data-switch').split('|');
        openEdgeModal(p[0], p[1], p[2]);
      });
    });
    state.list = [];
    state.idx = 0;
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
    var tools = document.getElementById('stageTools');
    if (tools && isGraphFs()) tools.style.display = 'none';
  }

  // 指针到连线的最近距离（图坐标系）
  function _distToSeg(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay;
    var len2 = dx * dx + dy * dy;
    var t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var qx = ax + t * dx, qy = ay + t * dy;
    return Math.hypot(px - qx, py - qy);
  }

  var _ptCache = null;
  function svgToGraph(svg, ev) {
    if (!svg) return null;
    if (!_ptCache) _ptCache = svg.createSVGPoint();
    _ptCache.x = ev.clientX; _ptCache.y = ev.clientY;
    var m = svg.getScreenCTM();
    if (!m) return null;
    var p = _ptCache.matrixTransform(m.inverse());
    return { x: (p.x - gState.tx) / gState.zoom, y: (p.y - gState.ty) / gState.zoom };
  }

  function nodeAtPoint(p) {
    if (!p) return null;
    var hit = null;
    gState.nodes.forEach(function (nd) {
      var rr = Math.min(8.5, 3.0 + Math.sqrt(nd.deg) * (gState.nodes.length > 100 ? 1.5 : 1.8));
      if (Math.hypot(p.x - nd.x, p.y - nd.y) <= rr + 2) hit = nd;
    });
    return hit;
  }

  function bindEdgeHover() {
    var svg = $('#gSvg');
    if (!svg || svg.dataset.edgeHover) return;
    svg.dataset.edgeHover = '1';
    var raf = 0, lastEv = null;

    function update(ev) {
      if (!ev) return;
      var p = svgToGraph(svg, ev);
      if (!p) return;
      // 指针落在某个圆点（含 2px 容差）上时交给节点悬停；
      // 注意不能用 DOM 的大命中圈，否则密集区里根本点不到线
      var overNode = nodeAtPoint(p);
      if (overNode) {
        if (gState.edgeHover) { gState.edgeHover = null; paintEdges(); }
        return;
      }
      var best = null, bestD = 1e9;
      gState.edges.forEach(function (e) {
        var a = gState.nodeMap[e.a], b = gState.nodeMap[e.b];
        if (!a || !b) return;
        var d = _distToSeg(p.x, p.y, a.x, a.y, b.x, b.y);
        if (d < bestD) { bestD = d; best = e; }
      });
      var rect = svg.getBoundingClientRect();
      var unit = (rect.width ? G.W / rect.width : 1) / gState.zoom;  // 图坐标 → 屏幕像素
      var thr = 10 * unit;
      if (best && bestD <= thr) {
        if (!gState.edgeHover || gState.edgeHover.a !== best.a || gState.edgeHover.b !== best.b) {
          gState.edgeHover = { a: best.a, b: best.b };
          paintEdges();
        }
      } else if (gState.edgeHover) {
        gState.edgeHover = null;
        paintEdges();
      }
    }

    svg.addEventListener('mousemove', function (ev) {
      lastEv = ev;
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; update(lastEv); });
    }, { passive: true });
    svg.addEventListener('mouseleave', function () {
      if (gState.edgeHover) { gState.edgeHover = null; paintEdges(); }
    });
  }

  function bindGraph() {
    $$('.g-node').forEach(function (g) {
      var id = g.getAttribute('data-id');
      g.addEventListener('mouseenter', function () {
        if (gState.edgeHover) { gState.edgeHover = null; }
        gState.hover = id; highlight(id);
      });
      g.addEventListener('mouseleave', function () { gState.hover = null; highlight(gState.sel); });
      g.addEventListener('click', function (e) {
        e.stopPropagation();
        // 圆点命中圈比视觉半径略大，若指针其实贴在连线上（已由距离判定命中某条线），优先打开关系卡
        if (gState.edgeHover) {
          var eh = gState.edgeHover;
          var rec = gState.edges.filter(function (r) { return r.a === eh.a && r.b === eh.b; })[0];
          openEdge(eh.a, eh.b, rec ? rec.label : '');
          return;
        }
        gState.sel = id; clearEdgeSel(); highlight(id); openItem(id);
      });
    });
    // 连线悬停：用「指针到线段的距离」判定，而不是 DOM 命中。
    // 密集区里多条线的 18px 命中区互相叠压，靠 DOM 只能选中最后画的那条，
    // 会出现「看得到线、悬停却没反应」；按距离取最近的一条就都能命中。
    bindEdgeHover();

    var stage = $('#gStage');
    if (stage.dataset.bound) return;
    stage.dataset.bound = '1';

    // 关系卡内容每次重绘，关闭按钮用事件委托绑定一次即可
    var fsPanel = $('#gEdgePanel');
    if (fsPanel && !fsPanel.dataset.bound) {
      fsPanel.dataset.bound = '1';
      fsPanel.addEventListener('click', function (e) {
        if (e.target.closest('#gEdgeClose')) clearEdgeSel();
      });
    }
    $('#gSvg').addEventListener('click', function (e) {
      // 圆点的 DOM 命中圈（r+4）比视觉半径大，会和贴近圆点的连线抢点击；
      // 以「距离判定」为准：真在圆点上才算点人，否则算点线
      var p = svgToGraph($('#gSvg'), e);
      var nodeHit = nodeAtPoint(p);
      if (gState.edgeHover && !nodeHit) {
        var eh = gState.edgeHover;
        var rec = gState.edges.filter(function (r) { return r.a === eh.a && r.b === eh.b; })[0];
        openEdge(eh.a, eh.b, rec ? rec.label : '');
        e.stopPropagation();
        return;
      }
      if (nodeHit || e.target.closest('.g-node')) return;
      clearEdgeSel();
    });

    $$('[data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-zoom');
        if (m === 'in') gState.zoom = Math.min(3, gState.zoom * 1.2);
        else if (m === 'out') gState.zoom = Math.max(0.5, gState.zoom / 1.2);
        else { gState.zoom = 1; gState.tx = 0; gState.ty = 0; }
        applyTransform(); syncZoom();
        var lbl = $('#fsZoomLabel'); if (lbl) lbl.textContent = Math.round(gState.zoom * 100) + '%';
      });
    });

    var drag = null;
    $('#gSvg').addEventListener('mousedown', function (e) {
      if (e.target.closest('.g-node')) return;
      drag = { x: e.clientX, y: e.clientY, tx: gState.tx, ty: gState.ty, moved: false };
    });
    window.addEventListener('mousemove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 4) return;
      drag.moved = true;
      stage.classList.add('dragging');
      var k = G.W / ($('#gSvg').getBoundingClientRect().width || G.W);
      gState.tx = clampPan(drag.tx + dx * k);
      gState.ty = clampPan(drag.ty + dy * k);
      applyTransform();
    });
    window.addEventListener('mouseup', function () { drag = null; stage.classList.remove('dragging'); });
    $('#gSvg').addEventListener('wheel', function (e) {
      e.preventDefault();
      gState.zoom = Math.max(0.5, Math.min(3, gState.zoom * (e.deltaY > 0 ? 0.89 : 1.12)));
      applyTransform(); syncZoom();
    }, { passive: false });
  }

  /* ---------------- 人物 ---------------- */
  function renderPeople() {
    if (!$('#peopleFamily').dataset.init) {
      $('#peopleFamily').innerHTML = '<option value="all">全部家族</option>' +
        D.families.map(function (f) { return '<option value="' + f.id + '">' + esc(f.name) + '</option>'; }).join('');
      $('#peopleRole').innerHTML = '<option value="all">全部身份</option>' +
        D.roles.map(function (r) { return '<option value="' + esc(r) + '">' + esc(r) + '</option>'; }).join('');
      $('#peopleFamily').dataset.init = '1';
      $('#peopleFamily').addEventListener('change', function (e) { state.family = e.target.value; renderPeople(); });
      $('#peopleRole').addEventListener('change', function (e) { state.role = e.target.value; renderPeople(); });
      $('#peopleSearch').addEventListener('input', function (e) { state.q = e.target.value; renderPeople(); });
    }
    var q = state.q.trim().toLowerCase();
    var list = itemsOf('people').filter(function (p) {
      if (state.family !== 'all' && p.family !== state.family) return false;
      if (state.role !== 'all' && p.role !== state.role) return false;
      if (!q) return true;
      var hay = (p.name + ' ' + (p.alias || '') + ' ' + (p.summary || '') + ' ' + (p.detail || '') + ' ' +
        (p.tags || []).join(' ')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    state.list = list;
    $('#peopleCount').textContent = list.length + ' / ' + itemsOf('people').length + ' 人';
    $('#peopleGrid').innerHTML = list.map(function (p) {
      var f = famById[p.family];
      return '<div class="person" data-id="' + p.id + '">' +
        '<div class="avatar" style="border-color:' + (f ? f.color : '#c0b195') + '">' + esc(p.name.slice(0, 1)) + '</div>' +
        '<div><div class="pname">' + esc(p.name) + '</div>' +
        '<div class="pmeta">' + esc([f ? f.name : '', p.role].filter(Boolean).join(' · ')) +
          (eventCount(p.id) ? '<span class="ev-badge">' + eventCount(p.id) + ' 事</span>' : '') + '</div>' +
        '<div class="pdesc">' + esc(p.summary || '') + '</div></div></div>';
    }).join('');
    $$('#peopleGrid .person').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }

  /* ---------------- 事件 ---------------- */
  var evFilter = 'all';
  function renderEvents() {
    var evs = itemsOf('event');
    $('#eventFilters').innerHTML =
      '<button class="chip ' + (evFilter === 'all' ? 'on' : '') + '" data-ev="all">全部<em>' + evs.length + '</em></button>' +
      '<span class="muted">按回目先后排列 · 点击查看经过与出场人物</span>';
    $$('#eventFilters .chip').forEach(function (b) {
      b.addEventListener('click', function () { evFilter = b.getAttribute('data-ev'); renderEvents(); });
    });
    var list = evs.slice().sort(function (a, b) { return seqOf(a) - seqOf(b); });
    state.list = list;
    $('#eventList').innerHTML = list.map(function (e) {
      var n = Number(String(e.alias || '').replace(/[^0-9]/g, '')) || 0;
      var cast = castOf(e.id).slice(0, 6).join('、');
      return '<div class="row" data-id="' + e.id + '">' +
        '<div class="idx">' + esc(e.alias || '') + '</div>' +
        '<div><h3>' + esc(e.name) + '</h3>' +
        '<p>' + esc(e.summary) + '</p>' +
        '<div class="ch">出场：' + esc(cast) + '</div></div></div>';
    }).join('');
    $$('#eventList .row').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }
  function seqOf(e) { return e.seq || 0; }
  function castOf(eid) {
    return D.relations.filter(function (r) { return r.a === eid && r.label === '出场'; })
      .map(function (r) { return byId[r.b] ? byId[r.b].name : r.b; });
  }

  /* ---------------- 判词 / 诗词 / 地点 / 回目 ---------------- */
  function renderFate() {
    var list = itemsOf('fate');
    state.list = list;
    $('#fateGrid').innerHTML = list.map(function (f) {
      return '<article class="fate" data-id="' + f.id + '"><h3>' + esc(f.name) + '</h3>' +
        '<div class="verse">' + esc(f.quote || '') + '</div>' +
        '<p>' + esc(f.detail || '') + '</p></article>';
    }).join('');
    $$('#fateGrid .fate').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }

  function renderPoetry() {
    var list = itemsOf('poetry');
    state.list = list;
    $('#poemList').innerHTML = list.map(function (p) {
      return '<article class="poem" data-id="' + p.id + '"><h3>' + esc(p.name) + '</h3>' +
        '<div class="by">' + esc(p.alias || '') + '</div>' +
        '<pre>' + esc(p.quote || '') + '</pre>' +
        '<p>' + esc(p.detail || '') + '</p></article>';
    }).join('');
    $$('#poemList .poem').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }

  function renderPlaces() {
    var list = itemsOf('place');
    state.list = list;
    $('#placeGrid').innerHTML = list.map(function (p) {
      return '<article class="card" data-id="' + p.id + '">' +
        '<div class="meta"><span class="yr">' + esc(p.type || '') + '</span></div>' +
        '<h3>' + esc(p.name) + '</h3><p>' + esc(p.summary || '') + '</p></article>';
    }).join('');
    $$('#placeGrid .card').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }

  function renderChapters() {
    var list = itemsOf('chapter');
    state.list = list;
    $('#chapterList').innerHTML = list.map(function (c) {
      var ev = D.relations.filter(function (r) { return r.a === c.id && byId[r.b] && byId[r.b].cat === 'event'; })
        .map(function (r) { return byId[r.b].name; });
      return '<div class="row" data-id="' + c.id + '">' +
        '<div class="idx">' + esc(c.name) + '</div>' +
        '<div><h3>' + esc(c.alias || '') + '</h3>' +
        '<p>' + esc(ev.length ? '相关事件：' + ev.join('、') : '') + '</p></div></div>';
    }).join('');
    $$('#chapterList .row').forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
  }

  function renderData() {
    if ($('#dataPanels').dataset.done) return;
    var html = '';
    (D.panels || []).forEach(function (p) {
      html += '<section class="panel"><h2>' + esc(p.title) + '</h2>' +
        '<p class="pdesc">' + esc(p.desc || '') + '</p>';
      if (p.kind === 'bars') {
        var max = Math.max.apply(null, p.rows.map(function (r) { return r.value; }));
        html += '<div class="bars">' + p.rows.map(function (r) {
          return '<div class="bar-row"><div class="bar-label">' + esc(r.label) + '</div>' +
            '<div class="bar-track"><div class="bar-fill" style="width:' + (r.value / max * 100).toFixed(1) + '%"></div></div>' +
            '<div class="bar-val">' + r.value + '</div></div>';
        }).join('') + '</div>';
      } else {
        html += '<table class="data"><thead><tr>' + p.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
          '</tr></thead><tbody>' + p.rows.map(function (r) {
            return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>';
          }).join('') + '</tbody></table>';
      }
      html += '</section>';
    });
    $('#dataPanels').innerHTML = html;
    $('#dataPanels').dataset.done = '1';
  }

  /* ---------------- 详情 ---------------- */

  // 反向关系的中文称谓：让「宝玉」页面显示「父」而不是「父子」
  var INV_LABEL = {
    '父子': '父', '父女': '父', '母子': '母', '母女': '母',
    '祖孙': '祖辈', '外祖母': '外孙/女', '曾祖母': '曾孙/女', '姑祖母': '侄孙/女',
    '夫妻': '配偶', '妾室': '夫主', '未婚夫妻': '未婚夫/妻',
    '兄弟': '兄弟', '兄妹': '兄妹', '姐妹': '姐妹', '姐弟': '姐弟',
    '同父异母兄妹': '同父异母兄妹', '同父异母兄弟': '同父异母兄弟',
    '同父异母姐妹': '同父异母姐妹', '同父异母姐弟': '同父异母姐弟',
    '同父同母兄妹': '同父同母兄妹', '同父同母姐弟': '同父同母姐弟',
    '同父同母兄弟': '同父同母兄弟', '同父同母姐妹': '同父同母姐妹',
    '堂兄妹': '堂兄妹', '族兄妹': '族兄妹', '族姐妹': '族姐妹',
    '诗社发起': '诗社成员', '诗社社长': '诗社成员',
    '堂兄弟': '堂兄弟', '堂姐妹': '堂姐妹', '嫡母': '庶子/女', '养父女': '养女',
    '姑嫂': '姑/嫂', '姨甥': '姨母/甥', '叔侄': '侄', '姑侄': '侄', '翁婿': '婿',
    '继母女': '继女', '主仆': '仆从', '陪房': '陪房', '老仆': '仆从',
    '大管家': '管家', '小厮': '小厮', '奶兄': '奶兄', '同房': '同房',
    '同侪': '同侪', '同僚': '同僚', '同班': '同班', '师徒': '师父',
    '抚养': '被抚养', '请托': '受托', '相思': '被思慕', '提亲': '被提亲',
    '引荐': '被引荐', '传话': '受托传话', '串通': '串通', '供奉': '受供奉',
    '抄检': '被抄检', '被撵': '撵人', '镜像': '镜像', '求差事': '给差事',
    '宗族': '宗族', '族中长辈': '族中晚辈', '私交': '私交', '情人': '情人',
    '夫妻（续）': '夫妻', '主仆（陪房）': '主子'
  };

  var REL_NOTE = {
    '父子': '父与子。', '父女': '父与女。', '母子': '母与子。', '母女': '母与女。',
    '夫妻': '夫妻。', '妾室': '夫主与妾室。', '未婚夫妻': '订有婚约。',
    '祖孙': '祖辈与孙辈。', '外祖母': '外祖母与外孙/女。', '曾祖母': '曾祖母与曾孙/女。',
    '姑祖母': '姑祖母与侄孙/女。', '嫡母': '嫡母与庶子/女。', '养父女': '养父与养女。',
    '兄弟': '同辈兄弟。', '兄妹': '兄妹。', '姐妹': '姐妹。', '姐弟': '姐弟。',
    '同父异母兄妹': '同父异母的兄妹：同出一父，各自不同母。',
    '同父异母兄弟': '同父异母的兄弟。',
    '同父异母姐妹': '同父异母的姐妹。',
    '同父异母姐弟': '同父异母的姐弟。',
    '同父同母姐弟': '同父同母的姐弟（同为赵姨娘所出）。',
    '堂兄妹': '堂房兄妹：父辈为亲兄弟。',
    '族兄妹': '族中兄妹：同族而支派较远。',
    '族姐妹': '族中姐妹：同族而支派较远。',
    '诗社发起': '海棠诗社由探春发起。',
    '诗社社长': '诗社由李纨主持评诗。',
    '堂兄弟': '堂房兄弟。', '堂姐妹': '堂房姐妹。', '姑嫂': '姑嫂。', '姨甥': '姨母与甥。',
    '叔侄': '叔侄。', '姑侄': '姑侄。', '翁婿': '岳父与女婿。', '继母女': '继母与继女。',
    '主仆': '主仆。', '陪房': '陪房仆妇与主子。', '老仆': '老仆与主子。', '大管家': '管家与主子。',
    '小厮': '小厮与主子。', '奶兄': '乳母之子与主子。', '同房': '同房丫鬟。', '同侪': '同辈。',
    '同僚': '同僚。', '同班': '同班戏子。', '师徒': '师徒。', '抚养': '抚养关系。',
    '请托': '请托与受托。', '相思': '单方面思慕。', '提亲': '提亲。', '引荐': '引荐。',
    '传话': '传话。', '串通': '串通。', '供奉': '供奉关系。', '抄检': '抄检与被抄检。',
    '被撵': '撵逐。', '镜像': '互为镜像。', '求差事': '谋差事。', '宗族': '同族。',
    '族中长辈': '族中长辈与晚辈。', '私交': '私下交好。', '情人': '情人。',
    '知己': '知己。', '诗友': '诗友。', '诗社同人': '诗社同人。', '同窗': '同窗。',
    '友人': '友人。', '点化': '点化。', '引游幻境': '引游幻境。'
  };

  function relationsOf(id) {
    var out = [];
    D.relations.forEach(function (r) {
      if (r.a === id && byId[r.b]) out.push({ other: byId[r.b], label: r.label, show: r.label, dir: 'out' });
      else if (r.b === id && byId[r.a]) out.push({ other: byId[r.a], label: r.label, show: INV_LABEL[r.label] || r.label, dir: 'in' });
    });
    // 血缘、婚姻等根本关系排在前面，诗社同人、事件类沉底
    return out.sort(function (x, y) { return relWeight(y.label) - relWeight(x.label); });
  }

  function openItem(id) {
    if (document.body.classList.contains('graph-fs')) {
      // 全屏时把工具条收起，避免遮挡弹窗底部
      var tools = document.getElementById('stageTools');
      if (tools) tools.style.display = 'none';
    }
    var it = byId[id];
    if (!it) return;
    var idx = state.list.findIndex(function (x) { return x.id === id; });
    if (idx < 0) { state.list = [it]; idx = 0; }
    state.selected = id;
    state.idx = idx;
    renderModal(it);
    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    $('#modal').hidden = true;
    document.body.style.overflow = document.body.classList.contains('graph-fs') ? 'hidden' : '';
    var tools = document.getElementById('stageTools');
    if (tools) tools.style.display = '';
    gState.sel = null;
    if (state.view === 'graph') highlight(null);
  }
  function step(d) {
    var ni = (state.idx || 0) + d;
    if (ni < 0 || ni >= state.list.length) return;
    state.idx = ni;
    state.selected = state.list[ni].id;
    renderModal(state.list[ni]);
  }

  /* 把 detail 里的【段落】解析成结构化块 */
  function parseSections(text) {
    if (!text) return [];
    var chunks = String(text).split(/(?=【[^】]{1,12}】)/).map(function (s) { return s.trim(); }).filter(Boolean);
    return chunks.map(function (c) {
      var m = c.match(/^【([^】]{1,12})】\s*([\s\S]*)$/);
      return m ? { title: m[1], text: m[2].trim() } : { title: '', text: c };
    }).filter(function (s) { return s.text; });
  }
  function splitSents(t) {
    return String(t).replace(/([。！？；])/g, '$1\u0001').split('\u0001')
      .map(function (s) { return s.trim(); }).filter(Boolean);
  }
  var ZHI_RE = /脂批|脂砚|畸笏|批者|批语/;
  function extractZhi(sections) {
    var out = [], seen = {};
    sections.forEach(function (s) {
      if (s.title === '脂批' || s.title === '脂评') { out.push(s.text); return; }
      splitSents(s.text).forEach(function (sent) { if (ZHI_RE.test(sent)) out.push(sent); });
    });
    return out.filter(function (t) { if (seen[t]) return false; seen[t] = 1; return true; });
  }

  function renderModal(it) {
    var rels = relationsOf(it.id);
    var people = [], events = [], others = [];
    rels.forEach(function (r) {
      if (r.other.cat === 'people') people.push(r);
      else if (r.other.cat === 'event') events.push(r);
      else others.push(r);
    });

    var f = famById[it.family];
    var aliasText = it.alias ? (it.cat === 'people' ? '号 ' + it.alias : it.alias) : '';
    var sub = [f ? f.name : '', it.role, aliasText].filter(Boolean).join(' · ');

    var html = '<div class="m-eyebrow">' + esc(catName(it.cat)) + (it.type ? ' · ' + esc(it.type) : '') + '</div>' +
      '<h2>' + esc(it.name) + '</h2>' +
      (sub ? '<div class="m-sub">' + esc(sub) + '</div>' : '') +
      '<div class="m-tags">' + (it.familyName ? '<span class="tag f">' + esc(it.familyName) + '</span>' : '') +
      (it.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      (it.quote ? '<div class="m-quote">' + esc(it.quote) + '</div>' : '');

    // 简介
    if (it.summary) html += '<div class="m-lead">' + esc(it.summary) + '</div>';

    // 详情按【段落】拆分：谶语 / 脂评 / 结局 单独成块
    var sections = parseSections(it.detail || '');
    var fateSecs = [], endSecs = [], rest = [];
    sections.forEach(function (s) {
      if (s.title === '判词' || s.title === '谶语') fateSecs.push(s.text);
      else if (s.title === '结局') endSecs.push(s.text);
      else if (s.title === '脂批' || s.title === '脂评') return;
      else rest.push(s);
    });
    var zhi = extractZhi(sections);
    if (it.zhipi) {
      var z0 = String(it.zhipi).trim();
      if (z0 && zhi.indexOf(z0) < 0) zhi.unshift(z0);
    }
    var fates = FATE_MAP[it.id] || [];
    if (fates.length) others = others.filter(function (r) { return r.other.cat !== 'fate'; });

    if (it.cat === 'people' && (fateSecs.length || fates.length)) {
      html += '<div class="m-sec m-block m-fate"><h3>谶语 · 判词</h3>';
      fates.forEach(function (ft) { if (ft.quote) html += '<div class="m-quote">' + esc(ft.quote) + '</div>'; });
      if (fateSecs.length) html += '<div class="m-detail">' + esc(fateSecs.join('\n')) + '</div>';
      fates.forEach(function (ft) { if (ft.detail) html += '<div class="m-detail">' + esc(ft.detail) + '</div>'; });
      if (fates.length) html += '<div class="m-rel"><div class="grp"><span class="lb">判词词条</span>' +
        fates.map(function (ft) { return '<button data-go="' + ft.id + '">' + esc(ft.name) + '</button>'; }).join('') +
        '</div></div>';
      html += '</div>';
    }
    if (zhi.length) {
      html += '<div class="m-sec m-block m-zhi"><h3>脂评 · 脂批</h3><div class="m-detail">' +
        esc(zhi.join('\n')) + '</div></div>';
    }
    var endText = (it.ending || '').trim() || endSecs.join('\n');
    if (endText) {
      html += '<div class="m-sec m-block m-end"><h3>结局</h3><div class="m-detail">' +
        esc(endText) + '</div></div>';
    }
    rest.forEach(function (s) {
      if (!s.title) { html += '<div class="m-detail">' + esc(s.text) + '</div>'; return; }
      html += '<div class="m-sec m-block"><h3>' + esc(s.title) + '</h3><div class="m-detail">' +
        esc(s.text) + '</div></div>';
    });

    if (it.refs && it.refs.length) {
      html += '<div class="m-sec m-refs-sec"><h3>参考与延伸</h3><ul class="m-refs">' +
        it.refs.map(function (r) { return '<li>' + refHTML(r) + '</li>'; }).join('') + '</ul></div>';
    }

    if (events.length) {
      var evTitle = it.cat === 'people' ? '关联事件' : '相关事件';
      var castN = events.filter(function (r) { return r.label !== '涉及'; }).length;
      html += '<div class="m-sec"><h3>' + evTitle + '（' + events.length + '）' +
        (it.cat === 'people' && events.length !== castN
          ? '<span class="sec-note">出场 ' + castN + ' · 涉及 ' + (events.length - castN) + '</span>' : '') +
        '</h3><div class="m-ev">' +
        events.sort(function (a, b) { return (a.other.seq || 0) - (b.other.seq || 0); })
          .map(function (r) {
            var kind = r.label === '涉及' ? '<em class="e-kind">涉及</em>' : '';
            return '<button data-go="' + r.other.id + '">' +
              '<span class="e-ch">' + esc(r.other.alias || '') + '</span>' +
              '<span>' + kind + esc(r.other.name) + ' — ' + esc(r.other.summary || '') + '</span></button>';
          }).join('') + '</div></div>';
    }

    if (people.length) {
      var byLabel = {};
      people.forEach(function (r) { var k = r.show || r.label; (byLabel[k] = byLabel[k] || []).push(r.other); });
      html += '<div class="m-sec"><h3>人物关系</h3><div class="m-rel">' +
        Object.keys(byLabel).map(function (lb) {
          return '<div class="grp"><span class="lb">' + esc(lb) + '</span>' +
            byLabel[lb].map(function (o) {
              return '<button data-go="' + o.id + '">' + esc(o.name) + '</button>';
            }).join('') + '</div>';
        }).join('') + '</div></div>';
    }

    if (others.length) {
      html += '<div class="m-sec"><h3>相关</h3><div class="m-rel"><div class="grp">' +
        others.map(function (r) {
          return '<button data-go="' + r.other.id + '">' + esc(catName(r.other.cat)) + ' · ' + esc(r.other.name) + '</button>';
        }).join('') + '</div></div></div>';
    }

    $('#modalBody').innerHTML = html;
    $$('#modalBody [data-go]').forEach(function (b) {
      b.addEventListener('click', function () { openItem(b.getAttribute('data-go')); });
    });
    $('#modalPrev').disabled = (state.idx || 0) <= 0;
    $('#modalNext').disabled = (state.idx || 0) >= state.list.length - 1;
  }

  /* ---------------- 检索 ---------------- */
  var pItems = [], pIdx = 0;
  function openPalette() {
    $('#palette').hidden = false;
    document.body.style.overflow = 'hidden';
    var inp = $('#paletteInput');
    inp.value = '';
    inp.focus();
    palSearch('');
  }
  function closePalette() { $('#palette').hidden = true; document.body.style.overflow = ''; }
  function palSearch(q) {
    q = q.trim().toLowerCase();
    var pool = D.items.filter(function (it) {
      if (!q) return it.cat === 'people' || it.cat === 'event';
      var hay = (it.name + ' ' + (it.alias || '') + ' ' + (it.summary || '') + ' ' + (it.tags || []).join(' ')).toLowerCase();
      return hay.indexOf(q) >= 0;
    });
    pItems = pool.slice(0, 40);
    pIdx = 0;
    if (!pItems.length) {
      $('#paletteResults').innerHTML = '<div class="palette-empty">未找到「' + esc(q) + '」</div>';
      return;
    }
    $('#paletteResults').innerHTML = pItems.map(function (it, i) {
      return '<div class="palette-item' + (i === 0 ? ' on' : '') + '" data-id="' + it.id + '">' +
        '<span class="pc">' + esc(catName(it.cat)) + '</span>' +
        '<span class="pn">' + esc(it.name) + '</span>' +
        '<span class="ps">' + esc(it.alias || it.summary || '') + '</span></div>';
    }).join('');
    $$('#paletteResults .palette-item').forEach(function (el) {
      el.addEventListener('click', function () { closePalette(); openItem(el.getAttribute('data-id')); });
    });
  }
  function palMove(d) {
    if (!pItems.length) return;
    pIdx = Math.max(0, Math.min(pItems.length - 1, pIdx + d));
    $$('#paletteResults .palette-item').forEach(function (el, i) { el.classList.toggle('on', i === pIdx); });
    var cur = $$('#paletteResults .palette-item')[pIdx];
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  /* ---------------- 初始化 ---------------- */
  // 本地服务用 /api/bootstrap；静态托管（GitHub Pages）回退到 /api/bootstrap.json
  function fetchJson(urls) {
    var i = 0;
    function next() {
      if (i >= urls.length) return Promise.reject(new Error('数据文件缺失'));
      return fetch(urls[i++], { cache: 'no-store' }).then(function (r) {
        if (!r.ok) return next();
        return r.json();
      }).catch(next);
    }
    return next();
  }

  function bindChrome() {
    $('.menu-toggle').addEventListener('click', function () { $('#mainnav').classList.toggle('open'); });
    $('#searchBtn').addEventListener('click', openPalette);
    $('#paletteInput').addEventListener('input', function (e) { palSearch(e.target.value); });
    $('#palette').addEventListener('click', function (e) { if (e.target.id === 'palette') closePalette(); });
    $('#modalClose').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
    $('#modalPrev').addEventListener('click', function () { step(-1); });
    $('#modalNext').addEventListener('click', function () { step(1); });

    $$('#lgZoom [data-lgzoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var sc = $('#lgScroll');
        var ratio = sc && sc.scrollWidth ? sc.scrollLeft / sc.scrollWidth : 0;
        var m = b.getAttribute('data-lgzoom');
        if (m === 'in') { state.lgZoom = Math.min(2.6, state.lgZoom * 1.2); state.lgZoomManual = true; }
        else if (m === 'out') { state.lgZoom = Math.max(0.3, state.lgZoom / 1.2); state.lgZoomManual = true; }
        else { state.lgZoom = 1; state.lgZoomManual = false; }
        syncLgZoom();
        requestAnimationFrame(function () {
          if (sc) sc.scrollLeft = ratio * sc.scrollWidth;
        });
      });
    });

    $$('.seg-btn[data-gfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.gfilter = b.getAttribute('data-gfilter');
        $$('.seg-btn[data-gfilter]').forEach(function (x) { x.classList.toggle('on', x === b); });
        gState.laid = false; gState.pos = {}; gState.sel = null;
        clearEdgeSel();
        renderGraph();
      });
    });
    // ---------------- 图谱搜索：输入人名，回车直接定位到点位 ----------------
    var gsInput = $('#gSearch');
    if (gsInput && !gsInput.dataset.bound) {
      gsInput.dataset.bound = '1';
      var gsList = $('#gSearchList'), gsClear = $('#gSearchClear');
      var gsHits = [], gsActive = -1;

      var closeGsList = function () {
        if (gsList) gsList.hidden = true;
        gsActive = -1;
      };

      var paintGsList = function () {
        if (!gsList) return;
        $$('button', gsList).forEach(function (b, i) {
          b.classList.toggle('on', i === gsActive);
        });
      };

      var renderGsList = function () {
        var q = gsInput.value.trim();
        if (gsClear) gsClear.hidden = !q;
        if (!q) { closeGsList(); return; }
        var pool = itemsOf('people').concat(state.showEvents ? itemsOf('event') : []);
        gsHits = pool.filter(function (it) {
          return it.name.indexOf(q) >= 0 || (it.alias && it.alias.indexOf(q) >= 0);
        });
        // 前缀命中、名字短的排前面
        gsHits.sort(function (a, b) {
          var pa = a.name.indexOf(q) === 0 ? 0 : 1, pb = b.name.indexOf(q) === 0 ? 0 : 1;
          return pa - pb || a.name.length - b.name.length;
        });
        gsHits = gsHits.slice(0, 8);
        gsActive = gsHits.length ? 0 : -1;
        if (!gsList) return;
        gsList.innerHTML = gsHits.length
          ? gsHits.map(function (it, i) {
              return '<button role="option" data-id="' + it.id + '"' + (i === 0 ? ' class="on"' : '') + '>' +
                '<span class="gs-name">' + esc(it.name) + '</span>' +
                '<span class="gs-meta">' + esc(it.familyName || it.role || catName(it.cat)) + '</span></button>';
            }).join('')
          : '<div class="gs-none">没有找到「' + esc(q) + '」</div>';
        gsList.hidden = false;
      };

      var pickGs = function (id, name) {
        if (!id) return;
        gsInput.value = name || '';
        if (gsClear) gsClear.hidden = false;
        closeGsList();
        focusGraphNode(id);
      };

      gsInput.addEventListener('input', renderGsList);
      gsInput.addEventListener('focus', function () { if (gsInput.value.trim()) renderGsList(); });
      gsInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeGsList(); gsInput.blur(); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (!gsHits.length) return;
          e.preventDefault();
          gsActive = (gsActive + (e.key === 'ArrowDown' ? 1 : gsHits.length - 1)) % gsHits.length;
          paintGsList();
          return;
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          var it = gsHits[gsActive] || gsHits[0];
          if (it) pickGs(it.id, it.name);
        }
      });
      if (gsList) {
        gsList.addEventListener('click', function (e) {
          var b = e.target.closest('button[data-id]');
          if (!b) return;
          pickGs(b.getAttribute('data-id'), $('.gs-name', b) ? $('.gs-name', b).textContent : '');
        });
      }
      if (gsClear) {
        gsClear.addEventListener('click', function () {
          gsInput.value = '';
          gsClear.hidden = true;
          closeGsList();
          gsInput.focus();
        });
      }
      document.addEventListener('click', function (e) {
        if (!$('#gSearchWrap') || $('#gSearchWrap').contains(e.target)) return;
        closeGsList();
      });
    }

    var crossToggle = $('#crossToggle');
    if (crossToggle && !crossToggle.dataset.bound) {
      crossToggle.dataset.bound = '1';
      crossToggle.addEventListener('click', function () {
        var on = document.body.classList.toggle('cross-on');
        crossToggle.classList.toggle('on', on);
        crossToggle.textContent = on ? '隐藏跨族连线' : '显示跨族连线';
      });
    }
    var fsToggle = $('#fsToggle');
    if (fsToggle && !fsToggle.dataset.bound) {
      fsToggle.dataset.bound = '1';
      fsToggle.addEventListener('click', toggleGraphFs);
    }
    var fsExit = $('#fsExit');
    if (fsExit && !fsExit.dataset.bound) {
      fsExit.dataset.bound = '1';
      fsExit.addEventListener('click', function () { setGraphFs(false); });
    }
    $$('#gViewSeg [data-gview]').forEach(function (b) {
      if (b.dataset.bound) return;
      b.dataset.bound = '1';
      b.addEventListener('click', function () { setGraphView(b.getAttribute('data-gview')); });
    });
    var gs = $('#gListSearch');
    if (gs && !gs.dataset.bound) {
      gs.dataset.bound = '1';
      gs.addEventListener('input', function (e) { state.gq = e.target.value; renderGraphList(); });
    }
    var evToggle = $('#evToggle');
    if (evToggle) evToggle.addEventListener('click', function () {
      state.showEvents = !state.showEvents;
      evToggle.classList.toggle('on', state.showEvents);
      evToggle.textContent = state.showEvents ? '隐藏事件节点' : '显示事件节点';
      gState.laid = false; gState.pos = {}; gState.sel = null;
      clearEdgeSel();
      renderGraph();
    });

    document.addEventListener('keydown', function (e) {
      var meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#palette').hidden ? openPalette() : closePalette(); return; }
      if (e.key === 'Escape') {
        if (!$('#modal').hidden) return closeModal();
        if (!$('#palette').hidden) return closePalette();
        var ep = $('#gEdgePanel');
        if (ep && !ep.hidden) return clearEdgeSel();
        if (isGraphFs()) return setGraphFs(false);
      }
      if ((e.key === 'f' || e.key === 'F') && state.view === 'graph' &&
          document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        toggleGraphFs();
      }
      if (!$('#palette').hidden) {
        if (e.key === 'ArrowDown') { e.preventDefault(); palMove(1); }
        if (e.key === 'ArrowUp') { e.preventDefault(); palMove(-1); }
        if (e.key === 'Enter' && pItems[pIdx]) { var id = pItems[pIdx].id; closePalette(); openItem(id); }
        return;
      }
      if (!$('#modal').hidden) {
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      }
    });
    window.addEventListener('hashchange', route);
    window.addEventListener('resize', function () {
      if (document.body.classList.contains('graph-fs')) {
        if (FS_VIEWBOX) fitSvgToStage(true); // 窗口变化后重新铺满
        positionEdgePanel();
      }
    });
  }

  fetchJson(['api/bootstrap', 'api/bootstrap.json'])
    .then(function (data) { return data; })
    .then(function (data) {
      D = data;
      D.items.forEach(function (it) { byId[it.id] = it; });
      D.families.forEach(function (f) { famById[f.id] = f; });
      buildEventMap();
      buildFateMap();
      var webCount = D.items.filter(function (it) {
        return (it.refs || []).some(function (r) { return r && typeof r === 'object' && r.url; });
      }).length;
      var cnt = {};
      D.items.forEach(function (i) { cnt[i.cat] = (cnt[i.cat] || 0) + 1; });
      $('#footerCount').textContent = '人物 ' + (cnt.people || 0) + ' · 事件 ' + (cnt.event || 0) +
        ' · 判词 ' + (cnt.fate || 0) + ' · 诗词 ' + (cnt.poetry || 0) + ' · 地点 ' + (cnt.place || 0) +
        ' · 关系 ' + D.relations.length + ' · 外链 ' + webCount;
      bindChrome();
      setGraphView(state.gview);
      route();
    })
    .catch(function (err) {
      document.body.insertAdjacentHTML('beforeend',
        '<div style="max-width:620px;margin:16vh auto;padding:30px;border:1px solid #c0b195;border-left:4px solid #8c1f28;' +
        'background:#f6f1e6;font-size:13px;line-height:1.9">' +
        '<b>数据加载失败</b><p>' + esc(err.message) + '</p>' +
        '<pre style="background:#1b1815;color:#f3ead6;padding:12px;border-radius:3px">python3 db/init_db.py\npython3 server/app.py</pre>' +
        '<p>然后用 <b>http://127.0.0.1:8600</b> 打开，不要双击 index.html。</p></div>');
    });
})();