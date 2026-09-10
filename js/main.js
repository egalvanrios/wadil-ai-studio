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

  /* ── Casos de estudio — datos anonimizados, sin nombres/logos reales ── */
  var WADIL_CASES = {
    es: [
      {
        dim: 'operaciones', dimLabel: 'Operaciones',
        title: 'Cómo incrementamos 40% la productividad de los ejecutivos de venta y optimizamos el flujo de caja en una distribuidora comercializadora',
        hook: 'CRM lento y cobranza desarticulada estaban frenando el crecimiento de una comercializadora B2B.',
        metrics: [
          { value: '+40%', label: 'más productividad' },
          { value: '62→<30 días', label: 'cuentas por cobrar' },
          { value: '-40%', label: 'errores en cotizaciones' }
        ],
        context: 'Una empresa comercializadora B2B del sector automotriz e industrial en el Bajío enfrentaba dos desafíos críticos. Sus ejecutivos de ventas perdían horas navegando un CRM de Salesforce complejo, lento y desordenado, elevando los tiempos de cotización. Por otro lado, la desarticulación técnica entre entrega y facturación provocaba que 42% de sus clientes B2B registraran pagos atrasados, con una demora promedio de 62 días, asfixiando su liquidez y capital de trabajo.',
        solution: 'Combinamos rediseño de experiencia de usuario enterprise (UX) y rediseño de procesos operativos. Lideramos un rediseño de usabilidad de la plataforma Salesforce CRM, simplificando la arquitectura de información con flujos de trabajo eficientes. En paralelo, para resolver el problema de liquidez, implementamos el marco estratégico DRI (Deploy, Reshape, Invent): diseñamos un sistema integrado de datos entre el CRM y el ERP contable, y con un agente autónomo de TI automatizamos alertas predictivas de inventarios y el seguimiento inteligente de facturas por cobrar, con notificaciones y opciones de pago automatizadas sin intervención humana directa.',
        results: 'Incremento del 40% en la productividad de los ejecutivos de venta. Reducción del retraso promedio en cuentas por cobrar de 62 a menos de 30 días, inyectando liquidez neta al flujo operativo. Disminución del 40% en la tasa de errores durante la captura de cotizaciones complejas.',
        cta: '¿Sientes que el desorden en tus sistemas de datos entorpece a tus vendedores o que la cobranza lenta está frenando tu crecimiento? Agenda una sesión de consultoría técnica gratuita de 30 minutos.'
      },
      {
        dim: 'datos', dimLabel: 'Datos / Medición',
        title: 'Cómo ayudamos a mejorar la gestión de iniciativas tecnológicas en una Dirección de Innovación',
        hook: 'Varias áreas habían intentado adoptar IA por su cuenta y la adopción fracasó por falta de conocimiento técnico y desorden de datos.',
        metrics: [
          { value: '100%', label: 'adopción operativa' },
          { value: '-100%', label: 'licencias extra de IA' },
          { value: '-80%', label: 'tiempo de procesamiento' }
        ],
        context: 'En una empresa de servicios profesionales de ~180 empleados, la Dirección de Innovación necesitaba evaluar constantemente tecnologías para mejorar la productividad corporativa. Varias áreas ya habían intentado implementar herramientas comerciales de IA por su cuenta, pero la adopción fracasó por falta de conocimiento técnico y desorden de datos.',
        solution: 'Fungimos como Líder de Enlace Técnico y Asesor Estratégico, cerrando la brecha entre las necesidades funcionales del negocio y las capacidades técnicas de proveedores externos y el equipo interno: acompañamiento y asesoría tecnológica, análisis y evaluación de soluciones, revisión de arquitectura, asesoría en infraestructura, interacción con proveedores, definición de requisitos y mitigación de riesgos, monitoreo de usabilidad y escalamiento, y apoyo en la evaluación técnica de personal. Detectamos que la empresa tenía un plan de Google Workspace sin aprovechar el Google AI Ecosystem incluido: implementamos talleres de capacitación interna, los empleados desarrollaron productos propios con NotebookLM, Gemini y Gems, y construimos aplicaciones internas (generador de documentos, bases de conocimiento, dashboards), capacitando a los usuarios finales.',
        results: 'Adopción operativa voluntaria y sostenida del 100% de las nuevas herramientas contratadas y desarrolladas internamente. Se eliminó el 100% del reembolso de licencias extra de IA que algunos empleados pagaban de su bolsillo. Reducción del 80% en los tiempos de procesamiento y generación masiva de documentos.',
        cta: '¿Tu equipo pierde tiempo valioso procesando información o tus iniciativas tecnológicas se han quedado sin usar? Agenda una sesión para analizar estrategias.'
      },
      {
        dim: 'aprendizaje', dimLabel: 'Aprendizaje Organizacional',
        title: 'Cómo ayudamos a una empresa a implementar de manera sistemática su capacitación interna',
        hook: 'Una empresa con operaciones en varias ciudades del país necesitaba capacitar a todos sus empleados de forma homologada y constante.',
        metrics: [
          { value: '~95%', label: 'cumplimiento vs. meta de 90%' },
          { value: '4.5/5', label: 'satisfacción del alumno' },
          { value: 'Nacional', label: 'cobertura multi-ciudad' }
        ],
        context: 'Una empresa mexicana de servicios profesionales, con operaciones distribuidas en varias ciudades del país, necesitaba capacitar a todos sus empleados de manera homologada y constante, ya que uno de sus valores principales era el desarrollo mediante aprendizaje continuo.',
        solution: 'Implementamos un LMS para que los empleados tomaran cursos de forma virtual y asíncrona, con seguimiento y monitoreo. Formamos un equipo responsable de la plataforma con personal de Recursos Humanos y Operaciones, y establecimos reuniones semanales de análisis, elaboración y seguimiento del plan, asegurando la concordancia entre la base de empleados y el plan de capacitación. Entregamos mensualmente el reporte de resultados y las encuestas de satisfacción, colaboramos en contenido, diseño, guion, grabación y examen de los cursos, y gestionamos la programación y envío de boletines internos. Fuimos responsables de alta de usuarios y cursos, evaluaciones, certificaciones, generación de reportes mensuales y soporte técnico.',
        results: 'La capacitación pasó de no medirse a convertirse en uno de los métricos más importantes de la empresa, ligado a compensación variable — con meta de 90% de cumplimiento, el resultado se sostuvo alrededor del 95%. La adopción fue inmediata, con satisfacción del personal de 4.5 sobre 5 (excelente).',
        cta: '¿Tienes un reto similar? Agenda una sesión estratégica.'
      }
    ],
    en: [
      {
        dim: 'operaciones', dimLabel: 'Operations',
        title: 'How we increased sales executive productivity by 40% and improved cash flow at a B2B distribution company',
        hook: "A slow CRM and disjointed collections were holding back a B2B distributor's growth.",
        metrics: [
          { value: '+40%', label: 'more productivity' },
          { value: '62→<30 days', label: 'accounts receivable' },
          { value: '-40%', label: 'quote errors' }
        ],
        context: "A B2B distribution company in the automotive and industrial sector in Mexico's Bajío region faced two critical challenges. Its sales executives were losing hours navigating a complex, slow, and disorganized Salesforce CRM, driving up quote turnaround times. Meanwhile, a technical disconnect between delivery and invoicing meant 42% of its B2B customers had overdue payments, with an average delay of 62 days, straining liquidity and working capital.",
        solution: 'We combined enterprise UX redesign with operational process redesign. We led a usability overhaul of the Salesforce CRM, simplifying the information architecture into efficient workflows. In parallel, to solve the liquidity problem, we implemented the DRI framework (Deploy, Reshape, Invent): we designed an integrated data system between the CRM and the accounting ERP, and used an autonomous IT agent to automate predictive inventory alerts and intelligent tracking of receivables, with automated notifications and payment options requiring no direct human intervention.',
        results: '40% increase in sales executive productivity. Average accounts-receivable delay reduced from 62 to under 30 days, injecting net liquidity into operations. 40% reduction in the error rate when capturing complex quotes.',
        cta: 'Do you feel like disorganized data systems are slowing down your sales team, or that slow collections are holding back your growth? Book a free 30-minute technical consultation.'
      },
      {
        dim: 'datos', dimLabel: 'Data & Measurement',
        title: 'How we helped improve technology-initiative management for an Innovation Department',
        hook: 'Several departments had tried adopting AI on their own, and adoption failed due to a lack of technical knowledge and disorganized data.',
        metrics: [
          { value: '100%', label: 'operational adoption' },
          { value: '-100%', label: 'extra AI licenses' },
          { value: '-80%', label: 'processing time' }
        ],
        context: "At a ~180-employee professional services firm, the Innovation Department needed to continuously evaluate technologies to improve corporate productivity. Several departments had already tried implementing commercial AI tools on their own, but adoption failed due to a lack of technical knowledge and disorganized data.",
        solution: "We acted as Technical Liaison Lead and Strategic Advisor, closing the gap between the business's functional needs and the technical capabilities of external vendors and the internal team: technology guidance and advisory, solution evaluation, architecture review, infrastructure advisory, vendor interaction, requirements definition and risk mitigation, usability monitoring and scaling, and support in technical staff evaluation. We found that the company had a Google Workspace plan that wasn't taking advantage of the included Google AI ecosystem: we ran internal training workshops, employees built their own tools with NotebookLM, Gemini, and Gems, and we built internal applications (a document generator, knowledge bases, dashboards), training end users along the way.",
        results: "100% voluntary, sustained operational adoption of the new tools contracted and built internally. 100% elimination of the extra AI license reimbursements some employees were paying out of pocket. 80% reduction in bulk document processing and generation time.",
        cta: 'Is your team wasting valuable time processing information, or have your technology initiatives gone unused? Book a session to discuss strategies.'
      },
      {
        dim: 'aprendizaje', dimLabel: 'Organizational Learning',
        title: 'How we helped a company systematize its internal training',
        hook: 'A company with operations in several cities across the country needed to train all its employees consistently and continuously.',
        metrics: [
          { value: '~95%', label: 'completion vs. 90% target' },
          { value: '4.5/5', label: 'learner satisfaction' },
          { value: 'Nationwide', label: 'multi-city coverage' }
        ],
        context: 'A Mexican professional services company, with operations spread across several cities nationwide, needed to train all its employees in a standardized, ongoing way, since continuous learning and development was one of its core values.',
        solution: 'We implemented an LMS so employees could take courses virtually and asynchronously, with tracking and monitoring. We formed a team responsible for the platform with staff from HR and Operations, and set up weekly meetings to analyze, build, and follow up on the plan, ensuring alignment between the employee base and the training plan. We delivered monthly results reports and satisfaction surveys, collaborated on course content, design, scripting, recording, and exams, and managed the scheduling and distribution of internal newsletters. We were responsible for user and course enrollment, assessments, certifications, monthly report generation, and technical support.',
        results: "Training went from being unmeasured to becoming one of the company's most important metrics, tied to variable compensation — against a 90% completion target, results held steady around 95%. Adoption was immediate, with employee satisfaction at 4.5 out of 5 (excellent).",
        cta: 'Facing a similar challenge? Book a strategy session.'
      }
    ]
  };

  function renderCases(l) {
    var grid = document.getElementById('casesGrid');
    if (!grid) return;
    var t = WADIL_I18N[l] || WADIL_I18N.es;
    var cases = WADIL_CASES[l] || WADIL_CASES.es;
    grid.innerHTML = '';

    cases.forEach(function (c, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'case-card reveal';
      if (i > 0) card.setAttribute('data-d', String(i));
      card.setAttribute('data-case-index', String(i));

      var pill = document.createElement('span');
      pill.className = 'case-card__pill case-card__pill--' + c.dim;
      pill.textContent = c.dimLabel;

      var h3 = document.createElement('h3');
      h3.className = 'case-card__title';
      h3.textContent = c.title;

      var hook = document.createElement('p');
      hook.className = 'case-card__hook';
      hook.textContent = c.hook;

      var metrics = document.createElement('div');
      metrics.className = 'case-card__metrics';
      c.metrics.forEach(function (m) {
        var item = document.createElement('div');
        item.className = 'case-card__metric';
        item.innerHTML = '<span class="case-card__metric-value">' + m.value + '</span><span class="case-card__metric-label">' + m.label + '</span>';
        metrics.appendChild(item);
      });

      var cta = document.createElement('span');
      cta.className = 'case-card__cta';
      cta.textContent = t.casos.card_cta;

      card.appendChild(pill);
      card.appendChild(h3);
      card.appendChild(hook);
      card.appendChild(metrics);
      card.appendChild(cta);
      grid.appendChild(card);
      if (observeReveal) observeReveal(card);
    });
  }

  /* ── Case modal (opens on .case-card click, exclusive focus trap on the close button) ── */
  function setupCaseModal() {
    var modal = document.getElementById('caseModal');
    if (!modal) return;
    var closeBtn = modal.querySelector('.case-modal__close');
    var lastTrigger = null;

    var open = function (index) {
      var cases = WADIL_CASES[lang] || WADIL_CASES.es;
      var c = cases[index];
      if (!c) return;
      lastTrigger = document.activeElement;

      var pillEl = document.getElementById('caseModalPill');
      pillEl.className = 'case-card__pill case-card__pill--' + c.dim;
      pillEl.textContent = c.dimLabel;
      document.getElementById('caseModalTitle').textContent = c.title;
      document.getElementById('caseModalContext').textContent = c.context;
      document.getElementById('caseModalSolution').textContent = c.solution;
      document.getElementById('caseModalResults').textContent = c.results;
      document.getElementById('caseModalCta').textContent = c.cta;

      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };
    var close = function () {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    };

    document.addEventListener('click', function (e) {
      var card = e.target.closest('.case-card');
      if (card) { open(Number(card.getAttribute('data-case-index'))); return; }
      if (e.target.closest('[data-case-close]')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        // Only the close button is focusable inside the panel — keep focus trapped on it.
        e.preventDefault();
        closeBtn.focus();
      }
    });
  }

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
        '<img src="https://i.ytimg.com/vi/' + v.id + '/hqdefault.jpg" alt="' + v.title.replace(/"/g, '&quot;') + '" loading="lazy">' +
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
    var page = document.body.getAttribute('data-i18n-page');
    var m = (page && t[page] && t[page].meta) || t.meta;
    document.title = m.title;

    var sel = function (s) { return document.querySelector(s); };
    var setMeta = function (s, v) { var el = sel(s); if (el && v) el.setAttribute('content', v); };
    setMeta('meta[name="description"]', m.description);
    setMeta('meta[property="og:title"]', m.title);
    setMeta('meta[property="og:description"]', m.description);
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
    renderCases(l);
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
    setupCaseModal();
    setupFaq();
  }

  if (document.readyState !== 'loading') {
    setup();
  } else {
    document.addEventListener('DOMContentLoaded', setup);
  }
})();
