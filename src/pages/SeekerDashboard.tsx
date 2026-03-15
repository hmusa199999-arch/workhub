import React, { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Bookmark, Send, User, TrendingUp, CheckCircle, Clock, XCircle,
  Eye, ChevronLeft, AlertCircle, Save, X, Phone, MapPin, GraduationCap,
  Pencil, Camera,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import { mockJobs } from '../data/mockData';
import type { SeekerProfile, ApplicationStatus } from '../types';

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: ReactNode }> = {
  pending_approval: { label: 'انتظار موافقة الإدارة', color: 'bg-amber-100 text-amber-700', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  approved:         { label: 'تمت الموافقة',           color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  pending:          { label: 'قيد المراجعة',           color: 'bg-gray-100 text-gray-600',   icon: <Clock className="w-3.5 h-3.5" /> },
  reviewed:         { label: 'تمت المراجعة',           color: 'bg-red-100 text-red-700',     icon: <Eye className="w-3.5 h-3.5" /> },
  interview:        { label: 'مقابلة',                 color: 'bg-purple-100 text-purple-700',icon: <CheckCircle className="w-3.5 h-3.5" /> },
  accepted:         { label: 'مقبول ✓',               color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:         { label: 'مرفوض',                  color: 'bg-red-100 text-red-700',     icon: <XCircle className="w-3.5 h-3.5" /> },
};

const tabs: { id: 'overview' | 'applications' | 'saved' | 'profile'; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'نظرة عامة', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'applications', label: 'طلباتي',    icon: <Send className="w-4 h-4" /> },
  { id: 'saved',        label: 'محفوظة',    icon: <Bookmark className="w-4 h-4" /> },
  { id: 'profile',      label: 'ملفي',      icon: <User className="w-4 h-4" /> },
];

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-gray-900';

export default function SeekerDashboard() {
  const { user, updateProfile } = useAuth();
  const { getBySeeker } = useApplications();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'saved' | 'profile'>(() => {
    if (window.location.hash === '#profile') return 'profile';
    return 'overview';
  });
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || user.role !== 'seeker') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">غير مصرح بالوصول</p>
      </div>
    );
  }

  const seeker = user as SeekerProfile;

  // Profile form state
  const [form, setForm] = useState({
    name:       seeker.name       || '',
    email:      seeker.email      || '',
    phone:      seeker.phone      || '',
    title:      seeker.title      || '',
    bio:        seeker.bio        || '',
    location:   seeker.location   || '',
    experience: seeker.experience || '',
    education:  seeker.education  || '',
    skillsStr:  (seeker.skills || []).join('، '),
    avatar:     seeker.avatar     || '',
  });
  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    updateProfile({
      name:       form.name,
      email:      form.email,
      phone:      form.phone,
      avatar:     form.avatar,
      // seeker-specific fields via type cast
      ...({ title: form.title, bio: form.bio, location: form.location, experience: form.experience, education: form.education, skills: form.skillsStr.split(/[،,]/).map(s => s.trim()).filter(Boolean) } as Partial<SeekerProfile>),
    } as Partial<SeekerProfile>);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const myApps = getBySeeker(user.id);
  const savedJobs = mockJobs.filter(j => seeker.savedJobs?.includes(j.id));

  const pendingApproval = myApps.filter(a => a.status === 'pending_approval').length;
  const interviewCount  = myApps.filter(a => a.status === 'interview').length;
  const acceptedCount   = myApps.filter(a => a.status === 'accepted').length;

  const profileCompletion = [seeker.title, seeker.bio, seeker.phone, seeker.skills?.length, seeker.experience, seeker.education].filter(Boolean).length;
  const profilePercent = Math.round((profileCompletion / 6) * 100);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="gradient-hero text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {seeker.avatar ? (
              <img src={seeker.avatar} alt={seeker.name} className="w-16 h-16 rounded-2xl border-2 border-white/30 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center text-white text-2xl font-bold">
                {seeker.name[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">مرحباً، {seeker.name.split(' ')[0]}!</h1>
              <p className="text-red-200 text-sm mt-0.5">{seeker.title || 'أضف مسماك الوظيفي'}</p>
              <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-400/30">
                ✓ مجاني
              </span>
            </div>
            <div className="mr-auto hidden sm:block">
              <div className="text-right text-sm text-red-200 mb-1">اكتمال الملف</div>
              <div className="w-40 h-2 bg-gray-900/20 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${profilePercent}%` }} />
              </div>
              <div className="text-right text-xs text-red-300 mt-1">{profilePercent}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-700 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-800'}`}>
              {tab.icon}
              {tab.label}
              {tab.id === 'applications' && pendingApproval > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">{pendingApproval}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'إجمالي الطلبات',   value: myApps.length,     icon: <Send className="w-5 h-5 text-blue-600" />,   bg: 'bg-blue-50' },
                { label: 'انتظار الموافقة', value: pendingApproval,  icon: <AlertCircle className="w-5 h-5 text-amber-600" />,  bg: 'bg-amber-50' },
                { label: 'مقابلات',          value: interviewCount,   icon: <CheckCircle className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50' },
                { label: 'مقبولة',           value: acceptedCount,    icon: <CheckCircle className="w-5 h-5 text-green-600" />,  bg: 'bg-green-50' },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {pendingApproval > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800 text-sm">{pendingApproval} طلب بانتظار موافقة الإدارة</p>
                  <p className="text-amber-700 text-xs mt-1">سيتم إرسال طلبك للشركة بعد مراجعة الإدارة والموافقة عليه</p>
                </div>
              </div>
            )}

            {/* Quick profile completion nudge */}
            {profilePercent < 100 && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-blue-800 text-sm">ملفك مكتمل {profilePercent}% — أكمله لتزيد فرصك</p>
                  <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${profilePercent}%` }} />
                  </div>
                </div>
                <button onClick={() => { setActiveTab('profile'); setEditMode(true); }}
                  className="shrink-0 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                  أكمل ملفك
                </button>
              </div>
            )}

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-100">آخر الطلبات</h2>
                <button onClick={() => setActiveTab('applications')} className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                  عرض الكل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              {myApps.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Send className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لم تتقدم على أي وظيفة بعد</p>
                  <Link to="/jobs" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors">تصفح الوظائف</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myApps.slice(0, 4).map(app => (
                    <div key={app.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0 text-sm font-bold text-gray-400">
                        {app.companyName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{app.jobTitle}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{app.companyName} • {new Date(app.appliedAt).toLocaleDateString('ar-AE')}</div>
                      </div>
                      <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusConfig[app.status].color}`}>
                        {statusConfig[app.status].icon} {statusConfig[app.status].label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-100">وظائف مقترحة</h2>
                <Link to="/jobs" className="flex items-center gap-1 text-sm text-blue-600 font-medium">عرض الكل <ChevronLeft className="w-4 h-4" /></Link>
              </div>
              <div className="space-y-3">
                {mockJobs.slice(0, 3).map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {job.companyLogo ? <img src={job.companyLogo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} /> : <span className="font-bold text-gray-400 text-sm">{job.companyName[0]}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 truncate">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{job.companyName} • {job.location}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-700 shrink-0">{job.salaryMin?.toLocaleString()} AED</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {activeTab === 'applications' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-5">طلبات التقديم ({myApps.length})</h2>
            {myApps.length === 0 ? (
              <div className="text-center py-16">
                <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">لم تتقدم على أي وظيفة بعد</h3>
                <Link to="/jobs" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-block">تصفح الوظائف</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myApps.map(app => (
                  <div key={app.id} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 border rounded-2xl ${app.status === 'pending_approval' ? 'border-amber-200 bg-amber-50/30' : 'border-gray-700'}`}>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-700 flex items-center justify-center shrink-0 text-lg font-bold text-gray-400">
                      {app.companyName[0]}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-100">{app.jobTitle}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{app.companyName}</div>
                      <div className="text-xs text-gray-400 mt-1">تقدمت في: {new Date(app.appliedAt).toLocaleDateString('ar-AE')}</div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${statusConfig[app.status].color}`}>
                      {statusConfig[app.status].icon} {statusConfig[app.status].label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SAVED ── */}
        {activeTab === 'saved' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-5">الوظائف المحفوظة ({savedJobs.length})</h2>
            {savedJobs.length === 0 ? (
              <div className="text-center py-16">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">لا توجد وظائف محفوظة</h3>
                <Link to="/jobs" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors inline-block">تصفح الوظائف</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedJobs.map(job => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="flex items-start gap-3 p-4 border border-gray-700 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {job.companyLogo ? <img src={job.companyLogo} alt="" className="w-full h-full object-contain p-1" onError={e => { (e.target as HTMLImageElement).style.display='none'; }} /> : <Briefcase className="w-4 h-4 text-gray-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-sm truncate">{job.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{job.companyName}</div>
                      <div className="text-xs text-gray-400 mt-1">{job.location}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Profile header bar */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-100">الملف الشخصي</h2>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> تم الحفظ
                  </span>
                )}
                {editMode ? (
                  <>
                    <button onClick={() => { setEditMode(false); }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors">
                      <X className="w-3.5 h-3.5" /> إلغاء
                    </button>
                    <button onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                      <Save className="w-3.5 h-3.5" /> حفظ التغييرات
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 border border-blue-300 rounded-xl hover:bg-blue-50 transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> تعديل الملف
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar + name section */}
              <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                <div className="relative shrink-0">
                  {(editMode ? form.avatar : seeker.avatar) ? (
                    <img
                      src={editMode ? form.avatar : seeker.avatar}
                      alt="avatar"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-red-600 flex items-center justify-center text-white text-3xl font-bold">
                      {seeker.name[0]}
                    </div>
                  )}
                  {editMode && (
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-700 shadow-md">
                      <Camera className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setForm(prev => ({ ...prev, avatar: reader.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {editMode ? (
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">الاسم الكامل *</label>
                      <input value={form.name} onChange={f('name')} className={inputCls} placeholder="الاسم الكامل" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">المسمى الوظيفي</label>
                      <input value={form.title} onChange={f('title')} className={inputCls} placeholder="مثال: مطور برمجيات أول" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-bold text-gray-100">{seeker.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5">{seeker.title || <span className="text-gray-300 italic">أضف مسماك الوظيفي</span>}</p>
                    {(form.email || seeker.email) && <p className="text-gray-400 text-xs mt-1" dir="ltr">{form.email || seeker.email}</p>}
                    {seeker.phone && <p className="text-gray-400 text-xs mt-0.5" dir="ltr">{seeker.phone}</p>}
                  </div>
                )}
              </div>

              {/* Contact & personal info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <Phone className="w-3.5 h-3.5" /> رقم الهاتف
                  </label>
                  {editMode ? (
                    <input
                      value={form.phone || ''}
                      dir="ltr"
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="ضع رمز الدولة ثم الرقم"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-800">
                      {seeker.phone || <span className="text-gray-300 italic">—</span>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> الموقع
                  </label>
                  {editMode ? (
                    <input value={form.location} onChange={f('location')} className={inputCls} placeholder="مثال: دبي" />
                  ) : (
                    <div className="text-sm font-medium text-gray-800">{seeker.location || <span className="text-gray-300 italic">—</span>}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <Briefcase className="w-3.5 h-3.5" /> الخبرة
                  </label>
                  {editMode ? (
                    <input value={form.experience} onChange={f('experience')} className={inputCls} placeholder="مثال: 3 سنوات" />
                  ) : (
                    <div className="text-sm font-medium text-gray-800">{seeker.experience || <span className="text-gray-300 italic">—</span>}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <GraduationCap className="w-3.5 h-3.5" /> التعليم
                  </label>
                  {editMode ? (
                    <input value={form.education} onChange={f('education')} className={inputCls} placeholder="مثال: بكالوريوس هندسة" />
                  ) : (
                    <div className="text-sm font-medium text-gray-800">{seeker.education || <span className="text-gray-300 italic">—</span>}</div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">نبذة تعريفية</label>
                {editMode ? (
                  <textarea value={form.bio} onChange={f('bio')} rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="اكتب نبذة مختصرة عن نفسك وخبراتك..." />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed">{seeker.bio || <span className="text-gray-300 italic">أضف نبذة تعريفية</span>}</div>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">المهارات</label>
                {editMode ? (
                  <>
                    <input value={form.skillsStr} onChange={f('skillsStr')} className={inputCls}
                      placeholder="مثال: React، TypeScript، Node.js (افصل بفواصل)" />
                    <p className="text-xs text-gray-400 mt-1">افصل بين المهارات بفاصلة أو فاصلة عربية</p>
                  </>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {seeker.skills?.length ? seeker.skills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200">{s}</span>
                    )) : <span className="text-gray-300 italic text-sm">أضف مهاراتك</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
