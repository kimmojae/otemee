import { modelsApi, type Model } from '@/api/models'

export const useModelsStore = defineStore('models', () => {
  const models = ref<Model[]>([])
  const ollamaStatus = ref<'running' | 'not_running'>('running')
  const isLoading = ref(false)
  const lastFetchTime = ref<number>(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5분

  const fetchModels = async (force = false) => {
    const now = Date.now()

    // 캐시가 유효하고 force가 아니면 기존 데이터 반환
    if (!force && now - lastFetchTime.value < CACHE_DURATION && models.value.length > 0) {
      return models.value
    }

    isLoading.value = true
    try {
      const response = await modelsApi.list()
      models.value = response.models
      ollamaStatus.value = response.ollama_status || 'running'
      lastFetchTime.value = now
    } catch (error) {
      console.error('Failed to fetch models:', error)
    } finally {
      isLoading.value = false
    }

    return models.value
  }

  return {
    models,
    ollamaStatus,
    isLoading,
    fetchModels,
  }
})
