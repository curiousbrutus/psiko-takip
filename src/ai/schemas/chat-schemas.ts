import { z } from 'zod';

export const ChatInputSchema = z.object({
  message: z.string().describe("Kullanıcının chatbot'a gönderdiği mesaj."),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The previous messages in the conversation.'),
  userContext: z
    .object({
      demographics: z
        .string()
        .optional()
        .describe(
          'Kullanıcı hakkında yaş, cinsiyet gibi temel demografik bilgiler.'
        ),
      moodTrend: z
        .string()
        .optional()
        .describe('Son bir haftadaki ruh hali trendi.'),
      testResults: z
        .string()
        .optional()
        .describe('Yakın zamanda tamamlanmış testlerin özet sonuçları.'),
    })
    .optional()
    .describe('Kullanıcı hakkında ek bağlamsal bilgiler.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  isCrisis: z
    .boolean()
    .describe(
      "Kullanıcının kendine zarar verme, intihar veya şiddet gibi konularda net bir niyet belirtmesi durumunda bu değeri 'true' yap. Genel üzüntü, kaygı veya depresyon ifadeleri için 'false' olarak bırak."
    ),
  response: z
    .string()
    .describe(
      'Terapötik ilkelere dayalı, yardımcı ve empatik yanıtın. Eğer isCrisis true ise, bu alana terapötik olmayan, standart bir kriz yönlendirme mesajı yazmalısın.'
    ),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
