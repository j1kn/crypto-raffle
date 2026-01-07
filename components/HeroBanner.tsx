'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

export default function HeroBanner() {
  const [bannerTagline, setBannerTagline] = useState<string | null>(null);
  const [raffleId, setRaffleId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchHeroBanner();
  }, []);

  const fetchHeroBanner = async () => {
    try {
      // Fetch the featured live raffle with banner tagline
      const { data, error } = await supabase
        .from('public_raffles')
        .select('id, banner_tagline')
        .eq('status', 'live')
        .eq('is_featured', true)
        .not('banner_tagline', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data && data.banner_tagline) {
        setBannerTagline(data.banner_tagline);
        setRaffleId(data.id);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error fetching hero banner:', error);
      setIsVisible(false);
    }
  };

  if (!isVisible || !bannerTagline || !raffleId) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary-orange via-red-600 to-primary-orange overflow-hidden z-50">
      {/* Scrolling Text Container */}
      <Link 
        href={`/raffles/${raffleId}`}
        className="block py-2 md:py-3 cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div className="relative overflow-hidden">
          {/* Scrolling Text - Infinite Loop */}
          <div className="flex items-center gap-8 animate-scroll whitespace-nowrap">
            {/* Repeat the text multiple times for seamless loop */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2 flex-shrink-0 px-4">
                <span className="text-white font-bold text-sm md:text-base">
                  {bannerTagline}
                </span>
                <span className="text-white text-lg">💰</span>
              </div>
            ))}
          </div>
        </div>
      </Link>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsVisible(false);
        }}
        className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 text-white hover:text-gray-200 transition-colors p-1 z-10"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
}

