import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Browse from './pages/Browse'
import ManhwaDetail from './pages/ManhwaDetail'
import Reader from './pages/Reader'
import Search from './pages/Search'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/manhwa/:slug" element={<ManhwaDetail />} />
          <Route path="/read/:slug/:chapter" element={<Reader />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
