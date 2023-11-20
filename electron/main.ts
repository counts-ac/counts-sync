import { app, BrowserWindow, Menu, Tray, Notification } from 'electron'
import path from 'node:path'
import { NotificationProps } from '../types'

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

const APP_NAME = 'Counts Sync';
const APP_ICON = path.join(process.env.VITE_PUBLIC, 'icon-counts.png');
const APP_ICON_ONLINE = path.join(process.env.VITE_PUBLIC, 'icon-counts-online.png')
const APP_ICON_ERROR = path.join(process.env.VITE_PUBLIC, 'icon-counts-error.png')
const APP_ICON_WARNING = path.join(process.env.VITE_PUBLIC, 'icon-counts-warning.png')


let WIN: BrowserWindow;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
let tray: Tray;
let QUIT = true;

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

  // Test active push message to Renderer-process.
  WIN.webContents.on('did-finish-load', () => {
    WIN?.webContents.send('main-process-message', (new Date).toLocaleString())
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
}

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
})

app.whenReady().then(() => {
  createWindow();
  createTray();
})
