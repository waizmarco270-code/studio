'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating custom study questions based on a user-provided topic.
 *
 * - generateStudyQuestions - A function that takes a topic string and returns a list of study questions.
 * - GenerateStudyQuestionsInput - The input type for the generateStudyQuestions function.
 * - GenerateStudyQuestionsOutput - The return type for the generateStudyQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStudyQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate study questions.'),
  numberOfQuestions: z
    .number()
    .default(5)
    .describe('The number of questions to generate.'),
});
export type GenerateStudyQuestionsInput = z.infer<
  typeof GenerateStudyQuestionsInputSchema
>;

const GenerateStudyQuestionsOutputSchema = z.object({
  questions: z.array(z.string()).describe('The generated study questions.'),
});
export type GenerateStudyQuestionsOutput = z.infer<
  typeof GenerateStudyQuestionsOutputSchema
>;

export async function generateStudyQuestions(
  input: GenerateStudyQuestionsInput
): Promise<GenerateStudyQuestionsOutput> {
  return generateStudyQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateStudyQuestionsPrompt',
  input: {schema: GenerateStudyQuestionsInputSchema},
  output: {schema: GenerateStudyQuestionsOutputSchema},
  prompt: `You are an expert educator. Generate {{{numberOfQuestions}}} study questions about the following topic: {{{topic}}}. Return the questions as a numbered list.

Example Output:
1. Question 1
2. Question 2
3. Question 3`,
});

const generateStudyQuestionsFlow = ai.defineFlow(
  {
    name: 'generateStudyQuestionsFlow',
    inputSchema: GenerateStudyQuestionsInputSchema,
    outputSchema: GenerateStudyQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    const questions = output?.questions ?? [];
    return {questions};
  }
);
