// delete-workout.js — module script

// ── Load workout on page init ─────────────────────────────────────────────────

const deleteId = Number(localStorage.getItem('workoutToDeleteId'));
const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
const workout  = workouts.find(w => w.id === deleteId);

const notFound       = document.getElementById('not-found');
const confirmWrapper = document.getElementById('confirm-wrapper');
const detailsEl      = document.getElementById('workout-details');

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

  detailsEl.innerHTML = rows.map(r => `
    <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
      <span class="text-secondary small text-uppercase fw-bold" style="letter-spacing:0.08em">${r.label}</span>
      <span class="fw-semibold">${r.value}</span>
    </div>
  `).join('');
}

// ── Delete confirmation ───────────────────────────────────────────────────────

document.getElementById('btn-confirm-delete').addEventListener('click', function () {
  const stored  = JSON.parse(localStorage.getItem('workouts') || '[]');
  const updated = stored.filter(w => w.id !== deleteId);
  localStorage.setItem('workouts', JSON.stringify(updated));
  localStorage.removeItem('workoutToDeleteId');
  globalThis.location.href = 'index.html';
});
