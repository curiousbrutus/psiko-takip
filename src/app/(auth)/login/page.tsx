'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Clock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingTherapist, setPendingTherapist] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingTherapist(false);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Quick-access demo shortcuts (kept for backwards compat)
    if (email.toLowerCase() === 'terapist' && password === 'terapist') {
      router.push('/therapist/dashboard');
      setLoading(false);
      return;
    }
    if (email.toLowerCase() === 'danisan' && password === 'danisan') {
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('E-posta ve şifre gereklidir.');
      setLoading(false);
      return;
    }

    try {
      const data = await login(email, password);
      const user = data.user;

      if (user.role === 'pending_therapist') {
        setPendingTherapist(true);
        setLoading(false);
        return;
      }

      toast({
        title: 'Hoş geldiniz!',
        description: `${user.displayName} olarak giriş yapıldı.`,
      });

      if (user.role === 'terapist' || user.role === 'kurum_yoneticisi') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(
        err.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Heading */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Tekrar hoş geldiniz
        </h2>
        <p className="text-muted-foreground">
          Hesabınıza giriş yaparak platformu kullanmaya devam edin.
        </p>
      </div>

      {/* Pending therapist alert */}
      {pendingTherapist && (
        <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
          <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Hesabınız İnceleniyor
            </p>
            <p className="text-sm text-amber-700/80 dark:text-amber-500 mt-1">
              Terapist başvurunuz onay bekliyor. Onaylandığında e-posta ile
              bilgilendirileceksiniz.
            </p>
          </div>
        </div>
      )}

      {/* Error alert */}
      {error && (
        <div className="flex gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            E-posta
          </Label>
          <Input
            name="email"
            id="email"
            type="text"
            placeholder="ornek@kurum.com"
            required
            disabled={loading}
            className="h-11 rounded-xl border-border/60 bg-card focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Şifre
            </Label>
          </div>
          <div className="relative">
            <Input
              name="password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              disabled={loading}
              className="h-11 rounded-xl border-border/60 bg-card pr-11 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-[#1a5c45] hover:bg-[#154d39] active:scale-[0.98] text-white font-semibold tracking-wide transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#1a5c45]/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Giriş yapılıyor...
            </>
          ) : (
            'Giriş Yap'
          )}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Hesabınız yok mu?{' '}
        <Link
          href="/register"
          className="font-semibold text-primary hover:underline underline-offset-2"
        >
          Kayıt Ol
        </Link>
      </p>
    </div>
  );
}
