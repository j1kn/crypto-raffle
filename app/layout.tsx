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
        {/* Global animated shine effects */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-0 right-0 h-[300%]"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                rgba(0, 255, 136, 0.08) 15%,
                rgba(0, 255, 136, 0.12) 30%,
                rgba(0, 255, 136, 0.15) 50%,
                rgba(0, 255, 136, 0.12) 70%,
                rgba(0, 255, 136, 0.08) 85%,
                transparent 100%
              )`,
              animation: 'grid-shine 10s linear infinite',
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-[300%]"
            style={{
              background: `linear-gradient(
                to bottom,
                transparent 0%,
                rgba(0, 255, 136, 0.06) 20%,
                rgba(0, 255, 136, 0.1) 50%,
                rgba(0, 255, 136, 0.06) 80%,
                transparent 100%
              )`,
              animation: 'grid-shine-delayed 12s linear infinite',
              animationDelay: '2s',
            }}
          />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

