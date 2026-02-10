// Very simple front-end admin login (for demo purposes only)

window.addEventListener('load', () => {
  const alreadyAdmin =
    localStorage.getItem('maramadakki_admin_logged_in') === 'true';
  if (alreadyAdmin) {
    window.location.href = 'admin.html';
    return;
  }

  const form = document.getElementById('adminLoginForm');
  const errorEl = document.getElementById('adminLoginError');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    // Admin credentials (change here if needed)
    const VALID_USERNAME = 'karthi';
    const VALID_PASSWORD = '12345';

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      localStorage.setItem('maramadakki_admin_logged_in', 'true');
      window.location.href = 'admin.html';
    } else if (errorEl) {
      errorEl.style.display = 'block';
    }
  });
});

