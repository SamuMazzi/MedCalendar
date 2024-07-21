import datetime
from typing import List

from models.enums import Roles
from models.utilities_shift import parse_shift_to_datetime


class Doctor:
    def __init__(self, id_medico: str, nome: str, ruolo: str, disponibilita: List[datetime.datetime],
                 sedi: List[str], n_shifts_max: int | None = None):
        self.uid = id_medico
        self.nome = nome
        self.ruolo = ruolo
        self.disponibilita = disponibilita
        self.sedi = sedi
        self.n_turni_per_soddisfatto = n_shifts_max if n_shifts_max is not None else get_std_num_shifts_per_role(ruolo) # supponiamo di avere un solo mese
        self.n_shifts_max = n_shifts_max if n_shifts_max is not None else get_std_num_shifts_per_role(ruolo)

    @classmethod
    def from_request(cls, doctor: dict, year: int, month: int):
        name: str = doctor['name']
        role = doctor['role']
        n_shifts_max = doctor.get('max_hours') if doctor.get('max_hours') is not None else get_std_num_shifts_per_role(role)
        available_locations = doctor['locations']

        availabilities = []
        for shift, days in doctor['availability'].items():
            for day in days:
                parsed_shift = parse_shift_to_datetime(datetime.date(year, month, day), shift)
                availabilities.append(parsed_shift)
        return cls(doctor['id'], name, role, availabilities, available_locations, n_shifts_max=n_shifts_max)

    def __str__(self):
        return 'Doctor: ' + self.nome

    def __repr__(self):
        return str(self)

    def __eq__(self, other):
        return type(other) is type(self) and other.uid == self.uid

    def __lt__(self, other):
        return self.uid < other.uid

    def __hash__(self):
        """Overrides the default implementation"""
        return hash(id)


def get_std_num_shifts_per_role(role: str):
    role = role.lower()
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


def real_update_sodd(med: Doctor, mode: str, list_sodd: List[int]):
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
