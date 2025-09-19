'use server';

import { firestore } from '@/lib/firebase';
import { collection, getDocs, query, where, writeBatch } from 'firebase/firestore';

interface VerificationResult {
  success: boolean;
  error?: string;
}

export async function verifyAndConsumeToken(token: string): Promise<VerificationResult> {
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return { success: false, error: 'Token cannot be empty.' };
  }

  try {
    const tokensCollection = collection(firestore, 'ai_access_tokens');
    const q = query(tokensCollection, where('token', '==', token));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid or expired token.' };
    }

    const doc = querySnapshot.docs[0];
    const tokenData = doc.data();

    if (tokenData.isUsed) {
      return { success: false, error: 'Invalid or expired token.' };
    }

    const batch = writeBatch(firestore);
    batch.update(doc.ref, { isUsed: true });
    await batch.commit();

    return { success: true };

  } catch (e) {
    console.error('Error verifying token:', e);
    return { success: false, error: 'An unexpected error occurred. Please try again.' };
  }
}
