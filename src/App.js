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
import Unauthorized from './Pages/Sonstige/Unauthorized';
import PageNotFound from './Pages/PageNotFound/PageNotFound';
import VerificationPrompt from './Pages/Sonstige/RegestrationSucessfull';
import UserManagement from './Pages/Admin/UserManagement';
import TextEditor from './Pages/Texteditor/Texteditor';
//context
import { useMemo, useState } from "react";
import { UserContext } from './context/UserContext';

//Protected routes
import RequireAuth from './components/Router/RequireAuth';
import Rules from './Pages/Rules/Rules';

const ROLES = {
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

function App() {
  const [user, setUser] = useState({valid:false,name:"",role:"",jwt:""});
  const stateValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  return (
      <UserContext.Provider value={stateValue}>
        <Navbar/>
      <Routes history={history}>
        {/*Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="Login" element={<LogIn />} />
        <Route path="Regestrieren" element={<SignUp />} />
        <Route path="Regestrieren/Erfolgreich" element={<VerificationPrompt />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="404" element={<PageNotFound />} />

        <Route path="*" element={<Navigate to="/404" replace />} /> {/*Redirect any invalide url to home */}

        {/*Member Routes */}
        {/* <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />}> */}
          <Route path="Forum" element={<Forum />} />
          <Route path="Forum/Topic" element={<Topics />} />
          <Route path="Forum/Texteditor" element={<TextEditor />} />
        {/* </Route> */}

        {/*Admin Routes */}
        {/* <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}> */}
        <Route path='Regeln' element={<Rules />} />
        <Route path='/Admin/UserManagement' element={<UserManagement />} />

        {/* </Route> */}
      </Routes>
      </UserContext.Provider>
  );
}

export default App;
