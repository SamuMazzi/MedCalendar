import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

const marginTop = 4
const _heightFooter = 50
export const heightFooter = _heightFooter + marginTop
export default function Footer() {
    return (
        <Paper sx={{
            //marginTop: 'calc(10% + 60px)',
            position: 'relative',
            height: _heightFooter + "px",
            bottom: 0,
            width: '100%',
            backgroundColor: '#1976D2',
            marginTop: marginTop,
        }} component="footer" square variant="outlined">
            <Box
                sx={{
                    flexGrow: 1,
                    justifyContent: "center",
                    display: "flex",
                    my: 1
                }}
            >
            </Box>

            <Box
                sx={{
                    flexGrow: 1,
                    justifyContent: "center",
                    display: "flex",
                }}
            >
                <Typography variant="caption" color="white">
                    Med Calendar
                </Typography>
            {
                /**
                 * 
                    <Typography variant="caption" color="white" sx={{ px: 1 }}>
                        -
                    </Typography>
                    <Typography variant="caption" color="white">
                        Privacy policy
                    </Typography>
                    <Typography variant="caption" color="white" sx={{ px: 1 }}>
                        -
                    </Typography>
                    <Typography variant="caption" color="white">
                        Cookie policy
                    </Typography>
                    */
            }
            </Box>
        </Paper>
    );
}