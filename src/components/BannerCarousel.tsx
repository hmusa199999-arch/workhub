import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getActiveBannerAds, type BannerAd } from '../utils/bannerStore';

export default function BannerCarousel() {
  const [ads, setAds]       = useState<BannerAd[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── reload whenever localStorage changes or tab gains focus ──────────
  const reload = useCallback(() => {
    const fresh = getActiveBannerAds();
    setAds(prev => {
      // only reset index if ad list actually changed
      if (JSON.stringify(prev.map(a => a.id)) !== JSON.stringify(fresh.map(a => a.id))) {
        setCurrent(0);
      }
      return fresh;
    });
  }, []);

  useEffect(() => {
    reload();
    // refresh every 3 seconds so admin-added banners appear without page reload
    const interval = setInterval(reload, 3000);
    // also refresh when tab gets focus
    window.addEventListener('focus', reload);
    window.addEventListener('storage', reload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', reload);
      window.removeEventListener('storage', reload);
    };
  }, [reload]);

  // ── auto-advance timer ────────────────────────────────────────────────
  useEffect(() => {
    if (ads.length <= 1 || paused) return;
    const dur = ads[current]?.duration ?? 5;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, dur * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, ads, paused]);

  // ── empty state ───────────────────────────────────────────────────────
  if (ads.length === 0) {
    return (
      <div
        className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: '260px', background: 'linear-gradient(135deg, #1a0505 0%, #2d0a0a 50%, #1a0505 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative text-center px-6">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-red-400/70 font-bold text-lg">مساحة إعلانية</p>
          <p className="text-gray-600 text-sm mt-1">تُدار من لوحة تحكم الأدمن</p>
        </div>
      </div>
    );
  }

  const ad   = ads[current];
  const prev = () => setCurrent(i => (i - 1 + ads.length) % ads.length);
  const next = () => setCurrent(i => (i + 1) % ads.length);

  const renderMedia = () => {
    if (ad.type === 'image' && ad.mediaData) {
      return (
        <img
          src={ad.mediaData}
          alt={ad.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }
    if (ad.type === 'video' && ad.mediaData) {
      return (
        <video
          src={ad.mediaData}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }
    // text / color banner
    return (
      <div
        className="absolute inset-0"
        style={{ background: ad.bgColor
          ? ad.bgColor
          : 'linear-gradient(135deg, #7f1d1d, #450a0a)' }}
      />
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '260px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Media */}
      {renderMedia()}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
        {ad.title && (
          <h2 className="text-white font-black text-xl md:text-3xl drop-shadow-lg mb-1 max-w-3xl leading-snug">
            {ad.title}
          </h2>
        )}
        {ad.subtitle && (
          <p className="text-white/80 text-sm md:text-base drop-shadow mt-1 max-w-xl">
            {ad.subtitle}
          </p>
        )}
        {ad.link && (
          <a
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-red-900/40"
          >
            اعرف أكثر <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Prev / Next */}
      {ads.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={next}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {ads.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`} />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {!paused && (
        <div
          key={`${current}-${ad.duration}`}
          className="absolute bottom-0 left-0 h-1 bg-red-500 z-20"
          style={{ animation: `banner-progress ${ad.duration}s linear forwards` }}
        />
      )}

      {/* Ad count badge */}
      {ads.length > 1 && (
        <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
          {current + 1} / {ads.length}
        </div>
      )}

      <style>{`
        @keyframes banner-progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
