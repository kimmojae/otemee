import { setupLayouts } from 'virtual:generated-layouts'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

const DEFAULT_TITLE = 'Vue3 Starter Template'

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(routes as RouteRecordRaw[]),

  scrollBehavior() {
    return { left: 0, top: 0, behavior: 'smooth' }
  },
})

// 페이지 타이틀 자동 설정
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} - ${DEFAULT_TITLE}` : DEFAULT_TITLE
})

// Enable HMR for routes in development
if (import.meta.hot) {
  handleHotUpdate(router)
}

export default router
