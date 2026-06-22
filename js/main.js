(function () {
  'use strict';

  /* ── i18n ───────────────────────────────────────────────── */
  var lang = localStorage.getItem('wadil_lang') || 'es';

  function getKey(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }

  function applyLang(l) {
    var t = WADIL_I18N[l];
    if (!t) return;
    lang = l;
    localStorage.setItem('wadil_lang', l);
    document.documentElement.lang = l;
    document.title = t.meta.title;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var val = getKey(t, el.dataset.i18n);
      if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var val = getKey(t, el.dataset.i18nHtml);
      if (val !== undefined) el.innerHTML = val;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var val = getKey(t, el.dataset.i18nAria);
      if (val !== undefined) el.setAttribute('aria-label', val);
    });

    var btn = document.getElementById('lang-toggle');
    if (btn) btn.textContent = t.nav.lang_label;
  }

  /* ── Interactions ───────────────────────────────────────── */
  function setup() {
    applyLang(lang);

    // Sticky header shadow
    var header = document.getElementById('site-header');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Scroll reveal
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    }

    // Smooth anchor scroll with sticky-header offset
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var y = target.getBoundingClientRect().top + window.scrollY - 64;
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    // Language toggle
    var btn = document.getElementById('lang-toggle');
    if (btn) {
      btn.addEventListener('click', function () {
        applyLang(lang === 'es' ? 'en' : 'es');
      });
    }
  }

  if (document.readyState !== 'loading') {
    setup();
  } else {
    document.addEventListener('DOMContentLoaded', setup);
  }
})();
