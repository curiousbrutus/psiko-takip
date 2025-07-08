
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, collection, query, where, orderBy, getDocs, DocumentData, Timestamp } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Calendar, FileText, CheckSquare, BarChart2, Lightbulb, ShieldCheck, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


interface SharedJournal extends DocumentData {
    id: string;
    content: string;
    prompt: string;
    createdAt: Timestamp;
}

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
            {[...Array(2)].map((_, i) => (
                 <Skeleton key={i} className="h-14 w-full rounded-md" />
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
        )
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

            <Tabs defaultValue="journals" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
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

                <TabsContent value="assignments" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Görevler ve Atamalar</CardTitle>
                            <CardDescription>
                                Danışanınıza yeni görevler atayın ve mevcut görevlerin durumunu takip edin. Bu özellik yakında kullanıma sunulacaktır.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground py-16">
                            Bu bölüm geliştirme aşamasındadır.
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
