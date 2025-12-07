import type { UserRole } from '../common'

/**
 * 사용자 모델 (백엔드 엔티티와 1:1 대응)
 */
export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}
