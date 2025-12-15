import type { Message } from '@/types/chat'

interface UseMessageAutoscrollOptions {
  messages: Ref<Message[]>
  isStreaming: Ref<boolean>
  chatId: Ref<string>
}

export function useMessageAutoscroll({ messages, isStreaming, chatId }: UseMessageAutoscrollOptions) {
  const containerRef = ref<HTMLElement | null>(null)
  let pendingScrollToUserMessage = false // React의 useRef처럼 비반응형
  const spacerHeight = ref(0)
  const isActiveInteraction = ref(false)
  let hasSubmittedMessage = false // React의 useRef처럼 비반응형
  let isUpdatingSpacerHeight = false
  const showScrollToBottom = ref(false) // 스크롤 하단 버튼 표시 여부
  const prevChatId = ref<string>('') // 초기값을 빈 문자열로 설정

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

    if (isLarge) {
      // Large message: scroll to show bottom of user message
      // Position so user message bottom is near top of viewport
      targetPosition = relativePosition + messageHeight - containerHeight * 0.3
    } else if (messageIndex === 0) {
      // First small message: scroll to top
      targetPosition = 0
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

    // 콘텐츠가 이미 화면을 넘어가는지 체크
    const allMessagesHeight = Array.from(messageElements).reduce((sum, el) => sum + el.offsetHeight, 0)

    // baseHeight만 더해서 체크 (extra space 제외)
    if (allMessagesHeight + baseHeight <= containerHeight) {
      // 콘텐츠가 화면에 다 보임 → spacer 불필요
      console.log('[updateSpacerHeight] Content fits in container, no spacer needed:', {
        allMessagesHeight,
        baseHeight,
        total: allMessagesHeight + baseHeight,
        containerHeight,
      })
      spacerHeight.value = 0
      isUpdatingSpacerHeight = false
      return
    }

    // 콘텐츠가 화면을 넘어감 → spacer 필요
    const extraSpaceForAssistant = isStreaming.value ? containerHeight * 0.4 : 0
    const calculatedHeight = baseHeight + extraSpaceForAssistant

    console.log('[updateSpacerHeight] Spacer needed:', {
      targetMessageHeight,
      contentHeightAfterTarget,
      elementsAfterCount: elementsAfter.length,
      baseHeight,
      extraSpaceForAssistant,
      allMessagesHeight,
      containerHeight,
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

  // ChatId 변경 시 상태 리셋 (Ollama 방식)
  watch(
    () => chatId.value,
    (newChatId, oldChatId) => {
      // 초기 로드 시에도 리셋 (oldChatId가 undefined거나 다른 경우)
      if (prevChatId.value !== newChatId) {
        isActiveInteraction.value = false
        hasSubmittedMessage = false
        prevChatId.value = newChatId
      }
    },
    { immediate: true }
  )

  // Recalculate spacer height when messages change
  watch(
    () => messages.value.length,
    () => {
      updateSpacerHeight()
    },
    { flush: 'post' },
  )

  // 스트리밍 중 콘텐츠가 늘어나면 버튼 표시 여부 체크
  watch(
    () => {
      const lastMessage = messages.value[messages.value.length - 1]
      return lastMessage?.content?.length ?? 0
    },
    () => {
      if (isStreaming.value) {
        // 스트리밍 중이면 바닥에서 멀어졌는지 체크해서 버튼 표시
        showScrollToBottom.value = !isNearBottom(150)
      }
    },
    { flush: 'post' },
  )

  // 바닥 근처인지 체크
  const isNearBottom = (threshold = 100) => {
    if (!containerRef.value) return true
    const container = containerRef.value
    const scrollTop = container.scrollTop
    const scrollHeight = container.scrollHeight
    const clientHeight = container.clientHeight
    return scrollHeight - scrollTop - clientHeight <= threshold
  }

  // 스크롤 이벤트 핸들러 - 바닥에서 멀어지면 버튼 표시
  const handleScroll = () => {
    showScrollToBottom.value = !isNearBottom(150)
  }

  // 바닥으로 스크롤
  const scrollToBottom = () => {
    if (!containerRef.value) return
    containerRef.value.scrollTo({
      top: containerRef.value.scrollHeight,
      behavior: 'smooth',
    })
  }

  // containerRef가 설정되면 스크롤 이벤트 등록
  watch(
    containerRef,
    (newContainer, oldContainer) => {
      if (oldContainer) {
        oldContainer.removeEventListener('scroll', handleScroll)
      }
      if (newContainer) {
        newContainer.addEventListener('scroll', handleScroll, { passive: true })
      }
    },
    { immediate: true },
  )

  // ResizeObserver and MutationObserver setup
  onMounted(() => {
    if (!containerRef.value) return

    let resizeTimeout: number
    let immediateUpdate = false
    const observedElements = new Set<Element>()

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

    // 관찰할 요소 업데이트 (메모리 누수 방지)
    const updateObservedElements = () => {
      if (!containerRef.value) return

      const currentElements = new Set<Element>()
      const messageElements = containerRef.value.querySelectorAll('[data-message-index]')

      // 현재 존재하는 요소 observe
      messageElements?.forEach((element) => {
        currentElements.add(element)
        if (!observedElements.has(element)) {
          resizeObserver.observe(element)
          observedElements.add(element)
        }
      })

      // 더 이상 존재하지 않는 요소 unobserve
      observedElements.forEach((element) => {
        if (!currentElements.has(element)) {
          resizeObserver.unobserve(element)
          observedElements.delete(element)
        }
      })
    }

    resizeObserver.observe(containerRef.value)
    mutationObserver.observe(containerRef.value, {
      attributes: true,
      subtree: true,
      attributeFilter: ['class', 'style', 'open', 'data-expanded'],
    })

    // 초기 요소 observe
    updateObservedElements()

    // 메시지가 추가/제거될 때마다 observe 업데이트
    watch(
      () => messages.value.length,
      () => {
        // DOM 업데이트 후 실행
        requestAnimationFrame(() => {
          updateObservedElements()
        })
      },
      { flush: 'post' },
    )

    onUnmounted(() => {
      clearTimeout(resizeTimeout)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
      observedElements.clear()
    })
  })

  return {
    containerRef,
    spacerHeight,
    handleNewUserMessage,
    showScrollToBottom,
    scrollToBottom,
  }
}
