import './App.css'
import { useNetwork } from './hooks/useNetwork';

function App() {
  const  net = useNetwork()

  return (
    <>
      <code>{ JSON.stringify(net, null, 4)}</code>
    </>
  )
}

export default App
