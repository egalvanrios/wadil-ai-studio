(function () {
  'use strict';

  /* ── i18n ───────────────────────────────────────────────── */
  var stored = localStorage.getItem('wadil_lang');
  var lang = stored || (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

  function getKey(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }

  /* ── Insights en video — grid curado a mano (ver drafts/wadil-vlog-recomendacion.md) ──
     Reemplaza estos IDs por videos reales del canal antes de publicar.
     "id" es lo que va después de "v=" o "shorts/" en la URL de YouTube. */
  var WADIL_VIDEOS = [
    { id: 'VIDEO_ID_1', format: 'Short', title: 'Título del video 1', desc: 'Descripción breve o dimensión que aborda.' },
    { id: 'VIDEO_ID_2', format: 'Video', title: 'Título del video 2', desc: 'Descripción breve o dimensión que aborda.' },
    { id: 'VIDEO_ID_3', format: 'Short', title: 'Título del video 3', desc: 'Descripción breve o dimensión que aborda.' }
  ];

  function renderVideos(l) {
    var grid = document.getElementById('videosGrid');
    if (!grid) return;
    var t = WADIL_I18N[l] || WADIL_I18N.es;
    grid.innerHTML = '';

    WADIL_VIDEOS.forEach(function (v) {
      var card = document.createElement('article');
      card.className = 'video-card';

      var thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'video-card__thumb';
      thumb.setAttribute('aria-label', t.insights.aria_play_prefix + ' ' + v.title);
      thumb.innerHTML =
        '<span class="video-card__format">' + v.format + '</span>' +
        /* hqdefault.jpg 404s to a generic 120x90 gray JPEG for placeholder IDs (still loads fine,
           just tiny) — drop it on error or on that known placeholder size so the CSS gradient shows. */
        '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy" ' +
          'onerror="this.remove()" onload="if(this.naturalWidth<=120)this.remove()">' +
        '<span class="video-card__play">' +
          '<svg viewBox="0 0 68 48"><path fill="#EE1B1B" d="M66.5 7.7c-.8-3-2.9-5.3-5.7-6.1C55.8 0 34 0 34 0S12.2 0 7.2 1.6C4.4 2.4 2.3 4.7 1.5 7.7 0 13 0 24 0 24s0 11 1.5 16.3c.8 3 2.9 5.2 5.7 6C12.2 48 34 48 34 48s21.8 0 26.8-1.6c2.8-.8 4.9-3 5.7-6C68 35 68 24 68 24s0-11-1.5-16.3z"/><path fill="#fff" d="M45 24 27 14v20z"/></svg>' +
        '</span>';

      thumb.addEventListener('click', function () {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube.com/embed/' + v.id + '?autoplay=1';
        iframe.title = v.title;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        thumb.replaceWith(iframe);
      });

      var h4 = document.createElement('h4');
      h4.textContent = v.title;
      var p = document.createElement('p');
      p.textContent = v.desc;

      card.appendChild(thumb);
      card.appendChild(h4);
      card.appendChild(p);
      grid.appendChild(card);
    });
  }

  function applyLang(l) {
    var t = WADIL_I18N[l];
    if (!t) return;
    lang = l;
    localStorage.setItem('wadil_lang', l);
    document.documentElement.lang = l;
    document.title = t.meta.title;

    var sel = function (s) { return document.querySelector(s); };
    var setMeta = function (s, v) { var el = sel(s); if (el && v) el.setAttribute('content', v); };
    setMeta('meta[name="description"]', t.meta.description);
    setMeta('meta[property="og:title"]', t.meta.title);
    setMeta('meta[property="og:description"]', t.meta.description);
    setMeta('meta[property="og:locale"]', l === 'es' ? 'es_MX' : 'en_US');
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

    renderVideos(l);
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
