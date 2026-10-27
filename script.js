const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.primary-nav');
const header = document.querySelector('.site-header');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  nav.classList.toggle('open', !open);
});
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  }
});

// Full navigation at page top; a softly compact variant after scrolling.
let scrollQueued = false;
const updateHeader = () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
  scrollQueued = false;
};
window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    requestAnimationFrame(updateHeader);
    scrollQueued = true;
  }
}, { passive: true });
updateHeader();

// Count the proof points once, as they enter the viewport.
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const counters = document.querySelectorAll('[data-count]');
const numberFormat = (value, decimals) => new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: decimals,
  maximumFractionDigits: decimals
}).format(value);
const countUp = (element) => {
  const target = Number(element.dataset.count);
  const suffix = element.dataset.suffix || '';
  const decimals = Number(element.dataset.decimals || 0);
  if (prefersReducedMotion) {
    element.textContent = `${numberFormat(target, decimals)}${suffix}`;
    return;
  }
  const duration = 1250;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    element.textContent = `${numberFormat(value, decimals)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.45 });
  counters.forEach((counter) => counterObserver.observe(counter));
} else {
  counters.forEach(countUp);
}

// A restrained cursor lens with a small tint on the exact copy beneath it.
// Text stays at full contrast; touch and reduced-motion users get no follower.
const cursor = document.querySelector('.cursor-lens');
const finePointer = window.matchMedia('(pointer: fine)').matches;
if (cursor && finePointer && !prefersReducedMotion) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let lensX = pointerX;
  let lensY = pointerY;
  let framePending = false;
  let highlightedCopy = null;
  const moveLens = () => {
    lensX += (pointerX - lensX) * 0.2;
    lensY += (pointerY - lensY) * 0.2;
    cursor.style.transform = `translate3d(${lensX}px, ${lensY}px, 0) translate(-50%, -50%)`;
    if (Math.abs(pointerX - lensX) > 0.5 || Math.abs(pointerY - lensY) > 0.5) {
      requestAnimationFrame(moveLens);
    } else {
      framePending = false;
    }
  };
  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.classList.add('is-visible');
    const underPointer = document.elementFromPoint(pointerX, pointerY);
    const copy = underPointer?.closest('h1,h2,h3,p,.stat-card strong,.case-metrics strong');
    if (copy !== highlightedCopy) {
      highlightedCopy?.classList.remove('cursor-copy-active', 'cursor-copy-light');
      highlightedCopy = copy;
      highlightedCopy?.classList.add('cursor-copy-active');
      if (highlightedCopy?.closest('.stat-dark,.principle,.site-footer')) highlightedCopy.classList.add('cursor-copy-light');
    }
    cursor.classList.toggle('over-copy', Boolean(copy));
    if (!framePending) {
      framePending = true;
      requestAnimationFrame(moveLens);
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    cursor.classList.remove('is-visible', 'over-copy');
    highlightedCopy?.classList.remove('cursor-copy-active', 'cursor-copy-light');
    highlightedCopy = null;
  });
}

document.querySelector('#year').textContent = new Date().getFullYear();


