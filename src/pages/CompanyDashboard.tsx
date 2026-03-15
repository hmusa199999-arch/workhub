import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Users, TrendingUp, Eye, ChevronLeft, CheckCircle, Building2, BarChart3, Save, X, Pencil, Phone, MapPin, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApplications } from '../context/ApplicationsContext';
import { mockJobs } from '../data/mockData';
import type { CompanyProfile, Application } from '../types';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm bg-gray-900';

const tabs: { id: 'overview' | 'jobs' | 'applicants' | 'profile'; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'نظرة عامة',  icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'jobs',       label: 'وظائفي',     icon: <Briefcase className="w-4 h-4" /> },
  { id: 'applicants', label: 'المتقدمون',  icon: <Users className="w-4 h-4" /> },
  { id: 'profile',    label: 'ملف الشركة', icon: <Building2 className="w-4 h-4" /> },
];

export default function CompanyDashboard() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'applicants' | 'profile'>(() => {
    if (window.location.hash === '#profile') return 'profile';
    return 'overview';
  });
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user || user.role !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">غير مصرح بالوصول</p>
      </div>
    );
  }

  const { applications } = useApplications();
  const company = user as CompanyProfile;

  // Profile form
  const [form, setForm] = useState({
    companyName: company.companyName || '',
    phone:       company.phone       || '',
    industry:    company.industry    || '',
    size:        company.size        || '',
    website:     company.website     || '',
    location:    company.location    || '',
    description: company.description || '',
  });
  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = () => {
    updateProfile({ ...form } as Partial<CompanyProfile>);
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  const companyJobs = mockJobs.filter(j => j.companyId === 'c_demo' || j.companyId === 'c4').slice(0, 3);
  const totalApplicants = companyJobs.reduce((sum, j) => sum + j.applicants, 0);
  const companyJobIds = companyJobs.map(j => j.id);
  const allApplications: Application[] = applications.filter(
    a => companyJobIds.includes(a.jobId) && a.status !== 'pending_approval'
  );

  const statsData = [
    { label: 'وظائف نشطة', value: companyJobs.length, icon: <Briefcase className="w-5 h-5 text-red-500" />, bg: 'bg-red-50', change: '+2 هذا الشهر' },
    { label: 'إجمالي المتقدمين', value: totalApplicants, icon: <Users className="w-5 h-5 text-purple-600" />, bg: 'bg-purple-50', change: `+${Math.round(totalApplicants * 0.2)} هذا الأسبوع` },
    { label: 'مشاهدات الوظائف', value: '4,320', icon: <Eye className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', change: '+15%' },
    { label: 'معدل التقديم', value: '8.3%', icon: <BarChart3 className="w-5 h-5 text-amber-600" />, bg: 'bg-amber-50', change: '+1.2%' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="gradient-hero text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-900/10 flex items-center justify-center text-3xl border border-white/20">
                🏢
              </div>
              <div>
                <h1 className="text-2xl font-bold">{company.companyName || company.name}</h1>
                <div className="flex items-center gap-2 mt-1">
          <p className="text-red-200 text-sm">{company.industry || 'تقنية المعلومات'}</p>
                  {company.verified && (
                    <span className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-400/30">
                      <CheckCircle className="w-3 h-3" />
                      موثقة
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full border border-green-400/30">
                  ✓ مجاني
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/post-job')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              نشر وظيفة
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-700 mb-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-800'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statsData.map(stat => (
                <div key={stat.label} className="bg-gray-900 rounded-2xl border border-gray-700 p-5">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">{stat.change}</div>
                </div>
              ))}
            </div>

            {/* Active Jobs */}
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-100">الوظائف النشطة</h2>
                <button onClick={() => setActiveTab('jobs')} className="flex items-center gap-1 text-sm text-red-600 font-medium hover:gap-2 transition-all">
                  عرض الكل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              {companyJobs.length === 0 ? (
                <div className="text-center py-10">
                  <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500">لا توجد وظائف نشطة</p>
                  <button onClick={() => navigate('/post-job')} className="mt-3 px-5 py-2 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors">
                    نشر وظيفة
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyJobs.map(job => (
                    <div key={job.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <Link to={`/jobs/${job.id}`} className="font-semibold text-gray-800 hover:text-red-600 transition-colors truncate block text-sm">{job.title}</Link>
                        <div className="text-xs text-gray-500 mt-0.5">{job.location} • {job.type === 'full-time' ? 'دوام كامل' : job.type}</div>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-red-500" />
                        {job.applicants} متقدم
                      </div>
                      <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-medium">نشط</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Applicants */}
            <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-100">آخر المتقدمين</h2>
                <button onClick={() => setActiveTab('applicants')} className="flex items-center gap-1 text-sm text-red-600 font-medium hover:gap-2 transition-all">
                  عرض الكل <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
              {allApplications.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  لا توجد طلبات موافق عليها بعد
                </div>
              ) : (
                <div className="space-y-3">
                  {allApplications.slice(0, 3).map(app => (
                    <div key={app.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 font-bold shrink-0">
                        {app.seekerName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{app.seekerName}</div>
                        <div className="text-xs text-gray-500">{app.seekerEmail}</div>
                      </div>
                      <div className="text-xs text-gray-500">{app.jobTitle}</div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg hover:bg-green-200 transition-colors">قبول</button>
                        <button className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-medium rounded-lg hover:bg-red-200 transition-colors">رفض</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">وظائفي ({companyJobs.length})</h2>
              <button onClick={() => navigate('/post-job')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                نشر وظيفة جديدة
              </button>
            </div>
            {companyJobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-600 mb-2">لا توجد وظائف بعد</h3>
                <button onClick={() => navigate('/post-job')} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  نشر أول وظيفة
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {companyJobs.map(job => (
                  <div key={job.id} className="border border-gray-700 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <Link to={`/jobs/${job.id}`} className="font-bold text-gray-100 hover:text-blue-600 transition-colors">{job.title}</Link>
                        <div className="text-sm text-gray-500 mt-0.5">{job.location}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${job.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {job.isActive ? 'نشط' : 'منتهي'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{job.applicants} متقدم</span>
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{job.applicants * 12} مشاهدة</span>
                      <span>نُشرت: {new Date(job.postedAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Link to={`/jobs/${job.id}`} className="px-4 py-2 text-sm font-medium border border-gray-700 text-gray-700 rounded-xl hover:bg-gray-800 transition-colors">عرض</Link>
                      <button className="px-4 py-2 text-sm font-medium bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">تعديل</button>
                      <button className="px-4 py-2 text-sm font-medium bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">إيقاف</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applicants Tab */}
        {activeTab === 'applicants' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-5">المتقدمون ({allApplications.length})</h2>
            {allApplications.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>لا توجد طلبات موافق عليها بعد</p>
                <p className="text-xs mt-2">تظهر الطلبات هنا بعد مراجعة الإدارة والموافقة عليها</p>
              </div>
            ) : (
            <div className="space-y-4">
              {allApplications.map(app => (
                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border border-gray-700 rounded-2xl hover:border-red-200 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 text-xl font-bold shrink-0">
                    {app.seekerName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-100">{app.seekerName}</div>
                    <div className="text-sm text-gray-500">{app.seekerEmail}</div>
                    <div className="text-xs text-gray-400 mt-1">تقدّم على: {app.jobTitle} • {new Date(app.appliedAt).toLocaleDateString('ar-AE')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-xs font-semibold bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">عرض الملف</button>
                    <button className="px-3 py-2 text-xs font-semibold bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">قبول</button>
                    <button className="px-3 py-2 text-xs font-semibold bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">مقابلة</button>
                    <button className="px-3 py-2 text-xs font-semibold bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">رفض</button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Header bar */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-100">ملف الشركة</h2>
              <div className="flex items-center gap-2">
                {saved && (
                  <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> تم الحفظ
                  </span>
                )}
                {editMode ? (
                  <>
                    <button onClick={() => setEditMode(false)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-700 rounded-xl hover:bg-gray-800">
                      <X className="w-3.5 h-3.5" /> إلغاء
                    </button>
                    <button onClick={handleSave}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700">
                      <Save className="w-3.5 h-3.5" /> حفظ التغييرات
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-xl hover:bg-red-50">
                    <Pencil className="w-3.5 h-3.5" /> تعديل الملف
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Logo + name */}
              <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-red-100 flex items-center justify-center text-4xl shrink-0">🏢</div>
                <div className="flex-1">
                  {editMode ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">اسم الشركة *</label>
                        <input value={form.companyName} onChange={f('companyName')} className={inputCls} placeholder="اسم الشركة" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">القطاع</label>
                        <select value={form.industry} onChange={f('industry')} className={inputCls}>
                          <option value="">اختر القطاع...</option>
                          {['تقنية المعلومات','تمويل ومصرفية','صحة وطب','تعليم','تجزئة','عقارات','هندسة','خدمات','سياحة وضيافة','أخرى'].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-100">{company.companyName}</h3>
                        {company.verified && <CheckCircle className="w-5 h-5 text-red-500 fill-red-500" />}
                      </div>
                      <p className="text-gray-500 text-sm mt-0.5">{company.industry}</p>
                      <p className="text-gray-400 text-xs mt-1">{company.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & details */}
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
                    <div className="text-sm font-medium text-gray-800">{company.phone || '—'}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> الموقع
                  </label>
                  {editMode ? (
                    <input value={form.location} onChange={f('location')} className={inputCls} placeholder="مثال: دبي، الإمارات" />
                  ) : (
                    <div className="text-sm font-medium text-gray-800">{company.location || '—'}</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <Users className="w-3.5 h-3.5" /> حجم الشركة
                  </label>
                  {editMode ? (
                    <select value={form.size} onChange={f('size')} className={inputCls}>
                      <option value="">اختر...</option>
                      {['1-10','11-50','51-100','100-500','500-1000','1000+'].map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="text-sm font-medium text-gray-800">{company.size || '—'} موظف</div>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-2">
                    <Globe className="w-3.5 h-3.5" /> الموقع الإلكتروني
                  </label>
                  {editMode ? (
                    <input value={form.website} onChange={f('website')} className={inputCls} placeholder="https://example.ae" dir="ltr" />
                  ) : (
                    company.website
                      ? <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-600 hover:underline">{company.website}</a>
                      : <div className="text-sm font-medium text-gray-800">—</div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">نبذة عن الشركة</label>
                {editMode ? (
                  <textarea value={form.description} onChange={f('description')} rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="اكتب وصفاً موجزاً عن نشاط الشركة..." />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed">{company.description || <span className="text-gray-300 italic">أضف نبذة عن شركتك</span>}</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
