/**
 * Pure business logic for derived calculations.
 * No HTTP, no UI — just math.
 */

/** CO₂ saved per device type (kg) */
const CO2_PER_LAPTOP = 285; // 300 production - 15 refurb
const CO2_PER_DESKTOP = 380;
const AVG_CO2_PER_DEVICE = 300; // weighted average used in estimates

/** Estimate device count from revenue */
export function estimateDeviceCount(revenue: number, avgPrice = 150): number {
  if (!revenue || revenue <= 0) return 0;
  return Math.round(revenue / avgPrice);
}

/** Estimate CO₂ avoided (tonnes) from device count */
export function estimateCO2Avoided(deviceCount: number): number {
  return Math.round((deviceCount * AVG_CO2_PER_DEVICE) / 1000 * 10) / 10;
}

/** Estimate e-waste prevented (kg) from device count */
export function estimateEWastePrevented(deviceCount: number, avgWeightKg = 3): number {
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

/** CO₂ calculation details for specific device types */
export function calcCO2ForDeviceType(
  type: 'laptop' | 'desktop',
  count: number,
): { co2Kg: number; co2Tonnes: number; methodology: string } {
  const perDevice = type === 'laptop' ? CO2_PER_LAPTOP : CO2_PER_DESKTOP;
  const co2Kg = count * perDevice;
  return {
    co2Kg,
    co2Tonnes: Math.round(co2Kg / 1000 * 10) / 10,
    methodology: `${count} ${type === 'laptop' ? 'Laptops' : 'Desktops'} × ${perDevice} kg CO₂/Gerät`,
  };
}
