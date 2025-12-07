import type { User } from '../models/user'

/**
 * 로그인 요청
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  user: User
  access_token: string
  refresh_token: string
}

/**
 * Protected 리소스 응답
 */
export interface ProtectedResponse {
  message: string
}
