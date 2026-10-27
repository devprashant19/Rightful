import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rightful — Evidence-Backed Consumer Claims Agent",
  description: "Get what the policy already promised you. Proves returns, refunds, and warranty claims against the seller's own policy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

