// app.js — Application logic, profile panel, memories

const App = (() => {

  // ── Init ───────────────────────────────────────────────────────────────────
  function init() {
    FamilyTree.init('family-tree');
    setupProfilePanel();
    setupMemoryFilters();
    setupScrollNav();
  }

  // ── Profile panel ──────────────────────────────────────────────────────────
  function openProfile(personId) {
    const person = PEOPLE.find(p => p.id === personId);
    if (!person) return;

    const color = FAMILY_COLORS[person.family] || '#C9A457';

    // Populate
    document.getElementById('profile-name').textContent      = person.name;
    document.getElementById('profile-relation').textContent  = person.relation;
    document.getElementById('profile-family-tag').textContent = person.family + ' Family';
    document.getElementById('profile-born').textContent      = person.born;
    document.getElementById('profile-status').textContent    = person.status;
    document.getElementById('profile-bio').innerHTML         =
      person.bio ? `<p>${person.bio}</p>` : '<p class="bio-placeholder">Biography coming soon.</p>';

    // Avatar
    const avatar = document.getElementById('profile-avatar');
    avatar.textContent         = person.initials;
    avatar.style.background    = person.isYou ? color : '#FAF8F2';
    avatar.style.color         = person.isYou ? '#FAF8F2' : color;
    avatar.style.borderColor   = color;

    // Family tag color
    const tag = document.getElementById('profile-family-tag');
    tag.style.color            = color;
    tag.style.borderColor      = color + '55';
    tag.style.background       = color + '18';

    // Show
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
        if (e.target === document.getElementById('profile-overlay')) closeProfile();
      });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeProfile();
    });
  }

  // ── Memory filters ─────────────────────────────────────────────────────────
  function setupMemoryFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Future: filter memory cards by btn.dataset.filter
      });
    });
  }

  // ── Smooth scroll nav ──────────────────────────────────────────────────────
  function setupScrollNav() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  return { init, openProfile };
})();

document.addEventListener('DOMContentLoaded', App.init);
