'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
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
  headings?: string[];
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  rotationInterval?: number;
  heroRaffle?: Raffle | null;
}

export default function Hero({
  headings = [
    'A Fixed-Rule ETH Draw System',
    'Fair Ai Crypto Raffles',
  ],
  subtitle = 'Entries are recorded on-chain. Draws execute on schedule. Payouts are verifiable.',
  ctaText = 'View Tournaments',
  ctaLink = '/raffles',
  rotationInterval = 6000, // 6 seconds
  heroRaffle = null,
}: HeroProps) {
  const { open } = useWeb3Modal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const raffleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // After animation completes, change heading
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % headings.length);
        setIsAnimating(false);
      }, 500);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [headings.length, rotationInterval]);

  const nextIndex = (currentIndex + 1) % headings.length;

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
      {/* Animated Grid Background */}
      <div className="hero-grid-background">
      </div>
      
      {/* Content */}
      <div className="container mx-auto relative z-10">
        {/* Static Hero Raffle Card - At Top */}
        {heroRaffle && (
          <div className="mb-12">
            <div 
              ref={raffleRef}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden mb-6"
            >
              {/* Timer at Top - Centered */}
              <div className="relative p-4 min-h-[60px] flex items-center justify-center bg-[#0f0f0f] border-b border-[#2a2a2a]">
                <div className="z-10">
                  <CountdownTimer endDate={heroRaffle.ends_at} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Image */}
                {heroRaffle.image_url && (
                  <div className="relative h-64 lg:h-full min-h-[300px] bg-[#0f0f0f] lg:col-span-1">
                    <img
                      src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                      alt={heroRaffle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f0f0f]/80 to-transparent"></div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center lg:col-span-2">
                  <div className="mb-4">
                    <span className="bg-[#00d97e] text-[#0a0a0a] px-3 py-1 rounded-full text-xs font-bold">
                      FEATURED RAFFLE
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-4">
                    {heroRaffle.title}
                  </h1>
                  <div className="flex items-center gap-6 mb-6">
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Prize Pool</p>
                      <p className="text-2xl font-bold text-[#00d97e]">
                        {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Entry Price</p>
                      <p className="text-xl font-bold text-[#f5f5f5]">
                        {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      href={`/raffles/${heroRaffle.id}`}
                      className="bg-[#00d97e] text-[#0a0a0a] px-8 py-4 rounded font-bold text-lg hover:bg-[#00c46a] transition-colors inline-flex items-center justify-center gap-2"
                    >
                      ENTER NOW
                      <ArrowRight className="w-5 h-5" />
                    </Link>
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

            {/* Raffle Rules Box */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
              <h3 className="text-[#f5f5f5] font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00d97e]" />
                Raffle Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d97e] mt-0.5 flex-shrink-0" />
                  <span>Entry price is fixed</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d97e] mt-0.5 flex-shrink-0" />
                  <span>Entry count is capped</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d97e] mt-0.5 flex-shrink-0" />
                  <span>Deadline is immutable</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d97e] mt-0.5 flex-shrink-0" />
                  <span>Draw runs even if not sold out</span>
                </div>
                <div className="flex items-start gap-2 md:col-span-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00d97e] mt-0.5 flex-shrink-0" />
                  <span>Payout is on-chain</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Animated Heading Section - Below Raffle */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Rotating Heading */}
          <div className="min-h-[120px] md:min-h-[160px] flex items-center justify-center mb-6 relative overflow-hidden">
            {/* Current Heading - Slides left and fades out */}
            <h1
              className={`absolute text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] transition-all duration-500 ease-in-out ${
                isAnimating 
                  ? 'hero-heading-slide-out' 
                  : 'translate-x-0 opacity-100'
              }`}
            >
              {headings[currentIndex]}
            </h1>
            
            {/* Next Heading - Slides in from right */}
            <h1
              className={`absolute text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] transition-all duration-500 ease-in-out ${
                isAnimating 
                  ? 'hero-heading-slide-in' 
                  : 'translate-x-[100px] opacity-0'
              }`}
            >
              {headings[nextIndex]}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Button */}
          <div className="mb-4">
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-3 bg-[#00d97e] text-[#0a0a0a] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00c46a] transition-colors duration-200"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Supporting line */}
          <p className="text-sm text-gray-500">
            No extensions. No redraws. No hidden rules.
          </p>
        </div>
      </div>
    </section>
  );
}
