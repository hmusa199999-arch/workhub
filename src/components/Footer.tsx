import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-red-900/20 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/40">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">work<span className="text-red-400">1m</span></span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              منصة التوظيف الرائدة التي تربط أفضل المواهب بأبرز الشركات في العالم العربي.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded-full inline-block" />
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/jobs" className="hover:text-red-400 transition-colors">تصفح الوظائف</Link></li>
              <li><Link to="/sectors" className="hover:text-red-400 transition-colors">القطاعات</Link></li>
              <li><Link to="/pricing" className="hover:text-red-400 transition-colors">الأسعار والاشتراكات</Link></li>
              <li><Link to="/register" className="hover:text-red-400 transition-colors">إنشاء حساب</Link></li>
              <li><Link to="/post-job" className="hover:text-red-400 transition-colors">أعلن عن وظيفة</Link></li>
            </ul>
          </div>

          {/* For Companies */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded-full inline-block" />
              للشركات
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/register?role=company" className="hover:text-red-400 transition-colors">تسجيل شركة</Link></li>
              <li><Link to="/post-job" className="hover:text-red-400 transition-colors">نشر وظيفة</Link></li>
              <li><Link to="/pricing" className="hover:text-red-400 transition-colors">باقات التوظيف</Link></li>
              <li><a href="#" className="hover:text-red-400 transition-colors">الدعم الفني</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="w-1 h-4 bg-red-500 rounded-full inline-block" />
              تواصل معنا
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-red-400 shrink-0" />
                <span>hamad2001ggh@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-red-400 shrink-0" />
                <span dir="ltr">+971 54 339 3797</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>دبي، الإمارات العربية المتحدة</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-red-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <p>© 2026 work1m. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-red-400 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-red-400 transition-colors">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
