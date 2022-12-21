import datetime
from typing import List

from models.medico import Medico
from models.storage import Storage

# Probabilmente da creare classe Rules
from models.turno import InfoCombinationTurno


def count_turni_occupati_in_combinazione(info_combinations_for_turno, combination: List[Medico]):
    nuovi_turni_occupati = 0
    for i in range(len(combination)):
        if info_combinations_for_turno.nuovo[i] is True and combination[i] is not None:
            nuovi_turni_occupati += 1
    return nuovi_turni_occupati


def is_medico_in_24_ore_prec_o_succ(combination, turno: datetime.datetime):
    if Storage.calendar_turni[0] == turno:
        return False
    for med in combination:
        for sede in Storage.sedi:
            meds_occ = []
            # med_in_turno_prec = sede.get_medici_occupati_per_turno(turno - datetime.timedelta(hours=12))
            # med_in_turno_succ = sede.get_medici_occupati_per_turno(turno + datetime.timedelta(hours=12))
            # meds_occ.extend(med_in_turno_prec)
            # meds_occ.extemd(meds_in_turn_after)
            day_before = turno - datetime.timedelta(days=1)
            day_after = turno + datetime.timedelta(days=1)
            turni_to_be_checked = list(filter(lambda tur: turno != tur and (turno.day == tur.day or tur.day == day_after.day or tur.day == day_before.day), sede.month_calendar))
            for turno_check in turni_to_be_checked:
                meds_occ.extend(sede.get_medici_occupati_per_turno(turno_check))
            if med is not None and med in meds_occ:
                return True
    return False


def are_there_duplicates(combination):
    filter_list = filter(lambda med: med is not None, combination)
    with_duplicates = list(filter_list)
    without_duplicates = set(with_duplicates)
    out = len(with_duplicates) != len(without_duplicates)
    return out


def is_nuovo_medico_e_gia_soddisfatto(combination, info):
    for i in range(len(combination)):
        med = combination[i]
        if med is not None and med.n_turni_per_soddisfatto == 0 and info.nuovo[i] is True:
            return True
    return False


def check_if_skip(combination: List[Medico], info: InfoCombinationTurno, turno: datetime.datetime):
    return is_nuovo_medico_e_gia_soddisfatto(combination, info) or is_medico_in_24_ore_prec_o_succ(combination, turno)
