// ── Set today's date as default ───────────────────────────────────────────────

document.getElementById('date').value = new Date().toISOString().slice(0, 10);

// ── Form submission ───────────────────────────────────────────────────────────

document.getElementById('add-workout-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  const newWorkout = {
    id:       Date.now(),
    exercise: document.getElementById('exercise').value.trim(),
    sets:     Number.parseInt(document.getElementById('sets').value, 10),
    reps:     Number.parseInt(document.getElementById('reps').value, 10),
    weight:   Number.parseFloat(document.getElementById('weight').value),
    date:     document.getElementById('date').value,
  };

  const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
  workouts.push(newWorkout);
  localStorage.setItem('workouts', JSON.stringify(workouts));

  globalThis.location.href = 'index.html';
});
