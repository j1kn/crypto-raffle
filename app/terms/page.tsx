'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary-green" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                TERMS OF SERVICE
              </h1>
            </div>
            <p className="text-gray-400 text-sm">
              Last updated: December 2024
            </p>
          </div>

          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-400 text-sm">
                By accessing and using PrimePick Tournament, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <p className="text-gray-400 text-sm mb-3">
                To use PrimePick Tournament, you must:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Be at least 18 years old</li>
                <li>Have a compatible cryptocurrency wallet</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not be located in a jurisdiction where crypto raffles are prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Raffle Participation</h2>
              <p className="text-gray-400 text-sm mb-3">
                When entering a raffle:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Entry fees are non-refundable once the transaction is confirmed</li>
                <li>Winners are selected randomly and automatically when raffles end</li>
                <li>All entries are recorded on the blockchain for transparency</li>
                <li>Prizes are distributed automatically to the winner's wallet</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Wallet Responsibility</h2>
              <p className="text-gray-400 text-sm">
                You are solely responsible for the security of your wallet and private keys. PrimePick Tournament is not responsible for any loss of funds due to compromised wallets or lost private keys.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Activities</h2>
              <p className="text-gray-400 text-sm mb-3">
                You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-400 text-sm space-y-2 ml-4">
                <li>Use the platform for any illegal activities</li>
                <li>Attempt to manipulate or interfere with raffle outcomes</li>
                <li>Use multiple wallets to gain unfair advantage</li>
                <li>Engage in any fraudulent or deceptive practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-400 text-sm">
                PrimePick Tournament is provided "as is" without warranties. We are not liable for any losses, damages, or issues arising from the use of our platform, including but not limited to blockchain network issues, wallet failures, or smart contract vulnerabilities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
              <p className="text-gray-400 text-sm">
                We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Contact</h2>
              <p className="text-gray-400 text-sm">
                For questions about these Terms of Service, please visit our Help & Support page.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

