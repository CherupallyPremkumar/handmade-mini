'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Nool } from '@/lib/nool-data';
import { formatINR } from '@/lib/format';

interface NoolPlayerProps {
  nool: Nool;
  isActive: boolean;
}

function formatCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function NoolPlayer({ nool, isActive }: NoolPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(nool.likes);
  const [showTapIcon, setShowTapIcon] = useState(false);
  const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && nool.videoUrl) {
      video.currentTime = 0;
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, nool.videoUrl]);

  // Track progress from real video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !nool.videoUrl) return;

    function onTimeUpdate() {
      if (video && video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    }
    video.addEventListener('timeupdate', onTimeUpdate);
    return () => video.removeEventListener('timeupdate', onTimeUpdate);
  }, [nool.videoUrl]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }

    // Flash icon
    setShowTapIcon(true);
    if (tapTimeout.current) clearTimeout(tapTimeout.current);
    tapTimeout.current = setTimeout(() => setShowTapIcon(false), 500);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((m) => !m);
  }, [isMuted]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: nool.title,
      text: `Check out "${nool.title}" on Dhanunjaiah Handlooms`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch {
        // Fallback: select text
        const input = document.createElement('input');
        input.value = window.location.href;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('Link copied!');
      }
    }
  }, [nool.title]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black select-none">
      {/* Video */}
      {nool.videoUrl ? (
        <video
          ref={videoRef}
          src={nool.videoUrl}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          loop
          muted={isMuted}
          playsInline
          preload="auto"
          poster=""
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center"
          style={{ background: nool.thumbnailGradient }}
        >
          <div className="text-center">
            <svg className="w-16 h-16 text-white/30 mx-auto" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            <p className="mt-2 text-white/40 text-sm">Video coming soon</p>
          </div>
        </div>
      )}

      {/* Tap to play/pause */}
      <button
        className="absolute inset-0 z-10"
        onClick={togglePlay}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      />

      {/* Tap flash icon */}
      {showTapIcon && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
            {!isPlaying ? (
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-20 pointer-events-none" />

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 pointer-events-none" />

      {/* Sound button — top right, prominent */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleMute(); }}
        className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm flex items-center gap-1.5 border border-white/20"
      >
        {isMuted ? (
          <>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span className="text-white text-xs font-medium">Tap for sound</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-white text-xs font-medium">Sound on</span>
          </>
        )}
      </button>

      {/* Right side actions */}
      <div className="absolute right-3 bottom-44 z-30 flex flex-col items-center gap-4">
        {/* Like */}
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); setLikeCount(c => liked ? c - 1 : c + 1); }} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <svg className={`w-5 h-5 ${liked ? 'text-red-500' : 'text-white'}`} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-[10px] text-white font-medium">{formatCount(likeCount)}</span>
        </button>

        {/* Share — works on desktop too */}
        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
          <span className="text-[10px] text-white font-medium">Share</span>
        </button>

        {/* Shop link */}
        {nool.linkedSareeId && (
          <Link href={`/sarees/${nool.linkedSareeId}`} onClick={(e) => e.stopPropagation()} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-[10px] text-white font-medium">Shop</span>
          </Link>
        )}
      </div>

      {/* Bottom — product info */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-5">
        <div className="pr-14 mb-3">
          <h3 className="text-base font-bold text-white leading-tight mb-1">{nool.title}</h3>
          <p className="text-xs text-white/60 leading-snug line-clamp-2">{nool.description}</p>
        </div>

        {/* Shop Now card */}
        {nool.linkedSareeId && nool.linkedSareeName && nool.linkedSareePrice !== null && (
          <Link href={`/sarees/${nool.linkedSareeId}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-2.5 mb-3">
            <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-white/10" style={{ background: nool.thumbnailGradient }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{nool.linkedSareeName}</p>
              <p className="text-sm font-bold" style={{ color: '#E8C547' }}>{formatINR(nool.linkedSareePrice)}</p>
            </div>
            <div className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold uppercase" style={{ background: 'linear-gradient(135deg, #D4A017, #E8C547)', color: '#3D2B1F' }}>
              Shop
            </div>
          </Link>
        )}

        {/* Progress bar */}
        <div className="w-full h-[3px] bg-white/20 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #D4A017, #E8C547)', transition: 'width 0.2s linear' }} />
        </div>
      </div>
    </div>
  );
}
