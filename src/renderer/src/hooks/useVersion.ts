import { useEffect, useState } from 'react'

export const useVersion = () => {
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api.getVersion().then((res) => setVersion(res))
  }, [])

  return version
}
