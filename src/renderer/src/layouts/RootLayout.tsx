import Footer from '@renderer/components/Footer'
import Header from '@renderer/components/Header'
import { Outlet } from 'react-router-dom'


const RootLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default RootLayout
