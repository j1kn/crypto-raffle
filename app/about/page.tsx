'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Trophy, Shield, Zap, Users, Award, Lock } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-primary-dark">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary-darker to-primary-dark py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              ABOUT PRIMEPICK
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              The most transparent and fair crypto raffle platform built on blockchain technology
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Mission */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 text-lg leading-relaxed mb-4">
                PrimePick Tournament is revolutionizing the way people participate in crypto raffles. 
                We believe in transparency, fairness, and the power of blockchain technology to create 
                trustless, verifiable raffle systems.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Our platform ensures that every raffle is conducted fairly, winners are selected randomly, 
                and all transactions are recorded on the blockchain for complete transparency.
              </p>
            </div>

            {/* Features */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">Why Choose PrimePick?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-8 h-8 text-primary-green" />
                    <h3 className="text-xl font-bold text-white">Secure & Transparent</h3>
                  </div>
                  <p className="text-gray-300">
                    All transactions are recorded on the blockchain. Every raffle entry and winner selection 
                    is verifiable and cannot be tampered with.
                  </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-primary-orange" />
                    <h3 className="text-xl font-bold text-white">Instant Results</h3>
                  </div>
                  <p className="text-gray-300">
                    Winners are automatically drawn when raffles end. No waiting, no manual processes. 
                    Results are immediate and fair.
                  </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-8 h-8 text-primary-green" />
                    <h3 className="text-xl font-bold text-white">Community Driven</h3>
                  </div>
                  <p className="text-gray-300">
                    Built for the crypto community, by the crypto community. Join thousands of participants 
                    in exciting raffles with amazing prizes.
                  </p>
                </div>

                <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-primary-orange" />
                    <h3 className="text-xl font-bold text-white">Fair Selection</h3>
                  </div>
                  <p className="text-gray-300">
                    Every participant has an equal chance. Our random selection algorithm ensures 
                    complete fairness in winner selection.
                  </p>
                </div>
              </div>
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
                    <h3 className="text-xl font-bold text-white mb-2">Connect Your Wallet</h3>
                    <p className="text-gray-300">
                      Connect your Web3 wallet (MetaMask, Coinbase Wallet, Trust Wallet, etc.) to get started.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Browse Active Raffles</h3>
                    <p className="text-gray-300">
                      Explore our live raffles, check prize pools, ticket prices, and countdown timers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Enter & Pay</h3>
                    <p className="text-gray-300">
                      Select a raffle, pay the entry fee directly from your wallet, and secure your entry.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary-green rounded-full flex items-center justify-center text-primary-darker font-bold text-xl">
                    4
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Wait for Results</h3>
                    <p className="text-gray-300">
                      When the raffle ends, a winner is automatically selected. Check the winners page 
                      to see if you won!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Security & Fairness</h2>
              <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Lock className="w-8 h-8 text-primary-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-3">Blockchain Verified</h3>
                    <p className="text-gray-300 mb-4">
                      All raffle entries and payments are recorded on-chain. This means:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-300">
                      <li>Every transaction is publicly verifiable</li>
                      <li>No central authority can manipulate results</li>
                      <li>Winner selection is cryptographically random</li>
                      <li>All funds are handled transparently</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center bg-gradient-to-r from-primary-green/20 to-primary-orange/20 border-2 border-primary-green rounded-lg p-8">
              <Trophy className="w-16 h-16 text-primary-orange mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-4">Ready to Win?</h2>
              <p className="text-gray-300 mb-6">
                Join thousands of participants in our exciting crypto raffles
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/raffles"
                  className="bg-primary-green text-primary-darker px-8 py-4 rounded font-bold text-lg hover:bg-primary-green/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  View Live Raffles
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

