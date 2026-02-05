/**
 * Das Hirn – Data Loader
 *
 * Lädt echte Daten aus der SQLite-Datenbank (via JSON-Export).
 * Jede Zahl ist bis zur Quelle nachvollziehbar.
 *
 * Datenfluss:
 *   Kivitendo → revamp-Einnahmen-2025.xlsx → import_financial_data.py → JSON → Dashboard
 */

const DataLoader = {
  // Pfad zu den JSON-Exporten (wird dynamisch angepasst)
  getDataPath() {
    // Erkennt die Tiefe im Verzeichnisbaum basierend auf dem aktuellen Pfad
    const path = window.location.pathname;

    // Zähle wie viele Verzeichnisebenen wir unter hirn-site sind
    const hirnsiteIndex = path.indexOf('/hirn-site/');
    if (hirnsiteIndex === -1) {
      // Fallback für root
      return '../01_Management/B_Finanzen/data/export';
    }

    const afterHirnsite = path.substring(hirnsiteIndex + '/hirn-site/'.length);
    const depth = (afterHirnsite.match(/\//g) || []).length;

    // Basis: von hirn-site/ brauchen wir ../
    // Für jede weitere Ebene brauchen wir ein zusätzliches ../
    const prefix = '../'.repeat(depth + 1);
    return prefix + '01_Management/B_Finanzen/data/export';
  },

  // Cache für geladene Daten
  cache: {},

  // Metadata über die Datenquelle
  metadata: {
    source: 'revamp-Einnahmen-2025.xlsx',
    sourceSystem: 'Kivitendo Buchhaltung',
    lastImport: '2026-01-11T21:38:12.885176'
  },

  // Embedded fallback data (real Kivitendo data) for file:// URLs
  // Last updated: 2026-01-11 from revamp-Einnahmen-2025.xlsx
  fallbackData: {
    2025: {
      year: 2025,
      source: 'revamp-Einnahmen-2025.xlsx',
      imported_at: '2026-01-11T21:38:12.885176',
      data: [
        // Totals per month
        { year: 2025, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3976.22 },
        { year: 2025, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4363.13 },
        { year: 2025, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3125.55 },
        { year: 2025, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3206.30 },
        { year: 2025, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4423.60 },
        { year: 2025, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3403.00 },
        { year: 2025, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3775.00 },
        { year: 2025, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3970.09 },
        { year: 2025, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2265.85 },
        { year: 2025, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3881.80 },
        { year: 2025, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 1687.50 },
        // Warenverkauf (products)
        { year: 2025, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1935.02 },
        { year: 2025, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1764.00 },
        { year: 2025, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2134.80 },
        { year: 2025, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1433.00 },
        { year: 2025, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2710.40 },
        { year: 2025, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2128.00 },
        { year: 2025, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 825.00 },
        { year: 2025, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2730.05 },
        { year: 2025, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1513.00 },
        { year: 2025, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2321.00 },
        { year: 2025, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1050.00 },
        // Dienstleistungen (services)
        { year: 2025, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2131.20 },
        { year: 2025, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2589.13 },
        { year: 2025, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 990.75 },
        { year: 2025, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1773.30 },
        { year: 2025, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1167.70 },
        { year: 2025, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1270.00 },
        { year: 2025, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2920.00 },
        { year: 2025, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1180.04 },
        { year: 2025, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 727.85 },
        { year: 2025, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1481.80 },
        { year: 2025, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 637.50 },
        // Spenden (donations)
        { year: 2025, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -90.00 },
        { year: 2025, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2025, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2025, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2025, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 535.50 },
        { year: 2025, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
        { year: 2025, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 30.00 },
        { year: 2025, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
        { year: 2025, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 25.00 },
        { year: 2025, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 54.00 },
        { year: 2025, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        // Aufstockung (price_adjustment)
        { year: 2025, month: 1, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 2, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 10.00 },
        { year: 2025, month: 3, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 4, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 5, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 10.00 },
        { year: 2025, month: 6, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 7, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 8, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 40.00 },
        { year: 2025, month: 9, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 },
        { year: 2025, month: 10, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 25.00 },
        { year: 2025, month: 11, account_code: '3510', account_name: 'Aufstockung Richtpreis', category: 'revenue', subcategory: 'price_adjustment', value: 0.00 }
      ]
    },
    2024: {
      year: 2024,
      source: 'revamp-Einnahmen-2025.xlsx',
      imported_at: '2026-01-11T21:38:12.890851',
      data: [
        // Totals per month
        { year: 2024, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5769.20 },
        { year: 2024, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 1867.74 },
        { year: 2024, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10989.27 },
        { year: 2024, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5288.12 },
        { year: 2024, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12336.90 },
        { year: 2024, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 46082.36 },
        { year: 2024, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4983.03 },
        { year: 2024, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2064.60 },
        { year: 2024, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3490.72 },
        { year: 2024, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2849.40 },
        { year: 2024, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 5874.00 },
        { year: 2024, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 11705.87 },
        // Warenverkauf (products)
        { year: 2024, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 985.13 },
        { year: 2024, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 648.00 },
        { year: 2024, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2363.67 },
        { year: 2024, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2505.42 },
        { year: 2024, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3190.50 },
        { year: 2024, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3260.03 },
        { year: 2024, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1512.04 },
        { year: 2024, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 969.00 },
        { year: 2024, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1260.01 },
        { year: 2024, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1966.58 },
        { year: 2024, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3172.00 },
        { year: 2024, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1287.98 },
        // Dienstleistungen (services)
        { year: 2024, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 4746.07 },
        { year: 2024, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1219.74 },
        { year: 2024, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5605.60 },
        { year: 2024, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2927.70 },
        { year: 2024, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 7636.40 },
        { year: 2024, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 42774.03 },
        { year: 2024, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3605.99 },
        { year: 2024, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1095.60 },
        { year: 2024, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2198.71 },
        { year: 2024, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 992.82 },
        { year: 2024, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2702.00 },
        { year: 2024, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 10385.39 },
        // Integration
        { year: 2024, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
        { year: 2024, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 1500.00 },
        { year: 2024, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2024, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        // Spenden (donations)
        { year: 2024, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 38.00 },
        { year: 2024, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2024, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
        { year: 2024, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -145.00 },
        { year: 2024, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
        { year: 2024, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 48.30 },
        { year: 2024, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -135.00 },
        { year: 2024, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2024, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 32.00 },
        { year: 2024, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -110.00 },
        { year: 2024, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 0.00 },
        { year: 2024, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 32.50 }
      ]
    },
    2023: {
      year: 2023,
      source: 'revamp-Einnahmen-2025.xlsx',
      imported_at: '2026-01-11T21:38:12.895010',
      data: [
        // Totals per month
        { year: 2023, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6407.35 },
        { year: 2023, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12850.17 },
        { year: 2023, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 8856.05 },
        { year: 2023, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6253.55 },
        { year: 2023, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10689.78 },
        { year: 2023, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12806.84 },
        { year: 2023, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 8232.30 },
        { year: 2023, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 12965.80 },
        { year: 2023, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 15522.18 },
        { year: 2023, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9481.60 },
        { year: 2023, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9845.23 },
        { year: 2023, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 19280.09 },
        // Warenverkauf (products)
        { year: 2023, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 4145.00 },
        { year: 2023, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 4320.86 },
        { year: 2023, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2325.45 },
        { year: 2023, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2470.00 },
        { year: 2023, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 5259.87 },
        { year: 2023, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1380.96 },
        { year: 2023, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2297.50 },
        { year: 2023, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2454.50 },
        { year: 2023, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1795.03 },
        { year: 2023, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3589.57 },
        { year: 2023, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3387.44 },
        { year: 2023, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3571.01 },
        // Dienstleistungen (services)
        { year: 2023, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 2184.35 },
        { year: 2023, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 8528.11 },
        { year: 2023, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3807.60 },
        { year: 2023, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3676.05 },
        { year: 2023, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3399.36 },
        { year: 2023, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 8675.88 },
        { year: 2023, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5924.80 },
        { year: 2023, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 554.00 },
        { year: 2023, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 10662.15 },
        { year: 2023, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5847.78 },
        { year: 2023, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6392.79 },
        { year: 2023, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 15688.83 },
        // Integration
        { year: 2023, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2500.00 },
        { year: 2023, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2000.00 },
        { year: 2023, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
        { year: 2023, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 3000.00 },
        { year: 2023, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2023, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        // Spenden (donations)
        { year: 2023, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 78.00 },
        { year: 2023, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 1.20 },
        { year: 2023, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 223.00 },
        { year: 2023, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -52.50 },
        { year: 2023, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 30.55 },
        { year: 2023, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -250.00 },
        { year: 2023, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
        { year: 2023, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 9957.30 },
        { year: 2023, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 65.00 },
        { year: 2023, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 44.25 },
        { year: 2023, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 65.00 },
        { year: 2023, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.25 }
      ]
    },
    2022: {
      year: 2022,
      source: 'revamp-Einnahmen-2025.xlsx',
      imported_at: '2026-01-11T21:38:12.906612',
      data: [
        // Totals per month
        { year: 2022, month: 1, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4557.38 },
        { year: 2022, month: 2, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 6388.02 },
        { year: 2022, month: 3, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 3802.20 },
        { year: 2022, month: 4, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10083.05 },
        { year: 2022, month: 5, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4103.10 },
        { year: 2022, month: 6, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10997.00 },
        { year: 2022, month: 7, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 2482.29 },
        { year: 2022, month: 8, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 14124.15 },
        { year: 2022, month: 9, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 9346.61 },
        { year: 2022, month: 10, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 10907.10 },
        { year: 2022, month: 11, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 4235.18 },
        { year: 2022, month: 12, account_code: '30-38', account_name: 'Nettoerlöse Total', category: 'revenue', subcategory: 'total', value: 48862.20 },
        // Warenverkauf (products)
        { year: 2022, month: 1, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1753.59 },
        { year: 2022, month: 2, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2232.00 },
        { year: 2022, month: 3, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2994.00 },
        { year: 2022, month: 4, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1827.00 },
        { year: 2022, month: 5, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 890.00 },
        { year: 2022, month: 6, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 5132.00 },
        { year: 2022, month: 7, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 980.74 },
        { year: 2022, month: 8, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2489.00 },
        { year: 2022, month: 9, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 2957.48 },
        { year: 2022, month: 10, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 1722.10 },
        { year: 2022, month: 11, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 3092.94 },
        { year: 2022, month: 12, account_code: '3100', account_name: 'Warenverkauf', category: 'revenue', subcategory: 'products', value: 9370.18 },
        // Dienstleistungen (services)
        { year: 2022, month: 1, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1225.09 },
        { year: 2022, month: 2, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3762.57 },
        { year: 2022, month: 3, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 798.20 },
        { year: 2022, month: 4, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6251.05 },
        { year: 2022, month: 5, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 3203.10 },
        { year: 2022, month: 6, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 5845.00 },
        { year: 2022, month: 7, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1496.55 },
        { year: 2022, month: 8, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 11535.15 },
        { year: 2022, month: 9, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 6279.13 },
        { year: 2022, month: 10, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 9180.00 },
        { year: 2022, month: 11, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 1587.24 },
        { year: 2022, month: 12, account_code: '3400', account_name: 'Dienstleistungen', category: 'revenue', subcategory: 'services', value: 28917.02 },
        // Integration
        { year: 2022, month: 1, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 1500.00 },
        { year: 2022, month: 2, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 3, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 4, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 2000.00 },
        { year: 2022, month: 5, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 6, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 7, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 8, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 9, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 10, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 11, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        { year: 2022, month: 12, account_code: '3450', account_name: 'Integrations-Arbeitsplätze', category: 'revenue', subcategory: 'integration', value: 0.00 },
        // Spenden (donations)
        { year: 2022, month: 1, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 78.70 },
        { year: 2022, month: 2, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 393.45 },
        { year: 2022, month: 3, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
        { year: 2022, month: 4, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
        { year: 2022, month: 5, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10.00 },
        { year: 2022, month: 6, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 20.00 },
        { year: 2022, month: 7, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
        { year: 2022, month: 8, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 100.00 },
        { year: 2022, month: 9, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 110.00 },
        { year: 2022, month: 10, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 5.00 },
        { year: 2022, month: 11, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: -445.00 },
        { year: 2022, month: 12, account_code: '3500', account_name: 'Spenden', category: 'revenue', subcategory: 'donations', value: 10575.00 }
      ]
    }
  },

  /**
   * Lädt Einnahmen-Daten für ein Jahr
   * Versucht zuerst fetch(), bei Fehlschlag (z.B. file:// URL) verwendet embedded Fallback-Daten
   */
  async loadIncome(year = 2025) {
    const cacheKey = `income_${year}`;
    if (this.cache[cacheKey]) return this.cache[cacheKey];

    let json = null;

    // Versuche zuerst fetch (funktioniert nur via HTTP, nicht file://)
    try {
      const dataPath = this.getDataPath();
      const response = await fetch(`${dataPath}/income_${year}.json`);
      if (response.ok) {
        json = await response.json();
        console.log(`[DataLoader] Daten für ${year} via fetch geladen`);
      }
    } catch (error) {
      // fetch fehlgeschlagen (vermutlich file:// URL)
      console.log(`[DataLoader] Fetch fehlgeschlagen, verwende Fallback-Daten für ${year}`);
    }

    // Fallback: Eingebettete Daten verwenden
    if (!json && this.fallbackData[year]) {
      json = this.fallbackData[year];
      console.log(`[DataLoader] Fallback-Daten für ${year} verwendet (Stand: ${json.imported_at})`);
    }

    if (!json) {
      console.error(`[DataLoader] Keine Daten für ${year} verfügbar`);
      return new FinanceDataSet([], year, this.metadata);
    }

    this.metadata.lastImport = json.imported_at;

    // Transformiere zu monatlichen Aggregaten
    const monthlyData = this.aggregateByMonth(json.data);
    const dataSet = new FinanceDataSet(monthlyData, year, this.metadata);

    this.cache[cacheKey] = dataSet;
    return dataSet;
  },

  /**
   * Lädt Zusammenfassung aller Jahre
   */
  async loadSummary() {
    if (this.cache.summary) return this.cache.summary;

    try {
      const dataPath = this.getDataPath();
      const response = await fetch(`${dataPath}/summary.json`);
      if (!response.ok) throw new Error('Summary nicht gefunden');

      const json = await response.json();
      this.cache.summary = json;
      return json;
    } catch (error) {
      console.error('Fehler beim Laden der Summary:', error);
      return { years: [], total_records: 0 };
    }
  },

  /**
   * Aggregiert Daten nach Monat
   */
  aggregateByMonth(data) {
    const byMonth = {};

    for (const row of data) {
      const period = `${row.year}-${String(row.month).padStart(2, '0')}`;

      if (!byMonth[period]) {
        byMonth[period] = {
          period: period,
          year: row.year,
          month: row.month,
          warenverkauf: 0,
          dienstleistungen: 0,
          integration: 0,
          spenden: 0,
          aufstockung: 0,
          total: 0,
          _sources: []
        };
      }

      // Mapping Kivitendo-Kategorien
      switch (row.subcategory) {
        case 'products':
          byMonth[period].warenverkauf = row.value;
          break;
        case 'services':
          byMonth[period].dienstleistungen = row.value;
          break;
        case 'integration':
          byMonth[period].integration = row.value;
          break;
        case 'donations':
          byMonth[period].spenden = row.value;
          break;
        case 'price_adjustment':
          byMonth[period].aufstockung = row.value;
          break;
        case 'total':
          byMonth[period].total = row.value;
          break;
      }

      // Quelle tracken
      byMonth[period]._sources.push({
        account: row.account_code,
        name: row.account_name,
        value: row.value
      });
    }

    return Object.values(byMonth).sort((a, b) => a.period.localeCompare(b.period));
  },

  /**
   * Legacy-Kompatibilität: load('income') → loadIncome(2025)
   */
  async load(sourceName, forceReload = false) {
    if (sourceName === 'income') {
      return this.loadIncome(2025);
    }
    // Andere Quellen noch nicht implementiert
    console.warn(`Datenquelle '${sourceName}' noch nicht implementiert`);
    return new FinanceDataSet([], null, this.metadata);
  }
};


/**
 * Finance DataSet mit Transparenz-Features
 */
class FinanceDataSet {
  constructor(data, year, metadata) {
    this.data = data;
    this.year = year;
    this.metadata = metadata;
  }

  // Basis-Methoden
  getAll() { return this.data; }
  count() { return this.data.length; }
  isEmpty() { return this.data.length === 0; }
  getRow(index) { return this.data[index]; }

  // Quellenangabe
  getSource() {
    return {
      file: this.metadata.source,
      system: this.metadata.sourceSystem,
      imported: this.metadata.lastImport,
      methodology: 'direct_kivitendo',
      confidence: 'high',
      note: 'Direkt aus Kivitendo-Buchhaltung exportiert'
    };
  }

  // Monatszugriff
  getByMonth(period) {
    return this.data.find(row => row.period === period);
  }

  getMonths() {
    return this.data.map(row => row.period);
  }

  // Jahresfilter
  getByYear(year) {
    return new FinanceDataSet(
      this.data.filter(row => row.year === year),
      year,
      this.metadata
    );
  }

  // Spalten-Zugriff (Legacy-Kompatibilität)
  getColumn(column) {
    // Mapping alte Namen → neue Namen
    const columnMap = {
      'Geraeteverkauefe': 'warenverkauf',
      'Dienstleistungen_Reparatur_IT': 'dienstleistungen',
      'Dienstleistungen_Web_Development': 'dienstleistungen',
      'Datenrettung': 'dienstleistungen',
      'Grants_Stiftungen': 'spenden',
      'Corporate_Partnerships': 'spenden',
      'Privatspenden': 'spenden',
      'Oeffentliche_Zuschuesse': 'spenden',
      'Total_Revenue': 'total',
      'Month': 'period'
    };

    const actualColumn = columnMap[column] || column;
    return this.data.map(row => row[actualColumn]);
  }

  getNumericColumn(column) {
    return this.getColumn(column).filter(v => typeof v === 'number');
  }

  // Summen mit Transparenz
  sum(column) {
    const values = this.getNumericColumn(column);
    return values.reduce((sum, v) => sum + v, 0);
  }

  /**
   * Summe mit vollständiger Nachvollziehbarkeit
   */
  sumWithSource(column) {
    const values = this.getNumericColumn(column);
    const total = values.reduce((sum, v) => sum + v, 0);

    return {
      value: total,
      source: this.getSource(),
      calculation: {
        operation: 'SUM',
        column: column,
        count: values.length,
        values: values
      }
    };
  }

  average(column) {
    const values = this.getNumericColumn(column);
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  // Letzter Monat mit Daten
  getLatest() {
    for (let i = this.data.length - 1; i >= 0; i--) {
      if (this.data[i].total !== 0) return this.data[i];
    }
    return this.data[this.data.length - 1] || null;
  }

  // Nur Monate mit Daten
  getValidRows() {
    return new FinanceDataSet(
      this.data.filter(row => row.total !== 0 && row.total !== null),
      this.year,
      this.metadata
    );
  }
}


/**
 * Methodology-Registry für abgeleitete Werte
 */
const Methodology = {
  // CO2-Berechnung
  co2_per_device: {
    id: 'co2_per_device',
    name: 'CO₂ pro Gerät',
    formula: 'devices × 300 kg',
    assumptions: [
      { name: 'CO₂ pro Neugerät', value: 300, unit: 'kg', confidence: 'medium' }
    ],
    confidence: 'low',
    limitations: [
      'Gerätetypen nicht differenziert',
      'Nicht alle Verkäufe sind Geräte'
    ]
  },

  // Geräte-Schätzung
  device_count_estimate: {
    id: 'device_count_estimate',
    name: 'Geräteanzahl Schätzung',
    formula: 'warenverkauf_chf / 150',
    assumptions: [
      { name: 'Durchschnittspreis', value: 150, unit: 'CHF', confidence: 'medium' }
    ],
    confidence: 'low',
    limitations: [
      'Grosse Preisvariation',
      'Zubehör mitgezählt'
    ]
  },

  /**
   * Berechnet abgeleiteten Wert mit Methodik
   */
  calculate(methodId, sourceValue) {
    const method = this[methodId];
    if (!method) throw new Error(`Methodik '${methodId}' nicht gefunden`);

    let result;
    switch (methodId) {
      case 'device_count_estimate':
        result = Math.round(sourceValue / 150);
        break;
      case 'co2_per_device':
        result = sourceValue * 300;
        break;
      default:
        throw new Error(`Berechnung für '${methodId}' nicht implementiert`);
    }

    return {
      value: result,
      methodology: method,
      sourceValue: sourceValue,
      calculatedAt: new Date().toISOString()
    };
  }
};


/**
 * Data Gaps - Was fehlt und wie verbessern?
 */
const DataGaps = {
  gaps: [
    {
      id: 'device_count',
      importance: 'critical',
      description: 'Anzahl verkaufter Geräte (Stückzahl)',
      currentState: 'Nur CHF-Umsatz aus Warenverkauf verfügbar',
      howToTrack: 'Bei jedem Verkauf in Kivitendo Stückzahl erfassen (Feld existiert bereits)',
      howToImprove: [
        'Kivitendo-Berichte um Stückzahl erweitern',
        'Wöchentliche Auswertung der verkauften Artikel',
        'Produktkategorien in Kivitendo sauber pflegen'
      ]
    },
    {
      id: 'expenses',
      importance: 'critical',
      description: 'Ausgaben-Daten aus Kivitendo',
      currentState: 'Ausgaben-Export noch nicht implementiert',
      howToTrack: 'Gleicher Export-Prozess wie Einnahmen, aber für Konten 4000-6999',
      howToImprove: [
        'import_financial_data.py um Ausgaben-Sheet erweitern',
        'Monatliche Ausgaben-Kategorien definieren (Personal, Miete, Material, etc.)',
        'Dashboard um Ausgaben-Ansicht erweitern'
      ]
    },
    {
      id: 'device_types',
      importance: 'high',
      description: 'Gerätetyp-Aufteilung (Laptop, Desktop, Smartphone, etc.)',
      currentState: 'Keine Differenzierung nach Gerätetyp',
      howToTrack: 'Produktkategorien in Kivitendo nutzen oder separates Tagging',
      howToImprove: [
        'Kivitendo-Artikelgruppen für Gerätetypen einrichten',
        'Beim Intake Gerätetyp erfassen',
        'Auswertung nach Gerätetyp in Dashboard integrieren'
      ]
    },
    {
      id: 'workshops',
      importance: 'medium',
      description: 'Workshop-Teilnehmerzahlen',
      currentState: 'Workshops werden nicht systematisch erfasst',
      howToTrack: 'Einfache Tabelle: Datum, Workshop-Name, Teilnehmerzahl',
      howToImprove: [
        'CSV-Datei für Workshops anlegen (workshops.csv)',
        'Nach jedem Workshop eintragen: Datum, Typ, Teilnehmer, Stunden',
        'Ziel: Mind. 2 Workshops/Monat mit je 5+ Teilnehmern'
      ]
    },
    {
      id: 'volunteer_hours',
      importance: 'medium',
      description: 'Freiwilligenstunden',
      currentState: 'Keine Zeiterfassung für Freiwillige',
      howToTrack: 'Einfache Stundenliste oder digitale Zeiterfassung',
      howToImprove: [
        'Wöchentliche Stundenzettel für Freiwillige einführen',
        'Digitale Erfassung via einfachem Formular',
        'Monatliche Zusammenfassung pro Person',
        'Ziel: Erfassung von 80% der geleisteten Stunden'
      ]
    },
    {
      id: 'linux_installs',
      importance: 'medium',
      description: 'Anzahl Linux-Installationen',
      currentState: 'Keine Erfassung welche Geräte mit Linux ausgeliefert werden',
      howToTrack: 'Beim Verkauf/Übergabe OS-Typ vermerken',
      howToImprove: [
        'Checkbox "Linux installiert" beim Verkaufsprozess',
        'Oder: Artikelnummer-Konvention (z.B. -LIN für Linux-Geräte)',
        'Mike könnte wöchentlich Installationen zählen',
        'Ziel: 50% aller verkauften Geräte mit Linux'
      ]
    },
    {
      id: 'device_intake',
      importance: 'high',
      description: 'Geräte-Eingang (Spenden)',
      currentState: 'Intake-Prozess ineffizient, keine vollständige Erfassung',
      howToTrack: 'Jedes Gerät beim Eingang erfassen mit Datum, Zustand, Typ',
      howToImprove: [
        'Intake-Formular (Papier oder digital) standardisieren',
        'Heinz/Bruno schulen für konsistente Erfassung',
        'Wöchentliche Zusammenfassung der Eingänge',
        'Ziel: 100% aller Eingänge erfasst innerhalb 24h'
      ]
    },
    {
      id: 'repair_stats',
      importance: 'high',
      description: 'Reparatur-Statistiken',
      currentState: 'Keine Daten zu Reparaturerfolg, Dauer, häufigen Defekten',
      howToTrack: 'Reparaturprotokoll pro Gerät',
      howToImprove: [
        'Einfaches Reparatur-Log: Gerät, Problem, Lösung, Zeit, Erfolg/Fail',
        'Reza/Romeo nach jeder Reparatur 1 Minute zum Erfassen',
        'Häufige Defekte identifizieren → Schulungsmaterial',
        'Ziel: 80% aller Reparaturen dokumentiert'
      ]
    },
    {
      id: 'social_impact',
      importance: 'medium',
      description: 'Soziale Wirkung (Integration, Reintegration)',
      currentState: 'Nur Integrations-Einnahmen verfügbar, keine Personen-Daten',
      howToTrack: 'Anonymisierte Statistiken zu Teilnehmenden',
      howToImprove: [
        'Veronica: Quartalsweise Zusammenfassung erstellen',
        'Erfassen: Anzahl Teilnehmer, Stunden, Erfolgsgeschichten',
        'Kategorien: Langzeitarbeitslose, Flüchtlinge, Andere',
        'Ziel: Mind. 4 Personen/Quartal im Programm'
      ]
    },
    {
      id: 'customer_feedback',
      importance: 'low',
      description: 'Kundenfeedback und Zufriedenheit',
      currentState: 'Keine systematische Erfassung',
      howToTrack: 'Einfache Feedback-Karte oder digitale Umfrage',
      howToImprove: [
        'QR-Code auf Rechnung zu kurzer Umfrage',
        'Monatliche Zusammenfassung der Bewertungen',
        'Ziel: 20% Rücklaufquote, >4.0/5.0 Bewertung'
      ]
    }
  ],

  getAll() {
    return this.gaps;
  },

  getCritical() {
    return this.gaps.filter(g => g.importance === 'critical');
  },

  getByImportance(level) {
    return this.gaps.filter(g => g.importance === level);
  },

  getActionable() {
    // Gibt Gaps mit konkreten Verbesserungsvorschlägen zurück
    return this.gaps.map(g => ({
      ...g,
      nextStep: g.howToImprove[0] // Erste Massnahme als nächsten Schritt
    }));
  }
};


// Exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataLoader, FinanceDataSet, Methodology, DataGaps };
}
