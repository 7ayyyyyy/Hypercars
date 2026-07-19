/**
 * Compare page — pick 2-3 cars, render comparison table with winners
 */

(function () {
  'use strict';

  const pickers = document.getElementById('compare-pickers');
  const output = document.getElementById('compare-output');

  // State
  const selected = [null, null, null];

  // Build options HTML for select
  function buildOptions() {
    let html = '<option value="">— Select a car —</option>';
    window.CARS_DATA.forEach(car => {
      html += `<option value="${car.slug}">${car.brand} ${car.model}</option>`;
    });
    return html;
  }

  // Render the picker dropdowns
  function renderPickers() {
    pickers.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'compare-picker';
      wrapper.innerHTML = `
        <label for="compare-pick-${i}">Car ${i + 1}</label>
        <select id="compare-pick-${i}" data-idx="${i}">
          ${buildOptions()}
        </select>
      `;
      pickers.appendChild(wrapper);
    }

    document.querySelectorAll('select[data-idx]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const idx = parseInt(sel.dataset.idx);
        const slug = sel.value;
        selected[idx] = slug ? window.getCarBySlug(slug) : null;
        renderTable();
      });
    });
  }

  // Spec rows for comparison. Each row: label, valueFn(car), higherIsBetter
  const specRows = [
    { label: 'Year', fn: c => c.year, higherBetter: true },
    { label: 'Powertrain', fn: c => ({ice:'ICE', hybrid:'Hybrid', ev:'Electric'})[c.powertrain] },
    { label: 'Engine', fn: c => c.engine },
    { label: 'Power (HP)', fn: c => c.power_hp, higherBetter: true, format: v => v.toLocaleString() },
    { label: 'Power (kW)', fn: c => c.power_kw, higherBetter: true, format: v => v.toLocaleString() },
    { label: 'Torque (Nm)', fn: c => c.torque_nm, higherBetter: true, format: v => v.toLocaleString() },
    { label: 'Weight (kg)', fn: c => c.weight_kg, higherBetter: false, format: v => v.toLocaleString() },
    { label: '0-60 mph (s)', fn: c => c.zero_sixty_s, higherBetter: false, format: v => v.toFixed(2) + 's' },
    { label: 'Top speed (mph)', fn: c => c.top_speed_mph, higherBetter: true, format: v => v + ' mph' },
    { label: 'Power-to-weight (hp/t)', fn: c => Math.round(c.power_hp / (c.weight_kg / 1000)), higherBetter: true, format: v => v.toLocaleString() },
    { label: 'Price (USD)', fn: c => c.price_usd, higherBetter: false, format: v => window.siteUtils.formatPrice(v) },
    { label: 'Production', fn: c => c.production > 0 ? c.production : 'Ongoing', higherBetter: null }
  ];

  function renderTable() {
    const active = selected.filter(c => c !== null);
    if (active.length < 2) {
      output.innerHTML = `
        <div class="compare-empty">
          <h3 style="color: var(--color-text); margin-bottom: var(--space-2);">
            ${active.length === 0 ? 'Choose at least 2 cars to compare' : 'Choose one more car to compare'}
          </h3>
          <p>Use the dropdowns above.</p>
        </div>
      `;
      return;
    }

    // Build table
    const table = document.createElement('table');
    table.className = 'compare-table';

    // Header
    const thead = document.createElement('thead');
    let headRow = '<tr><th>Spec</th>';
    active.forEach(car => {
      headRow += `<th>${car.brand}<br><span style="font-size: var(--fs-small); color: var(--color-text-muted); font-weight: 500;">${car.model}</span></th>`;
    });
    headRow += '</tr>';
    thead.innerHTML = headRow;
    table.appendChild(thead);

    // Body
    const tbody = document.createElement('tbody');
    specRows.forEach(row => {
      const values = active.map(c => row.fn(c));
      const numericValues = values.filter(v => typeof v === 'number');
      const isNumeric = numericValues.length === active.length && row.higherBetter !== null;
      let winners = [];

      if (isNumeric) {
        const target = row.higherBetter ? Math.max(...numericValues) : Math.min(...numericValues);
        winners = values.map(v => v === target);
      }

      let tr = `<tr><td class="row-label">${row.label}</td>`;
      active.forEach((car, i) => {
        let val = values[i];
        const formatted = row.format ? row.format(val) : val;
        const isWinner = winners[i] && active.length > 1;
        tr += `<td class="col-value ${isWinner ? 'col-value--winner' : ''}">${formatted}</td>`;
      });
      tr += '</tr>';
      tbody.innerHTML += tr;
    });
    table.appendChild(tbody);

    output.innerHTML = '';
    output.appendChild(table);
  }

  // Init
  renderPickers();

  // Pre-select from query string
  const params = new URLSearchParams(window.location.search);
  const initial = (params.get('cars') || '').split(',').filter(Boolean);
  initial.forEach((slug, i) => {
    if (i >= 3) return;
    const car = window.getCarBySlug(slug);
    if (car) {
      selected[i] = car;
      const sel = document.getElementById(`compare-pick-${i}`);
      if (sel) sel.value = slug;
    }
  });
  renderTable();
})();
