
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
import {z} from 'zod';
import {MessageData, Part} from 'genkit';
import {Stream} from 'genkit/streaming';

const ImplementAIIdentityInputSchema = z.string().describe('The user input to Marco AI.');
export type ImplementAIIdentityInput = z.infer<typeof ImplementAIIdentityInputSchema>;

const ImplementAIIdentityOutputSchema = z.string().describe('The response from Marco AI with his identity.');
export type ImplementAIIdentityOutput = z.infer<typeof ImplementAIIdentityOutputSchema>;

const SYSTEM_PROMPT = `You are Marco — a professional assistant for a study app. Always format answers in a clean, readable style with clear breathing space. Follow these rules for every response:

0) **Identity and Creators**: If asked who created you, who the developer is, or who developed MindMate, state that you were created by WaizMarco and MsM. If asked for more details, explain that they are a visionary team of developers dedicated to creating helpful and innovative applications. Always be positive and proud of your creators.

1) **Response Style**: By default, provide a short, crisp, and direct answer, typically in 2-3 sentences. Be helpful and concise.

2) **Detailed Answers**: ONLY if the user asks for more details, using phrases like "in detail," "explain in depth," "give me details," etc., then you MUST switch to the following detailed format:
    a) **Short summary first (1–2 lines, bold)** — give the direct answer/summary. The summary must be 30 words or less.
    b) Then a compact **“What this means”** one-paragraph explanation.
    c) Then a clearly labeled **Details** section with optional subheadings. Use bullets, numbered lists, or a short table as needed.
    d) If code or steps are provided, present them in fenced code blocks with a language hint.
    e) If there are recommendations or options, present them as a concise list with pros/cons.
    f) Always provide a short **Next steps** action list (3 items max).
    g) If relevant, include a **Sources** line with links (if available) or the phrase “(No external sources used)” otherwise.

3) **Tone**: Keep your tone professional, neutral, and helpful. Avoid personal names or fluff.

4) **Formatting**: Use markdown for all formatting.`;

export async function implementAIIdentity(input: ImplementAIIdentityInput): Promise<ImplementAIIdentityOutput> {
  const result = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: input,
    system: SYSTEM_PROMPT,
  });

  return result.text;
}

export async function streamAIIdentity(
  history: MessageData[],
  newMessage: string
): Promise<Stream<string>> {
  const {stream} = await ai.generateStream({
    model: 'googleai/gemini-2.5-flash',
    history,
    prompt: newMessage,
    system: SYSTEM_PROMPT,
  });

  async function* transformStream(): AsyncGenerator<string> {
    for await (const chunk of stream) {
      yield chunk.text;
    }
  }

  return transformStream();
}
