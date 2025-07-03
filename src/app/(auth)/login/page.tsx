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

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you'd have Firebase/other auth logic here
    router.push("/dashboard")
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapmak için aşağıya e-postanızı girin.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
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
          <Button className="w-full" type="submit">Giriş Yap</Button>
          <div className="mt-4 text-center text-sm">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="underline text-primary">
              Kayıt Ol
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
