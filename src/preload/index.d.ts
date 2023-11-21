import { ElectronAPI } from '@electron-toolkit/preload'

interface apiProps {
  onNotification: ({ title, body }: NotificationProps) => void
  onStatus: (status: string) => void
  onTally: (url: string) => Promise<unknown>
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: apiProps
  }
}
