"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await register(username, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] flex items-center justify-center relative overflow-hidden px-5 py-10">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/10 via-transparent to-brand-accent/10" />

      {/* Card */}
      <div className="relative z-10 bg-dark-surface border border-border-light rounded-3xl p-12 w-full max-w-screen-sm shadow-2xl">
        <div className="text-center mb-9">
          <h1 className="font-syne text-3xl font-extrabold mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Join Quiz Battle and start competing</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main text-sm focus:border-brand-primary focus:outline-none focus:shadow-glow transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main text-sm focus:border-brand-primary focus:outline-none focus:shadow-glow transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main text-sm focus:border-brand-primary focus:outline-none focus:shadow-glow transition-all"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main text-sm focus:border-brand-primary focus:outline-none focus:shadow-glow transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-semibold text-sm cursor-pointer transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-text-muted">
          Already have an account?{" "}
          <Link href="/" className="text-brand-primary-light cursor-pointer hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
