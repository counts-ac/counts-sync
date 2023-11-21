import { RouterProvider } from 'react-router-dom'
import './assets/index.css'
import { router } from './router'
import { Suspense } from 'react'

function App() {
  return (
    <Suspense fallback={<h1>Loading...</h1>}>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App
