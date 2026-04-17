'use strict';

// ── Load workout on page init ─────────────────────────────────────────────────

const deleteId = Number(localStorage.getItem('workoutToDeleteId'));
const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
const workout  = workouts.find(function (w) { return w.id === deleteId; });

const notFound       = document.getElementById('not-found');
const confirmWrapper = document.getElementById('confirm-wrapper');
const detailsEl      = document.getElementById('workout-details');

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

if (!workout) {
  notFound.classList.remove('d-none');
} else {
  confirmWrapper.classList.remove('d-none');

  const rows = [
    { label: 'Exercise', value: escapeHTML(workout.exercise) },
    { label: 'Sets',     value: workout.sets },
    { label: 'Reps',     value: workout.reps },
    { label: 'Weight',   value: workout.weight + ' kg' },
    { label: 'Volume',   value: (workout.sets * workout.reps * workout.weight).toLocaleString() + ' kg' },
    { label: 'Date',     value: formatDate(workout.date) },
  ];

  detailsEl.innerHTML = rows.map(function (r) {
    return `
      <div class="detail-row">
        <span class="detail-label">${r.label}</span>
        <span class="detail-value">${r.value}</span>
      </div>
    `;
  }).join('');
}

// ── Delete confirmation ───────────────────────────────────────────────────────

document.getElementById('btn-confirm-delete').addEventListener('click', function () {
  const stored = JSON.parse(localStorage.getItem('workouts') || '[]');
  const updated = stored.filter(function (w) { return w.id !== deleteId; });
  localStorage.setItem('workouts', JSON.stringify(updated));
  localStorage.removeItem('workoutToDeleteId');
  window.location.href = 'index.html';
});
