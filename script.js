(function () {
  const THEME_KEY = 'login-site-theme';
  const COLOR_KEY = 'login-site-color';
  const tabButtons = document.querySelectorAll('.card-header .tab');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const themeToggle = document.getElementById('theme-toggle');
  const toastEl = document.getElementById('toast');
  const formProgress = document.getElementById('form-progress');
  const colorToggle = document.getElementById('theme-color-toggle');

  // ----- 深色 / 淺色模式 -----
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch (_) {
      return 'light';
    }
  }

  function setTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {}
  }

  setTheme(getStoredTheme());

  // ----- 顏色主題 -----
  function getStoredColor() {
    try {
      return localStorage.getItem(COLOR_KEY) || 'violet';
    } catch (_) {
      return 'violet';
    }
  }

  function setColorTheme(theme) {
    document.body.classList.remove('theme-color-teal', 'theme-color-amber');
    if (theme === 'teal') {
      document.body.classList.add('theme-color-teal');
    } else if (theme === 'amber') {
      document.body.classList.add('theme-color-amber');
    }
    try {
      localStorage.setItem(COLOR_KEY, theme);
    } catch (_) {}
  }

  setColorTheme(getStoredColor());

  var pageLoader = document.getElementById('page-loader');
  if (pageLoader) {
    function hideLoader() {
      pageLoader.classList.add('done');
    }
    if (document.readyState === 'complete') {
      setTimeout(hideLoader, 80);
    } else {
      window.addEventListener('load', function () {
        setTimeout(hideLoader, 80);
      });
    }
  }

  themeToggle.addEventListener('click', function () {
    const isLight = document.body.classList.contains('theme-light');
    setTheme(isLight ? 'dark' : 'light');
  });

  if (colorToggle) {
    colorToggle.addEventListener('click', function () {
      var current = getStoredColor();
      var order = ['violet', 'teal', 'amber'];
      var idx = order.indexOf(current);
      var next = order[(idx + 1) % order.length];
      setColorTheme(next);
    });
  }

  // ----- Toast 訊息 -----
  function showToast(message, type) {
    toastEl.textContent = message;
    toastEl.className = 'toast show ' + (type === 'success' ? 'success' : type === 'error' ? 'error' : '');
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 3500);
  }

  // ----- 密碼顯示/隱藏切換 -----
  document.querySelectorAll('.password-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = this.getAttribute('data-for');
      var input = document.getElementById(id);
      if (!input) return;
      var isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.setAttribute('aria-label', isPassword ? '隱藏密碼' : '顯示密碼');
      btn.setAttribute('title', isPassword ? '隱藏密碼' : '顯示密碼');
      btn.classList.toggle('visible', isPassword);
    });
  });

  // ----- 切換登入 / 註冊 -----
  tabButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = this.dataset.tab;
      tabButtons.forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      formLogin.classList.toggle('active', tab === 'login');
      formRegister.classList.toggle('active', tab === 'register');
    });
  });

  // ----- 登入表單送出（呼叫 PHP）-----
  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = formLogin.querySelector('#login-email').value.trim();
    const password = formLogin.querySelector('#login-password').value;
    if (!email || !password) return;

    var btn = formLogin.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = '登入中…';
    if (formProgress) formProgress.classList.add('active');

    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!data.ok) throw new Error(data.message || '登入失敗');
          return data;
        });
      })
      .then(function (data) {
        var user = data.user ? { name: data.user.name || '', email: data.user.email || '', avatar: null, isAdmin: !!data.user.isAdmin } : null;
        if (user) {
          try { localStorage.setItem('login-site-user', JSON.stringify(user)); } catch (_) {}
          window.location.href = 'index.html';
          return;
        }
        var welcome = data.user ? ' 歡迎，' + (data.user.name || data.user.email) + '！' : '';
        showToast(data.message + welcome, 'success');
        formLogin.reset();
      })
      .catch(function (err) {
        showToast(err.message || '連線錯誤，請稍後再試', 'error');
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = '登入';
        if (formProgress) formProgress.classList.remove('active');
      });
  });

  // ----- 註冊表單送出（呼叫 API，含密碼二次驗證）-----
  formRegister.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = formRegister.querySelector('#register-name').value.trim();
    const email = formRegister.querySelector('#register-email').value.trim();
    const password = formRegister.querySelector('#register-password').value;
    const passwordConfirm = formRegister.querySelector('#register-password-confirm').value;
    if (!name || !email || !password || !passwordConfirm) return;
    if (password.length < 8) {
      showToast('密碼請至少 8 個字元', 'error');
      return;
    }
    if (password !== passwordConfirm) {
      showToast('兩次輸入的密碼不一致，請重新輸入', 'error');
      return;
    }

    var btn = formRegister.querySelector('.btn-primary');
    btn.disabled = true;
    btn.textContent = '註冊中…';
    if (formProgress) formProgress.classList.add('active');

    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, password: password }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!data.ok) throw new Error(data.message || '註冊失敗');
          return data;
        });
      })
      .then(function (data) {
        var user = { name: name, email: email, avatar: null };
        try { localStorage.setItem('login-site-user', JSON.stringify(user)); } catch (_) {}
        window.location.href = 'index.html';
      })
      .catch(function (err) {
        showToast(err.message || '連線錯誤，請稍後再試', 'error');
      })
      .finally(function () {
        btn.disabled = false;
        btn.textContent = '建立帳號';
        if (formProgress) formProgress.classList.remove('active');
      });
  });
})();
