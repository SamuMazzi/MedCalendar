import copy
import itertools
from typing import List

from models.medico import Medico
from models.soluzione import Soluzione
from models.storage import Storage
from models.turno import get_all_medici_disp_per_turno, set_combinazione_turno
from utilities import count_turni_occupati_in_combinazione, check_if_skip

# TODO Trova la parte in cui conti i turni effettivi e metti nel excel
class FindSolution:
    def __init__(self, medici: List[Medico], sol: Soluzione = None):
        self.medici = medici
        self.sol = sol if sol is not None else Soluzione()

    def check_sol(self, turni_occupati: int, doc_soddisfatti: int, conv_sodd: int, inc_sodd: int):
        if turni_occupati >= self.sol.turni_occupati:
            if conv_sodd >= self.sol.convenzionati_soddisfatti and doc_soddisfatti > self.sol.medici_soddisfatti:
                if conv_sodd > self.sol.convenzionati_soddisfatti:
                    self.update_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)
                elif inc_sodd >= self.sol.incaricati_soddisfatti:
                    # stesso numero di convenzionati soddisfatti
                    if inc_sodd > self.sol.incaricati_soddisfatti:
                        self.update_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)
                    elif doc_soddisfatti > self.sol.medici_soddisfatti:
                        # stesso numero di convenzionati e incaricati soddisfatti, quindi conto quelli totali
                        self.update_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)
            elif turni_occupati > self.sol.turni_occupati:
                self.update_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)

    def update_sol(self, turni_occupati: int, doc_soddisfatti: int, conv_sodd: int, inc_sodd: int):
        print('Soluzione migliore')
        self.sol.medici_soddisfatti = doc_soddisfatti
        self.sol.convenzionati_soddisfatti = conv_sodd
        self.sol.incaricati_soddisfatti = inc_sodd
        self.sol.turni_occupati = turni_occupati
        # copia stato corrente sedi nella soluzione
        self.sol.sedi = copy.deepcopy(Storage.sedi)
        self.sol.set_best_sol_found()  # debug
        if conv_sodd == Storage.convenzionati_da_soddisfare and Storage.incaricati_da_soddisfare == inc_sodd:
            print('Soluzione quasi migliore trovata')

    def handle_empty_container_turno(self, s, turni_occupati, doc_sodd, conv_sodd, inc_sodd, mode, turno):
        # if mode == 'normale' and not check_turno_okay_for_recursion(turno):
        # return False # Cosi perchè per ora possiamo accettare di avere alla fine dei turni vuoti

        return self.recursive_fn(s + 1, mode, turni_occupati, doc_sodd, conv_sodd, inc_sodd)

    def inner_fn(self, s, mode, turni_occupati, conv_sodd, inc_sodd, doc_sodd):
        turno = Storage.calendar_turni[s]
        info_combinations_for_turno, container_combinations_for_turno = get_all_medici_disp_per_turno(Storage.sedi,
                                                                                                      turno)
        # TODO: Serve una funzione che in un certo giorno ti dica quanti turni mancano al giorno finale

        if container_combinations_for_turno is None:
            return self.handle_empty_container_turno(s, turni_occupati, doc_sodd, conv_sodd, inc_sodd, mode, turno)

        all_comb = list(itertools.product(*container_combinations_for_turno))

        combination: List[Medico]
        for combination in all_comb:
            if check_if_skip(combination, info_combinations_for_turno, turno):
                continue
            new_soddisfatti = set_combinazione_turno(turno, combination, info_combinations_for_turno, Storage.sedi)

            self.sol.n_count_poss += 1
            best_sol_found = self.recursive_fn(s + 1, mode, turni_occupati + count_turni_occupati_in_combinazione(
                info_combinations_for_turno, combination), doc_sodd, conv_sodd + new_soddisfatti[0],
                                               inc_sodd + new_soddisfatti[1])
            set_combinazione_turno(turno, combination, info_combinations_for_turno, Storage.sedi, mode='sub')
            if self.sol.best_sol_already_found is True:  # (mode == 'convenzionati' and self.sol.n_best_sol >= 1) or self.sol.n_best_sol >= 1:
                return True

    def handle_last_round(self, turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd, mode):
        self.check_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)
        if turni_occupati == Storage.tot_turni:
            self.sol.set_best_sol_found()
        elif mode == 'incaricati' and self.sol.incaricati_soddisfatti == Storage.incaricati_da_soddisfare:
            self.sol.set_best_sol_found()
        elif mode == 'convenzionati' and self.sol.convenzionati_soddisfatti == Storage.convenzionati_da_soddisfare:
            self.sol.set_best_sol_found()
        return self.sol.best_sol_already_found

    def recursive_fn(self, s: int, mode: str, turni_occupati: int, doc_soddisfatti: int, conv_sodd: int, inc_sodd: int):
        if s == len(Storage.calendar_turni):
            return self.handle_last_round(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd, mode)
        return self.inner_fn(s, mode, turni_occupati, doc_sodd=doc_soddisfatti, conv_sodd=conv_sodd, inc_sodd=inc_sodd)
