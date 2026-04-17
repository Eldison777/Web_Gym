'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getWorkouts() {
  return JSON.parse(localStorage.getItem('workouts') || '[]');
}

function saveWorkouts(workouts) {
  localStorage.setItem('workouts', JSON.stringify(workouts));
}

/**
 * For a given workout entry, find the most recent previous entry for the same
 * exercise (by date, then by array position) and return its volume, or null.
 *
 * "Previous" means an entry whose date is strictly earlier, OR if on the same
 * date, appears earlier in the array (lower index).
 */
function getPreviousVolume(workouts, currentIndex) {
  const current = workouts[currentIndex];
  const currentExercise = current.exercise.trim().toLowerCase();
  const currentDate = current.date;

  let best = null; // { date, index, volume }

  for (let i = 0; i < workouts.length; i++) {
    if (i === currentIndex) continue;
    const w = workouts[i];
    if (w.exercise.trim().toLowerCase() !== currentExercise) continue;

    const isBefore =
      w.date < currentDate ||
      (w.date === currentDate && i < currentIndex);

    if (!isBefore) continue;

    // Pick the most recent previous entry
    if (
      best === null ||
      w.date > best.date ||
      (w.date === best.date && i > best.index)
    ) {
      best = { date: w.date, index: i, volume: w.sets * w.reps * w.weight };
    }
  }

  return best ? best.volume : null;
}

function vsLastSessionHTML(currentVolume, prevVolume) {
  if (prevVolume === null) {
    return '<span class="vs-badge text-primary">First Entry</span>';
  }
  if (currentVolume > prevVolume) {
    return '<span class="vs-badge text-success">&#9650; Improved</span>';
  }
  if (currentVolume < prevVolume) {
    return '<span class="vs-badge text-danger">&#9660; Dropped</span>';
  }
  return '<span class="vs-badge text-secondary">= Same</span>';
}

// ── Render ────────────────────────────────────────────────────────────────────

function render() {
  const workouts = getWorkouts();
  const tbody = document.getElementById('workout-tbody');
  const tableWrapper = document.getElementById('table-wrapper');
  const emptyState = document.getElementById('empty-state');

  tbody.innerHTML = '';

  if (workouts.length === 0) {
    tableWrapper.classList.add('d-none');
    emptyState.classList.remove('d-none');
    return;
  }

  tableWrapper.classList.remove('d-none');
  emptyState.classList.add('d-none');

  workouts.forEach((w, index) => {
    const volume = w.sets * w.reps * w.weight;
    const prevVolume = getPreviousVolume(workouts, index);
    const vsHTML = vsLastSessionHTML(volume, prevVolume);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="fw-semibold">${escapeHTML(w.exercise)}</td>
      <td>${w.sets}</td>
      <td>${w.reps}</td>
      <td>${w.weight}</td>
      <td class="volume-cell">${volume.toLocaleString()}</td>
      <td>${vsHTML}</td>
      <td>${formatDate(w.date)}</td>
      <td>
        <div class="d-flex gap-1">
          <button
            class="btn btn-sm btn-outline-primary btn-action"
            data-action="edit"
            data-id="${w.id}"
          >Edit</button>
          <button
            class="btn btn-sm btn-outline-danger btn-action"
            data-action="delete"
            data-id="${w.id}"
          >Delete</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  // dateStr is YYYY-MM-DD; parse as local date to avoid UTC offset shift
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Event delegation for table actions ───────────────────────────────────────

document.getElementById('workout-tbody').addEventListener('click', function (e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === 'edit') {
    localStorage.setItem('workoutToEditId', id);
    window.location.href = 'edit-workout.html';
  } else if (action === 'delete') {
    localStorage.setItem('workoutToDeleteId', id);
    window.location.href = 'delete-workout.html';
  }
});

// ── Clear All ─────────────────────────────────────────────────────────────────

document.getElementById('btn-clear-all').addEventListener('click', function () {
  if (getWorkouts().length === 0) return;
  if (confirm('Are you sure you want to delete ALL workouts? This cannot be undone.')) {
    localStorage.removeItem('workouts');
    render();
  }
});

// ── Init ──────────────────────────────────────────────────────────────────────

render();
