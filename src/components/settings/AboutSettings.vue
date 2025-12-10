<script setup lang="ts">
const appVersion = '0.1.0'
</script>

<template>
  <div class="space-y-6">
    <section>
      <h3 class="text-sm font-medium text-neutral-900 dark:text-white mb-4">About</h3>

      <div class="space-y-4">
        <!-- App Info -->
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 bg-neutral-200 dark:bg-neutral-700 rounded-2xl flex items-center justify-center"
          >
            <img src="/logo.png" alt="Otemee" class="w-12 h-12 object-contain" />
          </div>
          <div>
            <div class="text-lg font-semibold text-neutral-900 dark:text-white">Otemee</div>
            <div class="text-sm text-neutral-500 dark:text-neutral-400">
              Version {{ appVersion }}
            </div>
          </div>
        </div>

        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          A modern AI chat application with support for multiple LLM providers including Ollama,
          OpenAI, Anthropic, Google, and Groq.
        </p>

        <!-- Contact -->
        <div class="pt-2">
          <div class="text-sm text-neutral-500 dark:text-neutral-400">
            Contact:
            <a
              href="mailto:mojaekim@gmail.com"
              class="text-blue-600 dark:text-blue-400 hover:underline"
            >
              mojaekim@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
