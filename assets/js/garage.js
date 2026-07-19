/**
 * Garage page — filter and sort all cars
 */

(function () {
  'use strict';

  const state = {
    powertrain: 'all',
    decade: 'all',
    price: 'all',
    sort: 'featured'
  };

  const grid = document.getElementById('cars-grid');
  const resultsCount = document.getElementById('results-count');

  function getDecade(year) {
    return Math.floor(year / 10) * 10 + 's';
  }

  function priceMatches(priceUsd, tier) {
    if (tier === 'all') return true;
    const m = priceUsd / 1_000_000;
    if (tier === 'sub1m') return m < 1;
    if (tier === '1to2m') return m >= 1 && m < 2;
    if (tier === '2to3m') return m >= 2 && m < 3;
    if (tier === 'over3m') return m >= 3;
    return true;
  }

  function applyFilters() {
    let list = window.CARS_DATA.slice();

    if (state.powertrain !== 'all') {
      list = list.filter(c => c.powertrain === state.powertrain);
    }
    if (state.decade !== 'all') {
      list = list.filter(c => getDecade(c.year) === state.decade);
    }
    if (state.price !== 'all') {
      list = list.filter(c => priceMatches(c.price_usd, state.price));
    }

    // Sort
    const sorters = {
      featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || a.id - b.id,
      power: (a, b) => b.power_hp - a.power_hp,
      zero_sixty: (a, b) => a.zero_sixty_s - b.zero_sixty_s,
      top_speed: (a, b) => b.top_speed_mph - a.top_speed_mph,
      price_asc: (a, b) => a.price_usd - b.price_usd,
      price_desc: (a, b) => b.price_usd - a.price_usd,
      year: (a, b) => b.year - a.year
    };
    list.sort(sorters[state.sort] || sorters.featured);

    return list;
  }

  function render() {
    const list = applyFilters();
    grid.innerHTML = '';
    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">No cars match your filters</h3>
          <p>Try widening your selection.</p>
        </div>
      `;
    } else {
      list.forEach((car, i) => {
        const card = window.siteUtils.renderCarCard(car);
        card.setAttribute('role', 'listitem');
        card.style.animationDelay = `${Math.min(i, 12) * 40}ms`;
        grid.appendChild(card);
      });
    }
    const total = window.CARS_DATA.length;
    resultsCount.innerHTML = `Showing <strong>${list.length}</strong> of ${total} cars`;
  }

  // Filter button toggles
  document.querySelectorAll('[data-filter="powertrain"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const value = btn.dataset.value;
      state.powertrain = value;
      document.querySelectorAll('[data-filter="powertrain"]').forEach(b => {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      render();
    });
  });

  // Selects
  document.querySelectorAll('select[data-filter]').forEach(sel => {
    sel.addEventListener('change', () => {
      state[sel.dataset.filter] = sel.value;
      render();
    });
  });

  document.querySelector('select[data-sort]').addEventListener('change', (e) => {
    state.sort = e.target.value;
    render();
  });

  // Initial render
  render();
})();
