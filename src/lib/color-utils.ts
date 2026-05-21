/**
 * Converts a HEX color string (e.g., "#c6050f" or "c6050f") to an HSL string
 * formatted for Tailwind CSS variables (e.g., "7 95% 40%").
 * Also returns light and dark variants by adjusting the lightness.
 */
export function hexToTailwindHSL(hex: string) {
  // Remove hash if present
  hex = hex.replace(/^#/, "");

  // Parse r, g, b values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  // Find max and min values
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  // Convert to degrees and percentages
  const hDeg = Math.round(h * 360);
  const sPct = Math.round(s * 100);
  const lPct = Math.round(l * 100);

  // Generate variants (clamp lightness between 0 and 100)
  const lLight = Math.min(100, lPct + 15);
  const lDark = Math.max(0, lPct - 12);

  return {
    base: `${hDeg} ${sPct}% ${lPct}%`,
    light: `${hDeg} ${sPct}% ${lLight}%`,
    dark: `${hDeg} ${sPct}% ${lDark}%`,
  };
}
