import Forum from './Pages/Forum/Forum'
import SideBar from './components/Navigation/SideBar'
import { Routes, Route, BrowserRouter as Router } from "react-router-dom";
import Topics from './Pages/Forum/Forum-Topic';
import Navbar from './components/Navigation/Navbar';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="Forum" element={<Forum />} />
        <Route path="Forum/Topic" element={<Topics />} />
      </Routes>
    </Router>
  )
}

export default App;
