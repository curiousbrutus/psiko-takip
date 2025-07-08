'use client';

import { usePathname } from 'next/navigation';

export default function TherapistHeaderTitle() {
    const pathname = usePathname();

    let title = "Kontrol Paneli";
    if (pathname === '/therapist/clients') {
        title = "Danışanlarım";
    } else if (pathname.startsWith('/therapist/clients/')) {
        title = "Danışan Profili";
    } else if (pathname === '/therapist/calendar') {
        title = "Takvim";
    } else if (pathname.startsWith('/therapist/settings')) {
        title = "Ayarlar";
    }

    return <h1 className="text-lg font-semibold">{title}</h1>;
}
