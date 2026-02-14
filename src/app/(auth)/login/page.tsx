'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [pendingTherapist, setPendingTherapist] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPendingTherapist(false);

    let formData = new FormData(e.currentTarget);
    let email = formData.get('email') as string;
    let password = formData.get('password') as string;

    if (email.toLowerCase() === 'terapist' && password === 'terapist') {
      toast({
        title: 'Demo Girişi',
        description: 'Terapist paneline yönlendiriliyorsunuz...',
      });
      router.push('/therapist/dashboard');
      setLoading(false);
      return;
    }

    if (email.toLowerCase() === 'danisan' && password === 'danisan') {
      toast({
        title: 'Demo Girişi',
        description: 'Danışan paneline yönlendiriliyorsunuz...',
      });
      router.push('/dashboard');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      toast({
        title: 'Hata',
        description: 'E-posta ve şifre gereklidir.',
        variant: 'destructive',
      });
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
        title: 'Giriş Başarılı',
        description: `Hoş geldiniz, ${user.displayName}!`,
      });

      if (user.role === 'terapist' || user.role === 'kurum_yoneticisi') {
        router.push('/therapist/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Giriş Başarısız',
        description: error.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>Başlamak için hesabınıza giriş yapın.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {pendingTherapist && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Hesabınız İnceleniyor</AlertTitle>
            <AlertDescription>
              Terapist başvurunuz onay bekliyor. Onaylandığında e-posta ile
              bilgilendirileceksiniz.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              name="email"
              id="email"
              type="text"
              placeholder="m@example.com"
              required
              disabled={loading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              name="password"
              id="password"
              type="password"
              required
              disabled={loading}
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Giriş Yap
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="text-center text-sm">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="underline text-primary">
            Kayıt Ol
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
