export const useSidebarStore = defineStore(
  'sidebar',
  () => {
    // State
    const isOpen = ref(true)

    // Actions
    const toggle = () => {
      isOpen.value = !isOpen.value
    }

    const open = () => {
      isOpen.value = true
    }

    const close = () => {
      isOpen.value = false
    }

    return {
      // State
      isOpen,
      // Actions
      toggle,
      open,
      close,
    }
  },
  {
    persist: true, // localStorage에 자동 저장
  },
)
