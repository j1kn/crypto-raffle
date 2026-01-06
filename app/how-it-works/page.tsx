'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Wallet, List, Activity, Coins, Shield, CheckCircle2, XCircle } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main className="flex-1 py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Title */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#f5f5f5] mb-4">
              How PrimePick Works
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A simple overview of how entries, draws, and payouts work.
            </p>
          </div>

          {/* Section 1: Connect Wallet */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
                <Wallet className="w-6 h-6 text-[#00d97e]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">
                Connect Wallet
              </h2>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8">
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  PrimePick requires a Web3 wallet to participate. Your wallet address serves as your account identifier and is used to record entries and execute payouts.
                </p>
                <p>
                  PrimePick uses your wallet address to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Record your raffle entries</li>
                  <li>Track your activity in the dashboard</li>
                  <li>Send payouts directly to your wallet</li>
                </ul>
                <p className="pt-2">
                  <strong className="text-[#f5f5f5]">PrimePick cannot access:</strong> your private keys, wallet balance, transaction history, or any other wallet data. Only your public address is used.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Enter a Raffle */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
                <List className="w-6 h-6 text-[#00d97e]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">
                Enter a Raffle
              </h2>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8">
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Each raffle has fixed parameters that cannot be changed:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Fixed entry price:</strong> The cost per entry is set when the raffle is created and remains constant.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Fixed deadline:</strong> The draw executes at the scheduled end time, regardless of entry count.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Fixed entry count:</strong> Maximum entries are capped. Once reached, no additional entries are accepted.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">No extensions:</strong> Deadlines are immutable. The draw runs on schedule even if the raffle is not sold out.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Track Everything in Your Dashboard */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-[#00d97e]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">
                Track Everything in Your Dashboard
              </h2>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8">
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Your dashboard serves as a complete activity ledger for all your raffle participation:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Entries appear immediately:</strong> Once you enter a raffle, it appears in your dashboard with full details.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Status updates automatically:</strong> Raffle status (Active, Executed, Paid) updates in real-time as draws complete.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Transaction hashes are visible:</strong> Every entry includes a clickable transaction hash linking to on-chain verification.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Complete activity ledger:</strong> Your dashboard maintains a permanent record of all entries, draws, and payouts.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Draw Execution & Payout */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
                <Coins className="w-6 h-6 text-[#00d97e]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">
                Draw Execution & Payout
              </h2>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8">
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Draws execute automatically and transparently:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Draw executes at scheduled time:</strong> The draw runs automatically when the deadline is reached, regardless of entry count.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Winner selected:</strong> A winner is selected from all entries using a verifiable on-chain method.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">ETH sent on-chain:</strong> The prize pool is transferred directly to the winner's wallet via smart contract.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#00d97e] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">TX hash provided:</strong> The payout transaction hash is recorded and visible in your dashboard for verification.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: What PrimePick Cannot Do */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-[#00d97e]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">
                What PrimePick Cannot Do
              </h2>
            </div>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 md:p-8">
              <div className="space-y-3 text-gray-400 leading-relaxed">
                <p>
                  PrimePick operates with fixed rules that cannot be modified:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Cannot change rules:</strong> Entry price, deadline, and entry count are immutable once a raffle is created.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Cannot redraw:</strong> Draws execute once at the scheduled time. There are no redraws or extensions.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Cannot modify entries:</strong> Once recorded on-chain, entries cannot be altered or removed.
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-[#f5f5f5]">Cannot withhold payouts:</strong> Payouts are executed automatically via smart contract and cannot be blocked or delayed.
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

