import calendar
import datetime
from typing import List
from collections import OrderedDict

from models.medico import Medico
from models.turno import Turno, parse_turno_to_datetime


def create_calendar_turni_from_data(year: int, month: int, fasce: dict):
    first_day = datetime.date(year, month, 1)
    list_days = list(calendar.Calendar().itermonthdates(first_day.year, first_day.month))
    real_list = []
    for fascia in fasce.keys():
        giorni = fasce.get(fascia)
        list_giorni = [int(giorno) for giorno in giorni.split(',')]
        days_of_month = [day_month for day_month in list_days if day_month.month == first_day.month]
        for day in days_of_month:
            if day.isoweekday() in list_giorni:  # Tanto le ore verranno scelte da un dropdown con solo ore intere o mezze
                real_list.append(parse_turno_to_datetime(day, fascia))

    return real_list


class Sede:
    tot_medici_per_turno = 0

    def __init__(self, nome: str,
                 medici_per_turno: int,
                 calendar_turni: List[datetime.datetime],
                 special_days: List[datetime.datetime] = []):
        self.nome = nome
        # iter_days = calendar.Calendar().itermonthdates(datetime.date.today().year, datetime.date.today().month)
        self.month_calendar = OrderedDict()
        """Giorni ordinati del mese grazie a OrderedDict"""
        self.medici_per_turno = medici_per_turno
        self.special_days = special_days
        for turno_date in calendar_turni:
            self.month_calendar[turno_date] = Turno(turno_date, medici_per_turno)
        """Aggiungi giorni speciali"""
        for special_turno in special_days:
            self.month_calendar[special_turno] = Turno(special_turno, medici_per_turno)

    def __str__(self):
        out = "Sede " + self.nome + "\n"
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
        for med in medici:
            if self.nome.lower() in [sede.lower() for sede in med.sedi]:
                for disp in set(med.disponibilita):
                    if disp in self.month_calendar:
                        self.month_calendar[disp].medici_disponibili.append(med)

    def get_medici_disp_per_turno(self, turno: datetime.datetime):
        if turno in self.month_calendar:
            return self.month_calendar[turno].medici_disponibili
        return []

    def clear_medici_per_turno(self, turno: datetime.datetime):
        if self.month_calendar.get(turno) is not None:
            self.month_calendar[turno].turni_occupati = []
        else:
            self.month_calendar[turno] = Turno(turno, self.medici_per_turno)

    def set_medico(self, medico: Medico, turno: datetime.datetime):
        if self.month_calendar.get(turno) is None:
            self.month_calendar[turno] = Turno(turno, self.medici_per_turno)
        self.month_calendar[turno].turni_occupati.append(medico)

