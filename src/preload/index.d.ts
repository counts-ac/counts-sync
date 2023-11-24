import { ElectronAPI } from '@electron-toolkit/preload'

interface apiProps {
  onNotification: ({ title, body }: NotificationProps) => void
  onTally: (url: string) => Promise<unknown>
  getVersion: () => Promise<string>
  getCompanyDetails: () => Promise<unknown>
  onTallyStatus: (callback: unknown) => Electron.IpcRenderer
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: apiProps
  }
}
