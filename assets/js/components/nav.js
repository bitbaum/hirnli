/**
 * Navigation Component
 * SSOT for site navigation - edit here, updates everywhere
 */

(function() {
  'use strict';

  // Detect path depth to set correct relative paths
  const path = window.location.pathname;
  const depth = (path.match(/\/pages\//g) || []).length > 0 ? '../../' : '';

  // Navigation structure - SSOT
  const navStructure = {
    logo: { text: 'Revamp-Info', href: 'index.html' },
    items: [
      { text: 'Dashboard', href: 'index.html' },
      {
        text: 'Strategie',
        children: [
          { text: 'Vision & Mission', href: 'pages/strategie/index.html' },
          { text: 'Team & HR', href: 'pages/team/index.html' },
          { text: 'Operations', href: 'pages/operations/index.html' }
        ]
      },
      {
        text: 'Finanzen',
        children: [
          { text: 'Detailansicht', href: 'pages/finanzen/index.html' },
          { text: 'Kennzahlen', href: 'pages/kennzahlen/index.html' },
          { text: 'Preismodell', href: 'pages/preismodell/index.html' },
          { text: 'Fundraising', href: 'pages/fundraising/index.html' }
        ]
      },
      {
        text: 'Wirkung',
        children: [
          { text: 'Impact-Zahlen', href: 'pages/wirkung/index.html' },
          { text: 'Methodik', href: 'pages/methodik/index.html' }
        ]
      },
      { text: 'Dokumente', href: 'pages/dokumente/index.html' }
    ]
  };

  // Check if current page matches href
  function isActive(href) {
    const currentPath = window.location.pathname;
    const normalizedHref = href.replace(/^(\.\.\/)+/, '/').replace('index.html', '');
    return currentPath.includes(normalizedHref.replace('pages/', '').replace('.html', ''));
  }

  // Build navigation HTML
  function buildNav() {
    const prefixHref = (href) => depth + href;

    let html = `
    <nav class="main-nav">
      <div class="nav-container">
        <a href="${prefixHref(navStructure.logo.href)}" class="nav-logo">${navStructure.logo.text}</a>
        <button class="nav-toggle" aria-label="Menu">☰</button>
        <ul class="nav-links">`;

    navStructure.items.forEach(item => {
      if (item.children) {
        // Dropdown menu
        html += `
          <li class="nav-dropdown">
            <a href="#">${item.text}</a>
            <div class="dropdown-menu">`;
        item.children.forEach(child => {
          const activeClass = isActive(child.href) ? ' class="active"' : '';
          html += `<a href="${prefixHref(child.href)}"${activeClass}>${child.text}</a>`;
        });
        html += `
            </div>
          </li>`;
      } else {
        // Simple link
        const activeClass = isActive(item.href) ? ' class="active"' : '';
        html += `<li><a href="${prefixHref(item.href)}"${activeClass}>${item.text}</a></li>`;
      }
    });

    html += `
        </ul>
      </div>
    </nav>`;

    return html;
  }

  // Insert navigation into page
  function init() {
    const placeholder = document.getElementById('nav-placeholder');
    if (placeholder) {
      placeholder.outerHTML = buildNav();
    } else {
      // Insert at start of body if no placeholder
      document.body.insertAdjacentHTML('afterbegin', buildNav());
    }

    // Mobile menu toggle
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('nav-open');
      });
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
