import { useState, useEffect } from 'react';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export default function IntroSplash({ onComplete }: IntroSplashProps) {
  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);   // Logo appear
    const timer2 = setTimeout(() => setStage(2), 1500);  // Welcome text
    const timer3 = setTimeout(() => setStage(3), 2500);  // Features
    const timer4 = setTimeout(() => setStage(4), 3500);  // CTA
    
    // Auto-complete after 5 seconds or user can skip
    const autoComplete = setTimeout(() => {
      handleComplete();
    }, 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(autoComplete);
    };
  }, []);

  const handleComplete = () => {
    setVisible(false);
    setTimeout(onComplete, 300);
  };

  if (!visible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-950 z-50 transition-opacity duration-300 opacity-0 pointer-events-none" />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-gray-950 z-50 flex items-center justify-center">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-2 h-2 bg-red-500/30 rounded-full animate-ping" style={{ animationDelay: '0s' }} />
        <div className="absolute top-40 right-32 w-1 h-1 bg-red-400/40 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-red-300/30 rounded-full animate-ping" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-red-500/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-red-400/25 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="text-center px-8 max-w-lg relative">
        {/* Logo */}
        <div className={`transition-all duration-1000 ${stage >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-150 translate-y-8'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl shadow-2xl shadow-red-500/30 mb-4">
              <span className="text-3xl font-black text-white">W</span>
            </div>
            <h1 className="text-5xl font-black text-white mb-2">
              work<span className="text-red-500">1m</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-red-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">المنصة الأولى للإعلانات في الوطن العربي</span>
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className={`transition-all duration-800 ${stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <h2 className="text-2xl font-bold text-white mb-2">🎉 أهلاً وسهلاً بك</h2>
          <p className="text-gray-300 text-lg mb-6">منصة شاملة للوظائف والإعلانات المبوبة</p>
        </div>

        {/* Features */}
        <div className={`transition-all duration-800 ${stage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              وظائف مجانية
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              سيارات وعقارات
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              خدمات متنوعة
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              أرقام مميزة
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className={`transition-all duration-800 ${stage >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <button
            onClick={handleComplete}
            className="group inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-2xl shadow-xl shadow-red-500/25 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105"
          >
            <Zap className="w-5 h-5" />
            ابدأ التصفح
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-xs text-gray-500 mt-4 cursor-pointer hover:text-gray-400" onClick={handleComplete}>
            أو انقر هنا للتخطي
          </p>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={handleComplete}
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors text-sm"
      >
        تخطي ✕
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex gap-2">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-8 h-1 rounded-full transition-all duration-500 ${stage > i ? 'bg-red-500' : 'bg-gray-700'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}