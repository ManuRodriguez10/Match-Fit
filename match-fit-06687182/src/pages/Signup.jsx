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

export default function Signup() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // 'coach' or 'player'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.email || !formState.password || !formState.role) {
      setError("Please complete all required fields.");
      return;
    }

    if (formState.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            team_role: formState.role // Store in user_metadata for immediate access
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      // Profile is automatically created by database trigger
      // Update it with the selected role
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ team_role: formState.role })
          .eq('id', data.user.id);

        if (profileError) {
          console.error("Error updating profile:", profileError);
          // Don't throw - profile was created, just role update failed
          // The role is also stored in user_metadata as fallback
        }
      }

      if (data?.session) {
        navigate(createPageUrl("Dashboard"));
      } else {
        setSuccessMessage("Please check your email to confirm your account before logging in.");
        setFormState((prev) => ({
          ...prev,
          password: "",
          confirmPassword: ""
        }));
      }
    } catch (err) {
      setError(err.message || "Unable to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-full lg:w-1/2 bg-[var(--primary-dark,#0c5798)] text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,rgba(255,255,255,0.35),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full gap-6">
          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-lg shadow-black/20">
            <img src={LOGO_ICON} alt="MatchFit badge" className="h-9 w-9" />
          </div>
          <span className="text-4xl font-semibold tracking-wide">MatchFit</span>
          <p className="text-blue-100 max-w-md">
            Build smarter routines and keep your team informed with ease.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 px-6 sm:px-10 lg:px-16 py-10 flex flex-col">
        <div className="mb-8">
          <Link to={createPageUrl("LandingPage")} className="inline-flex">
            <img src={LOGO_FULL} alt="MatchFit Logo" className="h-12 w-auto" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Get Started</p>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Create your MatchFit account</h1>
            <p className="text-gray-600 mt-4">It only takes a couple of minutes to set up your team workspace.</p>
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
                placeholder="you@matchfit.com"
                value={formState.email}
                onChange={handleChange}
                disabled={isSubmitting}
                className="bg-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formState.password}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-white"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={formState.confirmPassword}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="bg-white"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a... *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, role: "coach" }))}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formState.role === "coach"
                      ? "border-[var(--primary-main)] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">Coach</div>
                    <div className="text-sm text-gray-500 mt-1">Manage teams and players</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormState((prev) => ({ ...prev, role: "player" }))}
                  disabled={isSubmitting}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formState.role === "player"
                      ? "border-[var(--primary-main)] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">Player</div>
                    <div className="text-sm text-gray-500 mt-1">Join teams and view schedules</div>
                  </div>
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {!error && successMessage && (
              <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to={createPageUrl("Login")} className="text-blue-600 font-semibold hover:text-blue-700">
              Log in
            </Link>
          </div>
        </div>

        <div className="mt-12 text-xs text-gray-400 text-center">
          © {new Date().getFullYear()} MatchFit. All rights reserved.
        </div>
      </div>
    </div>
  );
}

