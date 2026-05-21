import { themeConfig } from "@/lib/theme-config";
import { hexToTailwindHSL } from "@/lib/color-utils";

export function ThemeProvider() {
  const primaryHSL = hexToTailwindHSL(themeConfig.colors.primary);
  const secondaryHSL = hexToTailwindHSL(themeConfig.colors.secondary);

  const css = `
    :root, html, body {
      --color-primary: ${primaryHSL.base} !important;
      --color-primary-light: ${primaryHSL.light} !important;
      --color-primary-dark: ${primaryHSL.dark} !important;
      --color-accent: ${secondaryHSL.base} !important;
      --color-accent-light: ${secondaryHSL.light} !important;
      --color-accent-dark: ${secondaryHSL.dark} !important;
    }
  `;

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
}
