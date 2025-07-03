// 'use server';

/**
 * @fileOverview Psikolojik test sonuçlarını analiz eder ve kişiselleştirilmiş içgörüler sunar.
 *
 * - analyzeTestResults - Test sonuçlarını analiz eden ve içgörüler sunan bir işlev.
 * - AnalyzeTestResultsInput - analyzeTestResults işlevi için girdi türü.
 * - AnalyzeTestResultsOutput - analyzeTestResults işlevi için dönüş türü.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTestResultsInputSchema = z.object({
  testName: z.string().describe('Psikolojik testin adı.'),
  testResults: z.record(z.any()).describe('JSON nesnesi olarak psikolojik testin sonuçları.'),
  userInformation: z.string().optional().describe('Kullanıcı hakkında yaş, cinsiyet ve geçmiş gibi ek bilgiler.'),
});

export type AnalyzeTestResultsInput = z.infer<typeof AnalyzeTestResultsInputSchema>;

const AnalyzeTestResultsOutputSchema = z.object({
  insights: z.string().describe('Test sonuçlarına dayalı kişiselleştirilmiş içgörüler.'),
  severity: z.string().describe('Test sonuçlarına dayalı potansiyel sorunların ciddiyeti.'),
  guidance: z.string().describe('Test sonuçlarına dayalı kişiselleştirilmiş rehberlik.'),
});

export type AnalyzeTestResultsOutput = z.infer<typeof AnalyzeTestResultsOutputSchema>;

export async function analyzeTestResults(input: AnalyzeTestResultsInput): Promise<AnalyzeTestResultsOutput> {
  return analyzeTestResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestResultsPrompt',
  input: {schema: AnalyzeTestResultsInputSchema},
  output: {schema: AnalyzeTestResultsOutputSchema},
  prompt: `Siz psikolojik test sonuçlarını analiz etme konusunda uzmanlaşmış bir yapay zeka asistanısınız.

  Sağlanan test sonuçlarına dayanarak, kişiselleştirilmiş içgörüler oluşturacak, potansiyel sorunların ciddiyetini belirleyecek ve kullanıcıya kişiselleştirilmiş rehberlik sunacaksınız.

  Test Adı: {{{testName}}}
  Test Sonuçları: {{{testResults}}}
  Kullanıcı Bilgileri: {{{userInformation}}}

  Talimatlar:
  1. Test sonuçlarını analiz edin ve potansiyel sorunları veya endişe alanlarını belirleyin.
  2. Bu sorunların ciddiyetini, test için önceden tanımlanmış eşiklere ve normlara göre belirleyin.
  3. Test sonuçlarının potansiyel etkilerini açıklayan kişiselleştirilmiş içgörüler sunun.
  4. Sonuçlarına göre kullanıcıya kişiselleştirilmiş rehberlik ve öneriler sunun.
  5. İçgörülerin ve rehberliğin hassas, destekleyici ve bireyin ihtiyaçlarına göre uyarlandığından emin olun.
`,
});

const analyzeTestResultsFlow = ai.defineFlow(
  {
    name: 'analyzeTestResultsFlow',
    inputSchema: AnalyzeTestResultsInputSchema,
    outputSchema: AnalyzeTestResultsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
