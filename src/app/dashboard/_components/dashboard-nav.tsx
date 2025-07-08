
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FlaskConical, Settings, User, Route, Sparkles, BookOpen, Calendar } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
    { href: '/dashboard/journey', label: 'Günlük Yolculuk', icon: Route },
    { href: '/dashboard/assistant', label: 'Dijital Asistan', icon: Sparkles },
    { href: '/dashboard/tests', label: 'Testler', icon: FlaskConical },
    { href: '/dashboard/education', label: 'Psikoeğitim', icon: BookOpen },
    { href: '/dashboard/calendar', label: 'Takvim', icon: Calendar },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
    { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
];

export default function DashboardNav() {
    const pathname = usePathname();

    return (
        <ul className="space-y-2">
            {navItems.map((item) => {
                // For the main dashboard link, it should be active only when the path is exactly '/dashboard'.
                // For other links, it should be active if the path starts with their href.
                const isActive = item.href === '/dashboard'
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                
                return (
                    <li key={item.href}>
                        <Button
                            asChild
                            variant={isActive ? 'default' : 'ghost'}
                            className="w-full justify-start"
                        >
                            <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    </li>
                );
            })}
        </ul>
    );
}
