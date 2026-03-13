import type { Metadata } from 'next';
import { Logo } from '@/components/logo';

export const metadata: Metadata = {
  title: 'Giriş — PsikoTakip',
  description: 'Hesabınıza giriş yapın',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 relative flex-col justify-between p-12 overflow-hidden bg-[#1a5c45]">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-0 w-72 h-72 rounded-full bg-emerald-300/10 blur-2xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              PsikoTakip
            </span>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm text-white/90">
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              Klinik destek platformu
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Zihinsel sağlık
              <br />
              <span className="text-emerald-300">birlikte güçlenir</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Psikiyatrist ve psikologlar için tasarlanmış, bütünleşik hasta
              takip ve değerlendirme platformu.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="space-y-3">
            {[
              { icon: '📊', text: 'Hasta testleri & analiz raporları' },
              { icon: '🤖', text: 'YZ destekli klinik asistan' },
              { icon: '📅', text: 'Randevu ve görev yönetimi' },
              { icon: '🔒', text: 'KVKK uyumlu veri güvenliği' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                  {item.icon}
                </div>
                <span className="text-white/80 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tag */}
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            © 2026 PsikoTakip · Klinik ruh sağlığı teknolojileri
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 sm:p-12">
        {/* Mobile logo only */}
        <div className="lg:hidden mb-8">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}
