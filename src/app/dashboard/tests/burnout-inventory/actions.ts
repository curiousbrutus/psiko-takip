"use server";

import { analyzeTestResults, AnalyzeTestResultsOutput } from '@/ai/flows/analyze-test-results';
import { z } from 'zod';

const BurnoutTestSchema = z.record(z.string().regex(/^[0-3]$/));

export async function analyzeBurnoutTest(
  formData: z.infer<typeof BurnoutTestSchema>
): Promise<{ success: true; data: AnalyzeTestResultsOutput } | { success: false; error: string }> {
  
  const validation = BurnoutTestSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: 'Geçersiz form verisi sağlandı.' };
  }
  
  const answers = validation.data;

  // 1. Calculate total score
  const totalScore = Object.values(answers).reduce((sum, value) => sum + parseInt(value, 10), 0);

  // 2. Prepare input for AI flow
  const testResults = {
    totalScore,
    answers,
  };
  
  const input = {
    testName: 'Tükenmişlik Envanteri',
    testResults: testResults,
    userInformation: 'Kullanıcı bu testi mevcut iş stresi ve tükenmişlik seviyesini anlamak için yapıyor.',
  };

  // 3. Call AI Flow
  try {
    const analysis = await analyzeTestResults(input);
    return { success: true, data: analysis };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { success: false, error: 'Test sonuçları analiz edilemedi. Lütfen daha sonra tekrar deneyin.' };
  }
}
