'use client';

import { Wallet, Trophy, Coins, Clock } from 'lucide-react';

interface ActivityItem {
  type: 'entry' | 'draw' | 'payout';
  message: string;
  timestamp: string;
  raffleTitle?: string;
  walletAddress?: string;
  amount?: string;
}

export default function RecentActivity() {
  // Placeholder activity data - UI only
  const activities: ActivityItem[] = [
    {
      type: 'entry',
      message: 'Wallet entered raffle',
      timestamp: '2 hours ago',
      raffleTitle: 'ETH Prize Pool #42',
      walletAddress: '0x1234...5678',
    },
    {
      type: 'draw',
      message: 'Draw completed',
      timestamp: '5 hours ago',
      raffleTitle: 'ETH Prize Pool #41',
    },
    {
      type: 'payout',
      message: 'Prize paid',
      timestamp: '5 hours ago',
      raffleTitle: 'ETH Prize Pool #41',
      walletAddress: '0xabcd...efgh',
      amount: '1.5 ETH',
    },
    {
      type: 'entry',
      message: 'Wallet entered raffle',
      timestamp: '8 hours ago',
      raffleTitle: 'ETH Prize Pool #42',
      walletAddress: '0x9876...5432',
    },
    {
      type: 'draw',
      message: 'Draw completed',
      timestamp: '1 day ago',
      raffleTitle: 'ETH Prize Pool #40',
    },
    {
      type: 'payout',
      message: 'Prize paid',
      timestamp: '1 day ago',
      raffleTitle: 'ETH Prize Pool #40',
      walletAddress: '0x5678...9012',
      amount: '2.0 ETH',
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return Wallet;
      case 'draw':
        return Trophy;
      case 'payout':
        return Coins;
      default:
        return Clock;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'text-[#00d97e]';
      case 'draw':
        return 'text-primary-orange';
      case 'payout':
        return 'text-[#00d97e]';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <section className="py-20 px-4 bg-[#0f0f0f] border-t border-[#2a2a2a]">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-[#f5f5f5] mb-2">
            Recent Activity
          </h2>
          <p className="text-gray-400">
            System events and transaction history
          </p>
        </div>

        <div className="space-y-3">
          {activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            const iconColor = getIconColor(activity.type);

            return (
              <div
                key={index}
                className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#2a2a2a] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className="text-[#f5f5f5] font-medium">
                        {activity.message}
                      </p>
                      <span className="text-gray-500 text-xs whitespace-nowrap">
                        {activity.timestamp}
                      </span>
                    </div>
                    {activity.raffleTitle && (
                      <p className="text-gray-400 text-sm mb-1">
                        {activity.raffleTitle}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {activity.walletAddress && (
                        <span className="font-mono">
                          {activity.walletAddress}
                        </span>
                      )}
                      {activity.amount && (
                        <span className="text-[#00d97e] font-semibold">
                          {activity.amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

