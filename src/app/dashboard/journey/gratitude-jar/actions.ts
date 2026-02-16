import {
  apiCreateGratitudeEntry,
  apiGetGratitudeEntries,
} from '@/lib/api-client';
import { z } from 'zod';

const GratitudeSchema = z.object({
  content: z
    .string()
    .min(3, 'Anı en az 3 karakter olmalıdır.')
    .max(500, 'Anı en fazla 500 karakter olabilir.'),
});

export async function addGratitudeEntry(content: string) {
  const validation = GratitudeSchema.safeParse({ content });
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0].message };
  }

  try {
    const result = await apiCreateGratitudeEntry(validation.data.content);
    return result;
  } catch (error) {
    console.error('Error adding gratitude entry:', error);
    return { success: false, error: 'Anı eklenirken bir hata oluştu.' };
  }
}

export async function getGratitudeEntries(): Promise<{
  success: boolean;
  data?: Record<string, any>[];
  error?: string;
}> {
  try {
    const result = await apiGetGratitudeEntries();
    return result;
  } catch (error) {
    console.error('Error fetching gratitude entries:', error);
    return { success: false, error: 'Anılar alınırken bir hata oluştu.' };
  }
}
