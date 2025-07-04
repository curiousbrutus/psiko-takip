'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FlaskConical, Settings, User, Route } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
    { href: '/dashboard/journey', label: 'Günlük Yolculuk', icon: Route },
    { href: '/dashboard/tests', label: 'Testler', icon: FlaskConical },
    { href: '/dashboard/profile', label: 'Profil', icon: User },
    { href: '/dashboard/settings', label: 'Ayarlar', icon: Settings },
];

export default function DashboardNav() {
    const pathname = usePathname();

    return (
        <ul className="space-y-2">
            {navItems.map((item) => (
                <li key={item.href}>
                    <Button
                        asChild
                        variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'default' : 'ghost'}
                        className="w-full justify-start"
                    >
                        <Link href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Link>
                    </Button>
                </li>
            ))}
        </ul>
    );
}
