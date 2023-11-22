import { companyDetails } from '@renderer/services/ipc'
import { useEffect, useState } from 'react'

const HomePage = () => {
  const [company, setCompany] = useState('')
  useEffect(() => {
    console.log('HomePage')
    companyDetails().then((res) => {
      setCompany(res as string)
    })
  }, [])

  return <code>{JSON.stringify(company, null, 4)}</code>
}

export default HomePage
