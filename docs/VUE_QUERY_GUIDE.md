# Vue Query (TanStack Query) 사용 가이드

> Vue3 프로젝트에서 Vue Query를 효과적으로 사용하기 위한 가이드

## 목차

1. [기본 개념](#기본-개념)
2. [전역 설정](#전역-설정)
3. [API별 설정 전략](#api별-설정-전략)
4. [파일 구조](#파일-구조)
5. [Queries 작성](#queries-작성)
6. [Mutations 작성](#mutations-작성)
7. [캐시 관리](#캐시-관리)
8. [실전 예시](#실전-예시)

---

## 기본 개념

### 주요 용어

- **Query**: 데이터 조회 (GET)
- **Mutation**: 데이터 변경 (POST, PUT, DELETE)
- **Cache**: 메모리에 저장된 데이터
- **Stale**: 낡은 상태 (재검증 필요)
- **Fresh**: 신선한 상태 (재검증 불필요)

### 캐시 상태 흐름

```
Fresh (신선) → Stale (낡음) → Inactive (비활성) → Garbage Collected (삭제)
    ↑____________재사용____________↑
```

---

## 전역 설정

### 현재 설정 (src/main.ts)

```typescript
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,      // 5분
        gcTime: 1000 * 60 * 10,        // 10분
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  },
})
```

### 옵션 설명

| 옵션 | 설명 | 기본값 | 권장값 |
|------|------|--------|--------|
| `staleTime` | 데이터가 신선한 상태로 유지되는 시간 | `0` | `0` (보수적) |
| `gcTime` | 사용하지 않는 캐시를 메모리에 보관하는 시간 | `5분` | `5분` |
| `refetchOnWindowFocus` | 탭 포커스시 자동 갱신 | `true` | `false` |
| `retry` | 요청 실패시 재시도 횟수 | `3` | `1` |

### 권장 전역 설정

```typescript
// 전역은 보수적으로 설정 (기본값만)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 0,                  // 항상 최신 유지
        gcTime: 1000 * 60 * 5,         // 5분
        refetchOnWindowFocus: false,   // 수동 제어
        retry: 1,                      // 빠른 에러 피드백
      },
    },
  },
})
```

---

## API별 설정 전략

### 데이터 유형별 설정 가이드

| 데이터 유형 | staleTime | refetchInterval | refetchOnFocus | 예시 |
|------------|-----------|-----------------|----------------|------|
| **정적 데이터** | `Infinity` | - | `false` | 국가 목록, 카테고리 |
| **내 데이터** | `5-10분` | - | `false` | 내 프로필, 설정 |
| **공용 데이터** | `1-2분` | - | `true` | 사용자 목록, 게시글 |
| **실시간 데이터** | `0` | `30초` | `true` | 알림, 채팅 |

---

## 파일 구조

```
src/api/
├── types.ts              # 공통 타입
├── client.ts             # Axios 인스턴스
└── users/
    ├── index.ts          # API 함수 (getUsers, updateUser 등)
    ├── types.ts          # User 관련 타입
    ├── queries.ts        # useQuery 훅들
    └── mutations.ts      # useMutation 훅들
```

---

## Queries 작성

### 기본 패턴

```typescript
// src/api/users/queries.ts
import { useQuery } from '@tanstack/vue-query'
import { getUsers, getUser, getMyProfile } from './index'
import type { User } from './types'

/**
 * 사용자 목록 조회 (공용 데이터)
 */
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    staleTime: 1000 * 60 * 2,    // 2분
    refetchOnWindowFocus: true,   // 탭 돌아올 때 갱신
  })
}

/**
 * 개별 사용자 조회
 */
export function useUser(userId: number) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUser(userId),
    staleTime: 1000 * 60 * 5,     // 5분
    enabled: !!userId,             // userId 있을 때만 실행
  })
}

/**
 * 내 프로필 조회 (내 데이터)
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 10,    // 10분
  })
}

/**
 * 국가 목록 조회 (정적 데이터)
 */
export function useCountries() {
  return useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: Infinity,          // 절대 안바뀜
    gcTime: Infinity,
  })
}

/**
 * 알림 조회 (실시간 데이터)
 */
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    staleTime: 0,                 // 항상 최신
    refetchInterval: 30000,       // 30초마다 폴링
  })
}
```

### 컴포넌트에서 사용

```vue
<script setup lang="ts">
import { useUsers, useUser } from '@/api/users/queries'

// 목록 조회
const { data: users, isLoading, error } = useUsers()

// 개별 조회
const userId = ref(1)
const { data: user } = useUser(userId.value)
</script>

<template>
  <div v-if="isLoading">로딩 중...</div>
  <div v-else-if="error">에러 발생: {{ error.message }}</div>
  <div v-else>
    <div v-for="user in users" :key="user.id">
      {{ user.name }}
    </div>
  </div>
</template>
```

---

## Mutations 작성

### 기본 패턴

```typescript
// src/api/users/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createUser, updateUser, deleteUser } from './index'
import type { CreateUserRequest, UpdateUserRequest } from './types'

/**
 * 사용자 생성
 */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      // 사용자 목록 캐시 무효화 (다음 조회시 새로 가져옴)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * 사용자 수정
 */
export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(userId, data),
    onSuccess: (data) => {
      // 1. 개별 사용자 캐시 업데이트
      queryClient.setQueryData(['user', userId], data)

      // 2. 사용자 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

/**
 * 사용자 삭제
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: number) => deleteUser(userId),
    onSuccess: (_, userId) => {
      // 1. 개별 캐시 삭제
      queryClient.removeQueries({ queryKey: ['user', userId] })

      // 2. 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
```

### Optimistic Update (낙관적 업데이트)

```typescript
/**
 * 사용자 수정 (낙관적 업데이트)
 * API 응답 기다리지 않고 즉시 UI 반영
 */
export function useUpdateUserOptimistic(userId: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => updateUser(userId, data),

    // Mutation 시작 전: 캐시 미리 업데이트
    onMutate: async (newData) => {
      // 진행 중인 쿼리 취소
      await queryClient.cancelQueries({ queryKey: ['user', userId] })

      // 이전 데이터 백업
      const previousUser = queryClient.getQueryData(['user', userId])

      // 낙관적 업데이트
      queryClient.setQueryData(['user', userId], (old: any) => ({
        ...old,
        data: { ...old.data, ...newData }
      }))

      return { previousUser }
    },

    // 에러 발생시: 롤백
    onError: (err, newData, context) => {
      queryClient.setQueryData(['user', userId], context?.previousUser)
    },

    // 성공/실패 관계없이: 최신 데이터로 재검증
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
  })
}
```

### 컴포넌트에서 사용

```vue
<script setup lang="ts">
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/api/users/mutations'

const { mutate: createUser, isPending: isCreating } = useCreateUser()
const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(1)
const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()

const handleCreate = () => {
  createUser(
    { name: 'John', email: 'john@example.com' },
    {
      onSuccess: () => {
        console.log('생성 성공')
      },
      onError: (error) => {
        console.error('생성 실패:', error)
      },
    }
  )
}

const handleUpdate = () => {
  updateUser({ name: 'Updated Name' })
}

const handleDelete = () => {
  deleteUser(1)
}
</script>

<template>
  <button @click="handleCreate" :disabled="isCreating">
    사용자 생성
  </button>
  <button @click="handleUpdate" :disabled="isUpdating">
    사용자 수정
  </button>
  <button @click="handleDelete" :disabled="isDeleting">
    사용자 삭제
  </button>
</template>
```

---

## 캐시 관리

### 캐시 무효화 (Invalidation)

```typescript
const queryClient = useQueryClient()

// 특정 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['users'] })

// 특정 접두사로 시작하는 모든 쿼리 무효화
queryClient.invalidateQueries({ queryKey: ['user'] }) // ['user', 1], ['user', 2] 등 모두

// 모든 쿼리 무효화
queryClient.invalidateQueries()
```

### 캐시 직접 수정

```typescript
// 캐시 데이터 읽기
const users = queryClient.getQueryData(['users'])

// 캐시 데이터 수정
queryClient.setQueryData(['users'], (old) => {
  return [...old, newUser]
})

// 캐시 데이터 삭제
queryClient.removeQueries({ queryKey: ['user', userId] })
```

### 캐시 초기화

```typescript
// 모든 쿼리 제거
queryClient.clear()

// 특정 쿼리 제거
queryClient.removeQueries({ queryKey: ['users'] })
```

---

## 실전 예시

### 예시 1: 사용자 관리 페이지

```vue
<!-- src/pages/users.vue -->
<script setup lang="ts">
import { useUsers } from '@/api/users/queries'
import { useCreateUser, useUpdateUser, useDeleteUser } from '@/api/users/mutations'

// 조회
const { data: users, isLoading } = useUsers()

// 생성
const { mutate: createUser } = useCreateUser()
const handleCreate = () => {
  createUser({
    name: 'New User',
    email: 'new@example.com',
  })
}

// 수정
const { mutate: updateUser } = useUpdateUser(1)
const handleUpdate = () => {
  updateUser({ name: 'Updated Name' })
}

// 삭제
const { mutate: deleteUser } = useDeleteUser()
const handleDelete = (userId: number) => {
  if (confirm('정말 삭제하시겠습니까?')) {
    deleteUser(userId)
  }
}
</script>

<template>
  <div>
    <button @click="handleCreate">사용자 추가</button>

    <div v-if="isLoading">로딩 중...</div>
    <div v-else>
      <div v-for="user in users?.data" :key="user.id">
        {{ user.name }}
        <button @click="handleUpdate">수정</button>
        <button @click="handleDelete(user.id)">삭제</button>
      </div>
    </div>
  </div>
</template>
```

### 예시 2: 페이지네이션

```typescript
// src/api/users/queries.ts
export function useUsersPaginated(page: Ref<number>) {
  return useQuery({
    queryKey: ['users', { page: page.value }],
    queryFn: () => getUsers({ page: page.value, limit: 10 }),
    staleTime: 1000 * 60 * 2,
    placeholderData: (previousData) => previousData, // 이전 데이터 유지
  })
}
```

```vue
<script setup lang="ts">
const page = ref(1)
const { data: users } = useUsersPaginated(page)

const nextPage = () => page.value++
const prevPage = () => page.value--
</script>
```

### 예시 3: 무한 스크롤

```typescript
// src/api/users/queries.ts
export function useUsersInfinite() {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: ({ pageParam = 1 }) => getUsers({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  })
}
```

```vue
<script setup lang="ts">
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useUsersInfinite()

const loadMore = () => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage()
  }
}
</script>
```

---

## 체크리스트

### Query 작성시

- [ ] `queryKey`는 고유하고 명확한가?
- [ ] `staleTime`이 데이터 특성에 맞게 설정되었는가?
- [ ] `enabled` 옵션으로 조건부 실행이 필요한가?
- [ ] 에러 처리가 적절한가?

### Mutation 작성시

- [ ] 성공시 관련 캐시를 무효화하는가?
- [ ] 낙관적 업데이트가 필요한가?
- [ ] 에러 발생시 롤백이 필요한가?
- [ ] 로딩 상태를 UI에 표시하는가?

### 성능 최적화

- [ ] 불필요한 재요청을 방지하는가? (staleTime)
- [ ] 사용하지 않는 캐시를 적절히 제거하는가? (gcTime)
- [ ] 동일한 데이터를 중복 요청하지 않는가?
- [ ] 페이지네이션/무한스크롤에서 이전 데이터를 유지하는가?

---

## 참고 자료

- [TanStack Query 공식 문서](https://tanstack.com/query/latest)
- [Vue Query 공식 문서](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [실전 예제 모음](https://tanstack.com/query/latest/docs/framework/vue/examples)

---

## 추가 팁

### 1. DevTools 사용

```typescript
// main.ts
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

app.component('VueQueryDevtools', VueQueryDevtools)
```

```vue
<!-- App.vue -->
<template>
  <RouterView />
  <VueQueryDevtools />
</template>
```

### 2. 전역 에러 처리

```typescript
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        onError: (error) => {
          console.error('Query Error:', error)
          // 토스트 메시지 표시 등
        },
      },
      mutations: {
        onError: (error) => {
          console.error('Mutation Error:', error)
          // 토스트 메시지 표시 등
        },
      },
    },
  },
})
```

### 3. 타입 안정성

```typescript
// 반환 타입 명시
export function useUsers() {
  return useQuery<ApiResponse<User[]>>({
    queryKey: ['users'],
    queryFn: getUsers,
  })
}
```
