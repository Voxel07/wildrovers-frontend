import { useNavigate } from "react-router-dom"
import Grid from '@material-ui/core/Grid';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
                    <h1>Unauthorized</h1>
                    <br />
                    <p>You do not have access to the requested page.</p>
                    <div className="flexGrow">
                        <button onClick={goBack}>Go Back</button>
                    </div>
            </Grid>
        </Grid>

    )
}

export default Unauthorized