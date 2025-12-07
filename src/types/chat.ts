/**
 * Chat 타입 정의
 */

export interface Chat {
  id: string
  title: string
  timestamp: Date
  messages?: number
  model?: string
}

export interface ChatGroup {
  label: 'Today' | 'This Week' | 'This Month' | 'Older'
  chats: Chat[]
}

export interface SidebarState {
  isOpen: boolean
  width: number
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}
