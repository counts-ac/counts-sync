import { useQuery } from 'react-query'

const HomePage = () => {
  const { isLoading, data } = useQuery('repoData', () =>
    window.api.getCompanyDetails().then((res) => res)
  )

  if (isLoading) return 'Loading...'

  return <pre>{data ? JSON.stringify(data, null, 4) : 'Tally not connected'}</pre>
}

export default HomePage
