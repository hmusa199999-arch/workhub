import { useState, useRef } from 'react';
import { X, Loader2, CheckCircle, DollarSign, ImagePlus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { saveAd as saveAdLocal, type StoredAd } from '../utils/adsStore';
import { saveAd as saveAdCloud } from '../utils/supabaseAds';

export type AdCategory = 'car' | 'realestate' | 'service' | 'plate';

interface PostAdModalProps {
  category: AdCategory;
  onClose: () => void;
  onSuccess?: () => void;
}

const UAE_EMIRATES = ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'أم القيوين', 'رأس الخيمة', 'الفجيرة'];

const ARAB_LOCATIONS: Record<string, string[]> = {
  'الإمارات - دبي':         ['وسط المدينة (Downtown)', 'دبي مارينا', 'الجميرا', 'البرشاء', 'ديرة', 'الكرامة', 'مردف', 'القوز', 'الخليج التجاري', 'نخلة جميرا', 'السطوة', 'عود ميثاء', 'الروضة'],
  'الإمارات - أبوظبي':      ['جزيرة الريم', 'السعديات', 'مدينة خليفة', 'محمد بن زايد', 'مصفح', 'الروضة', 'الخالدية', 'وسط المدينة', 'الظفرة', 'الرحبة'],
  'الإمارات - الشارقة':     ['وسط الشارقة', 'الطيبة', 'البطايح', 'الحرة الصناعية', 'الخان', 'القصباء'],
  'الإمارات - عجمان':       ['وسط عجمان', 'النعيمية', 'الراشدية', 'مصفوت', 'الحميدية'],
  'الإمارات - رأس الخيمة':  ['وسط المدينة', 'الحمراء', 'المعيريض', 'خزام', 'الجزيرة الحمراء'],
  'الإمارات - الفجيرة':     ['وسط الفجيرة', 'دبا الفجيرة', 'الحيل', 'قدفع'],
  'الإمارات - أم القيوين':  ['وسط أم القيوين', 'فلج المعلا', 'السلمة'],
  'الإمارات - العين':        ['وسط العين', 'الجيمي', 'الأقطع', 'مزيد', 'هيلي', 'المعترض'],
  'السعودية - الرياض':      ['العليا', 'الملقا', 'النخيل', 'الياسمين', 'الروضة', 'الربوة', 'الشفا', 'العزيزية', 'البديعة', 'طريق الملك فهد'],
  'السعودية - جدة':         ['الحمراء', 'السلامة', 'الزهراء', 'النزهة', 'العزيزية', 'البلد', 'الروضة', 'المحمدية', 'الصفا', 'ابحر'],
  'السعودية - مكة المكرمة': ['الحرم المكي', 'العزيزية', 'الشوقية', 'النسيم', 'أجياد', 'الزاهر'],
  'السعودية - المدينة المنورة': ['الحرم النبوي', 'العوالي', 'العزيزية', 'قباء', 'طيبة'],
  'السعودية - الدمام':       ['العنود', 'الشاطئ', 'الفيصلية', 'النزهة', 'الجلوية', 'طريق الملك فهد'],
  'الكويت':                  ['العاصمة', 'حولي', 'الفروانية', 'الأحمدي', 'مبارك الكبير', 'الجهراء'],
  'قطر - الدوحة':           ['لوسيل', 'العش', 'مشيرب', 'الروضة', 'المرخية', 'فريج عبد العزيز', 'الوكرة', 'الخور', 'الريان'],
  'البحرين':                 ['المنامة', 'المحرق', 'الرفاع', 'مدينة عيسى', 'مدينة حمد', 'عالي', 'سترة'],
  'عُمان - مسقط':           ['مطرح', 'الروي', 'بوشر', 'العامرات', 'قريات', 'السيب', 'المصنعة'],
  'مصر - القاهرة':          ['مدينة نصر', 'هليوبوليس (مصر الجديدة)', 'المعادي', 'الزمالك', 'المهندسين', 'الدقي', 'الشروق', 'التجمع الخامس', 'أكتوبر', 'الشيخ زايد'],
  'مصر - الإسكندرية':       ['سموحة', 'العجمي', 'المنتزه', 'ستانلي', 'الرمل', 'سيدي بشر', 'الكيلو 21'],
  'الأردن - عمّان':          ['الرابية', 'ضاحية الرشيد', 'الجبيهة', 'تلاع العلي', 'الصويفية', 'دابوق', 'مرج الحمام'],
  'لبنان - بيروت':          ['الحمراء', 'الأشرفية', 'الضاحية', 'جونيه', 'جبيل', 'المتن'],
  'العراق - بغداد':         ['الكرادة', 'المنصور', 'العلاوي', 'الزيونة', 'المشتل', 'اليرموك'],
  'المغرب - الدار البيضاء': ['المعاريف', 'عين السبع', 'الحي الحسني', 'سيدي البرنوصي', 'برنارد'],
  'المغرب - الرباط':        ['أكدال', 'الحسان', 'السويسي', 'دوار الحاج فاطمة'],
  'تونس - تونس العاصمة':    ['المرسى', 'لا مارسا', 'حمام الأنف', 'أريانة', 'المنزه'],
  'ليبيا - طرابلس':         ['حي الأندلس', 'بن عاشور', 'الدريبي', 'غرغور'],
  'السودان - الخرطوم':      ['بحري', 'أمدرمان', 'الخرطوم بحري', 'الرياض', 'المنشية'],
  'اليمن - صنعاء':          ['حدة', 'السبعين', 'شارع الزبيري', 'الرقاس'],
  'سوريا - دمشق':           ['المالكي', 'أبو رمانة', 'كفرسوسة', 'المزة', 'الميدان'],
};

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

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white text-black placeholder-gray-400';
const selectCls = `${inputCls} cursor-pointer`;

