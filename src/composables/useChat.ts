import { parseBlocks, parseIncompleteMarkdown } from 'streamdown-vue'

const API_BASE_URL = 'http://localhost:8000'

interface StreamChatOptions {
  message: string
  chatId?: string // chat_id가 있으면 저장, 없으면 임시 채팅
  model?: string
  onChatCreated?: (chatId: string) => void // 새 채팅 생성 이벤트
  onChunk: (text: string) => void
  onDone: () => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

export function useChat() {
  const streamChat = async ({
    message,
    chatId,
    model = 'gemma3:1b',
    onChatCreated,
    onChunk,
    onDone,
    onError,
    signal,
  }: StreamChatOptions) => {
    try {
      // chatId가 있으면 저장하는 엔드포인트, 없으면 임시 채팅
      const endpoint = chatId ? `${API_BASE_URL}/api/chat/${chatId}` : `${API_BASE_URL}/api/chat`

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, model }),
        signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let currentEventType = '' // SSE 이벤트 타입 추적

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          // SSE 이벤트 타입 파싱
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              onDone()
            } else {
              try {
                const parsed = JSON.parse(data)

                // chat_created 이벤트 처리
                if (currentEventType === 'chat_created' && parsed.chat_id) {
                  onChatCreated?.(parsed.chat_id)
                  currentEventType = '' // 이벤트 타입 리셋
                } else if (parsed.content) {
                  onChunk(parsed.content)
                }
              } catch {
                // JSON 파싱 실패 시 무시
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }
      onError?.(error instanceof Error ? error : new Error(String(error)))
    }
  }

  return { streamChat }
}

// streamdown-vue 권장 방식: 스트리밍 마크다운 버퍼링 + repair
export function useStreamedMarkdown() {
  let rawBuffer = ''

  const pushChunk = (chunk: string): string => {
    rawBuffer += chunk
    const repaired = parseIncompleteMarkdown(rawBuffer)
    const blocks = parseBlocks(repaired)
    return blocks.join('')
  }

  const reset = () => {
    rawBuffer = ''
  }

  const getRaw = () => rawBuffer

  return { pushChunk, reset, getRaw }
}
