import { authConfig } from "./auth-config";
import { WordPressAuthService } from "./strategies/wordpress";
import { SupabaseAuthService } from "./strategies/supabase";
import type { IAuthService } from "./types";

export type { IAuthService, AuthSession, OtpResponse } from "./types";
export { authConfig } from "./auth-config";

let wordpressAuthInstance: WordPressAuthService | null = null;
let supabaseAuthInstance: SupabaseAuthService | null = null;

export function getAuthService(): IAuthService {
  if (authConfig.strategy === "supabase") {
    if (!supabaseAuthInstance) {
      supabaseAuthInstance = new SupabaseAuthService();
    }
    return supabaseAuthInstance;
  }

  if (!wordpressAuthInstance) {
    wordpressAuthInstance = new WordPressAuthService();
  }
  return wordpressAuthInstance;
}