const MAX_IMAGES = 8;

const categoryImageLabel: Record<AdCategory, string> = {
  car: 'صور السيارة',
  realestate: 'صور العقار',
  service: 'صور الخدمة',
  plate: 'صور اللوحة',
};

const categoryImageHint: Record<AdCategory, string> = {
  car: 'أضف حتى 8 صور (واجهة، داخلية، محرك...)',
  realestate: 'أضف حتى 8 صور للعقار (مدخل، غرف، مطبخ...)',
  service: 'أضف صوراً توضيحية لخدمتك',
  plate: 'أضف صورة اللوحة الفعلية إن وجدت',
};

/** Image uploader component */
function ImageUploader({ images, onChange }: { images: string[]; onChange: (newImgs: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_IMAGES - images.length;
    const toProcess = Array.from(files).filter(f => f.type.startsWith('image/')).slice(0, remaining);
    if (toProcess.length === 0) return;

    const results: string[] = [];
    let done = 0;

    toProcess.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = ev => {
        results[idx] = ev.target?.result as string;
        done++;
        if (done === toProcess.length) {
          onChange([...images, ...results.filter(Boolean)]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const remove = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-red-600 text-white px-1.5 py-0.5 rounded">
                  رئيسية
                </span>
              )}
            </div>
          ))}
          {/* Add more slot */}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-red-400 hover:bg-red-50 transition-colors text-gray-400"
            >
              <ImagePlus className="w-5 h-5" />
              <span className="text-[10px]">إضافة</span>
            </button>
          )}
        </div>
      )}

      {/* Upload zone (shown when no images yet) */}
      {images.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center gap-2 hover:border-red-400 hover:bg-red-50 transition-colors text-gray-400"
        >
          <ImagePlus className="w-8 h-8" />
          <span className="text-sm font-medium text-gray-500">انقر لرفع الصور</span>
          <span className="text-xs text-gray-400">PNG, JPG حتى {MAX_IMAGES} صور</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}

