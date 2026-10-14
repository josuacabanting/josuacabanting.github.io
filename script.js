const navbar = document.querySelector('.navbar');
const homeLogo = document.querySelector('.logo-btn');
if (homeLogo) {
  homeLogo.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    // Reload the page without a section hash so the intro starts at the top.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    window.location.reload();
  });
}
const menuToggle = document.querySelector('.menu-toggle');
const navPanel = document.querySelector('.nav-panel');
const menuBackdrop = document.querySelector('.menu-backdrop');
const mobileMenu = window.matchMedia('(max-width: 900px)');
const pageRegions = [...document.querySelectorAll('main, footer, .social-icons, .email-container')];

// Give the fixed header a compact height and a subtle divider after scrolling.
if (navbar) {
  const updateHeader = () => navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

if (navbar && menuToggle && navPanel && menuBackdrop) {
  let menuOpen = false;
  const setMenuOpen = (open, restoreFocus = false) => {
    menuOpen = open && mobileMenu.matches;
    navbar.classList.toggle('nav-open', menuOpen);
    document.body.classList.toggle('menu-open', menuOpen);
    menuToggle.setAttribute('aria-expanded', String(menuOpen));
    menuToggle.setAttribute('aria-label', menuOpen ? 'Close navigation menu' : 'Open navigation menu');
    menuBackdrop.hidden = !menuOpen;
    navPanel.inert = mobileMenu.matches && !menuOpen;
    pageRegions.forEach(region => { region.inert = menuOpen; });
    if (menuOpen) navPanel.querySelector('a').focus();
    else if (restoreFocus) menuToggle.focus();
  };
  navbar.classList.add('nav-ready');
  setMenuOpen(false);
  menuToggle.addEventListener('click', () => setMenuOpen(!menuOpen));
  menuBackdrop.addEventListener('click', () => setMenuOpen(false, true));
  navPanel.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !menuOpen) return;
    setMenuOpen(false);
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    } else menuToggle.focus();
  });
  navbar.addEventListener('keydown', event => {
    if (!menuOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenuOpen(false, true);
    }
    if (event.key === 'Tab') {
      const focusable = [...navPanel.querySelectorAll('a'), menuToggle];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  const updateMenu = () => setMenuOpen(false);
  if (mobileMenu.addEventListener) mobileMenu.addEventListener('change', updateMenu);
  else mobileMenu.addListener(updateMenu);
}

// Keep visual selection, keyboard focus, and screen-reader state in sync.
const tabList = document.querySelector('.tab-list');
const tabButtons = [...document.querySelectorAll('.tab-button')];
const tabPanels = [...document.querySelectorAll('.tab-panel')];
const activateTab = (index, focus = false) => {
  tabButtons.forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-selected', String(i === index));
    button.tabIndex = i === index ? 0 : -1;
    tabPanels[i].classList.toggle('active', i === index);
    tabPanels[i].hidden = i !== index;
  });
  if (focus) tabButtons[index].focus();
};
if (tabButtons.length) activateTab(0);
tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => activateTab(index));
  button.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabButtons.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabButtons.length) % tabButtons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabButtons.length - 1;
    else return;
    event.preventDefault();
    activateTab(next, true);
  });
});
const updateTabOrientation = () => {
  if (tabList) tabList.setAttribute('aria-orientation', mobileMenu.matches ? 'horizontal' : 'vertical');
};
updateTabOrientation();
window.addEventListener('resize', updateTabOrientation);

// Keep the learning section compact, while leaving all credentials visible without JS.
document.querySelectorAll('.credentials-section').forEach(section => {
  const credentialCards = [...section.querySelectorAll('.credential-card')];
  const credentialsToggle = section.querySelector('.credentials-toggle');
  if (!credentialsToggle || credentialCards.length <= 6) return;
  let expanded = false;
  const updateCredentials = () => {
    credentialCards.forEach((card, index) => { card.hidden = !expanded && index >= 6; });
    credentialsToggle.setAttribute('aria-expanded', String(expanded));
    credentialsToggle.textContent = expanded ? 'Show Less' : 'Show More';
  };
  credentialsToggle.hidden = false;
  updateCredentials();
  credentialsToggle.addEventListener('click', () => {
    expanded = !expanded;
    updateCredentials();
    if (expanded) credentialCards[6].focus({ preventScroll: true });
    else credentialsToggle.focus({ preventScroll: true });
  });
});

// The intro runs independently of slow images or external font downloads.
// CSS also dismisses the overlay when JavaScript is unavailable.
const initializeLoader = () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    loader.remove();
    return;
  }
  let removed = false;
  const removeLoader = () => {
    if (removed) return;
    removed = true;
    loader.remove();
  };
  loader.addEventListener('animationend', event => {
    if (event.target === loader && event.animationName === 'loaderExit') removeLoader();
  });
  // Fallback if the browser does not dispatch the animation event.
  setTimeout(() => {
    if (removed) return;
    loader.classList.add('fade-out');
    setTimeout(removeLoader, 300);
  }, 2200);
};
initializeLoader();
