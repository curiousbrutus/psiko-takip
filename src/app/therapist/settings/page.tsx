'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function TherapistSettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, userData } = useAuth();

  // Placeholder states for therapist-specific settings
  const [clientCompletionEmails, setClientCompletionEmails] = useState(true);
  const [newClientEmails, setNewClientEmails] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !userData) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-80" />
                  </div>
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ve uygulama tercihlerinizi yönetin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>
            Uygulamanın görünümünü özelleştirin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
              <span>Karanlık Mod</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Gözlerinizi dinlendirmek için karanlık temayı etkinleştirin.
              </span>
            </Label>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
          <CardDescription>
            Danışan aktiviteleriyle ilgili bildirimleri yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="client-completion-emails"
              className="flex flex-col space-y-1"
            >
              <span>Görev Tamamlama E-postaları</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Bir danışan görev veya test tamamladığında e-posta alın.
              </span>
            </Label>
            <Switch
              id="client-completion-emails"
              checked={clientCompletionEmails}
              onCheckedChange={setClientCompletionEmails}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="new-client-emails"
              className="flex flex-col space-y-1"
            >
              <span>Yeni Danışan E-postaları</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Sistem tarafından size yeni bir danışan atandığında e-posta
                alın.
              </span>
            </Label>
            <Switch
              id="new-client-emails"
              checked={newClientEmails}
              onCheckedChange={setNewClientEmails}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hesap</CardTitle>
          <CardDescription>
            Profil ve abonelik bilgilerinizi yönetin.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" disabled>
            Profilimi Düzenle
          </Button>
          <Button variant="outline" disabled>
            Aboneliği Yönet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
