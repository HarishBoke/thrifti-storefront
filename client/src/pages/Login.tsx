import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  useLoginWithOtpMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} from "@/lib/otpAuthApi";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import ThriftiLoader from "@/components/ThriftiLoader";

type View = "login" | "register" | "forgot";

const inputClass =
  "w-full border-2 border-black/40 px-4 py-3 text-sm bg-[#F9FAFB] focus:outline-none focus:border-[#CC2200] transition-colors font-geist-mono rounded-[6px] text-[#1F1F22] mb-2";
const labelClass = "block text-sm font-medium geist-mono-font text-[#1F1F22] mb-1";
const btnRed =
  "w-full bg-[#F42824] text-white pt-4 pb-2 text-2xl font-semibold uppercase hover:bg-[#aa1a00] transition-colors disabled:opacity-60 rounded-[6px] anek-devanagari-font mt-2 mb-4";

const OTP_PURPOSE = "LOGIN" as const;
const OTP_TOKEN_KEY = "setoo_session_token";
const OTP_USER_KEY = "setoo_session_user";
const OTP_FLOW_UID = import.meta.env.VITE_SETOO_FLOW_UID;

export default function Login() {
  const [view, setView] = useState<View>("login");
  const [, navigate] = useLocation();
  const { setTokenAndFetch, isAuthenticated, isLoading } = useShopifyAuth();

  // Full-screen loader state — shown during OTP verification + Shopify login
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState<string | undefined>(undefined);

  // After a successful login/register, we set this flag and wait for
  // isAuthenticated to become true before navigating to /account.
  // This avoids the race condition where navigate() fires before
  // fetchCustomer() completes, causing Account to redirect back to /login.
  const pendingRedirect = useRef(false);

  useEffect(() => {
    if (pendingRedirect.current && !isLoading && isAuthenticated) {
      pendingRedirect.current = false;
      navigate("/account");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // OTP Login form
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isOtpRequested, setIsOtpRequested] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(40);
  const [verificationToken, setVerificationToken] = useState("");
  const [otpVerifiedToken, setOtpVerifiedToken] = useState("");
  const [flowUid, setFlowUid] = useState("");

  // OTP new-user registration form (shown when phone not found in Shopify)
  const [showOtpRegister, setShowOtpRegister] = useState(false);
  const [otpRegFirstName, setOtpRegFirstName] = useState("");
  const [otpRegLastName, setOtpRegLastName] = useState("");
  const [otpRegEmail, setOtpRegEmail] = useState("");

  // Email/password register form (legacy, kept for admin use)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [loginWithOtp, { isLoading: isLoggingInWithOtp }] = useLoginWithOtpMutation();

  const normalizePhoneNumber = (rawValue: string) => {
    const trimmedValue = rawValue.trim();
    const digitsOnly = trimmedValue.replace(/\D/g, "");
    if (!digitsOnly) return "";
    if (trimmedValue.startsWith("+")) return `+${digitsOnly}`;
    return digitsOnly.length === 10 ? `+91${digitsOnly}` : `+${digitsOnly}`;
  };

  const getApiErrorMessage = (error: unknown, fallbackMessage: string) => {
    if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      typeof (error as { data?: unknown }).data === "object" &&
      (error as { data?: unknown }).data !== null &&
      "message" in ((error as { data: { message?: unknown } }).data)
    ) {
      const maybeMessage = (error as { data: { message?: unknown } }).data.message;
      if (typeof maybeMessage === "string") return maybeMessage;
    }
    if (error instanceof Error && error.message) return error.message;
    return fallbackMessage;
  };

  const loginWithPhoneMutation = trpc.customer.loginWithPhone.useMutation();
  const registerWithPhoneMutation = trpc.customer.registerWithPhone.useMutation();

  const registerMutation = trpc.customer.register.useMutation({
    onSuccess: (data) => {
      setTokenAndFetch(data.accessToken, data.expiresAt);
      toast.success("Account created! Welcome to Thrifti.");
      pendingRedirect.current = true;
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Please try again.");
    },
  });

  const recoverMutation = trpc.customerRecover.sendReset.useMutation({
    onSuccess: () => {
      setForgotSent(true);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    if (!/^\d{6}$/.test(otpCode)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    if (!verificationToken || !flowUid) {
      toast.error("Please send OTP first.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(mobileNumber);
    const otpPayload = {
      phone_number: normalizedPhone,
      purpose: OTP_PURPOSE,
      verification_token: verificationToken,
      otp: otpCode,
      flow_uid: flowUid,
    };

    setIsSubmitting(true);
    setLoaderMessage("Verifying your OTP...");
    try {
      const verifyResponse = await verifyOtp(otpPayload).unwrap();
      const resolvedOtpVerifiedToken = verifyResponse.otp_verified_token ?? otpVerifiedToken;

      if (!resolvedOtpVerifiedToken) {
        toast.error("Verification succeeded but otp_verified_token is missing. Please resend OTP.");
        setIsSubmitting(false);
        return;
      }

      setOtpVerifiedToken(resolvedOtpVerifiedToken);
      setLoaderMessage("Signing you in...");

      // Also persist the Setoo session token (non-fatal if it fails)
      try {
        const loginResponse = await loginWithOtp({
          ...otpPayload,
          otp_verified_token: resolvedOtpVerifiedToken,
        }).unwrap();
        localStorage.setItem(OTP_TOKEN_KEY, loginResponse.token);
        localStorage.setItem(OTP_USER_KEY, JSON.stringify(loginResponse.user));
      } catch {
        // Non-fatal: Setoo session token is optional for Shopify auth
      }

      // Exchange the OTP verified token for a Shopify customer access token
      const shopifyAuth = await loginWithPhoneMutation.mutateAsync({
        phone: normalizedPhone,
        otpVerifiedToken: resolvedOtpVerifiedToken,
      });

      // Phone not found in Shopify → show registration form to collect details
      if (shopifyAuth.notFound) {
        setIsSubmitting(false);
        setShowOtpRegister(true);
        toast.info("Welcome! Please complete your profile to create your account.");
        return;
      }

      setTokenAndFetch(shopifyAuth.accessToken!, shopifyAuth.expiresAt!);
      toast.success("Signed in successfully.");
      pendingRedirect.current = true;
      // Keep loader visible until redirect fires
    } catch (error) {
      setIsSubmitting(false);
      toast.error(getApiErrorMessage(error, "OTP verification/login failed. Please check details and try again."));
    }
  };

  // Called when the new-user registration form is submitted after OTP verification
  const handleOtpRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpRegFirstName || !otpRegLastName || !otpRegEmail) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (!otpVerifiedToken) {
      toast.error("OTP session expired. Please start over.");
      setShowOtpRegister(false);
      setIsOtpRequested(false);
      return;
    }

    const normalizedPhone = normalizePhoneNumber(mobileNumber);

    setIsSubmitting(true);
    setLoaderMessage("Creating your account...");
    try {
      const result = await registerWithPhoneMutation.mutateAsync({
        phone: normalizedPhone,
        firstName: otpRegFirstName,
        lastName: otpRegLastName,
        email: otpRegEmail,
        otpVerifiedToken,
      });
      setLoaderMessage("Almost there...");
      setTokenAndFetch(result.accessToken, result.expiresAt);
      toast.success("Account created! Welcome to Thrifti.");
      pendingRedirect.current = true;
      // Keep loader visible until redirect fires
    } catch (error) {
      setIsSubmitting(false);
      toast.error(getApiErrorMessage(error, "Registration failed. Please try again."));
    }
  };

  const handleSendOtp = async () => {
    const cleanedMobile = mobileNumber.replace(/\D/g, "");
    if (cleanedMobile.length < 10) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    const resolvedFlowUid = OTP_FLOW_UID?.trim();
    if (!resolvedFlowUid) {
      toast.error("Missing OTP flow UID. Set VITE_SETOO_FLOW_UID in your environment.");
      return;
    }

    const normalizedPhone = normalizePhoneNumber(mobileNumber);

    try {
      const response = await requestOtp({
        phone_number: normalizedPhone,
        purpose: OTP_PURPOSE,
        flow_uid: resolvedFlowUid,
        metadata: {},
      }).unwrap();

      setFlowUid(resolvedFlowUid);
      setVerificationToken(response.verification_token);
      setOtpVerifiedToken("");
      setIsOtpRequested(true);
      setShowOtpRegister(false);
      setOtpCode("");
      setResendCountdown(40);
      toast.success(response.message || "OTP sent.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to send OTP."));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!firstName || !lastName || !regEmail || !regPassword) return;
    registerMutation.mutate({ firstName, lastName, email: regEmail, password: regPassword });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    recoverMutation.mutate({ email: forgotEmail });
  };

  useEffect(() => {
    if (view !== "login" || !isOtpRequested) return;
    if (resendCountdown <= 0) return;

    const countdownInterval = window.setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(countdownInterval);
  }, [view, resendCountdown, isOtpRequested]);

  const handleResendOtp = async () => {
    if (!mobileNumber.replace(/\D/g, "")) {
      toast.error("Enter your mobile number first.");
      return;
    }
    await handleSendOtp();
  };

  return (
    <StorefrontLayout>
      <ThriftiLoader visible={isSubmitting} message={loaderMessage} />
      <div className=" flex items-center justify-center flex-col px-4 py-16">
        <div className="text-[40px] font-semibold mb-3 text-center anek-devanagari-font">
          SIGN IN / SIGN UP
        </div>
        <div className="w-full max-w-lg bg-[#F9FAFB] md:p-8 p-4 shadow-lg rounded-[12px]">

          {/* Forgot Password View */}
          {view === "forgot" && (
            <div>
              <button
                onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#CC2200] transition-colors mb-6"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>

              {forgotSent ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
                  <h2 className="text-xl font-black uppercase tracking-tight mb-2">Check Your Email</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    If an account exists for <span className="font-bold text-black">{forgotEmail}</span>,
                    you'll receive a password reset link shortly. Check your spam folder if you don't see it.
                  </p>
                  <button
                    onClick={() => { setView("login"); setForgotSent(false); setForgotEmail(""); }}
                    className="mt-6 text-sm font-bold text-[#CC2200] underline"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight mb-1">Reset Password</h2>
                    <p className="text-xs text-gray-500 mb-4">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoverMutation.isPending}
                    className={btnRed}
                  >
                    {recoverMutation.isPending ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Sign In / Register Tabs */}
          {view !== "forgot" && (
            <>
              {/* OTP Login Form */}
              {view === "login" && !showOtpRegister && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelClass}>Mobile Number</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                      inputMode="numeric"
                      className={inputClass}
                    />
                  </div>
                  {!isOtpRequested ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isRequestingOtp}
                      className={btnRed}
                    >
                      {isRequestingOtp ? "Sending OTP..." : "Send OTP"}
                    </button>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className={labelClass}>Enter OTP (6 DIGITS)</label>
                      </div>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder=""
                        required={isOtpRequested}
                        inputMode="numeric"
                        maxLength={6}
                        className={inputClass}
                      />
                      <div className="mt-2 text-center text-sm font-geist-mono font-medium text-[#1F1F22]">
                        {resendCountdown > 0 ? (
                          <span>
                            Resend OTP{" "}
                            <span className="text-[#F42824]">{resendCountdown} secs</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={isRequestingOtp}
                            className="text-[#F42824] hover:underline"
                          >
                            {isRequestingOtp ? "Sending..." : "Resend OTP"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {isOtpRequested && (
                    <button
                      type="submit"
                      disabled={isVerifyingOtp || isLoggingInWithOtp || loginWithPhoneMutation.isPending}
                      className={btnRed}
                    >
                      {isVerifyingOtp || isLoggingInWithOtp || loginWithPhoneMutation.isPending
                        ? "Signing In..."
                        : "Sign In"}
                    </button>
                  )}
                </form>
              )}

              {/* OTP New-User Registration Form */}
              {/* Shown when OTP is verified but phone is not found in Shopify */}
              {view === "login" && showOtpRegister && (
                <form onSubmit={handleOtpRegister} className="space-y-4">
                  <button
                    type="button"
                    onClick={() => { setShowOtpRegister(false); setIsOtpRequested(false); setOtpCode(""); }}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-[#CC2200] transition-colors mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <div>
                    <h2 className="text-lg font-black uppercase tracking-tight mb-1">Complete Your Profile</h2>
                    <p className="text-xs text-gray-500 mb-4">
                      Your number <span className="font-bold text-black">{mobileNumber}</span> is verified.
                      Please enter your details to create your Thrifti account.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={otpRegFirstName}
                        onChange={(e) => setOtpRegFirstName(e.target.value)}
                        placeholder="Priya"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={otpRegLastName}
                        onChange={(e) => setOtpRegLastName(e.target.value)}
                        placeholder="Sharma"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={otpRegEmail}
                      onChange={(e) => setOtpRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registerWithPhoneMutation.isPending}
                    className={btnRed}
                  >
                    {registerWithPhoneMutation.isPending ? "Creating Account..." : "Create Account"}
                  </button>
                </form>
              )}

              {/* Email/Password Register Form */}
              {view === "register" && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Priya"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Sharma"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 5 characters"
                      required
                      minLength={5}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <input
                      type="password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className={btnRed}
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                  </button>
                  <p className="text-center text-sm text-[#1F1F22] font-geist-mono font-medium mt-2">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setView("login")}
                      className="text-[#F42824] font-geist-mono font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </>
          )}

          {/* Footer */}
          <div className=" pt-6 text-center font-geist-mono text-xs text-[#1F1F22]">
            <p className="">
              By continuing, you agree to Thrifti's{" "}
              <a href="/terms" className=" hover:text-[#CC2200]">Terms of Use</a>{" "}
              and{" "}
              <a href="/privacy" className=" hover:text-[#CC2200]">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
