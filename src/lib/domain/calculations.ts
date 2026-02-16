/**
 * Pure business logic for derived calculations.
 * No HTTP, no UI — just math.
 */

const AVG_CO2_PER_DEVICE = 285; // Fraunhofer IZM 2023: 350kg (Neuproduktion) - 65kg (Refurbishing) = 285kg gespart

/** Estimate device count from revenue */
export function estimateDeviceCount(revenue: number, avgPrice = 150): number {
  if (!revenue || revenue <= 0) return 0;
  return Math.round(revenue / avgPrice);
}

/** Estimate CO₂ avoided (tonnes) from device count */
export function estimateCO2Avoided(deviceCount: number): number {
  return Math.round((deviceCount * AVG_CO2_PER_DEVICE) / 1000 * 10) / 10;
}

/** Estimate e-waste prevented (kg) from device count
 * Source: ~5 kg Durchschnittsgewicht pro Laptop/Desktop (inkl. Monitor, Tastatur, Maus)
 * Methodology: Gewichtsmessungen von 50+ Geräten (2023–2025)
 */
export function estimateEWastePrevented(deviceCount: number, avgWeightKg = 5): number {
  return Math.round(deviceCount * avgWeightKg);
}

/** Calculate self-financing rate */
export function calcSelfFinancingRate(
  warenverkauf: number,
  dienstleistungen: number,
  total: number,
): number {
  if (!total || total === 0) return 0;
  return (warenverkauf + dienstleistungen) / total;
}

