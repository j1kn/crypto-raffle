'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsTransitioning(false);
    }, 200); // Half of the transition duration

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={`transition-all duration-400 ease-out ${
        isTransitioning
          ? 'transform translate-x-8 opacity-0 scale-95'
          : 'transform translate-x-0 opacity-100 scale-100'
      }`}
      style={{
        willChange: 'transform, opacity',
      }}
    >
      {displayChildren}
    </div>
  );
}