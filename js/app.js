// app.js — Application logic: profile panel, memories grid, nav
// ─────────────────────────────────────────────────────────────────────────────

const App = (() => {

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    applyConfig();
    FamilyTree.init('family-tree');
    setupProfilePanel();
    renderMemories('all');
    setupMemoryFilters();
    setupScrollNav();
  }

  // Apply SITE_CONFIG to static text
  function applyConfig() {
    const cfg = SITE_CONFIG;
    document.title = cfg.siteName + ' Family';
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) heroTitle.innerHTML = cfg.siteName.replace(/·/g, '·<br>');
    const heroSub = document.getElementById('hero-subtitle');
    if (heroSub) heroSub.textContent = cfg.tagline;
    const estYear = document.getElementById('est-year');
    if (estYear) estYear.textContent = `Est. ${cfg.established}`;
  }

  // ── Profile panel ──────────────────────────────────────────────────────────
  function openProfile(personId) {
    const person = PEOPLE.find(p => p.id === personId);
    if (!person) return;

    const color   = FAMILY_COLORS[person.family] || '#C9A457';
    const isYou   = person.id === SITE_CONFIG.highlightPersonId;
    const isDead  = person.died !== null;

    // Header photo or initials
    const avatar = document.getElementById('profile-avatar');
    if (person.photoUrl) {
      avatar.innerHTML = `<img src="${person.photoUrl}" alt="${person.name}" class="avatar-img">`;
      avatar.style.background   = '#F0EBE0';
      avatar.style.borderColor  = color;
    } else {
      avatar.innerHTML          = person.initials;
      avatar.style.background   = isYou  ? color : '#FAF8F2';
      avatar.style.color        = isYou  ? '#FAF8F2' : color;
      avatar.style.borderColor  = color;
    }

    // Family tag
    const tag = document.getElementById('profile-family-tag');
    tag.textContent       = person.family + ' Family';
    tag.style.color       = color;
    tag.style.borderColor = color + '55';
    tag.style.background  = color + '18';

    // Name & relation
    document.getElementById('profile-name').textContent     = person.name;
    document.getElementById('profile-relation').textContent = person.relation;

    // Detail rows
    const lifespan = isDead
      ? `${person.born} – ${person.died}`
      : `${person.born}`;
    document.getElementById('profile-born').textContent    = lifespan;
    document.getElementById('profile-status').textContent  = isDead ? 'Deceased' : person.status;

    // Bio
    const bioEl = document.getElementById('profile-bio');
    bioEl.innerHTML = person.bio
      ? `<p>${person.bio}</p>`
      : '<p class="bio-placeholder">Biography coming soon.</p>';

    // Photos gallery
    renderProfilePhotos(person);

    // Videos
    renderProfileVideos(person);

    // Memories this person appears in
    renderProfileMemories(person);

    // Show panel
    document.getElementById('profile-overlay').classList.add('active');
    document.getElementById('profile-panel').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    document.getElementById('profile-overlay').classList.remove('active');
    document.getElementById('profile-panel').classList.remove('active');
    document.body.style.overflow = '';
  }

  function setupProfilePanel() {
    document.getElementById('profile-close')
      ?.addEventListener('click', closeProfile);
    document.getElementById('profile-overlay')
      ?.addEventListener('click', e => {
        if (e.target.id === 'profile-overlay') closeProfile();
      });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeProfile();
    });
  }

  // Render photos grid inside profile panel
  function renderProfilePhotos(person) {
    const section = document.getElementById('profile-photos-section');
    const grid    = document.getElementById('profile-photos-grid');
    if (!section || !grid) return;

    if (!person.photos || person.photos.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    grid.innerHTML = person.photos.map(photo => `
      <div class="profile-photo-thumb" title="${photo.caption || ''}">
        <img src="${photo.url}" alt="${photo.caption || person.name}" loading="lazy">
        ${photo.caption ? `<span class="thumb-caption">${photo.caption}</span>` : ''}
      </div>
    `).join('');
  }

  // Render videos inside profile panel
  function renderProfileVideos(person) {
    const section = document.getElementById('profile-videos-section');
    const grid    = document.getElementById('profile-videos-grid');
    if (!section || !grid) return;

    if (!person.videos || person.videos.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    grid.innerHTML = person.videos.map(video => `
      <div class="profile-video-thumb">
        ${video.thumb
          ? `<img src="${video.thumb}" alt="${video.title}" loading="lazy">`
          : `<div class="video-thumb-placeholder"><span>▶</span></div>`
        }
        <p class="video-title">${video.title}</p>
        ${video.year ? `<p class="video-year">${video.year}</p>` : ''}
      </div>
    `).join('');
  }

  // Render memories this person appears in
  function renderProfileMemories(person) {
    const section = document.getElementById('profile-memories-section');
    const list    = document.getElementById('profile-memories-list');
    if (!section || !list) return;

    const related = MEMORIES.filter(m => m.people?.includes(person.id));
    if (related.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = '';
    list.innerHTML = related.map(m => `
      <div class="profile-memory-chip">
        <span class="memory-chip-year">${m.year}</span>
        <span class="memory-chip-title">${m.title}</span>
      </div>
    `).join('');
  }

  // ── Memories section ───────────────────────────────────────────────────────
  function renderMemories(filter) {
    const grid = document.getElementById('memories-grid');
    if (!grid) return;

    const filtered = filter === 'all'
      ? MEMORIES
      : MEMORIES.filter(m => m.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `<p class="memories-empty">No memories in this category yet.</p>`;
      return;
    }

    grid.innerHTML = filtered.map(m => {
      const people = (m.people || [])
        .map(id => PEOPLE.find(p => p.id === id))
        .filter(Boolean)
        .map(p => p.firstName)
        .join(', ');

      const hasPhoto = !!m.coverPhoto;
      const catLabel = m.category.charAt(0).toUpperCase() + m.category.slice(1);

      return `
        <article class="memory-card" data-id="${m.id}" data-category="${m.category}">
          <div class="memory-card-media">
            ${hasPhoto
              ? `<img src="${m.coverPhoto}" alt="${m.title}" loading="lazy" class="memory-cover-img">`
              : `<div class="memory-cover-placeholder">
                   <span class="placeholder-icon">${categoryIcon(m.category)}</span>
                 </div>`
            }
            <span class="memory-category-badge">${catLabel}</span>
          </div>
          <div class="memory-card-body">
            <p class="memory-year">${m.year}</p>
            <h3 class="memory-title">${m.title}</h3>
            ${m.description ? `<p class="memory-desc">${m.description}</p>` : ''}
            ${people ? `<p class="memory-people">${people}</p>` : ''}
          </div>
        </article>
      `;
    }).join('');
  }

  function categoryIcon(cat) {
    const icons = {
      holidays:   '🎄', birthdays: '🎂', weddings:  '💍',
      travel:     '✈️', everyday:  '📸', milestones: '⭐',
      reunions:   '👨‍👩‍👧‍👦',
    };
    return icons[cat] || '📷';
  }

  function setupMemoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMemories(btn.dataset.filter);
      });
    });

    document.getElementById('add-memory-btn')
      ?.addEventListener('click', openAddMemoryModal);
  }

  // ── Add Memory modal ───────────────────────────────────────────────────────
  function openAddMemoryModal() {
    const modal = document.getElementById('add-memory-modal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeAddMemoryModal() {
    const modal = document.getElementById('add-memory-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // ── Smooth scroll ──────────────────────────────────────────────────────────
  function setupScrollNav() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(a.getAttribute('href'))
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  return { init, openProfile };
})();

document.addEventListener('DOMContentLoaded', App.init);
