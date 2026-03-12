import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, Bookmark, Star } from 'lucide-react';
import type { Job } from '../types';

const typeLabels: Record<string, string> = {
  'full-time': 'دوام كامل',
  'part-time': 'دوام جزئي',
  'remote': 'عن بُعد',
  'freelance': 'مستقل',
  'internship': 'تدريب',
};

const typeColors: Record<string, string> = {
  'full-time':  'bg-green-900/40 text-green-400 border border-green-800/40',
  'part-time':  'bg-amber-900/40 text-amber-400 border border-amber-800/40',
  'remote':     'bg-red-900/40 text-red-400 border border-red-800/40',
  'freelance':  'bg-rose-900/40 text-rose-400 border border-rose-800/40',
  'internship': 'bg-orange-900/40 text-orange-400 border border-orange-800/40',
};

const expLabels: Record<string, string> = {
  entry: 'مبتدئ',
  mid: 'متوسط',
  senior: 'أول',
  lead: 'قيادي',
  executive: 'تنفيذي',
};

interface Props {
  job: Job;
  saved?: boolean;
  onSave?: (jobId: string) => void;
}

export default function JobCard({ job, saved = false, onSave }: Props) {
  const postedDays = Math.floor((Date.now() - new Date(job.postedAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className={`bg-gray-900 rounded-2xl border ${job.featured ? 'border-red-700/40' : 'border-gray-800'} p-5 card-hover group relative hover:border-red-600/30 transition-all duration-300`}>
      {job.featured && (
        <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-500/10 text-amber-400 text-xs font-bold px-2 py-1 rounded-full border border-amber-500/20">
          <Star className="w-3 h-3 fill-amber-400" />
          مميز
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-700">
          {job.companyLogo ? (
            <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain p-1" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          ) : (
            <span className="text-xl font-black text-gray-500">{job.companyName[0]}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.id}`} className="block font-black text-gray-200 text-base hover:text-red-400 transition-colors truncate">
            {job.title}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{job.companyName}</p>
        </div>
        {onSave && (
          <button
            onClick={() => onSave(job.id)}
            className={`p-2 rounded-lg transition-colors ${saved ? 'text-red-400 bg-red-500/10' : 'text-gray-600 hover:bg-gray-800'}`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-red-400' : ''}`} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[job.type]}`}>
          {typeLabels[job.type]}
        </span>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
          {expLabels[job.experienceLevel]}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 mb-4">
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{job.applicants} متقدم</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{postedDays === 0 ? 'اليوم' : `منذ ${postedDays} يوم`}</span>
      </div>

      {(job.salaryMin || job.salaryMax) && (
        <div className="mb-4 text-sm font-black text-red-400">
          {job.salaryMin && job.salaryMax
            ? `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${job.currency || 'AED'}`
            : job.salaryMin ? `يبدأ من ${job.salaryMin.toLocaleString()} ${job.currency || 'AED'}` : ''}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills.slice(0, 3).map(skill => (
          <span key={skill} className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-lg border border-gray-700">
            {skill}
          </span>
        ))}
        {job.skills.length > 3 && (
          <span className="text-xs px-2 py-1 bg-gray-800 text-gray-600 rounded-lg border border-gray-700">
            +{job.skills.length - 3}
          </span>
        )}
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="block w-full text-center py-2.5 px-4 bg-gradient-to-l from-red-600 to-red-500 text-white text-sm font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-sm shadow-red-500/20 hover:shadow-red-500/30"
      >
        عرض التفاصيل
      </Link>
    </div>
  );
}
