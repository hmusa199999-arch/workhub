import type { Job, Sector } from '../types';

// القطاعات تُستخدم فقط كتصنيفات، يمكن أن تبقى لكن بدون أرقام وظائف ثابتة
export const sectors: Sector[] = [
  { id: 'tech',          name: 'تقنية المعلومات',       icon: '💻', jobCount: 0 },
  { id: 'finance',       name: 'المال والأعمال',        icon: '💼', jobCount: 0 },
  { id: 'health',        name: 'الرعاية الصحية',        icon: '🏥', jobCount: 0 },
  { id: 'education',     name: 'التعليم',               icon: '🎓', jobCount: 0 },
  { id: 'engineering',   name: 'الهندسة',               icon: '⚙️', jobCount: 0 },
  { id: 'marketing',     name: 'التسويق والإعلان',      icon: '📣', jobCount: 0 },
  { id: 'legal',         name: 'القانون',               icon: '⚖️', jobCount: 0 },
  { id: 'hospitality',   name: 'الضيافة والسياحة',      icon: '🏨', jobCount: 0 },
  { id: 'construction',  name: 'البناء والتشييد',       icon: '🏗️', jobCount: 0 },
  { id: 'media',         name: 'الإعلام والإنتاج',      icon: '🎬', jobCount: 0 },
];

// لا توجد وظائف افتراضية في النسخة الحقيقية
export const mockJobs: Job[] = [];

