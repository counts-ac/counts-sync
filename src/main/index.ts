import {
  app,
  shell,
  BrowserWindow,
  Tray,
  Menu,
  Notification,
  net,
  ipcMain,
  dialog,
  MessageBoxOptions
} from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import icon_online from '../../resources/icon-counts-online.png?asset'
import icon_warning from '../../resources/icon-counts-warning.png?asset'
import icon_error from '../../resources/icon-counts-error.png?asset'
import { parseXml } from './utils'
import { NotificationProps } from '../types'
import { autoUpdater } from 'electron-updater'

const APP_NAME = 'Counts Sync'

let mainWindow: BrowserWindow
let tray: Tray
let QUIT = true
let progressInterval: NodeJS.Timeout
const TALLY_URL = 'http://localhost:9000'

async function tallyStatus(url = TALLY_URL): Promise<unknown> {
  try {
    const response = await net.fetch(url)
    if (response.status === 200) {
      const xmlData = await response.text()
      const data = await parseXml(xmlData)
      tray.setImage(icon_online)
      return data
    }
    return false
  } catch (error) {
    tray.setImage(icon_error)
    return error
  }
}

function progressBar(data = 0): void {
  const INCREMENT = 0.03
  const INTERVAL_DELAY = 100 // ms

  let c = data
  progressInterval = setInterval(() => {
    mainWindow.setProgressBar(c)

    if (c < 1) {
      c += INCREMENT
    } else {
      mainWindow.setProgressBar(0)
      clearInterval(progressInterval)
    }
  }, INTERVAL_DELAY)
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
    progressBar()
    tallyStatus()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
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

app.on('before-quit', () => {
  clearInterval(progressInterval)
})

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

autoUpdater.on('update-downloaded', () => {
  const messageBoxOptions: MessageBoxOptions = {
    icon: icon,
    type: 'info',
    title: 'Update downloaded',
    message: 'A new version has been downloaded. Do you want to install it now?',
    buttons: ['Yes', 'Later']
  }

  dialog.showMessageBox(messageBoxOptions).then((response) => {
    if (response.response === 0) {
      // If 'Yes' is clicked
      autoUpdater.quitAndInstall()
    }
  })
})

autoUpdater.on('error', (error) => {
  dialog.showErrorBox('Error: ', error == null ? "unknown" : (error.stack || error).toString());
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

ipcMain.handle('tally', async (_event, data) => {
  const response = await tallyStatus(data)
  return response
})

ipcMain.handle('version', () => app.getVersion())

ipcMain.on('status', (_event, data: 'ONLINE' | 'WARNING' | 'ERROR') => {
  switch (data) {
    case 'ONLINE':
      tray.setImage(icon_online)
      break
    case 'WARNING':
      tray.setImage(icon_warning)
      break
    default:
      tray.setImage(icon_error)
  }
})

ipcMain.on('notification', (_event, data) => {
  showNotification(data)
})

ipcMain.on('progress', (_event, data = 0) => {
  mainWindow.setProgressBar(data)
})
