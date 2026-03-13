'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, PanelLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import DashboardNav from './_components/dashboard-nav';
import HeaderTitle from './_components/header-title';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Çıkış Yapıldı',
        description: 'Başarıyla çıkış yaptınız.',
      });
      router.push('/');
    } catch {
      toast({
        title: 'Hata',
        description: 'Çıkış yapılırken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

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
              <AvatarImage
                src={user?.photoURL || `https://placehold.co/40x40.png`}
                data-ai-hint="profile picture"
                alt={userData?.displayName || 'User'}
              />
              <AvatarFallback>
                {userData?.displayName?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {userData ? (
                <>
                  <p className="font-semibold text-sm truncate">
                    {userData.displayName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userData.email}
                  </p>
                </>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-32" />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
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
            <SheetContent side="left" className="w-64 p-0 flex flex-col">
              <div className="p-4 border-b">
                <Logo inSidebar />
              </div>
              <nav className="p-4 flex-1">
                <DashboardNav />
              </nav>
              <div className="p-4 border-t mt-auto">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Çıkış Yap
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <HeaderTitle />
          </div>
        </header>
        <main className="flex-1 p-6 bg-muted/40 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
