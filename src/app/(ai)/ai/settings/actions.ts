'use server';

import * as fs from 'fs/promises';
import * as path from 'path';

export async function setApiKey(
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  if (!apiKey || !apiKey.trim()) {
    return { success: false, error: 'API key cannot be empty.' };
  }

  try {
    const envPath = path.resolve(process.cwd(), '.env');
    let envFileContent = '';
    try {
      envFileContent = await fs.readFile(envPath, 'utf8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    const lines = envFileContent.split('\n');
    let keyFound = false;
    const newLines = lines.map((line) => {
      if (line.startsWith('GEMINI_API_KEY=')) {
        keyFound = true;
        return `GEMINI_API_KEY=${apiKey}`;
      }
      return line;
    });

    if (!keyFound) {
      newLines.push(`GEMINI_API_KEY=${apiKey}`);
    }

    await fs.writeFile(envPath, newLines.join('\n'));

    // NOTE: In a real production environment, you would need to restart
    // the server process for the new .env file to be loaded.
    // In this development environment, we can set it directly.
    process.env.GEMINI_API_KEY = apiKey;

    return { success: true };
  } catch (error) {
    console.error('Failed to save API key:', error);
    return {
      success: false,
      error: 'Failed to save API key. Check server logs for details.',
    };
  }
}
