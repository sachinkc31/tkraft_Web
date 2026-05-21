import { NextRequest, NextResponse } from "next/server";
import { getAuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    const authService = getAuthService();
    const result = await authService.sendMobileOtp(phone);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Mobile Auth OTP Router] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send OTP" },
      { status: 500 }
    );
  }
}
