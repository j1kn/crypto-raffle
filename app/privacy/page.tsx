'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-primary-green" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                PRIVACY POLICY
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Last updated: December 2024
            </p>
          </div>

          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="text-gray-400 text-sm mb-3">
                PrimePick Tournament collects minimal information necessary to provide our services:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Wallet addresses (public blockchain addresses)</li>
                <li>Raffle entry transactions (stored on blockchain)</li>
                <li>Basic usage analytics (non-personal)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-400 text-sm mb-3">
                We use collected information to:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Process raffle entries and manage tournaments</li>
                <li>Identify winners and distribute prizes</li>
                <li>Improve our platform and user experience</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Blockchain Transparency</h2>
              <p className="text-gray-400 text-sm">
                All raffle entries and transactions are recorded on the blockchain, making them publicly verifiable. This ensures transparency and fairness in our raffle system.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p className="text-gray-400 text-sm">
                We implement industry-standard security measures to protect your information. However, as blockchain transactions are public, wallet addresses and transaction data are inherently transparent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
              <p className="text-gray-400 text-sm mb-3">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Supabase (database and storage)</li>
                <li>WalletConnect (wallet connections)</li>
                <li>Vercel (hosting and deployment)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
              <p className="text-gray-400 text-sm">
                You have the right to access, update, or delete your account information. Since we use blockchain technology, some data may be permanently recorded and cannot be deleted.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Contact Us</h2>
              <p className="text-gray-400 text-sm">
                If you have questions about this Privacy Policy, please contact us through our Help & Support page.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

