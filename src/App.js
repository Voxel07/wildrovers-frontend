// import SignUp from'./Pages/SignUp/SignUp';
//import Texteditor from './Pages/Texteditor/Texteditor'
import LoginForm from './Pages/LogIn/LogIn'
// import SigninForm from './Pages/SignUp/SignUp'
import Forum from './Pages/Forum/forum_landingpage'
import Grid from '@material-ui/core/Grid';


function App() {
  return (
    <Grid
      container
      spacing={0}
      direction="column"
      alignItems="center"
      justifyContent="center"
      style={{ minHeight: '100vh' }}
    >

      <Grid item xs={3}>
        <LoginForm />
      </Grid>

    </Grid>
  )
}

export default App;
