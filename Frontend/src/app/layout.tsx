import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareSync | Your trusted digital front desk.",
  description:
    "CareSync helps clinics streamline patient communication, appointment scheduling, and more. Your trusted digital front desk.",
  openGraph: {
    title: "CareSync | Your trusted digital front desk.",
    description:
      "CareSync helps clinics streamline patient communication, appointment scheduling, and more.",
    url: "https://care-sync-prod.vercel.app/",
    siteName: "CareSync",
    images: [
      {
        url: "/media/favicon.png",
        width: 1200,
        height: 630,
        alt: "CareSync Share Card",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
