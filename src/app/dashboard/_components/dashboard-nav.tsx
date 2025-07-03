'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FlaskConical, Settings, User } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/tests', label: 'Tests', icon: FlaskConical },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
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
