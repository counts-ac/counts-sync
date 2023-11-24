import { useCallback, useEffect, useState } from 'react'

export const useTallyStatus = () => {
  const [status, setStatus] = useState(false)

  const refetch = useCallback(() => {
    try {
      window.api.onTallyStatus((_event, data: string | null) => {
        if (data) {
          setStatus(true)
        } else {
          setStatus(false)
        }
      })
    } catch (error) {
      console.error(error)
      setStatus(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { status, refetch }
}
