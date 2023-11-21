import { lazy } from 'react'

import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

const HomePage = lazy(() => import('./pages/HomePage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '/',
        index: true,
        element: <HomePage />
      }
    ]
  }
])
