'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';
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
    '100% on-chain. Fully transparent.',
    'Fair Ai Crypto Raffles',
  ],
  subtitle = 'Connect your wallet, choose your entries, and the draw runs transparently on-chain with instant payout.',
  ctaText = 'View Tournaments',
  ctaLink = '/raffles',
  rotationInterval = 6000, // 6 seconds
  heroRaffle = null,
}: HeroProps) {
  const { open } = useWeb3Modal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const raffleRef = useRef<HTMLDivElement>(null);

  // Calculate total items: if heroRaffle exists, add 1 to headings length
  const totalItems = heroRaffle ? headings.length + 1 : headings.length;
  // Start with raffle if it exists (index = headings.length), otherwise start with 0
  const startIndex = heroRaffle ? headings.length : 0;

  useEffect(() => {
    // Reset to start index when heroRaffle changes
    setCurrentIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    if (isPaused) return;

    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setIsAnimating(true);
        
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % totalItems);
          setIsAnimating(false);
        }, 500);
      }, rotationInterval);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [totalItems, rotationInterval, isPaused]);

  // Pause on hover/touch
  useEffect(() => {
    const raffleElement = raffleRef.current;
    if (!raffleElement) return;

    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
    const handleTouchStart = () => setIsPaused(true);
    const handleTouchEnd = () => {
      setTimeout(() => setIsPaused(false), 2000); // Resume after 2 seconds
    };

    raffleElement.addEventListener('mouseenter', handleMouseEnter);
    raffleElement.addEventListener('mouseleave', handleMouseLeave);
    raffleElement.addEventListener('touchstart', handleTouchStart);
    raffleElement.addEventListener('touchend', handleTouchEnd);

    return () => {
      raffleElement.removeEventListener('mouseenter', handleMouseEnter);
      raffleElement.removeEventListener('mouseleave', handleMouseLeave);
      raffleElement.removeEventListener('touchstart', handleTouchStart);
      raffleElement.removeEventListener('touchend', handleTouchEnd);
    };
  }, [heroRaffle]);

  const nextIndex = (currentIndex + 1) % totalItems;
  const isShowingRaffle = heroRaffle && currentIndex === headings.length;
  const isNextRaffle = heroRaffle && nextIndex === headings.length;

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
    <section 
      className="relative py-20 md:py-32 px-4"
    >
      {/* Animated Grid Background */}
      <div className="hero-grid-background">
        <div className="hero-grid-shine"></div>
        <div className="hero-grid-shine-delayed"></div>
      </div>
      
      {/* Content */}
      <div 
        className="container mx-auto relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          {/* Rotating Content Area */}
          <div className="min-h-[400px] md:min-h-[500px] flex items-center justify-center relative overflow-hidden mb-6">
            {/* Current Heading - Slides left and fades out */}
            {!isShowingRaffle && (
              <h1
                className={`absolute text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center transition-all duration-500 ease-in-out ${
                  isAnimating 
                    ? 'hero-heading-slide-out' 
                    : 'translate-x-0 opacity-100'
                }`}
              >
                {headings[currentIndex]}
              </h1>
            )}
            
            {/* Next Heading - Slides in from right */}
            {!isNextRaffle && nextIndex < headings.length && (
              <h1
                className={`absolute text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center transition-all duration-500 ease-in-out ${
                  isAnimating 
                    ? 'hero-heading-slide-in' 
                    : 'translate-x-[100px] opacity-0'
                }`}
              >
                {headings[nextIndex]}
              </h1>
            )}

            {/* Current Raffle - Slides in/out */}
            {isShowingRaffle && heroRaffle && (
              <div
                ref={raffleRef}
                className={`absolute w-full max-w-4xl transition-all duration-500 ease-in-out ${
                  isAnimating 
                    ? 'hero-heading-slide-out' 
                    : 'translate-x-0 opacity-100'
                }`}
              >
                <div className="bg-primary-gray border-2 border-primary-green rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative p-4 min-h-[60px] flex items-center justify-center bg-primary-darker/50">
                    <CountdownTimer endDate={heroRaffle.ends_at} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {heroRaffle.image_url && (
                      <div className="relative h-64 lg:h-80 bg-primary-darker">
                        <img
                          src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                          alt={heroRaffle.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      <div className="mb-3">
                        <span className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED RAFFLE
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                        {heroRaffle.title}
                      </h2>
                      <div className="flex items-center gap-6 mb-6">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                          <p className="text-xl md:text-2xl font-bold text-primary-green">
                            {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Entry Price</p>
                          <p className="text-lg md:text-xl font-bold text-white">
                            {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href={`/raffles/${heroRaffle.id}`}
                          className="bg-primary-green text-primary-darker px-6 py-3 rounded font-bold hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          ENTER NOW
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => open()}
                          className="bg-primary-orange text-white px-6 py-3 rounded font-bold hover:bg-primary-orange/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          CONNECT WALLET
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Raffle - Slides in from right */}
            {isNextRaffle && heroRaffle && (
              <div
                className={`absolute w-full max-w-4xl transition-all duration-500 ease-in-out ${
                  isAnimating 
                    ? 'hero-heading-slide-in' 
                    : 'translate-x-[100px] opacity-0'
                }`}
              >
                <div className="bg-primary-gray border-2 border-primary-green rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative p-4 min-h-[60px] flex items-center justify-center bg-primary-darker/50">
                    <CountdownTimer endDate={heroRaffle.ends_at} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    {heroRaffle.image_url && (
                      <div className="relative h-64 lg:h-80 bg-primary-darker">
                        <img
                          src={convertGoogleDriveUrl(heroRaffle.image_url) || heroRaffle.image_url}
                          alt={heroRaffle.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="p-6 lg:p-8 flex flex-col justify-center">
                      <div className="mb-3">
                        <span className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                          FEATURED RAFFLE
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                        {heroRaffle.title}
                      </h2>
                      <div className="flex items-center gap-6 mb-6">
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Prize Pool</p>
                          <p className="text-xl md:text-2xl font-bold text-primary-green">
                            {heroRaffle.prize_pool_symbol} {heroRaffle.prize_pool_amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm mb-1">Entry Price</p>
                          <p className="text-lg md:text-xl font-bold text-white">
                            {heroRaffle.prize_pool_symbol} {heroRaffle.ticket_price}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          href={`/raffles/${heroRaffle.id}`}
                          className="bg-primary-green text-primary-darker px-6 py-3 rounded font-bold hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          ENTER NOW
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => open()}
                          className="bg-primary-orange text-white px-6 py-3 rounded font-bold hover:bg-primary-orange/90 transition-colors inline-flex items-center justify-center gap-2"
                        >
                          CONNECT WALLET
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Subtitle - Fades when raffle is showing */}
          <div className="text-center mb-10">
            <p className={`text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed transition-opacity duration-500 ${
              isShowingRaffle ? 'opacity-0' : 'opacity-100'
            }`}>
              {subtitle}
            </p>
          </div>

          {/* CTA Button - Fades when raffle is showing */}
          <div className={`text-center transition-opacity duration-500 ${
            isShowingRaffle ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <Link
              href={ctaLink}
              className="inline-flex items-center gap-3 bg-primary-green text-primary-darker px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-green/90 transition-colors duration-200"
            >
              {ctaText}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

