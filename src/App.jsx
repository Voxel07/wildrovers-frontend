import { Routes, Navigate, Route } from "react-router-dom";

// MUI
import Box from '@mui/material/Box';

//pages
import Navbar from './components/Navigation/Navbar';
import Footer from './components/Navigation/Footer';
import { lazy, Suspense, useMemo, useState, useRef, useEffect } from "react";

const LandingPage = lazy(() => import('./Pages/LandingPage/LandingPage'));
const LogIn = lazy(() => import('./Pages/LogIn/LogIn'));
const SignUp = lazy(() => import('./Pages/SignUp/SignUp'));
const PasswordReset = lazy(() => import('./Pages/LogIn/PasswordReset'));
const Unauthorized = lazy(() => import('./Pages/Sonstige/Unauthorized'));
const Datenschutz = lazy(() => import('./Pages/Sonstige/Datenschutz'));
const PageNotFound = lazy(() => import('./Pages/PageNotFound/PageNotFound'));
const VerificationPrompt = lazy(() => import('./Pages/Sonstige/RegestrationSucessfull'));
const UserManagement = lazy(() => import('./Pages/Admin/UserManagement'));
const Profile = lazy(() => import('./Pages/Profile/Profile'));

//Forum
const Forum = lazy(() => import('./Pages/Forum/Forum'));
const Categories = lazy(() => import('./Pages/Forum/Forum-Categories'));
const Topics = lazy(() => import('./Pages/Forum/Forum-Topic'));
const Posts = lazy(() => import('./Pages/Forum/Forum-Post'));
const TextEditor = lazy(() => import('./Pages/Texteditor/Texteditor'));

//context
import { UserContext } from './context/UserContext';
import useAuth from './context/useAuth';

//Protected routes
import RequireAuth from './components/Router/RequireAuth';
const Rules = lazy(() => import('./Pages/Rules/Rules'));
const Gallery = lazy(() => import('./Pages/Gallery/Gallery'));
const Events = lazy(() => import('./Pages/Events/Events'));
const Team = lazy(() => import('./Pages/Team/Team'));

//user Feedback
import { AlertsManager, AlertsContext } from './components/utils/AlertsManager';

const AUTHENTICATED_ROLES = ["Besucher", "Frischling", "Mitglied", "Vorstand", "Admin"];

function App() {
  const { auth } = useAuth();
  const [user, setUser] = useState({ valid: false, name: "", role: "", jwt: "" });

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

  // Listen for global rate-limit events dispatched by api.js interceptor
  useEffect(() => {
    const handler = (e) => {
      if (alertsManagerRef.current) {
        const msg = e.detail?.message || 'Zu viele Anfragen. Bitte warte einen Moment.';
        alertsManagerRef.current.showAlert('warning', msg);
      }
    };
    window.addEventListener('api-ratelimited', handler);
    return () => window.removeEventListener('api-ratelimited', handler);
  }, []);

  return (
    <UserContext.Provider value={stateValue}>
      <AlertsContext.Provider value={alertsManagerRef}>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <AlertsManager ref={alertsManagerRef} />
            <Box component="main" sx={{ flex: '1 0 auto' }}>
              <Suspense fallback={null}>
              <Routes>
                {/*Public Routes */}
                {/* <Route path="/" element={<Member />} /> */}
                <Route path="/" element={<LandingPage />} />
                <Route path="Login" element={<LogIn />} />
                <Route path="password-reset" element={<PasswordReset />} />
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
                </Route>

                <Route element={<RequireAuth allowedRoles={AUTHENTICATED_ROLES} />}>
                  <Route path="Profil" element={<Profile />} />
                  <Route path="Forum/Texteditor" element={<TextEditor />} />
                </Route>

                {/*Admin Routes */}
                <Route element={<RequireAuth allowedRoles={["Frischling", "Mitglied", "Vorstand", "Admin"]} />}>
                  <Route path='Regeln' element={<Rules />} />
                </Route>
                <Route element={<RequireAuth allowedRoles={["Vorstand", "Admin"]} />}>
                  <Route path='/Admin/UserManagement' element={<UserManagement />} />
                </Route>
              </Routes>
              </Suspense>
            </Box>
            <Footer />
          </Box>
      </AlertsContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
