
'use client';

import { useState, useEffect } from 'react';
import type { Stream } from '@/app/(ai)/ai/chat/actions';

export function useStreamingText(stream?: Stream) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!stream) {
      return;
    }

    let active = true;
    
    async function readStream() {
      const reader = stream.getReader();
      try {
        while (active) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          if (typeof value === 'string') {
            setText(prev => prev + value);
          }
        }
      } catch (error) {
        console.error('Error reading stream:', error);
      } finally {
        reader.releaseLock();
      }
    }

    readStream();

    return () => {
      active = false;
    };
  }, [stream]);

  return text;
}

