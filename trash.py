"""
incaricati
def recursive_fn_incaricati(self, s: int, turni_occupati: int, inc_sodd: int):
        if self.sol.best_sol_already_found:  # TODO: Guardare meglio sta cosa, puoi fare un po' di pulizia codice
            return True
        if s == len(self.turni):
            check_sol(self.sol, turni_occupati, self.sol.convenzionati_soddisfatti + inc_sodd,
                      self.sol.convenzionati_soddisfatti,
                      inc_sodd, self.sedi)
            if self.sol.incaricati_soddisfatti == self.sol.incaricati_da_soddisfare:
                self.sol.best_sol_already_found = True
                return True
            if turni_occupati == self.tot_turni:
                self.sol.best_sol_already_found = True
                return True
            return False
        # ----------------------------------------------------------
        turno = self.turni[s]
        info_combinations_for_turno, container_combinations_for_turno = get_all_medici_disp_per_turno(self.sedi, turno)

        if check_turno_okay_for_recursion(self.sedi, turno):
            return self.recursive_fn_incaricati(s + 1, turni_occupati, inc_sodd)

        if container_combinations_for_turno is None:  # Puoi andare avanti perchè poi subentreranno i sostituti
            return self.recursive_fn_incaricati(s + 1, turni_occupati, inc_sodd)
        all_comb = list(itertools.product(*container_combinations_for_turno))

        combination: List[Medico]
        for combination in all_comb:
            if check_if_skip(s != 0, combination, turno, self.sedi):
                continue
            new_soddisfatti = update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi)

            self.sol.n_count_poss += 1
            # print('Soluzione n° ' + str(sol.n_count_poss))
            best_sol_found = self.recursive_fn_incaricati(s + 1, turni_occupati + count_turni_occupati_in_combinazione(
                info_combinations_for_turno, combination),
                                                          inc_sodd + new_soddisfatti[1])
            update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi, mode='sub')
            if best_sol_found is True:
                return True

def recursive_fn(self, s: int, turni_occupati: int, doc_soddisfatti: int, conv_sodd: int, inc_sodd: int):
        if s == len(self.turni) - 1:
            check_sol(self.sol, turni_occupati, doc_soddisfatti, conv_sodd, inc_sodd, self.sedi)
            return
        turno = self.turni[s]
        info_combinations_for_turno, container_combinations_for_turno = get_all_medici_disp_per_turno(self.sedi, turno)

        if container_combinations_for_turno is None:
            if not check_turno_okay_for_recursion(self.sedi, turno):
                return
            # Se giorno è già a posto, passo al successivo
            return self.recursive_fn(s + 1, doc_soddisfatti, conv_sodd, inc_sodd)
        all_comb = list(itertools.product(*container_combinations_for_turno))

        combination: List[Medico]
        for combination in all_comb:
            if check_if_skip(s != 0, combination, turno, self.sedi):
                continue
            new_soddisfatti = update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi)

            self.sol.n_count_poss += 1
            # print('Soluzione n° ' + str(sol.n_count_poss))
            self.recursive_fn(s + 1, turni_occupati + count_turni_occupati_in_combinazione(info_combinations_for_turno,
                                                                                           combination),
                              doc_soddisfatti + new_soddisfatti[2],
                              conv_sodd + new_soddisfatti[0],
                              inc_sodd + new_soddisfatti[1])
            update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi, mode='sub')

    def recursive_fn_convenzionati(self, s: int, turni_occupati: int, conv_sodd: int):
        if self.sol.best_sol_already_found:
            return True
        if s == len(self.turni):
            check_sol(self.sol, turni_occupati, conv_sodd, conv_sodd, 0, self.sedi)
            if self.sol.convenzionati_soddisfatti == self.sol.convenzionati_da_soddisfare:
                self.sol.best_sol_already_found = True
                return True
            return False
        turno = self.turni[s]
        info_combinations_for_turno, container_combinations_for_turno = get_all_medici_disp_per_turno(self.sedi, turno)

        if container_combinations_for_turno is None:
            return self.recursive_fn_convenzionati(s + 1, turni_occupati, conv_sodd)

        all_comb = list(itertools.product(*container_combinations_for_turno))
        combination: List[Medico]
        for combination in all_comb:
            if check_if_skip(s != 0, combination, turno, self.sedi):
                continue

            new_soddisfatti = update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi)

            self.sol.n_count_poss += 1
            # print('Soluzione n° ' + str(sol.n_count_poss))
            best_sol_found = self.recursive_fn_convenzionati(s + 1,
                                                             turni_occupati + count_turni_occupati_in_combinazione(
                                                                 info_combinations_for_turno, combination),
                                                             conv_sodd + new_soddisfatti[0])
            update_soddisfazione(turno, combination, info_combinations_for_turno, self.sedi, mode='sub')
            if best_sol_found is True:
                return True

"""