'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAccount } from 'wagmi';
import { useWeb3Modal } from '@web3Modal/wagmi/react';
import { User, Mail, Camera, Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Profile {
  wallet_address: string;
  display_name: string;
  email?: string | null;
  profile_picture_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!address && !isConnected) {
      router.push('/');
      return;
    }
  }, [address, isConnected, router]);

  useEffect(() => {
    if (address) {
      fetchProfile();
    }
  }, [address]);

  const fetchProfile = async () => {
    if (!address) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/profile?walletAddress=${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
      }

      if (data.profile) {
        setProfile(data.profile);
        setDisplayName(data.profile.display_name || '');
        setEmail(data.profile.email || '');
        setProfilePictureUrl(data.profile.profile_picture_url || null);
        setImagePreview(data.profile.profile_picture_url || null);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (): Promise<string | null> => {
    if (!imageFile || !address) return null;

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('walletAddress', address);

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image');
      }

      return data.url;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Upload image first if a new one was selected
      let finalImageUrl = profilePictureUrl;
      if (imageFile) {
        finalImageUrl = await uploadProfilePicture();
      }

      // Save profile
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          displayName: displayName.trim(),
          email: email.trim() || null,
          profilePictureUrl: finalImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile');
      }

      setProfile(data.profile);
      setProfilePictureUrl(finalImageUrl);
      setImageFile(null);
      setSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!address && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="mb-4">Please connect your wallet to access settings.</p>
            <button
              onClick={() => open()}
              className="bg-primary-green text-primary-darker px-6 py-3 rounded font-semibold hover:bg-primary-green/90 transition-colors"
            >
              CONNECT WALLET
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Loading...
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-primary-green transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              PROFILE SETTINGS
            </h1>
            <p className="text-gray-400">Manage your profile information</p>
          </div>

          {/* Wallet Address Display */}
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Wallet Address</p>
            <p className="text-primary-green font-mono break-all">
              {address}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-primary-gray border border-primary-lightgray rounded-lg p-6 md:p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-primary-green/20 border border-primary-green rounded-lg">
                <p className="text-primary-green font-semibold">Profile saved successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                <p className="text-red-400 font-semibold">{error}</p>
              </div>
            )}

            {/* Profile Picture */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-primary-darker border-2 border-primary-lightgray overflow-hidden flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    id="profile-picture"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="profile-picture"
                    className="inline-block bg-primary-darker text-white px-4 py-2 rounded font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                  >
                    Choose Image
                  </label>
                  <p className="text-gray-400 text-sm mt-2">
                    JPG, PNG, or GIF. Max size 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div className="mb-6">
              <label htmlFor="display-name" className="block text-white font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Display Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="Enter your display name"
              />
            </div>

            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-white font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address (Optional)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-primary-darker border border-primary-lightgray rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                placeholder="your.email@example.com"
              />
              <p className="text-gray-400 text-sm mt-2">
                Used for notifications (optional)
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-green text-primary-darker px-6 py-3 rounded-lg font-semibold hover:bg-primary-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <Link
                href="/dashboard"
                className="flex items-center justify-center bg-primary-darker text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-gray transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

