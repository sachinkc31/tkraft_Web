// ============================================
// Tkraft - Design System Tokens Index
// ============================================

import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { radius } from "../theme/radius";
import { shadows } from "../theme/shadows";
import { breakpoints } from "../theme/breakpoints";

export const tokens = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  breakpoints,
};

export type DesignTokens = typeof tokens;
