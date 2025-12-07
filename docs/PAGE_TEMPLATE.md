# 페이지 템플릿 가이드

Vue 3 프로젝트에서 새 페이지를 만들 때 사용할 표준 템플릿 구조입니다.

## 기본 템플릿

```vue
<route lang="yaml">
meta:
  title: Page Title
</route>

<script setup lang="ts">
// Auto-imported APIs (ref, computed, useRouter, etc.)
</script>

<template>
  <div class="page-container">
    <!-- Page content here -->
  </div>
</template>

<style scoped>
.page-container {
  /* Optional styles */
}
</style>
```

## 구조 설명

### 1. `<route>` 블록 (필수)

페이지 메타데이터를 정의합니다.

```yaml
<route lang="yaml">
meta:
  title: Page Title  # 브라우저 탭 제목, SEO
</route>
```

**선택적 필드:**

```yaml
meta:
  title: Page Title
  layout: auth          # 레이아웃 선택 (default/auth/admin 등)
  requiresAuth: true    # 인증 필요 여부
  roles: ['admin']      # 접근 권한
```

### 2. `<script setup>` 블록

TypeScript와 Composition API를 사용합니다.

```typescript
<script setup lang="ts">
// Vue APIs는 auto-import되므로 import 불필요
const count = ref(0)
const router = useRouter()
const route = useRoute()
</script>
```

### 3. `<template>` 블록

시맨틱한 HTML 구조를 사용합니다.

```vue
<template>
  <div class="page-container">
    <h1>{{ title }}</h1>
    <main>
      <!-- 페이지 컨텐츠 -->
    </main>
  </div>
</template>
```

### 4. `<style>` 블록 (선택)

스타일 격리를 위해 `scoped` 사용을 권장합니다.

```vue
<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
```

## 파일 명명 규칙

### 정적 라우트

```
src/pages/
├── index.vue       # /
├── about.vue       # /about
└── contact.vue     # /contact
```

### 동적 라우트

```
src/pages/
├── users/
│   ├── index.vue   # /users
│   ├── [id].vue    # /users/:id
│   └── create.vue  # /users/create
```

### 중첩 라우트

```
src/pages/
└── admin/
    ├── index.vue     # /admin
    ├── users.vue     # /admin/users
    └── settings.vue  # /admin/settings
```

## 실제 예시

### 간단한 정적 페이지

```vue
<route lang="yaml">
meta:
  title: About Us
</route>

<script setup lang="ts">
// 로직이 없으면 비워둬도 됨
</script>

<template>
  <div class="about-page">
    <h1>About Us</h1>
    <p>Welcome to our company!</p>
  </div>
</template>

<style scoped>
.about-page {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}
</style>
```

### 동적 라우트 페이지

```vue
<route lang="yaml">
meta:
  title: User Profile
</route>

<script setup lang="ts">
const route = useRoute('/users/[id]')
const userId = computed(() => route.params.id)

const { data: user, isLoading } = await useFetch(`/api/users/${userId.value}`)
</script>

<template>
  <div class="user-profile">
    <div v-if="isLoading">Loading...</div>
    <div v-else>
      <h1>{{ user?.name }}</h1>
      <p>{{ user?.email }}</p>
    </div>
  </div>
</template>
```

### 인증이 필요한 페이지

```vue
<route lang="yaml">
meta:
  title: Dashboard
  requiresAuth: true
  layout: admin
</route>

<script setup lang="ts">
const userStore = useUserStore()
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome, {{ userStore.user?.name }}</p>
  </div>
</template>
```

## 체크리스트

새 페이지를 만들 때 확인:

- [ ] `<route>` 블록에 `meta.title` 설정
- [ ] 필요시 `layout` 지정
- [ ] `<script setup lang="ts">` 사용
- [ ] Auto-import 활용 (불필요한 import 제거)
- [ ] 시맨틱한 HTML 태그 사용
- [ ] `<style scoped>` 로 스타일 격리
- [ ] 파일명이 라우트 규칙과 일치

