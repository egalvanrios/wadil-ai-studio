(function () {
  var hero = document.querySelector('.hero--dark');
  if (!hero) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || window.innerWidth < 720) return;
  if (!window.VANTA || !window.VANTA.WAVES) return;

  try {
    window.VANTA.WAVES({
      el: hero,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x112545,
      shininess: 5.00,
      waveHeight: 6.50,
      waveSpeed: 1.15,
      zoom: 0.80
    });
    hero.classList.add('hero--vanta');
  } catch (e) {
    // WebGL/Vanta unavailable — static gradient fallback stays visible.
  }
})();
