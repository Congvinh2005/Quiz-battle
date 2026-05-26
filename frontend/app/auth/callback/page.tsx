"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const googleExchangeRequests = new Map<string, Promise<void>>();

function CallbackContent() {
  const [statusMsg, setStatusMsg] = useState("Đang liên kết tài khoản Google...");
  const [errorMsg, setErrorMsg] = useState("");
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (error) {
      setErrorMsg(errorDescription || error || "Đăng nhập bằng Google thất bại.");
      return;
    }
    
    if (!code) {
      setErrorMsg("Không tìm thấy mã xác thực Google.");
      return;
    }

    let isActive = true;
    
    let exchangeRequest = googleExchangeRequests.get(code);
    if (!exchangeRequest) {
      exchangeRequest = loginWithGoogle(code).finally(() => {
        googleExchangeRequests.delete(code);
      });
      googleExchangeRequests.set(code, exchangeRequest);
    }

    exchangeRequest
      .then(() => {
        if (isActive) {
          setStatusMsg("Đăng nhập thành công! Đang chuyển hướng...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 800);
        }
      })
      .catch((err: any) => {
        if (isActive) {
          console.error("OAuth code exchange failed:", err);
          const detail = err?.response?.data?.detail || err?.response?.data?.message || err?.message;
          setErrorMsg(typeof detail === "string" ? detail : "Xác thực Google thất bại. Vui lòng thử lại.");
        }
      });
    
    return () => {
      isActive = false;
    };
  }, [searchParams, loginWithGoogle, router]);

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes oauth-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes oauth-spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
      <div style={orb1Style} />
      <div style={orb2Style} />
      <div style={cardStyle}>
        <div style={logoContainerStyle}>
          <img src="/favicon.png" alt="QuizBattle" style={logoStyle} />
        </div>
        
        {errorMsg ? (
          <>
            <h2 style={errorTitleStyle}>Đăng nhập thất bại</h2>
            <p style={errorDescStyle}>{errorMsg}</p>
            <Link href="/login" style={buttonStyle}>
              Quay lại Đăng nhập
            </Link>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>QuizBattle</h2>
            <div style={spinnerContainerStyle}>
              <div style={spinnerStyle} />
              <div style={spinnerInnerStyle} />
            </div>
            <p style={descStyle}>{statusMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={titleStyle}>QuizBattle</h2>
          <div style={spinnerContainerStyle}>
            <div style={{ ...spinnerStyle, animation: "none" }} />
          </div>
          <p style={descStyle}>Đang tải trang...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

const containerStyle: React.CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0f172a",
  fontFamily: "'DM Sans', sans-serif",
  position: "relative",
  overflow: "hidden",
};

const orb1Style: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(100px)",
  opacity: 0.35,
  width: "400px",
  height: "400px",
  background: "#7c3aed",
  top: "10%",
  left: "10%",
  zIndex: 1,
};

const orb2Style: React.CSSProperties = {
  position: "absolute",
  borderRadius: "50%",
  filter: "blur(100px)",
  opacity: 0.35,
  width: "400px",
  height: "400px",
  background: "#f43f5e",
  bottom: "10%",
  right: "10%",
  zIndex: 1,
};

const cardStyle: React.CSSProperties = {
  background: "rgba(30, 41, 59, 0.7)",
  backdropFilter: "blur(20px)",
  border: "1px solid rgba(124, 58, 237, 0.2)",
  borderRadius: "24px",
  padding: "48px 40px",
  width: "100%",
  maxWidth: "460px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  zIndex: 10,
  position: "relative",
};

const logoContainerStyle: React.CSSProperties = {
  width: "80px",
  height: "80px",
  borderRadius: "20px",
  background: "#ffffff",
  padding: "8px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
  marginBottom: "24px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const logoStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: "28px",
  fontWeight: 800,
  color: "#ffffff",
  marginBottom: "32px",
  letterSpacing: "-0.02em",
};

const errorTitleStyle: React.CSSProperties = {
  fontFamily: "'Syne', sans-serif",
  fontSize: "24px",
  fontWeight: 800,
  color: "#f43f5e",
  marginBottom: "16px",
};

const errorDescStyle: React.CSSProperties = {
  fontSize: "14px",
  color: "#94a3b8",
  marginBottom: "32px",
  lineHeight: 1.6,
};

const descStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "#cbd5e1",
  fontWeight: 500,
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px 24px",
  background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
  color: "#ffffff",
  borderRadius: "9999px",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)",
  transition: "all 0.2s ease",
};

const spinnerContainerStyle: React.CSSProperties = {
  position: "relative",
  width: "72px",
  height: "72px",
  marginBottom: "32px",
};

const spinnerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "4px solid rgba(124, 58, 237, 0.1)",
  borderTop: "4px solid #7c3aed",
  borderRight: "4px solid #f43f5e",
  borderRadius: "50%",
  animation: "oauth-spin 1s linear infinite",
};

const spinnerInnerStyle: React.CSSProperties = {
  position: "absolute",
  top: "12px",
  left: "12px",
  width: "48px",
  height: "48px",
  border: "3px solid rgba(244, 63, 94, 0.1)",
  borderBottom: "3px solid #f43f5e",
  borderLeft: "3px solid #7c3aed",
  borderRadius: "50%",
  animation: "oauth-spin-reverse 1.2s linear infinite",
};
