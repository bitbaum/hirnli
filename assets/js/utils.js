/**
 * Das Hirn – Utilities
 * Formatierung und Hilfsfunktionen
 */

const Utils = {
  /**
   * Formatiert Zahl als Schweizer Franken
   */
  formatCHF(value, showCents = false) {
    if (value === null || value === undefined || isNaN(value)) return 'CHF --';
    const opts = { minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 };
    const formatted = Math.abs(value).toLocaleString('de-CH', opts);
    return `${value < 0 ? '-' : ''}CHF ${formatted}`;
  },

  /**
   * Formatiert Zahl mit Schweizer Tausendertrennzeichen
   */
  formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) return '--';
    return value.toLocaleString('de-CH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },

  /**
   * Formatiert als Prozent
   */
  formatPercent(value, decimals = 1) {
    if (value === null || value === undefined || isNaN(value)) return '--%';
    return (value * 100).toFixed(decimals) + '%';
  },

  /**
   * Formatiert Monat zu deutschem Namen
   */
  formatMonth(monthStr) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    if (!monthStr) return '--';
    const [year, month] = monthStr.split('-');
    const idx = parseInt(month, 10) - 1;
    if (idx < 0 || idx > 11) return monthStr;
    return `${months[idx]} ${year}`;
  },

  /**
   * Formatiert Monat kurz
   */
  formatMonthShort(monthStr) {
    const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    if (!monthStr) return '--';
    const [year, month] = monthStr.split('-');
    const idx = parseInt(month, 10) - 1;
    if (idx < 0 || idx > 11) return monthStr;
    return `${months[idx]} ${year.slice(2)}`;
  },

  /**
   * Aktuelles Datum
   */
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Berechnet Wachstumsrate
   */
  calcGrowth(oldVal, newVal) {
    if (!oldVal || oldVal === 0) return newVal > 0 ? 1 : 0;
    return (newVal - oldVal) / Math.abs(oldVal);
  },

  /**
   * Berechnet Durchschnitt
   */
  calcAverage(values) {
    if (!values || values.length === 0) return 0;
    const valid = values.filter(v => !isNaN(v) && v !== null);
    if (valid.length === 0) return 0;
    return valid.reduce((s, v) => s + v, 0) / valid.length;
  },

  /**
   * Berechnet Summe
   */
  calcSum(values) {
    if (!values || values.length === 0) return 0;
    return values.filter(v => !isNaN(v) && v !== null).reduce((s, v) => s + v, 0);
  },

  /**
   * Gibt Trend-Klasse zurück
   */
  getTrendClass(growth, positiveIsGood = true) {
    if (Math.abs(growth) < 0.01) return 'trend-neutral';
    if (positiveIsGood) return growth > 0 ? 'trend-up' : 'trend-down';
    return growth < 0 ? 'trend-up' : 'trend-down';
  },

  /**
   * Gibt Trend-Pfeil zurück
   */
  getTrendArrow(growth) {
    if (Math.abs(growth) < 0.01) return '→';
    return growth > 0 ? '↑' : '↓';
  }
};

/**
 * Number Inspection System
 * Click-to-inspect for traceable numbers
 */
const NumberInspector = {
  /**
   * Opens inspection modal for a traceable number element
   * @param {HTMLElement} element - Element with data attributes
   */
  inspect(element) {
    const value = element.textContent.trim();
    const source = element.dataset.source || 'Unbekannt';
    const account = element.dataset.account || '--';
    const type = element.dataset.type || 'none';
    const formula = element.dataset.formula || null;
    const label = element.dataset.label || 'Wert';
    const updated = element.dataset.updated || '--';

    const typeLabels = {
      live: { label: 'Live-Daten', class: 'badge-live', icon: '●' },
      derived: { label: 'Berechnet', class: 'badge-derived', icon: '◐' },
      estimated: { label: 'Schätzung', class: 'badge-estimated', icon: '○' },
      none: { label: 'Keine Quelle', class: 'badge-none', icon: '?' }
    };

    const typeInfo = typeLabels[type] || typeLabels.none;

    let modalHtml = `
      <div class="inspect-section">
        <h4>Aktueller Wert</h4>
        <div class="inspect-value">${value}</div>
        <span class="badge ${typeInfo.class}">${typeInfo.icon} ${typeInfo.label}</span>
      </div>
      <div class="inspect-section">
        <h4>Datenquelle</h4>
        <div class="inspect-source">
          <div class="source-row"><span class="source-icon">📁</span> ${source}</div>
          ${account !== '--' ? `<div class="source-row"><span class="source-icon">📊</span> Konto: ${account}</div>` : ''}
          ${updated !== '--' ? `<div class="source-row"><span class="source-icon">🗓️</span> Aktualisiert: ${updated}</div>` : ''}
        </div>
      </div>
    `;

    if (formula) {
      modalHtml += `
        <div class="inspect-section">
          <h4>Berechnungsformel</h4>
          <div class="inspect-formula">${formula}</div>
        </div>
      `;
    }

    // Show or create modal
    let modal = document.getElementById('number-inspect-modal');
    if (!modal) {
      modal = this.createModal();
      document.body.appendChild(modal);
    }

    document.getElementById('inspect-modal-title').textContent = label + ' inspizieren';
    document.getElementById('inspect-modal-body').innerHTML = modalHtml;
    modal.classList.add('active');
  },

  /**
   * Creates the inspection modal if it doesn't exist
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = 'number-inspect-modal';
    modal.className = 'inspect-modal-overlay';
    modal.innerHTML = `
      <div class="inspect-modal">
        <div class="inspect-modal-header">
          <h3 id="inspect-modal-title">Details</h3>
          <button class="inspect-modal-close" onclick="NumberInspector.close()">&times;</button>
        </div>
        <div class="inspect-modal-body" id="inspect-modal-body"></div>
        <div class="inspect-modal-footer">
          <a href="#" class="inspect-download-link" id="inspect-download-link" style="display:none;">
            ↓ Quelldatei herunterladen
          </a>
        </div>
      </div>
    `;

    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.close();
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });

    return modal;
  },

  /**
   * Closes the inspection modal
   */
  close() {
    const modal = document.getElementById('number-inspect-modal');
    if (modal) modal.classList.remove('active');
  },

  /**
   * Initialize click handlers for all .traceable elements
   */
  init() {
    document.querySelectorAll('.traceable').forEach(el => {
      el.addEventListener('click', () => this.inspect(el));
    });
  }
};

/**
 * Global function for traceable numbers
 * @param {HTMLElement} el - Element to inspect
 */
function inspectNumber(el) {
  NumberInspector.inspect(el);
}

if (typeof module !== 'undefined' && module.exports) module.exports = Utils;
