import { app, shell, BrowserWindow, Tray, Menu, Notification, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

import icon from '../../resources/icon.png?asset'
import icon_online from '../../resources/icon-counts-online.png?asset'

import { debounce, fileWatcher, tallyRequest } from './utils'
import { NotificationProps } from '../types'
import { ProgressInfo, autoUpdater } from 'electron-updater'
import Store from 'electron-store'

import { TALLY_URL, APP_NAME } from '../constants'
import { companyDetails } from './xml-request'
import { Company } from './types'

let mainWindow: BrowserWindow
let tray: Tray
let QUIT = true

autoUpdater.autoInstallOnAppQuit = true

const store = new Store()
const TALLY_BASE_URL = (store.get('tallyBaseUrl') as string) || TALLY_URL

const syncToServer = debounce(async () => {
  tray.setImage(icon_online)
  showNotification({ title: 'Counts Sync', body: 'Sync data to server' })
  setTimeout(() => {
    tray.setImage(icon)
  }, 5000)
  mainWindow.webContents.send('tallyStatus', await tallyStatus())
}, 2000)

function companyDataWatcher() {
  const company = store.get('company') as Company[]
  if (company) {
    company?.forEach((company: Company) => {
      fileWatcher(company.DESTINATION, () => {
        syncToServer()
      })
    })
  }
}

function mainOnRender() {
  companyDataWatcher()
}

async function tallyStatus(): Promise<unknown> {
  const response = await tallyRequest({
    url: TALLY_BASE_URL,
    method: 'GET'
  })

  if (response.error) {
    return null
  }

  return response.data?.['RESPONSE']
}

function showNotification({ title, body }: NotificationProps): void {
  const notification = new Notification({ title, body, icon: icon })
  notification.show()
  notification.on('click', () => {
    if (!mainWindow) {
      createWindow()
    }
    mainWindow?.show()
  })
}

function createTray(): void {
  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: (): void => {
        if (!mainWindow) {
          createWindow()
        }
        mainWindow?.show()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: (): void => {
        QUIT = false
        app.quit()
      }
    }
  ])

  tray.setToolTip(APP_NAME)
  tray.setTitle(APP_NAME)
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    if (!mainWindow) {
      createWindow()
    }
    mainWindow?.show()
  })
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    icon: icon,
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('did-start-loading', () => {
    tallyStatus()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('did-finish-load', async () => {
    await mainOnRender()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (QUIT) {
      event.preventDefault()
      showNotification({ title: 'Counts Sync', body: 'App running in background' })
    }
    mainWindow?.hide()
  })
}

/* The `app.setLoginItemSettings()` method is used to configure the behavior of the application when
the user logs in to their computer. */
app.setLoginItemSettings({
  name: APP_NAME,
  openAtLogin: true
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.counts-sync.app')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  createTray()
  autoUpdater.checkForUpdates()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

autoUpdater.on('download-progress', (progressObj: ProgressInfo) => {
  mainWindow.setProgressBar(progressObj.percent / 100)
})

autoUpdater.on('update-downloaded', () => {
  mainWindow.setProgressBar(-1)
})

autoUpdater.on('error', (error) => {
  dialog.showErrorBox(
    'Update Error: ',
    error == null ? 'unknown' : (error.stack || error).toString()
  )
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('tally', async (_event, data) => {
  store.set('tallyBaseUrl', data)
  return await tallyStatus()
})

ipcMain.handle('version', () => app.getVersion())

ipcMain.on('notification', (_event, data) => {
  showNotification(data)
})

ipcMain.on('progress', (_event, data = 0) => {
  mainWindow.setProgressBar(data / 100)
})

ipcMain.handle('companyDetails', async () => {
  const company = await companyDetails(TALLY_BASE_URL)
  if (company) {
    store.set('company', company)
    return company
  }
  return null
})
