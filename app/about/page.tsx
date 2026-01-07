'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Shield, Zap, Users, Award, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const headings = [
    'A Skill Based Raffle',
    'Answer the Question to Enter',
  ];
  
  const subtitle = 'Entries are recorded on-chain. Draws execute on schedule. Payouts are verifiable.';
  const rotationInterval = 6000; // 6 seconds

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-primary-dark">
        {/* Animated Hero Section */}
        <section className="relative py-12 md:py-20 px-4">
          {/* Animated Grid Background */}
          <div className="hero-grid-background"></div>
          
          {/* Content */}
          <div className="container mx-auto relative z-10">
            {/* Animated Heading Section - At Top */}
            <div className="max-w-4xl mx-auto text-center mb-12">
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
                  href="/raffles"
                  className="inline-flex items-center gap-3 bg-[#00d97e] text-[#0a0a0a] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00c46a] transition-colors duration-200"
                >
                  View Tournaments
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

        {/* Main Content */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* About PrimePick */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">About PrimePick</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                PrimePick is a <strong className="text-white">skill-based crypto competition platform</strong> built for transparency, fairness, and user control.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                We run digital competitions where <strong className="text-white">skill is required to participate</strong> and <strong className="text-white">no purchase is ever necessary</strong>. Every competition includes a mandatory skill question designed to ensure that entry is based on knowledge and reasoning — not chance alone.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Participants can choose to enter <strong className="text-white">for free</strong> or, where available, via an optional paid entry. <strong className="text-white">Both entry methods are treated equally</strong>, with the <strong className="text-white">same odds of winning</strong> and the <strong className="text-white">same draw process</strong>.
              </p>
            </div>

            {/* How It Works */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">How It Works</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Answer a skill question</h3>
                    <p className="text-gray-300">
                      Each competition requires participants to correctly answer a skill-based question before entering.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Choose how to enter</h3>
                    <ul className="text-gray-300 space-y-1 list-disc list-inside ml-4">
                      <li><strong className="text-white">Free entry</strong> via email</li>
                      <li>Optional paid entry using cryptocurrency</li>
                    </ul>
                    <p className="text-gray-300 mt-2">
                      There is <strong className="text-white">no advantage</strong> to either method.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Fair and transparent draw</h3>
                    <p className="text-gray-300">
                      Winners are selected using a transparent, non-discriminatory process. Entry method never affects the outcome.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">On-chain prizes</h3>
                    <p className="text-gray-300">
                      Prizes are paid directly to the winning wallet address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Our Principles */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Our Principles</h2>
              <div className="space-y-6">
                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-8 h-8 text-primary-green" />
                    <h3 className="text-xl font-bold text-white">Skill First</h3>
                  </div>
                  <p className="text-gray-300">
                    Skill is not cosmetic. It is a <strong className="text-white">mandatory requirement</strong> for all entries.
                  </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-8 h-8 text-primary-orange" />
                    <h3 className="text-xl font-bold text-white">No Purchase Necessary</h3>
                  </div>
                  <p className="text-gray-300">
                    Every competition includes a <strong className="text-white">free entry route</strong> with identical chances of winning.
                  </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-8 h-8 text-primary-green" />
                    <h3 className="text-xl font-bold text-white">Equal Odds</h3>
                  </div>
                  <p className="text-gray-300">
                    Paid and free entries are processed identically. No weighting. No preference.
                  </p>
                </div>

              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Lock className="w-8 h-8 text-primary-orange" />
                    <h3 className="text-xl font-bold text-white">Transparency</h3>
                  </div>
                  <p className="text-gray-300">
                    We clearly explain how entries work, how winners are selected, and how prizes are distributed.
                    </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-8 h-8 text-primary-green" />
                    <h3 className="text-xl font-bold text-white">User Control</h3>
                  </div>
                  <p className="text-gray-300">
                    Participants remain in control of their own wallets at all times.
                  </p>
                </div>
              </div>
            </div>

            {/* What PrimePick Is — and Is Not */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">What PrimePick Is — and Is Not</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary-gray border border-primary-green rounded-lg p-6">
                  <h3 className="text-xl font-bold text-primary-green mb-4">PrimePick is:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>A skill-based prize competition platform</li>
                    <li>Open to users aged 18+</li>
                    <li>Designed with fairness and compliance in mind</li>
                  </ul>
                </div>

                <div className="bg-primary-gray border border-primary-orange rounded-lg p-6">
                  <h3 className="text-xl font-bold text-primary-orange mb-4">PrimePick is not:</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>A gambling or betting service</li>
                    <li>A casino or sportsbook</li>
                    <li>A custodial wallet or exchange</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Responsible Participation */}
            <div className="mb-16">
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Responsible Participation</h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  PrimePick is intended for responsible participation only.
                  We do not encourage excessive or impulsive behaviour, and we provide clear information so users can make informed decisions.
                </p>
              </div>
            </div>

            {/* Looking Ahead */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Looking Ahead</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                PrimePick is an early-stage platform built for a global, crypto-native audience. As we grow, we plan to continue strengthening our compliance framework, transparency tools, and user protections.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our goal is simple: <strong className="text-white">run fair, skill-based competitions that users can trust.</strong>
              </p>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-primary-green/20 to-primary-orange/20 border-2 border-primary-green rounded-lg p-8">
              <Trophy className="w-16 h-16 text-primary-orange mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Participate?</h2>
              <p className="text-gray-300 mb-6">
                Join our skill-based competitions and test your knowledge
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/raffles"
                  className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  View Competitions
                </Link>
                <Link
                  href="/winners"
                  className="bg-primary-orange text-white px-8 py-4 rounded font-bold text-lg hover:bg-primary-orange/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  See Winners
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

