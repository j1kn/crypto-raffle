'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface Raffle {
  id: string;
  title: string;
  image_url: string | null;
  prize_pool_amount: number;
  prize_pool_symbol: string;
  ticket_price: number;
  ends_at: string;
}

interface HeroProps {
  heading?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  heroRaffle?: Raffle | null;
}

export default function Hero({
  heading = '100% on-chain. Fully transparent.',
  subtitle = 'Connect your wallet, choose your entries, and the draw runs transparently on-chain with instant payout.',
  ctaText = 'View Tournaments',
  ctaLink = '/raffles',
  heroRaffle = null,
}: HeroProps) {
  const { open } = useWeb3Modal();

  const convertGoogleDriveUrl = (url: string | null): string | null => {
    if (!url) return null;
    if (url.includes('drive.google.com')) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      const altMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (altMatch) {
        return `https://drive.google.com/uc?export=view&id=${altMatch[1]}`;
      }
    }
    return url;
  };

  return (
    <section className="relative py-12 md:py-20 px-4">
      {/* Static grid background (no glow animation) */}
      <div className="hero-grid-background" />

      <div className="container mx-auto relative z-10">
        {/* Hero Raffle Card */}
        {heroRaffle && (
          <div className="bg-primary-gray border-2 border-primary-green rounded-lg overflow-hidden mb-10">
            {/* Timer at Top - Centered */}
            <div className="relative p-4 min-h-[60px] flex items-center justify-center">
              <div className="z-10">
                <CountdownTimer endDate={heroRaffle.ends_at} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Image */}
              {heroRaffle.image_url && (
                <div className="relative h-64 lg:h-full min-h-[300px] bg-primary-darker">
                  <img
                    src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                    alt={heroRaffle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="mb-4">
                  <span className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                    FEATURED RAFFLE
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {heroRaffle.title}
                </h1>
                <div className="flex items-center gap-6 mb-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                    <p className="text-2xl font-bold text-primary-green">
                      {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Entry Price</p>
                    <p className="text-xl font-bold text-white">
                      {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/raffles/${heroRaffle.id}`}
                    className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    ENTER NOW
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  {/* Show connect wallet only on desktop for hero raffle */}
                  <button
                    onClick={() => open()}
                    className="hidden sm:inline-flex bg-primary-orange text-white px-8 py-4 rounded font-bold text-lg hover:bg-primary-orange/90 transition-colors items-center justify-center gap-2"
                  >
                    CONNECT WALLET
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heading Section below raffle */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            {heading}
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* Buttons row: Tournament + Connect Wallet */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-3 bg-primary-green text-primary-darker px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-green/90 transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => open()}
              className="inline-flex items-center gap-3 bg-primary-orange text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-orange/90 transition-colors duration-200 w-full sm:w-auto justify-center"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


