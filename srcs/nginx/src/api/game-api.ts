import api from './api-client';

export async function createAiSession(): Promise<{ sessionId: string; wsUrl: string }> {
  const res = await api.post('/game/create-session');
  return res.data; // { sessionId, wsUrl }
}

export async function joinAiToSession(sessionId: string): Promise<void> {
  await api.post('/pong-ai/join-game', { sessionId });
}
