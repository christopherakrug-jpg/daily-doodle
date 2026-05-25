import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Confirmation from './pages/Confirmation'
import Gallery from './pages/Gallery'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/done" element={<Confirmation />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  )
}
