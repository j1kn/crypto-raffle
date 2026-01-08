'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trophy } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

interface RaffleCardProps {
  id: string;
  title: string;
  imageUrl?: string; // Landscape image (desktop + mobile detail pages)
  imageUrlPortrait?: string; // Portrait image (mobile home/tournament pages)
  prizePool: string;
  prizeSymbol: string;
  ticketPrice: string;
  maxTickets: number;
  endDate: string;
  prizePlaces: number;
  badgeColor?: 'green' | 'orange';
  entryCount?: number;
}

export default function RaffleCard({
  id,
  title,
  imageUrl,
  imageUrlPortrait,
  prizePool,
  prizeSymbol,
  ticketPrice,
  maxTickets,
  endDate,
  prizePlaces,
  badgeColor = 'green',
  entryCount = 0,
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

  // Desktop always uses landscape, mobile uses portrait if available, otherwise landscape
  const desktopImageUrl = convertGoogleDriveUrl(imageUrl);
  const mobileImageUrl = convertGoogleDriveUrl(imageUrlPortrait || imageUrl);

  return (
    <Link href={`/raffles/${id}`}>
      {/* Desktop Layout - Horizontal Card (Image Left, Info Right, Button Below) */}
      <div className="hidden md:block bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden hover:border-primary-green transition-all duration-300 hover:shadow-lg hover:shadow-primary-green/20">
        <div className="flex h-full min-h-[200px]">
          {/* Left Side - Image */}
          {desktopImageUrl && (
            <div className="relative w-2/5 min-w-[200px] h-full bg-primary-darker flex-shrink-0">
              <Image
                src={desktopImageUrl}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Badge on top-left of image */}
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold z-10 ${
                badgeColor === 'green' 
                  ? 'bg-primary-green text-primary-darker' 
                  : 'bg-primary-orange text-white'
              }`}>
                <Trophy className="w-3 h-3" />
                {prizePool}
              </div>
            </div>
          )}

          {/* Right Side - Details */}
          <div className="flex-1 flex flex-col p-6 min-w-0">
            {/* Timer - Top Right */}
            <div className="flex justify-end mb-3">
              <CountdownTimer endDate={endDate} />
            </div>

            {/* Title */}
            <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 leading-tight">{title}</h3>
            
            {/* Prize Places */}
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Trophy className="w-4 h-4 flex-shrink-0" />
              <span>{prizePlaces} PRIZE PLACES</span>
            </div>

            {/* Prize Info */}
            <div className="space-y-2 mb-4 flex-1">
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
                <span className="text-gray-400">Entries:</span>
                <span className="text-white font-semibold">
                  {entryCount} / {maxTickets}
                </span>
              </div>
            </div>

            {/* Enter Button - Bottom */}
            <button className="w-full bg-primary-green text-primary-darker py-2 rounded font-semibold hover:bg-primary-green/90 transition-colors mt-auto">
              ENTER NOW
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Horizontal Card */}
      <div className="md:hidden bg-primary-gray border border-primary-lightgray rounded-lg overflow-hidden hover:border-primary-green transition-all duration-300 hover:shadow-lg hover:shadow-primary-green/20 h-[32vh] min-h-[200px] max-h-[220px]">
        <div className="flex h-full">
          {/* Left Side - Image */}
          {mobileImageUrl && (
            <div className="relative w-2/5 min-w-[140px] h-full bg-primary-darker flex-shrink-0">
              <Image
                src={mobileImageUrl}
                alt={title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Badge on top-left of image */}
              <div className={`absolute top-2 left-2 px-2 py-1 rounded-full flex items-center gap-1 text-xs font-bold z-10 ${
                badgeColor === 'green' 
                  ? 'bg-primary-green text-primary-darker' 
                  : 'bg-primary-orange text-white'
              }`}>
                <Trophy className="w-2.5 h-2.5" />
                {prizePool}
              </div>
            </div>
          )}

          {/* Right Side - Details */}
          <div className="flex-1 flex flex-col p-3 min-w-0">
            {/* Timer - Centered at top */}
            <div className="flex justify-center mb-2">
              <CountdownTimer endDate={endDate} className="text-[10px]" />
            </div>

            {/* Title */}
            <h3 className="text-white font-bold text-sm mb-1.5 line-clamp-2 leading-tight">{title}</h3>
            
            {/* Prize Places */}
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
              <Trophy className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{prizePlaces} PRIZE PLACES</span>
            </div>

            {/* Prize Info - Compact */}
            <div className="space-y-1 mb-2 flex-1 overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex-shrink-0">Prize:</span>
                <span className="text-primary-green font-semibold truncate ml-2 text-right">
                  {prizeSymbol} {prizePool}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex-shrink-0">Price:</span>
                <span className="text-white font-semibold truncate ml-2 text-right">
                  {prizeSymbol} {ticketPrice}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 flex-shrink-0">Entries:</span>
                <span className="text-white font-semibold truncate ml-2 text-right">
                  {entryCount} / {maxTickets}
                </span>
              </div>
            </div>

            {/* Enter Button - Bottom */}
            <button className="w-full bg-primary-green text-primary-darker py-2 rounded text-xs font-semibold hover:bg-primary-green/90 transition-colors mt-auto">
              ENTER NOW
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

