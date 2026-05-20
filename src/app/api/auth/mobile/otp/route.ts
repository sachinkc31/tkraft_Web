import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit Indian mobile number" },
        { status: 400 }
      );
    }

    console.log(`[Mobile Auth OTP] Generating OTP for mobile: ${phone}`);

    // Sandbox / Test Mode: Return success with a mock warning or instruction
    // In production: Connect to Twilio, MSG91, or Fast2SMS here
    const mockOtp = "123456"; 

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully. (Use code: ${mockOtp} for sandbox verification)`,
    });
  } catch (error) {
    console.error("[Mobile Auth OTP API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
