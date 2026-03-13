import { useState, useRef } from 'react';
import { X, Loader2, CheckCircle, Gavel, ImagePlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveAd as saveAdLocal, type StoredAd } from '../utils/adsStore';
import { saveAd as saveAdCloud } from '../utils/firestoreAds';

interface PostAuctionModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AUCTION_SUBCATS = [
  { value: 'car',    label: '🚗 سيارات' },
  { value: 'plate',  label: '🔢 أرقام سيارات' },
  { value: 'animal', label: '🐄 حيوانات' },
  { value: 'scrap',  label: '🔩 قطع سكراب' },
  { value: 'bike',   label: '🏍️ دراجات' },
  { value: 'watch',  label: '⌚ ساعات' },
  { value: 'other',  label: '📦 سلع أخرى' },
];

const CONDITIONS = ['جديد', 'ممتاز', 'جيد جداً', 'جيد', 'للقطعة'];

const ARAB_LOCATIONS: Record<string, string[]> = {
  'الإمارات - دبي':          ['وسط المدينة', 'دبي مارينا', 'الجميرا', 'البرشاء', 'ديرة', 'الكرامة', 'مردف'],
  'الإمارات - أبوظبي':       ['جزيرة الريم', 'السعديات', 'مدينة خليفة', 'محمد بن زايد', 'مصفح'],
  'الإمارات - الشارقة':      ['وسط الشارقة', 'الطيبة', 'الحرة الصناعية'],
  'الإمارات - عجمان':        ['وسط عجمان', 'النعيمية', 'الراشدية'],
  'الإمارات - رأس الخيمة':   ['وسط المدينة', 'الحمراء', 'المعيريض'],
  'الإمارات - الفجيرة':      ['وسط الفجيرة', 'دبا الفجيرة'],
  'الإمارات - أم القيوين':   ['وسط أم القيوين', 'فلج المعلا'],
  'السعودية - الرياض':       ['العليا', 'الملقا', 'النخيل', 'الياسمين'],
  'السعودية - جدة':          ['الحمراء', 'السلامة', 'الزهراء'],
  'الكويت':                   ['العاصمة', 'حولي', 'الفروانية', 'الأحمدي'],
  'قطر - الدوحة':            ['لوسيل', 'المرخية', 'الروضة', 'الريان'],
  'البحرين':                  ['المنامة', 'المحرق', 'الرفاع'],
  'عُمان - مسقط':            ['مطرح', 'الروي', 'بوشر', 'السيب'],
  'مصر - القاهرة':           ['مدينة نصر', 'المعادي', 'الزمالك', 'التجمع الخامس'],
  'مصر - الإسكندرية':        ['سموحة', 'العجمي', 'المنتزه'],
  'الأردن - عمّان':           ['الرابية', 'الصويفية', 'دابوق'],
};

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white text-gray-900 placeholder-gray-400';
const selectCls = inputCls;

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function PostAuctionModal({ onClose, onSuccess }: PostAuctionModalProps) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    subCat: 'car',
    title: '',
    desc: '',
    startPrice: '',
    condition: 'جيد جداً',
    endDate: '',
    locCountry: '',
    locArea: '',
    phone: user?.phone || '',
    name: user?.name || '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => prev.length < 6 ? [...prev, ev.target?.result as string] : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.phone.trim() || !form.name.trim() || !form.startPrice) return;
    setSubmitting(true);

    const ad: Record<string, unknown> = {
      category: 'auction',
      status: 'pending',
      name: form.name,
      phone: form.phone,
      title: form.title,
      desc: form.desc,
      price: parseFloat(form.startPrice) || 0,
      location: form.locCountry + (form.locArea ? ` - ${form.locArea}` : ''),
      images,
      auctionSubCat: form.subCat,
      auctionStartPrice: parseFloat(form.startPrice) || 0,
      auctionCondition: form.condition,
      auctionEndDate: form.endDate || '',
      createdAt: new Date().toISOString(),
      userId: user?.id || '',
    };

    try {
      saveAdLocal(ad as unknown as StoredAd);
      await saveAdCloud({ ...ad, status: 'pending' });
    } catch (err) {
      console.error(err);
    }

    setSubmitting(false);
    setDone(true);
    setTimeout(() => { onSuccess?.(); onClose(); }, 2200);
  };

  const areaOptions = form.locCountry ? ARAB_LOCATIONS[form.locCountry] || [] : [];

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-black text-gray-800 mb-2">تم إرسال إعلان المزاد!</h3>
          <p className="text-gray-500 text-sm">سيتم مراجعته من قِبل الإدارة وإدراجه في المزادات بعد الموافقة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-yellow-600 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">أضف إعلان مزاد</h2>
              <p className="text-yellow-100 text-xs">سيُراجع الإعلان قبل النشر</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Subcategory */}
          <Field label="فئة المزاد" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {AUCTION_SUBCATS.map(sub => (
                <button
                  key={sub.value}
                  type="button"
                  onClick={() => set('subCat', sub.value)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-bold border-2 transition-all text-center ${
                    form.subCat === sub.value
                      ? 'bg-orange-500 border-orange-500 text-white shadow'
                      : 'border-gray-200 text-gray-700 hover:border-orange-300'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="اسم المُزايِد" required>
              <input className={inputCls} placeholder="اسمك الكامل" value={form.name} onChange={e => set('name', e.target.value)} required />
            </Field>
            <Field label="رقم الهاتف / واتساب" required>
              <input className={inputCls} placeholder="+971 5XXXXXXXX" dir="ltr" value={form.phone} onChange={e => set('phone', e.target.value)} required />
            </Field>
          </div>

          {/* Title */}
          <Field label="عنوان الإعلان" required>
            <input className={inputCls} placeholder="مثال: سيارة كامري 2020 للمزاد" value={form.title} onChange={e => set('title', e.target.value)} required />
          </Field>

          {/* Description */}
          <Field label="وصف تفصيلي">
            <textarea className={inputCls + ' resize-none'} rows={3} placeholder="اذكر التفاصيل: الموديل، الحالة، المواصفات..." value={form.desc} onChange={e => set('desc', e.target.value)} />
          </Field>

          {/* Price + Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="سعر البداية (AED)" required>
              <input type="number" className={inputCls} placeholder="0" min={0} value={form.startPrice} onChange={e => set('startPrice', e.target.value)} required />
            </Field>
            <Field label="الحالة">
              <select className={selectCls} value={form.condition} onChange={e => set('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* End Date */}
          <Field label="تاريخ انتهاء المزاد (اختياري)">
            <input type="date" className={inputCls} dir="ltr" value={form.endDate} onChange={e => set('endDate', e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </Field>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="الدولة / المنطقة">
              <select className={selectCls} value={form.locCountry} onChange={e => { set('locCountry', e.target.value); set('locArea', ''); }}>
                <option value="">اختر الدولة / الإمارة</option>
                {Object.keys(ARAB_LOCATIONS).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="المدينة / الحي">
              <select className={selectCls} value={form.locArea} onChange={e => set('locArea', e.target.value)} disabled={!areaOptions.length}>
                <option value="">{areaOptions.length ? 'اختر المنطقة' : '—'}</option>
                {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>

          {/* Images */}
          <Field label="صور الإعلان (حتى 6 صور)">
            <div className="space-y-3">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 font-semibold text-sm hover:border-orange-500 hover:bg-orange-50 transition w-full justify-center">
                <ImagePlus className="w-4 h-4" /> أضف صور
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden h-24 bg-gray-100 border border-gray-200">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>

          {/* Notice */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-800 flex gap-2">
            <span>⏳</span>
            <span>سيُراجع إعلانك من قِبل الإدارة قبل ظهوره في صفحة المزادات. عادةً خلال بضع ساعات.</span>
          </div>

          {/* Submit */}
          <button type="submit" disabled={submitting}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-base rounded-2xl hover:from-yellow-400 hover:to-orange-400 transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الإرسال...</> : <><Gavel className="w-5 h-5" /> أرسل إعلان المزاد</>}
          </button>
        </form>
      </div>
    </div>
  );
}
