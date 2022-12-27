export type MesiType = Record<number, string>
export const mesi: MesiType = {
    1: 'Gennaio',
    2: 'Febbraio',
    3: 'Marzo',
    4: 'Aprile',
    5: 'Maggio',
    6: 'Giugno',
    7: 'Luglio',
    8: 'Agosto',
    9: 'Settembre',
    10: 'Ottobre',
    11: 'Novembre',
    12: 'Dicembre'
}

const giorni_settimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
export const getGiornoSettimana = (timestamp: number, day: number) => {
    const mese = new Date(timestamp)
    mese.setDate(day)
    return giorni_settimana[mese.getDay()]
}


const scontrini_local_key = 'scontrini';
const categories_local_key = 'categories';
const info_local_key = 'info_local';

export const saveToStorage = (key: string, value: any) => {
    if(typeof window !== 'undefined') {
        return window.localStorage.setItem(key, JSON.stringify(value));
    }
}

export const getFromStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        const res = window.localStorage.getItem(key);
        if (res !== null) {
            return JSON.parse(res);
        }
        return null;
    }
}

export const getLocalDistretti = (admin = false) => {
    let out: string[] = []
    if (typeof window !== 'undefined') {
        const key = admin ? 'distretti_admin' : 'admin'
        const res = window.localStorage.getItem(key);
        if (res !== null) {
            out = JSON.parse(res);
            return out
        }
        return out
    }
    return out
}


export const clearStorage = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.clear();
    }
}