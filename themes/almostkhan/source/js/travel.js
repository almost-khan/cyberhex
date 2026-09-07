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
