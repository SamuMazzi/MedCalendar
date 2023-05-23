import { getNumOreMaxByRole } from "../logic/local_utilities";

export class Medico {
    id: string;
    nome: string
    ruolo: string
    disponbilita: any[]
    sedi: string[]
    n_ore_soddisfatto: number

    constructor(id: string, nome: string, ruolo: string, disponibilita: any[], sedi: string[]) {
        this.id = id
        this.nome = nome
        this.ruolo = ruolo
        this.disponbilita = disponibilita
        this.sedi = sedi
        this.n_ore_soddisfatto = getNumOreMaxByRole(ruolo)
    }
}

export class Sede {
    nome: string
    month_calendar: Record<string, []>[]
    medici_per_turno: number

    constructor(nome: string, month_calendar: Record<string, []>[], medici_per_turno: number) {
        this.nome = nome
        this.month_calendar = month_calendar
        this.medici_per_turno = medici_per_turno
    }

}