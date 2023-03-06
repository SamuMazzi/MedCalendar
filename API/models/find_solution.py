import copy
import itertools
from typing import List

from models.medico import Medico
from models.soluzione import Soluzione
from models.storage import Storage
from models.turno import get_all_medici_disp_per_turno, set_combinazione_turno
from utilities import count_turni_occupati_in_combinazione, check_if_skip, are_there_duplicates


class FindSolution:
    def __init__(self, medici: List[Medico], sol: Soluzione = None):
        self.medici = medici
        self.sol = sol if sol is not None else Soluzione()

    def check_sol(self, turni_occupati: int, doc_soddisfatti: int, conv_sodd: int, inc_sodd: int):
        self.sol.n_tentativi_dopo_sol += 1
        if turni_occupati >= self.sol.turni_occupati:
            if conv_sodd > self.sol.convenzionati_soddisfatti or inc_sodd > self.sol.incaricati_soddisfatti or doc_soddisfatti > self.sol.medici_soddisfatti:
                assert conv_sodd >= self.sol.convenzionati_soddisfatti and inc_sodd >= self.sol.incaricati_soddisfatti
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
        self.sol.set_sol_found()
        if self.sol.turni_occupati == Storage.tot_turni - Storage.turni_non_riempibili:
            self.sol.set_best_sol_found()
        if conv_sodd == Storage.convenzionati_da_soddisfare and Storage.incaricati_da_soddisfare == inc_sodd:
            print('Soluzione quasi migliore trovata')

    def handle_empty_container_turno(self, s, turni_occupati, doc_sodd, conv_sodd, inc_sodd, mode):
        return self.recursive_fn(s + 1, mode, turni_occupati, doc_sodd, conv_sodd, inc_sodd)

    def list_duplicates(self, seq):
        seen = set()
        seen_add = seen.add
        # adds all elements it doesn't know yet to seen and all other to seen_twice
        seen_twice = set(x for x in seq if x in seen or seen_add(x))
        # turn the set into a list (as requested)
        return list(seen_twice)

    def recursive_fn(self, s, mode, turni_occupati, conv_sodd, inc_sodd, doc_sodd):
        if s == len(Storage.calendar_turni):
            return self.handle_last_round(turni_occupati, doc_sodd, conv_sodd, inc_sodd, mode)
        turno = Storage.calendar_turni[s]
        info_combination = get_all_medici_disp_per_turno(Storage.sedi, turno)
        # TODO: Risolvi bug per cui alcuni giorni proprio non venivano fuori
        #TODO: Aggiungi test per cui non ci siano più medici di quelli possibili per turno
        # TODO: Serve una funzione che in un certo giorno ti dica quanti turni mancano al giorno finale
        all_comb = list(itertools.product(*info_combination.combinations))
        all_comb = [comb for comb in all_comb if not are_there_duplicates(comb)]

        if len(all_comb) == 0:
            return self.handle_empty_container_turno(s, turni_occupati, doc_sodd, conv_sodd, inc_sodd, mode)

        combination: List[Medico]
        for combination in all_comb:
            if check_if_skip(combination, info_combination, turno):
                continue
            new_soddisfatti = set_combinazione_turno(turno, combination, info_combination, Storage.sedi)

            self.sol.n_count_poss += 1
            best_sol_found = self.recursive_fn(s + 1, mode, turni_occupati + count_turni_occupati_in_combinazione(
                info_combination, combination), doc_sodd=doc_sodd + new_soddisfatti[2],
                                               conv_sodd=conv_sodd + new_soddisfatti[0],
                                               inc_sodd=inc_sodd + new_soddisfatti[1])
            set_combinazione_turno(turno, combination, info_combination, Storage.sedi, mode='sub')
            if self.sol.solution_found:
                # best_sol_found or (self.sol.solution_found and self.sol.n_tentativi_dopo_sol > 10000):
                # TODO: Ancora non funziona, debugga (problema che alla fine recursive_fn torna True anche se non dovrebbe)
                return True
        return False

    def handle_last_round(self, turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd, mode):
        self.check_sol(turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd)
        if mode == 'incaricati' and self.sol.incaricati_soddisfatti == Storage.incaricati_da_soddisfare:
            self.sol.set_best_sol_found()
        elif mode == 'convenzionati' and self.sol.convenzionati_soddisfatti == Storage.convenzionati_da_soddisfare:
            self.sol.set_best_sol_found()
        return self.sol.best_sol_already_found
