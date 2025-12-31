import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      <body className="antialiased">
        {/* Global animated shine effects - same as hero section */}
        <div className="fixed inset-0 pointer-events-none z-0 hero-grid-shine"></div>
        <div className="fixed inset-0 pointer-events-none z-0 hero-grid-shine-delayed"></div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

