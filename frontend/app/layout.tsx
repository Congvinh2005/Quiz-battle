import type { Metadata } from "next";
import RootLayout from "@/components/layouts/RootLayout";
require("../styles/globals.css");


export const metadata: Metadata = {
  title: "Quiz Battle - Real-time Quiz Platform",
  description: "Play multiplayer quizzes in real-time with friends",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg)", color: "var(--text)" }} className="antialiased">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
