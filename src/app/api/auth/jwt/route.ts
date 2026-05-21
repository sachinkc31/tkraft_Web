import { NextRequest, NextResponse } from "next/server";
import { getAuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const session = await authService.loginWithCredentials(username, password);

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("[JWT Auth API Router] Error:", error);
    return NextResponse.json(
      { error: error.message || "Invalid credentials" },
      { status: 401 }
    );
  }
}
