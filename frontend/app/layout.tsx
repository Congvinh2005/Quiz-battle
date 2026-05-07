import type { Metadata } from "next";
import RootLayout from "@/components/layouts/RootLayout";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Quiz Battle - Real-time Quiz Platform",
  description: "Play multiplayer quizzes in real-time with friends",
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-dark-bg text-text-main antialiased">
        <RootLayout>{children}</RootLayout>
      </body>
    </html>
  );
}
