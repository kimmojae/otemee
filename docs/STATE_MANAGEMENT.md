# 상태 관리 가이드

Vue 3 프로젝트에서 상태를 효과적으로 관리하기 위한 가이드입니다.

## 📋 목차

- [패턴 변천사](#패턴-변천사)
- [현대적 상태 관리 전략](#현대적-상태-관리-전략)
- [Pinia Store - 클라이언트 상태](#pinia-store---클라이언트-상태)
- [TanStack Query - 서버 상태](#tanstack-query---서버-상태)
- [Composables - 비즈니스 로직](#composables---비즈니스-로직)
- [실전 조합 예시](#실전-조합-예시)
- [안티패턴](#안티패턴)
- [마이그레이션 가이드](#마이그레이션-가이드)

---

## 패턴 변천사

### 🕰️ 2018-2020: Vuex/Pinia Store 중심

모든 상태(클라이언트 + 서버)를 Store에서 관리했던 시기.

```typescript
// store/users.ts
export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        this.users = await usersApi.getUsers()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
  },
})
```

**문제점:**
- ❌ 모든 API 상태를 수동 관리 (loading, error, data)
- ❌ 캐싱 직접 구현 필요
- ❌ 중복 요청 방지 직접 구현 필요
- ❌ 과도한 보일러플레이트

---

### 🔄 2020-2022: Composables 패턴

Composition API로 로직을 재사용하는 방식.

```typescript
// composables/useUsers.ts
import { ref } from 'vue'
import { usersApi } from '@/api/users/users.api'

export function useUsers() {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUsers() {
    loading.value = true
    try {
      users.value = await usersApi.getUsers()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  return { users, loading, error, fetchUsers }
}
```

**문제점:**
- ❌ 여전히 상태 수동 관리
- ❌ 캐싱 없음 (컴포넌트마다 새로 요청)
- ❌ 전역 상태 공유 어려움

---

### ⚡ 2022-현재: TanStack Query (추천)

서버 상태는 TanStack Query, 클라이언트 상태는 Pinia로 분리.

```typescript
// api/users/users.queries.ts
import { useQuery } from '@tanstack/vue-query'
import { usersApi } from './users.api'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
  })
}
```

```vue
<script setup>
import { useUsers } from '@/api/users/users.queries'

const { data: users, isPending } = useUsers()
// 자동 캐싱, 자동 재조회, 로딩 상태 자동 관리
</script>
```

**장점:**
- ✅ 상태 자동 관리 (loading, error, data)
- ✅ 자동 캐싱 및 동기화
- ✅ 중복 요청 방지
- ✅ 백그라운드 자동 재조회
- ✅ 최소한의 보일러플레이트

---

## 현대적 상태 관리 전략

| 상태 종류 | 사용 도구 | 예시 |
|-----------|----------|------|
| **클라이언트 상태** | Pinia Store | 현재 로그인 사용자, 테마, 언어 설정, UI 상태 |
| **서버 상태** | TanStack Query | API 데이터 (users, posts, products) |
| **비즈니스 로직** | Composables | 권한 체크, 폼 검증, 복잡한 계산 |
| **로컬 UI 상태** | ref/reactive | 모달 열림/닫힘, 현재 탭 선택 |

---

## Pinia Store - 클라이언트 상태

### 언제 사용하나?

- ✅ 클라이언트 전용 상태 (UI 설정, 사이드바 열림/닫힘)
- ✅ 앱 전체에서 공유하는 상태 (현재 로그인 사용자)
- ✅ 서버와 무관한 상태 (다크모드, 언어 설정)

### 예시

```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,           // 현재 로그인 사용자
    isAuthenticated: false,
    theme: 'dark',        // UI 설정
    sidebarOpen: true,    // UI 상태
    language: 'ko',       // 언어 설정
  }),

  actions: {
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },

    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
    },
  },
})
```

### 컴포넌트에서 사용

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div>
    <div>현재 사용자: {{ authStore.user?.name }}</div>
    <div>테마: {{ authStore.theme }}</div>
    <button @click="authStore.toggleTheme">
      테마 변경
    </button>
  </div>
</template>
```

---

## TanStack Query - 서버 상태

### 언제 사용하나?

- ✅ API 데이터 조회 (GET)
- ✅ API 데이터 변경 (POST, PUT, DELETE)
- ✅ 캐싱이 필요한 데이터
- ✅ 실시간 동기화가 필요한 데이터

### Query 예시 (조회)

```typescript
// api/users/users.queries.ts
import { useQuery } from '@tanstack/vue-query'
import { usersApi } from './users.api'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
    staleTime: 5 * 60 * 1000,  // 5분간 캐시 유지
  })
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,  // id가 있을 때만 실행
  })
}
```

### Mutation 예시 (생성/수정/삭제)

```typescript
// api/users/users.queries.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { usersApi } from './users.api'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input) => usersApi.createUser(input),
    onSuccess: () => {
      // 성공 시 users 목록 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }) => usersApi.updateUser(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => usersApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### 컴포넌트에서 사용

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useUsers, useCreateUser, useDeleteUser } from '@/api/users/users.queries'

// 조회
const { data: users, isPending, error } = useUsers()

// 생성
const createUser = useCreateUser()
const newUserName = ref('')

const handleCreate = () => {
  createUser.mutate(
    { name: newUserName.value },
    {
      onSuccess: () => {
        newUserName.value = ''
        alert('사용자가 추가되었습니다')
      },
    }
  )
}

// 삭제
const deleteUser = useDeleteUser()
const handleDelete = (id: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteUser.mutate(id)
  }
}
</script>

<template>
  <div>
    <!-- 로딩 상태 -->
    <div v-if="isPending">로딩 중...</div>

    <!-- 에러 상태 -->
    <div v-else-if="error">에러: {{ error.message }}</div>

    <!-- 데이터 표시 -->
    <div v-else>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }}
          <button
            @click="handleDelete(user.id)"
            :disabled="deleteUser.isPending"
          >
            삭제
          </button>
        </li>
      </ul>

      <!-- 추가 폼 -->
      <form @submit.prevent="handleCreate">
        <input v-model="newUserName" placeholder="이름" />
        <button type="submit" :disabled="createUser.isPending">
          {{ createUser.isPending ? '추가 중...' : '추가' }}
        </button>
      </form>
    </div>
  </div>
