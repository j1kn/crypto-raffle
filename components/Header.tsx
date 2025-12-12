'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu } from 'lucide-react';
import { getWalletAddress, isWalletConnected, connectWallet, disconnectWallet } from '@/lib/wallet';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkWallet = () => {
      if (isWalletConnected()) {
        setWalletAddress(getWalletAddress());
      }
    };
    checkWallet();
    const interval = setInterval(checkWallet, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletClick = async () => {
    if (isWalletConnected()) {
      await disconnectWallet();
      setWalletAddress(null);
    } else {
      const address = await connectWallet();
      setWalletAddress(address);
    }
  };

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/about', label: 'ABOUT US' },
    { href: '/raffles', label: 'TOURNAMENT' },
    { href: '/pages', label: 'PAGES' },
    { href: '/news', label: 'NEWS' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <header className="bg-primary-darker border-b border-primary-gray">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-green flex items-center justify-center rounded">
              <span className="text-primary-darker font-bold text-xl">P</span>
            </div>
            <span className="text-white font-bold text-xl">PRIMEPICK</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'text-primary-green'
                    : 'text-gray-300 hover:text-primary-green'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block p-2 text-gray-300 hover:text-primary-green transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={handleWalletClick}
              className="flex items-center gap-2 bg-primary-green text-primary-darker px-4 py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors"
            >
              <User className="w-4 h-4" />
              {walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'SIGN IN'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-primary-green transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary-gray pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'text-primary-green'
                      : 'text-gray-300 hover:text-primary-green'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

