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
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/300.css";
import Head from 'next/head'
import Footer from '../components/general/footer'
import AppSnackbar from '../components/snackbar/app_snackbar'
import { MedAppBar } from '../components/general/app_bar'

//-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
//Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans - serif;

//TODO: Probabilmente da cambiare struttura: collezione doctors, per ogni distretto elenco di ID e nome dei medici, poi una volta selezionato si accede ai dati
//TODO: Ridimensiona immagini, sono troppo inutilmente grandi
/**
 * TODO:
 * Integrazioni: https://vercel.com/integrations
 * Bundlejs size: https://bundlejs.com/?q=%40okikio%2Fanimate
 * Minify images: https://webpack.js.org/plugins/image-minimizer-webpack-plugin/#optimize-with-imagemin
 * https://www.npmjs.com/package/compression-webpack-plugin
 * Optimize react app: https://medium.com/front-end-weekly/optimizing-loading-time-for-big-react-apps-cf13bbf63c57
 * 
 */

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
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          backgroundColor: 'Background'
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
      <Head>
        <title>Med Calendar</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <RouteGuard>
            <MedAppBar />
            <Component {...pageProps} />
            <Footer/>
            <AppSnackbar />
          </RouteGuard>
        </Provider>
      </ThemeProvider>
      <Analytics />
    </>
  )  
}
