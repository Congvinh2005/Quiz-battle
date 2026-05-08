// ── editor.js ─ Quiz editor logic ──

// Switch active question in sidebar
document.querySelectorAll('.es-q-item').forEach((item, i) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.es-q-item').forEach(q => q.classList.remove('active'));
    item.classList.add('active');
    // TODO: load question data into editor panel
    const title = document.querySelector('.em-title');
    const total = document.querySelectorAll('.es-q-item').length;
    if (title) title.textContent = `Câu hỏi ${i + 1} / ${total}`;
  });
});

// Time chip selection
document.querySelectorAll('.time-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.time-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
  });
});

// Question type toggle
document.querySelectorAll('.qe-type-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qe-type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Mark correct answer
document.querySelectorAll('.opt-correct-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Uncheck all
    document.querySelectorAll('.opt-correct-btn').forEach(b => {
      b.classList.remove('checked');
      b.closest('.option-editor').classList.remove('correct');
      b.closest('.option-editor').querySelector('.opt-letter').style.background = '';
      b.closest('.option-editor').querySelector('.opt-letter').style.color = '';
    });
    // Check selected
    btn.classList.add('checked');
    btn.textContent = '✓';
    const wrapper = btn.closest('.option-editor');
    wrapper.classList.add('correct');
  });
});

// Add new question
const addBtn = document.querySelector('.es-add');
if (addBtn) {
  addBtn.addEventListener('click', () => {
    const sidebar = document.querySelector('.editor-sidebar');
    const items   = sidebar.querySelectorAll('.es-q-item');
    const newNum  = items.length + 1;
    const item    = document.createElement('div');
    item.className = 'es-q-item';
    item.innerHTML = `
      <div class="es-q-num">${newNum}</div>
      <div class="es-q-text">Câu hỏi mới...</div>
    `;
    sidebar.insertBefore(item, addBtn);
  });
}
