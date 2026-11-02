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

/** Human-readable labels for the role ids used by the scheduler */
export const ROLE_LABELS: Record<string, string> = {
    titolare24: 'Titolare 24h',
    titolare36: 'Titolare 36h',
    convenzionato24: 'Convenzionato 24h',
    incaricato24: 'Incaricato 24h',
    incaricato12: 'Incaricato 12h',
    sostituto: 'Sostituto',
}

export const getRoleLabel = (role: string) => ROLE_LABELS[role.toLowerCase()] ?? role

const ROLE_COLORS: Record<string, string> = {
    titolare24: '#64B5F6',
    titolare36: '#1E88E5',
    convenzionato24: '#9575CD',
    incaricato24: '#66BB6A',
    incaricato12: '#AED581',
    sostituto: '#FFB74D',
}

/** Same colour for a role everywhere (legend, table, change-shift dialog) */
export const getColorRole = (role: string) => {
    const key = role.toLowerCase()
    if (ROLE_COLORS[key]) return ROLE_COLORS[key]
    let hash = 0
    for (const c of key) hash = (hash * 31 + c.charCodeAt(0)) % 360
    return `hsl(${hash},58%,65%)`
}

export function generateColorRole(number: number){
    const hue = number * 137.508; // use golden angle approximation
    return `hsl(${hue},58%,75%)`;
}

const giorni_settimana = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
export const getGiornoSettimana = (timestamp: number, day: number) => {
    const mese = new Date(timestamp)
    mese.setDate(day)
    return giorni_settimana[mese.getDay()]
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
    }
    return null;
}

export const validateEmail = (email: string) => {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

export const clearStorage = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.clear();
    }
}

function parseSinglePieceTurno(piece: string): [string, string] {
    const hAndM = piece.split(':');
    const hours = hAndM[0];
    const minutes = hAndM.length >= 2 && Number(hAndM[1]) !== 0 ? '1' : '0';
    return [hours, minutes];
}

/*
    Per ora si possono usare solo ore senza mezz'ore

    Idea di turno -> 2022-04-13 12:14:11
    12 -> ora inizio
    14 -> ora fine
    11 -> ogni 1 o 0 ti dice se l'ora d'inizio/fine ha la mezz'ora -> 12.30-14.30
    :param day:
    :param fascia:
    :return */
export const fromTurnoToDate = (day: Date, fascia: string): Date => {
    const [inizioOra, inizioMinuti] = parseSinglePieceTurno(fascia.split('-')[0]);
    const [fineOra, fineMinuti] = parseSinglePieceTurno(fascia.split('-')[1]);
    const finalMinuti = inizioMinuti + fineMinuti;
    return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(inizioOra), Number(fineOra), Number(finalMinuti));
}

export const parseDateToTurno = (turno: Date): [Date, string] => {
    const start = turno.getHours() + (turno.getSeconds().toString().split('')[0] === '1' ? ':30' : '');
    const end = turno.getMinutes() + (turno.getSeconds().toString().split('')[1] === '1' ? ':30' : '');
    return [new Date(turno.getFullYear(), turno.getMonth(), turno.getDate()), start + '-' + end];
}