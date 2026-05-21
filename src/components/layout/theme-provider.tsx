import { generateThemeCss } from "@/design-system/theme";

export function ThemeProvider() {
  const css = generateThemeCss();

  return (
    <style id="tkraft-design-tokens" dangerouslySetInnerHTML={{ __html: css }} />
  );
}

