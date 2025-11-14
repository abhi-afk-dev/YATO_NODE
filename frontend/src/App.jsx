import './App.css'
import Interface from './pages/interface'
import { Routes,Route } from 'react-router-dom'
function App() {

  return (
    <Routes>
      <Route path="/" element={<Interface/>}/>
    </Routes>
  )
}

export default App
