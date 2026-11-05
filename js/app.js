/* 红楼梦图谱 — 前端（零依赖） */
(function () {
  'use strict';

  var D = null, byId = {}, famById = {}, state = {
    view: 'lineage', geo: 'rong', gfilter: 'all', family: 'all', role: 'all',
    q: '', selected: null, list: []
  };
  var G = { W: 1500, H: 980, pad: 50 };
  var gState = { nodes: [], edges: [], nodeMap: {}, pos: {}, laid: false, zoom: 1, tx: 0, ty: 0, hover: null, sel: null };
  var CAT = { people: '人物', event: '事件', fate: '判词', poetry: '诗词', place: '地点', chapter: '回目' };
  var KIN = ['父子', '父女', '母子', '母女', '兄弟', '兄妹', '姐妹', '姐弟', '祖孙', '外祖母', '曾祖母',
    '姑祖母', '夫妻', '妾室', '嫡母', '养父女', '堂兄弟', '姑嫂', '姨甥', '叔侄', '姑侄', '未婚夫妻'];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }
  function catName(c) { return CAT[c] || c; }
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
    var set = {};
    g.forEach(function (x) { set[x.id] = x; });

    var NW = 82, NH = 34, SP = 44, ROW = 104, L = 64, T = 50, GAP = 18;
    var SW = NW - 8;
    var children = {};
    g.forEach(function (x) {
      if (x.parent && set[x.parent]) (children[x.parent] = children[x.parent] || []).push(x.id);
    });
    var roots = g.filter(function (x) { return !x.parent || !set[x.parent]; }).map(function (x) { return x.id; });

    var cursor = 0, pos = {};
    function walk(id) {
      var kids = children[id] || [];
      if (!kids.length) { pos[id] = cursor++; return pos[id]; }
      var xs = kids.map(walk);
      pos[id] = (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2;
      return pos[id];
    }
    roots.forEach(walk);

    var slotW = NW + SP + SW + GAP;
    var maxGen = Math.max.apply(null, g.map(function (x) { return x.gen; }));
    var W = (cursor || 1) * slotW + L + 40;
    var H = T + maxGen * ROW + 30;
    var svg = $('#lgSvg');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');

    var parts = [];
    // 世代底纹与标签
    for (var gi = 1; gi <= maxGen; gi++) {
      var y = T + (gi - 1) * ROW - NH / 2 - 10;
      parts.push('<rect class="lg-band" x="0" y="' + y + '" width="' + W + '" height="' + ROW + '"/>');
      parts.push('<text class="lg-gen-label" x="18" y="' + (y + ROW / 2 + 4) + '">' + ['一', '二', '三', '四', '五', '六', '七'][gi - 1] + '代</text>');
    }

    // 连接线
    g.forEach(function (x) {
      if (!x.parent || !set[x.parent]) return;
      var p = set[x.parent], px = L + pos[x.parent] * slotW + NW / 2;
      var cx = L + pos[x.id] * slotW + NW / 2;
      var py = T + (p.gen - 1) * ROW + NH / 2 + 6;
      var cy = T + (x.gen - 1) * ROW - NH / 2 - 6;
      var midY = (py + cy) / 2;
      parts.push('<path class="lg-link" d="M' + px + ',' + py + ' L' + px + ',' + midY +
        ' L' + cx + ',' + midY + ' L' + cx + ',' + cy + '"/>');
    });

    // 节点 + 配偶
    g.forEach(function (x) {
      var it = byId[x.id];
      if (!it) return;
      var bx = L + pos[x.id] * slotW, by = T + (x.gen - 1) * ROW;
      parts.push(nodeSVG(it, bx, by, NW, NH, false, x));
      if (x.spouse && byId[x.spouse]) {
        var sp = byId[x.spouse];
        parts.push('<path class="lg-marriage" d="M' + (bx + NW) + ',' + (by + NH / 2) + ' L' + (bx + NW + SP) + ',' + (by + NH / 2) + '"/>');
        parts.push(nodeSVG(sp, bx + NW + SP, by, NW - 6, NH, true, null));
      }
    });

    svg.innerHTML = parts.join('');
    $$('.lg-node', svg).forEach(function (el) {
      el.addEventListener('click', function () { openItem(el.getAttribute('data-id')); });
    });
    $('#lgNote').textContent = (D.genealogyNotes || {})[state.geo] || '';
    // 小屏时谱系宽度大于容器，首次渲染把根节点滚到视野中间
    var sc0 = $('#lgScroll');
    var centerRoot = function () {
      if (!sc0 || !roots.length) return;
      var realW = svg.getBoundingClientRect().width || W;
      sc0.scrollLeft = (L + (pos[roots[0]] || 0) * slotW + NW / 2) * (realW / W) - sc0.clientWidth / 2;
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

  function nodeSVG(it, x, y, w, h, isSpouse, g) {
    var color = famById[it.family] ? famById[it.family].color : '#8a8073';
    var name = it.name.length > 6 ? it.name.slice(0, 6) : it.name;
    var sub = it.alias ? String(it.alias).split('、')[0] : (it.role || '');
    if (sub.length > 7) sub = sub.slice(0, 7);
    return '<g class="lg-node' + (isSpouse ? ' spouse' : '') + '" data-id="' + esc(it.id) + '" tabindex="0" role="button">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" stroke="' + color + '"/>' +
      '<text class="lg-name" x="' + (x + w / 2) + '" y="' + (y + h / 2 + (sub ? -2 : 4)) + '">' + esc(name) + '</text>' +
      (sub ? '<text class="lg-sub" x="' + (x + w / 2) + '" y="' + (y + h - 7) + '">' + esc(sub) + '</text>' : '') +
      '</g>';
  }

  /* ---------------- 关系图 ---------------- */
  function famColor(it) {
    var f = famById[it.family];
    return f ? f.color : '#6b6458';
  }

  function relCat(label) {
    if (KIN.indexOf(label) >= 0) return 'kin';
    if (/主仆|大管家|老仆/.test(label)) return 'servant';
    if (/知己|夫妻|妾室|未婚|情/.test(label)) return 'love';
    if (/同人|同窗|友人|诗友|方外|旧交|盟友/.test(label)) return 'friend';
    return 'other';
  }

  function buildGraphModel() {
    var people = itemsOf('people');
    var ids = {};
    people.forEach(function (p) { ids[p.id] = p; });

    var seen = {}, edges = [];
    D.relations.forEach(function (r) {
      if (!ids[r.a] || !ids[r.b]) return;
      var key = r.a < r.b ? r.a + '|' + r.b + '|' + r.label : r.b + '|' + r.a + '|' + r.label;
      if (seen[key]) return;
      seen[key] = 1;
      if (state.gfilter !== 'all' && relCat(r.label) !== state.gfilter) return;
      edges.push({ a: r.a, b: r.b, label: r.label });
    });

    var deg = {};
    edges.forEach(function (e) { deg[e.a] = (deg[e.a] || 0) + 1; deg[e.b] = (deg[e.b] || 0) + 1; });
    var nodes = Object.keys(deg).map(function (id, i) {
      return { id: id, item: ids[id], deg: deg[id], i: i, x: 0, y: 0, vx: 0, vy: 0 };
    });
    return { nodes: nodes, edges: edges, edgesAll: edges.length, total: people.length };
  }

  function layout(model) {
    var nodes = model.nodes, edges = model.edges, n = nodes.length;
    if (!n) return;
    var cx = G.W / 2, cy = G.H / 2;

    var anchors = {}, keys = [];
    nodes.forEach(function (nd) {
      var f = nd.item.family || 'other';
      if (keys.indexOf(f) < 0) keys.push(f);
    });
    var R = Math.min(G.W, G.H) * 0.35;
    keys.forEach(function (k, i) {
      var a = (i / keys.length) * Math.PI * 2 - Math.PI / 2;
      anchors[k] = { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R };
    });

    nodes.forEach(function (nd, i) {
      var an = anchors[nd.item.family || 'other'];
      var a = i * 2.399963229728653, rr = 40 + (i % 9) * 6;
      nd.x = an.x + Math.cos(a) * rr;
      nd.y = an.y + Math.sin(a) * rr;
      nd.ax = an.x; nd.ay = an.y;
    });

    var m = {}, links = [];
    nodes.forEach(function (nd) { m[nd.id] = nd; });
    edges.forEach(function (e) { if (m[e.a] && m[e.b]) links.push({ s: m[e.a], t: m[e.b] }); });

    var alpha = 1, decay = 0.972, iters = 460;
    var repulse = 3400, springK = 0.06, springLen = 62, anchorK = 0.085, centerK = 0.012;

    for (var it = 0; it < iters; it++) {
      alpha *= decay;
      for (var i = 0; i < n; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < n; j++) {
          var b = nodes[j];
          var dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
          if (d2 < 4) { d2 = 4; dx = (i % 7 - 3) * .4; dy = (j % 7 - 3) * .4; }
          if (d2 > 160000) continue;
          var f = repulse * alpha / d2, d = Math.sqrt(d2);
          var fx = dx / d * f, fy = dy / d * f;
          a.vx -= fx; a.vy -= fy; b.vx += fx; b.vy += fy;
        }
      }
      links.forEach(function (l) {
        var dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var f = (d - springLen) * springK * alpha;
        var fx = dx / d * f, fy = dy / d * f;
        l.s.vx += fx; l.s.vy += fy; l.t.vx -= fx; l.t.vy -= fy;
      });
      nodes.forEach(function (nd) {
        nd.vx += (nd.ax - nd.x) * anchorK * alpha;
        nd.vy += (nd.ay - nd.y) * anchorK * alpha;
        nd.vx += (cx - nd.x) * centerK * alpha;
        nd.vy += (cy - nd.y) * centerK * alpha;
        nd.vx *= 0.8; nd.vy *= 0.8;
        nd.x += nd.vx; nd.y += nd.vy;
        nd.x = Math.max(G.pad, Math.min(G.W - G.pad, nd.x));
        nd.y = Math.max(G.pad, Math.min(G.H - G.pad, nd.y));
      });
    }

    // 居中归一化
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    nodes.forEach(function (nd) {
      minX = Math.min(minX, nd.x); maxX = Math.max(maxX, nd.x);
      minY = Math.min(minY, nd.y); maxY = Math.max(maxY, nd.y);
    });
    var w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY);
    var k = Math.min((G.W - G.pad * 2) / w, (G.H - G.pad * 2) / h, 1.2);
    var ox = (G.W - w * k) / 2 - minX * k, oy = (G.H - h * k) / 2 - minY * k;
    nodes.forEach(function (nd) { nd.x = nd.x * k + ox; nd.y = nd.y * k + oy; });
  }

  function renderGraph() {
    var model = buildGraphModel();
    var svg = $('#gSvg');

    $('#gLegend').innerHTML = D.families.map(function (f) {
      return '<span><i style="background:' + f.color + '"></i>' + esc(f.name) + '</span>';
    }).join('');
    $('#gCount').textContent = model.nodes.length + ' 人 · ' + model.edges.length + ' 条关系（人物库 ' + model.total + '）';

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

    var parts = ['<g id="gViewport">'];
    model.edges.forEach(function (e) {
      var a = gState.nodeMap[e.a], b = gState.nodeMap[e.b];
      if (!a || !b) return;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      parts.push('<g class="g-edge-g" data-a="' + e.a + '" data-b="' + e.b + '">' +
        '<line class="g-edge" x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) +
        '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"/>' +
        '<text class="g-edge-label" x="' + mx.toFixed(1) + '" y="' + (my - 3).toFixed(1) + '" text-anchor="middle">' +
        esc(e.label) + '</text></g>');
    });
    model.nodes.forEach(function (nd) {
      var r = Math.min(9, 3.4 + Math.sqrt(nd.deg) * 1.8);
      parts.push('<g class="g-node' + (nd.deg < 3 ? ' minor' : '') + '" data-id="' + nd.id + '" tabindex="0" role="button">' +
        '<circle class="dot" cx="' + nd.x.toFixed(1) + '" cy="' + nd.y.toFixed(1) + '" r="' + r.toFixed(1) +
        '" fill="' + famColor(nd.item) + '"/>' +
        '<text class="g-label" x="' + (nd.x + r + 3).toFixed(1) + '" y="' + (nd.y + 3.2).toFixed(1) + '">' +
        esc(nd.item.name) + '</text></g>');
    });
    parts.push('</g>');
    svg.innerHTML = parts.join('');
    svg.setAttribute('viewBox', '0 0 ' + G.W + ' ' + G.H);
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
  }

  function applyTransform() {
    var vp = $('#gViewport');
    if (vp) vp.setAttribute('transform', 'translate(' + gState.tx + ',' + gState.ty + ') scale(' + gState.zoom + ')');
  }
  function syncZoom() {
    $('#gZoomLabel').textContent = Math.round(gState.zoom * 100) + '%';
  }
  function clampPan(v) { var lim = G.W * 0.5; return Math.max(-lim, Math.min(lim, v)); }

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
    $$('.g-edge-g').forEach(function (g) {
      var on = !!id && (g.getAttribute('data-a') === id || g.getAttribute('data-b') === id);
      g.classList.toggle('show', on);
      g.querySelector('.g-edge').classList.toggle('hl', on);
      g.querySelector('.g-edge').classList.toggle('dim', !!id && !on);
    });
    var tip = $('#gTip');
    if (id && gState.nodeMap[id]) {
      tip.innerHTML = '<b>' + esc(gState.nodeMap[id].item.name) + '</b>' +
        esc((gState.nodeMap[id].item.alias || gState.nodeMap[id].item.role || ''));
      tip.hidden = false;
    } else tip.hidden = true;
  }

  function bindGraph() {
    $$('.g-node').forEach(function (g) {
      var id = g.getAttribute('data-id');
      g.addEventListener('mouseenter', function () { gState.hover = id; highlight(id); });
      g.addEventListener('mouseleave', function () { gState.hover = null; highlight(gState.sel); });
      g.addEventListener('click', function (e) { e.stopPropagation(); gState.sel = id; highlight(id); openItem(id); });
    });

    var stage = $('#gStage');
    if (stage.dataset.bound) return;
    stage.dataset.bound = '1';

    $$('#gZoom [data-zoom]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-zoom');
        if (m === 'in') gState.zoom = Math.min(3, gState.zoom * 1.2);
        else if (m === 'out') gState.zoom = Math.max(0.5, gState.zoom / 1.2);
        else { gState.zoom = 1; gState.tx = 0; gState.ty = 0; }
        applyTransform(); syncZoom();
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
        '<div class="pmeta">' + esc([f ? f.name : '', p.role].filter(Boolean).join(' · ')) + '</div>' +
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
  function relationsOf(id) {
    var out = [];
    D.relations.forEach(function (r) {
      if (r.a === id && byId[r.b]) out.push({ other: byId[r.b], label: r.label, dir: 'out' });
      else if (r.b === id && byId[r.a]) out.push({ other: byId[r.a], label: r.label, dir: 'in' });
    });
    return out;
  }

  function openItem(id) {
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
    document.body.style.overflow = '';
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

  function renderModal(it) {
    var rels = relationsOf(it.id);
    var groups = {};
    rels.forEach(function (r) {
      if (r.other.cat !== 'people' && r.other.cat !== 'event' && r.other.cat !== 'fate' &&
          r.other.cat !== 'poetry' && r.other.cat !== 'place') return;
      var key = r.label;
      (groups[key] = groups[key] || []).push(r.other);
    });

    var people = [], events = [], others = [];
    rels.forEach(function (r) {
      if (r.other.cat === 'people') people.push(r);
      else if (r.other.cat === 'event') events.push(r);
      else others.push(r);
    });

    var f = famById[it.family];
    var sub = [f ? f.name : '', it.role, it.alias ? '号 ' + it.alias : ''].filter(Boolean).join(' · ');

    var html = '<div class="m-eyebrow">' + esc(catName(it.cat)) + (it.type ? ' · ' + esc(it.type) : '') + '</div>' +
      '<h2>' + esc(it.name) + '</h2>' +
      (sub ? '<div class="m-sub">' + esc(sub) + '</div>' : '') +
      '<div class="m-tags">' + (it.familyName ? '<span class="tag f">' + esc(it.familyName) + '</span>' : '') +
      (it.tags || []).map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' +
      '<div class="m-detail">' + esc(it.summary || '') + (it.detail ? '\n\n' + esc(it.detail) : '') + '</div>' +
      (it.quote ? '<div class="m-quote">' + esc(it.quote) + '</div>' : '') +
      ((it.refs && it.refs.length) ? '<div class="m-sec m-refs-sec"><h3>参考与延伸</h3><ul class="m-refs">' +
        it.refs.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join('') + '</ul></div>' : '');

    if (events.length) {
      html += '<div class="m-sec"><h3>出场事件（' + events.length + '）</h3><div class="m-ev">' +
        events.sort(function (a, b) { return (a.other.seq || 0) - (b.other.seq || 0); })
          .map(function (r) {
            return '<button data-go="' + r.other.id + '">' +
              '<span class="e-ch">' + esc(r.other.alias || '') + '</span>' +
              '<span>' + esc(r.other.name) + ' — ' + esc(r.other.summary || '') + '</span></button>';
          }).join('') + '</div></div>';
    }

    if (people.length) {
      var byLabel = {};
      people.forEach(function (r) { (byLabel[r.label] = byLabel[r.label] || []).push(r.other); });
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
  function bindChrome() {
    $('.menu-toggle').addEventListener('click', function () { $('#mainnav').classList.toggle('open'); });
    $('#searchBtn').addEventListener('click', openPalette);
    $('#paletteInput').addEventListener('input', function (e) { palSearch(e.target.value); });
    $('#palette').addEventListener('click', function (e) { if (e.target.id === 'palette') closePalette(); });
    $('#modalClose').addEventListener('click', closeModal);
    $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
    $('#modalPrev').addEventListener('click', function () { step(-1); });
    $('#modalNext').addEventListener('click', function () { step(1); });

    $$('.seg-btn[data-gfilter]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.gfilter = b.getAttribute('data-gfilter');
        $$('.seg-btn[data-gfilter]').forEach(function (x) { x.classList.toggle('on', x === b); });
        gState.laid = false; gState.pos = {}; gState.sel = null;
        renderGraph();
      });
    });

    document.addEventListener('keydown', function (e) {
      var meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === 'k') { e.preventDefault(); $('#palette').hidden ? openPalette() : closePalette(); return; }
      if (e.key === 'Escape') {
        if (!$('#modal').hidden) return closeModal();
        if (!$('#palette').hidden) return closePalette();
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
  }

  fetch('api/bootstrap', { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      D = data;
      D.items.forEach(function (it) { byId[it.id] = it; });
      D.families.forEach(function (f) { famById[f.id] = f; });
      var refCount = D.items.filter(function (it) { return it.refs && it.refs.length; }).length;
      var cnt = {};
      D.items.forEach(function (i) { cnt[i.cat] = (cnt[i.cat] || 0) + 1; });
      $('#footerCount').textContent = '人物 ' + (cnt.people || 0) + ' · 事件 ' + (cnt.event || 0) +
        ' · 判词 ' + (cnt.fate || 0) + ' · 诗词 ' + (cnt.poetry || 0) + ' · 地点 ' + (cnt.place || 0) +
        ' · 关系 ' + D.relations.length;
      bindChrome();
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