import { Link } from 'react-router-dom';
import { CheckCircle, Zap, ArrowLeft, Building2, User, Star } from 'lucide-react';

const seekerFeatures = [
  'تصفح غير محدود للوظائف',
  'التقديم على الوظائف مجاناً',
  'ملف شخصي احترافي',
  'تنبيهات بالوظائف المناسبة',
  'تتبع حالة طلباتك',
  'حفظ الوظائف المفضلة',
  'دعم فني متواصل',
];

const companyFeatures = [
  'نشر إعلانات التوظيف',
  'استعراض طلبات المتقدمين',
  'لوحة تحكم متكاملة',
  'إدارة الوظائف النشطة',
  'تواصل مع المرشحين',
  'تقارير وإحصاءات',
  'دعم فني متواصل',
];

const faqs = [
  {
    q: 'هل الخدمة مجانية تماماً؟',
    a: 'نعم، المنصة مجانية بالكامل للمقيمين والشركات في الوقت الحالي. نهدف إلى ربط أفضل المواهب بأبرز فرص العمل في الإمارات.',
  },
  {
    q: 'كيف يعمل نظام الموافقة على الطلبات؟',
    a: 'عند تقديم طلب توظيف، تراجعه إدارة المنصة أولاً لضمان الجودة. بعد الموافقة يُرسل الطلب للشركة تلقائياً.',
  },
  {
    q: 'هل يمكنني التسجيل برقم الهاتف؟',
    a: 'نعم، يمكنك التسجيل وتسجيل الدخول عبر رقم الهاتف (OTP) أو البريد الإلكتروني أو حساب Google.',
  },
  {
    q: 'هل ستُضاف ميزات مدفوعة مستقبلاً؟',
    a: 'قد نضيف خطط مدفوعة اختيارية مستقبلاً لميزات متقدمة، لكن النشر الأساسي والتقديم سيبقى مجانياً.',
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="gradient-hero text-white py-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4 text-amber-300" />
          مجاني تماماً — بدون اشتراك
        </div>
        <h1 className="text-4xl font-bold mb-4">كل الميزات، بدون أي تكلفة</h1>
        <p className="text-red-200 text-lg max-w-2xl mx-auto">
          سواء كنت مقيماً تبحث عن عمل أو شركة تبحث عن مواهب — وورك هب مجاني بالكامل الآن
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-5xl mx-auto px-4 -mt-12 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Seeker */}
          <div className="bg-white rounded-3xl border-2 border-red-600 shadow-xl p-8 relative">
            <div className="absolute -top-4 right-6">
              <span className="px-4 py-1.5 bg-gradient-to-l from-red-700 to-red-600 text-white text-sm font-bold rounded-full shadow-lg">
                مقيم / باحث عمل
              </span>
            </div>
            <div className="flex items-center gap-3 mb-6 mt-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">مجاني</div>
                <div className="text-sm text-gray-500">بدون أي قيود</div>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {seekerFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                  <CheckCircle className="w-4.5 h-4.5 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=seeker"
              className="block text-center w-full py-3.5 bg-gradient-to-l from-red-700 to-red-600 text-white font-bold rounded-2xl hover:from-red-600 hover:to-red-500 transition-colors">
              سجّل مجاناً الآن
            </Link>
          </div>

          {/* Company */}
          <div className="bg-white rounded-3xl border-2 border-purple-600 shadow-xl p-8 relative">
            <div className="absolute -top-4 right-6">
              <span className="px-4 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                شركة / صاحب عمل
              </span>
            </div>
            <div className="flex items-center gap-3 mb-6 mt-3">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">مجاني</div>
                <div className="text-sm text-gray-500">بدون اشتراك</div>
              </div>
            </div>
            <ul className="space-y-3 mb-8">
              {companyFeatures.map(f => (
                <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
                  <CheckCircle className="w-4.5 h-4.5 text-green-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register?role=company"
              className="block text-center w-full py-3.5 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors">
              أنشئ حساب شركتك
            </Link>
          </div>
        </div>

        {/* Coming soon */}
        <div className="mt-8 bg-gradient-to-l from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Star className="w-5 h-5 text-amber-400" />
            <span className="text-white font-bold">قريباً — ميزات إضافية</span>
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-gray-400 text-sm">
            تصدير السيرة الذاتية بشكل احترافي (PDF) • تحليلات متقدمة للشركات • مدفوعات آمنة عبر Apple Pay و Google Pay
          </p>
        </div>

        {/* FAQs */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">الأسئلة الشائعة</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">هل لديك استفسارات؟ تواصل معنا</p>
          <a href="mailto:hamad2001ggh@gmail.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-700 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            hamad2001ggh@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
