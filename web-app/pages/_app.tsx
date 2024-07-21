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
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { locale, addLocale, updateLocaleOption, updateLocaleOptions, localeOption, localeOptions } from 'primereact/api';

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

addLocale('it', {
  "accept": "Si",
  "addRule": "Aggiungi regola",
  "am": "AM",
  "apply": "Applica",
  "cancel": "Annulla",
  "choose": "Scegli",
  "chooseDate": "Seleziona Data",
  "chooseMonth": "Seleziona Mese",
  "chooseYear": "Seleziona Anno",
  "clear": "Cancella tutto",
  //"completed": "Completato",
  "contains": "Contiene",
  "custom": "Personalizzato",
  "dateAfter": "La data è successiva",
  "dateBefore": "La data è precedente",
  "dateFormat": "dd/mm/yy",
  "dateIs": "La data è",
  "dateIsNot": "La data non è",
  "dayNames": [
    "Domenica",
    "Lunedi",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato"
  ],
  "dayNamesMin": [
    "Do",
    "Lu",
    "Ma",
    "Me",
    "Gi",
    "Ve",
    "Sa"
  ],
  "dayNamesShort": [
    "Dom",
    "Lun",
    "Mar",
    "Mer",
    "Gio",
    "Ven",
    "Sab"
  ],
  "emptyFilterMessage": "Nessuna opzione disponibile",
  "emptyMessage": "Nessun risultato trovato",
  //"emptySearchMessage": "Nessun risultato trovato",
  //"emptySelectionMessage": "Nessun elemento selezionato",
  "endsWith": "Finisce con",
  "equals": "Equivale",
  "fileSizeTypes": [
    "B",
    "KB",
    "MB",
    "GB",
    "TB",
    "PB",
    "EB",
    "ZB",
    "YB"
  ],
  "filter": "Filtro",
  "firstDayOfWeek": 1,
  "gt": "Maggiore di",
  "gte": "Maggiore o uguale a",
  "lt": "Minore di",
  "lte": "Minore o uguale a",
  "matchAll": "Abbina tutto",
  "matchAny": "Abbina alcuni",
  "medium": "Medio",
  "monthNames": [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre"
  ],
  "monthNamesShort": [
    "Gen",
    "Feb",
    "Mar",
    "Apr",
    "Mag",
    "Giu",
    "Lug",
    "Ago",
    "Set",
    "Ott",
    "Nov",
    "Dic"
  ],
  "nextDecade": "Decade successiva",
  "nextHour": "Ora successiva",
  "nextMinute": "Minuto successivo",
  "nextMonth": "Mese successivo",
  "nextSecond": "Secondo successivo",
  "nextYear": "Anno successivo",
  "noFilter": "Senza Filtro",
  "notContains": "Non contiene",
  "notEquals": "Non uguale",
  "now": "Ora attuale",
  "passwordPrompt": "Inserisci la password",
  "pending": "In corso",
  "pm": "PM",
  "prevDecade": "Decade precedente",
  "prevHour": "Ora precedente",
  "prevMinute": "Minuto precedente",
  "prevMonth": "Mese precedente",
  "prevSecond": "Secondo precedente",
  "prevYear": "Anno precedente",
  "reject": "No",
  "removeRule": "Rimuovi regola",
  //"searchMessage": "{0} risultati disponibili",
  //"selectionMessage": "{0} elementi selezionati",
  //"showMonthAfterYear": false,
  "startsWith": "Inizia con",
  "strong": "Forte",
  "today": "Oggi",
  "upload": "Carica",
  "weak": "Debole",
  "weekHeader": "Sett",
  "aria": {
    "cancelEdit": "Annulla modifica",
    "close": "Chiudi",
    //"collapseLabel": "Riduci",
    "collapseRow": "Riduci riga",
    "editRow": "Modifica riga",
    //"expandLabel": "Espandi",
    "expandRow": "Espandi riga",
    "falseLabel": "Falso",
    "filterConstraint": "Costante di filtro",
    "filterOperator": "Operatore di filtro",
    "firstPageLabel": "Prima pagina",
    "gridView": "Griglia",
    "hideFilterMenu": "Nascondi Menu filtri",
    "jumpToPageDropdownLabel": "Vai alla Dropdown delle pagine",
    "jumpToPageInputLabel": "Vai all'Input delle pagine",
    "lastPageLabel": "Ultima pagina",
    "listView": "Lista",
    "moveAllToSource": "Muovi tutto alla sorgente",
    "moveAllToTarget": "Muovi tutto all'elemento",
    "moveBottom": "Vai in fondo",
    "moveDown": "Vai sotto",
    "moveTop": "Vai in cima",
    "moveToSource": "Vai alla sorgente",
    "moveToTarget": "Vai all'elemento",
    "moveUp": "Vai sopra",
    "navigation": "Naviga",
    "next": "Successivo",
    "nextPageLabel": "Pagina successiva",
    "nullLabel": "Non selezionato",
    "otpLabel": "Inserisci il carattere della password monouso {0}",
    "pageLabel": "Pagina {page}",
    //"passwordHide": "Nascondi password",
    //"passwordShow": "Mostra password",
    "previous": "Precedente",
    "previousPageLabel": "Pagina precedente",
    //"removeLabel": "Rimuovere",
    "rotateLeft": "Ruota a sinistra",
    "rotateRight": "Ruota a destra",
    "rowsPerPageLabel": "Elementi per pagina",
    "saveEdit": "Salva modifica",
    "scrollTop": "Torna sù",
    "selectAll": "Seleziona tutti gli elementi",
    //"selectLabel": "Seleziona",
    "selectRow": "Seleziona riga",
    "showFilterMenu": "Mostra Menu filtri",
    "slide": "Scorri",
    "slideNumber": "{slideNumber}",
    "star": "1 stella",
    "stars": "{star} stelle",
    "trueLabel": "Vero",
    "unselectAll": "Deseleziona tutti gli elementi",
    //"unselectLabel": "Deseleziona",
    "unselectRow": "Deseleziona riga",
    "zoomImage": "Zoom Immagine",
    "zoomIn": "Ingrandisci",
    "zoomOut": "Riduci"
  }
});

export default function App({ Component, pageProps }: AppProps) {
  
  return (
    <>
      <Head>
        <title>Med Calendar</title>
      </Head>
      <PrimeReactProvider>
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
      </PrimeReactProvider>
      <Analytics />
    </>
  )  
}
