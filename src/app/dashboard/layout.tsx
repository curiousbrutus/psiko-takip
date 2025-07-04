import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { LogOut, PanelLeft } from 'lucide-react';
import { Logo } from "@/components/logo";
import Link from 'next/link';
import DashboardNav from './_components/dashboard-nav';
import HeaderTitle from "./_components/header-title";

export default function DashboardLayout({
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
            <DashboardNav />
        </nav>
        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="profile picture" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-sm">Kullanıcı Adı</p>
              <p className="text-xs text-muted-foreground">kullanici@psikotakip.com</p>
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
                    <DashboardNav />
                </nav>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <HeaderTitle />
          </div>
        </header>
        <main className="flex-1 p-6 bg-gradient-to-br from-background via-teal-50 to-background overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
