import calendar
import datetime
from typing import List
from collections import OrderedDict

from models.enums import Sedi
from models.medico import Medico
from models.turno import Turno


def create_calendar_turni(year: int, month: int):
    first_day = datetime.date(year, month, 1)
    list_days = list(calendar.Calendar().itermonthdates(first_day.year, first_day.month))
    real_list = []
    for day in list_days:
        weekday = calendar.weekday(day.year, day.month, day.day)
        if day.month == first_day.month:
            if weekday is calendar.SUNDAY or weekday is calendar.SATURDAY:  # or è un giorno di festa segnato da qualche altra parte
                real_list.append(datetime.datetime(day.year, day.month, day.day, 8))
                real_list.append(datetime.datetime(day.year, day.month, day.day, 20))
            else:
                real_list.append(datetime.datetime(day.year, day.month, day.day, 20))
    return real_list


class Sede:
    tot_medici_per_turno = 0

    def __init__(self, nome: Sedi,
                 medici_per_turno: int, calendar_turni: List[datetime.datetime]):  # TODO: Specificare mese e date speciali nei parametri magari
        self.nome = nome
        # iter_days = calendar.Calendar().itermonthdates(datetime.date.today().year, datetime.date.today().month)
        self.month_calendar = OrderedDict()
        """Giorni ordinati del mese grazie a OrderedDict"""
        self.medici_per_turno = medici_per_turno
        self.special_days = {}
        for date_day in calendar_turni:
            self.month_calendar[date_day] = Turno(date_day, medici_per_turno)

    def __str__(self):
        out = "Sede " + self.nome.name + "\n"
        for day, giorno in self.month_calendar.items():
            out += str(day) + ': ' + str(giorno.turni_occupati) + "\n"
        return out

    def __repr__(self):
        return str(self)

    def clear_medici_disponibili(self):
        for v in self.month_calendar.values():
            v.clear_medici_disponibili()

    def get_medici_occupati_per_turno(self, turno: datetime.datetime):
        if turno not in self.month_calendar:
            return []
        return self.month_calendar[turno].turni_occupati

    def set_medici_disponibili_per_mese_curr(self, medici: List[Medico]):
        print('Setting medici...')
        for med in medici:
            # supponiamo che le disponibilità siano tutte e solo di quel mese
            # set serve solo per generazione dinamica di medici, togliere poi
            if self.nome in med.sedi:
                for disp in set(med.disponibilita):
                    if disp in self.month_calendar:
                        self.month_calendar[disp].medici_disponibili.append(med)

    def get_medici_disp_per_turno(self, turno: datetime.datetime):
        if turno in self.month_calendar:
            return self.month_calendar[turno].medici_disponibili
        return []

    def clear_medici_per_turno(self, turno: datetime.datetime):
        self.month_calendar[turno].turni_occupati = []

    def set_medico(self, medico: Medico, turno: datetime.datetime):
        self.month_calendar[turno].turni_occupati.append(medico)
