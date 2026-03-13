import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Trash2, Mail } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <section className="relative py-16 px-4 border-b border-red-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-gray-950" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-4">
            <Shield className="w-3.5 h-3.5" /> سياسة الخصوصية
          </div>
          <h1 className="text-4xl font-black text-white mb-4">سياسة الخصوصية</h1>
          <p className="text-gray-400">آخر تحديث: مارس 2026</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-10">

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">ما المعلومات التي نجمعها؟</h2>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> الاسم واسم المستخدم عند التسجيل</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> رقم الهاتف والبريد الإلكتروني (اختياري)</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> تفاصيل الإعلانات التي تنشرها</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> بيانات الاستخدام (الصفحات المزارة، وقت الاستخدام)</li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">كيف نحمي بياناتك؟</h2>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> نستخدم Firebase من Google كقاعدة بيانات آمنة ومشفرة</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> لا نبيع أو نشارك بياناتك مع أطراف ثالثة لأغراض تجارية</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> الاتصال بالموقع مشفر بالكامل عبر HTTPS</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> نحتفظ فقط بالبيانات الضرورية لتشغيل الخدمة</li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">حقوقك</h2>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> يحق لك طلب حذف حسابك وجميع بياناتك</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> يمكنك تعديل أو حذف إعلاناتك في أي وقت</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> يحق لك الاطلاع على البيانات المحفوظة عنك</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span> للتواصل بشأن بياناتك: hamad2001ggh@gmail.com</li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">التواصل معنا</h2>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">إذا كان لديك أي استفسار حول سياسة الخصوصية أو بياناتك الشخصية، يرجى التواصل معنا:</p>
            <a href="mailto:hamad2001ggh@gmail.com" className="text-red-400 hover:text-red-300 font-semibold text-sm">hamad2001ggh@gmail.com</a>
          </div>

          <div className="text-center">
            <Link to="/" className="text-gray-500 hover:text-red-400 text-sm transition-colors">← العودة للرئيسية</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
