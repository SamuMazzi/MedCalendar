import datetime
from typing import List

from models.enums import Roles


class Medico:
    def __init__(self, id_medico: str, nome: str, ruolo: str, disponibilita: List[datetime.datetime],
                 sedi: List[str], n_turni_max=None):
        self.uid = id_medico
        self.nome = nome
        self.ruolo = ruolo
        self.disponibilita = disponibilita
        self.sedi = sedi
        self.n_turni_per_soddisfatto = n_turni_max if n_turni_max is not None else get_n_turni_per_ruolo(ruolo) # get_n_turni_per_ruolo(ruolo)  # supponiamo di avere un solo mese
        self.n_turni_max = n_turni_max if n_turni_max is not None else get_n_turni_per_ruolo(ruolo)

    def __str__(self):
        return 'Medico: ' + self.nome

    def __repr__(self):
        return str(self)

    def __eq__(self, other):
        return type(other) is type(self) and other.uid == self.uid

    def __lt__(self, other):
        return self.uid < other.uid

    def __hash__(self):
        """Overrides the default implementation"""
        return hash(id)


def get_n_turni_per_ruolo(ruolo: str):
    role = ruolo.lower()
    if role == "sostituto":
        return 4
    elif role == "incaricato12":
        return 4
    elif role == "incaricato24":
        return 8
    elif role == "convenzionato24":
        return 8
    else:
        return 8


def real_update_sodd(med: Medico, mode: str, list_sodd: List[int]):
    """[conv, inc, doc]"""
    if mode == 'sub':
        med.n_turni_per_soddisfatto += 1
    elif mode == 'add':
        med.n_turni_per_soddisfatto -= 1  # conv, inc, doc
        if med.n_turni_per_soddisfatto == 0:
            if med.ruolo == Roles.conv24:
                list_sodd[0] += 1
            elif med.ruolo == Roles.inc12 or med.ruolo == Roles.inc24:
                list_sodd[1] += 1
            list_sodd[2] += 1
