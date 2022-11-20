import datetime
from typing import List

from models.medico import Medico, real_update_sodd


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


def copy_list(my_list: List[Medico]):
    """Cosi stiamo creando una nuova lista ma senza fare una deepcopy degli elementi all'interno"""
    return list(my_list)


def get_all_medici_disp_per_turno(sedi: List, turno: datetime.datetime, con_sostituti=False):
    container_combinations_for_turno = []
    info_combinations_for_turno = []
    # list_medici_disponibili = []

    for sede in sedi:
        medici_gia_assegnati = sede.get_medici_occupati_per_turno(turno)
        n_medici_necessari = sede.medici_per_turno - len(medici_gia_assegnati)
        medici_disp_per_turno = copy_list(sede.get_medici_disp_per_turno(turno))
        # for med_occ in reminder_medici:
        #    if med_occ in medici_disp_per_turno:
        #        medici_disp_per_turno.remove(med_occ)

        # for med in medici_disp_per_turno:
        #    if med not in list_medici_disponibili:
        #        list_medici_disponibili.append(med)
        # TODO Forse deve essere >= dei medici necessari (Occhio logica a "più strati")
        # if len(medici_disp_per_turno) == 0 and len(medici_gia_assegnati) != n_medici_necessari:
        #    return
        # Vuol dire che con anche i sostituti non riusciamo a riempire le ore
        if len(medici_disp_per_turno) < n_medici_necessari and con_sostituti:
            return
        # Se ci sono 2 persone per 3 turni, vogliamo calcolare la possibilità di ignorare uno dei turni inserendo None
        if n_medici_necessari > 0:
            medici_disp_per_turno.append(None)
        # per gestire medici già assegnati
        for med in medici_gia_assegnati:
            info_combinations_for_turno.append({
                'sede': sede,
                'nuovo': False  # Serve per aggiornamento ore soddisfatto
            })
            container_combinations_for_turno.append([med])
        # Per gestire il caso di più medici per turno
        for i in range(n_medici_necessari):
            info_combinations_for_turno.append({
                'sede': sede,
                'nuovo': True
            })
            container_combinations_for_turno.append(medici_disp_per_turno)

    return info_combinations_for_turno, container_combinations_for_turno


def set_combinazione_turno(turno: datetime.datetime, combination: List[Medico], info_combinations_for_turno: List[dict],
                           sedi: List, mode='add'):
    """Setta anche i medici per il turno"""
    # conv, inc, doc
    out = [0, 0, 0]
    if mode == 'add':
        for sede in sedi:
            sede.clear_medici_per_turno(turno)
    for i in range(len(combination)):
        info_med = info_combinations_for_turno[i]
        sede = info_med['sede']
        med = combination[i]
        # Medico già inserito quindi non c'è bisogno di aggiornare ne in 'add' ne in 'sub'
        if not info_med['nuovo'] and mode == 'add':
            if med is not None:
                sede.set_medico(med, turno)
            continue
        if med is None:  # il giorno rimarrà vuoto
            continue
        if mode == 'add':
            sede.set_medico(med, turno)  # IMPORTANTE
        if info_med['nuovo']:
            real_update_sodd(med, mode, out)

    return out