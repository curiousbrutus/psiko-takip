"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { beckQuestions } from '@/lib/beck-questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { analyzeBeckTest } from './actions';
import type { AnalyzeTestResultsOutput } from '@/ai/flows/analyze-test-results';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, ShieldCheck, ClipboardList } from 'lucide-react';

const formSchema = z.object(
  Object.fromEntries(
    beckQuestions.map(q => [`q${q.id}`, z.string({ required_error: "Lütfen bir seçenek seçin." })])
  )
);

type FormValues = z.infer<typeof formSchema>;

export default function BeckDepressionInventoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeTestResultsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setAnalysisResult(null);

    const result = await analyzeBeckTest(values);

    if (result.success) {
      setAnalysisResult(result.data);
      toast({
        title: "Analiz Tamamlandı",
        description: "Sonuçlarınız başarıyla analiz edildi.",
        variant: "default",
      });
    } else {
      toast({
        title: "Analiz Başarısız",
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Beck Depresyon Envanteri (BDE-II)</h1>
        <p className="text-muted-foreground">
          Her bir madde için, son iki hafta boyunca, bugün de dahil olmak üzere, nasıl hissettiğinizi en iyi tanımlayan ifadeyi seçin.
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
                      <CardTitle>{index + 1}. {q.category}</CardTitle>
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
                Analiz ediliyor...
              </>
            ) : "Analiz İçin Gönder"}
          </Button>
        </form>
      </Form>

      {analysisResult && (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="text-2xl">Yapay Zeka Destekli Analiziniz</CardTitle>
                <CardDescription>Bu, sonuçlarınızın yapay zeka tarafından oluşturulmuş bir analizidir. Bu bir teşhis değildir. Lütfen bir sağlık uzmanına danışın.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>Şiddet</AlertTitle>
                    <AlertDescription>{analysisResult.severity}</AlertDescription>
                </Alert>
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Kişiselleştirilmiş İçgörüler</AlertTitle>
                    <AlertDescription>{analysisResult.insights}</AlertDescription>
                </Alert>
                <Alert>
                    <ClipboardList className="h-4 w-4" />
                    <AlertTitle>Kişiselleştirilmiş Rehberlik</AlertTitle>
                    <AlertDescription>{analysisResult.guidance}</AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
