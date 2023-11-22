import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { NotificationProps } from '../types'

// Custom APIs for renderer
const api = {
  onNotification: ({ title, body }: NotificationProps) =>
    ipcRenderer.send('notification', { title, body }),
  onStatus: (status: string) => ipcRenderer.send('status', status),
  onTally: (url: string) => ipcRenderer.invoke('tally', url),
  getVersion: () => ipcRenderer.invoke('version'),
  getCompanyDetails: (url: string) => ipcRenderer.invoke('companyDetails', url)
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
