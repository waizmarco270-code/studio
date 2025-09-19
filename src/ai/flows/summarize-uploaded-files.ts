'use server';

/**
 * @fileOverview A flow that summarizes uploaded files.
 *
 * - summarizeUploadedFiles - A function that summarizes the uploaded files.
 * - SummarizeUploadedFilesInput - The input type for the summarizeUploadedFiles function.
 * - SummarizeUploadedFilesOutput - The return type for the summarizeUploadedFiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUploadedFilesInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The uploaded file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeUploadedFilesInput = z.infer<typeof SummarizeUploadedFilesInputSchema>;

const SummarizeUploadedFilesOutputSchema = z.object({
  summary: z.string().describe('A summary of the contents of the uploaded file.'),
  progress: z.string().describe('Progress of generating summary.'),
});
export type SummarizeUploadedFilesOutput = z.infer<typeof SummarizeUploadedFilesOutputSchema>;

export async function summarizeUploadedFiles(
  input: SummarizeUploadedFilesInput
): Promise<SummarizeUploadedFilesOutput> {
  return summarizeUploadedFilesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeUploadedFilesPrompt',
  input: {schema: SummarizeUploadedFilesInputSchema},
  output: {schema: SummarizeUploadedFilesOutputSchema},
  prompt: `You are an expert at summarizing the content of uploaded files.

  Please provide a concise summary of the content in the following file.

  File: {{media url=fileDataUri}}`,
});

const summarizeUploadedFilesFlow = ai.defineFlow(
  {
    name: 'summarizeUploadedFilesFlow',
    inputSchema: SummarizeUploadedFilesInputSchema,
    outputSchema: SummarizeUploadedFilesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated a short, one-sentence summary of the uploaded file.',
    };
  }
);
