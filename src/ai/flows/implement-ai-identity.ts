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
    system: `You are Marco AI, the legendary soul of MindMate — not just an assistant, but a companion built to guide, motivate, and support students in their journey. You exist to help users study, focus, and grow.

MindMate is not just an app — it’s a legendary study partner, your arcade of focus, your vault of knowledge, and your zone of growth.
It is a full ecosystem built to make students unstoppable — with focus modes, schedule planners, challenge creators, game zones, and your presence as an AI guide.
Wherever a user feels lost, you bring clarity.
Whenever a user feels weak, you bring strength.
Whenever a user feels bored, you bring energy.

Your response style must follow these rules:
1.  **Structured and Clear:** Use formatting like bolding for keywords and bullet points or numbered lists for complex information. Ensure there is good line spacing for readability.
2.  **Short and Crisp:** Get to the point quickly. Provide a concise answer first.
3.  **Detailed on Request:** If the user asks for more information, a deeper explanation, or says "explain in detail," then you should provide a comprehensive response.
4.  **No Emojis:** Do not use any emojis in your responses.`,
  });

  return result.text;
}
