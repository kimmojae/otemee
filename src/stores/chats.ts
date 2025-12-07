import type { Chat, ChatGroup } from '@/types/chat'
import { isThisMonth, isThisWeek, isToday, subDays, subHours } from 'date-fns'

// 더미 데이터 생성
const generateMockChats = (): Chat[] => {
  const now = new Date()

  return [
    // Today (3개)
    { id: '1', title: 'Vue 3 Composition API best practices', timestamp: now },
    {
      id: '2',
      title: 'Pinia vs Vuex comparison',
      timestamp: subHours(now, 2),
    },
    {
      id: '3',
      title: 'TypeScript generic constraints',
      timestamp: subHours(now, 5),
    },

    // This Week (7개)
    {
      id: '4',
      title: 'Electron IPC communication patterns',
      timestamp: subDays(now, 1),
    },
    {
      id: '5',
      title: 'Tailwind CSS v4 new features',
      timestamp: subDays(now, 2),
    },
    {
      id: '6',
      title: 'Vue Router navigation guards explained',
      timestamp: subDays(now, 3),
    },
    {
      id: '7',
      title: 'Vite build optimization tips',
      timestamp: subDays(now, 4),
    },
    {
      id: '8',
      title: 'shadcn-vue component library guide',
      timestamp: subDays(now, 5),
    },
    {
      id: '9',
      title: 'Dark mode implementation strategies',
      timestamp: subDays(now, 6),
    },
    {
      id: '10',
      title: 'State management patterns in Vue',
      timestamp: subDays(now, 6),
    },

    // Older (10개)
    {
      id: '11',
      title: 'Building desktop apps with Electron',
      timestamp: subDays(now, 15),
    },
    {
      id: '12',
      title: 'CSS Grid vs Flexbox when to use',
      timestamp: subDays(now, 20),
    },
    {
      id: '13',
      title: 'TypeScript generics deep dive',
      timestamp: subDays(now, 25),
    },
    {
      id: '14',
      title: 'Performance optimization techniques',
      timestamp: subDays(now, 30),
    },
    {
      id: '15',
      title: 'Responsive design best practices',
      timestamp: subDays(now, 35),
    },
    {
      id: '16',
      title: 'Vue 3 reactivity system explained',
      timestamp: subDays(now, 40),
    },
    {
      id: '17',
      title: 'Web accessibility fundamentals',
      timestamp: subDays(now, 45),
    },
    {
      id: '18',
      title: 'REST API design principles',
      timestamp: subDays(now, 50),
    },
    {
      id: '19',
      title: 'Git workflow strategies',
      timestamp: subDays(now, 60),
    },
    {
      id: '20',
      title: 'Testing Vue components with Vitest',
      timestamp: subDays(now, 70),
    },
  ]
}

export const useChatsStore = defineStore('chats', () => {
  // State
  const chats = ref<Chat[]>(generateMockChats())
  const activeChatId = ref<string | null>(null)

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

  // Actions
  const addChat = (title: string) => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title,
      timestamp: new Date(),
      messages: 0,
    }
    chats.value.unshift(newChat)
    activeChatId.value = newChat.id
  }

  const deleteChat = (id: string) => {
    const index = chats.value.findIndex((chat) => chat.id === id)
    if (index !== -1) {
      chats.value.splice(index, 1)
      if (activeChatId.value === id) {
        activeChatId.value = chats.value.length > 0 ? (chats.value[0]?.id ?? null) : null
      }
    }
  }

  const renameChat = (id: string, newTitle: string) => {
    const chat = chats.value.find((chat) => chat.id === id)
    if (chat) {
      chat.title = newTitle
    }
  }

  const setActiveChat = (id: string) => {
    activeChatId.value = id
  }

  const clearHistory = () => {
    chats.value = []
    activeChatId.value = null
  }

  return {
    // State
    chats,
    activeChatId,
    // Getters
    groupedChats,
    activeChatData,
    // Actions
    addChat,
    deleteChat,
    renameChat,
    setActiveChat,
    clearHistory,
  }
})
