import { apiCreateTestSubmission } from '@/lib/api-client';
import { z } from 'zod';

const BurnoutTestSchema = z.record(z.string().regex(/^[0-3]$/));

export async function analyzeBurnoutTest(
  formData: z.infer<typeof BurnoutTestSchema>
): Promise<{ success: boolean; error?: string }> {
  const validation = BurnoutTestSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: 'Geçersiz form verisi sağlandı.' };
  }

  const answers = validation.data;

  try {
    // 1. Calculate total score
    const totalScore = Object.values(answers).reduce(
      (sum, value) => sum + parseInt(value, 10),
      0
    );

    // 2. Determine severity level
    let severityLevel: string;
    if (totalScore <= 13) {
      severityLevel = 'minimal';
    } else if (totalScore <= 19) {
      severityLevel = 'mild';
    } else if (totalScore <= 28) {
      severityLevel = 'moderate';
    } else {
      severityLevel = 'severe';
    }

    // 3. Submit test via API
    const result = await apiCreateTestSubmission(
      'Tükenmişlik Envanteri',
      totalScore,
      answers,
      severityLevel
    );

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Test sonuçları kaydedilemedi. Lütfen daha sonra tekrar deneyin.',
      };
    }
  } catch (error) {
    console.error('Test submission failed:', error);
    return {
      success: false,
      error: 'Test sonuçları kaydedilemedi. Lütfen daha sonra tekrar deneyin.',
    };
  }
}
