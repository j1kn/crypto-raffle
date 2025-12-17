'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, Mail, MessageCircle, Book } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              HELP & SUPPORT
            </h1>
            <p className="text-gray-400 text-lg">
              Get help with your raffle entries, wallet connections, and more
            </p>
          </div>

          <div className="space-y-8">
            {/* FAQ Section */}
            <section className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <HelpCircle className="w-6 h-6 text-primary-green" />
                <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-white font-semibold mb-2">How do I enter a raffle?</h3>
                  <p className="text-gray-400 text-sm">
                    Connect your wallet, browse active raffles, and click "Enter Raffle". Confirm the transaction in your wallet to complete your entry.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">How are winners selected?</h3>
                  <p className="text-gray-400 text-sm">
                    Winners are automatically drawn when a raffle ends. The selection is random and fair, using blockchain technology to ensure transparency.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">What wallets are supported?</h3>
                  <p className="text-gray-400 text-sm">
                    We support all major wallets including MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, and 100+ more. Click "Connect Wallet" to see the full list.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">How do I view my raffle entries?</h3>
                  <p className="text-gray-400 text-sm">
                    Connect your wallet and visit the Dashboard to see all your active raffle entries and their status.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2">What happens if I win?</h3>
                  <p className="text-gray-400 text-sm">
                    Winners are announced on the Winners page. Prizes are automatically transferred to your connected wallet address.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-primary-green" />
                <h2 className="text-2xl font-bold text-white">Contact Us</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <MessageCircle className="w-5 h-5 text-primary-green mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">General Support</h3>
                    <p className="text-gray-400 text-sm">
                      For general inquiries and support, please reach out through our social media channels or email.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Book className="w-5 h-5 text-primary-green mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Documentation</h3>
                    <p className="text-gray-400 text-sm">
                      Check our About page for more information about how PrimePick Tournament works.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Links */}
            <section className="bg-primary-gray border border-primary-lightgray rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/about" className="text-primary-green hover:underline text-sm">
                  About PrimePick
                </a>
                <a href="/privacy" className="text-primary-green hover:underline text-sm">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-primary-green hover:underline text-sm">
                  Terms of Service
                </a>
                <a href="/dashboard" className="text-primary-green hover:underline text-sm">
                  My Dashboard
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

