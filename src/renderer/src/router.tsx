import { lazy } from 'react'

import { createHashRouter } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

const HomePage = lazy(() => import('./pages/HomePage'))

export const router = createHashRouter([
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
