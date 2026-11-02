import datetime
from typing import Any

from models.medico import Doctor, real_update_sodd


class InfoCombinationTurno:
    def __init__(self):
        self.sedi: list[Any] = []
        """Any stands for Sede"""
        self.nuovo: list[bool] = []  # serve per aggiornamento ore soddisfatto
        self.combinations: list[list[Doctor | None]] = []

    def _update_combinations(self, location: Any, combination: list[Doctor | None], is_new: bool):
        self.sedi.append(location)
        self.combinations.append(combination)
        self.nuovo.append(is_new)

    def add_new_combination(self, location: Any, combination: list[Doctor | None]):
        self._update_combinations(location, combination, True)

    def add_old_doc(self, sede: Any, doc: list[Doctor | None]):
        self._update_combinations(sede, doc, False)


class Turno:
    def __init__(self, data: datetime.datetime, medici_per_turno: int):
        self.data = data
        self.turni_occupati: list[Doctor] = []
        self.medici_disponibili: list[Doctor] = []
        self.medici_per_turno: int = medici_per_turno

    def clear_medici_disponibili(self):
        self.medici_disponibili = []

    def __str__(self):
        return 'Turno ' + str(self.data) + ' con medici ' + str(self.turni_occupati)


def copy_list(my_list: list[Doctor]):
    """Cosi stiamo creando una nuova lista ma senza fare una deepcopy degli elementi all'interno"""
    return list(my_list)


def get_all_medici_disp_per_turno(sedi: list[Any], turno: datetime.datetime):
    info_combination = InfoCombinationTurno()

    for sede in sedi:
        medici_gia_assegnati = sede.get_medici_occupati_per_turno(turno)
        n_medici_necessari = sede.doctors_for_shift - len(medici_gia_assegnati)
        medici_disp_per_turno = copy_list(sede.get_medici_disp_per_turno(turno))

        # TODO Forse deve essere >= dei medici necessari (Occhio logica a "più strati")
        # if len(medici_disp_per_turno) == 0 and len(medici_gia_assegnati) != n_medici_necessari:
        #    return
        # Vuol dire che con anche i sostituti non riusciamo a riempire le ore
        # Se ci sono 2 persone per 3 turni, vogliamo calcolare la possibilità di ignorare uno dei turni inserendo None
        # if n_medici_necessari > 0:
        # medici_disp_per_turno.append(None)
        # per gestire medici già assegnati
        for med in medici_gia_assegnati:
            info_combination.add_old_doc(sede, [med])
        # Per gestire il caso di più medici per turno
        for i in range(n_medici_necessari):
            info_combination.add_new_combination(sede, medici_disp_per_turno + [None])

    return info_combination


def set_combinazione_turno(turno: datetime.datetime, combination: list[Doctor], info_combinations_for_turno: InfoCombinationTurno,
                           locations: list, mode='add'):
    """Setta anche i medici per il turno"""
    # conv, inc, doc
    out = [0, 0, 0]
    if mode == 'add':
        for location in locations:
            location.clear_medici_per_turno(turno)
    for i in range(len(combination)):
        sede = info_combinations_for_turno.sedi[i]
        med = combination[i]
        # Medico già inserito quindi non c'è bisogno di aggiornare ne in 'add' ne in 'sub'
        if not info_combinations_for_turno.nuovo[i] and mode == 'add':
            if med is not None:
                sede.set_medico(med, turno)
            continue
        if med is None:  # il giorno rimarrà vuoto
            continue
        if mode == 'add':
            sede.set_medico(med, turno)  # IMPORTANTE
        if info_combinations_for_turno.nuovo[i]:
            real_update_sodd(med, mode, out)

    return out

def parse_datetime_to_turno(turno: datetime.datetime):
    start = str(turno.hour) + ':' + '30' if str(turno.second).split('')[0] == 1 else '00'
    end = str(turno.hour) + ':' + '30' if str(turno.second).split('')[1] == 1 else '00'
    return datetime.date(turno.year, turno.month, turno.day), start + '-' + end


def delete_turni_vuoti(storage_sedi: list[Any], storage_calendar_turni: list[datetime.datetime]):
    turni_vuoti = {}
    for sede in storage_sedi:
        delete_list = []
        for turno in sede.month_calendar.keys():
            if len(sede.get_medici_disp_per_turno(turno)) == 0:
                delete_list.append(turno)
                turni_vuoti[turno] = 1 if turni_vuoti.get(turno) is None else turni_vuoti[turno] + 1
        for key in delete_list:
            del sede.month_calendar[key]

    for turno, count in turni_vuoti.items():
        if count == len(storage_sedi):
            storage_calendar_turni.remove(turno)
