// tree.js — SVG family tree renderer

const FamilyTree = (() => {
  const W = 1000;
  const H = 620;
  const R = 40; // node radius

  let svgEl, rootG;
  let scale = 1, panX = 0, panY = 0;
  let isDragging = false, dragStart = {};

  // ── SVG helpers ────────────────────────────────────────────────────────────
  function el(tag, attrs = {}) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    return e;
  }

  function text(content, attrs = {}) {
    const t = el('text', attrs);
    t.textContent = content;
    return t;
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  function init(svgId) {
    svgEl = document.getElementById(svgId);
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.setAttribute('width', '100%');
    svgEl.setAttribute('height', '100%');

    rootG = el('g', { id: 'root-g' });
    svgEl.appendChild(rootG);

    render();
    setupPanZoom();
    setupControls();
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  function render() {
    rootG.innerHTML = '';
    drawGenBands();
    drawConnectors();
    drawNodes();
  }

  function drawGenBands() {
    const g = el('g', { class: 'gen-bands' });

    const bands = [
      { label: 'Generation I',   y: 36 },
      { label: 'Generation II',  y: 225 },
      { label: 'Generation III', y: 425 }
    ];

    bands.forEach(({ label, y }) => {
      // Divider line
      const line = el('line', {
        x1: 30, y1: y + 14,
        x2: 970, y2: y + 14,
        stroke: '#E8DFC8', 'stroke-width': '1'
      });
      g.appendChild(line);

      // Label
      const t = text(label, {
        x: 30, y: y + 10,
        fill: '#C9A457', 'font-family': 'Inter, sans-serif',
        'font-size': '11', 'font-weight': '500',
        'letter-spacing': '0.08em', opacity: '0.8'
      });
      g.appendChild(t);
    });

    rootG.appendChild(g);
  }

  function drawConnectors() {
    const g = el('g', { class: 'connectors' });

    // Couple connector lines
    COUPLES.forEach(couple => {
      const [x1, y1] = LAYOUT[couple.person1Id];
      const [x2, y2] = LAYOUT[couple.person2Id];
      const [mx, my] = COUPLE_MID[couple.id];

      // Line between spouses
      const line = el('line', {
        x1, y1, x2, y2,
        stroke: '#C9A457', 'stroke-width': '1.5',
        'stroke-dasharray': '4 3', opacity: '0.7'
      });
      g.appendChild(line);

      // Marriage year badge
      if (couple.marriedYear) {
        const badge = el('g', { transform: `translate(${mx}, ${my - 14})` });

        const rect = el('rect', {
          x: -22, y: -9, width: 44, height: 16,
          rx: 8, fill: '#FAF7F0', stroke: '#E8DFC8', 'stroke-width': '1'
        });
        badge.appendChild(rect);

        const t = text(`m. ${couple.marriedYear}`, {
          'text-anchor': 'middle', dy: '0.35em',
          fill: '#8A7D60', 'font-family': 'Inter, sans-serif',
          'font-size': '9', 'font-style': 'italic'
        });
        badge.appendChild(t);
        g.appendChild(badge);
      }
    });

    // ── Parent → child connector paths ──────────────────────────────────────

    // Gen I → Gen II
    // Drop from Gen I midpoint (500, 110+R=150) → branch y=215
    // Horizontal 225 → 725, then up to each couple top
    const b1 = 215;
    appendPath(g, [
      `M 500 ${110 + R}`,
      `L 500 ${b1}`,
      `M 225 ${b1} L 725 ${b1}`,
      `M 225 ${b1} L 225 ${310 - R}`,
      `M 725 ${b1} L 725 ${310 - R}`
    ]);

    // Gen II Duggan → Gen III
    const b2 = 415;
    appendPath(g, [
      `M 225 ${310 + R}`,
      `L 225 ${b2}`,
      `M 140 ${b2} L 310 ${b2}`,
      `M 140 ${b2} L 140 ${500 - R}`,
      `M 310 ${b2} L 310 ${500 - R}`
    ]);

    // Gen II Levenfeld → Gen III
    appendPath(g, [
      `M 725 ${310 + R}`,
      `L 725 ${b2}`,
      `M 640 ${b2} L 810 ${b2}`,
      `M 640 ${b2} L 640 ${500 - R}`,
      `M 810 ${b2} L 810 ${500 - R}`
    ]);

    rootG.appendChild(g);
  }

  function appendPath(parent, segments) {
    const p = el('path', {
      d: segments.join(' '),
      fill: 'none',
      stroke: '#C9A457',
      'stroke-width': '1.5',
      opacity: '0.5'
    });
    parent.appendChild(p);
  }

  function drawNodes() {
    const g = el('g', { class: 'nodes' });

    PEOPLE.forEach(person => {
      const [x, y] = LAYOUT[person.id];
      const color = FAMILY_COLORS[person.family] || '#C9A457';

      const nodeG = el('g', {
        class: `node${person.isYou ? ' node--you' : ''}`,
        'data-id': person.id,
        transform: `translate(${x}, ${y})`
      });
      nodeG.style.cursor = 'pointer';

      // ── Hover / click ring ──────────────────────────────────────────────
      const hoverRing = el('circle', {
        r: R + 8, fill: 'transparent',
        'class': 'node-hover-ring'
      });
      nodeG.appendChild(hoverRing);

      // ── Main circle ────────────────────────────────────────────────────
      const circle = el('circle', {
        r: R,
        fill: person.isYou ? color : '#FAF8F2',
        stroke: color,
        'stroke-width': '2.5',
        'class': 'node-circle'
      });
      nodeG.appendChild(circle);

      // ── Initials ───────────────────────────────────────────────────────
      const initEl = text(person.initials, {
        'text-anchor': 'middle', dy: '0.35em',
        fill: person.isYou ? '#FAF8F2' : color,
        'font-family': 'Fraunces, serif',
        'font-size': '18', 'font-weight': '400'
      });
      nodeG.appendChild(initEl);

      // ── Name lines ─────────────────────────────────────────────────────
      const name1 = text(person.firstName, {
        'text-anchor': 'middle',
        y: R + 16,
        fill: '#1C1A17',
        'font-family': 'Inter, sans-serif',
        'font-size': '11.5', 'font-weight': '500'
      });
      nodeG.appendChild(name1);

      const name2 = text(person.lastName, {
        'text-anchor': 'middle',
        y: R + 29,
        fill: '#1C1A17',
        'font-family': 'Inter, sans-serif',
        'font-size': '11.5', 'font-weight': '500'
      });
      nodeG.appendChild(name2);

      // ── Birth year ─────────────────────────────────────────────────────
      const yearEl = text(`b. ${person.born}`, {
        'text-anchor': 'middle',
        y: R + 43,
        fill: '#8A7D60',
        'font-family': 'Inter, sans-serif',
        'font-size': '10', 'font-weight': '300'
      });
      nodeG.appendChild(yearEl);

      // ── Family colour dot ──────────────────────────────────────────────
      const dot = el('circle', {
        cx: 0, cy: -(R + 8),
        r: 4, fill: color,
        'class': 'family-dot'
      });
      nodeG.appendChild(dot);

      // ── Click ──────────────────────────────────────────────────────────
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
    // Mouse drag to pan
    svgEl.addEventListener('mousedown', e => {
      if (e.target.closest('.node')) return;
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY, px: panX, py: panY };
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

    // Scroll wheel zoom
    svgEl.addEventListener('wheel', e => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      scale = Math.min(2.5, Math.max(0.35, scale + delta));
      applyTransform();
    }, { passive: false });

    // Touch pan (mobile)
    let lastTouch = null;
    svgEl.addEventListener('touchstart', e => {
      if (e.touches.length === 1) lastTouch = e.touches[0];
    });
    svgEl.addEventListener('touchmove', e => {
      if (e.touches.length === 1 && lastTouch) {
        panX += e.touches[0].clientX - lastTouch.clientX;
        panY += e.touches[0].clientY - lastTouch.clientY;
        lastTouch = e.touches[0];
        applyTransform();
        e.preventDefault();
      }
    }, { passive: false });
    svgEl.addEventListener('touchend', () => { lastTouch = null; });
  }

  function setupControls() {
    document.getElementById('zoom-in')?.addEventListener('click', () => {
      scale = Math.min(2.5, scale + 0.15);
      applyTransform();
    });
    document.getElementById('zoom-out')?.addEventListener('click', () => {
      scale = Math.max(0.35, scale - 0.15);
      applyTransform();
    });
    document.getElementById('zoom-reset')?.addEventListener('click', () => {
      scale = 1; panX = 0; panY = 0;
      applyTransform();
    });
  }

  return { init };
})();
