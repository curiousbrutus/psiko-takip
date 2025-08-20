'use server';

import { db, auth } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
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
    assignedAt: serverTimestamp(),
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
    await addDoc(collection(db, 'collaborativeTasks'), newTask);
    return { success: true, message: 'Görev başarıyla atandı.' };
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
    assignedAt: serverTimestamp(),
    completedAt: null,
  };

  try {
    await addDoc(collection(db, 'assessmentTasks'), newAssessment);
    return { success: true, message: 'Değerlendirme başarıyla atandı.' };
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
    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    const therapistId = userDocSnap.exists()
      ? userDocSnap.data().connectedTherapist
      : null;

    await addDoc(collection(db, 'assessmentResults'), {
      userId,
      therapistId,
      testName,
      answers,
      score,
      ...(allianceScore && { allianceScore }),
      completedAt: serverTimestamp(),
    });

    const taskRef = doc(db, 'assessmentTasks', taskId);
    await updateDoc(taskRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
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
