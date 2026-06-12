import { useNavigate } from "react-router-dom"
import Box from '@mui/material/Box';

const Unauthorized = () => {
    const navigate = useNavigate();

    const goBack = () => navigate(-1);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Box>
                    <h1>Unauthorized</h1>
                    <br />
                    <p>You do not have access to the requested page.</p>
                    <div className="flexGrow">
                        <button onClick={goBack}>Go Back</button>
                    </div>
            </Box>
        </Box>

    )
}

export default Unauthorized