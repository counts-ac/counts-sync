import { useNetwork, useTallyStatus, useVersion } from '@renderer/hooks'
import styles from './footer.module.css'

const Footer = () => {
  const net = useNetwork()
  const tallyStatus = useTallyStatus()
  const version = useVersion()

  return (
    <footer className={styles.footer}>
      <h5>{tallyStatus.status ? '🟢 Tally: CONNECTED' : '🔴 Tally: DISCONNECT'}</h5>
      <h5>V{version}</h5>
      <h5> 🛜 Internet: {net.online ? 'CONNECTED' : 'DISCONNECT'}</h5>
    </footer>
  )
}

export default Footer
