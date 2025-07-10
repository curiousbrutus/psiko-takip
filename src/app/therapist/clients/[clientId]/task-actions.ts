
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

    