// eslint-disable-next-line @typescript-eslint/no-require-imports
const { contextBridge, ipcRenderer } = require('electron')

/**
 * Electron API를 Vue 앱에 안전하게 노출
 * Vue에서 window.electronAPI로 접근 가능
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // 플랫폼 정보
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },

  // 환경 정보
  isElectron: true,

  // 윈도우 조작
  doubleClick: () => ipcRenderer.send('double-click'),

  // 향후 추가할 API (예제)
  // selectFile: () => ipcRenderer.invoke('select-file'),
  // saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
  // loadSettings: () => ipcRenderer.invoke('load-settings'),
})

/**
 * Vue에서 사용 예시:
 *
 * // App.vue 또는 composable
 * const isElectron = window.electronAPI?.isElectron
 *
 * if (isElectron) {
 *   console.log('Running in Electron')
 *   console.log('Platform:', window.electronAPI.platform)
 *   console.log('Versions:', window.electronAPI.versions)
 * }
 */
