"use server";

import { analyzeTestResults, AnalyzeTestResultsOutput } from '@/ai/flows/analyze-test-results';
import { z } from 'zod';

const BeckTestSchema = z.record(z.string().regex(/^[0-3]$/));

export async function analyzeBeckTest(
  formData: z.infer<typeof BeckTestSchema>
): Promise<{ success: true; data: AnalyzeTestResultsOutput } | { success: false; error: string }> {
  
  const validation = BeckTestSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: 'Invalid form data provided.' };
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
    testName: 'Beck Depression Inventory (BDI-II)',
    testResults: testResults,
    userInformation: 'The user is taking this test to understand their current mood state.',
  };

  // 3. Call AI Flow
  try {
    const analysis = await analyzeTestResults(input);
    return { success: true, data: analysis };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { success: false, error: 'Failed to analyze test results. Please try again later.' };
  }
}