## 피해야 할 패턴

### ❌ 불필요한 import

```vue
<!-- Bad -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
</script>

<!-- Good -->
<script setup lang="ts">
// Auto-imported!
const count = ref(0)
const router = useRouter()
</script>
```

### ❌ 빈 title

```vue
<!-- Bad -->
<route lang="yaml">
meta:
  title:
</route>

<!-- Good -->
<route lang="yaml">
meta:
  title: Contact Page
</route>
```

## 동적 타이틀 사용하기

컴포넌트 내에서 `useHead()`를 사용하여 동적으로 타이틀을 업데이트할 수 있습니다.

### 기본 동적 타이틀

```vue
<route lang="yaml">
meta:
  title: User Profile
</route>

<script setup lang="ts">
const userName = ref('John Doe')

// 동적 타이틀 설정
useHead({
  title: computed(() => `${userName.value} - Profile`)
})
</script>
```

### SEO 메타 태그 포함

```vue
<script setup lang="ts">
const title = 'My Page Title'
const description = 'This is my page description'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/images/og-image.jpg',
  twitterCard: 'summary_large_image',
})
</script>
```

### 동적 데이터와 함께 사용

```vue
<route lang="yaml">
meta:
  title: Product Detail
</route>

<script setup lang="ts">
const route = useRoute('/products/[id]')
const productId = computed(() => route.params.id)

// API에서 제품 정보 가져오기
const { data: product } = await useFetch(`/api/products/${productId.value}`)

// 제품명을 포함한 동적 타이틀
useHead({
  title: computed(() =>
    product.value ? `${product.value.name} - Product` : 'Product Detail'
  )
})

// SEO 메타 태그도 함께 설정
useSeoMeta({
  description: computed(() => product.value?.description ?? ''),
  ogTitle: computed(() => product.value?.name ?? 'Product'),
  ogImage: computed(() => product.value?.image ?? '/default-og.jpg'),
})
</script>
```

### ❌ Global 스타일

```vue
<!-- Bad -->
<style>
.container { /* Global pollution */ }
</style>

<!-- Good -->
<style scoped>
.container { /* Scoped */ }
</style>
```

## Tailwind 4 사용 가이드

### `<style scoped>`에서 Tailwind 유틸리티 사용

페이지의 `<style scoped>` 블록에서 `@apply`를 사용하려면 `@reference` 디렉티브가 필요합니다.

```vue
<route lang="yaml">
meta:
  title: My Page
</route>

<script setup lang="ts">
// Page logic
</script>

<template>
  <div class="page-container">
    <h1>Welcome</h1>
  </div>
</template>

<style scoped>
@reference '../assets/main.css';

.page-container {
  @apply max-w-7xl mx-auto px-4 py-8;
}

.page-container::before {
  content: '';
  @apply absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-10;
}
</style>
```

**왜 `@reference`가 필요한가?**
- `<style scoped>`는 별도로 번들링되므로 Tailwind 테마 변수에 접근할 수 없음
- `@reference`는 CSS를 복제하지 않고 테마 정의만 참조함

### Tailwind 클래스 우선 사용 권장

가능하면 `<template>`에서 직접 Tailwind 클래스를 사용:

```vue
<!-- Good - Tailwind 클래스 직접 사용 -->
<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900">Page Title</h1>
    <p class="mt-4 text-gray-600">Page content</p>
  </div>
</template>

<!-- OK - 복잡하거나 의사 요소가 필요한 경우 -->
<template>
  <div class="page-with-decorations">
    <h1>Page Title</h1>
  </div>
</template>

<style scoped>
@reference '../assets/main.css';

.page-with-decorations::before {
  content: '';
  @apply absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500;
}
</style>
```

## 참고 자료

- [unplugin-vue-router Route Block](https://uvr.esm.is/guide/route-block)
- [Vue 3 Script Setup](https://vuejs.org/api/sfc-script-setup.html)
- [Vue 3 Scoped CSS](https://vuejs.org/api/sfc-css-features.html#scoped-css)
