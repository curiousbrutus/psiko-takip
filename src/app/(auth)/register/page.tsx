
"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { 
    createUserWithEmailAndPassword, 
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
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


export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [role, setRole] = useState<'danisan' | 'terapist'>('danisan')

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
                 toast({ title: "Giriş Başarılı", description: `Tekrar hoş geldiniz, ${user.displayName}!` });
            }

            router.push('/dashboard');

        } catch (error) {
            console.error("Google ile giriş hatası:", error);
            toast({ title: "Hata", description: "Google ile giriş yapılamadı.", variant: "destructive" });
        } finally {
            setGoogleLoading(false);
        }
    };


    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const fullName = formData.get("full-name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        
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
                organizationId: null,
                createdAt: serverTimestamp(),
                subscription: { status: 'free', expires: null },
                ...(role === 'terapist' && { danisanlarim: [] }),
                ...(role === 'danisan' && { connectedTherapist: null }),
            });

            if (role === 'danisan') {
                await setDoc(doc(db, "gamification", user.uid), {
                    xp: 0,
                    level: 1,
                    currentStreak: 0,
                    lastActivityDate: null,
                });
            }

            toast({ title: "Başarılı", description: "Hesabınız başarıyla oluşturuldu." })
            
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
      <CardContent className="grid gap-4">
          <Button variant="outline" type="button" onClick={handleGoogleSignIn} disabled={loading || googleLoading}>
            {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
            Google ile Kaydol
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Veya e-posta ile
                </span>
            </div>
          </div>
          <form onSubmit={handleRegister} className="grid gap-4">
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
              <div className="grid gap-2">
                <Label htmlFor="full-name">Ad Soyad</Label>
                <Input name="full-name" id="full-name" placeholder="Adınız Soyadınız" required disabled={googleLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-posta</Label>
                <Input name="email" id="email" type="email" placeholder="m@example.com" required disabled={googleLoading} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Şifre</Label>
                <Input name="password" id="password" type="password" required disabled={googleLoading} />
              </div>
              <Button className="w-full" type="submit" disabled={loading || googleLoading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hesap Oluştur
              </Button>
          </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
          <div className="mt-4 text-center text-sm">
            Zaten bir hesabınız var mı?{" "}
            <Link href="/login" className="underline text-primary">
              Giriş Yap
            </Link>
          </div>
        </CardFooter>
    </Card>
  )
}
