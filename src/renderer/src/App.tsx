import { RouterProvider } from 'react-router-dom'
import './assets/index.css'
import { router } from './router'
import { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<h1>Loading...</h1>}>
        <RouterProvider router={router} />
      </Suspense>
    </QueryClientProvider>
  )
}

export default App
