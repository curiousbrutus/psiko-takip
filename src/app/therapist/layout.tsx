import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, PanelLeft, Users, Calendar, Settings } from 'lucide-react';
import { Logo } from "@/components/logo";
import Link from 'next/link';

function TherapistNav() {
    return (
        <ul className="space-y-2">
            <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/therapist/dashboard"><Users className="mr-2 h-4 w-4" /> Danışanlar</Link>
                </Button>
            </li>
            <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="#"><Calendar className="mr-2 h-4 w-4" /> Takvim</Link>
                </Button>
            </li>
            <li>
                <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="#"><Settings className="mr-2 h-4 w-4" /> Ayarlar</Link>
                </Button>
            </li>
        </ul>
    );
}

export default function TherapistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background">
      <aside className="hidden md:flex flex-col w-64 border-r bg-card">
        <div className="p-4 border-b">
            <Logo inSidebar />
        </div>
        <nav className="flex-1 p-4">
            <TherapistNav />
        </nav>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile picture therapist" alt="@therapist" />
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">Dr. Aysu Yılmaz</p>
              <p className="text-xs text-muted-foreground">terapist@psikotakip.com</p>
            </div>
            <Button variant="ghost" size="icon" asChild>
                <Link href="/"><LogOut className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Menüyü Değiştir</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
                <div className="p-4 border-b">
                    <Logo inSidebar />
                </div>
                <nav className="p-4">
                    <TherapistNav />
                </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Terapist Paneli</h1>
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/40 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
