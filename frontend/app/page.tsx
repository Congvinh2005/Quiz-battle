"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoginScreen from "@/components/screens/LoginScreen";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return <LoginScreen />;
}
