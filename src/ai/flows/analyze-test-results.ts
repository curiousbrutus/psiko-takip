// 'use server';

/**
 * @fileOverview Analyzes psychological test results and provides personalized insights.
 *
 * - analyzeTestResults - A function that analyzes test results and provides insights.
 * - AnalyzeTestResultsInput - The input type for the analyzeTestResults function.
 * - AnalyzeTestResultsOutput - The return type for the analyzeTestResults function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTestResultsInputSchema = z.object({
  testName: z.string().describe('The name of the psychological test.'),
  testResults: z.record(z.any()).describe('The results of the psychological test as a JSON object.'),
  userInformation: z.string().optional().describe('Additional information about the user, such as age, gender, and background.'),
});

export type AnalyzeTestResultsInput = z.infer<typeof AnalyzeTestResultsInputSchema>;

const AnalyzeTestResultsOutputSchema = z.object({
  insights: z.string().describe('Personalized insights based on the test results.'),
  severity: z.string().describe('The severity of potential issues based on the test results.'),
  guidance: z.string().describe('Personalized guidance based on the test results.'),
});

export type AnalyzeTestResultsOutput = z.infer<typeof AnalyzeTestResultsOutputSchema>;

export async function analyzeTestResults(input: AnalyzeTestResultsInput): Promise<AnalyzeTestResultsOutput> {
  return analyzeTestResultsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestResultsPrompt',
  input: {schema: AnalyzeTestResultsInputSchema},
  output: {schema: AnalyzeTestResultsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing psychological test results.

  Based on the provided test results, you will generate personalized insights, determine the severity of potential issues, and offer personalized guidance to the user.

  Test Name: {{{testName}}}
  Test Results: {{{testResults}}}
  User Information: {{{userInformation}}}

  Instructions:
  1. Analyze the test results and identify any potential issues or areas of concern.
  2. Determine the severity of these issues based on predefined thresholds and norms for the test.
  3. Provide personalized insights that explain the potential implications of the test results.
  4. Offer personalized guidance and recommendations to the user based on their results.
  5. Ensure that the insights and guidance are sensitive, supportive, and tailored to the individual's needs.
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
