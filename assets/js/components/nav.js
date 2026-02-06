/**
 * Navigation Component
 * SSOT for site navigation - edit here, updates everywhere
 *
 * Structure:
 * - Dashboard (home)
 * - Organisation (strategy, team, operations)
 * - Finanzen (overview, KPIs, pricing)
 * - Fundraising (MEGA MENU - big topic with many sub-pages)
 * - Wirkung (impact, methodology, transparency)
 * - Dokumente (document generator)
 */

(function() {
  'use strict';

  // Detect path depth to set correct relative paths
  const path = window.location.pathname;
  const depth = (path.match(/\/pages\//g) || []).length > 0 ? '../../' : '';

  // Navigation structure - SSOT
  // Edit this to change navigation site-wide
  const navStructure = {
    logo: { text: 'Revamp-Info', href: 'index.html' },
    items: [
      { text: 'Dashboard', href: 'index.html', icon: '📊' },
      {
        text: 'Organisation',
        icon: '🏢',
        children: [
          { text: 'Vision & Strategie', href: 'pages/strategie/index.html', desc: 'Mission, Ziele, Ausrichtung' },
          { text: 'Team & HR', href: 'pages/team/index.html', desc: 'Mitarbeitende, Rollen, Kapazitäten' },
          { text: 'Operations', href: 'pages/operations/index.html', desc: 'Prozesse, SOPs, Qualität' }
        ]
      },
      {
        text: 'Finanzen',
        icon: '💰',
        children: [
          { text: 'Übersicht', href: 'pages/finanzen/index.html', desc: 'Einnahmen, Ausgaben, Trends' },
          { text: 'Kennzahlen', href: 'pages/kennzahlen/index.html', desc: 'KPIs und Metriken' },
          { text: 'Preismodell', href: 'pages/preismodell/index.html', desc: 'Kalkulation, Margen' }
        ]
      },
      {
        text: 'Fundraising',
        icon: '🎯',
        href: 'pages/fundraising/index.html', // Main page is clickable
        mega: true, // This triggers mega menu rendering
        sections: [
          {
            title: 'Recherche',
            items: [
              { text: 'Stiftungen-Übersicht', href: 'pages/fundraising/stiftungen/index.html', desc: 'Alle Förderstiftungen mit Deadlines', highlight: true },
              { text: 'Fundraising Hub', href: 'pages/fundraising/index.html', desc: 'Übersicht & Pipeline' }
            ]
          },
          {
            title: 'Dokumente',
            items: [
              { text: 'Alle Dokumente', href: 'pages/dokumente/index.html', desc: 'Berichte, Vorlagen, Downloads' },
              { text: 'Organisationsprofil', href: 'pages/fundraising/index.html#vision', desc: 'Vision & 3 Säulen' }
            ]
          },
          {
            title: 'Quick Links',
            items: [
              { text: '→ Migros Engagement', href: 'https://engagement.migros.ch/de', external: true },
              { text: '→ Ernst Göhner', href: 'https://www.ernst-goehner-stiftung.ch', external: true },
              { text: '→ Stiftungsverzeichnis CH', href: 'https://stiftungsverzeichnis.ch', external: true }
            ]
          }
        ]
      },
      {
        text: 'Wirkung',
        icon: '🌱',
        children: [
          { text: 'Impact-Zahlen', href: 'pages/wirkung/index.html', desc: 'CO₂, Geräte, Menschen' },
          { text: 'Methodik', href: 'pages/methodik/index.html', desc: 'Berechnungen & Quellen' },
          { text: 'Transparenz', href: 'pages/transparenz/index.html', desc: 'Offenlegung & Reports' }
        ]
      },
      { text: 'Dokumente', href: 'pages/dokumente/index.html', icon: '📄' }
    ]
  };

  // Check if current page matches href
  function isActive(href) {
    if (!href || href === '#' || href.startsWith('http')) return false;
    const currentPath = window.location.pathname;
    const normalizedHref = href.replace('index.html', '').replace('.html', '');
    return currentPath.includes(normalizedHref.replace('pages/', ''));
  }

  // Build mega menu HTML
  function buildMegaMenu(item, prefixHref) {
    const mainHref = item.href ? prefixHref(item.href) : '#';
    const activeClass = isActive(item.href) ? ' class="active"' : '';
    let html = `
      <li class="nav-dropdown nav-mega">
        <a href="${mainHref}"${activeClass}>${item.icon ? item.icon + ' ' : ''}${item.text}</a>
        <div class="mega-menu">
          <div class="mega-menu-inner">`;

    item.sections.forEach(section => {
      html += `
            <div class="mega-section">
              <h4>${section.title}</h4>
              <ul>`;
      section.items.forEach(link => {
        const href = link.external ? link.href : prefixHref(link.href);
        const target = link.external ? ' target="_blank" rel="noopener"' : '';
        const activeClass = isActive(link.href) ? ' class="active"' : '';
        const highlight = link.highlight ? ' class="highlight"' : '';
        html += `
                <li${highlight}>
                  <a href="${href}"${target}${activeClass}>
                    <span class="mega-link-text">${link.text}</span>
                    ${link.desc ? `<span class="mega-link-desc">${link.desc}</span>` : ''}
                  </a>
                </li>`;
      });
      html += `
              </ul>
            </div>`;
    });

    html += `
          </div>
        </div>
      </li>`;
    return html;
  }

  // Build regular dropdown HTML
  function buildDropdown(item, prefixHref) {
    let html = `
      <li class="nav-dropdown">
        <a href="#">${item.icon ? item.icon + ' ' : ''}${item.text}</a>
        <div class="dropdown-menu">`;

    item.children.forEach(child => {
      const activeClass = isActive(child.href) ? ' class="active"' : '';
      html += `
          <a href="${prefixHref(child.href)}"${activeClass}>
            <span class="dropdown-text">${child.text}</span>
            ${child.desc ? `<span class="dropdown-desc">${child.desc}</span>` : ''}
          </a>`;
    });

    html += `
        </div>
      </li>`;
    return html;
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
      if (item.mega) {
        // Mega menu (for Fundraising)
        html += buildMegaMenu(item, prefixHref);
      } else if (item.children) {
        // Regular dropdown
        html += buildDropdown(item, prefixHref);
      } else {
        // Simple link
        const activeClass = isActive(item.href) ? ' class="active"' : '';
        html += `
          <li><a href="${prefixHref(item.href)}"${activeClass}>${item.icon ? item.icon + ' ' : ''}${item.text}</a></li>`;
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
