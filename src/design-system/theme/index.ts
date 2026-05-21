// ============================================
// Tkraft - Design System Theme Aggregator
// ============================================

import { colors } from "./colors";
import { typography } from "./typography";
import { spacing } from "./spacing";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { breakpoints } from "./breakpoints";

export { colors, typography, spacing, radius, shadows, breakpoints };

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  breakpoints,
};

export type Theme = typeof theme;

export type CampaignColors = {
  light?: Partial<typeof colors.light>;
  dark?: Partial<typeof colors.dark>;
};

/**
 * Generate CSS Custom Properties string to dynamically style the website
 * and allow single-file style adjustments that update Tailwind v4 immediately.
 * Supports dynamic campaign color overrides passed from CMS layout configurations.
 */
export function generateThemeCss(campaignColors?: CampaignColors): string {
  // Translate camelCase key to kebab-case (e.g. primaryLight -> primary-light)
  const toKebab = (str: string) => str.replace(/([A-Z])/g, "-$1").toLowerCase();

  const lightColors = {
    ...colors.light,
    ...(campaignColors?.light || {}),
  };

  const darkColors = {
    ...colors.dark,
    ...(campaignColors?.dark || {}),
  };

  const lightColorVars = Object.entries(lightColors)
    .map(([key, value]) => `  --color-${toKebab(key)}: ${value};`)
    .join("\n");

  const darkColorVars = Object.entries(darkColors)
    .map(([key, value]) => `  --color-${toKebab(key)}: ${value};`)
    .join("\n");

  const fontSizes = Object.entries(typography.sizes)
    .map(([key, value]) => `  --font-size-${toKebab(key)}: ${value};`)
    .join("\n");

  const fontWeights = Object.entries(typography.weights)
    .map(([key, value]) => `  --font-weight-${toKebab(key)}: ${value};`)
    .join("\n");

  const lineHeights = Object.entries(typography.lineHeights)
    .map(([key, value]) => `  --line-height-${toKebab(key)}: ${value};`)
    .join("\n");

  const spacingVars = Object.entries(spacing)
    .map(([key, value]) => `  --spacing-${toKebab(key)}: ${value};`)
    .join("\n");

  const radiusVars = Object.entries(radius)
    .map(([key, value]) => `  --radius-${toKebab(key)}: ${value};`)
    .join("\n");

  const shadowVars = Object.entries(shadows)
    .map(([key, value]) => `  --shadow-${toKebab(key)}: ${value};`)
    .join("\n");

  return `
:root {
  /* Colors - Light Mode (HSL values for Tailwind v4 custom opacity support) */
${lightColorVars}

  /* Typography */
${fontSizes}
${fontWeights}
${lineHeights}
  --font-sans: ${typography.fonts.sans};
  --font-display: ${typography.fonts.display};

  /* Spacing Scale */
${spacingVars}

  /* Border Radius */
${radiusVars}

  /* Shadows */
${shadowVars}
}

.dark {
  /* Colors - Dark Mode (HSL values) */
${darkColorVars}
}
  `;
}
