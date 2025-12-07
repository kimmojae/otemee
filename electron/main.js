import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow = null

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

/**
 * 메인 윈도우 생성
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#ffffff',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: true,
    },
  })

  // 개발/프로덕션 모드 분기
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // Vite dev server
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // 프로덕션 빌드
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // 준비되면 보이기 (깜빡임 방지)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 윈도우 닫힘
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * IPC 핸들러: 더블클릭으로 최대화/복원
 */
ipcMain.on('double-click', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

/**
 * 앱 준비 완료
 */
app.whenReady().then(() => {
  createWindow()

  // macOS: Dock 아이콘 클릭 시 윈도우 재생성
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * 모든 윈도우 닫힘
 * macOS: 앱은 계속 실행 (Cmd+Q로 종료)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
