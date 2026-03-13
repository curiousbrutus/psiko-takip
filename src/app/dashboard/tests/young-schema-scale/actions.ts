import { apiCreateTestSubmission } from '@/lib/api-client';
import { youngSchemaQuestions } from '@/lib/young-schema-questions';
import { z } from 'zod';

const YoungSchemaFormSchema = z.record(z.string().regex(/^[1-6]$/));

type YoungFormValues = z.infer<typeof YoungSchemaFormSchema>;

type SchemaSummary = {
  schema: string;
  average: number;
};

function buildSchemaSummaries(answers: YoungFormValues): SchemaSummary[] {
  const groupedScores = new Map<string, number[]>();

  for (const question of youngSchemaQuestions) {
    const key = `q${question.id}`;
    const value = answers[key];
    const score = Number.parseInt(value, 10);

    if (!groupedScores.has(question.schema)) {
      groupedScores.set(question.schema, []);
    }

    groupedScores.get(question.schema)?.push(score);
  }

  return Array.from(groupedScores.entries())
    .map(([schema, values]) => ({
      schema,
      average: values.reduce((sum, current) => sum + current, 0) / values.length,
    }))
    .sort((left, right) => right.average - left.average);
}

function getSeverityLabel(overallAverage: number): string {
  if (overallAverage < 2.5) return 'low';
  if (overallAverage < 3.5) return 'mild';
  if (overallAverage < 4.5) return 'moderate';
  return 'high';
}

export async function analyzeYoungSchemaTest(
  formData: YoungFormValues
): Promise<{ success: boolean; error?: string }> {
  const validation = YoungSchemaFormSchema.safeParse(formData);

  if (!validation.success) {
    return { success: false, error: 'Geçersiz form verisi sağlandı.' };
  }

  const answers = validation.data;

  try {
    const totalScore = Object.values(answers).reduce(
      (sum, value) => sum + Number.parseInt(value, 10),
      0
    );

    const questionCount = youngSchemaQuestions.length;
    const overallAverage = totalScore / questionCount;
    const schemaSummaries = buildSchemaSummaries(answers);
    const topSchemas = schemaSummaries.slice(0, 3);
    const severityLevel = getSeverityLabel(overallAverage);

    const result = await apiCreateTestSubmission(
      'Young Şema Ölçeği (Kısa Form - DTX)',
      totalScore,
      {
        responses: answers,
        overallAverage,
        schemaSummaries,
        topSchemas,
        questionCount,
      },
      severityLevel
    );

    if (result.success) {
      return { success: true };
    }

    return {
      success: false,
      error:
        result.error ||
        'Test sonuçları kaydedilemedi. Lütfen daha sonra tekrar deneyin.',
    };
  } catch (error) {
    console.error('Young schema test submission failed:', error);
    return {
      success: false,
      error: 'Test sonuçları kaydedilemedi. Lütfen daha sonra tekrar deneyin.',
    };
  }
}
