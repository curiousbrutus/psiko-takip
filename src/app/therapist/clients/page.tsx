
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, DocumentData } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ArrowRight, PlusCircle, Users } from 'lucide-react';

interface Client extends DocumentData {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    lastActivity?: string;
    status: 'Aktif' | 'Pasif';
}


export default function ClientsPage() {
    const { user, userData } = useAuth();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            if (!user || !userData || !userData.danisanlarim || userData.danisanlarim.length === 0) {
                setLoading(false);
                return;
            }

            try {
                // Fetch client user data
                const clientsQuery = query(collection(db, 'users'), where('__name__', 'in', userData.danisanlarim));
                const clientsSnapshot = await getDocs(clientsQuery);
                const clientDocs = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // Fetch gamification data for each client
                const clientsWithDetails = await Promise.all(
                    clientDocs.map(async (clientDoc) => {
                        const gamificationRef = doc(db, 'gamification', clientDoc.id);
                        const gamificationSnap = await getDoc(gamificationRef);
                        
                        let lastActivity = 'Aktivite yok';
                        let status: 'Aktif' | 'Pasif' = 'Pasif';

                        if (gamificationSnap.exists()) {
                            const gamificationData = gamificationSnap.data();
                            const lastActivityDate = gamificationData.lastActivityDate as Timestamp;
                            if (lastActivityDate) {
                                lastActivity = formatDistanceToNow(lastActivityDate.toDate(), { addSuffix: true, locale: tr });
                                
                                // if last activity was within the last 7 days, consider active
                                const oneWeekAgo = new Date();
                                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                                if(lastActivityDate.toDate() > oneWeekAgo) {
                                    status = 'Aktif';
                                }
                            }
                        }
                        
                        return {
                            id: clientDoc.id,
                            displayName: clientDoc.displayName,
                            email: clientDoc.email,
                            photoURL: clientDoc.photoURL,
                            lastActivity,
                            status
                        };
                    })
                );

                setClients(clientsWithDetails);

            } catch (error) {
                console.error("Error fetching clients:", error);
                toast({ title: "Hata", description: "Danışanlar getirilemedi.", variant: "destructive" });
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [user, userData, toast]);


    const renderSkeleton = () => (
        [...Array(3)].map((_, i) => (
            <TableRow key={i}>
                <TableCell>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                </TableCell>
                <TableCell>
                    <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                     <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-9 w-32 rounded-md" />
                </TableCell>
            </TableRow>
        ))
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Danışanlarım</h1>
                    <p className="text-muted-foreground">Danışanlarınızın listesini ve ilerlemelerini buradan takip edin.</p>
                </div>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Yeni Danışan Ekle
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" /> Danışan Listesi
                    </CardTitle>
                    <CardDescription>
                        Toplam {clients.length} danışanınız bulunmaktadır.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Danışan</TableHead>
                                <TableHead>Son Aktivite</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">İşlemler</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && renderSkeleton()}
                            {!loading && clients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Henüz bir danışanınız yok.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={client.photoURL} data-ai-hint="profile picture" />
                                                <AvatarFallback>{client.displayName?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{client.displayName}</div>
                                                <div className="text-sm text-muted-foreground">{client.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.lastActivity}</TableCell>
                                    <TableCell>
                                        <Badge variant={client.status === 'Aktif' ? 'default' : 'secondary'}>{client.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/therapist/clients/${client.id}`}>
                                                Profili Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
