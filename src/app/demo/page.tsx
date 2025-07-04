'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Logo } from '@/components/logo';
import { 
    LayoutDashboard, 
    Route, 
    FlaskConical, 
    ArrowRight, 
    Flame, 
    Trophy, 
    Award, 
    BarChart3,
    CheckCircle2,
    Sunrise,
    Sun,
    Sunset,
    BrainCircuit,
    Wind,
    Info
} from 'lucide-react';

const DemoNav = () => {
    const navItems = [
        { href: '#dashboard', label: 'Kontrol Paneli', icon: LayoutDashboard },
        { href: '#journey', label: 'Günlük Yolculuk', icon: Route },
        { href: '#tests', label: 'Testler', icon: FlaskConical },
    ];
    return (
        <ul className="space-y-2">
            {navItems.map((item) => (
                <li key={item.href}>
                    <Button
                        asChild
                        variant='ghost'
                        className="w-full justify-start"
                    >
                        <a href={item.href}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </a>
                    </Button>
                </li>
            ))}
        </ul>
    )
}

export default function DemoPage() {
    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-background">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-b md:border-r md:border-b-0 bg-card p-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <Logo inSidebar />
                    <Button asChild variant="outline" className="md:hidden">
                        <Link href="/">Ana Sayfa</Link>
                    </Button>
                </div>
                <nav className="mt-4">
                    <DemoNav />
                </nav>
                 <div className="mt-auto pt-4 border-t hidden md:block">
                    <Button asChild className="w-full">
                        <Link href="/register">Kayıt Ol ve Başla</Link>
                    </Button>
                 </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-sm px-6">
                     <Alert variant="default" className="w-full border-none shadow-none p-0 bg-transparent">
                        <Info className="h-5 w-5 text-primary" />
                        <AlertTitle className="font-semibold">Deneme Modu</AlertTitle>
                        <AlertDescription>
                            Şu anda uygulamanın deneme sürümünü görüntülüyorsunuz. <Link href="/register" className="underline font-medium">Kayıt olarak</Link> tüm özelliklere erişin.
                        </AlertDescription>
                    </Alert>
                </header>

                <main className="flex-1 p-6 bg-muted/40 overflow-auto">
                    {/* Dashboard Section */}
                    <section id="dashboard" className="space-y-6 scroll-mt-20">
                        <div className="flex justify-between items-start">
                             <div>
                                <h1 className="text-3xl font-bold font-headline">Tekrar hoş geldiniz!</h1>
                                <p className="text-muted-foreground">Zihinsel sağlık yolculuğun seni bekliyor.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-card p-3 rounded-lg shadow-sm border">
                                <Flame className="h-6 w-6 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold leading-none">7</span>
                                    <span className="text-xs text-muted-foreground">Günlük Seri</span>
                                </div>
                            </div>
                        </div>

                        <Card className="bg-primary/10 border-primary/20">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Bugünkü Yolculuğuna Hazır mısın?</CardTitle>
                                    <CardDescription>Zihinsel esenliğin için günlük görevlerini tamamla ve serini devam ettir.</CardDescription>
                                </div>
                                <Button asChild>
                                    <a href="#journey">
                                        Yolculuğa Başla <ArrowRight className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                            </CardHeader>
                        </Card>
                        
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-headline">İlerleme Paneli</h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Lig Sıralaması</CardTitle>
                                        <Trophy className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Elmas Ligi</div>
                                        <p className="text-xs text-muted-foreground">Sıralamada #3 sıradasın</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Başarımlar</CardTitle>
                                        <Award className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">12 Rozet</div>
                                        <p className="text-xs text-muted-foreground">Son kazanılan: Zen Ustası</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-medium">Ruh Hali Takvimi</CardTitle>
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">Çoğunlukla Sakin</div>
                                        <p className="text-xs text-muted-foreground">Son 7 günün analizi</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>
                    
                    {/* Journey Section */}
                     <section id="journey" className="space-y-6 mt-12 scroll-mt-20">
                         <div>
                            <h1 className="text-3xl font-bold font-headline">Günlük Yolculuk</h1>
                            <p className="text-muted-foreground">Her gün küçük bir adım atarak zihinsel sağlığını güçlendir.</p>
                        </div>
                        <Accordion type="multiple" defaultValue={["item-1"]} className="w-full space-y-4">
                            <AccordionItem value="item-1" className="border-none opacity-50 cursor-not-allowed">
                                <Card>
                                    <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden" disabled>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                        <Sunrise className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl text-left">Sabah Başlangıcı</CardTitle>
                                            <p className="text-sm text-muted-foreground font-normal">Güne bilinçli bir başlangıç yap.</p>
                                        </div>
                                        </div>
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    </AccordionTrigger>
                                </Card>
                            </AccordionItem>
                             <AccordionItem value="item-2" className="border-none">
                                <Card>
                                    <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden" disabled>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                        <Sun className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl text-left">Gün İçi Destek</CardTitle>
                                            <p className="text-sm text-muted-foreground font-normal">İhtiyaç duyduğunda kendine bir mola ver.</p>
                                        </div>
                                        </div>
                                    </div>
                                    </AccordionTrigger>
                                     <AccordionContent className="p-6 pt-0">
                                        <p className="text-muted-foreground">Nefes egzersizleri ve BDT mini görevleri gibi özellikler, gün içinde bunaldığınız anlarda size destek olmak için tasarlandı. Tam erişim için kayıt olun.</p>
                                        <Button className="mt-4" disabled>
                                            <Wind className="mr-2 h-4 w-4" /> Bir Mola Ver
                                        </Button>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                             <AccordionItem value="item-3" className="border-none">
                                <Card>
                                    <AccordionTrigger className="p-6 hover:no-underline [&[data-state=open]>div>svg.lucide-check-circle-2]:hidden" disabled>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                        <Sunset className="h-6 w-6 text-primary" />
                                        <div>
                                            <CardTitle className="text-xl text-left">Akşam Değerlendirmesi</CardTitle>
                                            <p className="text-sm text-muted-foreground font-normal">Günü yansıt ve zihnini dinlendir.</p>
                                        </div>
                                        </div>
                                    </div>
                                    </AccordionTrigger>
                                     <AccordionContent className="p-6 pt-0">
                                        <p className="text-muted-foreground">Minnettarlık günlüğü ve serbest yazma gibi araçlarla günü değerlendirin. Gelişiminizi takip edin ve isterseniz terapistinizle paylaşın. Tam erişim için kayıt olun.</p>
                                    </AccordionContent>
                                </Card>
                            </AccordionItem>
                        </Accordion>
                     </section>

                     {/* Tests Section */}
                     <section id="tests" className="space-y-6 mt-12 scroll-mt-20">
                        <div>
                            <h1 className="text-3xl font-bold font-headline">Mevcut Testler</h1>
                            <p className="text-muted-foreground">
                            Kendi kendine değerlendirmenize başlamak için aşağıdan bir test seçin.
                            </p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="flex flex-col">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <BrainCircuit className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle>Beck Depresyon Envanteri (BDE-II)</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                <CardDescription>Depresyonun şiddetini ölçmek için en yaygın kullanılan psikometrik testlerden biri olan 21 soruluk çoktan seçmeli bir öz bildirim envanteri.</CardDescription>
                                </CardContent>
                                <CardFooter>
                                <Button className="w-full" disabled>
                                    Teste Başla <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                </CardFooter>
                            </Card>
                             <Card className="flex flex-col opacity-60">
                                <CardHeader>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-lg">
                                            <BrainCircuit className="h-6 w-6 text-primary" />
                                        </div>
                                        <CardTitle>Young Şema Ölçeği (YŞÖ)</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                <CardDescription>Gelişimimizin erken dönemlerinde başlayan, kendi kendini baltalayan duygusal ve bilişsel kalıplar olan Erken Dönem Uyumsuz Şemaları tanımlar.</CardDescription>
                                </CardContent>
                                <CardFooter>
                                <Button className="w-full" disabled>
                                    Yakında <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                </CardFooter>
                            </Card>
                        </div>
                     </section>
                </main>
            </div>
        </div>
    );
}