class Soluzione:
    def __init__(self, inc_sodd=0, conv_sodd=0, doc_sodd=0, turni_occupati=0):
        self.turni_occupati = turni_occupati
        self.medici_soddisfatti = doc_sodd
        self.sedi = []
        self.convenzionati_soddisfatti = conv_sodd
        self.incaricati_soddisfatti = inc_sodd
        self.sostituti_soddisfatti = 0
        self.n_count_poss = 0
        self.best_sol_already_found = False
        self.solution_found = False
        self.n_tentativi_dopo_sol = 0  # è una prova, debug

    def reset_best_sol_found(self):
        self.best_sol_already_found = False
        self.n_tentativi_dopo_sol = 0

    def reset_sol_found(self):
        self.solution_found = False
        self.n_tentativi_dopo_sol = 0

    def set_best_sol_found(self):
        self.best_sol_already_found = True
        self.n_tentativi_dopo_sol = 0
        # self.n_best_sol += 1

    def set_sol_found(self):
        self.solution_found = True
        self.n_tentativi_dopo_sol = 0

    def __str__(self):
        return 'Soluzione con ' + str(self.medici_soddisfatti) + ' medici soddisfatti, ' + str(
            self.convenzionati_soddisfatti) + ' convenzionati soddisfatti, ' + str(
            self.incaricati_soddisfatti) + ' incaricati soddisfatti, ' + ' L\'elenco delle sedi con ' \
                                                                         'calendari è: \n' + str(self.sedi)
