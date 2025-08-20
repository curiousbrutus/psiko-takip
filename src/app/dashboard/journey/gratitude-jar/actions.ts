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

const GratitudeSchema = z.object({
  content: z
    .string()
    .min(3, 'Anı en az 3 karakter olmalıdır.')
    .max(500, 'Anı en fazla 500 karakter olabilir.'),
});

export async function addGratitudeEntry(content: string) {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Giriş yapmalısınız.' };
  }

  const validation = GratitudeSchema.safeParse({ content });
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    const docRef = await addDoc(collection(db, 'gratitudeJarEntries'), {
      userId: user.uid,
      content: validation.data.content,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding gratitude entry:', error);
    return { success: false, error: 'Anı eklenirken bir hata oluştu.' };
  }
}

export async function getGratitudeEntries(): Promise<{
  success: boolean;
  data?: DocumentData[];
  error?: string;
}> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'Giriş yapmalısınız.' };
  }

  try {
    const q = query(
      collection(db, 'gratitudeJarEntries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const entries = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return { success: true, data: entries };
  } catch (error) {
    console.error('Error fetching gratitude entries:', error);
    return { success: false, error: 'Anılar alınırken bir hata oluştu.' };
  }
}
