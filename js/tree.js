// tree.js — Auto-layout family tree renderer
// Works for any family defined in data.js — no hardcoded positions.
// ─────────────────────────────────────────────────────────────────────────────

const FamilyTree = (() => {

  // ── Layout constants ───────────────────────────────────────────────────────
  const CFG = {
    nodeR:        40,   // circle radius
    coupleGap:    130,  // x-distance between two spouses
    leafGap:      160,  // x-distance between leaf (non-coupled) siblings
    unitPad:      30,   // horizontal gap between adjacent child units
    genHeight:    195,  // vertical distance between generation rows
    startY:       108,  // y centre of generation 1
    canvasPad:    70,   // padding around the whole tree
    labelOffset:  30,   // x from canvas left edge for gen labels
  };

  let svgEl, rootG;
  let viewW = 0, viewH = 0;
  let offsetX = 0, offsetY = 0;   // shift from virtual→canvas coords
  let scale = 1, panX = 0, panY = 0;
  let isDragging = false, dragStart = {};

  // ── SVG element factory ────────────────────────────────────────────────────
  function el(tag, attrs = {}) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }
  function txt(content, attrs = {}) {
    const t = el('text', attrs);
    t.textContent = content;
    return t;
  }

  // ── Build lookup maps from data.js globals ─────────────────────────────────
  function buildMaps() {
    const byPersonId  = Object.fromEntries(PEOPLE.map(p => [p.id, p]));
    const byCoupleId  = Object.fromEntries(COUPLES.map(c => [c.id, c]));

    // coupleId → [childIds] (preserves PARENT_CHILD order → left-to-right visual order)
    const coupleToChildren = {};
    COUPLES.forEach(c => { coupleToChildren[c.id] = []; });
    PARENT_CHILD.forEach(({ parentCoupleId, childId }) => {
      (coupleToChildren[parentCoupleId] ??= []).push(childId);
    });

    // personId → coupleId they are a SPOUSE in
    const personToSpouseCouple = {};
    COUPLES.forEach(c => {
      personToSpouseCouple[c.person1Id] = c.id;
      personToSpouseCouple[c.person2Id] = c.id;
    });

    // personId → parentCoupleId
    const personToParentCouple = {};
    PARENT_CHILD.forEach(({ parentCoupleId, childId }) => {
      personToParentCouple[childId] = parentCoupleId;
    });

    // Root couples: neither spouse has a parent couple in this tree
    const rootCouples = COUPLES
      .filter(c =>
        !personToParentCouple[c.person1Id] &&
        !personToParentCouple[c.person2Id]
      )
      .map(c => c.id);

    return { byPersonId, byCoupleId, coupleToChildren, personToSpouseCouple, personToParentCouple, rootCouples };
  }

  // ── Bottom-up: compute natural span of each couple subtree ─────────────────
  // Span = the horizontal width a subtree needs to lay out without overlapping.
  function computeSpans(maps) {
    const { coupleToChildren, personToSpouseCouple } = maps;
    const spans = {};

    function getSpan(coupleId) {
      if (spans[coupleId] !== undefined) return spans[coupleId];

      const children = coupleToChildren[coupleId] || [];
      if (children.length === 0) {
        spans[coupleId] = CFG.coupleGap;
        return spans[coupleId];
      }

      // Partition children into: those who have their own couple, and plain leaf nodes
      const childCoupleIds = uniqueOrdered(
        children.map(cid => personToSpouseCouple[cid]).filter(Boolean)
      );
      const leafChildren = children.filter(cid => !personToSpouseCouple[cid]);

      const unitCount = childCoupleIds.length + leafChildren.length;
      let total = 0;
      childCoupleIds.forEach(ccId => { total += getSpan(ccId); });
      total += leafChildren.length * CFG.leafGap;
      total += (unitCount - 1) * CFG.unitPad;

      spans[coupleId] = Math.max(CFG.coupleGap, total);
      return spans[coupleId];
    }

    // Ensure all couples get a span (handles couples not reachable from roots)
    COUPLES.forEach(c => getSpan(c.id));
    return spans;
  }

  // ── Top-down: assign x,y to every person ──────────────────────────────────
  function placeAll(maps, spans) {
    const { coupleToChildren, personToSpouseCouple } = maps;
    const positions     = {};  // personId  → { x, y }  (virtual coords, root centred at x=0)
    const coupleCentres = {};  // coupleId  → { x, y }

    function place(coupleId, centreX, gen) {
      const couple = COUPLES.find(c => c.id === coupleId);
      if (!couple) return;

      const y  = CFG.startY + (gen - 1) * CFG.genHeight;
      const x1 = centreX - CFG.coupleGap / 2;
      const x2 = centreX + CFG.coupleGap / 2;

      positions[couple.person1Id] = { x: x1, y };
      positions[couple.person2Id] = { x: x2, y };
      coupleCentres[coupleId]     = { x: centreX, y };

      const children = coupleToChildren[coupleId] || [];
      if (!children.length) return;

      const childCoupleIds = uniqueOrdered(
        children.map(cid => personToSpouseCouple[cid]).filter(Boolean)
      );
      const leafChildren = children.filter(cid => !personToSpouseCouple[cid]);

      // Build ordered child units (couples first in PARENT_CHILD order, then leaves)
      const units = [
        ...childCoupleIds.map(cid => ({ type: 'couple', id: cid, span: spans[cid] })),
        ...leafChildren.map(cid   => ({ type: 'leaf',   id: cid, span: CFG.leafGap  })),
      ];

      const totalSpan = units.reduce((s, u) => s + u.span, 0)
        + (units.length - 1) * CFG.unitPad;

      let x = centreX - totalSpan / 2;
      const childGen = gen + 1;
      const childY   = CFG.startY + (childGen - 1) * CFG.genHeight;

      units.forEach(unit => {
        const cx = x + unit.span / 2;
        if (unit.type === 'couple') {
          place(unit.id, cx, childGen);
        } else {
          positions[unit.id] = { x: cx, y: childY };
        }
        x += unit.span + CFG.unitPad;
      });
    }

    // Place root couples side-by-side centred at x=0
    const { rootCouples } = maps;
    const totalRootSpan = rootCouples.reduce((s, cid) => s + spans[cid], 0)
      + (rootCouples.length - 1) * CFG.unitPad;

    let rx = -totalRootSpan / 2;
    rootCouples.forEach(cid => {
      place(cid, rx + spans[cid] / 2, 1);
      rx += spans[cid] + CFG.unitPad;
    });

    // Fallback: position any unreached people (should be rare)
    PEOPLE.forEach(p => {
      if (!positions[p.id]) {
        const genY   = CFG.startY + (p.generation - 1) * CFG.genHeight;
        const genPosX = Object.entries(positions)
          .filter(([id]) => PEOPLE.find(pp => pp.id === id)?.generation === p.generation)
          .map(([, pos]) => pos.x);
        const fallbackX = genPosX.length ? Math.max(...genPosX) + CFG.leafGap : 0;
        positions[p.id] = { x: fallbackX, y: genY };
      }
    });

    return { positions, coupleCentres };
  }

  // ── Compute viewBox from positions ─────────────────────────────────────────
  function buildViewBox(positions) {
    const xs = Object.values(positions).map(p => p.x);
    const ys = Object.values(positions).map(p => p.y);
    const pad = CFG.canvasPad;

    const minX = Math.min(...xs) - CFG.nodeR - pad;
    const maxX = Math.max(...xs) + CFG.nodeR + pad;
    const minY = Math.min(...ys) - CFG.nodeR - 40;          // room for gen label above
    const maxY = Math.max(...ys) + CFG.nodeR + 68;          // room for name labels below

    viewW   = maxX - minX;
    viewH   = maxY - minY;
    offsetX = -minX;
    offsetY = -minY;
  }

  // ── Main init ──────────────────────────────────────────────────────────────
  function init(svgId) {
    svgEl = document.getElementById(svgId);

    const maps   = buildMaps();
    const spans  = computeSpans(maps);
    const { positions, coupleCentres } = placeAll(maps, spans);

    buildViewBox(positions);
    svgEl.setAttribute('viewBox',           `0 0 ${viewW} ${viewH}`);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.setAttribute('width',  '100%');
    svgEl.setAttribute('height', '100%');

    // Shift virtual coords to canvas coords
    const pos = {}; // personId → canvas {x,y}
    const cc  = {}; // coupleId → canvas {x,y}
    Object.entries(positions).forEach(([id, p]) =>
      { pos[id] = { x: p.x + offsetX, y: p.y + offsetY }; });
    Object.entries(coupleCentres).forEach(([id, p]) =>
      { cc[id]  = { x: p.x + offsetX, y: p.y + offsetY }; });

    rootG = el('g', { id: 'root-g' });
    svgEl.appendChild(rootG);

    render(pos, cc, maps);
    setupPanZoom();
    setupControls();
  }

  // ── Render all layers ──────────────────────────────────────────────────────
  function render(pos, cc, maps) {
    rootG.innerHTML = '';
    addDefs(pos);
    drawGenBands(pos);
    drawConnectors(pos, cc, maps);
    drawNodes(pos);
  }

  // ── <defs>: clip paths for circular photos ─────────────────────────────────
  function addDefs(pos) {
    const defs = el('defs');
    PEOPLE.forEach(p => {
      const cp = el('clipPath', { id: `clip-${p.id}` });
      cp.appendChild(el('circle', { cx: pos[p.id].x, cy: pos[p.id].y, r: CFG.nodeR }));
      defs.appendChild(cp);
    });
    svgEl.insertBefore(defs, rootG);
  }

  // ── Generation band labels + divider lines ─────────────────────────────────
  function drawGenBands(pos) {
    const g = el('g', { class: 'gen-bands' });

    // Find unique generations and their y positions
    const genYMap = {};
    PEOPLE.forEach(p => {
      const gen = p.generation;
      if (genYMap[gen] === undefined) genYMap[gen] = pos[p.id].y;
    });

    const romanNumerals = ['I','II','III','IV','V','VI'];
    const lx = CFG.labelOffset;

    Object.entries(genYMap).sort(([a],[b]) => a-b).forEach(([gen, y]) => {
      const labelY = y - CFG.nodeR - 18;

      // Divider line
      g.appendChild(el('line', {
        x1: lx, y1: labelY + 13,
        x2: viewW - lx, y2: labelY + 13,
        stroke: '#E8DFC8', 'stroke-width': '1',
      }));

      // Label
      g.appendChild(txt(`Generation ${romanNumerals[gen - 1] || gen}`, {
        x: lx, y: labelY + 10,
        fill: '#C9A457',
        'font-family': 'Inter, sans-serif',
        'font-size': '11', 'font-weight': '500',
        'letter-spacing': '0.08em', opacity: '0.8',
      }));
    });

    rootG.appendChild(g);
  }

  // ── Connectors: couple lines + parent→child branches ──────────────────────
  function drawConnectors(pos, cc, maps) {
    const { coupleToChildren, personToSpouseCouple } = maps;
    const g = el('g', { class: 'connectors' });

    // 1. Couple lines + marriage badges
    COUPLES.forEach(couple => {
      const p1 = pos[couple.person1Id];
      const p2 = pos[couple.person2Id];
      const mx = (p1.x + p2.x) / 2;
      const my = p1.y; // same y for both spouses

      g.appendChild(el('line', {
        x1: p1.x, y1: my, x2: p2.x, y2: my,
        stroke: '#C9A457', 'stroke-width': '1.5',
        'stroke-dasharray': '4 3', opacity: '0.65',
      }));

      if (couple.marriedYear) {
        const badge = el('g', { transform: `translate(${mx},${my - 14})` });
        badge.appendChild(el('rect', {
          x: -24, y: -9, width: 48, height: 17,
          rx: 8, fill: '#FAF7F0', stroke: '#E8DFC8', 'stroke-width': '1',
        }));
        badge.appendChild(txt(`m. ${couple.marriedYear}`, {
          'text-anchor': 'middle', dy: '0.35em',
          fill: '#8A7D60', 'font-family': 'Inter, sans-serif',
          'font-size': '9', 'font-style': 'italic',
        }));
        g.appendChild(badge);
      }
    });

    // 2. Parent→child branches — computed from PARENT_CHILD
    COUPLES.forEach(couple => {
      const children = coupleToChildren[couple.id] || [];
      if (!children.length) return;

      const parentCentre = cc[couple.id];

      // Resolve each child to a position: if they're in a couple, use that couple's centre; else use their own pos
      const childPositions = uniqueOrdered(children.map(cid => {
        const spouseCouple = personToSpouseCouple[cid];
        return spouseCouple
          ? { x: cc[spouseCouple].x, y: cc[spouseCouple].y, key: spouseCouple }
          : { x: pos[cid].x,          y: pos[cid].y,          key: cid };
      }), 'key');

      const childY  = childPositions[0].y;
      const branchY = parentCentre.y + (childY - parentCentre.y) * 0.5;

      const leftX  = Math.min(...childPositions.map(p => p.x));
      const rightX = Math.max(...childPositions.map(p => p.x));

      const segments = [
        // Drop from parent couple centre
        `M ${parentCentre.x} ${parentCentre.y + CFG.nodeR}`,
        `L ${parentCentre.x} ${branchY}`,
        // Horizontal branch across children
        `M ${leftX} ${branchY} L ${rightX} ${branchY}`,
        // Verticals down to each child
        ...childPositions.map(cp =>
          `M ${cp.x} ${branchY} L ${cp.x} ${cp.y - CFG.nodeR}`
        ),
      ];

      g.appendChild(el('path', {
        d: segments.join(' '), fill: 'none',
        stroke: '#C9A457', 'stroke-width': '1.5', opacity: '0.5',
      }));
    });

    rootG.appendChild(g);
  }

  // ── Person nodes ───────────────────────────────────────────────────────────
  function drawNodes(pos) {
    const g = el('g', { class: 'nodes' });
    const highlightId = SITE_CONFIG.highlightPersonId;

    PEOPLE.forEach(person => {
      const { x, y } = pos[person.id];
      const color  = FAMILY_COLORS[person.family] || '#C9A457';
      const isYou  = person.id === highlightId;
      const isDead = person.died !== null;

      const nodeG = el('g', {
        class:      `node${isYou ? ' node--highlight' : ''}${isDead ? ' node--deceased' : ''}`,
        'data-id':  person.id,
        transform:  `translate(${x},${y})`,
      });
      nodeG.style.cursor = 'pointer';

      // Hover ring
      nodeG.appendChild(el('circle', {
        r: CFG.nodeR + 9, fill: 'transparent', class: 'node-hover-ring',
      }));

      // Main circle
      nodeG.appendChild(el('circle', {
        r:              CFG.nodeR,
        fill:           isYou  ? color : isDead ? '#F0EBE0' : '#FAF8F2',
        stroke:         isYou  ? color : isDead ? '#B8A88A' : color,
        'stroke-width': '2.5',
        opacity:        isDead ? '0.65' : '1',
        class:          'node-circle',
      }));

      // Photo (if available) — circular crop via clipPath
      if (person.photoUrl) {
        nodeG.appendChild(el('image', {
          href:                   person.photoUrl,
          x:                      -CFG.nodeR, y: -CFG.nodeR,
          width:                  CFG.nodeR * 2, height: CFG.nodeR * 2,
          'clip-path':            `url(#clip-${person.id})`,
          preserveAspectRatio:    'xMidYMid slice',
          class:                  'node-photo',
        }));
      } else {
        // Initials fallback
        nodeG.appendChild(txt(person.initials, {
          'text-anchor': 'middle', dy: '0.35em',
          fill:           isYou ? '#FAF8F2' : isDead ? '#8A7D60' : color,
          'font-family':  'Fraunces, serif',
          'font-size':    '18', 'font-weight': '400',
        }));
      }

      // Deceased marker (small cross above circle) — only if died
      if (isDead) {
        const dm = el('g', { transform: `translate(0,${-CFG.nodeR - 10})` });
        dm.appendChild(txt('†', {
          'text-anchor': 'middle', dy: '0.35em',
          fill: '#8A7D60', 'font-family': 'Inter, sans-serif', 'font-size': '12',
        }));
        nodeG.appendChild(dm);
      }

      // First name
      nodeG.appendChild(txt(person.firstName, {
        'text-anchor': 'middle', y: CFG.nodeR + 17,
        fill: isDead ? '#8A7D60' : '#1C1A17',
        'font-family': 'Inter, sans-serif', 'font-size': '11.5', 'font-weight': '500',
      }));

      // Last name
      nodeG.appendChild(txt(person.lastName, {
        'text-anchor': 'middle', y: CFG.nodeR + 30,
        fill: isDead ? '#8A7D60' : '#1C1A17',
        'font-family': 'Inter, sans-serif', 'font-size': '11.5', 'font-weight': '500',
      }));

      // Born – died (or just birth year)
      const lifespan = person.died
        ? `${person.born} – ${person.died}`
        : `b. ${person.born}`;
      nodeG.appendChild(txt(lifespan, {
        'text-anchor': 'middle', y: CFG.nodeR + 44,
        fill: '#8A7D60', 'font-family': 'Inter, sans-serif',
        'font-size': '10', 'font-weight': '300',
      }));

      // Family colour dot above circle
      nodeG.appendChild(el('circle', {
        cx: 0, cy: -(CFG.nodeR + 9), r: 4, fill: color, class: 'family-dot',
        opacity: isDead ? '0.5' : '1',
      }));

      nodeG.addEventListener('click', () => App.openProfile(person.id));
      g.appendChild(nodeG);
    });

    rootG.appendChild(g);
  }

  // ── Pan & zoom ─────────────────────────────────────────────────────────────
  function applyTransform() {
    rootG.setAttribute('transform', `translate(${panX},${panY}) scale(${scale})`);
  }

  function setupPanZoom() {
    svgEl.addEventListener('mousedown', e => {
      if (e.target.closest('.node')) return;
      isDragging = true;
      dragStart  = { x: e.clientX, y: e.clientY, px: panX, py: panY };
      svgEl.style.cursor = 'grabbing';
    });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      panX = dragStart.px + (e.clientX - dragStart.x);
      panY = dragStart.py + (e.clientY - dragStart.y);
      applyTransform();
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      svgEl.style.cursor = '';
    });

    svgEl.addEventListener('wheel', e => {
      e.preventDefault();
      scale = Math.min(2.5, Math.max(0.3, scale + (e.deltaY < 0 ? 0.1 : -0.1)));
      applyTransform();
    }, { passive: false });

    // Touch pan
    let lastT = null;
    svgEl.addEventListener('touchstart',  e => { if (e.touches.length === 1) lastT = e.touches[0]; });
    svgEl.addEventListener('touchend',    () => { lastT = null; });
    svgEl.addEventListener('touchmove',   e => {
      if (e.touches.length !== 1 || !lastT) return;
      panX += e.touches[0].clientX - lastT.clientX;
      panY += e.touches[0].clientY - lastT.clientY;
      lastT = e.touches[0];
      applyTransform();
      e.preventDefault();
    }, { passive: false });
  }

  function setupControls() {
    document.getElementById('zoom-in')
      ?.addEventListener('click', () => { scale = Math.min(2.5, scale + 0.15); applyTransform(); });
    document.getElementById('zoom-out')
      ?.addEventListener('click', () => { scale = Math.max(0.3, scale - 0.15); applyTransform(); });
    document.getElementById('zoom-reset')
      ?.addEventListener('click', () => { scale = 1; panX = 0; panY = 0; applyTransform(); });
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  // Deduplicate while preserving first-seen order
  function uniqueOrdered(arr, key) {
    if (!key) {
      return [...new Set(arr)];
    }
    const seen = new Set();
    return arr.filter(item => {
      const k = item[key];
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  return { init };
})();
