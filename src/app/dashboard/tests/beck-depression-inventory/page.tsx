'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { beckQuestions } from '@/lib/beck-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { analyzeBeckTest } from './actions';
import { Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object(
  Object.fromEntries(
    beckQuestions.map(q => [
      `q${q.id}`,
      z.string({ required_error: 'Lütfen bir seçenek seçin.' }),
    ])
  )
);

type FormValues = z.infer<typeof formSchema>;

export default function BeckDepressionInventoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);

    const result = await analyzeBeckTest(values);

    if (result.success) {
      toast({
        title: 'Test Tamamlandı',
        description: 'Sonuçlarınız terapistinizle paylaşıldı.',
      });
      setIsCompleted(true);
    } else {
      toast({
        title: 'Analiz Başarısız',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  }

  if (isCompleted) {
    return (
      <Card className="mt-8 text-center">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl mt-4">Testiniz Tamamlandı</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Sonuçlarınız başarıyla terapistinize gönderildi. Terapistiniz,
            sonuçları sizinle en kısa sürede değerlendirecektir.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/tests">Diğer Testlere Göz At</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">
          Beck Depresyon Envanteri (BDE-II)
        </h1>
        <p className="text-muted-foreground">
          Her bir madde için, son iki hafta boyunca, bugün de dahil olmak üzere,
          nasıl hissettiğinizi en iyi tanımlayan ifadeyi seçin.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            {beckQuestions.map((q, index) => (
              <FormField
                key={q.id}
                control={form.control}
                name={`q${q.id}` as keyof FormValues}
                render={({ field }) => (
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {index + 1}. {q.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {q.options.map(opt => (
                          <FormItem
                            key={opt.score}
                            className="flex items-center space-x-3 space-y-0 p-3 rounded-md hover:bg-muted/50 transition-colors"
                          >
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

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analiz ediliyor...
              </>
            ) : (
              'Tamamla ve Terapistime Gönder'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
