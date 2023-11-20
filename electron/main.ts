import { app, BrowserWindow, Menu, Tray, Notification, ipcMain, net } from 'electron'
import path from 'node:path'
import { NotificationProps } from '../types'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const APP_NAME = 'Counts Sync';
const APP_ICON = path.join(process.env.VITE_PUBLIC, 'icon-counts.png');
const APP_ICON_ONLINE = path.join(process.env.VITE_PUBLIC, 'icon-counts-online.png')
const APP_ICON_ERROR = path.join(process.env.VITE_PUBLIC, 'icon-counts-error.png')
const APP_ICON_WARNING = path.join(process.env.VITE_PUBLIC, 'icon-counts-warning.png')
const TALLY_URL = 'http://localhost:9000';

let WIN: BrowserWindow;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
let tray: Tray;
let QUIT = true;
let progressInterval: NodeJS.Timeout;

ipcMain.on('tallyStatus', (_event, data) => {
  tallyStatus(data);
})

ipcMain.on('status', (_event, data: 'ONLINE' | 'WARNING' | 'ERROR') => {
  switch (data) {
    case 'ONLINE':
      tray.setImage(APP_ICON_ONLINE);
      break;
    case 'WARNING':
      tray.setImage(APP_ICON_WARNING);
      break;
    default:
      tray.setImage(APP_ICON_ERROR)
  }
});

ipcMain.on('notification', (_event, data) => {
  showNotification(data)
})

ipcMain.on('progress', (_event, data = 0) => {
  WIN.setProgressBar(data)
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

app.on('before-quit', () => {
  clearInterval(progressInterval)
})

app.setLoginItemSettings({
  name: APP_NAME,
  openAtLogin: true,
})

app.whenReady().then(() => {
  createWindow();
  createTray();
})

async function tallyStatus(url=TALLY_URL, retry = 3) {
  if (retry > 0) {
    try {
      const response = await net.fetch(url)
      if (response.ok) {
        tray.setImage(APP_ICON_ONLINE)
      }
      return response.ok
    } catch (error) {
      tray.setImage(APP_ICON_WARNING)
      tallyStatus(url, retry - 1)
      return false
    }
  }
  return false
}


function progressBar(data = 0) {
  const INCREMENT = 0.03
  const INTERVAL_DELAY = 100 // ms

  let c = data
  progressInterval = setInterval(() => {
    WIN.setProgressBar(c)

    if (c < 1) {
      c += INCREMENT
    } else {
      WIN.setProgressBar(0)
      clearInterval(progressInterval)
    }
  }, INTERVAL_DELAY)
}

function showNotification({ title, body }: NotificationProps) {

  const notification = new Notification({ title, body, icon: APP_ICON, });
  notification.show();
  notification.on('click', () => {
    // console.log(CLICK_MESSAGE)
  })

}

function createTray() {
  tray = new Tray(APP_ICON);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open', click: () => {
        if (!WIN) {
          createWindow();
        }
        WIN?.show();
        WIN?.setAlwaysOnTop(true);
      },
    },
    { type: 'separator' },
    {
      label: 'Quit', click: () => {
        QUIT = false;
        app.quit()
      }
    }
  ]);

  tray.setToolTip(APP_NAME);
  tray.setTitle(APP_NAME)
  tray.setContextMenu(contextMenu);


  tray.on('click', () => {
    if (!WIN) {
      createWindow();
    }
    WIN?.show();
    WIN?.setAlwaysOnTop(true);
  });

}


function createWindow() {
  WIN = new BrowserWindow({
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    autoHideMenuBar: true
  })

  WIN.webContents.on('did-start-loading', () => {
    progressBar();
  })

  // Test active push message to Renderer-process.
  WIN.webContents.on('did-finish-load', async() => {
    const tallyResponse = await tallyStatus();
    WIN?.webContents.send('tallyResponse', tallyResponse)
  })

  if (VITE_DEV_SERVER_URL) {
    WIN.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // WIN.loadFile('dist/index.html')
    WIN.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  WIN.on('close', (event) => {
    if (QUIT) {
      event.preventDefault();
      showNotification({ title: "Counts Sync", body: "App running in background" })
    }
    WIN?.hide();
  });

  WIN.once('focus', () => WIN.flashFrame(false))
  WIN.flashFrame(true)

  WIN.webContents.openDevTools()
}