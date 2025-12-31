'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  headings?: string[];
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  rotationInterval?: number;
}

export default function Hero({
  headings = [
    '100% on-chain. Fully transparent.',
    'Provably fair crypto raffles.',
  ],
  subtitle = 'Connect your wallet, choose your entries, and the draw runs transparently on-chain with instant payout.',
  ctaText = 'Enter Raffle',
  ctaLink = '/raffles',
  rotationInterval = 4000, // 4 seconds
}: HeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out completes, change heading
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % headings.length);
        // Fade in
        setIsVisible(true);
      }, 300); // Half of transition duration
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [headings.length, rotationInterval]);

  return (
    <section className="relative bg-gradient-to-b from-primary-darker to-primary-dark py-20 md:py-32 px-4 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="hero-grid-background">
        <div className="hero-grid-shine"></div>
        <div className="hero-grid-shine-delayed"></div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Rotating Heading */}
          <div className="min-h-[120px] md:min-h-[160px] flex items-center justify-center mb-6">
            <h1
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white transition-opacity duration-300 ease-in-out ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {headings[currentIndex]}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Button */}
          <Link
            href={ctaLink}
            className="inline-flex items-center gap-3 bg-primary-green text-primary-darker px-8 py-4 rounded-lg font-bold text-lg hover:bg-primary-green/90 transition-colors duration-200"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

