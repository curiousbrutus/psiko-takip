
'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { ArrowLeft, Mail, Calendar, FileText, CheckSquare, BarChart2, Lightbulb, ShieldCheck, ClipboardList, TrendingUp, AlertTriangle, MessageSquare, Star, Loader2, PlusCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { assignTaskAction, assignAssessmentAction } from './task-actions';
import ProgressChart from './_components/progress-chart';

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
    const [assignedTasks, setAssignedTasks] = useState<DocumentData[]>([]);
    const [assessmentResults, setAssessmentResults] = useState<DocumentData[]>([]);
    
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingJournals, setLoadingJournals] = useState(true);
    const [loadingResults, setLoadingResults] = useState(true);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [loadingAssessments, setLoadingAssessments] = useState(true);
    const [isAssigningTask, setIsAssigningTask] = useState(false);
    const [isAssigningAssessment, setIsAssigningAssessment] = useState(false);
    
    const isDemoMode = clientId.startsWith('demo-client');

    const fetchAllData = useCallback(async () => {
        if (isDemoMode) {
             setClientData({
                displayName: 'Ali Veli',
                email: 'danisan@ornek.com',
             });
             setSharedJournals([]);
             setTestResults([]);
             setAssignedTasks([]);
             setAssessmentResults([]);
             setLoadingClient(false);
             setLoadingJournals(false);
             setLoadingResults(false);
             setLoadingTasks(false);
             setLoadingAssessments(false);
             return;
        }

        if (!user || !clientId) return;

        if (therapistData && therapistData.danisanlarim && !therapistData.danisanlarim.includes(clientId)) {
            toast({ title: "Yetkisiz Erişim", description: "Bu danışanın profilini görüntüleme yetkiniz yok.", variant: "destructive" });
            router.push('/therapist/dashboard');
            return;
        }

        setLoadingClient(true);
        setLoadingJournals(true);
        setLoadingResults(true);
        setLoadingTasks(true);
        setLoadingAssessments(true);

        try {
            const clientDocRef = doc(db, 'users', clientId);
            const clientDocSnap = await getDoc(clientDocRef);
            if (clientDocSnap.exists()) {
                setClientData(clientDocSnap.data());
            } else {
                toast({ title: "Hata", description: "Danışan bulunamadı.", variant: "destructive" });
                router.push('/therapist/clients');
                return;
            }

            const journalsQuery = query(collection(db, 'journalEntries'), where('userId', '==', clientId), where('isShared', '==', true), orderBy('createdAt', 'desc'));
            const journalsSnapshot = await getDocs(journalsQuery);
            setSharedJournals(journalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedJournal)));
            
            const resultsQuery = query(collection(db, 'testSubmissions'), where('userId', '==', clientId), orderBy('createdAt', 'desc'));
            const resultsSnapshot = await getDocs(resultsQuery);
            setTestResults(resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            const tasksQuery = query(collection(db, 'collaborativeTasks'), where('clientId', '==', clientId), orderBy('assignedAt', 'desc'));
            const tasksSnapshot = await getDocs(tasksQuery);
            setAssignedTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            
            const assessmentsQuery = query(collection(db, 'assessmentResults'), where('userId', '==', clientId), orderBy('completedAt', 'asc'));
            const assessmentsSnapshot = await getDocs(assessmentsQuery);
            setAssessmentResults(assessmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), completedAt: doc.data().completedAt.toDate() })));
        } catch (error) {
            console.error("Error fetching client data:", error);
            toast({ title: "Hata", description: "Veriler alınırken bir hata oluştu.", variant: "destructive" });
        } finally {
            setLoadingClient(false);
            setLoadingJournals(false);
            setLoadingResults(false);
            setLoadingTasks(false);
            setLoadingAssessments(false);
        }
    }, [user, clientId, therapistData, router, toast, isDemoMode]);

    useEffect(() => {
        if (isDemoMode) {
            fetchAllData();
            return;
        }
        if (user && therapistData) {
            fetchAllData();
        }
    }, [user, therapistData, fetchAllData, isDemoMode]);
    
    const handleAssignTask = async () => {
        if (isDemoMode) {
             toast({ title: "Demo Modu", description: "Bu özellik için gerçek bir kullanıcı ile giriş yapmalısınız." });
             return;
        }
        if (!clientData || !user) return;
        setIsAssigningTask(true);
        const result = await assignTaskAction({
            clientId: clientId,
            clientName: clientData.displayName,
            therapistId: user.uid,
        });
        toast({
            title: result.success ? "Başarılı" : "Hata",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            fetchAllData(); 
        }
        setIsAssigningTask(false);
    };

    const handleAssignAssessment = async (testName: 'GAD-7' | 'PHQ-9' | 'TherapeuticAlliance') => {
        if (isDemoMode) {
             toast({ title: "Demo Modu", description: "Bu özellik için gerçek bir kullanıcı ile giriş yapmalısınız." });
             return;
        }
        if (!clientData || !user) return;
        setIsAssigningAssessment(true);
        const result = await assignAssessmentAction({
            clientId,
            clientName: clientData.displayName,
            therapistId: user.uid,
            testName,
        });
        toast({
            title: result.success ? "Başarılı" : "Hata",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            fetchAllData();
        }
        setIsAssigningAssessment(false);
    };

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
            <Skeleton className="h-24 w-full rounded-md" />
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

            <Tabs defaultValue="progress" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="progress">
                        <TrendingUp className="mr-2 h-4 w-4" /> İlerleme
                    </TabsTrigger>
                    <TabsTrigger value="briefing">
                        <Star className="mr-2 h-4 w-4" /> Seans Brifingi
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
                
                 <TabsContent value="progress" className="mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">Ölçülebilir İlerleme ve İttifak Paneli</CardTitle>
                                    <CardDescription>
                                        Danışanınızın standart ölçeklerdeki ilerlemesini ve terapötik ittifak geri bildirimlerini takip edin.
                                    </CardDescription>
                                </div>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button disabled={isAssigningAssessment}>
                                            {isAssigningAssessment ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                            Yeni Değerlendirme Ata
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleAssignAssessment('GAD-7')}>GAD-7 (Anksiyete)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAssignAssessment('PHQ-9')}>PHQ-9 (Depresyon)</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleAssignAssessment('TherapeuticAlliance')}>Terapötik İttifak</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-8">
                             {loadingAssessments ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                             ) : assessmentResults.length > 0 ? (
                                <ProgressChart data={assessmentResults} />
                             ) : (
                                <div className="text-center text-muted-foreground py-16">
                                    <p>Henüz tamamlanmış bir ilerleme değerlendirmesi yok.</p>
                                    <p className="text-sm mt-1">Yukarıdaki butonu kullanarak bir değerlendirme atayabilirsiniz.</p>
                                </div>
                             )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="briefing" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{clientData.displayName} ile Yaklaşan Seans Brifingi</CardTitle>
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
                                <Button onClick={handleAssignTask} disabled={isAssigningTask}>
                                    {isAssigningTask ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                    Yeni Düşünce Kaydı Ata
                                </Button>
                            </div>
                            <Card className="border">
                                <CardHeader>
                                    <CardTitle>Atanmış Görevler</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loadingTasks ? <p>Görevler yükleniyor...</p> : 
                                    assignedTasks.length > 0 ? (
                                        <div className="space-y-2">
                                            {assignedTasks.map(task => (
                                                <Link href={`/dashboard/tasks/${task.id}`} key={task.id}>
                                                    <div className="p-3 border rounded-md hover:bg-muted/50 transition-colors flex justify-between items-center">
                                                        <p className="font-semibold">{task.title}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-10">
                                            <p>Henüz atanmış interaktif bir görev yok.</p>
                                        </div>
                                    )}
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
