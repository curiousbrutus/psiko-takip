
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, orderBy, getDocs, DocumentData, Timestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Calendar, FileText, CheckSquare, BarChart2, Lightbulb, ShieldCheck, ClipboardList, BrainCircuit, Users, HeartPulse, Wind, MessageSquare, Star, TrendingUp, AlertTriangle, MessageCircle, Edit } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';


interface SharedJournal extends DocumentData {
    id: string;
    content: string;
    prompt: string;
    createdAt: Timestamp;
}

// Mock data for demo mode
const mockClientData = {
    displayName: 'Mehmet Öztürk',
    email: 'mehmet.ozturk@example.com',
    photoURL: 'https://placehold.co/80x80.png',
};

const mockSharedJournals: SharedJournal[] = [
    {
        id: 'journal1',
        prompt: 'Bugün minnettar olduğun 3 şey nedir?',
        content: '1. Sabah kahvesinin kokusu.\n2. Uzun bir aradan sonra bir arkadaşımla konuşmak.\n3. Akşam yürüyüşündeki serin hava.',
        createdAt: new Timestamp(Math.floor(Date.now() / 1000) - 86400, 0), // 1 day ago
    },
];

const mockTestResults: DocumentData[] = [
    {
        id: 'result1',
        testName: 'Tükenmişlik Envanteri',
        createdAt: new Timestamp(Math.floor(Date.now() / 1000) - 86400 * 3, 0), // 3 days ago
        analysis: {
            severity: 'Orta Düzeyde Tükenmişlik Riski',
            insights: 'Kullanıcı, iş yükü ve duygusal yorgunluk arasında bir denge kurmakta zorlanıyor olabilir. Özellikle kişisel başarı hissi son zamanlarda azalmış görünüyor.',
            guidance: 'Kısa molalar vermek, iş dışında hobilere zaman ayırmak ve bir sonraki seansta bu duyguları konuşmak faydalı olabilir. Sınır koyma üzerine çalışılabilir.',
        }
    }
];


