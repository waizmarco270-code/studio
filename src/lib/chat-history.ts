
'use server';

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  addDoc,
  deleteDoc,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import app from '@/lib/firebase';

const db = getFirestore(app);
const chatsCollection = 'chats';

type Message = {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
};

export type Chat = {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  messages: Message[];
};

const CHAT_LIMIT = 5;

/**
 * Saves a chat to Firestore. If the user already has 5 chats,
 * it deletes the oldest one before saving the new one.
 */
export async function saveChat(chatData: {
  userId: string;
  title: string;
  messages: Message[];
}): Promise<Chat> {
  const { userId, title, messages } = chatData;

  const userChatsQuery = query(
    collection(db, chatsCollection),
    where('userId', '==', userId),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(userChatsQuery);
  const userChats = querySnapshot.docs;

  if (userChats.length >= CHAT_LIMIT) {
    const oldestChatDoc = userChats[0];
    await deleteDoc(doc(db, chatsCollection, oldestChatDoc.id));
  }
  
  const newChat = {
    userId,
    title,
    messages: messages.map(m => ({...m, content: m.content as string})), // Ensure content is string
    createdAt: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, chatsCollection), newChat);

  return {
    ...newChat,
    id: docRef.id,
  };
}

/**
 * Retrieves all chats for a given user, ordered by creation date.
 */
export async function getChats(userId: string): Promise<Chat[]> {
  if (!userId) return [];

  const q = query(
    collection(db, chatsCollection),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(CHAT_LIMIT)
  );

  const querySnapshot = await getDocs(q);
  const chats: Chat[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    chats.push({
      id: doc.id,
      userId: data.userId,
      title: data.title,
      createdAt: data.createdAt,
      messages: data.messages,
    });
  });

  return chats;
}

/**
 * Deletes a specific chat from Firestore.
 */
export async function deleteChat(chatId: string): Promise<void> {
  await deleteDoc(doc(db, chatsCollection, chatId));
}

/**
 * Deletes all chats for a given user.
 */
export async function deleteAllUserChats(userId: string): Promise<void> {
  if (!userId) return;

  const q = query(collection(db, chatsCollection), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}
