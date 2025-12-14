'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        // Set session cookie/localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_authenticated', 'true');
          localStorage.setItem('admin_session', data.sessionToken || Date.now().toString());
        }
        router.push('/superman/dashboard');
      } else {
        setError(data.error || 'Invalid PIN. Access denied.');
        setPin('');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to verify PIN. Please try again.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4 bg-primary-dark">
        <div className="w-full max-w-md">
          <div className="bg-primary-gray border border-primary-lightgray rounded-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-primary-orange/20 p-4 rounded-full">
                <Lock className="w-8 h-8 text-primary-orange" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              ADMIN ACCESS
            </h1>
            <p className="text-gray-400 text-center mb-8">
              Enter your secret PIN to continue
            </p>

            {error && (
              <div className="bg-primary-orange/20 border border-primary-orange rounded-lg p-4 mb-6">
                <p className="text-primary-orange text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-300 mb-2">
                  Secret PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full bg-primary-darker border border-primary-lightgray rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-green transition-colors"
                  placeholder="Enter your PIN"
                  autoComplete="off"
                  required
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || !pin}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  loading || !pin
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-green text-primary-darker hover:bg-primary-green/90'
                }`}
              >
                {loading ? 'Verifying...' : 'ACCESS ADMIN PANEL'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

