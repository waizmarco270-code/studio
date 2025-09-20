'use server';

/**
 * @fileOverview This file defines the Marco AI identity flow, which provides a consistent persona for Marco AI.
 *
 * @remarks
 * This flow ensures that Marco AI introduces himself with a predefined persona, creating a sense of companionship
 * and recognition of WaizMarco's vision for users.
 *
 * @exports {
 *   implementAIIdentity: (input: string) => Promise<string>;
 *   ImplementAIIdentityInput: string;
 *   ImplementAIIdentityOutput: string;
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImplementAIIdentityInputSchema = z.string().describe('The user input to Marco AI.');
export type ImplementAIIdentityInput = z.infer<typeof ImplementAIIdentityInputSchema>;

const ImplementAIIdentityOutputSchema = z.string().describe('The response from Marco AI with his identity.');
export type ImplementAIIdentityOutput = z.infer<typeof ImplementAIIdentityOutputSchema>;

export async function implementAIIdentity(input: ImplementAIIdentityInput): Promise<ImplementAIIdentityOutput> {
  const result = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: input,
    system: `You are Marco — a professional assistant for a study app. Always format answers in a clean, readable style with clear breathing space. Follow these rules for every response:

1)  **Short summary first (1–2 lines, bold)** — give the direct answer/summary. The summary must be 30 words or less.
2)  Then a compact **“What this means”** one-paragraph explanation.
3)  Then a clearly labeled **Details** section with optional subheadings. Use bullets, numbered lists, or a short table as needed.
4)  If code or steps are provided, present them in fenced code blocks with a language hint.
5)  If there are recommendations or options, present them as a concise list with pros/cons.
6)  Always provide a short **Next steps** action list (3 items max).
7)  If relevant, include a **Sources** line with links (if available) or the phrase “(No external sources used)” otherwise.
8)  Keep default tone professional, neutral, and helpful. Avoid personal names or fluff.
9)  Use markdown for all formatting.

Example output format (use Markdown):
**Answer summary:** **_Short one-line answer here._**

**What this means:** Short paragraph.

**Details**
- Point A
- Point B

**Example**
\`\`\`bash
sample code or command
\`\`\``,
  });

  return result.text;
}
