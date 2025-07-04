"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { useToast } from "@/hooks/use-toast"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState<'danisan' | 'terapist'>('danisan')

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const fullName = formData.get("full-name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        // Corporate invite code logic would go here in a real scenario
        // const inviteCode = formData.get("invite-code") as string;
        
        // For now, we assume registration is for danisan/terapist
        // A corporate user would be created via an admin panel or a different flow.

        if (!fullName || !email || !password) {
            toast({ title: "Hata", description: "Lütfen tüm alanları doldurun.", variant: "destructive" })
            setLoading(false)
            return
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            await updateProfile(user, { displayName: fullName })

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: fullName,
                email: user.email,
                role: role,
                organizationId: null, // Default to null for public registration
                createdAt: serverTimestamp(),
                subscription: { status: 'free', expires: null },
                ...(role === 'terapist' && { danisanlarim: [] }),
                ...(role === 'danisan' && { connectedTherapist: null }),
            });

            // Create initial gamification document
            if (role === 'danisan') {
                await setDoc(doc(db, "gamification", user.uid), {
                    xp: 0,
                    level: 1,
                    currentStreak: 0,
                    lastActivityDate: null,
                });
            }

            toast({ title: "Başarılı", description: "Hesabınız başarıyla oluşturuldu." })
            
            // Redirect based on role
            if (role === 'terapist') {
                router.push("/therapist/dashboard")
            } else {
                router.push("/dashboard")
            }

        } catch (error: any) {
            let errorMessage = "Bir hata oluştu. Lütfen tekrar deneyin."
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "Bu e-posta adresi zaten kullanılıyor."
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "Şifre çok zayıf. Lütfen en az 6 karakterli bir şifre seçin."
            }
            toast({ title: "Kayıt Başarısız", description: errorMessage, variant: "destructive" })
            setLoading(false)
        }
    }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Hesap Oluştur</CardTitle>
        <CardDescription>
          Başlamak için bilgilerinizi girin ve rolünüzü seçin.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleRegister}>
        <CardContent className="grid gap-4">
            <div className="grid gap-2">
                <Label>Ben bir...</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as 'danisan' | 'terapist')} className="grid grid-cols-2 gap-4">
                     <div>
                        <RadioGroupItem value="danisan" id="danisan" className="sr-only" />
                        <Label htmlFor="danisan" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            Danışanım
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="terapist" id="terapist" className="sr-only" />
                        <Label htmlFor="terapist" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            Terapistim
                        </Label>
                    </div>
                </RadioGroup>
            </div>
            <p className="text-sm text-center text-muted-foreground">
                Kurumsal bir davet kodunuz mu var? Şimdilik normal kayıt oluşturun, davet kodu özelliği yakında eklenecektir.
            </p>
          <div className="grid gap-2">
            <Label htmlFor="full-name">Ad Soyad</Label>
            <Input name="full-name" id="full-name" placeholder="Adınız Soyadınız" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input name="email" id="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Şifre</Label>
            <Input name="password" id="password" type="password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <Button className="w-full" type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hesap Oluştur
          </Button>
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