export default function ClientProfilePage() {
    const { user, userData: therapistData } = useAuth();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const clientId = params.clientId as string;
    
    const [clientData, setClientData] = useState<DocumentData | null>(null);
    const [sharedJournals, setSharedJournals] = useState<SharedJournal[]>([]);
    const [testResults, setTestResults] = useState<DocumentData[]>([]);
    
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingJournals, setLoadingJournals] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!user || !clientId) return;

            if (therapistData && (!therapistData.danisanlarim || !therapistData.danisanlarim.includes(clientId))) {
                toast({ title: "Yetkisiz Erişim", description: "Bu danışanın profilini görüntüleme yetkiniz yok.", variant: "destructive" });
                router.push('/therapist/dashboard');
                return;
            }

            try {
                // Fetch client data
                setLoadingClient(true);
                const clientDocRef = doc(db, 'users', clientId);
                const clientDocSnap = await getDoc(clientDocRef);

                if (clientDocSnap.exists()) {
                    setClientData(clientDocSnap.data());
                } else {
                    toast({ title: "Hata", description: "Danışan bulunamadı.", variant: "destructive" });
                    router.push('/therapist/clients');
                    return; 
                }
                setLoadingClient(false);

                // Fetch shared journals
                setLoadingJournals(true);
                const journalsQuery = query(
                    collection(db, 'journalEntries'),
                    where('userId', '==', clientId),
                    where('isShared', '==', true),
                    orderBy('createdAt', 'desc')
                );
                const journalsSnapshot = await getDocs(journalsQuery);
                const journals = journalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedJournal));
                setSharedJournals(journals);
                setLoadingJournals(false);

                // Fetch test results
                setLoadingResults(true);
                const resultsQuery = query(
                    collection(db, 'testSubmissions'),
                    where('userId', '==', clientId),
                    orderBy('createdAt', 'desc')
                );
                const resultsSnapshot = await getDocs(resultsQuery);
                const results = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTestResults(results);
                setLoadingResults(false);

            } catch (error) {
                console.error("Error fetching client data:", error);
                toast({ title: "Hata", description: "Veriler alınırken bir hata oluştu.", variant: "destructive" });
                 setLoadingClient(false);
                 setLoadingJournals(false);
                 setLoadingResults(false);
            }
        };

        if (user && therapistData) {
            fetchAllData();
        } else if (!user && clientId === 'client2') {
            // Demo mode for Mehmet Öztürk
            setClientData(mockClientData);
            setSharedJournals(mockSharedJournals);
            setTestResults(mockTestResults);
            setLoadingClient(false);
            setLoadingJournals(false);
            setLoadingResults(false);
        } else if (!user) {
            toast({ title: "Giriş Gerekli", description: "Danışan profilini görmek için lütfen giriş yapın.", variant: "destructive" });
            router.push('/login');
        }
    }, [user, clientId, therapistData, router, toast]);

    const renderJournalSkeleton = () => (
        <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );

    const renderResultsSkeleton = () => (
         <div className="space-y-4">
            {[...Array(1)].map((_, i) => (
                 <Skeleton key={i} className="h-24 w-full rounded-md" />
            ))}
        </div>
    );
    
    if (loadingClient) {
        return (
             <div className="space-y-4">
                <Skeleton className="h-9 w-40" />
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </CardHeader>
                </Card>
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    if (!clientData) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/therapist/clients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tüm Danışanlar
                    </Link>
                </Button>
                 <Card>
                    <CardHeader className="flex flex-row items-center gap-6 space-y-0">
                         <Avatar className="h-20 w-20 border">
                            <AvatarImage src={clientData.photoURL} data-ai-hint="profile picture" />
                            <AvatarFallback>{clientData.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <CardTitle className="text-2xl">{clientData.displayName}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4" /> {clientData.email}
                            </CardDescription>
                             <div className="mt-2 text-sm text-muted-foreground">Genel ilerleme durumu yakında burada gösterilecek.</div>
                        </div>
                        <Button>
                            <Calendar className="mr-2 h-4 w-4" />
                            Yeni Randevu
                        </Button>
                    </CardHeader>
                </Card>
            </div>

            <Tabs defaultValue="briefing" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="briefing">
                        <Star className="mr-2 h-4 w-4" /> Seans Brifingi
                    </TabsTrigger>
                    <TabsTrigger value="insights">
                        <BrainCircuit className="mr-2 h-4 w-4" /> İçgörüler
                    </TabsTrigger>
                    <TabsTrigger value="assignments">
                        <CheckSquare className="mr-2 h-4 w-4" /> Görevler & Atamalar
                    </TabsTrigger>
                    <TabsTrigger value="journals">
                        <FileText className="mr-2 h-4 w-4" /> Paylaşılan Günlükler
                    </TabsTrigger>
                    <TabsTrigger value="results">
                        <BarChart2 className="mr-2 h-4 w-4" /> Test Sonuçları
                    </TabsTrigger>
                </TabsList>
                
                <TabsContent value="briefing" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Mehmet Öztürk ile Yaklaşan Seans Brifingi</CardTitle>
                            <CardDescription>
                                Tarih: {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}. Bu özet, seansa hazırlanmanıza yardımcı olmak için oluşturulmuştur.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold flex items-center"><MessageSquare className="mr-2 h-5 w-5 text-primary" />Danışanın Gündemi</h3>
                                <Alert className="border-primary/50 bg-primary/10">
                                    <AlertTitle className="font-bold">Danışanınız bu konuyu seansta konuşmak istiyor:</AlertTitle>
                                    <AlertDescription>
                                         <p className="font-semibold mt-2">"Bugün minnettar olduğun 3 şey nedir?" başlıklı günlükten:</p>
                                         <p className="italic mt-1">"Sabah kahvesinin kokusu, bir arkadaşla konuşmak ve akşam yürüyüşü..."</p>
                                    </AlertDescription>
                                </Alert>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center"><TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" /> Ruh Hali Trendi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">Geçen haftaya göre <span className="font-bold text-green-600">daha stabil</span>. Ayşe'nin bildirdiği 'mutlu' gün sayısı %15 arttı.</p>
                                    </CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center"><ClipboardList className="mr-2 h-4 w-4 text-muted-foreground" /> Önceki Seans Hedefi</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">"İş yerindeki stresle başa çıkmak için 'hayır' deme pratiği yapmak."</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base flex items-center"><AlertTriangle className="mr-2 h-4 w-4 text-muted-foreground" /> Alarm Zilleri</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm">Son seanstan bu yana kriz sinyali <span className="font-bold">tespit edilmedi</span>.</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="outline">Brifingi Yazdır</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>İçgörü Paneli</CardTitle>
                            <CardDescription>
                                Danışanınızın verilerinden elde edilen anlamlı özetler ve korelasyonlar (Son 30 gün).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Anlamlı Korelasyonlar</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <Wind className="h-4 w-4" />
                                        <AlertTitle className="font-semibold">Nefes Egzersizi &amp; Ruh Hali</AlertTitle>
                                        <AlertDescription>
                                            Danışanınız, 'Nefes Egzersizi' yaptığı günlerde ruh halini <span className="font-bold text-primary">%40 daha pozitif</span> işaretleme eğiliminde.
                                        </AlertDescription>
                                    </Alert>
                                    <Alert>
                                        <HeartPulse className="h-4 w-4" />
                                        <AlertTitle className="font-semibold">Endişe &amp; Günlük Yazma</AlertTitle>
                                        <AlertDescription>
                                           'Endişeli' ruh hali işaretlendiğinde, o gün serbest günlük yazma aktivitesini tamamlama olasılığı <span className="font-bold text-primary">%60 daha yüksek.</span> Bu, yazmayı bir başa çıkma mekanizması olarak kullandığını gösterebilir.
                                        </AlertDescription>
                                    </Alert>
                                     <Alert>
                                        <Users className="h-4 w-4" />
                                        <AlertTitle className="font-semibold">Sosyal Etkileşim &amp; Ruh Hali</AlertTitle>
                                        <AlertDescription>
                                           "Aile" kelimesinin geçtiği günlüklerde, "Mutlu" ruh hali işaretlenme oranı diğer günlere göre daha düşük. Bu konunun seanslarda keşfedilmesi faydalı olabilir.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Günlüklerden Kelime Bulutu</CardTitle>
                                     <CardDescription>Danışanın son günlüklerinde en sık kullandığı kelimeler.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2 items-center justify-center p-8 rounded-md bg-muted/50">
                                    <Badge variant="default" className="text-3xl h-auto py-2 px-4">kaygı</Badge>
                                    <Badge variant="secondary" className="text-lg">iş</Badge>
                                    <Badge variant="secondary" className="text-2xl h-auto py-1 px-3">stres</Badge>
                                    <Badge variant="secondary" className="text-md">yorgun</Badge>
                                    <Badge variant="default" className="text-xl h-auto py-1 px-3">aile</Badge>
                                    <Badge variant="secondary" className="text-lg">uyku</Badge>
                                    <Badge variant="secondary" className="text-md">zaman</Badge>
                                    <Badge variant="default" className="text-2xl h-auto py-1 px-3">belirsizlik</Badge>
                                     <Badge variant="secondary" className="text-md">ilişki</Badge>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="assignments" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>İnteraktif Terapötik Araçlar</CardTitle>
                            <CardDescription>
                                Danışanınızla birlikte BDT formları gibi yapılandırılmış araçlar üzerinde çalışın. Bu, ödevleri daha etkileşimli ve "ortak bir proje" haline getirir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-end">
                                <Button disabled>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Yeni Görev Ata (Yakında)
                                </Button>
                            </div>
                            <Card className="border-dashed">
                                <CardHeader>
                                    <CardTitle>Atanmış Görevler</CardTitle>
                                </CardHeader>
                                <CardContent className="text-center text-muted-foreground py-10">
                                    <p>Henüz atanmış interaktif bir görev yok.</p>
                                    <p className="text-sm">"Yeni Görev Ata" butonu ile Düşünce Kaydı gibi araçlar atayabilirsiniz.</p>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="journals" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paylaşılan Günlükler</CardTitle>
                            <CardDescription>
                                Danışanın sizinle paylaşmayı seçtiği günlük kayıtları ve düşünceleri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loadingJournals ? (
                                renderJournalSkeleton()
                            ) : sharedJournals.length > 0 ? (
                                <div className="space-y-4">
                                    {sharedJournals.map(journal => (
                                        <Card key={journal.id} className="bg-muted/30">
                                            <CardHeader>
                                                <CardTitle className="text-lg">{journal.prompt}</CardTitle>
                                                <CardDescription>
                                                    {format(journal.createdAt.toDate(), "d MMMM yyyy, HH:mm", { locale: tr })}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="whitespace-pre-wrap">{journal.content}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>Danışanınız henüz sizinle bir günlük paylaşmadı.</p>
                                    <p className="text-sm mt-1">Danışanınız, "Günlük Yolculuk" sayfasındaki günlük bölümlerinde "Terapistle Paylaş" seçeneğini kullanarak sizinle paylaşımlarda bulunabilir.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="results" className="mt-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>Test Sonuçları</CardTitle>
                            <CardDescription>
                                Danışanın tamamladığı testlerin sonuçlarını ve yapay zeka analizlerini görüntüleyin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {loadingResults ? (
                                renderResultsSkeleton()
                            ) : testResults.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                    {testResults.map(result => (
                                        <AccordionItem value={result.id} key={result.id} className="border rounded-md px-4 bg-muted/20">
                                            <AccordionTrigger>
                                                <div className="flex justify-between w-full pr-4">
                                                  <span className="font-semibold">{result.testName}</span>
                                                  <span className="text-muted-foreground text-sm">{format(result.createdAt.toDate(), "d MMMM yyyy", { locale: tr })}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 pt-4">
                                                <Alert>
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <AlertTitle>{result.testName === 'Tükenmişlik Envanteri' ? 'Risk Seviyesi' : 'Şiddet'}</AlertTitle>
                                                    <AlertDescription>{result.analysis.severity}</AlertDescription>
                                                </Alert>
                                                <Alert>
                                                    <Lightbulb className="h-4 w-4" />
                                                    <AlertTitle>Kişiselleştirilmiş İçgörüler</AlertTitle>
                                                    <AlertDescription>{result.analysis.insights}</AlertDescription>
                                                </Alert>
                                                <Alert>
                                                    <ClipboardList className="h-4 w-4" />
                                                    <AlertTitle>Kişiselleştirilmiş Rehberlik</AlertTitle>
                                                    <AlertDescription>{result.analysis.guidance}</AlertDescription>
                                                </Alert>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>Danışanınız henüz bir test tamamlamadı.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
