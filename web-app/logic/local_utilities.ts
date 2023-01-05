import Users from "../privateAssets/users.json"

export type MesiType = string[] //Record<number, string>
export const mesi: MesiType = [
    'Gennaio',
    'Febbraio',
    'Marzo',
    'Aprile',
    'Maggio',
    'Giugno',
    'Luglio',
    'Agosto',
    'Settembre',
    'Ottobre',
    'Novembre',
    'Dicembre'
]

const giorni_settimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
export const getGiornoSettimana = (timestamp: number, day: number) => {
    const mese = new Date(timestamp)
    mese.setDate(day)
    return giorni_settimana[mese.getDay()]
}

export const getAllLocalMedici = () => {
    const out: Record<string, Record<string, any>> = Users
    return out;
}

export const capitalizeFirstLetter = (inputString: string) => {
    return inputString.charAt(0).toUpperCase() + inputString.slice(1).toLowerCase();
}

export const getNumOreMaxByRole = (role: string) => {
    const defRole = role.toLowerCase()
    if(defRole.startsWith('sostituto')) {
        return 8
    } else if (defRole.startsWith('incaricato12')) {
        return 4
    } else if (defRole.startsWith('incaricato24')) {
        return 8
    } else if (defRole.startsWith('titolare')) {
        return 8
    }
    throw new Error('Ruolo non trovato')
}

export const setLocalLastOreMaxSet = (ore_max: number) => {
    saveToStorage("last_ore_max", ore_max)
}

export const getLocalLastOreMaxSet = () => {
    const out: number | null = getFromStorage("last_ore_max")
    return out
}

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