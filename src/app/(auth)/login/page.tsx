"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
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
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    let formData = new FormData(e.currentTarget)
    let email = formData.get("email") as string
    let password = formData.get("password") as string

    // Special handling for the admin user request
    if (email.toLowerCase() === 'admin' && password === 'admin') {
      email = 'admin@psikotakip.com'
      password = 'adminadmin' // Firebase requires a password of at least 6 characters
    }

    if (!email || !password) {
        toast({ title: "Hata", description: "E-posta ve şifre gereklidir.", variant: "destructive" })
        setLoading(false)
        return
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
            const userData = userDoc.data()
            toast({ title: "Giriş Başarılı", description: `Hoş geldiniz, ${userData.displayName}!`})
            if (userData.role === 'terapist' || userData.role === 'kurum_yoneticisi') {
                router.push('/therapist/dashboard')
            } else {
                // This covers both 'danisan' and 'hastane_calisani' roles
                router.push('/dashboard')
            }
        } else {
            toast({ title: "Hata", description: "Kullanıcı verisi bulunamadı.", variant: "destructive" })
            setLoading(false)
        }

    } catch (error: any) {
      // If admin user doesn't exist, create it on the fly
      if (email === 'admin@psikotakip.com' && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const user = userCredential.user
          
          await updateProfile(user, { displayName: "Admin" })
          
          await setDoc(doc(db, "users", user.uid), {
              uid: user.uid,
              displayName: "Admin",
              email: user.email,
              role: 'terapist', // Using 'terapist' as it has a dashboard
              createdAt: serverTimestamp(),
          });
          
          toast({ title: "Admin Hesabı Oluşturuldu", description: "Giriş yapılıyor..." });
          router.push('/therapist/dashboard');
          return;

        } catch (creationError: any) {
          toast({ title: "Admin Oluşturma Hatası", description: "Admin hesabı oluşturulamadı. Lütfen tekrar deneyin.", variant: "destructive" })
          setLoading(false);
          return;
        }
      }

        let errorMessage = "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin."
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "E-posta veya şifre hatalı."
        }
        toast({ title: "Giriş Başarısız", description: errorMessage, variant: "destructive" })
        setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Giriş Yap</CardTitle>
        <CardDescription>
          Hesabınıza giriş yapmak için e-postanızı girin. Admin girişi için her iki alana da 'admin' yazabilirsiniz.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="grid gap-4">
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
            Giriş Yap
          </Button>
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
