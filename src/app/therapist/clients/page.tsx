
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, DocumentData } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowRight, PlusCircle, Users, Loader2, MoreHorizontal } from 'lucide-react';

import { addClientAction, updateClientStatusAction } from './actions';

interface Client extends DocumentData {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    lastActivity?: string;
    status: 'Aktif' | 'Pasif' | 'Davet Edildi';
}

const addClientFormSchema = z.object({
  fullName: z.string().min(3, { message: 'Ad Soyad en az 3 karakter olmalıdır.' }),
  email: z.string().email({ message: 'Geçersiz e-posta adresi.' }),
  phone: z.string().optional(),
});
type AddClientFormValues = z.infer<typeof addClientFormSchema>;


export default function ClientsPage() {
    const { user, loading: authLoading } = useAuth();
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<AddClientFormValues>({
        resolver: zodResolver(addClientFormSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
        }
    });
    
    const fetchClients = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        
        setLoading(true);
        try {
            const clientsQuery = query(collection(db, 'users'), where('connectedTherapist', '==', user.uid));
            const clientsSnapshot = await getDocs(clientsQuery);
            const clientDocs = clientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            const clientsWithDetails = await Promise.all(
                clientDocs.map(async (clientDoc) => {
                    let lastActivity = 'Aktivite yok';
                    if (clientDoc.status !== 'Davet Edildi') {
                        const gamificationRef = doc(db, 'gamification', clientDoc.id);
                        const gamificationSnap = await getDoc(gamificationRef);
                        if (gamificationSnap.exists()) {
                            const gamificationData = gamificationSnap.data();
                            const lastActivityDate = gamificationData.lastActivityDate as Timestamp;
                            if (lastActivityDate) {
                                lastActivity = formatDistanceToNow(lastActivityDate.toDate(), { addSuffix: true, locale: tr });
                            }
                        }
                    } else {
                        lastActivity = 'Davet bekleniyor';
                    }
                    
                    return {
                        id: clientDoc.id,
                        displayName: clientDoc.displayName,
                        email: clientDoc.email,
                        photoURL: clientDoc.photoURL,
                        lastActivity,
                        status: clientDoc.status || 'Pasif'
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
    }, [user, toast]);

    useEffect(() => {
        if (!authLoading) {
            fetchClients();
        }
    }, [authLoading, fetchClients]);

    async function onSubmit(values: AddClientFormValues) {
        if (!user) {
            toast({ title: "Hata", description: "Giriş yapmalısınız.", variant: "destructive"});
            return;
        }

        const result = await addClientAction({ ...values, therapistId: user.uid });
        
        toast({
            title: result.success ? "Başarılı" : "Hata",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });

        if (result.success) {
            setIsDialogOpen(false);
            form.reset();
            fetchClients();
        }
    }
    
    async function handleStatusChange(clientId: string, status: 'Aktif' | 'Pasif') {
        const result = await updateClientStatusAction({ clientId, status });
        toast({
            title: result.success ? "Başarılı" : "Hata",
            description: result.message,
            variant: result.success ? "default" : "destructive",
        });
        if (result.success) {
            fetchClients();
        }
    }

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
                <TableCell className="text-right">
                    <Skeleton className="h-9 w-32 rounded-md" />
                </TableCell>
            </TableRow>
        ))
    );

    const getBadgeVariant = (status: Client['status']) => {
        switch (status) {
            case 'Aktif':
                return 'default';
            case 'Davet Edildi':
                return 'outline';
            case 'Pasif':
            default:
                return 'secondary';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Danışanlarım</h1>
                    <p className="text-muted-foreground">Danışanlarınızın listesini ve ilerlemelerini buradan takip edin.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Yeni Danışan Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Yeni Danışan Ekle</DialogTitle>
                            <DialogDescription>
                                Yeni danışanınızın bilgilerini girin. Danışan, bu e-posta adresi ile kayıt olduğunda hesabınıza otomatik olarak bağlanacaktır.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Ad Soyad</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ali Veli" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>E-posta</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="danisan@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telefon Numarası (İsteğe Bağlı)</FormLabel>
                                            <FormControl>
                                                <Input type="tel" placeholder="555 123 4567" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">İptal</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Danışanı Davet Et
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
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
                                        <Badge variant={getBadgeVariant(client.status)}>{client.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button asChild variant="outline" size="sm" disabled={client.status === 'Davet Edildi'}>
                                                <Link href={`/therapist/clients/${client.id}`}>
                                                    Profili Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'Aktif')}>Aktif Yap</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(client.id, 'Pasif')}>Pasif Yap</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
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
