import { z } from 'zod';

export const ChatInputSchema = z.object({
  message: z.string().describe("Kullanıcının chatbot'a gönderdiği mesaj."),
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
