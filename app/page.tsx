'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary-darker to-primary-dark py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            TOURNAMENT
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            HOME • TOURNAMENT
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/raffles"
              className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              VIEW LIVE RAFFLES
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={async () => {
                if (typeof window !== 'undefined') {
                  try {
                    const { connectWallet } = await import('@/lib/wallet');
                    const address = await connectWallet();
                    if (address) {
                      window.location.href = '/dashboard';
                    } else {
                      alert('Failed to connect wallet. Please try again.');
                    }
                  } catch (error: any) {
                    alert(error?.message || 'Failed to connect wallet. Please try again.');
                  }
                }
              }}
              className="bg-primary-orange text-white px-8 py-4 rounded font-bold text-lg hover:bg-primary-orange/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary-dark to-transparent"></div>
      </section>

      {/* Play to Earn Games Section */}
      <section className="py-20 px-4 bg-primary-dark">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-green text-sm font-semibold mb-2">OUR TOURNAMENT</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              PLAY TO EARN GAMES
            </h2>
            <div className="w-24 h-1 bg-primary-green mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sample Tournament Cards - These will be replaced with real data */}
            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 hover:border-primary-green transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                  🏆 25000
                </div>
                <div className="text-primary-green text-xs">681 : 22 : 9 : 5</div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">TOURNAMENT OF WEEKLY</h3>
              <p className="text-gray-400 text-sm mb-4">3 PRIZE PLACES 🏆</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">BLACK NINJA</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FOXTIE MAX</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HOLAM DOXE</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 hover:border-primary-orange transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-orange text-white px-3 py-1 rounded-full text-xs font-bold">
                  🏆 50000
                </div>
                <div className="text-primary-green text-xs">902 : 22 : 9 : 5</div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">TOURNAMENT LUCKY CARD</h3>
              <p className="text-gray-400 text-sm mb-4">10 PRIZE PLACES 🏆</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">BLACK NINJA</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FOXTIE MAX</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HOLAM DOXE</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
              </div>
            </div>

            <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 hover:border-primary-green transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-green text-primary-darker px-3 py-1 rounded-full text-xs font-bold">
                  🏆 75000
                </div>
                <div className="text-primary-green text-xs">694 : 24 : 9 : 5</div>
              </div>
              <h3 className="text-white font-bold text-xl mb-2">TOURNAMENT OF MONTH</h3>
              <p className="text-gray-400 text-sm mb-4">50 PRIZE PLACES 🏆</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">BLACK NINJA</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">FOXTIE MAX</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HOLAM DOXE</span>
                  <span className="text-primary-green">$ 75000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

