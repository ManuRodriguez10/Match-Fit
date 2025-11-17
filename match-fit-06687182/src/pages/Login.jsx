import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPageUrl } from "@/utils";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/api/supabaseClient";

const LOGO_FULL =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/32285dc04_MatchFitLogo.png";

const LOGO_ICON =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c332f7b5426ee106687182/b49de559c_MatchFitSmallLogo.png";

export default function Login() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.email || !formState.password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formState.email,
        password: formState.password
      });

      if (authError) {
        throw authError;
      }

      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      setError(err.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col lg:flex-row">
      {/* Left Column */}
      <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 py-10 flex flex-col">
        <div className="mb-8">
          <Link to={createPageUrl("LandingPage")} className="inline-flex">
            <img src={LOGO_FULL} alt="MatchFit Logo" className="h-12 w-auto" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Welcome Back</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Log in to MatchFit</h1>
            <p className="text-gray-600 mt-4">
              Manage your team, schedule events, and stay connected with your players.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="coach@matchfit.com"
                value={formState.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-white"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formState.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-white"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? "Signing In..." : "Log In"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link to={createPageUrl("Signup")} className="text-blue-600 font-semibold hover:text-blue-700">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} MatchFit. All rights reserved.
        </div>
      </div>

      {/* Right Column */}
      <div className="hidden lg:flex w-full lg:w-1/2 bg-[var(--primary-dark,#0c5798)] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full gap-6">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/20">
            <img src={LOGO_ICON} alt="MatchFit badge" className="h-9 w-9" />
          </div>
          <span className="text-4xl font-semibold tracking-wide">MatchFit</span>
          <p className="text-blue-100 max-w-md">
            Built to keep coaches and players aligned every step of the season.
          </p>
        </div>
      </div>
    </div>
  );
}

