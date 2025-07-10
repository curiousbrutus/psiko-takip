
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, DocumentData } from 'firebase/firestore';

import { assessments } from '@/lib/assessment-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { submitAssessmentAction } from '@/app/therapist/clients/[clientId]/task-actions';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function AssessmentPage() {
  const [taskData, setTaskData] = useState<DocumentData | null>(null);
  const [assessment, setAssessment] = useState<(typeof assessments)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const taskId = params.taskId as string;

  const formSchema = assessment ? z.object(
    Object.fromEntries(
      assessment.questions.map(q => [`q${q.id}`, z.string({ required_error: "Lütfen bir seçenek seçin." })])
    )
  ) : z.object({});

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (!taskId) return;

    const fetchTask = async () => {
      const taskRef = doc(db, 'assessmentTasks', taskId);
      const taskSnap = await getDoc(taskRef);
      if (taskSnap.exists()) {
        const data = taskSnap.data();
        if (data.status === 'completed') {
            setIsCompleted(true);
            return;
        }
        setTaskData(data);
        const foundAssessment = assessments.find(a => a.name === data.testName);
        if (foundAssessment) {
          setAssessment(foundAssessment as (typeof assessments)[0]);
        }
      } else {
        toast({ title: 'Hata', description: 'Değerlendirme bulunamadı.', variant: 'destructive' });
        router.push('/dashboard/journey');
      }
    };
    fetchTask();
  }, [taskId, router, toast]);

  useEffect(() => {
      // Reset form when assessment changes
      form.reset();
  }, [assessment, form]);


  async function onSubmit(values: FormValues) {
    if (!user || !assessment || !taskData) return;
    setIsLoading(true);

    const score = Object.values(values).reduce((sum, value) => sum + parseInt(value, 10), 0);
    
    let allianceScore: number | undefined;
    if (assessment.name === 'TherapeuticAlliance') {
        allianceScore = score / assessment.questions.length; // Calculate average
    }

    const result = await submitAssessmentAction({
        taskId,
        userId: user.uid,
        testName: assessment.name,
        answers: values,
        score,
        allianceScore,
    });

    if (result.success) {
      toast({
        title: "Değerlendirme Tamamlandı",
        description: "Yanıtlarınız terapistinizle paylaşıldı. (+30 XP)",
      });
      setIsCompleted(true);
    } else {
      toast({
        title: "Gönderim Başarısız",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  if (isCompleted) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Card className="mt-8 text-center max-w-lg">
                <CardHeader>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl mt-4">Değerlendirme Tamamlandı</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Yanıtlarınız başarıyla terapistinize gönderildi. Bu geri bildirimleriniz terapi sürecimiz için çok değerli.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/dashboard/journey">Günlük Yolculuğa Dön</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!assessment) {
      return (
         <div className="space-y-6">
            <Skeleton className="h-9 w-40" />
             <Skeleton className="h-6 w-1/2" />
             <Skeleton className="h-5 w-3/4" />
             <div className="space-y-4 pt-4">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader><Skeleton className="h-5 w-1/3" /></CardHeader>
                        <CardContent className="space-y-2">
                             <Skeleton className="h-8 w-full" />
                             <Skeleton className="h-8 w-full" />
                        </CardContent>
                    </Card>
                ))}
             </div>
         </div>
      )
  }

  return (
    <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
        </Button>
      <div>
        <h1 className="text-3xl font-bold font-headline">{assessment.title}</h1>
        <p className="text-muted-foreground">
          {assessment.description}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            {assessment.questions.map((q, index) => (
              <FormField
                key={q.id}
                control={form.control}
                name={`q${q.id}` as keyof FormValues}
                render={({ field }) => (
                  <Card>
                    <CardHeader>
                      <CardTitle>{index + 1}. {q.text}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {q.options.map(opt => (
                           <FormItem key={opt.score} className="flex items-center space-x-3 space-y-0 p-3 rounded-md hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <RadioGroupItem value={String(opt.score)} />
                              </FormControl>
                              <FormLabel className="font-normal w-full cursor-pointer">
                                {opt.text}
                              </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                      <FormMessage className="mt-2" />
                    </CardContent>
                  </Card>
                )}
              />
            ))}
          </div>

          <Button type="submit" size="lg" disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : "Tamamla ve Terapistime Gönder"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
