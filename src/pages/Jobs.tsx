import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import JobCard from '../components/JobCard';
import { mockJobs, sectors } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import type { JobType, ExperienceLevel } from '../types';

const typeOptions: { value: JobType | ''; label: string }[] = [
  { value: '', label: 'جميع أنواع العمل' },
  { value: 'full-time', label: 'دوام كامل' },
  { value: 'part-time', label: 'دوام جزئي' },
  { value: 'remote', label: 'عن بُعد' },
  { value: 'freelance', label: 'مستقل' },
  { value: 'internship', label: 'تدريب' },
];

const expOptions: { value: ExperienceLevel | ''; label: string }[] = [
  { value: '', label: 'جميع المستويات' },
  { value: 'entry', label: 'مبتدئ' },
  { value: 'mid', label: 'متوسط' },
  { value: 'senior', label: 'أول' },
  { value: 'lead', label: 'قيادي' },
  { value: 'executive', label: 'تنفيذي' },
];

const sortOptions = [
  { value: 'date', label: 'الأحدث' },
  { value: 'applicants', label: 'الأكثر تقديماً' },
  { value: 'salary', label: 'الراتب' },
];

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [sector, setSector] = useState(searchParams.get('sector') || '');
  const [type, setType] = useState<JobType | ''>('');
  const [exp, setExp] = useState<ExperienceLevel | ''>('');
  const [sort, setSort] = useState('date');
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState<string[]>(
    user?.role === 'seeker' ? (user as { savedJobs?: string[] }).savedJobs || [] : []
  );

  const filtered = useMemo(() => {
    let jobs = [...mockJobs];
    if (query) jobs = jobs.filter(j => j.title.toLowerCase().includes(query.toLowerCase()) || j.companyName.toLowerCase().includes(query.toLowerCase()) || j.skills.some(s => s.toLowerCase().includes(query.toLowerCase())));
    if (location) jobs = jobs.filter(j => j.location.includes(location));
    if (sector) jobs = jobs.filter(j => j.sector === sector);
    if (type) jobs = jobs.filter(j => j.type === type);
    if (exp) jobs = jobs.filter(j => j.experienceLevel === exp);

    jobs.sort((a, b) => {
      if (sort === 'date') return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
      if (sort === 'applicants') return b.applicants - a.applicants;
      if (sort === 'salary') return (b.salaryMax || 0) - (a.salaryMax || 0);
      return 0;
    });
    return jobs;
  }, [query, location, sector, type, exp, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (location) p.set('location', location);
    if (sector) p.set('sector', sector);
    setSearchParams(p);
  };

  const toggleSave = (jobId: string) => {
    setSavedJobs(prev => prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]);
  };

  const clearFilters = () => {
    setQuery(''); setLocation(''); setSector(''); setType(''); setExp('');
    setSearchParams({});
  };

  const hasFilters = query || location || sector || type || exp;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Search Header */}
      <div className="bg-gray-900 border-b border-red-900/30 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl">
              <Search className="w-4 h-4 text-red-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="المسمى الوظيفي أو المهارة أو الشركة..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
              {query && <button type="button" onClick={() => setQuery('')}><X className="w-4 h-4 text-gray-500" /></button>}
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl sm:w-52">
              <MapPin className="w-4 h-4 text-red-400 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="الدولة أو المدينة..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
              />
            </div>
            <button type="submit" className="px-6 py-2.5 bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-sm shadow-red-500/20">
              بحث
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors ${showFilters ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلاتر
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { value: sector, onChange: (v: string) => setSector(v), options: [{ value: '', label: 'جميع القطاعات' }, ...sectors.map(s => ({ value: s.id, label: s.name }))] },
                { value: type, onChange: (v: string) => setType(v as JobType | ''), options: typeOptions.map(o => ({ value: o.value, label: o.label })) },
                { value: exp, onChange: (v: string) => setExp(v as ExperienceLevel | ''), options: expOptions.map(o => ({ value: o.value, label: o.label })) },
                { value: sort, onChange: (v: string) => setSort(v), options: sortOptions.map(o => ({ value: o.value, label: `ترتيب: ${o.label}` })) },
              ].map((sel, i) => (
                <div key={i} className="relative">
                  <select value={sel.value} onChange={e => sel.onChange(e.target.value)} className="w-full appearance-none px-3 py-2 text-sm border border-gray-700 rounded-xl bg-gray-800 text-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none">
                    {sel.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  <ChevronDown className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sectors */}
      <div className="bg-gray-900/80 border-b border-red-900/20 px-4 py-5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">تصفح حسب القطاع</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => { setSector(''); setSearchParams({}); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all shrink-0 ${!sector ? 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-500/20' : 'border-gray-700 text-gray-400 hover:border-red-500/40 bg-gray-800'}`}>
              🏷️ الكل
            </button>
            {sectors.map(s => (
              <button key={s.id}
                onClick={() => { setSector(s.id); setSearchParams({ sector: s.id }); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap border-2 transition-all shrink-0 ${sector === s.id ? 'bg-red-600 border-red-600 text-white shadow-sm shadow-red-500/20' : 'border-gray-700 text-gray-400 hover:border-red-500/40 bg-gray-800'}`}>
                <span>{s.icon}</span>
                {s.name}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${sector === s.id ? 'bg-white/20 text-white' : 'bg-gray-700 text-gray-500'}`}>
                  {s.jobCount}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <span className="font-black text-white text-lg">{filtered.length}</span>
            <span className="text-gray-500 text-sm mr-1">وظيفة متاحة</span>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 transition-colors">
              <X className="w-4 h-4" />
              مسح الفلاتر
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-gray-400 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-600 text-sm">حاول تغيير كلمات البحث أو الفلاتر</p>
            <button onClick={clearFilters} className="mt-4 px-6 py-2.5 bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all">
              مسح البحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(job => (
              <JobCard
                key={job.id}
                job={job}
                saved={savedJobs.includes(job.id)}
                onSave={user ? toggleSave : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
