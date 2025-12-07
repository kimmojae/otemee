import { ref } from 'vue'

// 전역 스트리밍 상태 관리
const streamingMessageIds = ref(new Set<string>())

export function useStreamingState() {
  const startStreaming = (messageId: string) => {
    streamingMessageIds.value.add(messageId)
  }

  const stopStreaming = (messageId: string) => {
    streamingMessageIds.value.delete(messageId)
  }

  const isStreaming = (messageId: string) => {
    return streamingMessageIds.value.has(messageId)
  }

  return {
    streamingMessageIds,
    startStreaming,
    stopStreaming,
    isStreaming,
  }
}
