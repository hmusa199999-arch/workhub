import { Link } from 'react-router-dom';
import { Shield, Users, Zap, Globe, Heart, Award, Mail, Phone, MessageCircle } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden border-b border-red-900/20">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/30 via-gray-950 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs text-red-400 font-black mb-6 tracking-wider uppercase">
            ✦ من نحن
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            نبنع جسر الفرص<br />
            <span className="text-red-400">في العالم العربي</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed max-w-2xl mx-auto">
            work1m هي منصة إعلانات ووظائف عربية شاملة، تهدف إلى ربط الأفراد والشركات في أكثر من 15 دولة عربية بطريقة سهلة وسريعة ومجانية.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-4">رسالتنا</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                نؤمن بأن كل شخص يستحق الوصول إلى الفرصة المناسبة — سواء كانت وظيفة، سيارة، عقاراً، أو خدمة — دون حواجز أو رسوم.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                أطلقنا work1m لنكون المنصة العربية الأولى التي تجمع كل الاحتياجات في مكان واحد، بتجربة مستخدم سلسة ومصممة خصيصاً للعالم العربي.
              </p>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-red-600 to-red-500 text-white font-black rounded-xl hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-500/20 text-sm">
                انضم إلينا مجاناً ←
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '🌍', title: '+15 دولة عربية', desc: 'نغطي جميع أنحاء العالم العربي' },
                { icon: '🆓', title: 'مجاني 100%', desc: 'لا رسوم ولا اشتراكات مخفية' },
                { icon: '⚡', title: 'نشر فوري', desc: 'إعلانك يظهر للجميع فور نشره' },
                { icon: '🔒', title: 'آمن وموثوق', desc: 'نحمي بياناتك بأعلى المعايير' },
              ].map(item => (
                <div key={item.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-red-600/30 transition-colors">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-black text-white text-sm mb-1">{item.title}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gray-900/40 border-y border-red-900/10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-white mb-2">قيمنا</h2>
            <p className="text-gray-500">ما يجعلنا مختلفين</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: <Shield className="w-6 h-6 text-red-400" />, title: 'الأمان والثقة', desc: 'نحمي بيانات مستخدمينا ونتحقق من الإعلانات للحفاظ على بيئة آمنة.' },
              { icon: <Heart className="w-6 h-6 text-red-400" />, title: 'المجتمع أولاً', desc: 'نبني منصة للناس وليس للربح — خدماتنا مجانية ومفتوحة للجميع.' },
              { icon: <Zap className="w-6 h-6 text-red-400" />, title: 'السرعة والبساطة', desc: 'تجربة سهلة وسريعة بدون تعقيد، مصممة لتناسب الجميع.' },
              { icon: <Globe className="w-6 h-6 text-red-400" />, title: 'الانتشار العربي', desc: 'نتحدث لغتك ونفهم احتياجاتك كعربي في أي دولة كنت.' },
              { icon: <Users className="w-6 h-6 text-red-400" />, title: 'الشمولية', desc: 'للباحث عن عمل، صاحب العمل، البائع والمشتري — الكل مرحب به.' },
              { icon: <Award className="w-6 h-6 text-red-400" />, title: 'الجودة', desc: 'نسعى دائماً لتقديم أفضل تجربة ممكنة ونطور منصتنا باستمرار.' },
            ].map(v => (
              <div key={v.title} className="bg-gray-900 border border-gray-800 hover:border-red-600/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5">
                <div className="w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center mb-4">{v.icon}</div>
                <h3 className="font-black text-gray-200 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '25,000+', label: 'مستخدم نشط', icon: '👥' },
              { value: '1,300+', label: 'وظيفة متاحة', icon: '💼' },
              { value: '15+', label: 'دولة عربية', icon: '🌍' },
              { value: '2026', label: 'سنة التأسيس', icon: '🚀' },
            ].map(s => (
              <div key={s.label} className="group">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-3xl font-black text-white mb-1 group-hover:text-red-400 transition-colors">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-gray-900/40 border-t border-red-900/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-black text-white mb-4">تواصل معنا</h2>
          <p className="text-gray-400 mb-10 text-sm">نحن هنا للمساعدة — لا تتردد في التواصل معنا بأي طريقة</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="mailto:hamad2001ggh@gmail.com"
              className="flex flex-col items-center gap-3 p-6 bg-gray-900 border border-gray-800 hover:border-red-600/40 rounded-2xl transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                <Mail className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-black text-white text-sm mb-1">البريد الإلكتروني</div>
                <div className="text-gray-500 text-xs">hamad2001ggh@gmail.com</div>
              </div>
            </a>
            <a href="https://wa.me/971543393797" target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center gap-3 p-6 bg-gray-900 border border-gray-800 hover:border-green-600/40 rounded-2xl transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-green-600/10 border border-green-600/20 rounded-xl flex items-center justify-center group-hover:bg-green-600/20 transition-colors">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="font-black text-white text-sm mb-1">واتساب</div>
                <div className="text-gray-500 text-xs" dir="ltr">+971 54 339 3797</div>
              </div>
            </a>
            <a href="tel:+971543393797"
              className="flex flex-col items-center gap-3 p-6 bg-gray-900 border border-gray-800 hover:border-red-600/40 rounded-2xl transition-all hover:-translate-y-0.5 group">
              <div className="w-12 h-12 bg-red-600/10 border border-red-600/20 rounded-xl flex items-center justify-center group-hover:bg-red-600/20 transition-colors">
                <Phone className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="font-black text-white text-sm mb-1">هاتف</div>
                <div className="text-gray-500 text-xs" dir="ltr">+971 54 339 3797</div>
              </div>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
