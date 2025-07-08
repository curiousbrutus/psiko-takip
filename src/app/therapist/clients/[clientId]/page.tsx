
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, User, Mail, Activity, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ClientProfilePage() {
    const { user, userData: therapistData } = useAuth();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    
    const clientId = params.clientId as string;
    
    const [clientData, setClientData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClientData = async () => {
            if (!user || !therapistData) {
                return;
            }

            // Security check: ensure the therapist is allowed to see this client
            if (!therapistData.danisanlarim || !therapistData.danisanlarim.includes(clientId)) {
                toast({ title: "Yetkisiz Erişim", description: "Bu danışanın profilini görüntüleme yetkiniz yok.", variant: "destructive" });
                router.push('/therapist/dashboard');
                return;
            }

            try {
                const clientDocRef = doc(db, 'users', clientId);
                const clientDocSnap = await getDoc(clientDocRef);

                if (clientDocSnap.exists()) {
                    setClientData(clientDocSnap.data());
                } else {
                    toast({ title: "Hata", description: "Danışan bulunamadı.", variant: "destructive" });
                    router.push('/therapist/clients');
                }
            } catch (error) {
                console.error("Error fetching client data:", error);
                toast({ title: "Hata", description: "Danışan verileri alınırken bir hata oluştu.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        if (clientId && user && therapistData) {
            fetchClientData();
        }

    }, [user, therapistData, clientId, router, toast]);

    if (loading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" asChild>
                    <Link href="/therapist/clients">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Tüm Danışanlar
                    </Link>
                </Button>
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-1">
                        <CardHeader className="items-center text-center">
                            <Skeleton className="h-24 w-24 rounded-full" />
                            <Skeleton className="h-6 w-32 mt-4" />
                            <Skeleton className="h-4 w-40 mt-2" />
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                           <Skeleton className="h-10 w-full" />
                           <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                                <Skeleton className="h-4 w-64" />
                            </CardHeader>
                            <CardContent>
                               <Skeleton className="h-40 w-full" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }

    if (!clientData) {
        return null; // Or a more specific "not found" component
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild>
                <Link href="/therapist/clients">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tüm Danışanlar
                </Link>
            </Button>
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-1 self-start">
                    <CardHeader className="items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={clientData.photoURL} data-ai-hint="profile picture" />
                            <AvatarFallback>{clientData.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <CardTitle>{clientData.displayName}</CardTitle>
                        <CardDescription>{clientData.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                       <Button className="w-full" disabled>
                           <Activity className="mr-2" />
                           Aktivite Raporu
                       </Button>
                       <Button variant="outline" className="w-full" disabled>
                           <Calendar className="mr-2" />
                           Yeni Randevu
                       </Button>
                    </CardContent>
                </Card>
                 <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Paylaşılan Günlükler</CardTitle>
                             <CardDescription>
                                Danışanın sizinle paylaştığı günlük kayıtları.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-muted-foreground text-center py-8">Bu özellik yakında eklenecektir.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Ruh Hali Takvimi</CardTitle>
                            <CardDescription>
                                Danışanın ruh hali girişlerinin görselleştirilmesi.
                            </CardDescription>
                        </Header>
                        <CardContent>
                           <p className="text-muted-foreground text-center py-8">Bu özellik yakında eklenecektir.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
