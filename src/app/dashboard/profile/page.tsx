"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, auth } from "@/lib/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (userData) {
      setFullName(userData.displayName);
    }
  }, [userData]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !fullName) return;
    setLoadingProfile(true);

    try {
      // Update Firestore
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName: fullName });
      
      // Update Auth profile
      await updateProfile(user, { displayName: fullName });

      toast({ title: "Başarılı", description: "Profiliniz güncellendi." });
    } catch (error) {
      console.error(error);
      toast({ title: "Hata", description: "Profil güncellenemedi.", variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      toast({ title: "Hata", description: "Lütfen tüm şifre alanlarını doldurun.", variant: "destructive"});
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Hata", description: "Yeni şifreler eşleşmiyor.", variant: "destructive"});
      return;
    }
    setLoadingPassword(true);
    
    try {
      if(user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        toast({ title: "Başarılı", description: "Şifreniz değiştirildi." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
       console.error(error);
       toast({ title: "Hata", description: "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.", variant: "destructive"});
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
            <CardDescription>Kişisel bilgilerinizi burada güncelleyin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                <AvatarImage src={user?.photoURL || "https://placehold.co/80x80.png"} data-ai-hint="profile picture" alt={userData?.displayName || 'User'} />
                <AvatarFallback>{userData?.displayName?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <Button variant="outline" type="button">Resmi Değiştir</Button>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="full-name">Ad Soyad</Label>
                <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input id="email" type="email" value={user?.email || ""} disabled />
            </div>
            <Button type="submit" disabled={loadingProfile}>
                {loadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Değişiklikleri Kaydet
            </Button>
            </CardContent>
        </form>
      </Card>
       <Card>
        <form onSubmit={handlePasswordChange}>
            <CardHeader>
            <CardTitle>Şifre</CardTitle>
            <CardDescription>Güvenlik için şifrenizi periyodik olarak değiştirin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="current-password">Mevcut Şifre</Label>
                <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Yeni Şifreyi Onayla</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loadingPassword}>
                {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Şifreyi Değiştir
            </Button>
            </CardContent>
        </form>
      </Card>
    </div>
  )
}
