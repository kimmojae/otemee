import type { UserRole } from '../common'

/**
 * 사용자 생성 요청
 */
export interface CreateUserRequest {
  name: string
  email: string
  role?: UserRole
}

/**
 * 사용자 수정 요청
 */
export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: UserRole
}
