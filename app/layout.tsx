import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import PageTransition from "@/components/PageTransition";

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
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}

