import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BrainCircuit, Flame } from 'lucide-react';
import Link from 'next/link';

const availableTests = [
  {
    title: "Beck Depresyon Envanteri (BDE-II)",
    description: "Depresyonun şiddetini ölçmek için en yaygın kullanılan psikometrik testlerden biri olan 21 soruluk çoktan seçmeli bir öz bildirim envanteri.",
    href: "/dashboard/tests/beck-depression-inventory",
    Icon: BrainCircuit,
    enabled: true,
  },
   {
    title: "Tükenmişlik Envanteri",
    description: "İşle ilgili stresi, duygusal tükenmeyi ve mesleki doyumu değerlendirmek için tasarlanmış bir öz bildirim envanteri.",
    href: "/dashboard/tests/burnout-inventory",
    Icon: Flame,
    enabled: true,
  },
  {
    title: "Young Şema Ölçeği (YŞÖ)",
    description: "Gelişimimizin erken dönemlerinde başlayan, kendi kendini baltalayan duygusal ve bilişsel kalıplar olan Erken Dönem Uyumsuz Şemaları tanımlar.",
    href: "#",
    Icon: BrainCircuit,
    enabled: false,
  },
  {
    title: "MMPI Kısa Formu",
    description: "Kişilik özelliklerini ve psikopatolojiyi değerlendiren bir psikolojik test olan Minnesota Çok Yönlü Kişilik Envanteri'nin daha kısa bir versiyonu.",
    href: "#",
    Icon: BrainCircuit,
    enabled: false,
  },
];

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Mevcut Testler</h1>
        <p className="text-muted-foreground">
          Kendi kendine değerlendirmenize başlamak için aşağıdan bir test seçin.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableTests.map((test) => (
          <Card key={test.title} className="flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                        <test.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{test.title}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
              <CardDescription>{test.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" disabled={!test.enabled}>
                <Link href={test.href}>
                  {test.enabled ? 'Teste Başla' : 'Yakında'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
