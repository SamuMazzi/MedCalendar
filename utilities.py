import datetime
from typing import List

from models.medico import Medico
from models.storage import Storage

# TODO: Probabilmente da creare classe Rules


def count_turni_occupati_in_combinazione(info_combinations_for_turno, combination: List[Medico]):
    nuovi_turni_occupati = 0
    for i in range(len(combination)):
        if info_combinations_for_turno[i]['nuovo'] is True and combination[i] is not None:
            nuovi_turni_occupati += 1
    return nuovi_turni_occupati


def is_medico_in_12_ore_prec(combination, turno):
    if Storage.calendar_turni[0] == turno:
        return False
    for med in combination:
        for sede in Storage.sedi:
            med_in_turno_prec = sede.get_medici_occupati_per_turno(turno - datetime.timedelta(hours=12))
            if med is not None and med in med_in_turno_prec:
                return True
    return False


def are_there_duplicates(combination):
    filter_list = filter(lambda med: med is not None, combination)
    with_duplicates = list(filter_list)
    without_duplicates = set(with_duplicates)
    return len(with_duplicates) != len(without_duplicates)


def is_nuovo_medico_e_gia_soddisfatto(combination, info):
    for i in range(len(combination)):
        med = combination[i]
        if med is not None and med.n_turni_per_soddisfatto == 0 and info[i]['nuovo'] is True:
            return True
    return False


def check_if_skip(combination: List[Medico], info, turno: datetime.datetime):
    return are_there_duplicates(combination) or is_nuovo_medico_e_gia_soddisfatto(combination,info) \
           or is_medico_in_12_ore_prec(combination, turno)