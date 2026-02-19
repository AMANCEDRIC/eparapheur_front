export interface AuthRequest {
  login: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accountId?: number;
  requiresOtp?: boolean;
  message?: string;
}

export interface OtpRequest {
  token: string;
  otp: string;
}

