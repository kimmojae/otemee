/**
 * Electron API 타입 정의
 */

export interface ElectronAPI {
  // 플랫폼 정보
  platform: 'darwin' | 'win32' | 'linux'
  versions: {
    node: string
    chrome: string
    electron: string
  }

  // 환경 정보
  isElectron: boolean

  // 윈도우 조작
  doubleClick: () => void

  // 향후 추가할 API (예제)
  // selectFile: () => Promise<string | undefined>
  // saveSettings: (data: any) => Promise<void>
  // loadSettings: () => Promise<any>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
