import Sidebar, { useSidebar } from './components/Navigation/Sidebar'
import { Routes, Navigate, Route, BrowserRouter as Router } from "react-router-dom";

// MUI
import Box from '@mui/material/Box';

//pages
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Navigation/Footer';
import LandingPage from './Pages/LandingPage/LandingPage';
import LogIn from './Pages/LogIn/LogIn';
import SignUp from './Pages/SignUp/SignUp';
import Unauthorized from './Pages/Sonstige/Unauthorized';
import Datenschutz from './Pages/Sonstige/Datenschutz';
import PageNotFound from './Pages/PageNotFound/PageNotFound';
import VerificationPrompt from './Pages/Sonstige/RegestrationSucessfull';
import UserManagement from './Pages/Admin/UserManagement';
import Profile from './Pages/Profile/Profile';

//Forum
import Forum from './Pages/Forum/Forum'
import Categories from './Pages/Forum/Forum-Categories';
import Topics from './Pages/Forum/Forum-Topic';
import Posts from './Pages/Forum/Forum-Post'
import TextEditor from './Pages/Texteditor/Texteditor';

//context
import { useMemo, useState, useRef, useEffect } from "react";
import { UserContext } from './context/UserContext';
import useAuth from './context/useAuth';

//Protected routes
import RequireAuth from './components/Router/RequireAuth';
import Rules from './Pages/Rules/Rules';
import Gallery from './Pages/Gallery/Gallery';
import Events from './Pages/Events/Events';
import Team from './Pages/Team/Team';

//user Feedback
import { AlertsManager, AlertsContext } from './components/utils/AlertsManager';

//temp Stuff
import Member from './Pages/StaticContent/Member';

function App() {
  const { auth } = useAuth();
  const [user, setUser] = useState({ valid: false, name: "", role: "", jwt: "" });
  const { mode, toggleMode, restoreSidebar } = useSidebar();

  useEffect(() => {
    if (auth && auth.JWT) {
      setUser({
        valid: true,
        name: auth.user,
        role: auth.roles,
        jwt: auth.JWT
      });
    } else {
      setUser({
        valid: false,
        name: "",
        role: "",
        jwt: ""
      });
    }
  }, [auth]);

  const stateValue = useMemo(() => ({ user, setUser }), [user, setUser]);
  const alertsManagerRef = useRef();

  return (
    <UserContext.Provider value={stateValue}>
      <AlertsContext.Provider value={alertsManagerRef}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Collapsible Sidebar */}
          <Sidebar mode={mode} onToggleMode={toggleMode} />

          {/* Main content area */}
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100vh' }}>
            <Navbar sidebarHidden={mode === 'hidden'} onRestoreSidebar={restoreSidebar} />
            <AlertsManager ref={alertsManagerRef} />
            <Box component="main" sx={{ flex: '1 0 auto' }}>
              <Routes>
          {/*Public Routes */}
          {/* <Route path="/" element={<Member />} /> */}
          <Route path="/" element={<LandingPage />} />
          <Route path="Login" element={<LogIn />} />
          <Route path="Profil" element={<Profile />} />
          <Route path="Regestrieren" element={<SignUp />} />
          <Route path="Regestrieren/Erfolgreich" element={<VerificationPrompt />} />
          <Route path="unauthorized" element={<Unauthorized />} />
          <Route path="Datenschutz" element={<Datenschutz />} />
          <Route path="404" element={<PageNotFound />} />
          <Route path="galery" element={<Gallery />} />
          <Route path="events" element={<Events />} />
          <Route path="team" element={<Team />} />

          <Route path="*" element={<Navigate to="/404" replace />} /> {/*Redirect any invalide url to home */}

          {/*Member Routes */}
          {/* <Route element={<RequireAuth allowedRoles={[ROLES.Admin, ROLES.User]} />}> */}
          <Route path="Forum">
            <Route index element={<Forum />} />
            <Route path="Category/:id/*" element={<Categories />} />
            <Route path="Topic/:id/*" element={<Topics />} />
            <Route path="Post/:id/*" element={<Posts />} />
            <Route path="Texteditor" element={<TextEditor />} />
          </Route>
          {/* </Route> */}

          {/*Admin Routes */}
          {/* <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}> */}
          <Route path='Regeln' element={<Rules />} />
          <Route path='/Admin/UserManagement' element={<UserManagement />} />

          {/* </Route> */}
        </Routes>
            </Box>
            <Footer />
          </Box>
        </Box>
      </AlertsContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
