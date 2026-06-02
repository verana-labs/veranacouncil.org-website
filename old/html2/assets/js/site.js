/* veranacouncil.org — site.js
   Handles: partial includes (header/footer), mobile nav toggle, dismissible
   announcement bar, GDPR cookie consent, active-nav highlighting. Vanilla JS. */

(function () {
  'use strict';

  // ---- Theme (light / dark) ---------------------------------------------
  // Runs as early as possible to minimise FOUC. Priority order:
  //   1. Explicit user choice in localStorage (vc_theme = "light" | "dark").
  //   2. OS-level prefers-color-scheme.
  //   3. Light (default).
  var THEME_KEY = 'vc_theme';
  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    // Update any toggles' aria-pressed state.
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(theme === 'dark'));
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  var initialTheme = getStoredTheme() || (systemPrefersDark() ? 'dark' : 'light');
  applyTheme(initialTheme);

  // Follow system changes only if the user has not made an explicit choice.
  if (window.matchMedia) {
    try {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!getStoredTheme()) applyTheme(e.matches ? 'dark' : 'light');
      });
    } catch (e) { /* older Safari: ignore */ }
  }

  // ---- Partial includes --------------------------------------------------
  // Elements with data-include="/path" get their innerHTML replaced with the
  // fetched content. Pages with inlined header/footer (e.g. index.html) simply
  // omit the data-include attribute.
  var includes = document.querySelectorAll('[data-include]');
  var pending = Promise.resolve();
  if (includes.length > 0 && typeof fetch === 'function') {
    pending = Promise.all(
      Array.prototype.map.call(includes, function (el) {
        var url = el.getAttribute('data-include');
        return fetch(url, { credentials: 'same-origin', cache: 'no-cache' })
          .then(function (r) { return r.ok ? r.text() : ''; })
          .then(function (html) {
            el.outerHTML = html;
          })
          .catch(function () { /* leave placeholder empty */ });
      })
    );
  }

  pending.then(init);

  function init() {

  // ---- Theme toggle wiring -----------------------------------------------
  // The init phase runs after partials are injected, so toggles inside
  // header.html are now in the DOM. Re-sync aria state and bind clicks.
  var currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.setAttribute('aria-pressed', String(currentTheme === 'dark'));
    btn.setAttribute('aria-label', currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    btn.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
    });
  });

  // ---- Mobile nav toggle -------------------------------------------------
  var navToggle = document.querySelector('[data-nav-toggle]');
  var navMenu = document.querySelector('[data-nav-menu]');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('hidden');
    });
  }

  // ---- Announcement bar dismiss ------------------------------------------
  var bar = document.querySelector('[data-announcement]');
  if (bar) {
    if (localStorage.getItem('vc_announce_dismissed') === '1') {
      bar.setAttribute('data-dismissed', 'true');
    }
    var dismissBtn = bar.querySelector('[data-announcement-dismiss]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        bar.setAttribute('data-dismissed', 'true');
        try { localStorage.setItem('vc_announce_dismissed', '1'); } catch (e) {}
      });
    }
  }

  // ---- Cookie consent ----------------------------------------------------
  var cookie = document.querySelector('[data-cookie-banner]');
  if (cookie) {
    var decision = localStorage.getItem('vc_cookie_decision');
    if (!decision) {
      cookie.removeAttribute('data-dismissed');
    }
    cookie.querySelectorAll('[data-cookie-action]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-cookie-action');
        try { localStorage.setItem('vc_cookie_decision', action); } catch (e) {}
        cookie.setAttribute('data-dismissed', 'true');
      });
    });
  }

  // ---- Active nav highlighting ------------------------------------------
  var path = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/+$/, '/') || '/';
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    var linkPath = link.getAttribute('href') || '';
    if (linkPath === '/') return;
    // Mark active if the current path starts with the nav link's path.
    if (path === linkPath || (linkPath !== '/' && path.indexOf(linkPath) === 0)) {
      link.setAttribute('aria-current', 'page');
    }
  });

  // ---- Current year in footer ---------------------------------------
  var y = document.querySelector('[data-current-year]');
  if (y) y.textContent = new Date().getFullYear();
  } // end init()
})();
