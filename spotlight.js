(function () {
  var selector = '.theme-toggle, .nav-toggle, .back-home, .nav-link, .tab, .btn, .password-toggle, .user-menu-trigger, .user-menu-item';
  function handleMove(e) {
    var el = e.currentTarget;
    var rect = el.getBoundingClientRect();
    var x = ((e.clientX - rect.left) / rect.width) * 100;
    var y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--spot-x', x + '%');
    el.style.setProperty('--spot-y', y + '%');
  }
  function handleLeave(e) {
    e.currentTarget.style.removeProperty('--spot-x');
    e.currentTarget.style.removeProperty('--spot-y');
  }
  document.querySelectorAll(selector).forEach(function (el) {
    el.classList.add('has-spotlight');
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
  });
})();
