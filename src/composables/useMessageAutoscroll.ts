import type { Message } from '@/types/chat'
import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

interface UseMessageAutoscrollOptions {
  messages: Ref<Message[]>
  isStreaming: Ref<boolean>
}

export function useMessageAutoscroll({ messages, isStreaming }: UseMessageAutoscrollOptions) {
  const containerRef = ref<HTMLElement | null>(null)
  let pendingScrollToUserMessage = false // React의 useRef처럼 비반응형
  const spacerHeight = ref(0)
  const isActiveInteraction = ref(false)
  let hasSubmittedMessage = false // React의 useRef처럼 비반응형
  let isUpdatingSpacerHeight = false

  // Find the last user message index
  const getLastUserMessageIndex = () => {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i]?.role === 'user') {
        return i
      }
    }
    return -1
  }

  // Scroll to specific message
  const scrollToMessage = (messageIndex: number) => {
    if (!containerRef.value || messageIndex < 0) {
      console.log('[scrollToMessage] Early return: no container or invalid index')
      return
    }

    const container = containerRef.value
    const targetElement = container.querySelector(
      `[data-message-index="${messageIndex}"]`,
    ) as HTMLElement | null

    if (!targetElement) {
      console.log('[scrollToMessage] Target element not found for index:', messageIndex)
      return
    }

    const containerHeight = container.clientHeight
    const scrollHeight = container.scrollHeight
    const messageHeight = targetElement.offsetHeight

    // Get the message list element (data-role="message-list")
    const messageListElement = container.querySelector('[data-role="message-list"]') as HTMLElement
    if (!messageListElement) {
      console.log('[scrollToMessage] Message list element not found')
      return
    }

    // Calculate position relative to the message list
    const messageListTop = messageListElement.offsetTop
    const messageOffsetTop = (targetElement as HTMLElement).offsetTop
    const relativePosition = messageOffsetTop - messageListTop

    console.log('[scrollToMessage] Debug info:', {
      messageIndex,
      containerHeight,
      scrollHeight,
      messageHeight,
      messageListTop,
      messageOffsetTop,
      relativePosition,
      currentScrollTop: container.scrollTop,
    })

    // Check if the message is large (70% of container height)
    const isLarge = messageHeight > containerHeight * 0.7

    let targetPosition: number

    if (messageIndex === 0) {
      // First message: scroll to top
      targetPosition = 0
    } else if (isLarge) {
      // Large message: scroll to bottom
      targetPosition = scrollHeight - containerHeight
    } else {
      // Normal message: position at top using relative position
      targetPosition = relativePosition
    }

    const maxScroll = scrollHeight - containerHeight
    const finalPosition = Math.min(Math.max(0, targetPosition), maxScroll)

    console.log('[scrollToMessage] Scroll calculation:', {
      isLarge,
      targetPosition,
      maxScroll,
      finalPosition,
    })

    container.scrollTo({
      top: finalPosition,
      behavior: 'smooth',
    })
  }

  // Update spacer height
  const updateSpacerHeight = () => {
    if (isUpdatingSpacerHeight || !containerRef.value) {
      console.log('[updateSpacerHeight] Early return:', {
        isUpdating: isUpdatingSpacerHeight,
        hasContainer: !!containerRef.value,
      })
      return
    }

    isUpdatingSpacerHeight = true

    const containerHeight = containerRef.value.clientHeight
    const lastUserIndex = getLastUserMessageIndex()

    console.log('[updateSpacerHeight] Starting:', {
      containerHeight,
      lastUserIndex,
      isActiveInteraction: isActiveInteraction.value,
      isStreaming: isStreaming.value,
    })

    if (lastUserIndex < 0) {
      spacerHeight.value = 0
      isUpdatingSpacerHeight = false
      console.log('[updateSpacerHeight] No user messages, spacer = 0')
      return
    }

    const messageElements = containerRef.value.querySelectorAll(
      '[data-message-index]',
    ) as NodeListOf<HTMLElement>

    if (!messageElements || messageElements.length === 0) {
      spacerHeight.value = 0
      isUpdatingSpacerHeight = false
      console.log('[updateSpacerHeight] No message elements, spacer = 0')
      return
    }

    const targetElement = containerRef.value.querySelector(
      `[data-message-index="${lastUserIndex}"]`,
    ) as HTMLElement | null

    if (!targetElement) {
      spacerHeight.value = 0
      isUpdatingSpacerHeight = false
      console.log('[updateSpacerHeight] Target element not found, spacer = 0')
      return
    }

    // Only apply spacer height when actively interacting
    if (!isActiveInteraction.value) {
      spacerHeight.value = 0
      isUpdatingSpacerHeight = false
      console.log('[updateSpacerHeight] Not active interaction, spacer = 0')
      return
    }

    const elementsAfter = Array.from(messageElements).filter((el) => {
      const idx = Number(el.dataset.messageIndex)
      return Number.isFinite(idx) && idx > lastUserIndex
    })

    const contentHeightAfterTarget = elementsAfter.reduce((sum, el) => sum + el.offsetHeight, 0)
    const targetMessageHeight = targetElement.offsetHeight

    let baseHeight: number

    if (contentHeightAfterTarget === 0) {
      // No content after the user message (new message case)
      baseHeight = Math.max(0, containerHeight - targetMessageHeight)
    } else {
      // Content exists after the user message
      baseHeight = Math.max(0, containerHeight - contentHeightAfterTarget - targetMessageHeight)
    }

    // Add extra space for assistant response when streaming
    const extraSpaceForAssistant = isStreaming.value ? containerHeight * 0.4 : 0
    const calculatedHeight = Math.max(0, baseHeight + extraSpaceForAssistant)

    console.log('[updateSpacerHeight] Calculation:', {
      targetMessageHeight,
      contentHeightAfterTarget,
      elementsAfterCount: elementsAfter.length,
      baseHeight,
      extraSpaceForAssistant,
      calculatedHeight,
    })

    spacerHeight.value = calculatedHeight
    isUpdatingSpacerHeight = false
  }

  // Handle new user message submission
  const handleNewUserMessage = () => {
    console.log('[handleNewUserMessage] Called')
    pendingScrollToUserMessage = true
    isActiveInteraction.value = true
    hasSubmittedMessage = true
  }

  // React의 useLayoutEffect와 동일하게 DOM 업데이트 후 즉시 실행
  watch(
    () => messages.value.length,
    (newLength, oldLength) => {
      console.log('[watch messages.length]', {
        newLength,
        oldLength,
        pendingScrollToUserMessage,
      })

      if (pendingScrollToUserMessage) {
        const targetUserIndex = getLastUserMessageIndex()
        console.log('[watch] targetUserIndex:', targetUserIndex)

        if (targetUserIndex >= 0) {
          console.log('[watch] Starting double RAF')
          requestAnimationFrame(() => {
            console.log('[watch] First RAF - updating spacer height')
            updateSpacerHeight()
            requestAnimationFrame(() => {
              console.log('[watch] Second RAF - scrolling to message')
              scrollToMessage(targetUserIndex)
              pendingScrollToUserMessage = false
            })
          })
        } else {
          pendingScrollToUserMessage = false
          isActiveInteraction.value = isStreaming.value
        }
      }
    },
    { flush: 'post' },
  )

  // Update active interaction state
  watch(isStreaming, () => {
    if (isStreaming.value || pendingScrollToUserMessage || hasSubmittedMessage) {
      isActiveInteraction.value = true
    } else {
      isActiveInteraction.value = false
    }
  })

  // Recalculate spacer height when messages change
  watch(
    () => messages.value,
    () => {
      updateSpacerHeight()
    },
    { flush: 'post', deep: true },
  )

  // ResizeObserver and MutationObserver setup
  onMounted(() => {
    if (!containerRef.value) return

    let resizeTimeout: number
    let immediateUpdate = false

    const resizeObserver = new ResizeObserver((entries) => {
      let hasSignificantChange = false
      for (const entry of entries) {
        const element = entry.target as HTMLElement
        if (element.dataset.messageIndex && entry.contentRect.height !== element.offsetHeight) {
          const heightDiff = Math.abs(entry.contentRect.height - element.offsetHeight)
          if (heightDiff > 50) {
            hasSignificantChange = true
            break
          }
        }
      }

      if (hasSignificantChange || immediateUpdate) {
        updateSpacerHeight()
        immediateUpdate = false
      } else {
        clearTimeout(resizeTimeout)
        resizeTimeout = window.setTimeout(() => {
          updateSpacerHeight()
        }, 100)
      }
    })

    const mutationObserver = new MutationObserver((mutations) => {
      const hasToggle = mutations.some(
        (mutation) =>
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' ||
            mutation.attributeName === 'style' ||
            mutation.attributeName === 'open' ||
            mutation.attributeName === 'data-expanded'),
      )

      if (hasToggle) {
        immediateUpdate = true
        updateSpacerHeight()
      }
    })

    resizeObserver.observe(containerRef.value)
    mutationObserver.observe(containerRef.value, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'open', 'data-expanded'],
    })

    const messageElements = containerRef.value.querySelectorAll('[data-message-index]')
    messageElements.forEach((element) => {
      resizeObserver.observe(element)
    })

    onUnmounted(() => {
      clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    })
  })

  return {
    containerRef,
    spacerHeight,
    handleNewUserMessage,
  }
}
