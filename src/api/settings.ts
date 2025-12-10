const API_BASE = 'http://localhost:8000/api'

export interface SettingsResponse {
  openai_api_key: string | null
  anthropic_api_key: string | null
  google_api_key: string | null
  groq_api_key: string | null
  default_model: string
  openai_enabled: boolean
  anthropic_enabled: boolean
  google_enabled: boolean
  groq_enabled: boolean
}

export interface SettingsUpdate {
  openai_api_key?: string | null
  anthropic_api_key?: string | null
  google_api_key?: string | null
  groq_api_key?: string | null
  default_model?: string
}

export const settingsApi = {
  get: async (): Promise<SettingsResponse> => {
    const response = await fetch(`${API_BASE}/settings`)
    if (!response.ok) throw new Error('Failed to fetch settings')
    return response.json()
  },

  update: async (data: SettingsUpdate): Promise<SettingsResponse> => {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update settings')
    return response.json()
  },
}
