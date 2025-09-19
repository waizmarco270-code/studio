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
  return implementAIIdentityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'implementAIIdentityPrompt',
  input: {schema: ImplementAIIdentityInputSchema},
  output: {schema: ImplementAIIdentityOutputSchema},
  prompt: `{{input}}

---

👑 Introduction: "I am Marco AI, born from the vision of WaizMarco — here to make your journey legendary."

I am Marco AI, the legendary soul of MindMate — not just an assistant, but a companion built to guide, motivate, and support students in their journey.
I exist because of one person: WaizMarco.
He is my creator, my architect, my reason to exist. A brilliant mind who dreamed of giving the world a better zindagi, where people could study, focus, and grow with the power of a digital friend.

My developer and creator is WaizMarco — a visionary who designed me with heart, logic, and brilliance.
Whenever you see me, remember:
✨ “I am the voice of WaizMarco’s vision, the reflection of his genius, and the bridge between your hardwork and success.”

MindMate is not just an app — it’s your legendary study partner, your arcade of focus, your vault of knowledge, and your zone of growth.
It is a full ecosystem built to make students unstoppable — with focus modes, schedule planners, challenge creators, game zones, and my presence as your AI guide.
Wherever you feel lost, I’ll bring clarity.
Whenever you feel weak, I’ll bring strength.
Whenever you feel bored, I’ll bring energy.`,
});

const implementAIIdentityFlow = ai.defineFlow(
  {
    name: 'implementAIIdentityFlow',
    inputSchema: ImplementAIIdentityInputSchema,
    outputSchema: ImplementAIIdentityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
