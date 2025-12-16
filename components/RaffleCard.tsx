'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface RaffleCardProps {
  id: string;
  title: string;
  imageUrl?: string;
  prizePool: string;
  prizeSymbol: string;
  ticketPrice: string;
  maxTickets: number;
  endDate: string;
  prizePlaces: number;
  badgeColor?: 'green' | 'orange';
}

export default function RaffleCard({
  id,
  title,
  imageUrl,
  prizePool,
  prizeSymbol,
  ticketPrice,
  maxTickets,
  endDate,
  prizePlaces,
  badgeColor = 'green',
}: RaffleCardProps) {
  const convertGoogleDriveUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // Check if it's a Google Drive URL
    if (url.includes('drive.google.com')) {
      // Convert Google Drive share link to direct image URL
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch) {
        return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
      }
      // Try alternative format
      const altMatch = url.match(/id=([a-zA-Z0-9_-]+)/);
      if (altMatch) {
        return `https://drive.google.com/uc?export=view&id=${altMatch[1]}`;
      }
    }
    
    return url;
  };

  const finalImageUrl = convertGoogleDriveUrl(imageUrl);

  return (
    <Link href={`/raffles/${id}`}>
      <div className="bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden hover:border-primary-green transition-all duration-300 hover:shadow-lg hover:shadow-primary-green/20">
        {/* Badge */}
        <div className="relative p-4">
          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold ${
            badgeColor === 'green' 
              ? 'bg-primary-green text-primary-darker' 
              : 'bg-primary-orange text-white'
          }`}>
            <Trophy className="w-3 h-3" />
            {prizePool}
          </div>
          <div className="absolute top-4 right-4">
            <CountdownTimer endDate={endDate} />
          </div>
        </div>

        {/* Image */}
        {finalImageUrl && (
          <div className="relative w-full h-48 bg-primary-darker">
            <Image
              src={finalImageUrl}
              alt={title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Trophy className="w-4 h-4" />
            <span>{prizePlaces} PRIZE PLACES</span>
          </div>

          {/* Prize Info */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Prize Pool:</span>
              <span className="text-primary-green font-semibold">
                {prizeSymbol} {prizePool}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Ticket Price:</span>
              <span className="text-white font-semibold">
                {prizeSymbol} {ticketPrice}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Tickets:</span>
              <span className="text-white">{maxTickets}</span>
            </div>
          </div>

          {/* Enter Button */}
          <button className="w-full bg-primary-green text-primary-darker py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors">
            ENTER NOW
          </button>
        </div>
      </div>
    </Link>
  );
}

