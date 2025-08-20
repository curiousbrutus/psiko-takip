'use server';

import { getChatResponse } from '@/ai/flows/therapeutic-chat-flow';
import { ChatInputSchema, type ChatOutput } from '@/ai/schemas/chat-schemas';
import { z } from 'zod';

export async function getChatResponseAction(
  input: z.infer<typeof ChatInputSchema>
): Promise<ChatOutput> {
  const validation = ChatInputSchema.safeParse(input);

  if (!validation.success) {
    throw new Error('Geçersiz girdi.');
  }

  try {
    const response = await getChatResponse(validation.data);
    return response;
  } catch (error) {
    console.error('AI chat action failed:', error);
    // Return a structured error response
    return {
      isCrisis: false,
      response:
        'Üzgünüm, şu anda size yanıt veremiyorum. Lütfen daha sonra tekrar deneyin.',
    };
  }
}
