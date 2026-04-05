'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import NoolPlayer from './NoolPlayer';
import type { Nool } from '@/lib/nool-data';

interface NoolFeedProps {
  initialNool: Nool[];
}

export default function NoolFeed({ initialNool }: NoolFeedProps) {
  const [nool, setNool] = useState<Nool[]>(initialNool);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // IntersectionObserver to detect which reel is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = reelRefs.current.indexOf(
              entry.target as HTMLDivElement
            );
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    reelRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [nool.length]);

  // Infinite scroll — load more when reaching near the end
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollHeight - scrollTop - clientHeight < clientHeight * 1.5) {
      setIsLoadingMore(true);
      // Simulate loading more nool (cycle through existing ones with new IDs)
      setTimeout(() => {
        setNool((prev) => {
          const nextBatch = initialNool.map((d, i) => ({
            ...d,
            id: `${d.id}-batch-${prev.length + i}`,
          }));
          return [...prev, ...nextBatch];
        });
        setIsLoadingMore(false);
      }, 500);
    }
  }, [isLoadingMore, initialNool]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Keyboard navigation
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, nool.length - 1);
        reelRefs.current[nextIndex]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        const prevIndex = Math.max(activeIndex - 1, 0);
        reelRefs.current[prevIndex]?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeIndex, nool.length]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-y-scroll nool-feed"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {nool.map((nool, index) => (
        <div
          key={nool.id}
          ref={(el) => {
            reelRefs.current[index] = el;
          }}
          className="w-full"
          style={{
            height: '100%',
            scrollSnapAlign: 'start',
            scrollSnapStop: 'always',
          }}
        >
          <NoolPlayer nool={nool} isActive={index === activeIndex} />
        </div>
      ))}

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="w-full h-16 flex items-center justify-center bg-black">
          <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-gold animate-spin" />
        </div>
      )}
    </div>
  );
}
