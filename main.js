(function () {
  var USER_KEY = 'login-site-user';
  var COLOR_KEY = 'login-site-color';
  var themeToggle = document.getElementById('theme-toggle');
  var colorToggle = document.getElementById('theme-color-toggle');
  var navToggle = document.getElementById('nav-toggle');
  var navMenu = document.getElementById('nav-menu');
  var navAuthWrap = document.getElementById('nav-auth-wrap');
  var navUserWrap = document.getElementById('nav-user-wrap');
  var userMenuTrigger = document.getElementById('user-menu-trigger');
  var userMenuDropdown = document.getElementById('user-menu-dropdown');
  var userNameEl = document.getElementById('user-name');
  var userAvatarEl = document.getElementById('user-avatar');
  var userAvatarImg = document.getElementById('user-avatar-img');
  var userAvatarIcon = document.getElementById('user-avatar-icon');
  var avatarInput = document.getElementById('avatar-input');
  var profileModal = document.getElementById('profile-modal');
  var profileForm = document.getElementById('profile-form');
  var profileNameInput = document.getElementById('profile-name');
  var adminUsersModal = document.getElementById('admin-users-modal');
  var adminUsersList = document.getElementById('admin-users-list');

  function getStoredTheme() {
    try {
      return localStorage.getItem('login-site-theme') || 'light';
    } catch (_) {
      return 'light';
    }
  }

  function setTheme(theme) {
    document.body.classList.toggle('theme-light', theme === 'light');
    try {
      localStorage.setItem('login-site-theme', theme);
    } catch (_) {}
  }

  setTheme(getStoredTheme());

  // 顏色主題
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

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isLight = document.body.classList.contains('theme-light');
      setTheme(isLight ? 'dark' : 'light');
    });
  }

  if (colorToggle) {
    colorToggle.addEventListener('click', function () {
      var current = getStoredColor();
      var order = ['violet', 'teal', 'amber'];
      var idx = order.indexOf(current);
      var next = order[(idx + 1) % order.length];
      setColorTheme(next);
    });
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open);
      navToggle.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
    });
  }

  function getUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function saveUser(user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (_) {}
  }

  function renderUserMenu() {
    var user = getUser();
    if (!user) {
      if (navAuthWrap) navAuthWrap.style.display = '';
      if (navUserWrap) navUserWrap.style.display = 'none';
      return;
    }
    if (navAuthWrap) navAuthWrap.style.display = 'none';
    if (navUserWrap) navUserWrap.style.display = '';
    if (userNameEl) userNameEl.textContent = user.name || user.email || '使用者';
    if (userAvatarImg && userAvatarIcon) {
      if (user.avatar) {
        userAvatarImg.src = user.avatar;
        userAvatarImg.alt = user.name || '頭像';
        userAvatarImg.style.display = '';
        userAvatarIcon.style.display = 'none';
      } else {
        userAvatarImg.removeAttribute('src');
        userAvatarImg.style.display = 'none';
        userAvatarIcon.style.display = '';
      }
    }

    // 根據是否為 admin 顯示管理項目
    var isAdmin = !!user.isAdmin;
    document.querySelectorAll('.user-menu-item-admin').forEach(function (el) {
      el.style.display = isAdmin ? '' : 'none';
    });
  }

  function closeUserDropdown() {
    if (userMenuDropdown) userMenuDropdown.classList.remove('open');
    if (userMenuTrigger) userMenuTrigger.setAttribute('aria-expanded', 'false');
  }

  renderUserMenu();

  if (userMenuTrigger && userMenuDropdown) {
    userMenuTrigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = userMenuDropdown.classList.toggle('open');
      userMenuTrigger.setAttribute('aria-expanded', open);
    });
    document.addEventListener('click', function () {
      closeUserDropdown();
    });
    userMenuDropdown.addEventListener('click', function (e) {
      e.stopPropagation();
    });
  }

  document.querySelectorAll('.user-menu-item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var action = this.getAttribute('data-action');
      closeUserDropdown();
      if (action === 'logout') {
        try {
          localStorage.removeItem(USER_KEY);
        } catch (_) {}
        window.location.reload();
      } else if (action === 'avatar') {
        if (avatarInput) avatarInput.click();
      } else if (action === 'profile') {
        var user = getUser();
        if (profileNameInput && user) {
          profileNameInput.value = user.name || '';
          if (profileModal) {
            profileModal.hidden = false;
            profileModal.removeAttribute('hidden');
          }
        }
      } else if (action === 'admin-download') {
        var user = getUser();
        if (!user || !user.isAdmin) return;
        window.location.href = '/admin/users-file';
      } else if (action === 'admin-users') {
        var u = getUser();
        if (!u || !u.isAdmin) return;
        if (!adminUsersModal || !adminUsersList) return;
        adminUsersModal.hidden = false;
        adminUsersModal.removeAttribute('hidden');
        adminUsersList.textContent = '載入中...';
        fetch('/admin/users')
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (!data.ok || !Array.isArray(data.users)) {
              adminUsersList.textContent = '載入失敗';
              return;
            }
            if (!data.users.length) {
              adminUsersList.textContent = '目前沒有使用者。';
              return;
            }
            var html = '<table><thead><tr><th>名稱</th><th>Email</th><th>建立時間</th></tr></thead><tbody>';
            data.users.forEach(function (user) {
              html += '<tr><td>' + (user.name || '') + '</td><td>' + (user.email || '') + '</td><td>' + (user.created_at || '') + '</td></tr>';
            });
            html += '</tbody></table>';
            adminUsersList.innerHTML = html;
          })
          .catch(function () {
            adminUsersList.textContent = '載入失敗';
          });
      }
    });
  });

  if (avatarInput) {
    avatarInput.addEventListener('change', function () {
      var file = this.files && this.files[0];
      if (!file || !file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function () {
        var user = getUser();
        if (!user) return;
        user.avatar = reader.result;
        saveUser(user);
        renderUserMenu();
      };
      reader.readAsDataURL(file);
      this.value = '';
    });
  }

  if (profileForm && profileNameInput && profileModal) {
    profileForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = profileNameInput.value.trim();
      var user = getUser();
      if (!user) return;
      user.name = name;
      saveUser(user);
      renderUserMenu();
      profileModal.hidden = true;
      profileModal.setAttribute('hidden', '');
    });
  }

  document.querySelectorAll('[data-close="profile-modal"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (profileModal) {
        profileModal.hidden = true;
        profileModal.setAttribute('hidden', '');
      }
    });
  });

  document.querySelectorAll('[data-close="admin-users-modal"]').forEach(function (el) {
    el.addEventListener('click', function () {
      if (adminUsersModal) {
        adminUsersModal.hidden = true;
        adminUsersModal.setAttribute('hidden', '');
      }
    });
  });
})();
