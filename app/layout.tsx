import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrimePick Tournament - Crypto Raffle Platform",
  description: "Play to earn crypto raffles and tournaments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

