import { useCallback, useEffect, useState } from 'react'

export const useTallyStatus = (timer = 20000) => {
  const [status, setStatus] = useState(false)

  const refetch = useCallback(async () => {
    try {
      const data = await window.api.onTally('http://localhost:9000')
      if (data?.['RESPONSE']) {
        setStatus(true)
      } else {
        setStatus(false)
      }
    } catch (error) {
      console.error(error)
      setStatus(false)
    }
  }, [])

  useEffect(() => {
    refetch()
    const clear = setInterval(refetch, timer)

    return () => clearInterval(clear)
  }, [refetch, timer])

  return { status, refetch }
}
