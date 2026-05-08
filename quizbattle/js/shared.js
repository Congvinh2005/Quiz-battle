// ── shared.js ─ Navigation & utilities ──

/**
 * Navigate to a page by name.
 * Maps page names to their HTML files.
 */
const PAGE_MAP = {
  login:       'login.html',
  register:    'register.html',
  home:        'dashboard.html',
  editor:      'editor.html',
  'create-room': 'create-room.html',
  lobby:       'lobby.html',
  game:        'game.html',
  result:      'result.html',
};

function navigateTo(page) {
  const target = PAGE_MAP[page];
  if (target) window.location.href = target;
}

/**
 * Highlight the active nav tab on the current page.
 * Call with the page key (e.g. 'login') after DOM loads.
 */
function setActiveNavTab(currentPage) {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
    // Check if the onclick handler contains the current page name
    if (tab.getAttribute('onclick')?.includes(`navigateTo('${currentPage}')`)) {
      tab.classList.add('active');
    }
  });
}

/**
 * Render the shared top nav into #nav-placeholder.
 * Each page HTML should have <div id="nav-placeholder"></div>.
 */
function renderNav(activePage) {
  const nav = document.getElementById('nav-placeholder');
  if (!nav) return;

  const isAuthPage = ['login', 'register'].includes(activePage);

  nav.innerHTML = `
    <nav class="app-nav">
      <div class="nav-logo" onclick="navigateTo('home')" style="cursor:pointer">Quiz<span>Battle</span></div>
      ${!isAuthPage ? `
        <div class="nav-tabs">
          <button class="nav-tab" onclick="navigateTo('home')">🏠 Dashboard</button>
          <button class="nav-tab" onclick="navigateTo('editor')">✏️ Tạo Quiz</button>
          <button class="nav-tab" onclick="navigateTo('create-room')">🎮 Tạo phòng</button>
          <button class="nav-tab" onclick="navigateTo('lobby')">👥 Lobby</button>
          <button class="nav-tab" onclick="navigateTo('game')">⚡ Gameplay</button>
          <button class="nav-tab" onclick="navigateTo('result')">🏆 Kết quả</button>
          <button class="nav-tab" onclick="navigateTo('login')" style="color:var(--accent);margin-left:auto">🚪 Đăng xuất</button>
        </div>
      ` : ''}
    </nav>
  `;
  setActiveNavTab(activePage);
}
