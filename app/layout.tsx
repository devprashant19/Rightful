import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://rightful-nu.vercel.app";
const TITLE = "Rightful — Evidence-Backed Consumer Claims Agent";
const DESCRIPTION =
  "Nemotron proposes, code decides. Every cited policy quote must exist verbatim in the retrieved page, or the row is downgraded. Refunds, returns and warranty claims proved against the seller's own policy.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Rightful",
  authors: [{ name: "Dev Prashant" }],
  keywords: [
    "consumer rights",
    "refund claim",
    "warranty claim",
    "return policy",
    "NVIDIA Nemotron",
    "Nebius Token Factory",
    "deterministic verification",
    "AI grounding",
  ],
  // app/icon.svg and app/opengraph-image.png are picked up by the App Router
  // file conventions; this block only adds what those cannot express.
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Rightful",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: { index: true, follow: true },
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