</template>
```

---

## Composables - 비즈니스 로직

### 언제 사용하나?

- ✅ 재사용 가능한 로직 (권한 체크, 폼 검증)
- ✅ 복잡한 계산 로직
- ✅ 여러 소스의 데이터를 조합하는 로직

### 예시: 권한 체크

```typescript
// composables/usePermissions.ts
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function usePermissions() {
  const authStore = useAuthStore()

  const canEdit = computed(() =>
    authStore.user?.role === 'admin' ||
    authStore.user?.role === 'editor'
  )

  const canDelete = computed(() =>
    authStore.user?.role === 'admin'
  )

  const canViewSettings = computed(() =>
    authStore.user?.role === 'admin' ||
    authStore.user?.role === 'moderator'
  )

  return {
    canEdit,
    canDelete,
    canViewSettings,
  }
}
```

### 예시: 폼 검증

```typescript
// composables/useFormValidation.ts
import { ref, computed } from 'vue'

export function useFormValidation(initialValues: any) {
  const values = ref(initialValues)
  const errors = ref({})
  const touched = ref({})

  const isValid = computed(() =>
    Object.keys(errors.value).length === 0
  )

  const validate = (field: string, rules: any[]) => {
    for (const rule of rules) {
      const error = rule(values.value[field])
      if (error) {
        errors.value[field] = error
        return
      }
    }
    delete errors.value[field]
  }

  const handleBlur = (field: string) => {
    touched.value[field] = true
  }

  return {
    values,
    errors,
    touched,
    isValid,
    validate,
    handleBlur,
  }
}
```

### 컴포넌트에서 사용

```vue
<script setup lang="ts">
import { usePermissions } from '@/composables/usePermissions'
import { useFormValidation } from '@/composables/useFormValidation'

const { canEdit, canDelete } = usePermissions()

const { values, errors, isValid, validate } = useFormValidation({
  name: '',
  email: '',
})
</script>

<template>
  <div>
    <div v-if="canEdit">
      <input
        v-model="values.name"
        @blur="validate('name', [required, minLength(3)])"
      />
      <span v-if="errors.name">{{ errors.name }}</span>
    </div>

    <button v-if="canDelete" :disabled="!isValid">
      삭제
    </button>
  </div>
