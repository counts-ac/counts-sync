import styles from './header.module.css'

const Header = () => {
  return (
    <nav className={styles.navbar}>
      <h5>Counts</h5>
      <h2>Tally Company</h2>
      <h5>Support</h5>
    </nav>
  )
}

export default Header
