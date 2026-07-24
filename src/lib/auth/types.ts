import type { Customer } from "@/types";

export interface AuthSession {
  token: string;
  user: Customer;
}

export interface OtpResponse {
  success: boolean;
  message: string;
}

export interface IAuthService {
  /**
   * Authenticate a user using username (or email) and password.
   */
  loginWithCredentials(username: string, password: string): Promise<AuthSession>;

  /**
   * Request a one-time passcode (OTP) for the specified mobile phone number.
   */
  sendMobileOtp(phone: string): Promise<OtpResponse>;

  /**
   * Verify the OTP for the specified mobile phone number and return the session.
   */
  verifyMobileOtp(phone: string, otp: string): Promise<AuthSession>;

  /**
   * Authenticate or register a user via social platform (Google).
   */
  loginOrRegisterSocial(email: string, firstName: string, lastName: string, avatarUrl?: string): Promise<AuthSession>;
}
