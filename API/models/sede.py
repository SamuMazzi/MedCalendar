import calendar
import datetime
from typing import List, Dict
from collections import OrderedDict

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


# Idea di turno -> 2022-04-13 12:14:11
# 12 -> ora inizio
# 14 -> ora fine
# 11 -> ogni 1 o 0 ti dice se l'ora d'inizio/fine ha la mezz'ora -> 12.30-14.30


def parse_turno(day: datetime.datetime, fascia):
    inizio_ora = fascia.split('-')[0]  # Per ora si possono usare solo ore senza mezz'ore
    inizio = inizio_ora.split(':')
    inizio_ora = inizio[0]
    inizio_minuti = inizio[1] if len(inizio) >= 2 else '0'
    fine_ora = fascia.split('-')[1]
    fine = fine_ora.split(':')
    fine_ora = fine[0]
    fine_minuti = fine[1] if len(fine) >= 2 else '0'
    final_minuti = int(inizio_minuti + fine_minuti)
    return datetime.datetime(day.year, day.month, day.day, int(inizio_ora), int(fine_ora), final_minuti)


def create_calendar_turni_from_data(year, month, data_sede):
    first_day = datetime.date(year, month, 1)
    list_days = list(calendar.Calendar().itermonthdates(first_day.year, first_day.month))
    real_list = []
    fasce = data_sede['fasce_turno']
    for fascia in fasce.keys():
        giorni = fasce.get(fascia)
        for day in list_days:
            if day.month == first_day.month:
                weekday = calendar.weekday(day.year, day.month, day.day)
                if weekday in giorni:  # Tanto le ore verranno scelte da un dropdown con solo ore intere o mezze
                    real_list.append(parse_turno(day, fascia))

    # TODO: Da finire!!
    return real_list


class Sede:
    tot_medici_per_turno = 0

    def __init__(self, nome: str,
                 medici_per_turno: int,
                 calendar_turni: List[datetime.datetime],
                 special_days: Dict[datetime.datetime, Turno] = {}):
        self.nome = nome
        # iter_days = calendar.Calendar().itermonthdates(datetime.date.today().year, datetime.date.today().month)
        self.month_calendar = OrderedDict()
        """Giorni ordinati del mese grazie a OrderedDict"""
        self.medici_per_turno = medici_per_turno
        self.special_days = special_days
        for turno_date in calendar_turni:
            self.month_calendar[turno_date] = Turno(turno_date, medici_per_turno)
        for turno_date in special_days:
            self.month_calendar[turno_date] = Turno(turno_date, medici_per_turno)

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
            # supponiamo che le disponibilità siano tutte e solo di quel mese
            # set serve solo per generazione dinamica di medici, togliere poi
            if self.nome.lower() in med.sedi:
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

