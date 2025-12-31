'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { User, Settings, LogOut } from 'lucide-react';
import { useDisconnect, useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3modal/wagmi/react';

interface Profile {
  wallet_address: string;
  display_name?: string | null;
  profile_picture_url?: string | null;
}

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  isAdmin: boolean;
}

export default function ProfileDropdown({
  isOpen,
  onClose,
  profile,
  isAdmin,
}: ProfileDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { close: closeModal } = useWeb3Modal();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  const handleDisconnect = async () => {
    try {
      onClose();
      // Close any open Web3Modal
      closeModal();
      // Disconnect from wagmi
      disconnect();
      // Force clear localStorage to ensure complete disconnect
      if (typeof window !== 'undefined') {
        // Clear Web3Modal cache
        localStorage.removeItem('wagmi.wallet');
        localStorage.removeItem('wagmi.connected');
        // Clear any other wagmi-related storage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('wagmi.') || key.startsWith('wc@')) {
            localStorage.removeItem(key);
          }
        });
      }
      // Small delay to ensure disconnect completes, then force page refresh
      setTimeout(() => {
        // Force full page refresh to show disconnected state immediately
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 200);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      // Force redirect even if disconnect fails
      onClose();
      router.push('/');
    }
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-64 bg-primary-gray border border-primary-lightgray rounded-lg shadow-2xl z-50 overflow-hidden"
    >
      {/* Profile Header */}
      <div className="p-4 border-b border-primary-lightgray">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary-green/20 border-2 border-primary-green/30 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profile?.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.display_name || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-primary-green" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-gray-400 text-xs font-mono truncate">
              {formatWalletAddress(profile?.wallet_address || '')}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Links */}
      <div className="py-2">
        <Link
          href="/dashboard"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
            pathname === '/dashboard'
              ? 'bg-primary-green/20 text-primary-green'
              : 'text-gray-300 hover:bg-primary-dark hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          Dashboard
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
              pathname === '/admin'
                ? 'bg-primary-orange/20 text-primary-orange'
                : 'text-gray-300 hover:bg-primary-dark hover:text-primary-orange'
            }`}
          >
            <Settings className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        <Link
          href="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
            pathname === '/settings'
              ? 'bg-primary-green/20 text-primary-green'
              : 'text-gray-300 hover:bg-primary-dark hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* Divider */}
      <div className="border-t border-primary-lightgray"></div>

      {/* Disconnect */}
      <div className="py-2">
        <button
          onClick={handleDisconnect}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </button>
      </div>
    </div>
  );
}

