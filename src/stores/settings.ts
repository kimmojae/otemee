import { settingsApi, type SettingsResponse, type SettingsUpdate } from '@/api/settings'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

export const useSettingsStore = defineStore('settings', () => {
  const queryClient = useQueryClient()

  // 모달 상태
  const isOpen = ref(false)
  const activeTab = ref<'general' | 'api-keys' | 'about'>('general')

  // TanStack Query - 설정 조회
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  })

  // 설정 업데이트 mutation
  const updateMutation = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      // 모델 목록도 갱신 (API 키 변경 시 사용 가능한 모델이 달라지므로)
      queryClient.invalidateQueries({ queryKey: ['models'] })
    },
  })

  // Actions
  const openSettings = (tab: 'general' | 'api-keys' | 'about' = 'general') => {
    activeTab.value = tab
    isOpen.value = true
  }

  const closeSettings = () => {
    isOpen.value = false
  }

  const updateSettings = async (data: SettingsUpdate) => {
    await updateMutation.mutateAsync(data)
  }

  return {
    // 모달 상태
    isOpen,
    activeTab,
    // 설정 데이터
    settings,
    isLoading,
    error,
    isUpdating: computed(() => updateMutation.isPending),
    // Actions
    openSettings,
    closeSettings,
    updateSettings,
  }
})
