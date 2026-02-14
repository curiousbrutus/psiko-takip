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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'danisan' | 'terapist'>('danisan');

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('full-name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!fullName || !email || !password) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      await register(email, password, fullName, role);

      toast({
        title: 'Başarılı',
        description: 'Hesabınız başarıyla oluşturuldu.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      let errorMessage = error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      if (errorMessage.includes('zaten kullanılıyor')) {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
      }
      toast({
        title: 'Kayıt Başarısız',
        description: errorMessage,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
        <CardDescription>
          Başlamak için bilgilerinizi girin ve rolünüzü seçin.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form onSubmit={handleRegister} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Ben bir...</Label>
            <RadioGroup
              value={role}
              onValueChange={value => setRole(value as 'danisan' | 'terapist')}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="danisan"
                  id="danisan"
                  className="sr-only"
                />
                <Label
                  htmlFor="danisan"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Danışanım
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="terapist"
                  id="terapist"
                  className="sr-only"
                />
                <Label
                  htmlFor="terapist"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  Terapistim
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full-name">Ad Soyad</Label>
            <Input
              name="full-name"
              id="full-name"
              placeholder="Adınız Soyadınız"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input
              name="password"
              id="password"
              type="password"
              required
            />
          </div>
          <Button
            className="w-full"
            type="submit"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {role === 'terapist' ? 'Terapist Olarak Başvur' : 'Hesap Oluştur'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="mt-4 text-center text-sm">
          Zaten bir hesabınız var mı?{' '}
          <Link href="/login" className="underline text-primary">
            Giriş Yap
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
