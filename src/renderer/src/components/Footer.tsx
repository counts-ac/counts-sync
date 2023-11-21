import { useNetwork, useTallyStatus, useVersion } from '@renderer/hooks'
import styles from './footer.module.css';

const Footer = () => {
  const net = useNetwork()
  const tallyStatus = useTallyStatus()
  const version = useVersion()
  console.log("🚀 ~ file: Footer.tsx:8 ~ Footer ~ version:", version)
  return (
    <footer className={styles.footer}>
      <h5>{tallyStatus.status ? '🟢 Tally: CONNECTED' : '🔴 Tally: DISCONNECT'}</h5>
      <h5>V{version}</h5>
      <h5> 🛜 Internat: {net.online ? 'CONNECTED' : 'DISCONNECT'}</h5>
    </footer>
  )
}

export default Footer
