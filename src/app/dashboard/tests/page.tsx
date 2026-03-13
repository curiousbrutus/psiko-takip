import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BrainCircuit, Flame } from 'lucide-react';
import Link from 'next/link';

const availableTests = [
  {
    title: 'Beck Depresyon Envanteri (BDE-II)',
    shortTitle: 'Beck Depresyon',
    description:
      'Depresyonun şiddetini ölçmek için en yaygın kullanılan psikometrik testlerden biri olan 21 soruluk çoktan seçmeli bir öz bildirim envanteri.',
    culturalNote: 'Türk toplumuna uyarlanmış geçerli bir araçtır.',
    duration: '10-15 dakika',
    questionCount: 21,
    difficulty: 'Kolay',
    href: '/dashboard/tests/beck-depression-inventory',
    Icon: BrainCircuit,
    enabled: true,
    category: 'Ruh Hali',
    color: 'bg-blue-500/10 text-blue-700 border-blue-200',
  },
  {
    title: 'Tükenmişlik Envanteri',
    shortTitle: 'Tükenmişlik',
    description:
      'İşle ilgili stresi, duygusal tükenmeyi ve mesleki doyumu değerlendirmek için tasarlanmış bir öz bildirim envanteri.',
    culturalNote: 'Türk çalışma kültürüne göre uyarlanmıştır.',
    duration: '8-12 dakika',
    questionCount: 22,
    difficulty: 'Orta',
    href: '/dashboard/tests/burnout-inventory',
    Icon: Flame,
    enabled: true,
    category: 'İş Yaşamı',
    color: 'bg-orange-500/10 text-orange-700 border-orange-200',
  },
  {
    title: 'Young Şema Ölçeği (YŞÖ)',
    shortTitle: 'Young Şema',
    description:
      'Gelişimimizin erken dönemlerinde başlayan, kendi kendini baltalayan duygusal ve bilişsel kalıplar olan Erken Dönem Uyumsuz Şemaları tanımlar.',
    culturalNote: 'Aile yapısı ve kültürel değerler göz önünde bulundurulur.',
    duration: '15-20 dakika',
    questionCount: 36,
    difficulty: 'Orta',
    href: '/dashboard/tests/young-schema-scale',
    Icon: BrainCircuit,
    enabled: true,
    category: 'Kişilik',
    color: 'bg-purple-500/10 text-purple-700 border-purple-200',
  },
  {
    title: 'MMPI Kısa Formu',
    shortTitle: 'MMPI',
    description:
      "Kişilik özelliklerini ve psikopatolojiyi değerlendiren bir psikolojik test olan Minnesota Çok Yönlü Kişilik Envanteri'nin daha kısa bir versiyonu.",
    culturalNote: 'Türk normlarına göre yorumlanır.',
    duration: '20-25 dakika',
    questionCount: 68,
    difficulty: 'Orta',
    href: '#',
    Icon: BrainCircuit,
    enabled: false,
    category: 'Kişilik',
    color: 'bg-green-500/10 text-green-700 border-green-200',
  },
];

export default function TestsPage() {
  const enabledTests = availableTests.filter(test => test.enabled);
  const disabledTests = availableTests.filter(test => !test.enabled);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
          Psikolojik Değerlendirmeler
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Aşağıdaki testleri tamamladıktan sonra sonuçlarınız doğrudan
          terapistinizle paylaşılacaktır. Terapistiniz sonuçları sizinle
          birlikte değerlendirecektir.
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary">🔒</span>
            <span>Kişisel ve Güvenli</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-primary">⭐</span>
            <span>Uzman Onaylı</span>
          </div>
        </div>
      </div>

      {/* Available Tests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Mevcut Testler</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {enabledTests.length} Test Mevcut
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {enabledTests.map((test, index) => (
            <Card
              key={test.title}
              className="group flex flex-col hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 border-l-primary animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                      <test.Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <Badge className={test.color + ' mb-2'}>
                        {test.category}
                      </Badge>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {test.shortTitle}
                      </CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {test.description}
                </CardDescription>

                <div className="p-3 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-sm text-muted-foreground italic">
                    💡 {test.culturalNote}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <span className="block h-4 w-4 mx-auto mb-1 text-muted-foreground">
                      ⏰
                    </span>
                    <div className="font-medium">{test.duration}</div>
                    <div className="text-muted-foreground">Süre</div>
                  </div>
                  <div className="text-center">
                    <BrainCircuit className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-medium">{test.questionCount}</div>
                    <div className="text-muted-foreground">Soru</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`inline-flex h-4 w-4 rounded-full mx-auto mb-1 ${
                        test.difficulty === 'Kolay'
                          ? 'bg-green-500'
                          : test.difficulty === 'Orta'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                    />
                    <div className="font-medium">{test.difficulty}</div>
                    <div className="text-muted-foreground">Zorluk</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4">
                <Button
                  asChild
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  size="lg"
                >
                  <Link href={test.href}>
                    Teste Başla
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Tests */}
      {disabledTests.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Yakında Gelecek Testler</h2>
            <Badge variant="secondary">Geliştirme Aşamasında</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {disabledTests.map((test, index) => (
              <Card
                key={test.title}
                className="flex flex-col opacity-75 relative overflow-hidden animate-fade-in"
                style={{
                  animationDelay: `${(enabledTests.length + index) * 100}ms`,
                }}
              >
                <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  Yakında
                </div>

                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted p-3 rounded-xl">
                      <test.Icon className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className={test.color + ' mb-2 opacity-50'}
                      >
                        {test.category}
                      </Badge>
                      <CardTitle className="text-xl text-muted-foreground">
                        {test.shortTitle}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <CardDescription className="text-base leading-relaxed">
                    {test.description}
                  </CardDescription>

                  <div className="grid grid-cols-3 gap-4 text-sm opacity-60">
                    <div className="text-center">
                      <span className="block h-4 w-4 mx-auto mb-1 text-muted-foreground">
                        ⏰
                      </span>
                      <div className="font-medium">{test.duration}</div>
                      <div className="text-muted-foreground">Süre</div>
                    </div>
                    <div className="text-center">
                      <BrainCircuit className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                      <div className="font-medium">{test.questionCount}</div>
                      <div className="text-muted-foreground">Soru</div>
                    </div>
                    <div className="text-center">
                      <div className="inline-flex h-4 w-4 rounded-full mx-auto mb-1 bg-muted" />
                      <div className="font-medium">{test.difficulty}</div>
                      <div className="text-muted-foreground">Zorluk</div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  <Button disabled className="w-full" size="lg">
                    Yakında Gelecek
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
