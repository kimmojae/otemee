import { chatsApi, type ChatResponse } from '@/api/chats'
import type { Chat, ChatGroup } from '@/types/chat'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { isThisMonth, isThisWeek, isToday } from 'date-fns'

// API 응답을 Chat 타입으로 변환
const toChat = (response: ChatResponse): Chat => ({
  id: response.id,
  title: response.title,
  timestamp: new Date(response.updated_at),
  model: response.model,
})

const ACTIVE_CHAT_KEY = 'activeChatId'

export const useChatsStore = defineStore('chats', () => {
  const queryClient = useQueryClient()

  // State - localStorage에서 복원
  const activeChatId = ref<string | null>(localStorage.getItem(ACTIVE_CHAT_KEY))

  // TanStack Query - 채팅 목록 조회
  const {
    data: chatsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: chatsApi.list,
  })

  // 변환된 채팅 목록
  const chats = computed<Chat[]>(() => {
    if (!chatsData.value) return []
    return chatsData.value.map(toChat)
  })

  // Getters
  const groupedChats = computed<ChatGroup[]>(() => {
    const groups: ChatGroup[] = [
      { label: 'Today', chats: [] },
      { label: 'This Week', chats: [] },
      { label: 'This Month', chats: [] },
      { label: 'Older', chats: [] },
    ]

    chats.value.forEach((chat) => {
      if (isToday(chat.timestamp)) {
        groups[0]?.chats?.push(chat)
      } else if (isThisWeek(chat.timestamp, { weekStartsOn: 0 })) {
        groups[1]?.chats?.push(chat)
      } else if (isThisMonth(chat.timestamp)) {
        groups[2]?.chats?.push(chat)
      } else {
        groups[3]?.chats?.push(chat)
      }
    })

    // 빈 그룹 제거
    return groups.filter((group) => group.chats?.length > 0)
  })

  const activeChatData = computed<Chat | null>(() => {
    if (!activeChatId.value) return null
    return chats.value.find((chat) => chat.id === activeChatId.value) || null
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: chatsApi.create,
    onSuccess: (newChat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      activeChatId.value = newChat.id
    },
  })

  const deleteMutation = useMutation({
    mutationFn: chatsApi.delete,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      if (activeChatId.value === deletedId) {
        activeChatId.value = null
      }
    },
  })

  const renameMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => chatsApi.rename(id, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
    },
  })

  // Actions
  const addChat = (title: string) => {
    createMutation.mutate({ title })
  }

  const deleteChat = (id: string) => {
    deleteMutation.mutate(id)
  }

  const renameChat = (id: string, newTitle: string) => {
    renameMutation.mutate({ id, title: newTitle })
  }

  const setActiveChat = (id: string | null) => {
    activeChatId.value = id
  }

  const clearHistory = async () => {
    // 모든 채팅 삭제
    for (const chat of chats.value) {
      await chatsApi.delete(chat.id)
    }
    queryClient.invalidateQueries({ queryKey: ['chats'] })
    activeChatId.value = null
  }

  const refreshChats = () => {
    queryClient.invalidateQueries({ queryKey: ['chats'] })
  }

  return {
    // State
    chats,
    activeChatId,
    isLoading,
    error,
    // Getters
    groupedChats,
    activeChatData,
    // Actions
    addChat,
    deleteChat,
    renameChat,
    setActiveChat,
    clearHistory,
    refreshChats,
  }
})
