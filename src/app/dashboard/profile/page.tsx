
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Profil</h1>
        <p className="text-muted-foreground">Profil bilgilerinizi yönetin.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
          <CardDescription>Kişisel bilgilerinizi burada güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="https://placehold.co/80x80.png" data-ai-hint="profile picture" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <Button variant="outline">Resmi Değiştir</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="full-name">Ad Soyad</Label>
            <Input id="full-name" defaultValue="Kullanıcı Adı" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" defaultValue="kullanici@psikotakip.com" disabled />
          </div>
          <Button>Değişiklikleri Kaydet</Button>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Şifre</CardTitle>
          <CardDescription>Güvenlik için şifrenizi periyodik olarak değiştirin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Mevcut Şifre</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Yeni Şifre</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Yeni Şifreyi Onayla</Label>
            <Input id="confirm-password" type="password" />
          </div>
          <Button>Şifreyi Değiştir</Button>
        </CardContent>
      </Card>
    </div>
  )
}
