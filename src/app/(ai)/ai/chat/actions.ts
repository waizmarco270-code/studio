
'use server';

import { firestore } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp, query, orderBy, limit, addDoc } from 'firebase/firestore';
import { streamAIIdentity } from '@/ai/flows/implement-ai-identity';

export type Stream = AsyncGenerator<string, void, unknown>;

export interface Message {
  role: 'user' | 'assistant';
  content: string | React.ReactNode;
  stream?: Stream;
}

export interface StoredMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: StoredMessage[];
  createdAt: any;
  userId: string;
}

const getChatsRef = (userId: string) => collection(firestore, 'users', userId, 'chats');
const getChatRef = (userId: string, chatId: string) => doc(firestore, 'users', userId, 'chats', chatId);

export async function getChats(userId: string): Promise<Chat[]> {
  try {
    if (!userId) return [];
    const chatsRef = getChatsRef(userId);
    const q = query(chatsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
  } catch (error) {
    console.error("Error fetching chats:", error);
    return [];
  }
}

export async function getChat(chatId: string, userId: string): Promise<Chat | null> {
    try {
        if (!userId || !chatId || chatId === 'new') return null;
        const chatRef = getChatRef(userId, chatId);
        const docSnap = await getDoc(chatRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Chat;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching chat:", error);
        return null;
    }
}

export async function saveChat(chatId: string, userId: string, messages: StoredMessage[]) {
  try {
    if (!userId) return { error: 'User ID is required to save chat.' };
    
    let currentChatId = chatId;
    let isNewChat = chatId === 'new';

    const chatData = {
        userId,
        messages,
        createdAt: serverTimestamp(),
        title: messages.find(m => m.role === 'user')?.content.substring(0, 30) || 'New Chat',
    };
    
    if (isNewChat) {
        const chatsRef = getChatsRef(userId);
        const newChatRef = await addDoc(chatsRef, chatData);
        currentChatId = newChatRef.id;
    } else {
        const chatRef = getChatRef(userId, currentChatId);
        // We use setDoc with merge:true to update or create if it doesn't exist
        await setDoc(chatRef, { messages: messages, title: chatData.title }, { merge: true });
    }
    return { chatId: currentChatId };
  } catch (error) {
      console.error("Error saving chat:", error);
      return { error: 'Failed to save chat.' };
  }
}

export async function createChat(userId: string): Promise<Chat> {
  if (!userId) throw new Error("User ID is required to create a chat.");
  const newChatData = {
    userId,
    messages: [],
    createdAt: serverTimestamp(),
    title: 'New Chat',
  };
  const chatsRef = getChatsRef(userId);
  const newChatRef = await addDoc(chatsRef, newChatData);
  return { id: newChatRef.id, ...newChatData };
}

export async function streamChat(messages: Message[]): Promise<Stream> {
  const history = messages
    .filter(m => typeof m.content === 'string') // Only use string messages for history
    .map(m => ({
      role: m.role as 'user' | 'assistant',
      content: [{text: m.content as string}],
    }));

  const latestMessage = history.pop();
  if (!latestMessage) {
    // This should not happen in a real scenario
    async function* emptyStream() {}
    return emptyStream();
  }
  
  return streamAIIdentity(history, latestMessage.content[0].text);
}
