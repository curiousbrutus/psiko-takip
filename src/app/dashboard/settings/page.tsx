
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Ayarlar</h1>
        <p className="text-muted-foreground">Uygulama tercihlerinizi yönetin.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Görünüm</CardTitle>
          <CardDescription>Uygulamanın görünümünü özelleştirin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Karanlık Mod</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Gözlerinizi dinlendirmek için karanlık temayı etkinleştirin.
                </span>
            </Label>
            <Switch id="dark-mode" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bildirimler</CardTitle>
          <CardDescription>Hangi bildirimleri almak istediğinizi seçin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
             <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>E-posta Bildirimleri</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Önemli güncellemeler ve hatırlatıcılar için e-posta alın.
                </span>
            </Label>
            <Switch id="email-notifications" checked />
          </div>
           <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                <span>Anlık Bildirimler</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Yeni testler ve sonuçlar hakkında anında bildirim alın.
                </span>
            </Label>
            <Switch id="push-notifications" />
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
      
      <div className="flex justify-end">
        <Button>Ayarları Kaydet</Button>
      </div>
    </div>
  )
}
