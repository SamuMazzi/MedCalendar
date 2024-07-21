import calendar
import datetime
from collections import OrderedDict

from models.medico import Doctor
from models.turno import Turno
from models.utilities_shift import parse_shift_to_datetime


def create_calendar_turni_from_data(year: int, month: int, fasce: dict[str, str]):
    first_day = datetime.date(year, month, 1)
    list_days = list(calendar.Calendar().itermonthdates(first_day.year, first_day.month))
    real_list = []
    for fascia, giorni in fasce.items():
        list_giorni = [int(giorno) for giorno in giorni.split(',')]
        days_of_month = [day_month for day_month in list_days if day_month.month == first_day.month]
        for day in days_of_month:
            if day.isoweekday() in list_giorni:  # Tanto le ore verranno scelte da un dropdown con solo ore intere o mezze
                real_list.append(parse_shift_to_datetime(day, fascia))

    return real_list


class Sede:
    tot_doctors_for_shift = 0

    def __init__(self, nome: str,
                 doctors_for_shift: int,
                 calendar_turni: list[datetime.datetime],
                 special_days: list[datetime.datetime] = []):
        self.nome = nome
        # iter_days = calendar.Calendar().itermonthdates(datetime.date.today().year, datetime.date.today().month)
        self.month_calendar: OrderedDict[datetime.datetime, Turno] = OrderedDict()
        """Giorni ordinati del mese grazie a OrderedDict"""
        self.doctors_for_shift = doctors_for_shift
        self.special_days = special_days
        for turno_date in calendar_turni:
            self.month_calendar[turno_date] = Turno(turno_date, doctors_for_shift)
        """Aggiungi giorni speciali"""
        for special_turno in special_days:
            self.month_calendar[special_turno] = Turno(special_turno, doctors_for_shift)

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

    def set_medici_disponibili_per_mese_curr(self, medici: list[Doctor]):
        for med in medici:
            if self.nome.lower() in [sede.lower() for sede in med.sedi]:
                for disp in set(med.disponibilita):
                    if disp in self.month_calendar:
                        self.month_calendar[disp].medici_disponibili.append(med)

    def get_medici_disp_per_turno(self, turno: datetime.datetime):
        out: list[Doctor] = []
        if turno in self.month_calendar:
            out = self.month_calendar[turno].medici_disponibili
        return out

    def clear_medici_per_turno(self, turno: datetime.datetime):
        if self.month_calendar.get(turno) is not None:
            self.month_calendar[turno].turni_occupati = []
        else:
            self.month_calendar[turno] = Turno(turno, self.doctors_for_shift)

    def set_medico(self, medico: Doctor, turno: datetime.datetime):
        if self.month_calendar.get(turno) is None:
            self.month_calendar[turno] = Turno(turno, self.doctors_for_shift)
        self.month_calendar[turno].turni_occupati.append(medico)

