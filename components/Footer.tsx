'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-darker border-t border-primary-gray mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <span className="text-white font-bold text-xl">PRIMEPICK</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Join the ultimate crypto raffle platform. Play to earn and compete in exciting tournaments with real prizes.
            </p>
            <Link href="/dashboard" className="text-primary-green text-sm font-semibold hover:underline inline-flex items-center gap-1">
              ACTIVE WITH US <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex gap-4 mt-4">
              {['Discord', 'Twitter', 'Instagram', 'Telegram'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 bg-primary-gray rounded-full flex items-center justify-center text-gray-400 hover:text-primary-green hover:bg-primary-lightgray transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Essential Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">LINKS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Access */}
          <div>
            <h3 className="text-white font-semibold mb-4">QUICK ACCESS</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/raffles" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Active Raffles
                </Link>
              </li>
              <li>
                <Link href="/winners" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Winners
                </Link>
              </li>
              <li>
                <Link href="/ended" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  Ended Raffles
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 text-sm hover:text-primary-green transition-colors">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">NEWSLETTER</h3>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe our newsletter to get our latest update & news.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 bg-primary-gray border border-primary-lightgray rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-green"
              />
              <button
                type="submit"
                className="bg-primary-green text-primary-darker p-2 rounded hover:bg-primary-green/90 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-gray mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>COPYRIGHT © 2024 - ALL RIGHTS RESERVED BY PRIMEPICK</p>
          <p>www.PrimePickTournament.com</p>
          <div className="flex gap-2">
            {['PayPal', 'Visa', 'Mastercard'].map((method) => (
              <span key={method} className="text-xs">{method}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

