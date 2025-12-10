<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Input } from '@/components/ui/input'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const { settings, isUpdating } = storeToRefs(settingsStore)

// 각 provider별 입력 상태
const openaiKey = ref('')
const anthropicKey = ref('')
const googleKey = ref('')
const groqKey = ref('')

// 저장 상태 추적
const savedStatus = ref<Record<string, 'idle' | 'saving' | 'saved'>>({
  openai: 'idle',
  anthropic: 'idle',
  google: 'idle',
  groq: 'idle',
})

const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4o Mini, etc.',
    placeholder: 'sk-proj-...',
    keyRef: openaiKey,
    enabledKey: 'openai_enabled' as const,
    apiKeyField: 'openai_api_key' as const,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus, etc.',
    placeholder: 'sk-ant-...',
    keyRef: anthropicKey,
    enabledKey: 'anthropic_enabled' as const,
    apiKeyField: 'anthropic_api_key' as const,
  },
  {
    id: 'google',
    name: 'Google (Gemini)',
    description: 'Gemini 1.5 Pro, Gemini 1.5 Flash, etc.',
    placeholder: 'AIza...',
    keyRef: googleKey,
    enabledKey: 'google_enabled' as const,
    apiKeyField: 'google_api_key' as const,
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Llama 3.3 70B, Mixtral 8x7B, etc.',
    placeholder: 'gsk_...',
    keyRef: groqKey,
    enabledKey: 'groq_enabled' as const,
    apiKeyField: 'groq_api_key' as const,
  },
]

const saveKey = async (provider: (typeof providers)[0]) => {
  const value = provider.keyRef.value.trim()
  savedStatus.value[provider.id] = 'saving'

  try {
    await settingsStore.updateSettings({
      [provider.apiKeyField]: value || null,
    })
    provider.keyRef.value = ''
    savedStatus.value[provider.id] = 'saved'
    setTimeout(() => {
      savedStatus.value[provider.id] = 'idle'
    }, 2000)
  } catch {
    savedStatus.value[provider.id] = 'idle'
  }
}

const deleteKey = async (provider: (typeof providers)[0]) => {
  savedStatus.value[provider.id] = 'saving'

  try {
    await settingsStore.updateSettings({
      [provider.apiKeyField]: '',
    })
    savedStatus.value[provider.id] = 'idle'
  } catch {
    savedStatus.value[provider.id] = 'idle'
  }
}
</script>

<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-medium text-neutral-900 dark:text-white mb-1">API Keys</h3>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        Configure API keys for different LLM providers
      </p>

      <div class="space-y-4">
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="text-sm font-medium text-neutral-900 dark:text-white flex items-center gap-2">
                {{ provider.name }}
                <span
                  v-if="settings?.[provider.enabledKey]"
                  class="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                >
                  Active
                </span>
              </div>
              <div class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ provider.description }}
              </div>
            </div>

            <!-- 키가 이미 설정된 경우 삭제 버튼 -->
            <button
              v-if="settings?.[provider.enabledKey]"
              class="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
              @click="deleteKey(provider)"
            >
              Remove
            </button>
          </div>

          <!-- 현재 설정된 키 (마스킹) -->
          <div
            v-if="settings?.[provider.enabledKey] && settings?.[provider.apiKeyField]"
            class="mb-2 px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 rounded-lg font-mono"
          >
            {{ settings[provider.apiKeyField] }}
          </div>

          <!-- 새 키 입력 -->
          <div class="flex gap-2">
            <Input
              v-model="provider.keyRef.value"
              type="password"
              :placeholder="provider.placeholder"
              class="flex-1 font-mono text-sm"
            />
            <button
              :disabled="!provider.keyRef.value.trim() || savedStatus[provider.id] === 'saving'"
              class="px-3 py-2 text-sm font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              @click="saveKey(provider)"
            >
              <Icon
                v-if="savedStatus[provider.id] === 'saving'"
                icon="heroicons:arrow-path"
                class="w-4 h-4 animate-spin"
              />
              <Icon
                v-else-if="savedStatus[provider.id] === 'saved'"
                icon="heroicons:check"
                class="w-4 h-4"
              />
              {{ savedStatus[provider.id] === 'saved' ? 'Saved' : 'Save' }}
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
