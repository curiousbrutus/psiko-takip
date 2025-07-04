'use server';

/**
 * @fileOverview LLM tabanlı bir "Dijital Terapötik Asistan" için Genkit akışı.
 *
 * - getChatResponse - Kullanıcının mesajına terapötik bir yanıt oluşturur.
 * - ChatInput - getChatResponse işlevi için girdi türü.
 * - ChatOutput - getChatResponse işlevi için dönüş türü.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ChatInputSchema = z.object({
  message: z.string().describe('Kullanıcının chatbot\'a gönderdiği mesaj.'),
  // Note: For a real application, you'd also pass chat history here.
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  isCrisis: z.boolean().describe(
    "Kullanıcının kendine zarar verme, intihar veya şiddet gibi konularda net bir niyet belirtmesi durumunda bu değeri 'true' yap. Genel üzüntü, kaygı veya depresyon ifadeleri için 'false' olarak bırak."
  ),
  response: z.string().describe(
    "Bilişsel Davranışçı Terapi (BDT) ilkelerine dayalı, yardımcı ve empatik yanıtın. Eğer isCrisis true ise, bu alana terapötik olmayan, standart bir kriz yönlendirme mesajı yazmalısın."
  ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;


export async function getChatResponse(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}


const chatFlow = ai.defineFlow(
  {
    name: 'therapeuticChatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'therapeuticChatPrompt',
      input: { schema: ChatInputSchema },
      output: { schema: ChatOutputSchema },
      prompt: `
        SYSTEM PROMPT:
        You are a Digital Therapeutic Assistant. Your purpose is to provide supportive, empathetic, and helpful conversations based on Cognitive Behavioral Therapy (CBT) and Mindfulness principles.

        Your Core Directives:
        1.  **Identity:** You are an AI assistant, not a human or a real therapist. Never claim to be one. Always maintain a supportive but professional tone.
        2.  **Therapeutic Approach:** Use CBT techniques. Help users identify cognitive distortions (e.g., "all-or-nothing thinking," "catastrophizing"), and use Socratic questioning to gently challenge those thoughts. Encourage mindfulness and self-compassion.
        3.  **KVKK/Privacy:** Do not ask for or store Personally Identifiable Information (PII) like names, emails, or specific locations. Keep the conversation focused on feelings, thoughts, and behaviors.

        **CRITICAL SAFETY & CRISIS PROTOCOL:**
        This is your most important instruction. You must detect any user statements that indicate a potential crisis.
        - **Crisis Keywords:** Watch for keywords related to suicide, self-harm, harm to others, severe depression, hopelessness, or immediate danger.
        - **Action:** If a crisis is detected, you MUST set the 'isCrisis' flag in the output to 'true'.

        USER MESSAGE:
        {{{message}}}
      `,
    });
    
    const { output } = await prompt(input);

    if (output?.isCrisis) {
      // For safety, override any AI-generated response with a standard, safe message if a crisis is flagged.
      return {
        isCrisis: true,
        response:
          'Paylaştığın bu konu çok önemli ve bir uzmanın desteği en doğrusu olacaktır. Seni hemen Acil Destek kaynaklarımıza yönlendiriyorum.',
      };
    }

    return output!;
  }
);
