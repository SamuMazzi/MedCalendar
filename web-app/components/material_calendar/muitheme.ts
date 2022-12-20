//Material theme
import { createTheme } from "@mui/material/styles";
import { teal, orange, red } from "@mui/material/colors";

export const darkTheme = createTheme({
  typography: {
    //useNextVariants: true
  },
  palette: {
    primary: { main: teal["A100"] },
    secondary: { main: orange["A100"], light: orange[500] },
    //caution: { main: red[500] },
    //type: "dark"
  }
});

export const lightTheme = createTheme({
  typography: {
    //useNextVariants: true
  },
  palette: {
    primary: { main: teal["A100"] },
    secondary: { main: orange["A100"], light: orange[500] },
    //caution: { main: red[500] },
    //type: "light"
  }
});

//export default theme;
