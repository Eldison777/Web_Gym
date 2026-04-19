// index.js — module script (strict mode is automatic, no need for 'use strict')

// ── localStorage helpers ──────────────────────────────────────────────────────

function getWorkouts() {
  return JSON.parse(localStorage.getItem('workouts') || '[]');
}

// ── Utility functions ─────────────────────────────────────────────────────────

function escapeHTML(str) {
  return String(str)
    .replaceAll('&',  '&amp;')
    .replaceAll('<',  '&lt;')
    .replaceAll('>',  '&gt;')
    .replaceAll('"', '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day)
    .toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── vs Last Session ───────────────────────────────────────────────────────────

function getPreviousVolume(workouts, currentIndex) {
  const current = workouts[currentIndex];
  const name    = current.exercise.trim().toLowerCase();
  let best = null;

  workouts.forEach((w, i) => {
    if (i === currentIndex) return;
    if (w.exercise.trim().toLowerCase() !== name) return;

    const isBefore = w.date < current.date || (w.date === current.date && i < currentIndex);
    if (!isBefore) return;

    const vol = w.sets * w.reps * w.weight;
    if (!best || w.date > best.date || (w.date === best.date && i > best.index))
      best = { date: w.date, index: i, volume: vol };
  });

  return best ? best.volume : null;
}

function vsLastSessionHTML(current, prev) {
  if (prev === null) return '<span class="vs-badge text-primary">First Entry</span>';
  if (current > prev) return '<span class="vs-badge text-success">&#9650; Improved</span>';
  if (current < prev) return '<span class="vs-badge text-danger">&#9660; Dropped</span>';
  return '<span class="vs-badge text-secondary">= Same</span>';
}

// ── Stats bar ─────────────────────────────────────────────────────────────────

function renderStats(workouts) {
  const bar = document.getElementById('stats-bar');

  if (workouts.length === 0) { bar.classList.add('d-none'); return; }
  bar.classList.remove('d-none');

  // Total workouts
  document.getElementById('stat-total').textContent = workouts.length;

  // Total volume — reduce() sums sets × reps × weight across every entry
  const totalVolume = workouts.reduce((sum, w) => sum + w.sets * w.reps * w.weight, 0);
  document.getElementById('stat-volume').textContent = totalVolume.toLocaleString() + ' kg';

  // Most trained — build a count map, sort by value descending
  const counts = {};
  workouts.forEach(w => { const k = w.exercise.trim().toLowerCase(); counts[k] = (counts[k] || 0) + 1; });
  const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  document.getElementById('stat-exercise').textContent = top || '—';

  // Last session — sort date strings, pick the last
  const lastDate = workouts.map(w => w.date).sort().at(-1);
  document.getElementById('stat-date').textContent = lastDate ? formatDate(lastDate) : '—';
}

// ── Render table ──────────────────────────────────────────────────────────────

function render() {
  const workouts    = getWorkouts();
  const tbody       = document.getElementById('workout-tbody');
  const tableWrapper = document.getElementById('table-wrapper');
  const emptyState  = document.getElementById('empty-state');

  tbody.innerHTML = '';
  renderStats(workouts);

  if (workouts.length === 0) {
    tableWrapper.classList.add('d-none');
    emptyState.classList.remove('d-none');
    return;
  }

  tableWrapper.classList.remove('d-none');
  emptyState.classList.add('d-none');

  workouts.forEach((w, index) => {
    const volume = w.sets * w.reps * w.weight;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${escapeHTML(w.exercise)}</td>
      <td class="d-none d-md-table-cell">${w.sets}</td>
      <td class="d-none d-md-table-cell">${w.reps}</td>
      <td>${w.weight}</td>
      <td class="volume-cell">${volume.toLocaleString()}</td>
      <td class="d-none d-md-table-cell">${vsLastSessionHTML(volume, getPreviousVolume(workouts, index))}</td>
      <td class="d-none d-sm-table-cell">${formatDate(w.date)}</td>
      <td>
        <div class="d-flex gap-1">
          <button class="btn btn-sm btn-outline-primary btn-action"
            data-action="edit" data-id="${w.id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger btn-action"
            data-action="delete" data-id="${w.id}">Delete</button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });
}

// ── Table button clicks (event delegation) ────────────────────────────────────

document.getElementById('workout-tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { id, action } = btn.dataset;

  if (action === 'edit') {
    localStorage.setItem('workoutToEditId', id);
    globalThis.location.href = 'edit-workout.html';
  } else if (action === 'delete') {
    localStorage.setItem('workoutToDeleteId', id);
    globalThis.location.href = 'delete-workout.html';
  }
});

// ── Clear All ─────────────────────────────────────────────────────────────────

document.getElementById('btn-clear-all').addEventListener('click', function () {
  if (!getWorkouts().length) return;
  if (confirm('Are you sure you want to delete ALL workouts? This cannot be undone.')) {
    localStorage.removeItem('workouts');
    render();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

render();

// ── DummyJSON API — motivational quote ───────────────────────────────────────

try {
  const response = await fetch('https://dummyjson.com/quotes/random');
  const data     = await response.json();
  document.getElementById('hero-quote').textContent = '"' + data.quote + '"';
} catch (err) {
  console.warn('Quote API unavailable:', err.message);
}
