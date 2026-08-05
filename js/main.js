(function () {
  'use strict';

  /* ── i18n ───────────────────────────────────────────────── */
  var stored = localStorage.getItem('wadil_lang');
  var lang = stored || (navigator.language && navigator.language.startsWith('es') ? 'es' : 'en');

  function getKey(obj, path) {
    return path.split('.').reduce(function (o, k) { return o && o[k]; }, obj);
  }

  /* Set once scroll-reveal is wired up in setup(); lets renderVideos() hook
     re-created cards (on lang switch) into the same observer instead of
     staying stuck at opacity:0 forever. */
  var observeReveal = null;

  /* ── Insights en video — grid curado a mano ── "id" es lo que va después de
     "v=" o "shorts/" en la URL de YouTube. Thumbnail se jala automático de
     i.ytimg.com con ese id, no requiere imagen aparte. */
  var WADIL_VIDEOS = {
    es: [
      { id: '_NGWShjASvk', format: 'Video', title: 'Presentación Wadil AI Studio', desc: 'Conoce qué es Wadil AI Studio y cómo podemos ayudarte.' },
      { id: '0T5WuN8cL-Y', format: 'Short', title: 'La Experiencia Aplicada Cambia Todo', desc: 'Según BCG, el 70% del retorno de inversión de una implementación con IA depende de cambiar procesos y capacitar a la gente. Nosotros alineamos tecnología, diseño de usuario y preparación humana desde el principio.' },
      { id: '7fe_nceDsN8', format: 'Short', title: 'Herramientas de IA Subutilizadas', desc: 'En muchas PyMEs utilizan la IA únicamente para el diseño visual, pero aún vemos equipos que están saturados con análisis de datos manuales. La forma de cerrar esta brecha es con capacitación personalizada y enfocada en casos reales.' },
      { id: 'C7aSagToe48', format: 'Video', title: 'La Solución al Desorden de Datos para Implementar IA', desc: 'El éxito de la IA no depende solo del algoritmo, sino del orden de tu información interna, podemos ayudarte a implementar la estrategia de transformación de datos.' }
    ],
    en: [
      { id: '_NGWShjASvk', format: 'Video', title: 'Wadil AI Studio Introduction', desc: 'Learn what Wadil AI Studio is and how we can help you.' },
      { id: '0T5WuN8cL-Y', format: 'Short', title: 'Applied Experience Changes Everything', desc: 'According to BCG, 70% of the ROI from an AI implementation depends on changing processes and training people. We align technology, user experience design, and human readiness from day one.' },
      { id: '7fe_nceDsN8', format: 'Short', title: 'Underutilized AI Tools', desc: 'Many SMBs use AI only for visual design, yet we still see teams overwhelmed by manual data analysis. Closing that gap takes personalized training focused on real use cases.' },
      { id: 'C7aSagToe48', format: 'Video', title: 'The Fix for Data Chaos Before Implementing AI', desc: "AI success doesn't depend only on the algorithm — it depends on the order of your internal data. We can help you implement a data transformation strategy." }
    ]
  };

  /* Format icon markup — inline width/height + stroke/fill on the <svg> tag itself
     (not only in CSS) so a missing/broken stylesheet can never blow these up to
     browser-default (huge, black-filled) size. */
  var WADIL_FORMAT_ICONS = {
    Short: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z"></path></svg>',
    Video: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M10 8.5 16 12l-6 3.5z" fill="currentColor" stroke="none"></path></svg>'
  };

  function renderVideos(l) {
    var grid = document.getElementById('videosGrid');
    if (!grid) return;
    var t = WADIL_I18N[l] || WADIL_I18N.es;
    var videos = WADIL_VIDEOS[l] || WADIL_VIDEOS.es;
    grid.innerHTML = '';

    videos.forEach(function (v, i) {
      var card = document.createElement('article');
      card.className = 'video-card reveal';
      if (i > 0) card.setAttribute('data-d', String(i));

      var thumb = document.createElement('div');
      thumb.className = 'video-card__thumb';
      var formatIco = WADIL_FORMAT_ICONS[v.format] || '';

      var play = document.createElement('button');
      play.type = 'button';
      play.className = 'video-card__play';
      play.setAttribute('aria-label', t.insights.aria_play_prefix + ' ' + v.title);
      play.setAttribute('data-video-id', v.id);
      play.setAttribute('data-video-title', v.title);
      play.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"></path></svg>';

      thumb.innerHTML =
        '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="" loading="lazy">' +
        '<span class="video-card__format">' + formatIco + '<span>' + v.format + '</span></span>';
      thumb.appendChild(play);

      var h4 = document.createElement('h4');
      h4.textContent = v.title;
      var p = document.createElement('p');
      p.textContent = v.desc;

      card.appendChild(thumb);
      card.appendChild(h4);
      card.appendChild(p);
      grid.appendChild(card);
      if (observeReveal) observeReveal(card);
    });
  }

  /* ── Video modal (opens on .video-card__play click, ready to embed the real player
     once WADIL_VIDEOS has real YouTube IDs) ────────────────────────────────────── */
  var videoModalPlaceholder = '<svg width="30" height="30" viewBox="0 0 24 24" fill="rgba(255,255,255,.7)"><path d="M8 5v14l11-7z"></path></svg>';

  function setupVideoModal() {
    var modal = document.getElementById('videoModal');
    if (!modal) return;
    var frame = document.getElementById('videoModalFrame');
    var titleEl = modal.querySelector('.video-modal__title');

    var open = function (id, title) {
      titleEl.textContent = title || '';
      frame.innerHTML = '<iframe src="https://www.youtube.com/embed/' + id + '" title="' + title + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    };
    var close = function () {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      frame.innerHTML = videoModalPlaceholder;
    };

    document.addEventListener('click', function (e) {
      var playBtn = e.target.closest('.video-card__play');
      if (playBtn) { open(playBtn.getAttribute('data-video-id'), playBtn.getAttribute('data-video-title')); return; }
      if (e.target.closest('[data-video-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  /* ── FAQ accordion (exclusive open, no third-party library) ─────────────────── */
  function setupFaq() {
    document.querySelectorAll('.faq__q').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq__item');
        var wasOpen = item.classList.contains('is-open');
        item.parentElement.querySelectorAll('.faq__item.is-open').forEach(function (o) {
          if (o !== item) { o.classList.remove('is-open'); o.querySelector('.faq__q').setAttribute('aria-expanded', 'false'); }
        });
        item.classList.toggle('is-open', !wasOpen);
        btn.setAttribute('aria-expanded', String(!wasOpen));
      });
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
      observeReveal = function (el) { el.classList.add('in'); };
      reveals.forEach(observeReveal);
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
      observeReveal = function (el) { io.observe(el); };
      reveals.forEach(observeReveal);
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

    setupVideoModal();
    setupFaq();
  }

  if (document.readyState !== 'loading') {
    setup();
  } else {
    document.addEventListener('DOMContentLoaded', setup);
  }
})();