export default function PostAdModal({ category, onClose, onSuccess }: PostAdModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [images, setImages] = useState<string[]>([]);

  // Shared fields — pre-fill from logged-in user if available
  const [name, setName]     = useState(user?.name || '');
  const [phone, setPhone]   = useState(user?.phone || '');
  const [price, setPrice]   = useState('');
  const [location, setLocation] = useState('');
  const [reLocCountry, setReLocCountry] = useState('');
  const [reLocArea, setReLocArea]       = useState('');
  const [desc, setDesc]     = useState('');
  const [intent, setIntent] = useState<'offer' | 'request'>('offer');

  // Car-specific
  const [carTitle, setCarTitle]   = useState('');
  const [carYear, setCarYear]     = useState('');
  const [carKm, setCarKm]         = useState('');
  const [carFuel, setCarFuel]     = useState('بنزين');
  const [carTrans, setCarTrans]   = useState('أوتوماتيك');
  const [carColor, setCarColor]   = useState('');

  // Real-estate-specific
  const [reTitle, setReTitle]     = useState('');
  const [reType, setReType]       = useState('شقة');
  const [rePurpose, setRePurpose] = useState('للإيجار');
  const [reBeds, setReBeds]       = useState('');
  const [reBaths, setReBaths]     = useState('');
  const [reArea, setReArea]       = useState('');

  // Service-specific
  const [svcTitle, setSvcTitle] = useState('');
  const [svcCat, setSvcCat]     = useState('تنظيف');
  const [svcPer, setSvcPer]     = useState('ساعة');

  // Plate-specific
  const [plateEmirate, setPlateEmirate] = useState('دبي');
  const [plateNum, setPlateNum]         = useState('');
  const [plateCode, setPlateCode]       = useState('');
  const [plateCat, setPlateCat]         = useState('ثلاثي');

  const titles: Record<AdCategory, string> = {
    car: 'أضف إعلان سيارة',
    realestate: 'أضف إعلان عقار',
    service: 'أضف إعلان خدمة',
    plate: 'أضف إعلان رقم سيارة',
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'الاسم مطلوب';
    if (!phone.trim()) e.phone = 'رقم الهاتف مطلوب';

    if (category === 'car') {
      if (!carTitle.trim()) e.carTitle = 'اسم السيارة مطلوب';
      if (!location.trim()) e.location = 'الموقع (الدولة / المنطقة) مطلوب';
    }
    if (category === 'realestate') {
      if (!reTitle.trim()) e.reTitle = 'عنوان العقار مطلوب';
      if (!location.trim()) e.location = 'الموقع (الدولة / المنطقة) مطلوب';
    }
    if (category === 'service') {
      if (!svcTitle.trim()) e.svcTitle = 'اسم الخدمة مطلوب';
      if (!location.trim()) e.location = 'الموقع (الدولة / المنطقة) مطلوب';
    }
    if (category === 'plate') {
      if (!plateNum.trim()) e.plateNum = 'رقم اللوحة مطلوب';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    const fullPhone = phone.trim();
    const parsedPrice = price.trim() ? Number(price) : 0;

    const base = {
      id: `ad_${Date.now()}`,
      category: category as StoredAd['category'],
      intent,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: fullPhone,
      price: parsedPrice,
      desc: desc.trim(),
      images,
      location,
    };

    let adData: Omit<StoredAd, 'status'>;
    if (category === 'car') {
      adData = { ...base, carTitle, carYear, carKm, carFuel, carTrans, carColor };
    } else if (category === 'realestate') {
      adData = { ...base, reTitle, reType, rePurpose, reBeds, reBaths, reArea };
    } else if (category === 'service') {
      adData = { ...base, svcTitle, svcCat, svcPer };
    } else {
      adData = { ...base, plateEmirate, plateNum, plateCode, plateCat, location: plateEmirate };
    }

    // Save to both local and cloud (pending - يظهر بعد موافقة الأدمن)
    saveAdLocal(adData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveAdCloud({ ...adData, status: 'pending' } as any).catch(console.error);
    onSuccess?.();
    setLoading(false);
    setStep('done');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-gray-900">{titles[category]}</h2>
            <p className="text-sm text-gray-400 mt-0.5">مجاني تماماً — ينشر فوراً</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {step === 'done' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            {/* Show first uploaded image if any */}
            {images.length > 0 && (
              <div className="w-32 h-32 rounded-2xl overflow-hidden mb-4 shadow-lg">
                <img src={images[0]} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">تم إرسال إعلانك! 🎉</h3>
            <p className="text-gray-500 text-sm mb-2">سيظهر بعد مراجعة الإدارة والموافقة عليه في لوحة التحكم</p>
            <p className="text-xs text-amber-700 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200 mb-4">⏳ إعلانك قيد المراجعة</p>
            {images.length > 1 && (
              <div className="flex gap-2 mb-6">
                {images.slice(1, 5).map((src, i) => (
                  <div key={i} className="w-14 h-14 rounded-xl overflow-hidden shadow-sm">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {images.length > 5 && (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                    +{images.length - 5}
                  </div>
                )}
              </div>
            )}
            <button onClick={onClose}
              className="px-8 py-3 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-colors">
              رائع، شكراً!
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 space-y-4">

              {/* Intent (offer / request) */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">نوع الإعلان</span>
                <div className="flex gap-1 p-0.5 bg-gray-100 rounded-full">
                  <button
                    type="button"
                    onClick={() => setIntent('offer')}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all ${
                      intent === 'offer'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    عرض (بيع / تأجير)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntent('request')}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition-all ${
                      intent === 'request'
                        ? 'bg-gray-900 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    طلب شخصي
                  </button>
                </div>
              </div>

              {/* ── CAR FIELDS ── */}
              {category === 'car' && (
                <>
                  <Field label="السيارة (الماركة والموديل)" required>
                    <input value={carTitle} onChange={e => setCarTitle(e.target.value)} placeholder="مثال: تويوتا لاند كروزر 2023" className={inputCls} />
                    {errors.carTitle && <p className="text-red-500 text-xs mt-1">{errors.carTitle}</p>}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="سنة الصنع" required>
                      <input value={carYear} onChange={e => setCarYear(e.target.value)} placeholder="2023" type="number" min="1990" max="2026" className={inputCls} />
                      {errors.carYear && <p className="text-red-500 text-xs mt-1">{errors.carYear}</p>}
                    </Field>
                    <Field label="المسافة (كم)">
                      <input value={carKm} onChange={e => setCarKm(e.target.value)} placeholder="15000" type="number" className={inputCls} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="نوع الوقود">
                      <select value={carFuel} onChange={e => setCarFuel(e.target.value)} className={selectCls}>
                        {['بنزين', 'ديزل', 'هجين', 'كهربائي'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="ناقل الحركة">
                      <select value={carTrans} onChange={e => setCarTrans(e.target.value)} className={selectCls}>
                        {['أوتوماتيك', 'يدوي'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                  <Field label="اللون">
                      <input value={carColor} onChange={e => setCarColor(e.target.value)} placeholder="أبيض" className={inputCls} />
                    </Field>
                    <Field label="الموقع (الدولة / المدينة)" required>
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="مثال: دبي - الإمارات، الرياض - السعودية، القاهرة - مصر"
                        className={inputCls}
                      />
                      {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                    </Field>
                  </div>
                </>
              )}

              {/* ── REAL ESTATE FIELDS ── */}
              {category === 'realestate' && (
                <>
                  <Field label="عنوان العقار" required>
                    <input value={reTitle} onChange={e => setReTitle(e.target.value)} placeholder="مثال: شقة فاخرة في وسط دبي" className={inputCls} />
                    {errors.reTitle && <p className="text-red-500 text-xs mt-1">{errors.reTitle}</p>}
                  </Field>
                  {/* Location selector */}
                  <Field label="الموقع (الدولة / المدينة)" required>
                    <div className="flex flex-col gap-2">
                      <select
                        value={reLocCountry}
                        onChange={e => { setReLocCountry(e.target.value); setReLocArea(''); setLocation(e.target.value); }}
                        className={selectCls}
                      >
                        <option value="">— اختر الدولة / الإمارة —</option>
                        {Object.keys(ARAB_LOCATIONS).map(k => (
                          <option key={k} value={k}>{k}</option>
                        ))}
                      </select>
                      {reLocCountry && (
                        <select
                          value={reLocArea}
                          onChange={e => { setReLocArea(e.target.value); setLocation(reLocCountry + (e.target.value ? ' - ' + e.target.value : '')); }}
                          className={selectCls}
                        >
                          <option value="">— اختر المنطقة / الحي (اختياري) —</option>
                          {ARAB_LOCATIONS[reLocCountry].map(a => (
                            <option key={a} value={a}>{a}</option>
                          ))}
                        </select>
                      )}
                    </div>
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="نوع العقار">
                      <select value={reType} onChange={e => setReType(e.target.value)} className={selectCls}>
                        {['شقة', 'فيلا', 'استوديو', 'مكتب', 'أرض', 'بنتهاوس', 'غرفة'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="الغرض">
                      <select value={rePurpose} onChange={e => setRePurpose(e.target.value)} className={selectCls}>
                        {['للإيجار', 'للبيع'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="غرف النوم">
                      <input value={reBeds} onChange={e => setReBeds(e.target.value)} placeholder="2" type="number" min="0" className={inputCls} />
                    </Field>
                    <Field label="الحمامات">
                      <input value={reBaths} onChange={e => setReBaths(e.target.value)} placeholder="2" type="number" min="0" className={inputCls} />
                    </Field>
                    <Field label="المساحة (قدم)">
                      <input value={reArea} onChange={e => setReArea(e.target.value)} placeholder="1200" type="number" className={inputCls} />
                    </Field>
                  </div>
                </>
              )}

              {/* ── SERVICE FIELDS ── */}
              {category === 'service' && (
                <>
                  <Field label="اسم الخدمة" required>
                    <input value={svcTitle} onChange={e => setSvcTitle(e.target.value)} placeholder="مثال: تنظيف منازل احترافي" className={inputCls} />
                    {errors.svcTitle && <p className="text-red-500 text-xs mt-1">{errors.svcTitle}</p>}
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="تصنيف الخدمة">
                      <select value={svcCat} onChange={e => setSvcCat(e.target.value)} className={selectCls}>
                        {['تنظيف', 'صيانة', 'نقل', 'تعليم', 'تصوير', 'طبخ', 'حراسة', 'مواصلات', 'أخرى'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="السعر لكل">
                      <select value={svcPer} onChange={e => setSvcPer(e.target.value)} className={selectCls}>
                        {['ساعة', 'يوم', 'زيارة', 'شهر', 'مشروع'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="الموقع (الدولة / المدينة)" required>
                    <input
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="مثال: دبي - الإمارات، الكويت - الكويت، مسقط - عُمان"
                      className={inputCls}
                    />
                    {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                  </Field>
                </>
              )}

              {/* ── PLATE FIELDS ── */}
              {category === 'plate' && (
                <>
                  <Field label="الإمارة" required>
                    <div className="grid grid-cols-4 gap-2">
                      {UAE_EMIRATES.map(em => (
                        <button key={em} type="button"
                          onClick={() => setPlateEmirate(em)}
                          className={`py-2 text-xs font-bold rounded-xl border-2 transition-all ${plateEmirate === em ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-700 hover:border-red-300'}`}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="رقم اللوحة" required>
                      <input value={plateNum} onChange={e => setPlateNum(e.target.value.replace(/\D/g, ''))}
                        placeholder="مثال: 786" dir="ltr" className={`${inputCls} text-center text-2xl font-mono tracking-widest font-black`} />
                      {errors.plateNum && <p className="text-red-500 text-xs mt-1">{errors.plateNum}</p>}
                    </Field>
                    <Field label="حرف اللوحة (اختياري)">
                      <input value={plateCode} onChange={e => setPlateCode(e.target.value.toUpperCase().slice(0, 2))}
                        placeholder="A" dir="ltr" className={`${inputCls} text-center text-xl font-mono font-bold`} maxLength={2} />
                    </Field>
                  </div>
                  <Field label="تصنيف الرقم">
                    <div className="flex gap-2 flex-wrap">
                      {['أحادي', 'ثنائي', 'ثلاثي', 'رباعي', 'خماسي'].map(cat => (
                        <button key={cat} type="button"
                          onClick={() => setPlateCat(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${plateCat === cat ? 'border-red-600 bg-red-600 text-white' : 'border-gray-200 text-gray-600 hover:border-red-300'}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Live plate preview */}
                  {plateNum && (
                    <div className="flex justify-center mt-2">
                      <div className="border-[3px] border-gray-700 rounded-md overflow-hidden shadow-md">
                        <div className="h-2 flex">
                          <div className="w-1/5 bg-black" /><div className="w-1/5 bg-red-600" /><div className="flex-1 bg-white" /><div className="w-1/5 bg-green-600" />
                        </div>
                        <div className="bg-white flex items-stretch">
                          <div className="bg-amber-400 flex flex-col items-center justify-center px-2 py-2 min-w-[48px]">
                            <span className="text-[8px] font-black text-white uppercase">{plateEmirate}</span>
                            {plateCode && <span className="text-sm font-black text-white">{plateCode}</span>}
                          </div>
                          <div className="w-px bg-gray-300" />
                          <div className="flex-1 flex items-center justify-center px-4 py-2">
                            <span className="text-2xl font-black tracking-widest text-gray-900 font-mono">{plateNum}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center pr-2 pl-1">
                            <span className="text-[8px] font-bold text-gray-500">UAE</span>
                          </div>
                        </div>
                        <div className="h-2 flex">
                          <div className="w-1/5 bg-black" /><div className="w-1/5 bg-red-600" /><div className="flex-1 bg-white" /><div className="w-1/5 bg-green-600" />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── IMAGE UPLOAD ── */}
              <Field label={categoryImageLabel[category]}>
                <p className="text-xs text-gray-400 mb-2">{categoryImageHint[category]}</p>
                <ImageUploader images={images} onChange={setImages} />
              </Field>

              {/* ── SHARED FIELDS ── */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
                  <div className="flex-1 h-px bg-gray-100" />
                  معلومات التواصل
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <Field label="السعر (AED)" required>
                  <div className="relative">
                    <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={price} onChange={e => setPrice(e.target.value)} placeholder="0" type="number" min="0"
                      className={`${inputCls} pr-9`} />
                  </div>
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="اسمك" required>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="محمد أحمد" className={inputCls} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </Field>
                  <Field label="رقم الهاتف" required>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="ضع رمز الدولة ثم الرقم"
                      dir="ltr"
                      className={`${inputCls}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </Field>
                </div>

                <Field label="وصف الإعلان (اختياري)">
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3}
                    placeholder="أضف تفاصيل إضافية..."
                    className={`${inputCls} resize-none`} />
                </Field>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50 rounded-b-3xl">
              {images.length > 0 && (
                <p className="text-xs text-green-600 font-semibold mb-2 text-center">
                  ✓ {images.length} صورة جاهزة للرفع
                </p>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-2xl hover:from-red-500 hover:to-red-400 disabled:opacity-60 transition-all flex items-center justify-center gap-2 text-base shadow-lg shadow-red-500/20">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جاري النشر...</> : '🚀 نشر الإعلان مجاناً'}
              </button>
              <p className="text-center text-xs text-gray-400 mt-2">بالنشر، توافق على شروط الاستخدام</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
