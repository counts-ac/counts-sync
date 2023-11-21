import { NotificationProps } from '../../../types'

export const useNotification = () => {
  const sendNotification = ({ title, body }: NotificationProps) => {
    window.api.onNotification({ title, body })
  }
  return sendNotification
}
