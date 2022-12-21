import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { store }  from '../logic/redux/store'
import { Provider } from 'react-redux'
import { RouteGuard } from '../logic/RouteGuard'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/react';

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Public+Sans',
    },
  },
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
