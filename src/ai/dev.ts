import { config } from 'dotenv';
config();

import '@/ai/flows/implement-ai-identity.ts';
import '@/ai/flows/generate-quiz-questions.ts';
import '@/ai/flows/summarize-uploaded-files.ts';
import '@/ai/flows/generate-study-questions.ts';
