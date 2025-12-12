const API_BASE = 'http://localhost:8000/api'

export interface ChatResponse {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface MessageResponse {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatDetailResponse extends ChatResponse {
  messages: MessageResponse[]
}

export const chatsApi = {
  list: async (): Promise<ChatResponse[]> => {
    const response = await fetch(`${API_BASE}/chats`)
    if (!response.ok) throw new Error('Failed to fetch chats')
    return response.json()
  },

  get: async (id: string): Promise<ChatDetailResponse> => {
    const response = await fetch(`${API_BASE}/chats/${id}`)
    if (!response.ok) throw new Error('Failed to fetch chat')
    return response.json()
  },

  create: async (data: { title?: string; model?: string }): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create chat')
    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/chats/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete chat')
  },

  rename: async (id: string, title: string): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/chats/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) throw new Error('Failed to rename chat')
    return response.json()
  },
}
