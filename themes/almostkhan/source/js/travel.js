// Everything is readable without JavaScript; enhance navigation and printing only.
const printButton = document.getElementById('print-trip');
if (printButton) {
  printButton.hidden = false;
  printButton.addEventListener('click', () => window.print());
}
const links = [...document.querySelectorAll('.day-nav a')];
const days = [...document.querySelectorAll('.day')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.isIntersecting);
    if (!entry) return;
    for (const link of links) {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'date');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-15% 0px -60% 0px' });
  days.forEach(day => observer.observe(day));
}
let closedDetails = [];
window.addEventListener('beforeprint', () => {
  closedDetails = [...document.querySelectorAll('details:not([open])')];
  closedDetails.forEach(detail => { detail.open = true; });
});
window.addEventListener('afterprint', () => {
  closedDetails.forEach(detail => { detail.open = false; });
});

// Highlight the current chapter in the sticky section nav.
const navLinks = [...document.querySelectorAll('.section-nav a')];
const chapters = navLinks
  .map(link => document.querySelector(link.hash))
  .filter(Boolean);
if ('IntersectionObserver' in window && chapters.length) {
  const seen = new Set();
  const chapterObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) seen.add(entry.target.id);
      else seen.delete(entry.target.id);
    }
    const current = chapters.find(chapter => seen.has(chapter.id));
    for (const link of navLinks) {
      if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
  }, { rootMargin: '-20% 0px -70% 0px' });
  chapters.forEach(chapter => chapterObserver.observe(chapter));
}
