import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useShopifyAuth } from "@/contexts/ShopifyAuthContext";
import StorefrontLayout from "@/components/StorefrontLayout";
import { toast } from "sonner";

type Tab = "login" | "register";

export default function Login() {
  const [tab, setTab] = useState<Tab>("login");
  const [, navigate] = useLocation();
  const { setTokenAndFetch } = useShopifyAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

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

  return (
    <StorefrontLayout>
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1
              className="text-4xl font-black uppercase tracking-tight text-[#CC2200]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              THRIFTI
            </h1>
            <p className="text-sm text-gray-500 mt-1 tracking-widest uppercase">
              Buy. Sell. Repeat.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex border-2 border-black mb-6">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                tab === "login"
                  ? "bg-black text-white"
                  : "bg-transparent text-black hover:bg-gray-100"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${
                tab === "register"
                  ? "bg-black text-white"
                  : "bg-transparent text-black hover:bg-gray-100"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full bg-[#CC2200] text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors disabled:opacity-60"
              >
                {loginMutation.isPending ? "Signing In..." : "Sign In"}
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("register")}
                  className="text-[#CC2200] font-bold underline"
                >
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Priya"
                    required
                    className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Sharma"
                    required
                    className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min. 5 characters"
                  required
                  minLength={5}
                  className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-600 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border-2 border-black px-4 py-3 text-sm bg-white focus:outline-none focus:border-[#CC2200] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full bg-[#CC2200] text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-[#aa1a00] transition-colors disabled:opacity-60"
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </button>
              <p className="text-center text-xs text-gray-500 mt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("login")}
                  className="text-[#CC2200] font-bold underline"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Divider */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-400">
              By continuing, you agree to Thrifti's{" "}
              <a href="/terms" className="underline hover:text-[#CC2200]">
                Terms of Use
              </a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-[#CC2200]">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
