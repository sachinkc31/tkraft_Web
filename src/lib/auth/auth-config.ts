export type AuthStrategy = "wordpress" | "supabase";

export const authConfig = {
  strategy: (process.env.NEXT_PUBLIC_AUTH_STRATEGY || "wordpress") as AuthStrategy,
};
