'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiUpdateProfile, apiChangePassword } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { profileSymbols, ProfileSymbol } from '@/lib/profile-symbols';

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [symbolDetails, setSymbolDetails] = useState<ProfileSymbol | undefined>(
    undefined
  );

  useEffect(() => {
    if (userData) {
      setFullName(userData.displayName || '');
      if (userData.profileSymbol) {
        const details = profileSymbols.find(
          s => s.emoji === userData.profileSymbol
        );
        setSymbolDetails(details);
      }
    }
  }, [userData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName) return;
    setLoadingProfile(true);

    try {
      await apiUpdateProfile(fullName);

      toast({ title: 'Başarılı', description: 'Profiliniz güncellendi.' });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Hata',
        description: 'Profil güncellenemedi.',
        variant: 'destructive',
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm şifre alanlarını doldurun.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Hata',
        description: 'Yeni şifreler eşleşmiyor.',
        variant: 'destructive',
      });
      return;
    }
    setLoadingPassword(true);

    try {
      await apiChangePassword(currentPassword, newPassword);
      toast({ title: 'Başarılı', description: 'Şifreniz değiştirildi.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Hata',
        description: 'Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.',
        variant: 'destructive',
      });
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profil</h1>
        <p className="text-muted-foreground">Profil bilgilerinizi yönetin.</p>
      </div>
      <Card>
        <form onSubmit={handleProfileUpdate}>
          <CardHeader>
            <CardTitle>Profil Bilgileri</CardTitle>
            <CardDescription>
              Kişisel bilgilerinizi burada güncelleyin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20">
                <Avatar className="h-20 w-20 border">
                  <AvatarImage
                    src={user?.photoURL || 'https://placehold.co/80x80.png'}
                    data-ai-hint="profile picture"
                    alt={userData?.displayName || 'User'}
                  />
                  <AvatarFallback>
                    {userData?.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {symbolDetails && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-card border-2 border-primary-foreground shadow-md">
                          <span className="text-lg">{symbolDetails.emoji}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">
                          Senin simgen: {symbolDetails.emoji}{' '}
                          {symbolDetails.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {symbolDetails.description}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Button variant="outline" type="button" disabled>
                Resmi Değiştir
              </Button>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Ad Soyad</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
              />
            </div>
            <Button type="submit" disabled={loadingProfile}>
              {loadingProfile && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Değişiklikleri Kaydet
            </Button>
          </CardContent>
        </form>
      </Card>
      <Card>
        <form onSubmit={handlePasswordChange}>
          <CardHeader>
            <CardTitle>Şifre</CardTitle>
            <CardDescription>
              Güvenlik için şifrenizi periyodik olarak değiştirin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Mevcut Şifre</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Yeni Şifre</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Yeni Şifreyi Onayla</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loadingPassword}>
              {loadingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Şifreyi Değiştir
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
