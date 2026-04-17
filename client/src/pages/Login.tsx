import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import ThriftiLogo from "@/components/ThriftiLogo";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";

type View = "login" | "register" | "forgot";

const inputClass =
  "w-full border-2 border-black/40 px-4 py-3 text-sm bg-[#F9FAFB] focus:outline-none focus:border-[#CC2200] transition-colors font-geist-mono rounded-[6px] text-[#1F1F22] mb-2";
const labelClass = "block text-sm font-medium geist-mono-font text-[#1F1F22] mb-1";
const btnRed =
  "w-full bg-[#F42824] text-white pt-4 pb-2 text-2xl font-semibold uppercase hover:bg-[#aa1a00] transition-colors disabled:opacity-60 rounded-[6px] anek-devanagari-font mt-2 mb-4";

export default function Login() {
  const [view, setView] = useState<View>("login");
  const [, navigate] = useLocation();
  const { setTokenAndFetch } = useShopifyAuth();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const loginMutation = trpc.customer.login.useMutation({
    onSuccess: (data) => {
      setTokenAndFetch(data.accessToken, data.expiresAt);
      toast.success("Welcome back!");
      navigate("/account");
    },
    onError: (err) => {
      toast.error(err.message || "Login failed. Please check your credentials.");
    },
  });

  const registerMutation = trpc.customer.register.useMutation({
    onSuccess: (data) => {
      setTokenAndFetch(data.accessToken, data.expiresAt);
      toast.success("Account created! Welcome to Thrifti.");
      navigate("/account");
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
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

  return (
    <StorefrontLayout>
      <div className=" flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg bg-[#F9FAFB] md:p-8 p-4 shadow-lg rounded-[12px]">
          {/* Header */}
          {/* <div className="text-center mb-8">
              <ThriftiLogo height={64} className="mx-auto" />
          </div> */}

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
              {/* Tab switcher */}
              <div className="flex border-2 border-black mb-8 rounded-[6px]">
                <button
                  onClick={() => setView("login")}
                  className={`flex-1 py-2.5 lg:text-lg font-semibold geist-mono-font uppercase transition-colors ${view === "login" ? "bg-black text-white" : "bg-transparent text-black hover:bg-gray-100"
                    }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setView("register")}
                  className={`flex-1 py-2.5 lg:text-lg font-semibold geist-mono-font uppercase transition-colors ${view === "register" ? "bg-black text-white" : "bg-transparent text-black hover:bg-gray-100"
                    }`}
                >
                  Create Account
                </button>
              </div>

              {/* Login Form */}
              {view === "login" && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelClass}>Password</label>
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() => setView("forgot")}
                      className="text-sm text-[#F42824] font-medium geist-mono-font hover:underline"
                    >
                      Forgot password
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className={btnRed}
                  >
                    {loginMutation.isPending ? "Signing In..." : "Sign In"}
                  </button>
                  <p className="text-center text-sm text-[#1F1F22] font-geist-mono font-medium mt-2">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setView("register")}
                      className="text-[#F42824] font-geist-mono font-medium"
                    >
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* Register Form */}
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
          <div className="mt-8 pt-6 text-center font-geist-mono text-xs text-[#1F1F22]">
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
