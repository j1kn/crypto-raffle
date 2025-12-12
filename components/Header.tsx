'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, Menu, Shield } from 'lucide-react';
import { getWalletAddress, isWalletConnected, connectWallet, disconnectWallet } from '@/lib/wallet';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check initial wallet state
    const checkWallet = () => {
      if (isWalletConnected()) {
        const address = getWalletAddress();
        setWalletAddress(address);
        checkAdminStatus(address);
      }
    };
    
    checkWallet();
    
    // Listen for wallet state changes
    const handleWalletChange = () => {
      checkWallet();
    };
    
    window.addEventListener('walletStateChanged', handleWalletChange);
    
    return () => {
      window.removeEventListener('walletStateChanged', handleWalletChange);
    };
  }, []);

  const checkAdminStatus = async (address: string | null) => {
    if (!address) {
      setIsAdmin(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await response.json();
      setIsAdmin(data.isAdmin || false);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleWalletClick = async () => {
    if (isWalletConnected()) {
      await disconnectWallet();
      setWalletAddress(null);
      setIsAdmin(false);
    } else {
      setIsConnecting(true);
      try {
        const address = await connectWallet();
        if (address) {
          setWalletAddress(address);
          checkAdminStatus(address);
        }
      } catch (error: any) {
        alert(error.message || 'Failed to connect wallet. Please try again.');
      } finally {
        setIsConnecting(false);
      }
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
            {isAdmin && (
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  pathname === '/admin'
                    ? 'text-primary-orange'
                    : 'text-gray-300 hover:text-primary-orange'
                }`}
              >
                <Shield className="w-4 h-4" />
                ADMIN
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block p-2 text-gray-300 hover:text-primary-green transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={handleWalletClick}
              disabled={isConnecting}
              className="flex items-center gap-2 bg-primary-green text-primary-darker px-4 py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <User className="w-4 h-4" />
              {isConnecting
                ? 'CONNECTING...'
                : walletAddress
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'CONNECT WALLET'}
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
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                    pathname === '/admin'
                      ? 'text-primary-orange'
                      : 'text-gray-300 hover:text-primary-orange'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  ADMIN
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

