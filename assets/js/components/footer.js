/**
 * Footer Component
 * SSOT for site footer - edit here, updates everywhere
 */

(function() {
  'use strict';

  const currentYear = new Date().getFullYear();

  function buildFooter() {
    return `
    <footer class="main-footer">
      <div class="footer-content">
        <p>Revamp-Info © ${currentYear} – Interne Wissensbasis von Revamp-IT</p>
        <div class="footer-links">
          <a href="https://github.com/g-but/revamp-info" target="_blank" rel="noopener">GitHub</a>
          <a href="https://revampit.vercel.app" target="_blank" rel="noopener">Hauptseite</a>
          <a href="https://revampit.vercel.app/admin" target="_blank" rel="noopener">Admin</a>
        </div>
        <p class="footer-meta">
          <small>Letzte Aktualisierung: <span id="last-updated">--</span></small>
        </p>
      </div>
    </footer>`;
  }

  function init() {
    const placeholder = document.getElementById('footer-placeholder');
    if (placeholder) {
      placeholder.outerHTML = buildFooter();
    } else {
      // Append to body if no placeholder
      document.body.insertAdjacentHTML('beforeend', buildFooter());
    }

    // Set last updated from page meta or default
    const lastUpdated = document.querySelector('meta[name="last-updated"]');
    const span = document.getElementById('last-updated');
    if (span && lastUpdated) {
      span.textContent = lastUpdated.content;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
