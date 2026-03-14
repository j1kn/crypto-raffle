'use client';

import Link from 'next/link';
import { ArrowRight, TrendingUp, Calendar, Clock, Award } from 'lucide-react';

interface TrustStatsBarProps {
  totalPaidOut?: string;
  completedDraws?: number;
  lastDrawTime?: string;
}

export default function TrustStatsBar({
  totalPaidOut = '0 ETH',
  completedDraws = 0,
  lastDrawTime = 'N/A',
}: TrustStatsBarProps) {
  return (
    <section className="py-12 px-4 border-y border-[#2a2a2a] bg-[#0f0f0f]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total ETH Paid Out */}
          <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-[#00d97e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs mb-1">Total ETH Paid Out</p>
              <p className="text-[#f5f5f5] font-semibold text-lg">{totalPaidOut}</p>
            </div>
          </div>

          {/* Completed Draws */}
          <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6 text-[#00d97e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs mb-1">Completed Draws</p>
              <p className="text-[#f5f5f5] font-semibold text-lg">{completedDraws}</p>
            </div>
          </div>

          {/* Last Draw Execution */}
          <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-[#00d97e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs mb-1">Last Draw Execution</p>
              <p className="text-[#f5f5f5] font-semibold text-sm">{lastDrawTime}</p>
            </div>
          </div>

          {/* View Winners/Transactions */}
          <div className="flex items-center gap-4 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
            <div className="w-12 h-12 rounded-lg bg-[#00d97e]/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-[#00d97e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs mb-1">View History</p>
              <Link
                href="/winners"
                className="text-[#00d97e] hover:text-[#00c46a] font-semibold text-sm inline-flex items-center gap-1 transition-colors"
              >
                Winners
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

