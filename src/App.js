import Forum from './Pages/Forum/Forum'
import SideBar from './components/Navigation/SideBar'
import { Routes, Navigate, Route, BrowserRouter as Router } from "react-router-dom";

//history
import { history } from './helper/history';

//pages
import Topics from './Pages/Forum/Forum-Topic';
import Navbar from './components/Navigation/Navbar';
import LandingPage from './Pages/LandingPage/LandingPage';
import LogIn from './Pages/LogIn/LogIn';
import SignUp from './Pages/SignUp/SignUp';

//context
import { useMemo, useState } from "react";
import { UserContext } from './context/UserContext';

function App() {
  const [user, setUser] = useState({valid:false,name:"",role:"",jwt:""});
  const stateValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  return (
    <Router>
      <UserContext.Provider value={stateValue}>
        <Navbar/>
      <Routes history={history}>
        <Route path="/" element={<LandingPage />} />
        <Route path="Login" element={<LogIn />} />
        <Route path="SignUp" element={<SignUp />} />
        <Route path="Forum" element={<Forum />} />
        <Route path="Forum/Topic" element={<Topics />} />
        <Route
        path="*"
        element={<Navigate to="/" replace />}
    />
      </Routes>
      </UserContext.Provider>

    </Router>
  );
}

export default App;
