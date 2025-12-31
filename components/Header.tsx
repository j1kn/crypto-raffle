'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Search, User, Shield, Menu, LogOut } from 'lucide-react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useDisconnect } from 'wagmi';
import { useState, useEffect, useCallback, startTransition } from 'react';
import ProfileSetupModal from './ProfileSetupModal';
import ProfileDropdown from './ProfileDropdown';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { open } = useWeb3Modal();
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<{
    wallet_address: string;
    display_name?: string | null;
    profile_picture_url?: string | null;
  } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Debug wallet connection
  useEffect(() => {
    console.log('Header Wallet Debug:', {
      address,
      isConnected,
      connector: connector?.name,
    });
  }, [address, isConnected, connector]);

  // Memoize checkAdminStatus to prevent React errors
  const checkAdminStatus = useCallback(async (walletAddress: string | null) => {
    if (!walletAddress) {
      queueMicrotask(() => {
        startTransition(() => {
          setIsAdmin(false);
        });
      });
      return;
    }
    
    try {
      const response = await fetch('/api/admin/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
      });
      const data = await response.json();
      queueMicrotask(() => {
        startTransition(() => {
          setIsAdmin(data.isAdmin || false);
        });
      });
    } catch (error) {
      console.error('Error checking admin status:', error);
      queueMicrotask(() => {
        startTransition(() => {
          setIsAdmin(false);
        });
      });
    }
  }, []);

  // Fetch profile when address changes
  const fetchProfile = useCallback(async (walletAddress: string) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`/api/profile?walletAddress=${walletAddress}`);
      const data = await response.json();

      if (response.ok) {
        if (data.profile) {
          setProfile(data.profile);
          // Check if profile needs setup (no display_name)
          if (!data.profile.display_name) {
            setShowProfileSetup(true);
          }
        } else {
          // No profile exists - show setup modal
          setProfile(null);
          setShowProfileSetup(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (address) {
      checkAdminStatus(address);
      fetchProfile(address);
    } else {
      queueMicrotask(() => {
        startTransition(() => {
          setIsAdmin(false);
          setProfile(null);
          setShowProfileSetup(false);
        });
      });
    }
  }, [address, checkAdminStatus, fetchProfile]);

  const handleConnect = () => {
    // Always open the modal - Web3Modal will show wallet selection
    open();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIsAdmin(false);
      setProfile(null);
      setShowProfileDropdown(false);
      setShowProfileSetup(false);
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

  const handleProfileSave = async () => {
    // Refresh profile after saving
    if (address) {
      await fetchProfile(address);
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
            <span className="text-white font-bold text-xl">PPT</span>
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
              <div className="flex items-center gap-2 relative">
                {/* Profile Picture Button */}
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="relative w-12 h-12 rounded-full bg-primary-green/20 border-2 border-primary-green/30 overflow-hidden flex items-center justify-center hover:border-primary-green transition-colors"
                  title={profile?.display_name || 'Profile'}
                >
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.display_name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-primary-green" />
                  )}
                </button>
                {/* Profile Dropdown */}
                <ProfileDropdown
                  isOpen={showProfileDropdown}
                  onClose={() => setShowProfileDropdown(false)}
                  profile={profile}
                  isAdmin={isAdmin}
                />
              </div>
            ) : (
              <button
                onClick={handleConnect}
                className="flex items-center gap-2 bg-primary-green text-primary-darker px-4 py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors h-12"
              >
                <User className="w-4 h-4" />
                CONNECT WALLET
              </button>
            )}
            {/* Hamburger Menu - Always visible */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-300 hover:text-primary-green transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="mt-4 pb-4 border-t border-primary-gray pt-4">
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
              {address && (
                <button
                  onClick={() => {
                    handleDisconnect();
                    setIsMenuOpen(false);
                  }}
                  className="text-sm font-medium transition-colors flex items-center gap-1 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  DISCONNECT WALLET
                </button>
              )}
            </div>
          </nav>
        )}
      </div>

      {/* Profile Setup Modal */}
      {address && (
        <ProfileSetupModal
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          walletAddress={address}
          onSave={handleProfileSave}
        />
      )}
    </header>
  );
}
