'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

// Define navigation hierarchy for directional transitions
const NAVIGATION_HIERARCHY = [
  '/',
  '/about',
  '/raffles',
  '/ended',
  '/winners',
  '/dashboard',
  '/help',
  '/privacy',
  '/terms',
  '/admin'
];

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [displayChildren, setDisplayChildren] = useState(children);
  const previousPathRef = useRef(pathname);

  useEffect(() => {
    const currentIndex = NAVIGATION_HIERARCHY.indexOf(pathname);
    const previousIndex = NAVIGATION_HIERARCHY.indexOf(previousPathRef.current);

    // Determine slide direction based on navigation hierarchy
    if (currentIndex > previousIndex && currentIndex !== -1 && previousIndex !== -1) {
      setSlideDirection('right'); // Moving forward in hierarchy
    } else if (currentIndex < previousIndex && currentIndex !== -1 && previousIndex !== -1) {
      setSlideDirection('left'); // Moving backward in hierarchy
    } else {
      setSlideDirection('right'); // Default for unknown paths
    }

    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
      previousPathRef.current = pathname;
    }, 150); // Half of transition duration

    return () => clearTimeout(timer);
  }, [pathname, children]);

  const slideOutClass = slideDirection === 'right'
    ? 'transform -translate-x-full opacity-0 scale-95'
    : 'transform translate-x-full opacity-0 scale-95';

  const slideInClass = slideDirection === 'right'
    ? 'transform translate-x-full opacity-0 scale-95'
    : 'transform -translate-x-full opacity-0 scale-95';

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Outgoing page */}
      {isTransitioning && (
        <div
          className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${slideOutClass}`}
          style={{
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000,
          }}
        >
          {displayChildren}
        </div>
      )}

      {/* Incoming page */}
      <div
        className={`transition-all duration-500 ease-[cubic-bezier(0.4,0.0,0.2,1)] ${
          isTransitioning
            ? slideInClass
            : 'transform translate-x-0 opacity-100 scale-100'
        }`}
        style={{
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          perspective: 1000,
        }}
      >
        {isTransitioning ? children : displayChildren}
      </div>
    </div>
  );
}