// Fallback page fade for browsers without native page transitions
(function () {
  // Browsers that support native cross-page transitions don't need this
  if ('PageRevealEvent' in window) return;

  document.body.classList.add('pt-fallback-in');

  // restore the page if the user comes back with the Back button
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) document.body.classList.remove('pt-fallback-out');
  });

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || link.target === '_blank') return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    if (link.origin !== location.origin) return;                          // external link
    if (link.pathname === location.pathname) return;                      // same page

    e.preventDefault();
    document.body.classList.add('pt-fallback-out');
    setTimeout(() => { window.location.href = link.href; }, 300);
  });
})();