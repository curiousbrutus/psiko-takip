import {
  apiCreateCollaborativeTask,
  apiCreateAssessmentTask,
  apiCreateAssessmentResult,
  apiFetch,
} from '@/lib/api-client';
import { z } from 'zod';

const assignTaskSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  therapistId: z.string(),
});

export async function assignTaskAction(
  input: z.infer<typeof assignTaskSchema>
): Promise<{ success: boolean; message: string }> {
  const validation = assignTaskSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Geçersiz veri.' };
  }

  const { clientId, clientName, therapistId } = validation.data;

  const newTask = {
    clientId,
    clientName,
    therapistId,
    title: 'Düşünce Kaydı',
    status: 'assigned',
    completedAt: null,
    fields: {
      situation: {
        clientContent: '',
        therapistComment: '',
      },
      thoughts: {
        clientContent: '',
        therapistComment: '',
      },
      emotions: {
        clientContent: '',
        therapistComment: '',
      },
      alternativeThought: {
        clientContent: '',
        therapistComment: '',
      },
    },
  };

  try {
    const response = await apiCreateCollaborativeTask(newTask);
    if (response.success) {
      return { success: true, message: 'Görev başarıyla atandı.' };
    }
    return {
      success: false,
      message: response.error || 'Görev atanırken bir hata oluştu.',
    };
  } catch (error) {
    console.error('Error assigning task:', error);
    return { success: false, message: 'Görev atanırken bir hata oluştu.' };
  }
}

const assignAssessmentSchema = z.object({
  clientId: z.string(),
  clientName: z.string(),
  therapistId: z.string(),
  testName: z.enum(['GAD-7', 'PHQ-9', 'TherapeuticAlliance']),
});

export async function assignAssessmentAction(
  input: z.infer<typeof assignAssessmentSchema>
): Promise<{ success: boolean; message: string }> {
  const validation = assignAssessmentSchema.safeParse(input);
  if (!validation.success) {
    return { success: false, message: 'Geçersiz veri.' };
  }

  const { clientId, clientName, therapistId, testName } = validation.data;

  const newAssessment = {
    clientId,
    clientName,
    therapistId,
    testName,
    title: `${testName} Değerlendirmesi`,
    status: 'assigned',
    completedAt: null,
  };

  try {
    const response = await apiCreateAssessmentTask(newAssessment);
    if (response.success) {
      return { success: true, message: 'Değerlendirme başarıyla atandı.' };
    }
    return {
      success: false,
      message: response.error || 'Değerlendirme atanırken bir hata oluştu.',
    };
  } catch (error) {
    console.error('Error assigning assessment:', error);
    return {
      success: false,
      message: 'Değerlendirme atanırken bir hata oluştu.',
    };
  }
}

const submitAssessmentSchema = z.object({
  taskId: z.string(),
  userId: z.string(),
  testName: z.string(),
  answers: z.record(z.string().regex(/^[0-5]$/)),
  allianceScore: z.number().optional(),
  score: z.number(),
});

export async function submitAssessmentAction(
  input: z.infer<typeof submitAssessmentSchema>
): Promise<{ success: boolean; error?: string }> {
  const validation = submitAssessmentSchema.safeParse(input);

  if (!validation.success) {
    return { success: false, error: 'Geçersiz form verisi.' };
  }

  const { taskId, userId, testName, answers, score, allianceScore } =
    validation.data;

  try {
    // Create the assessment result
    const resultResponse = await apiCreateAssessmentResult({
      userId,
      testName,
      answers,
      score,
      ...(allianceScore && { allianceScore }),
    });

    if (!resultResponse.success) {
      return {
        success: false,
        error: resultResponse.error || 'Değerlendirme sonucu kaydedilemedi.',
      };
    }

    // Update the assessment task status to completed
    await apiFetch(`/assessment-tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'completed',
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('Error submitting assessment:', error);
    return {
      success: false,
      error: 'Değerlendirme gönderilirken bir hata oluştu.',
    };
  }
}
