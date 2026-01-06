'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0f0f0f] border-t border-[#2a2a2a] mt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Footer CTA */}
        <div className="text-center mb-12 pb-12 border-b border-[#2a2a2a]">
          <p className="text-lg text-gray-400 mb-6">
            Explore active raffles or review how PrimePick works.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/raffles"
              className="inline-flex items-center gap-2 bg-[#00d97e] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-[#00c46a] transition-colors"
            >
              View Active Raffles
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] px-6 py-3 rounded-lg font-semibold hover:border-[#00d97e]/30 transition-colors"
            >
              How It Works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: Logo and Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <Image
                  src="/ticket-icon.svg"
                  alt="PrimePick Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                  priority
                />
              </div>
              <span className="text-[#f5f5f5] font-bold text-xl">PRIMEPICK</span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              A fixed-rule ETH draw system with transparent on-chain execution and instant payouts.
            </p>
            <Link href="/dashboard" className="text-[#00d97e] text-sm font-semibold hover:text-[#00c46a] hover:underline inline-flex items-center gap-1 transition-colors">
              ACTIVE WITH US <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex gap-4 mt-4">
              {['Discord', 'Twitter', 'Instagram', 'Telegram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full flex items-center justify-center text-gray-500 hover:text-[#00d97e] hover:border-[#00d97e]/30 transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Essential Links */}
          <div>
            <h3 className="text-[#f5f5f5] font-semibold mb-4">LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Access */}
          <div>
            <h3 className="text-[#f5f5f5] font-semibold mb-4">QUICK ACCESS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/raffles" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Active Raffles
                </Link>
              </li>
              <li>
                <Link href="/winners" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Winners
                </Link>
              </li>
              <li>
                <Link href="/ended" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  Ended Raffles
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-500 text-sm hover:text-[#00d97e] transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#2a2a2a] mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>COPYRIGHT © 2024 - ALL RIGHTS RESERVED BY PRIMEPICK</p>
          <p>www.PrimePickTournament.com</p>
        </div>
      </div>
    </footer>
  );
}
