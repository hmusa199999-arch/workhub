import { useState, useEffect, useRef } from 'react';
import { X, Gavel, Send, TrendingUp, Clock, Crown, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { subscribeToBids, placeBid, type Bid } from '../utils/firestoreBids';
import type { FirestoreAd } from '../utils/firestoreAds';

interface Props {
  auction: FirestoreAd;
  onClose: () => void;
}

// ─── Live countdown hook ──────────────────────────────────────────────────────
function useCountdown(endDateStr?: string) {
  const calc = () => {
    if (!endDateStr) return null;
    const diff = new Date(endDateStr).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, ended: true };
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);
    return { days, hours, minutes, seconds, ended: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDateStr]);
  return time;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

const SUBCAT_LABELS: Record<string, string> = {
  car: '🚗 سيارة', plate: '🔢 رقم لوحة', animal: '🐄 حيوان',
  scrap: '🔩 سكراب', bike: '🏍️ دراجة', watch: '⌚ ساعة', other: '📦 سلعة',
};

export default function AuctionBidModal({ auction, onClose }: Props) {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const countdown = useCountdown(auction.auctionEndDate);

  const highestBid = bids.reduce((max, b) => b.amount > max ? b.amount : max, auction.auctionStartPrice || 0);
  const myLastBid = [...bids].reverse().find(b => b.userId === user?.id);

  // Subscribe to bids
  useEffect(() => {
    const unsub = subscribeToBids(auction.id, (b) => setBids(b));
    return unsub;
  }, [auction.id]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bids]);

  const handleBid = async () => {
    if (!user) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) { setError('أدخل مبلغ صحيح'); return; }
    if (val <= highestBid) { setError(`يجب أن يكون السومة أعلى من ${highestBid.toLocaleString()} AED`); return; }
    if (countdown?.ended) { setError('انتهى وقت المزاد'); return; }

    setSending(true);
    setError('');
    try {
      await placeBid({
        auctionId: auction.id,
        userId: user.id,
        userName: user.name,
        amount: val,
        message: message.trim() || undefined,
        createdAt: new Date().toISOString(),
      });
      setAmount('');
      setMessage('');
    } catch (e) {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  const isEnded = countdown?.ended ?? false;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-gray-950 sm:rounded-3xl border border-yellow-900/40 shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-yellow-700 to-orange-600 px-5 py-4 sm:rounded-t-3xl shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Gavel className="w-4 h-4 text-white shrink-0" />
                <span className="text-yellow-100 text-xs font-bold">
                  {SUBCAT_LABELS[auction.auctionSubCat || ''] || '📦 مزاد'}
                </span>
              </div>
              <h2 className="text-white font-black text-sm sm:text-base leading-tight line-clamp-2">
                {auction.title}
              </h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center hover:bg-black/40 transition shrink-0">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* ── Countdown + Current Bid ─────────────────────────── */}
        <div className="bg-gray-900 px-5 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center justify-between gap-4">

            {/* Countdown */}
            {auction.auctionEndDate ? (
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-500 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> الوقت المتبقي
                </span>
                {isEnded ? (
                  <span className="text-red-400 font-black text-sm">انتهى المزاد</span>
                ) : countdown ? (
                  <div className="flex items-center gap-1">
                    {[
                      { val: countdown.days,    label: 'يوم' },
                      { val: countdown.hours,   label: 'سا' },
                      { val: countdown.minutes, label: 'دق' },
                      { val: countdown.seconds, label: 'ث' },
                    ].map((unit, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`px-2 py-1 rounded-lg text-sm font-black min-w-[32px] text-center ${
                          unit.val < 1 && i > 0 ? 'bg-red-900/60 text-red-300' : 'bg-gray-800 text-yellow-300'
                        }`}>
                          {pad(unit.val)}
                        </div>
                        <span className="text-[8px] text-gray-600 mt-0.5">{unit.label}</span>
                        {i < 3 && <span className="text-yellow-600 font-black text-xs absolute" style={{ marginTop: -2 }}></span>}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> بدون موعد انتهاء
              </div>
            )}

            {/* Highest bid */}
            <div className="text-center">
              <div className="text-[10px] text-gray-500 mb-1 flex items-center gap-1 justify-center">
                <TrendingUp className="w-3 h-3" /> أعلى سومة
              </div>
              <div className="text-yellow-400 font-black text-lg leading-none">
                {highestBid.toLocaleString()}
                <span className="text-xs text-gray-500 font-normal mr-1">AED</span>
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {bids.length > 0 ? `${bids.length} سومة` : 'لا سومات بعد'}
              </div>
            </div>

          </div>

          {/* My last bid */}
          {myLastBid && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span className="text-xs text-yellow-300">
                سومتك الأخيرة: <strong>{myLastBid.amount.toLocaleString()} AED</strong>
                {myLastBid.amount >= highestBid && ' 🏆 أنت في المقدمة!'}
              </span>
            </div>
          )}
        </div>

        {/* ── Chat / Bids list ─────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
          {bids.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">🔨</div>
              <p className="text-gray-500 text-sm">لا توجد سومات بعد</p>
              <p className="text-gray-600 text-xs mt-1">كن أول من يزايد!</p>
            </div>
          ) : (
            bids.map((bid, i) => {
              const isMe = bid.userId === user?.id;
              const isHighest = bid.amount === Math.max(...bids.map(b => b.amount));
              return (
                <div key={bid.id}
                  className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    isMe ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {bid.userName?.[0]?.toUpperCase() || '?'}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    <div className={`text-[10px] text-gray-500 px-1 ${isMe ? 'text-right' : ''}`}>
                      {isMe ? 'أنت' : bid.userName}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 ${
                      isMe
                        ? 'bg-yellow-500/20 border border-yellow-500/30 rounded-tr-sm'
                        : 'bg-gray-800 border border-gray-700 rounded-tl-sm'
                    }`}>
                      {/* Bid amount */}
                      <div className={`flex items-center gap-1.5 font-black text-sm ${
                        isHighest ? 'text-yellow-400' : isMe ? 'text-yellow-300' : 'text-gray-200'
                      }`}>
                        {isHighest && <Crown className="w-3.5 h-3.5" />}
                        {bid.amount.toLocaleString()} AED
                      </div>
                      {bid.message && (
                        <p className="text-xs text-gray-400 mt-0.5">{bid.message}</p>
                      )}
                    </div>
                    <div className="text-[9px] text-gray-600 px-1">
                      {new Date(bid.createdAt).toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' })}
                      {i === bids.length - 1 && <span className="text-yellow-600 mr-1">• آخر سومة</span>}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input area ───────────────────────────────────────── */}
        {!user ? (
          <div className="px-5 py-4 border-t border-gray-800 bg-gray-900 shrink-0 sm:rounded-b-3xl">
            <p className="text-center text-sm text-gray-500">
              <a href="/login" className="text-yellow-400 font-bold hover:underline">سجّل دخول</a> للمشاركة في المزاد
            </p>
          </div>
        ) : isEnded ? (
          <div className="px-5 py-4 border-t border-gray-800 bg-gray-900 shrink-0 sm:rounded-b-3xl">
            <div className="flex items-center gap-2 justify-center text-red-400 text-sm font-bold">
              <AlertCircle className="w-4 h-4" /> انتهى وقت المزاد
            </div>
          </div>
        ) : (
          <div className="px-4 py-4 border-t border-gray-800 bg-gray-900 shrink-0 sm:rounded-b-3xl space-y-2.5">
            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
              </div>
            )}

            {/* Message (optional) */}
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="رسالة اختيارية..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
              maxLength={120}
            />

            {/* Amount + Send */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type="number"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); setError(''); }}
                  placeholder={`سومتك (أعلى من ${highestBid.toLocaleString()})`}
                  min={highestBid + 1}
                  className="w-full pl-14 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-500"
                  onKeyDown={e => e.key === 'Enter' && handleBid()}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-bold">AED</span>
              </div>
              <button
                onClick={handleBid}
                disabled={sending || !amount}
                className="px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20"
              >
                {sending
                  ? <span className="animate-spin inline-block w-4 h-4 border-2 border-black/40 border-t-black rounded-full" />
                  : <Send className="w-4 h-4" />
                }
              </button>
            </div>

            <p className="text-[10px] text-gray-600 text-center">
              كل سومة تُسجَّل بشكل دائم ولا يمكن سحبها
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
