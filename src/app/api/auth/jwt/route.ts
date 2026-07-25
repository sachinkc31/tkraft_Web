import { NextRequest, NextResponse } from "next/server";
import { getAuthService } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: Max 5 login attempts per minute
    const limiter = rateLimit(request, 5, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again in 1 minute." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limiter.limit),
            "X-RateLimit-Remaining": String(limiter.remaining),
            "X-RateLimit-Reset": String(limiter.reset),
          }
        }
      );
    }

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
