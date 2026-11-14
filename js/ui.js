/* Packify — shared UI helpers */

const DISCORD_URL = 'https://discord.gg/kBjprdCQcg';

function getPack(id) {
  return PACKS.find(p => p.id === id) || null;
}

function formatPrice(pack) {
  // prices are stored in INR; display in the selected currency
  if (typeof formatINR === 'function') return formatINR(pack.price);
  return `₹ ${pack.price.toFixed(2)}`;
}

/** Placeholder pack artwork — CSS-generated, no images needed. */
function packArt(pack, large = false) {
  const initials = pack.name.replace('Neitous ', '').replace(' ', '');
  return `
    <div class="pack-art ${large ? 'pack-art--lg' : ''}" style="--accent:${pack.accent}">
      <span class="pack-art__res">${pack.resolution}</span>
      <span class="pack-art__initials">${initials}</span>
      <span class="pack-art__ver">MC ${pack.version}</span>
    </div>`;
}

function packCard(pack) {
  const fav = isFavorite(pack.id) ? 'is-fav' : '';
  return `
    <article class="pack-card" data-id="${pack.id}">
      <a class="pack-card__art" href="pack.html?id=${pack.id}">${packArt(pack)}</a>
      <button class="pack-card__fav ${fav}" data-fav="${pack.id}" aria-label="Favorite ${pack.name}">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="${isFavorite(pack.id) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
      <div class="pack-card__body">
        <a href="pack.html?id=${pack.id}"><h3 class="pack-card__name">${pack.name}</h3></a>
        <p class="pack-card__meta">${pack.resolution} &middot; Minecraft ${pack.version}</p>
        <p class="pack-card__desc">${pack.description}</p>
        <div class="pack-card__footer">
          <span class="pack-card__price">${formatPrice(pack)}</span>
          <a class="btn btn--primary btn--sm" href="pack.html?id=${pack.id}">Get This Pack</a>
        </div>
      </div>
    </article>`;
}

function renderPackGrid(container, packs) {
  container.innerHTML = packs.length
    ? packs.map(packCard).join('')
    : '<p class="empty-state">No packs found.</p>';
}

function bindFavoriteButtons(root = document) {
  root.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.fav;
      const on = toggleFavorite(id);
      btn.classList.toggle('is-fav', on);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
    });
  });
}

function header(active = '') {
  return `
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="brand" href="index.html"><img class="brand__logo" src="logo/logo.png" alt="Packify logo">Packify</a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <nav class="site-nav">
        <a href="index.html" class="${active === 'home' ? 'is-active' : ''}">Home</a>
        <a href="explore.html" class="${active === 'explore' ? 'is-active' : ''}">Explore Packs</a>
        <a href="order.html" class="${active === 'order' ? 'is-active' : ''}">Order Lookup</a>
        <a href="about.html" class="${active === 'about' ? 'is-active' : ''}">About</a>
      </nav>
      <select class="currency-select" id="currency-select" aria-label="Currency">
        ${(typeof CURRENCIES !== 'undefined' ? CURRENCIES : [{ code: 'INR' }]).map(c =>
          `<option value="${c.code}">${c.code}</option>`).join('')}
      </select>
      <a class="btn btn--primary btn--sm" href="explore.html">Browse Packs</a>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <div>
        <a class="brand" href="index.html"><img class="brand__logo" src="logo/logo.png" alt="Packify logo">Packify</a>
        <p class="muted">Premium Minecraft 1.8.9 PvP resource packs.</p>
      </div>
      <nav class="site-footer__links">
        <a href="explore.html">Explore Packs</a>
        <a href="order.html">Order Lookup</a>
        <a href="about.html">About</a>
        <a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a>
      </nav>
    </div>
    <div class="container site-footer__bottom">
      <span class="muted">&copy; ${new Date().getFullYear()} Packify. All rights reserved.</span>
    </div>
  </footer>`;
}

function mountPage(active = '') {
  document.body.insertAdjacentHTML('afterbegin', header(active));
  document.body.insertAdjacentHTML('beforeend', footer());
  // mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open);
    });
  }
  // currency selector
  const curSelect = document.getElementById('currency-select');
  if (curSelect && typeof getCurrency === 'function') {
    curSelect.value = getCurrency().code;
    curSelect.addEventListener('change', () => {
      if (typeof setCurrency === 'function') setCurrency(curSelect.value);
    });
  }
  // close mobile nav on link click
  document.querySelectorAll('.site-nav a').forEach(a =>
    a.addEventListener('click', () => nav?.classList.remove('is-open'))
  );
}
