import datetime
from typing import List

from models.enums import Roles, Sedi


class Medico:
    def __init__(self, id, nome: str, cognome: str, ruolo: Roles, disponibilita: List[datetime.datetime],
                 sedi: List[Sedi]):
        self.id = id
        self.nome = nome
        self.cognome = cognome
        self.ruolo = ruolo
        self.disponibilita = disponibilita
        self.sedi = sedi
        self.n_turni_per_soddisfatto = get_n_turni_per_ruolo(ruolo)  # supponiamo di avere un solo mese

    def __str__(self):
        return 'Medico: ' + self.nome + ' ' + self.cognome

    def __repr__(self):
        return str(self)

    def __eq__(self, other):
        return type(other) is type(self) and other.id == self.id

    def __lt__(self, other):
        return self.id < other.id

    def __hash__(self):
        """Overrides the default implementation"""
        return hash(id)


def get_n_turni_per_ruolo(ruolo: Roles):
    if ruolo == Roles.SOSTITUTO:
        return 4
    elif ruolo == Roles.INCARICATO12:
        return 4
    elif ruolo == Roles.INCARICATO24:
        return 8
    elif ruolo == Roles.CONVENZIONATO24:
        return 8
    else:
        return 8


def real_update_sodd(med: Medico, mode: str, list_sodd: List[int]):
    if mode == 'sub':
        med.n_turni_per_soddisfatto += 1
    elif mode == 'add':
        med.n_turni_per_soddisfatto -= 1  # conv, inc, doc
        if med.n_turni_per_soddisfatto == 0:
            if med.ruolo == Roles.CONVENZIONATO24:
                list_sodd[0] += 1
            elif med.ruolo == Roles.INCARICATO12 or med.ruolo == Roles.INCARICATO24:
                list_sodd[1] += 1
            list_sodd[2] += 1
