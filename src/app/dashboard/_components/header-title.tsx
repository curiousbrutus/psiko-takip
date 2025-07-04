'use client';

import { usePathname } from 'next/navigation';

export default function HeaderTitle() {
    const pathname = usePathname();

    let title = "Kontrol Paneli";
    if (pathname.startsWith('/dashboard/journey')) {
        title = "Günlük Yolculuk";
    } else if (pathname.startsWith('/dashboard/tests')) {
        title = "Testler";
    } else if (pathname.startsWith('/dashboard/profile')) {
        title = "Profil";
    } else if (pathname.startsWith('/dashboard/settings')) {
        title = "Ayarlar";
    }

    return <h1 className="text-lg font-semibold">{title}</h1>;
}
