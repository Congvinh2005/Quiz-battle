"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(username, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-53px)] grid grid-cols-2 relative overflow-hidden">
      {/* Left side */}
      <div className="px-12 py-16 flex flex-col justify-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-brand-primary px-3.5 py-1.5 rounded-full mb-7 w-fit border border-brand-primary">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary-light animate-pulse" />
          <span className="text-xs font-medium text-brand-primary-light">Live Quiz Platform</span>
        </div>

        <h1 className="font-syne text-5xl font-extrabold leading-tight mb-2.5">
          Welcome to <span className="text-brand-primary-light">Quiz</span>
          <span className="text-brand-accent">Battle</span>
        </h1>
        <p className="text-text-muted text-sm leading-relaxed mb-9">
          Join real-time quiz battles with friends. Compete, learn, and climb the leaderboard.
        </p>

        {error && <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
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
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-dark-surface2 border border-border-light text-text-main text-sm focus:border-brand-primary focus:outline-none focus:shadow-glow transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-primary-light text-white font-semibold text-sm cursor-pointer transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5 text-text-muted">
          <div className="flex-1 h-px bg-border-light" />
          <span className="text-xs">Or continue with</span>
          <div className="flex-1 h-px bg-border-light" />
        </div>

        <button className="w-full py-3 rounded-xl bg-transparent border border-border-light text-text-main font-medium text-sm cursor-pointer transition-all hover:bg-dark-surface2">
          Sign up with Email
        </button>

        <div className="mt-6 text-center text-xs text-text-muted">
          Don't have an account?{" "}
          <Link href="/register" className="text-brand-primary-light cursor-pointer hover:underline">
            Create one
          </Link>
        </div>
      </div>

      {/* Right side - Orbs */}
      <div className="relative overflow-hidden flex items-center justify-center">
        <div className="absolute w-96 h-96 bg-brand-primary rounded-full blur-3xl opacity-50 -top-16 -right-16" />
        <div className="absolute w-72 h-72 bg-brand-accent rounded-full blur-3xl opacity-50 -bottom-8 right-16" />

        {/* Demo Cards */}
        <div className="relative z-10 flex flex-col gap-3 p-5">
          <div className="bg-dark-surface2 bg-opacity-85 backdrop-blur-xl border border-border-light rounded-2xl p-5 w-64">
            <h3 className="font-syne text-xs font-bold text-text-muted uppercase tracking-widest mb-2.5">Live Players</h3>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="font-syne text-3xl font-extrabold text-brand-primary-light">1.2K</div>
                <div className="text-xs text-text-muted">Online</div>
              </div>
              <div className="text-center">
                <div className="font-syne text-3xl font-extrabold text-brand-accent">4.5K</div>
                <div className="text-xs text-text-muted">Today</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
