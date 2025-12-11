<script setup lang="ts">
import { modelsApi, type Model } from '@/api/models'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useQuery } from '@tanstack/vue-query'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')

// TanStack Query로 모델 목록 캐싱
const { data: modelsResponse, isLoading } = useQuery({
  queryKey: ['models'],
  queryFn: modelsApi.list,
  staleTime: 1000 * 60 * 5, // 5분간 캐싱
})

const models = computed(() => modelsResponse.value?.models || [])
const ollamaStatus = computed(() => modelsResponse.value?.ollama_status || 'running')

// 검색 필터링
const filteredModels = computed(() => {
  if (!models.value) return []
  const query = searchQuery.value.toLowerCase()
  if (!query) return models.value
  return models.value.filter(
    (model) =>
      model.name.toLowerCase().includes(query) || model.provider.toLowerCase().includes(query),
  )
})

// Provider별 그룹화
const groupedModels = computed(() => {
  const groups: Record<string, Model[]> = {}
  for (const model of filteredModels.value) {
    const provider = model.provider
    if (!groups[provider]) {
      groups[provider] = []
    }
    groups[provider].push(model)
  }
  return groups
})

// 선택된 모델 이름
const selectedModelName = computed(() => {
  if (!props.modelValue) return 'Select model'
  const model = models.value?.find((m) => m.id === props.modelValue)
  return model?.name || 'Select model'
})

// 현재 선택된 모델이 목록에 없으면 첫 번째 모델 선택
watch(models, (newModels) => {
  if (!props.modelValue || newModels.length === 0) return

  const modelExists = newModels.some((m) => m.id === props.modelValue)
  if (!modelExists && newModels.length > 0) {
    // 선택된 모델이 목록에 없으면 첫 번째 모델 선택
    emit('update:modelValue', newModels[0].id)
  }
})

const selectModel = (model: Model) => {
  emit('update:modelValue', model.id)
  isOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        type="button"
        class="flex items-center gap-1.5 h-9 px-3 text-sm bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-full transition-colors"
      >
        <span class="truncate max-w-[120px]">{{ selectedModelName }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </PopoverTrigger>

    <PopoverContent class="w-64 p-0" align="start">
      <!-- 검색 입력 -->
      <div class="p-2 border-b border-neutral-200 dark:border-neutral-700">
        <Input
          v-model="searchQuery"
          placeholder="Search models..."
          class="h-8 text-sm"
          @keydown.stop
        />
      </div>

      <!-- 모델 목록 -->
      <div class="max-h-64 overflow-y-auto p-1">
        <div v-if="isLoading" class="py-4 text-center text-sm text-neutral-500">Loading...</div>

        <template v-else>
          <!-- 모델 목록 -->
          <div v-for="(providerModels, provider) in groupedModels" :key="provider" class="mb-2">
            <!-- Provider 헤더 -->
            <div
              class="px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
            >
              {{ provider }}
            </div>

            <!-- 모델 항목들 -->
            <button
              v-for="model in providerModels"
              :key="model.id"
              class="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left"
              :class="{
                'bg-neutral-100 dark:bg-neutral-800': model.id === modelValue,
              }"
              @click="selectModel(model)"
            >
              <span class="truncate">{{ model.name }}</span>
              <span
                v-if="model.size"
                class="text-xs text-neutral-400 dark:text-neutral-500 ml-2 shrink-0"
              >
                {{ model.size }}
              </span>
            </button>
          </div>

          <!-- Ollama가 실행되지 않았을 때 안내 메시지 -->
          <div v-if="ollamaStatus === 'not_running' && !searchQuery" class="mb-2">
            <div
              class="px-2 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
            >
              Ollama
            </div>
            <div class="px-2 py-2 text-xs text-neutral-500 dark:text-neutral-400">
              Ollama is not running
            </div>
          </div>

          <!-- 모델도 없고 Ollama도 실행 안됨 -->
          <div
            v-if="Object.keys(groupedModels).length === 0 && ollamaStatus === 'running'"
            class="py-4 text-center text-sm text-neutral-500"
          >
            No models found
          </div>
        </template>
      </div>
    </PopoverContent>
  </Popover>
</template>
