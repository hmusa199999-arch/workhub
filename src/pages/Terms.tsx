import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <section className="relative py-16 px-4 border-b border-red-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-gray-950" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-4">
            <FileText className="w-3.5 h-3.5" /> شروط الاستخدام
          </div>
          <h1 className="text-4xl font-black text-white mb-4">شروط الاستخدام</h1>
          <p className="text-gray-400">آخر تحديث: مارس 2026</p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          <div className="bg-amber-900/20 border border-amber-700/40 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm leading-relaxed">
                باستخدامك لموقع work1m، فإنك توافق على الالتزام بهذه الشروط والأحكام. يُرجى قراءتها بعناية.
              </p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">ما يُسمح به</h2>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> نشر إعلانات حقيقية وصادقة للوظائف والسلع والخدمات</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> التواصل مع المعلنين الآخرين بشكل لائق واحترافي</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> إنشاء حساب شخصي واحد لكل مستخدم</li>
              <li className="flex items-start gap-2"><span className="text-green-400 mt-1">✓</span> الإبلاغ عن الإعلانات المخالفة للإدارة</li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-black text-white">ما لا يُسمح به</h2>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> نشر إعلانات وهمية أو محتوى مضلل</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> نشر محتوى مسيء أو مخالف للقوانين الإماراتية والعربية</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> محاولة اختراق الموقع أو انتهاك أمانه</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> جمع بيانات المستخدمين الآخرين بدون إذن</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> إنشاء حسابات متعددة للتحايل على السياسات</li>
              <li className="flex items-start gap-2"><span className="text-red-400 mt-1">✗</span> نشر إعلانات للمنتجات المحظورة أو غير القانونية</li>
            </ul>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-4">المسؤولية والإخلاء</h2>
            <div className="space-y-3 text-gray-400 text-sm leading-relaxed">
              <p>تعمل work1m كوسيط بين المعلنين والمستخدمين، ولا تتحمل المسؤولية عن صحة الإعلانات أو نتائج التعاملات بين المستخدمين.</p>
              <p>نحتفظ بحق إزالة أي إعلان يخالف سياساتنا دون إشعار مسبق.</p>
              <p>نحتفظ بحق تعديل شروط الاستخدام في أي وقت، وسيتم إشعار المستخدمين بأي تغييرات جوهرية.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-4">القانون المطبق</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة، وتختص محاكم دبي بالفصل في أي نزاعات تنشأ عنها.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-3">للاستفسار</h2>
            <p className="text-gray-400 text-sm mb-3">للاستفسار عن هذه الشروط أو تقديم شكوى:</p>
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
