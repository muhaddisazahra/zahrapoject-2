
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OnboardFlow | Nexa Digital Studio",
  description:
    "A smart client onboarding and project brief generation platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
