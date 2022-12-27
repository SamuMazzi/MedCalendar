import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { store }  from '../logic/redux/store'
import { Provider } from 'react-redux'
import { RouteGuard } from '../logic/RouteGuard'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';
import "@fontsource/public-sans"
import "@fontsource/public-sans/900.css";
import "@fontsource/public-sans/700.css";

//-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
//Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans - serif;

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Public Sans'
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '20px',
          boxShadow: 'none',
          mx: 1
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          ":root": { //! Non funziona
            /* "& .MuiSelect-outlined": {
                      padding: "0px"
                    }, */
            backgroundColor: '#EFEFEF',
            borderRadius: '20px',
            boxShadow: 'none',
            '.MuiOutlinedInput-notchedOutline': { border: 0 },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(228, 219, 233, 0.25)',
            },
          },
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          backgroundColor: '#EFEFEF',
          borderRadius: '20px',
          boxShadow: 'none',
          '.MuiOutlinedInput-notchedOutline': { border: 0 },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(228, 219, 233, 0.25)',
          },
        }
      }
    }
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <RouteGuard>
            <Component {...pageProps} />
          </RouteGuard>
        </Provider>
      </ThemeProvider>
      <Analytics />
    </>
  )  
}
