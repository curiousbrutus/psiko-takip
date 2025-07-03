import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
        <Logo />
      </header>
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-teal-50 to-background">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
            Now with AI-Powered Insights
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold text-foreground mb-4">
            Your Personal Guide to <br />
            <span className="text-primary">Mental Well-being</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            PsikoTakip helps you understand your mental health through validated tests and provides personalized, AI-driven guidance for your journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="font-bold">
              <Link href="/dashboard">
                Get Started <MoveRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-bold">
              <Link href="/login">Login to Your Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
