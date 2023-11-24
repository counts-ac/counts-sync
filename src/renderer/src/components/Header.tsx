import styles from './header.module.css'
import logo from '../assets/icon-light.svg'

const Header = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <img src={logo} alt="logo" className={styles.logo} />
        <h5 className={styles.logoText}>Counts</h5>
      </div>
      <h2>Tally Companies</h2>
      <h5>🎧 Support </h5>
    </nav>
  )
}

export default Header
