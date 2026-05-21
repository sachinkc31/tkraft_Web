import { NextRequest, NextResponse } from "next/server";
import { getAuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const session = await authService.verifyMobileOtp(phone, otp);

    return NextResponse.json(session);
  } catch (error: any) {
    console.error("[Mobile Verify Router] Error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 400 }
    );
  }
}
