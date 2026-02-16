'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-72 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-64 mt-1" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-80" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-80 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Ayarlar</h1>
        <p className="text-muted-foreground">
          Uygulama tercihlerinizi yönetin.
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
            Hangi bildirimleri almak istediğinizi seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="email-notifications"
              className="flex flex-col space-y-1"
            >
              <span>E-posta Bildirimleri</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Önemli güncellemeler ve hatırlatıcılar için e-posta alın.
              </span>
            </Label>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label
              htmlFor="push-notifications"
              className="flex flex-col space-y-1"
            >
              <span>Anlık Bildirimler</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Yeni testler ve sonuçlar hakkında anında bildirim alın.
              </span>
            </Label>
            <Switch
              id="push-notifications"
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dil</CardTitle>
          <CardDescription>Uygulama dilini seçin.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select defaultValue="tr">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dil seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  );
}
