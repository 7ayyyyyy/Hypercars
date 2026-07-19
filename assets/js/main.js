/**
 * Shared site logic — nav active state, year, etc.
 */

(function () {
  'use strict';

  // Set active nav link
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('.site-nav a');
    links.forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // Set copyright year
  function setYear() {
    const el = document.querySelector('[data-current-year]');
    if (el) el.textContent = new Date().getFullYear();
  }

  // Format helpers
  function formatPrice(usd) {
    if (usd >= 1_000_000) return '$' + (usd / 1_000_000).toFixed(2) + 'M';
    if (usd >= 1_000) return '$' + (usd / 1_000).toFixed(0) + 'K';
    return '$' + usd.toLocaleString();
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  // Format a car's spec for display
  function carStats(car) {
    return [
      { value: formatNumber(car.power_hp), label: 'HP', accent: true },
      { value: car.zero_sixty_s.toFixed(2) + 's', label: '0-60 MPH' },
      { value: car.top_speed_mph + ' mph', label: 'Top speed' }
    ];
  }

  // Render a car card (used on home, garage, related)
  function renderCarCard(car) {
    const card = document.createElement('a');
    card.className = 'car-card fade-in';
    card.href = `car.html?id=${encodeURIComponent(car.slug)}`;
    card.setAttribute('aria-label', `${car.brand} ${car.model}, view details`);

    const imageHtml = car.images && car.images[0]
      ? `<img src="${car.images[0]}" alt="${car.brand} ${car.model}" loading="lazy" onerror="this.parentElement.innerHTML = '<div class=&quot;car-card__placeholder&quot;><div class=&quot;car-card__placeholder-text&quot;>${car.brand}<br>${car.model}</div></div>'">`
      : `<div class="car-card__placeholder"><div class="car-card__placeholder-text">${car.brand}<br>${car.model}</div></div>`;

    const stats = carStats(car);
    const chips = stats.map(s => `
      <div class="chip">
        <div class="chip__value ${s.accent ? 'chip__value--accent' : ''}">${s.value}</div>
        <div class="chip__label">${s.label}</div>
      </div>
    `).join('');

    const powertrainLabel = {
      ice: 'ICE',
      hybrid: 'Hybrid',
      ev: 'Electric'
    }[car.powertrain] || car.powertrain;

    card.innerHTML = `
      <div class="car-card__image">
        <div class="car-card__powertrain car-card__powertrain--${car.powertrain}">${powertrainLabel}</div>
        ${imageHtml}
      </div>
      <div class="car-card__body">
        <div class="car-card__brand">${car.brand} · ${car.year}</div>
        <div class="car-card__name">${car.model}</div>
        <div class="car-card__chips">${chips}</div>
      </div>
    `;
    return card;
  }

  // Expose
  window.siteUtils = {
    setActiveNav,
    setYear,
    formatPrice,
    formatNumber,
    carStats,
    renderCarCard
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setActiveNav();
      setYear();
    });
  } else {
    setActiveNav();
    setYear();
  }
})();
