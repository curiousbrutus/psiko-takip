'use server';

import { db, auth } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { z } from 'zod';

const AddAppointmentSchema = z.object({
  therapistId: z.string(),
  therapistName: z.string(),
  clientId: z.string(),
  clientName: z.string(),
  appointmentDate: z.date(),
  type: z.enum(['Online', 'Yüz Yüze']),
  description: z
    .string()
    .min(3, 'Açıklama en az 3 karakter olmalıdır.')
    .max(200, 'Açıklama en fazla 200 karakter olabilir.'),
});

export type AddAppointmentInput = z.infer<typeof AddAppointmentSchema>;

export async function addAppointmentAction(
  input: AddAppointmentInput
): Promise<{ success: boolean; message: string }> {
  const validation = AddAppointmentSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors.map(e => e.message).join(', '),
    };
  }

  try {
    await addDoc(collection(db, 'appointments'), {
      ...validation.data,
      createdAt: serverTimestamp(),
    });

    // In a real-world app, you would trigger email/push notifications from here
    // using a service like Firebase Cloud Functions.

    return { success: true, message: 'Randevu başarıyla oluşturuldu.' };
  } catch (error) {
    console.error('Error adding new appointment:', error);
    return {
      success: false,
      message: 'Randevu oluşturulurken bir hata oluştu.',
    };
  }
}

export async function getClientsForTherapistAction(
  therapistId: string
): Promise<{ id: string; displayName: string }[]> {
  if (!therapistId) return [];

  try {
    const q = query(
      collection(db, 'users'),
      where('connectedTherapist', '==', therapistId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      displayName: doc.data().displayName,
    }));
  } catch (error) {
    console.error('Error fetching clients for therapist:', error);
    return [];
  }
}
