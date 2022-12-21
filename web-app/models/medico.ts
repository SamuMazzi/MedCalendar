const get_n_ore_by_role = (role: string) => {
    const def_role = role.toLowerCase().trim()
    if (def_role.startsWith('convenzionato') || def_role.startsWith('incaricato24')) {
        return 8
    } else if (def_role.startsWith('incaricato12')) {
        return 4
    } else if (def_role.startsWith('sostituto')) {
        return 4
    } else {
        throw "Ruolo non riconosciuto: " + def_role
    }
}

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
        this.n_ore_soddisfatto = get_n_ore_by_role(ruolo)
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