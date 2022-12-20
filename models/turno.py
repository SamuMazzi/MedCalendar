import datetime
from typing import List

from models.medico import Medico, real_update_sodd


class InfoCombinationTurno:
    def __init__(self):
        self.sedi = []
        self.nuovo = []  # serve per aggiornamento ore soddisfatto
        self.combinations = []

    def _update_combinations(self, sede, combination, nuovo):
        self.sedi.append(sede)
        self.combinations.append(combination)
        self.nuovo.append(nuovo)

    def add_new_combination(self, sede, combination: []):
        self._update_combinations(sede, combination, True)

    def add_old_doc(self, sede, doc: []):
        self._update_combinations(sede, doc, False)


class Turno:
    def __init__(self, data: datetime.datetime, medici_per_turno: int):
        self.data = data
        self.turni_occupati: List[Medico] = []
        self.medici_disponibili: List[Medico] = []
        self.medici_per_turno: int = medici_per_turno

    def clear_medici_disponibili(self):
        self.medici_disponibili = []

    def __str__(self):
        return 'Turno ' + str(self.data) + ' con medici ' + str(self.turni_occupati)


def copy_list(my_list: List[Medico | None]):
    """Cosi stiamo creando una nuova lista ma senza fare una deepcopy degli elementi all'interno"""
    return list(my_list)


def get_all_medici_disp_per_turno(sedi: List, turno: datetime.datetime, con_sostituti=False):
    info_combination = InfoCombinationTurno()

    for sede in sedi:
        medici_gia_assegnati = sede.get_medici_occupati_per_turno(turno)
        n_medici_necessari = sede.medici_per_turno - len(medici_gia_assegnati)
        medici_disp_per_turno = copy_list(sede.get_medici_disp_per_turno(turno))

        # TODO Forse deve essere >= dei medici necessari (Occhio logica a "più strati")
        # if len(medici_disp_per_turno) == 0 and len(medici_gia_assegnati) != n_medici_necessari:
        #    return
        # Vuol dire che con anche i sostituti non riusciamo a riempire le ore
        if len(medici_disp_per_turno) < n_medici_necessari and con_sostituti:
            return
        # Se ci sono 2 persone per 3 turni, vogliamo calcolare la possibilità di ignorare uno dei turni inserendo None
        # if n_medici_necessari > 0:
        medici_disp_per_turno.append(None)
        # per gestire medici già assegnati
        for med in medici_gia_assegnati:
            info_combination.add_old_doc(sede, [med])
        # Per gestire il caso di più medici per turno
        for i in range(n_medici_necessari):
            info_combination.add_new_combination(sede, medici_disp_per_turno)

    return info_combination


def set_combinazione_turno(turno: datetime.datetime, combination: List[Medico], info_combinations_for_turno: InfoCombinationTurno,
                           sedi: List, mode='add'):
    """Setta anche i medici per il turno"""
    # conv, inc, doc
    out = [0, 0, 0]
    if mode == 'add':
        for sede in sedi:
            sede.clear_medici_per_turno(turno)
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