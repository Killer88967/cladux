import {
  CLADUX_REGISTRY,
  fetchThemes,
  NotFoundError,
  parseThemeCode,
  ThemeError,
  themeCode,
  themeCss,
} from "cladux-registry";
import { CliError } from "./ui.ts";

/**
 * Checks a theme code against the colors the registry publishes, and returns
 * the code as it's saved in cl.json plus the cl-tokens.css it stands for.
 */

export async function loadTheme(code: string, registry: string, style: "tailwind" | "css") {
  let colors;
  try {
    colors = await fetchThemes(registry);
  } catch (error) {
    // A registry of your own may not publish theme; Cladux's colors still work.
    if (!(error instanceof NotFoundError) || registry === CLADUX_REGISTRY) throw error;
    colors = await fetchThemes(CLADUX_REGISTRY);
  }
  try {
    const theme = parseThemeCode(code, colors);
    return { code: themeCode(theme), css: themeCss(theme, colors, style) };
  } catch (error) {
    if (error instanceof ThemeError) throw new CliError(error.message);
    throw error;
  }
}
