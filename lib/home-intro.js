// Run before the first paint so returning visitors never see a loader flash.
export const homeIntroBootstrap = `(() => {
  try {
    if (window.location.pathname !== '/' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const key = 'jonaks-home-intro-seen';
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, '1');
    document.documentElement.dataset.homeIntro = 'show';
  } catch {
    // If session storage is unavailable, show the page immediately.
  }
})();`;
