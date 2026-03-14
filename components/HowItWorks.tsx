'use client';

import { Wallet, List, Calendar, Coins } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Wallet,
      title: 'Connect Wallet',
      description: 'Link your Web3 wallet to access the platform',
    },
    {
      icon: List,
      title: 'Choose Raffle',
      description: 'Select a raffle and review entry requirements',
    },
    {
      icon: Calendar,
      title: 'Draw Executes on Schedule',
      description: 'The draw runs automatically at the scheduled time',
    },
    {
      icon: Coins,
      title: 'Winner Paid On-Chain',
      description: 'Payout is executed immediately via smart contract',
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#f5f5f5] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A straightforward process for entering and executing draws
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 hover:border-[#00d97e]/30 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-[#00d97e]/10 flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-[#00d97e]" />
                </div>
                <div className="mb-2">
                  <span className="text-gray-500 text-sm font-mono">Step {index + 1}</span>
                </div>
                <h3 className="text-[#f5f5f5] font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

