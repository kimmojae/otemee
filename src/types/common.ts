/**
 * 공통 타입 정의
 */

/**
 * 사용자 역할
 */
export type UserRole = 'admin' | 'user'

/**
 * 액션 결과 타입 (Store, Composable 등에서 사용)
 */
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * API 응답 래퍼
 */
export interface ApiResponse<T> {
  data: T
  message: string
  status: number
}

/**
 * API 에러
 */
export interface ApiError {
  message: string
  status: number
  code?: string
  details?: unknown
}

/**
 * 페이지네이션 응답
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 페이지네이션 파라미터
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}
