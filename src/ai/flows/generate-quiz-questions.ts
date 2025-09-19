'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating quiz questions based on a given topic.
 *
 * It exports:
 * - `generateQuizQuestions`: An async function that takes a topic and returns a set of quiz questions.
 * - `GenerateQuizQuestionsInput`: The input type for the `generateQuizQuestions` function.
 * - `GenerateQuizQuestionsOutput`: The output type for the `generateQuizQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuizQuestionsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate quiz questions.'),
  numQuestions: z.number().min(1).max(10).default(5).describe('The number of quiz questions to generate. Must be between 1 and 10.'),
});
export type GenerateQuizQuestionsInput = z.infer<typeof GenerateQuizQuestionsInputSchema>;

const GenerateQuizQuestionsOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe('The quiz question.'),
      options: z.array(z.string()).describe('The possible answers to the question.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
    })
  ).describe('An array of quiz questions with their options and correct answers.'),
});
export type GenerateQuizQuestionsOutput = z.infer<typeof GenerateQuizQuestionsOutputSchema>;

export async function generateQuizQuestions(input: GenerateQuizQuestionsInput): Promise<GenerateQuizQuestionsOutput> {
  return generateQuizQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizQuestionsPrompt',
  input: {schema: GenerateQuizQuestionsInputSchema},
  output: {schema: GenerateQuizQuestionsOutputSchema},
  prompt: `You are a quiz generator. Generate {{numQuestions}} quiz questions about {{topic}}.

Each question should have 4 options, and you should indicate the correct answer.

Output the questions in a JSON format that can be parsed by Javascript.

Example:
{
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": ["Berlin", "Paris", "Madrid", "Rome"],
      "correctAnswer": "Paris"
    },
    {
      "question": "What is the highest mountain in the world?",
      "options": ["Mount Everest", "K2", "Kangchenjunga", "Lhotse"],
      "correctAnswer": "Mount Everest"
    }
  ]
}

Follow this format strictly.

Topic: {{topic}}
Number of Questions: {{numQuestions}}`,
});

const generateQuizQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuizQuestionsFlow',
    inputSchema: GenerateQuizQuestionsInputSchema,
    outputSchema: GenerateQuizQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
