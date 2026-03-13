import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, Bookmark, Share2, ChevronRight, CheckCircle, Send, Loader2, Building2, ExternalLink, AlertCircle } from 'lucide-react';
import { mockJobs } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import type { SeekerProfile } from '../types';

const typeLabels: Record<string, string> = {
  'full-time': 'دوام كامل',
  'part-time': 'دوام جزئي',
  'remote': 'عن بُعد',
  'freelance': 'مستقل',
  'internship': 'تدريب',
};

const expLabels: Record<string, string> = {
  entry: 'مبتدئ',
  mid: 'متوسط',
  senior: 'أول',
  lead: 'قيادي',
  executive: 'تنفيذي',
};

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { submitApplication, getBySeeker } = useApplications();
  const navigate = useNavigate();
  const job = mockJobs.find(j => j.id === id);

  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😕</div>
        <h2 className="text-xl font-bold text-gray-700">الوظيفة غير موجودة</h2>
        <Link to="/jobs" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
          تصفح الوظائف
        </Link>
      </div>
    );
  }

  // Check if already applied
  const myApps = user ? getBySeeker(user.id) : [];
  const existingApp = myApps.find(a => a.jobId === job.id);
  const alreadyApplied = !!existingApp || submitted;

  const postedDays = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24));
  const relatedJobs = mockJobs.filter(j => j.sector === job.sector && j.id !== job.id).slice(0, 3);

  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    await new Promise(r => setTimeout(r, 1200));

    const seeker = user as SeekerProfile;
    submitApplication({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      seekerId: user.id,
      seekerName: user.name,
      seekerEmail: user.email,
      seekerPhone: seeker.phone || user.phone,
      coverLetter,
    });

    setApplying(false);
    setSubmitted(true);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">الرئيسية</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/jobs" className="hover:text-gray-700">الوظائف</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{job.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center border border-gray-700 shrink-0 overflow-hidden">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-2" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="text-2xl font-bold text-gray-400">{job.companyName[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-100 mb-1">{job.title}</h1>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Building2 className="w-4 h-4" />
                    <span>{job.companyName}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => setSaved(!saved)}
                    className={`p-2.5 rounded-xl border transition-colors ${saved ? 'border-blue-300 bg-blue-50 text-blue-600' : 'border-gray-700 text-gray-500 hover:bg-gray-800'}`}>
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-blue-600' : ''}`} />
                  </button>
                  <button className="p-2.5 rounded-xl border border-gray-700 text-gray-500 hover:bg-gray-800 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { icon: <MapPin className="w-4 h-4" />, label: job.location },
                  { icon: <Clock className="w-4 h-4" />, label: typeLabels[job.type] },
                  { icon: <Users className="w-4 h-4" />, label: `${job.applicants} متقدم` },
                  { icon: <Clock className="w-4 h-4" />, label: postedDays === 0 ? 'اليوم' : `منذ ${postedDays} يوم` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
                    <span className="text-blue-500">{item.icon}</span>
                    {item.label}
                  </div>
                ))}
              </div>

              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2 text-lg font-bold text-gray-100 mb-5">
                  <span className="text-green-600">💰</span>
                  {job.salaryMin && job.salaryMax
                    ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'AED'} / شهرياً`
                    : ''}
                </div>
              )}

              {/* Apply Status */}
              {alreadyApplied ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
                    <div>
                      <p className="font-bold text-sm">طلبك قيد مراجعة الإدارة</p>
                      <p className="text-xs text-amber-700 mt-0.5">بعد الموافقة عليه سيظهر في لوحتك ويُرسل للشركة</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>انتظار موافقة الإدارة</span>
                    </div>
                    <span>←</span>
                    <span className="text-gray-300">مراجعة الشركة</span>
                    <span>←</span>
                    <span className="text-gray-300">النتيجة</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => user ? setShowModal(true) : navigate('/login')}
                  className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-base"
                >
                  {user ? 'تقدم للوظيفة الآن — مجاناً' : 'سجّل دخولك للتقديم'}
                </button>
              )}
            </div>

            {/* Description */}
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-100 mb-4">وصف الوظيفة</h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-100 mb-4">المتطلبات</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-100 mb-4">المهام والمسؤوليات</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {resp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-gray-100 mb-4">المهارات المطلوبة</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-xl border border-blue-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
              <h3 className="font-bold text-gray-100 mb-4">عن الشركة</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-700 overflow-hidden">
                  {job.companyLogo ? (
                    <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-1.5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="font-bold text-gray-400">{job.companyName[0]}</span>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-gray-100 text-sm">{job.companyName}</div>
                  <div className="text-xs text-gray-500">{job.location}</div>
                </div>
              </div>
              <a href="#" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                <ExternalLink className="w-3.5 h-3.5" />
                زيارة الموقع
              </a>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
              <h3 className="font-bold text-gray-100 mb-4">تفاصيل الوظيفة</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'نوع العمل', value: typeLabels[job.type] },
                  { label: 'مستوى الخبرة', value: expLabels[job.experienceLevel] },
                  { label: 'تاريخ النشر', value: new Date(job.postedAt).toLocaleDateString('ar-AE') },
                  ...(job.deadline ? [{ label: 'آخر موعد', value: new Date(job.deadline).toLocaleDateString('ar-AE') }] : []),
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-blue-900 mb-3 text-sm">كيف يعمل التقديم؟</h3>
              <div className="space-y-2.5">
                {[
                  { step: '1', text: 'تقدم بطلبك مجاناً' },
                  { step: '2', text: 'تراجع الإدارة طلبك' },
                  { step: '3', text: 'يُرسل للشركة بعد الموافقة' },
                  { step: '4', text: 'تتلقى رد الشركة' },
                ].map(s => (
                  <div key={s.step} className="flex items-center gap-2.5 text-xs text-blue-800">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">{s.step}</span>
                    {s.text}
                  </div>
                ))}
              </div>
            </div>

            {relatedJobs.length > 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
                <h3 className="font-bold text-gray-100 mb-4">وظائف مشابهة</h3>
                <div className="space-y-3">
                  {relatedJobs.map(rj => (
                    <Link key={rj.id} to={`/jobs/${rj.id}`} className="block p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <div className="font-semibold text-gray-800 text-sm">{rj.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{rj.companyName}</div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-100 mb-1">التقديم على: {job.title}</h2>
            <p className="text-sm text-gray-500 mb-1">{job.companyName}</p>
            <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              سيُراجع طلبك من الإدارة أولاً قبل إرساله للشركة
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">رسالة تقديمية (اختياري)</label>
              <textarea rows={4} value={coverLetter} onChange={e => setCoverLetter(e.target.value)}
                placeholder="اكتب رسالة تعريفية قصيرة تبرز فيها مهاراتك وسبب رغبتك في هذه الوظيفة..."
                className="w-full px-4 py-3 rounded-xl border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-700 text-gray-700 font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                إلغاء
              </button>
              <button onClick={handleApply} disabled={applying}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {applying ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
