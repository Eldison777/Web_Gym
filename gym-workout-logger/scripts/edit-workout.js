'use strict';

// ── Load workout on page init ─────────────────────────────────────────────────

const editId = Number(localStorage.getItem('workoutToEditId'));
const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
const workoutIndex = workouts.findIndex(function (w) { return w.id === editId; });

const form = document.getElementById('edit-workout-form');
const notFound = document.getElementById('not-found');

if (workoutIndex === -1) {
  // Hide form, show error
  form.classList.add('d-none');
  notFound.classList.remove('d-none');
} else {
  const w = workouts[workoutIndex];
  document.getElementById('exercise').value = w.exercise;
  document.getElementById('sets').value     = w.sets;
  document.getElementById('reps').value     = w.reps;
  document.getElementById('weight').value   = w.weight;
  document.getElementById('date').value     = w.date;
}

// ── Form submission ───────────────────────────────────────────────────────────

form.addEventListener('submit', function (e) {
  e.preventDefault();

  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  // Re-read from storage in case another tab made changes
  const stored = JSON.parse(localStorage.getItem('workouts') || '[]');
  const idx = stored.findIndex(function (w) { return w.id === editId; });

  if (idx === -1) {
    alert('Workout no longer exists.');
    window.location.href = 'index.html';
    return;
  }

  stored[idx] = {
    id:       editId,
    exercise: document.getElementById('exercise').value.trim(),
    sets:     parseInt(document.getElementById('sets').value, 10),
    reps:     parseInt(document.getElementById('reps').value, 10),
    weight:   parseFloat(document.getElementById('weight').value),
    date:     document.getElementById('date').value,
  };

  localStorage.setItem('workouts', JSON.stringify(stored));
  localStorage.removeItem('workoutToEditId');

  window.location.href = 'index.html';
});
