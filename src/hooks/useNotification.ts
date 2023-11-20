
import { NotificationProps } from 'types'

export const useNotification = () => {
    const sendNotification = ({ title, body }: NotificationProps) => {
        window.ipcRenderer.send("notification", { title, body });
    }
    return sendNotification;
}
