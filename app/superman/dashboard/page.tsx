'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, LogOut } from 'lucide-react';

interface Raffle {
  id: string;
  title: string;
  image_url: string | null;
  prize_pool_amount: number;
  prize_pool_symbol: string;
  status: string;
  ends_at: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRaffles();
    }
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const authenticated = localStorage.getItem('admin_authenticated') === 'true';
    
    if (!authenticated) {
      router.push('/superman');
      return;
    }

    // Verify with server
    try {
      const response = await fetch('/api/admin/verify');
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_session');
        router.push('/superman');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      router.push('/superman');
    } finally {
      setLoading(false);
    }
  };

  const fetchRaffles = async () => {
    try {
      // Fetch all raffles using admin API
      const response = await fetch('/api/admin/raffles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch raffles');
      }

      const { raffles: rafflesData } = await response.json();
      setRaffles(rafflesData || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this raffle?')) return;

    try {
      const response = await fetch(`/api/admin/raffles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete raffle');
      }

      fetchRaffles();
    } catch (error) {
      console.error('Error deleting raffle:', error);
      alert('Failed to delete raffle');
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_session');
    }
    router.push('/superman');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-gray-400">
          Verifying access...
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
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                ADMIN PANEL
              </h1>
              <p className="text-gray-400 mt-2">Manage raffles and entries</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/superman/raffles/new"
                className="bg-primary-green text-primary-darker px-6 py-3 rounded font-semibold hover:bg-primary-green/90 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                CREATE RAFFLE
              </Link>
              <button
                onClick={handleLogout}
                className="bg-primary-orange text-white px-4 py-2 rounded font-semibold hover:bg-primary-orange/90 transition-colors inline-flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                LOGOUT
              </button>
            </div>
          </div>

          <div className="bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-darker">
                  <tr>
                    <th className="px-6 py-4 text-left text-white font-semibold">Title</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Prize Pool</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Ends At</th>
                    <th className="px-6 py-4 text-left text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {raffles.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No raffles found. Create your first raffle!
                      </td>
                    </tr>
                  ) : (
                    raffles.map((raffle) => (
                      <tr key={raffle.id} className="border-t border-primary-lightgray hover:bg-primary-darker transition-colors">
                        <td className="px-6 py-4 text-white">{raffle.title}</td>
                        <td className="px-6 py-4 text-primary-green font-semibold">
                          {raffle.prize_pool_symbol} {raffle.prize_pool_amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            raffle.status === 'live' ? 'bg-primary-green text-primary-darker' :
                            raffle.status === 'draft' ? 'bg-gray-500 text-white' :
                            raffle.status === 'closed' ? 'bg-primary-orange text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {raffle.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(raffle.ends_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/raffles/${raffle.id}`}
                              className="p-2 text-gray-400 hover:text-primary-green transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/superman/raffles/${raffle.id}/edit`}
                              className="p-2 text-gray-400 hover:text-primary-green transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(raffle.id)}
                              className="p-2 text-gray-400 hover:text-primary-orange transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

