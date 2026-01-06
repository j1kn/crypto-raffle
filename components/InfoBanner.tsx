'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, X } from 'lucide-react';

export default function InfoBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const router = useRouter();

  if (isDismissed) {
    return null;
  }

  const handleClick = () => {
    router.push('/how-it-works');
  };

  return (
    <div className="bg-[#1a1a1a] border-b border-[#2a2a2a]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <button
            onClick={handleClick}
            className="flex items-center gap-2 text-gray-400 hover:text-[#00d97e] transition-colors text-sm md:text-base flex-1 text-left"
          >
            <span>New to PrimePick? Learn how the system works</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors ml-4"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

