// ── game.js ─ Gameplay logic ──

// Answer selection
function selectAnswer(el, opt) {
  document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

// Countdown timer
let timerInterval;

function startTimer(seconds = 30) {
  clearInterval(timerInterval);
  let t = seconds;
  const circle = document.getElementById('timerCircle');
  const num    = document.getElementById('timerNum');
  const circ   = 2 * Math.PI * 20; // circumference for r=20

  if (num) num.textContent = t;

  timerInterval = setInterval(() => {
    t--;
    if (num) num.textContent = t;
    if (circle) {
      const offset = circ - (t / seconds) * circ;
      circle.style.strokeDashoffset = offset;
      if (t <= 5)       circle.style.stroke = '#EF4444';
      else if (t <= 10) circle.style.stroke = '#F59E0B';
      else              circle.style.stroke = 'var(--primary)';
    }
    if (t <= 0) {
      clearInterval(timerInterval);
      onTimerEnd();
    }
  }, 1000);
}

function onTimerEnd() {
  // Auto-advance or show correct answer – extend as needed
  console.log('Time up!');
}

// Start timer when page loads
document.addEventListener('DOMContentLoaded', () => startTimer(30));
