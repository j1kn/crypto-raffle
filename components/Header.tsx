'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Menu, Shield, LogOut } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useWeb3Modal();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Debug wallet connection
  useEffect(() => {
    console.log('Header Wallet Debug:', {
      address,
      isConnected,
      connector: connector?.name,
    });
  }, [address, isConnected, connector]);

  useEffect(() => {
    if (address) {
      checkAdminStatus(address);
    } else {
      setIsAdmin(false);
    }
  }, [address]);

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
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const handleConnect = () => {
    // Always open the modal - Web3Modal will show wallet selection
    open();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsAdmin(false);
      // Use Next.js router for smooth navigation
      if (pathname !== '/') {
        router.push('/');
      } else {
        // If already on home, just refresh the page state
        router.refresh();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Force redirect if disconnect fails
      router.push('/');
    }
  };

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/about', label: 'ABOUT US' },
    { href: '/raffles', label: 'TOURNAMENT' },
    { href: '/ended', label: 'ENDED' },
    { href: '/winners', label: 'WINNERS' },
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
            {address ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-primary-green text-primary-darker px-4 py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors"
                >
                  <User className="w-4 h-4" />
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Link>
                <button
                  onClick={handleDisconnect}
                  className="bg-primary-orange text-white px-4 py-2 rounded font-semibold hover:bg-primary-orange/90 transition-colors text-sm"
                  title="Disconnect Wallet"
                >
                  DISCONNECT
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-primary-green text-primary-darker px-4 py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors"
              >
                <User className="w-4 h-4" />
                CONNECT WALLET
              </button>
            )}
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
