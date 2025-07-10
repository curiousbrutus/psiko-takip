
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, onSnapshot, updateDoc, DocumentData } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CollaborativeTaskPage() {
    const { user, userData } = useAuth();
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const taskId = params.taskId as string;

    const [taskData, setTaskData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [clientContent, setClientContent] = useState('');
    const [therapistComment, setTherapistComment] = useState('');

    const isTherapist = userData?.role === 'terapist';

    useEffect(() => {
        if (!taskId) return;

        const taskRef = doc(db, 'collaborativeTasks', taskId);
        const unsubscribe = onSnapshot(taskRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setTaskData(data);
                setClientContent(data.fields.situation?.clientContent || '');
                setTherapistComment(data.fields.situation?.therapistComment || ''); // Example for one field
                setLoading(false);
            } else {
                toast({ title: 'Hata', description: 'Görev bulunamadı.', variant: 'destructive' });
                router.push(isTherapist ? '/therapist/clients' : '/dashboard/journey');
            }
        });

        return () => unsubscribe();
    }, [taskId, router, toast, isTherapist]);

    const handleClientContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setClientContent(e.target.value);
    };

    const handleSaveClientContent = async () => {
        if (!taskId) return;
        const taskRef = doc(db, 'collaborativeTasks', taskId);
        try {
            await updateDoc(taskRef, {
                'fields.situation.clientContent': clientContent
            });
            toast({ title: 'Kaydedildi', description: 'Düşünceleriniz kaydedildi.' });
        } catch (error) {
            toast({ title: 'Hata', description: 'Kaydedilirken bir sorun oluştu.', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (!taskData) return null;


    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
            </Button>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{taskData.title}</CardTitle>
                    <CardDescription>
                        {isTherapist ? `${taskData.clientName} için atanan görev.` : `Terapistiniz tarafından atanan görevi tamamlayın.`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* This is a simplified example for one field. A real implementation would map over taskData.fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <Label htmlFor="durum" className="text-lg font-semibold">Durum</Label>
                            <p className="text-sm text-muted-foreground mb-2">Hoşa gitmeyen duygulara yol açan olayı veya düşünceyi tanımlayın.</p>
                            <Textarea
                                id="durum"
                                placeholder="Örn: Patronum e-postama hemen yanıt vermedi..."
                                value={clientContent}
                                onChange={handleClientContentChange}
                                onBlur={handleSaveClientContent}
                                disabled={isTherapist}
                                rows={5}
                            />
                        </div>

                         <div className="bg-muted/50 p-4 rounded-md">
                            <Label htmlFor="terapist-yorum" className="text-lg font-semibold">Terapist Yorumu</Label>
                            <p className="text-sm text-muted-foreground mb-2">Danışanınızı yönlendirmek için sorular sorun veya yorum yapın.</p>
                            <Textarea
                                id="terapist-yorum"
                                placeholder="Terapist yorumu..."
                                value={therapistComment}
                                // onChange and onSave for therapist to be implemented
                                disabled={!isTherapist}
                                rows={5}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button disabled>Görevi Tamamlandı Olarak İşaretle</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

    