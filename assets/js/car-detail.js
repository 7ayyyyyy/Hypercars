/**
 * Car detail page — load car by ?id=slug, render hero, narrative, specs, gallery, 3D
 */

(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('id');
  const car = slug ? window.getCarBySlug(slug) : null;

  if (!car) {
    document.getElementById('car-content').innerHTML = `
      <section class="section">
        <div class="container" style="text-align: center; padding: 4rem 1rem;">
          <h1>Car not found</h1>
          <p style="margin: 1rem 0 2rem;">The car you were looking for isn't in our garage.</p>
          <a href="garage.html" class="btn btn--primary">Back to the garage</a>
        </div>
      </section>
    `;
    document.title = 'Car not found — Hypercars Encyclopedia';
    return;
  }

  // Update document
  document.title = `${car.brand} ${car.model} — Hypercars Encyclopedia`;
  const meta = document.createElement('meta');
  meta.name = 'description';
  meta.content = `${car.brand} ${car.model} (${car.year}) — ${car.power_hp} hp, ${car.zero_sixty_s}s 0-60, ${car.top_speed_mph} mph top speed. ${car.engine}.`;
  document.head.appendChild(meta);

  // Powertrain label
  const powertrainLabel = { ice: 'ICE', hybrid: 'Hybrid', ev: 'Electric' }[car.powertrain];

  // Build narrative paragraphs (split on double newlines or just paragraphs)
  const narrativeParas = car.narrative.split(/\n\n+/).map(p => `<p>${p.trim()}</p>`).join('');

  // Spec rows
  const specRows = [
    { label: 'Engine', value: car.engine },
    { label: 'Displacement', value: car.displacement ? `${car.displacement.toLocaleString()} cc` : 'N/A (electric)' },
    { label: 'Transmission', value: car.transmission },
    { label: 'Drivetrain', value: car.drivetrain },
    { label: 'Power', value: `${car.power_hp.toLocaleString()} hp / ${car.power_kw.toLocaleString()} kW` },
    { label: 'Torque', value: car.torque_nm ? `${car.torque_nm.toLocaleString()} Nm` : 'N/A' },
    { label: 'Weight', value: `${car.weight_kg.toLocaleString()} kg` },
    { label: 'Body style', value: car.body_style },
    { label: 'Production', value: car.production > 0 ? `${car.production} units` : 'In production' },
    { label: 'Designer', value: car.designer },
    { label: 'Price', value: window.siteUtils.formatPrice(car.price_usd) }
  ];

  // Gallery
  const galleryMain = car.images && car.images[0]
    ? `<img id="gallery-main-img" src="${car.images[0]}" alt="${car.brand} ${car.model}" onerror="this.parentElement.innerHTML = '<div class=&quot;gallery__placeholder&quot;>Image unavailable</div>'">`
    : `<div class="gallery__placeholder">Image unavailable</div>`;

  const galleryThumbs = car.images && car.images.length > 0
    ? car.images.map((img, i) => `
        <button class="gallery__thumb" data-idx="${i}" aria-selected="${i === 0 ? 'true' : 'false'}" aria-label="View image ${i + 1}">
          <img src="${img}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'">
        </button>
      `).join('')
    : '';

  // Related cars (3 random, excluding current)
  const related = window.CARS_DATA
    .filter(c => c.id !== car.id)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  const relatedHtml = related.map(c => window.siteUtils.renderCarCard(c)).join('');

  // Render
  document.getElementById('car-content').innerHTML = `
    <!-- 3D HERO -->
    <section class="car-hero">
      <div class="car-hero__canvas" id="car-hero-canvas" role="img" aria-label="3D model of ${car.brand} ${car.model}"></div>
      <div class="car-hero__overlay">
        <div class="car-hero__brand">${car.brand} · ${car.year}</div>
        <h1 class="car-hero__name">${car.model}</h1>
        <p class="car-hero__hint">Click and drag to rotate · Scroll to zoom</p>
      </div>
    </section>

    <section class="container">
      <a href="garage.html" class="back-link">← Back to the garage</a>

      <div class="car-detail">
        <div>
          <!-- Gallery -->
          <div class="gallery">
            <h2 style="font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--color-text-dim); margin-bottom: var(--space-3); font-weight: 600;">Gallery</h2>
            <div class="gallery__main" id="gallery-main">${galleryMain}</div>
            <div class="gallery__thumbs">${galleryThumbs}</div>
          </div>

          <!-- Narrative -->
          <div class="car-narrative">
            <h2>The story</h2>
            ${narrativeParas}
            <blockquote>${car.brand} ${car.model} · ${powertrainLabel} · ${car.year}</blockquote>
          </div>
        </div>

        <!-- Spec sheet (sidebar) -->
        <aside>
          <div class="spec-sheet">
            <div class="spec-sheet__title">Specifications</div>
            <div class="spec-headline">
              <div class="spec-headline__item">
                <div class="spec-headline__value">${car.power_hp.toLocaleString()}</div>
                <div class="spec-headline__label">HP</div>
              </div>
              <div class="spec-headline__item">
                <div class="spec-headline__value">${car.zero_sixty_s.toFixed(2)}s</div>
                <div class="spec-headline__label">0-60</div>
              </div>
              <div class="spec-headline__item">
                <div class="spec-headline__value">${car.top_speed_mph}</div>
                <div class="spec-headline__label">MPH</div>
              </div>
            </div>
            ${specRows.map(r => `
              <div class="spec-row">
                <span class="spec-row__label">${r.label}</span>
                <span class="spec-row__value">${r.value}</span>
              </div>
            `).join('')}
            <a href="compare.html?cars=${encodeURIComponent(car.slug)}" class="btn btn--primary" style="width: 100%; justify-content: center; margin-top: var(--space-5);">
              Add to compare
            </a>
          </div>
        </aside>
      </div>

      <!-- Related -->
      <section class="related">
        <h2>You might also like</h2>
        <div class="grid grid-3">${relatedHtml}</div>
      </section>
    </section>
  `;

  // Init 3D hero
  const canvasContainer = document.getElementById('car-hero-canvas');
  if (canvasContainer) {
    const showroom = new HypercarShowroom(canvasContainer, {
      car: car,
      interactive: true,
      autoRotate: true,
      background: 'gradient',
      cameraDistance: 8,
      cameraHeight: 1.8
    });
    showroom.init();
  }

  // Gallery interactions
  const thumbs = document.querySelectorAll('.gallery__thumb');
  const mainImg = document.getElementById('gallery-main-img');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.idx);
      const src = car.images[idx];
      if (mainImg && src) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = src;
          mainImg.style.opacity = '1';
        }, 150);
      }
      thumbs.forEach(t => t.setAttribute('aria-selected', 'false'));
      thumb.setAttribute('aria-selected', 'true');
    });
  });

  // Lightbox
  const mainEl = document.getElementById('gallery-main');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  if (mainEl && lightbox && lightboxImg) {
    mainEl.addEventListener('click', () => {
      if (car.images && car.images[0]) {
        lightboxImg.src = car.images[0];
        lightbox.setAttribute('data-open', 'true');
      }
    });
    lightbox.addEventListener('click', () => {
      lightbox.setAttribute('data-open', 'false');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.setAttribute('data-open', 'false');
    });
  }
})();
