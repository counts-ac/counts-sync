import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { NotificationProps } from '../types'

// Custom APIs for renderer
const api = {
  onNotification: ({ title, body }: NotificationProps): void =>
    ipcRenderer.send('notification', { title, body }),
  onStatus: (status: string): void => ipcRenderer.send('status', status),
  onTally: (url: URL): Promise<unknown> => ipcRenderer.invoke('tally', url),
  getVersion: () => ipcRenderer.invoke('version')
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
