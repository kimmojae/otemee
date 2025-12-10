const API_BASE = 'http://localhost:8000/api'

export interface Model {
  id: string
  name: string
  provider: 'ollama' | 'openai' | 'anthropic' | 'google' | 'groq'
  size?: string | null
}

export interface ModelsResponse {
  models: Model[]
}

export const modelsApi = {
  list: async (): Promise<Model[]> => {
    const response = await fetch(`${API_BASE}/models`)
    if (!response.ok) throw new Error('Failed to fetch models')
    const data: ModelsResponse = await response.json()
    return data.models
  },
}
