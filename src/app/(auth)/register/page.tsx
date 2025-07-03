"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
    const router = useRouter()

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app, you'd have Firebase/other auth logic here
        router.push("/dashboard")
    }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
        <CardDescription>
          Hesap oluşturmak için bilgilerinizi girin.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full-name">Ad Soyad</Label>
            <Input id="full-name" placeholder="Adınız Soyadınız" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full" type="submit">Hesap Oluştur</Button>
          <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/login" className="underline text-primary">
              Giriş Yap
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
