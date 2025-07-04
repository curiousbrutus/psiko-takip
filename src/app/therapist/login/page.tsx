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

export default function TherapistLoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd have Firebase/other auth logic here
    router.push("/therapist/dashboard")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Terapist Girişi</CardTitle>
        <CardDescription>
          Profesyonel hesabınıza giriş yapmak için bilgilerinizi girin.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" type="email" placeholder="terapist@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button className="w-full" type="submit">Giriş Yap</Button>
          <div className="mt-4 text-center text-sm">
            Danışan mısınız?{" "}
            <Link href="/login" className="underline text-primary">
              Buradan giriş yapın
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
