import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

type OtpPurpose = "LOGIN";

export interface RequestOtpPayload {
  phone_number: string;
  purpose: OtpPurpose;
  flow_uid: string;
  metadata?: Record<string, unknown>;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  verification_token: string;
}

export interface VerifyOtpPayload {
  phone_number: string;
  purpose: OtpPurpose;
  verification_token: string;
  otp: string;
  flow_uid: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  otp_verified_token?: string;
}

export interface LoginOtpPayload {
  phone_number: string;
  purpose: OtpPurpose;
  verification_token: string;
  otp: string;
  flow_uid: string;
  otp_verified_token?: string;
}

export interface LoginOtpResponse {
  success: boolean;
  token: string;
  platform: string;
  user: {
    id: string;
    first_name: string | null;
    phone: string;
  };
}

const rawBaseUrl = import.meta.env.VITE_SETOO_AUTH_BASE_URL ?? "https://api.labs.setoo.ai/";
const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const apiKey = import.meta.env.VITE_SETOO_AUTH_API_KEY ?? "s0AVT7qFh7ZUBKC0JUAG1VPIFzYk07hqAbSuwDmCmTvUljmkq3JZbcecwcf2eM2R";

export const otpAuthApi = createApi({
  reducerPath: "otpAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      headers.set("X-API-KEY", apiKey);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    requestOtp: builder.mutation<RequestOtpResponse, RequestOtpPayload>({
      query: (body) => ({
        url: "api/ecommerce/auth/otp/request/",
        method: "POST",
        body,
      }),
    }),
    verifyOtp: builder.mutation<VerifyOtpResponse, VerifyOtpPayload>({
      query: (body) => ({
        url: "api/ecommerce/auth/otp/verify/",
        method: "POST",
        body,
      }),
    }),
    loginWithOtp: builder.mutation<LoginOtpResponse, LoginOtpPayload>({
      query: (body) => ({
        url: "api/ecommerce/auth/login-otp/",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useRequestOtpMutation, useVerifyOtpMutation, useLoginWithOtpMutation } = otpAuthApi;
