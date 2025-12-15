'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { requireAdminAuth } from '@/lib/admin-auth';
import { supabase } from '@/lib/supabase';
import { Upload, X } from 'lucide-react';

interface Chain {
  id: string;
  name: string;
  slug: string;
  chain_id: number;
  native_symbol: string;
}

// Hardcoded chains for admin panel
const AVAILABLE_CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    slug: 'ethereum',
    chain_id: 1,
    native_symbol: 'ETH',
  },
  {
    id: 'solana',
    name: 'Solana',
    slug: 'solana',
    chain_id: 101,
    native_symbol: 'SOL',
  },
];

export default function EditRafflePage() {
  const params = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [chains] = useState<Chain[]>(AVAILABLE_CHAINS); // Use hardcoded chains
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize_pool_amount: '',
    prize_pool_symbol: '',
    ticket_price: '',
    max_tickets: '',
    status: 'draft',
    chain_uuid: '',
    receiving_address: '',
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    checkAuth();
    // Chains are now hardcoded, no need to fetch
    if (params.id) {
      fetchRaffle();
    }
  }, [params.id]);

  const checkAuth = async () => {
    if (!requireAdminAuth(router)) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/verify');
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        router.push('/superman');
      }
    } catch (error) {
      router.push('/superman');
    } finally {
      setLoading(false);
    }
  };


  // Chains are now hardcoded, no need to fetch from database

  const fetchRaffle = async () => {
    try {
      const response = await fetch(`/api/admin/raffles/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch raffle');
      }

      const { raffle: data } = await response.json();

      setFormData({
        title: data.title,
        description: data.description || '',
        prize_pool_amount: data.prize_pool_amount.toString(),
        prize_pool_symbol: data.prize_pool_symbol,
        ticket_price: data.ticket_price.toString(),
        max_tickets: data.max_tickets.toString(),
        status: data.status,
        chain_uuid: data.chain_uuid || '',
        receiving_address: data.receiving_address || '',
        starts_at: data.starts_at ? new Date(data.starts_at).toISOString().slice(0, 16) : '',
        ends_at: new Date(data.ends_at).toISOString().slice(0, 16),
      });

      if (data.image_url) {
        setImagePreview(data.image_url);
      }
    } catch (error) {
      console.error('Error fetching raffle:', error);
      alert('Failed to load raffle');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `raffles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('raffle-images')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('raffle-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = imagePreview && !imageFile ? imagePreview : null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const response = await fetch(`/api/admin/raffles/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image_url: imageUrl,
          prize_pool_amount: parseFloat(formData.prize_pool_amount),
          ticket_price: parseFloat(formData.ticket_price),
          max_tickets: parseInt(formData.max_tickets),
          chain_uuid: formData.chain_uuid || null,
          starts_at: formData.starts_at || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update raffle');
      }

      alert('Raffle updated successfully!');
      router.push('/superman/dashboard');
    } catch (error: any) {
      console.error('Error updating raffle:', error);
      alert(error.message || 'Failed to update raffle');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20 px-4 bg-primary-dark">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
            EDIT RAFFLE
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload - Same as new page */}
            <div>
              <label className="block text-white font-semibold mb-2">Raffle Image</label>
              {imagePreview ? (
                <div className="relative w-full h-64 bg-primary-darker rounded-lg overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-primary-orange text-white p-2 rounded-full hover:bg-primary-orange/90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-primary-lightgray border-dashed rounded-lg cursor-pointer bg-primary-gray hover:bg-primary-darker transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">Click to upload image</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB)</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>

            {/* Rest of form fields - same as new page */}
            <div>
              <label className="block text-white font-semibold mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Prize Pool Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.prize_pool_amount}
                  onChange={(e) => setFormData({ ...formData, prize_pool_amount: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Prize Pool Symbol *</label>
                <input
                  type="text"
                  required
                  value={formData.prize_pool_symbol}
                  onChange={(e) => setFormData({ ...formData, prize_pool_symbol: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Entry Fees *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.ticket_price}
                  onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
                <p className="text-xs text-gray-400 mt-1">Price per ticket/entry</p>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Max Tickets *</label>
                <input
                  type="number"
                  required
                  value={formData.max_tickets}
                  onChange={(e) => setFormData({ ...formData, max_tickets: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Blockchain Network *</label>
                <select
                  value={formData.chain_uuid}
                  onChange={(e) => {
                    setFormData({ ...formData, chain_uuid: e.target.value });
                  }}
                  required
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                >
                  <option value="">Select Chain</option>
                  {chains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name} ({chain.native_symbol})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Select Ethereum or Solana</p>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                >
                  <option value="draft">Draft</option>
                  <option value="live">Live</option>
                  <option value="closed">Closed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Receive Funds Wallet Address *</label>
              <input
                type="text"
                required
                value={formData.receiving_address}
                onChange={(e) => setFormData({ ...formData, receiving_address: e.target.value })}
                placeholder="0x... or Solana address"
                className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                ⚠️ This wallet address will receive all raffle entry payments. Keep it secure and never share publicly.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Starts At</label>
                <input
                  type="datetime-local"
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Ends At *</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  className="w-full bg-primary-gray border border-primary-lightgray rounded px-4 py-3 text-white focus:outline-none focus:border-primary-green"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-primary-green text-primary-darker px-6 py-4 rounded font-semibold hover:bg-primary-green/90 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'UPDATE RAFFLE'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 bg-primary-gray border border-primary-lightgray text-white rounded font-semibold hover:bg-primary-darker transition-colors"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

