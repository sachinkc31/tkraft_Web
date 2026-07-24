import { NextRequest, NextResponse } from "next/server";
import { getAuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, first_name, last_name, avatar_url } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required for social authentication" },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const session = await authService.loginOrRegisterSocial(
      email,
      first_name || "Google",
      last_name || "User",
      avatar_url
    );

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("[Social Auth API Router] Error:", error);
    return NextResponse.json(
      { error: error.message || "Social login failed" },
      { status: 500 }
    );
  }
}
