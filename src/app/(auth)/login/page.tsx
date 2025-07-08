
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
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

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" {...props}>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.657-3.467-11.303-8H6.306C9.656,39.663,16.318,44,24,44z" />
            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.021,35.591,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
        </svg>
    );
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            await setDoc(userDocRef, {
                uid: user.uid,
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                role: 'danisan',
                organizationId: null,
                createdAt: serverTimestamp(),
                subscription: { status: 'free', expires: null },
                connectedTherapist: null,
            });
            await setDoc(doc(db, "gamification", user.uid), {
                xp: 0,
                level: 1,
                currentStreak: 0,
                lastActivityDate: null,
            });
             toast({ title: "Hoş Geldiniz!", description: "Hesabınız başarıyla oluşturuldu." });
        } else {
             const userData = userDoc.data();
             toast({ title: "Giriş Başarılı", description: `Tekrar hoş geldiniz, ${userData.displayName}!`});
             if (userData.role === 'terapist' || userData.role === 'kurum_yoneticisi') {
                 router.push('/therapist/dashboard');
                 setGoogleLoading(false);
                 return;
             }
        }
        router.push('/dashboard');
    } catch (error) {
        console.error("Google ile giriş hatası:", error);
        toast({ title: "Hata", description: "Google ile giriş yapılamadı.", variant: "destructive" });
    } finally {
        setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    let formData = new FormData(e.currentTarget)
    let email = formData.get("email") as string
    let password = formData.get("password") as string

    if (email.toLowerCase() === 'admin' && password === 'admin') {
      toast({ title: "Demo Girişi", description: "Terapist paneline yönlendiriliyorsunuz..." });
      router.push('/therapist/dashboard');
      setLoading(false);
      return;
    }
    
    if (email.toLowerCase() === 'mehmet.ozturk@example.com' && password === 'admin') {
      toast({ title: "Demo Girişi", description: "Danışan paneline yönlendiriliyorsunuz..." });
      router.push('/dashboard');
      setLoading(false);
      return;
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
                router.push('/dashboard')
            }
        } else {
            toast({ title: "Hata", description: "Kullanıcı verisi bulunamadı.", variant: "destructive" })
            setLoading(false)
        }
    } catch (error: any) {
        let errorMessage = "Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin."
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = "E-posta veya şifre hatalı."
        } else if (error.code === 'auth/invalid-api-key') {
            errorMessage = "Firebase bağlantı hatası. API anahtarlarınızı kontrol edin."
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
          Başlamak için hesabınıza giriş yapın.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
          <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Google ile Giriş Yap
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Veya e-posta ile devam et
                </span>
            </div>
          </div>
          <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input name="email" id="email" type="text" placeholder="m@example.com" required disabled={loading || googleLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input name="password" id="password" type="password" required disabled={loading || googleLoading} />
              </div>
              <Button className="w-full" type="submit" disabled={loading || googleLoading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Giriş Yap
              </Button>
          </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
          <div className="text-center text-sm">
            Hesabınız yok mu?{" "}
            <Link href="/register" className="underline text-primary">
              Kayıt Ol
            </Link>
          </div>
      </CardFooter>
    </Card>
  )
}
