import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { getActiveBannerAds, type BannerAd } from '../utils/bannerStore';

export default function BannerCarousel() {
  const [ads, setAds] = useState<BannerAd[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setAds(getActiveBannerAds());
  }, []);

  const startTimer = (_idx: number, dur: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, dur * 1000);
  };

  useEffect(() => {
    if (ads.length <= 1 || paused) return;
    const dur = ads[current]?.duration ?? 5;
    startTimer(current, dur);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, ads, paused]);

  if (ads.length === 0) return null;

  const ad = ads[current];
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
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      );
    }
    // text banner
    return (
      <div
        className="absolute inset-0"
        style={{ background: ad.bgColor || 'linear-gradient(135deg, #7f1d1d, #450a0a)' }}
      />
    );
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: '220px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Media layer */}
      {renderMedia()}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
        {ad.title && (
          <h2 className="text-white font-black text-xl md:text-3xl drop-shadow-lg mb-1 max-w-2xl">
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
            className="mt-3 inline-flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg"
          >
            اعرف أكثر <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Prev / Next */}
      {ads.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots */}
      {ads.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {ads.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? 'w-5 h-2 bg-red-500' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      {ads.length > 1 && !paused && (
        <div
          key={`${current}-${ad.duration}`}
          className="absolute bottom-0 left-0 h-0.5 bg-red-500 z-20"
          style={{
            animation: `banner-progress ${ad.duration}s linear forwards`,
          }}
        />
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
