import { Link } from 'react-router-dom';
import { sectors } from '../data/mockData';
import { TrendingUp } from 'lucide-react';

export default function Sectors() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="gradient-hero text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">القطاعات المهنية</h1>
        <p className="text-red-200">تصفح الوظائف المتاحة حسب قطاع العمل</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sectors.map(sector => (
            <Link
              key={sector.id}
              to={`/jobs?sector=${sector.id}`}
              className="bg-white rounded-2xl border border-gray-200 p-7 card-hover group"
            >
              <div className="text-5xl mb-4">{sector.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{sector.name}</h3>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 text-red-400" />
                {sector.jobCount} وظيفة متاحة
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