</template>
```

---

## 실전 조합 예시

실제 프로젝트에서는 세 가지를 모두 조합해서 사용합니다.

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'              // Pinia
import { useUsers } from '@/api/users/users.queries'      // TanStack Query
import { usePermissions } from '@/composables/usePermissions'  // Composable

// 1. 클라이언트 상태 (Pinia Store)
const authStore = useAuthStore()

// 2. 서버 상태 (TanStack Query)
const { data: users, isPending } = useUsers()

// 3. 비즈니스 로직 (Composable)
const { canManageUsers } = usePermissions()
</script>

<template>
  <div>
    <!-- 현재 로그인 사용자 (Store) -->
    <header>
      <div>로그인: {{ authStore.user?.name }}</div>
      <div>테마: {{ authStore.theme }}</div>
    </header>

    <!-- 사용자 목록 (TanStack Query) -->
    <main>
      <div v-if="isPending">로딩 중...</div>
      <div v-else-if="canManageUsers">
        <ul>
          <li v-for="user in users" :key="user.id">
            {{ user.name }}
          </li>
        </ul>
      </div>
      <div v-else>
        권한이 없습니다
      </div>
    </main>
  </div>
</template>
```

---

## 안티패턴

### ❌ Store에서 서버 상태 관리

```typescript
// BAD - 이렇게 하지 마세요!
export const useUserStore = defineStore('users', {
  state: () => ({
    users: [],        // ❌ 서버 데이터를 Store에
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      try {
        this.users = await usersApi.getUsers()
      } catch (error) {
        this.error = error
      } finally {
        this.loading = false
      }
    },
  },
})
```

**문제점:**
- 캐싱 수동 구현 필요
- 중복 요청 방지 수동 구현 필요
- 오래된 데이터 문제
- staleTime, refetch 등 수동 관리

### ✅ TanStack Query로 서버 상태 관리

```typescript
// GOOD - 이렇게 하세요!
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getUsers(),
    // 캐싱, 중복 방지, 자동 재조회 모두 자동 처리
  })
}
```

---

## 마이그레이션 가이드

### 기존 패턴에서 새 패턴으로

**Before (Store에서 API 호출):**
```typescript
// ❌ 기존 방식
const userStore = useUserStore()
await userStore.fetchUsers()

// 로딩 상태
if (userStore.loading) { ... }

// 데이터
const users = userStore.users
```

**After (TanStack Query):**
```typescript
// ✅ 새로운 방식
const { data: users, isPending } = useUsers()

// 로딩 상태
if (isPending) { ... }

// 데이터
// users는 자동으로 반응형
```

### Store는 클라이언트 상태만

```typescript
// ✅ Store는 이런 용도로만 사용
const authStore = useAuthStore()

// 클라이언트 상태
const currentUser = authStore.user
const theme = authStore.theme
const language = authStore.language
```

---

## 핵심 원칙

### 서버 상태 vs 클라이언트 상태 구분

| 질문 | YES → | 예시 |
|------|-------|------|
| 서버에 저장되는 데이터인가? | **TanStack Query** | users, posts, products |
| 다른 사용자도 볼 수 있는 데이터인가? | **TanStack Query** | 게시글, 댓글 |
| 새로고침 시 서버에서 다시 받아와야 하나? | **TanStack Query** | API 데이터 |
| 현재 브라우저/앱에만 존재하는 데이터인가? | **Pinia Store** | 테마, 언어, UI 상태 |
| 서버 재시작해도 유지되는 데이터인가? | **Pinia Store** | 로컬 설정 |

### 빠른 판단법

```typescript
// 이 데이터가 어디에 속하나?

// 서버 상태 → TanStack Query
const { data: users } = useUsers()
const { data: posts } = usePosts()

// 클라이언트 상태 → Pinia Store
const authStore = useAuthStore()
const uiStore = useUIStore()

// 비즈니스 로직 → Composables
const { canEdit } = usePermissions()
const { isValid } = useFormValidation()
```

---

## 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/v5/docs/vue/overview)
- [Pinia 공식 문서](https://pinia.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [실전 가이드](https://lirantal.com/blog/supercharging-vuejs-3-app-tanstack-query-practical-refactoring-guide)
