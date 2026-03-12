import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, X, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sectors } from '../data/mockData';

const jobTypes = [
  { value: 'full-time', label: 'دوام كامل' },
  { value: 'part-time', label: 'دوام جزئي' },
  { value: 'remote', label: 'عن بُعد' },
  { value: 'freelance', label: 'مستقل' },
  { value: 'internship', label: 'تدريب' },
];

const expLevels = [
  { value: 'entry', label: 'مبتدئ (0-2 سنة)' },
  { value: 'mid', label: 'متوسط (2-5 سنوات)' },
  { value: 'senior', label: 'أول (5-8 سنوات)' },
  { value: 'lead', label: 'قيادي (8+ سنوات)' },
  { value: 'executive', label: 'تنفيذي' },
];

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: '',
    sector: '',
    type: '',
    experienceLevel: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: [] as string[],
    newSkill: '',
    deadline: '',
    featured: false,
  });

  const set = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }));

  const addListItem = (key: 'requirements' | 'responsibilities') => {
    setForm(f => ({ ...f, [key]: [...f[key], ''] }));
  };

  const updateListItem = (key: 'requirements' | 'responsibilities', idx: number, val: string) => {
    setForm(f => {
      const arr = [...f[key]];
      arr[idx] = val;
      return { ...f, [key]: arr };
    });
  };

  const removeListItem = (key: 'requirements' | 'responsibilities', idx: number) => {
    setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));
  };

  const addSkill = () => {
    if (form.newSkill.trim() && !form.skills.includes(form.newSkill.trim())) {
      setForm(f => ({ ...f, skills: [...f.skills, f.newSkill.trim()], newSkill: '' }));
    }
  };

  const removeSkill = (skill: string) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-bold text-gray-700">يجب تسجيل الدخول أولاً</h2>
        <button onClick={() => navigate('/login?role=company')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          تسجيل الدخول
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">تم نشر الوظيفة!</h2>
          <p className="text-gray-500 text-sm mb-6">تم نشر إعلان الوظيفة بنجاح وسيظهر للباحثين خلال دقائق.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard/company')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              الذهاب للوحة التحكم
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setForm({ title: '', sector: '', type: '', experienceLevel: '', location: '', salaryMin: '', salaryMax: '', description: '', requirements: [''], responsibilities: [''], skills: [], newSkill: '', deadline: '', featured: false }); }} className="px-6 py-3 text-blue-600 border border-blue-300 font-semibold rounded-xl hover:bg-blue-50 transition-colors">
              نشر وظيفة أخرى
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'المعلومات الأساسية' },
    { num: 2, label: 'التفاصيل والمتطلبات' },
    { num: 3, label: 'المراجعة والنشر' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">نشر إعلان وظيفة</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`mr-2 text-sm font-medium hidden sm:block ${step >= s.num ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-3 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-6">المعلومات الأساسية</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المسمى الوظيفي *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: مطور برمجيات أول" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">القطاع *</label>
                  <select value={form.sector} onChange={e => set('sector', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                    <option value="">اختر القطاع</option>
                    {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">نوع العمل *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                    <option value="">اختر نوع العمل</option>
                    {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">مستوى الخبرة *</label>
                  <select value={form.experienceLevel} onChange={e => set('experienceLevel', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white">
                    <option value="">اختر المستوى</option>
                    {expLevels.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الموقع *</label>
                  <input type="text" value={form.location} onChange={e => set('location', e.target.value)} placeholder="دبي، الإمارات العربية المتحدة" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الراتب الشهري (AED) - اختياري</label>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="الحد الأدنى" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" dir="ltr" />
                  <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="الحد الأقصى" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">آخر موعد للتقديم - اختياري</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" dir="ltr" />
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <input type="checkbox" id="featured" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 text-amber-500 rounded" />
                <label htmlFor="featured" className="text-sm font-medium text-amber-800">
                  ⭐ إعلان مميز (+150 AED) - يظهر في أعلى نتائج البحث
                </label>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">التفاصيل والمتطلبات</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">وصف الوظيفة *</label>
                <textarea rows={5} value={form.description} onChange={e => set('description', e.target.value)} placeholder="اكتب وصفاً مفصلاً للوظيفة وبيئة العمل..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none" />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المتطلبات *</label>
                <div className="space-y-2">
                  {form.requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={req} onChange={e => updateListItem('requirements', i, e.target.value)} placeholder={`متطلب ${i + 1}`} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                      {form.requirements.length > 1 && (
                        <button onClick={() => removeListItem('requirements', i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addListItem('requirements')} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors mt-1">
                    <Plus className="w-4 h-4" />
                    إضافة متطلب
                  </button>
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المهام والمسؤوليات *</label>
                <div className="space-y-2">
                  {form.responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={resp} onChange={e => updateListItem('responsibilities', i, e.target.value)} placeholder={`مهمة ${i + 1}`} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                      {form.responsibilities.length > 1 && (
                        <button onClick={() => removeListItem('responsibilities', i)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addListItem('responsibilities')} className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 transition-colors mt-1">
                    <Plus className="w-4 h-4" />
                    إضافة مهمة
                  </button>
                </div>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المهارات المطلوبة</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-xl">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="ml-1 text-blue-500 hover:text-blue-700"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.newSkill}
                    onChange={e => set('newSkill', e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="أضف مهارة ثم اضغط Enter"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
                  />
                  <button onClick={addSkill} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-gray-900 mb-6">مراجعة إعلان الوظيفة</h2>
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{form.title || '—'}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{sectors.find(s => s.id === form.sector)?.name || '—'}</p>
                  </div>
                  {form.featured && <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">⭐ مميز</span>}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: 'نوع العمل', value: jobTypes.find(t => t.value === form.type)?.label || '—' },
                    { label: 'الموقع', value: form.location || '—' },
                    { label: 'مستوى الخبرة', value: expLevels.find(l => l.value === form.experienceLevel)?.label || '—' },
                    { label: 'الراتب', value: form.salaryMin && form.salaryMax ? `${Number(form.salaryMin).toLocaleString()} - ${Number(form.salaryMax).toLocaleString()} AED` : 'غير محدد' },
                  ].map(f => (
                    <div key={f.label}>
                      <div className="text-xs text-gray-400 mb-0.5">{f.label}</div>
                      <div className="font-medium text-gray-800">{f.value}</div>
                    </div>
                  ))}
                </div>
                {form.description && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">الوصف</div>
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{form.description}</p>
                  </div>
                )}
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.map(s => <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg border border-blue-200">{s}</span>)}
                  </div>
                )}
              </div>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
                <strong>ملاحظة:</strong> سيتم مراجعة الإعلان خلال دقائق وسيظهر للباحثين فور الموافقة عليه.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                السابق
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                {isSubmitting ? 'جاري النشر...' : 'نشر الإعلان'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
