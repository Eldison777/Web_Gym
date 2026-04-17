'use strict';

// ── Set today's date as default ───────────────────────────────────────────────

document.getElementById('date').value = new Date().toISOString().slice(0, 10);

// ── Form submission ───────────────────────────────────────────────────────────

document.getElementById('add-workout-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;

  // Bootstrap validation
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  const exercise = document.getElementById('exercise').value.trim();
  const sets     = parseInt(document.getElementById('sets').value, 10);
  const reps     = parseInt(document.getElementById('reps').value, 10);
  const weight   = parseFloat(document.getElementById('weight').value);
  const date     = document.getElementById('date').value;

  const newWorkout = {
    id: Date.now(),
    exercise,
    sets,
    reps,
    weight,
    date,
  };

  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
  workouts.push(newWorkout);
  localStorage.setItem('workouts', JSON.stringify(workouts));

  window.location.href = 'index.html';
});
