import { useState, useRef } from 'react';
import { X, User, MapPin, FileText, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { saveAd as saveAdLocal } from '../utils/adsStore';
import { saveAd as saveAdCloud } from '../utils/firestoreAds';
import { useAuth } from '../context/AuthContext';

const jobTypes = ['دوام كامل', 'دوام جزئي', 'عن بُعد', 'مستقل', 'تدريب'];
const expLevels = ['بدون خبرة', 'أقل من سنة', '1-3 سنوات', '3-5 سنوات', '5-10 سنوات', 'أكثر من 10 سنوات'];
const sectors = [
  'تقنية المعلومات', 'هندسة', 'طب وصحة', 'تعليم', 'محاسبة ومالية',
  'تسويق وإعلان', 'مبيعات', 'موارد بشرية', 'قانون', 'إدارة أعمال',
  'بناء وعقارات', 'نقل ولوجستيات', 'ضيافة وسياحة', 'أخرى',
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PostSeekerAdModal({ onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const cvRef = useRef<HTMLInputElement>(null);

  const [name, setName]           = useState(user?.name || '');
  const [phone, setPhone]         = useState((user as any)?.phone || '');
  const [location, setLocation]   = useState('');
  const [jsTitle, setJsTitle]     = useState('');
  const [jsSector, setJsSector]   = useState('');
  const [jsExp, setJsExp]         = useState('');
  const [jsType, setJsType]       = useState('');
  const [jsNationality, setJsNationality] = useState('');
  const [desc, setDesc]           = useState('');
  const [jsCv, setJsCv]           = useState('');
  const [cvName, setCvName]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvName(file.name);
    const reader = new FileReader();
    reader.onload = () => setJsCv(reader.result as string);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim())    errs.name    = 'الاسم مطلوب';
    if (!phone.trim())   errs.phone   = 'رقم الهاتف مطلوب';
    if (!jsTitle.trim()) errs.jsTitle = 'المسمى الوظيفي مطلوب';
    if (!jsSector)       errs.jsSector = 'القطاع مطلوب';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const adData = {
      id: `jseeker_${Date.now()}`,
      category: 'job_seeker' as const,
      intent: 'request' as const,
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      price: 0,
      priceHidden: true,
      desc: desc.trim(),
      images: [],
      location: location.trim(),
      jsTitle: jsTitle.trim(),
      jsSector,
      jsExp,
      jsType,
      jsNationality: jsNationality.trim(),
      jsCv,
    };
    saveAdLocal(adData);
    const { id: _id, ...adWithoutId } = adData;
    saveAdCloud({ ...adWithoutId }).catch(console.error);

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => { onSuccess(); onClose(); }, 2000);
  };

  const inp = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white text-gray-900 placeholder-gray-400';
  const sel = inp + ' appearance-none';

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">تم نشر إعلانك!</h3>
          <p className="text-gray-500 text-sm">إعلانك الآن مرئي لجميع الزوار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900">أضف إعلان طلب توظيف</h2>
            <p className="text-xs text-gray-400 mt-0.5">أخبر الشركات أنك متاح للعمل</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* Personal Info */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-red-500" /> معلومات التواصل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="الاسم الكامل *"
                  className={`${inp} ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+9715..., +2010..." dir="ltr"
                  className={`${inp} ${errors.phone ? 'border-red-400' : ''}`} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="الدولة / المدينة (مثال: الإمارات - دبي)"
                className={inp} />
            </div>
            <input value={jsNationality} onChange={e => setJsNationality(e.target.value)}
              placeholder="الجنسية (اختياري)"
              className={inp} />
          </div>

          {/* Job Details */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-500" /> تفاصيل البحث عن العمل
            </h3>
            <div>
              <input value={jsTitle} onChange={e => setJsTitle(e.target.value)}
                placeholder="المسمى الوظيفي المطلوب * (مثال: مهندس برمجيات)"
                className={`${inp} ${errors.jsTitle ? 'border-red-400' : ''}`} />
              {errors.jsTitle && <p className="text-red-500 text-xs mt-1">{errors.jsTitle}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <select value={jsSector} onChange={e => setJsSector(e.target.value)}
                  className={`${sel} ${errors.jsSector ? 'border-red-400' : ''}`}>
                  <option value="">القطاع *</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.jsSector && <p className="text-red-500 text-xs mt-1">{errors.jsSector}</p>}
              </div>
              <select value={jsExp} onChange={e => setJsExp(e.target.value)} className={sel}>
                <option value="">سنوات الخبرة</option>
                {expLevels.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select value={jsType} onChange={e => setJsType(e.target.value)} className={sel}>
                <option value="">نوع الدوام</option>
                {jobTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              rows={3}
              placeholder="نبذة عنك ومهاراتك وما تبحث عنه... (اختياري)"
              className={inp + ' resize-none'} />
          </div>

          {/* CV Upload */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2 mb-3">
              <Upload className="w-4 h-4 text-red-500" /> السيرة الذاتية (اختياري)
            </h3>
            <input ref={cvRef} type="file" accept=".pdf,image/*" onChange={handleCvUpload} className="hidden" />
            <button onClick={() => cvRef.current?.click()}
              className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-red-400 hover:bg-red-50/50 transition-all text-sm text-gray-500 hover:text-red-500">
              <Upload className="w-5 h-5 shrink-0" />
              {cvName ? <span className="text-green-600 font-medium">✓ {cvName}</span> : 'ارفع صورة أو PDF للسيرة الذاتية'}
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-l from-red-700 to-red-500 text-white font-black rounded-2xl hover:from-red-600 hover:to-red-400 transition-all shadow-lg shadow-red-500/30 disabled:opacity-60 flex items-center justify-center gap-2 text-base"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> جارٍ الإرسال...</> : 'إرسال الإعلان للمراجعة'}
          </button>

          <p className="text-center text-xs text-gray-400">
            إعلانك سيظهر فوراً في قسم "باحثو العمل" لجميع الزوار
          </p>
        </div>
      </div>
    </div>
  );
}
