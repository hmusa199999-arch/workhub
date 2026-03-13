import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { subscribeToBanners, type BannerAd } from '../utils/firestoreBanners';

function getYoutubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function DirectBannerCarousel() {
  const [ads, setAds]         = useState<BannerAd[]>([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Real-time subscription via Firebase
    const unsubscribe = subscribeToBanners((freshAds) => {
      setAds(prev => {
        if (JSON.stringify(prev.map(a => a.id)) !== JSON.stringify(freshAds.map(a => a.id))) {
          setCurrent(0);
        }
        return freshAds;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (ads.length <= 1 || paused) return;
    const dur = ads[current]?.duration ?? 5;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrent(prev => (prev + 1) % ads.length);
    }, dur * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, ads, paused]);

  if (ads.length === 0) {
    return (
      <div className="relative w-full overflow-hidden flex items-center justify-center"
        style={{ height: '280px', background: 'linear-gradient(135deg, #1c0202 0%, #2d0707 50%, #1c0202 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'linear-gradient(#dc2626 1px, transparent 1px), linear-gradient(90deg, #dc2626 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative text-center px-6">
          <div className="text-5xl mb-3">📢</div>
          <p className="text-red-400 font-bold text-xl">مساحة إعلانية</p>
          <p className="text-gray-500 text-sm mt-2">تُضاف من لوحة الأدمن ← إعلانات الصفحة</p>
        </div>
      </div>
    );
  }

  const ad   = ads[current];
  const prev = () => setCurrent(i => (i - 1 + ads.length) % ads.length);
  const next = () => setCurrent(i => (i + 1) % ads.length);

  const isYoutube = ad.type === 'youtube' || (!!ad.mediaUrl && !!getYoutubeId(ad.mediaUrl));
  const isMedia   = ad.type !== 'text' && (ad.mediaData || ad.mediaUrl);

  const renderMedia = () => {
    if (isYoutube && ad.mediaUrl) {
      const ytId = getYoutubeId(ad.mediaUrl);
      if (ytId) return (
        <iframe key={ytId}
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=0&showinfo=0&rel=0&modestbranding=1`}
          className="absolute inset-0 w-full h-full"
          allow="autoplay; encrypted-media" allowFullScreen />
      );
    }
    if (ad.type === 'image' && ad.mediaUrl)
      return <img src={ad.mediaUrl} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
    if (ad.type === 'image' && ad.mediaData)
      return <img src={ad.mediaData} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" />;
    if (ad.type === 'video' && (ad.mediaUrl || ad.mediaData))
      return <video src={ad.mediaUrl || ad.mediaData} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" />;
    return <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ad.bgColor || '#b91c1c'} 0%, #1a0202 100%)` }} />;
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '280px' }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {renderMedia()}
      {isMedia && !isYoutube && <div className="absolute inset-0 bg-black/40" />}

      {!isYoutube && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
          {ad.title && <h2 className="text-white font-black text-2xl md:text-4xl mb-2 max-w-3xl leading-snug" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>{ad.title}</h2>}
          {ad.subtitle && <p className="text-white/90 text-base md:text-lg mt-1 max-w-xl font-medium" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.8)' }}>{ad.subtitle}</p>}
          {ad.link && (
            <a href={ad.link} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg">
              اعرف أكثر <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      {ads.length > 1 && (
        <>
          <button onClick={prev} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {ads.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${i === current ? 'w-6 h-2 bg-red-500' : 'w-2 h-2 bg-white/50'}`} />
            ))}
          </div>
          <div className="absolute top-3 left-3 z-20 px-2 py-1 bg-black/60 text-white text-xs rounded-full">{current + 1} / {ads.length}</div>
        </>
      )}

      {!paused && !isYoutube && (
        <div key={`${current}-${ad.duration}`} className="absolute bottom-0 left-0 h-1 bg-red-500 z-20"
          style={{ animation: `banner-progress ${ad.duration}s linear forwards` }} />
      )}
      <style>{`@keyframes banner-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
