import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: "Username or Email is required" },
        { status: 400 }
      );
    }

    // 1. Resolve WordPress base URL
    const wooUrl = process.env.NEXT_PUBLIC_WOOCOMMERCE_URL || "https://tkraft.in/wp-json/wc/v3";
    let wpBaseUrl = "https://tkraft.in";
    try {
      const parsed = new URL(wooUrl);
      wpBaseUrl = parsed.origin;
    } catch (e) {
      // fallback
    }

    // 2. Trigger standard WordPress lostpassword email handler
    console.log(`[Forgot Password] Initiating WordPress password reset for: ${username}`);
    await fetch(`${wpBaseUrl}/wp-login.php?action=lostpassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        user_login: username,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "If the username or email exists, a password reset link has been sent to your registered email address."
    });
  } catch (error: any) {
    console.error("[Forgot Password API Router] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process forgot password request" },
      { status: 500 }
    );
  }
}
