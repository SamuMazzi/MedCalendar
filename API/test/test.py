import copy
import unittest

from main import execute_schedule
from models.sede import Sede
from models.storage import Storage
from models.turno import InfoCombinationTurno
from models.medico import Medico
from test.mock_medici import dataMock, data_medici_mock_febbraio_23
from utilities import check_if_skip


class TestFindSoluzione(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        # TODO: aggiungi test che i giorni festivi vengano riconosciuti come tali
        data_to_use = data_medici_mock_febbraio_23
        # data_to_use['medici'] = read_dati('assets/gennaio23.xlsx')
        cls.data = data_to_use
        cls.best_sol = execute_schedule(data_to_use)[2]  # TODO Aggiungi test anche su response
        cls.conteggio_turni_per_medico = {}
        cls.month_calendar = {}
        cls.medici_of_best_sol = []
        sede: Sede
        for sede in cls.best_sol.sedi:  # I medici sono oggetti diversi, è un problema! Probabilmente i medici cambiano fra set_medici_disp_a_priori e findSolution
            for date_day, turno in sede.month_calendar.items():
                medici_occupati = turno.turni_occupati
                cls.medici_of_best_sol.extend(medici_occupati)
                # for med in medici_occupati:  # Succedono cose strane nel conteggio dei turni
                #    cls.data['medici'][cls.data['medici'].index(med)].n_turni_per_soddisfatto -= 1
                if date_day in cls.month_calendar:
                    cls.month_calendar[date_day].extend(medici_occupati)
                else:  # TODO: Capire perchè c'è deepcopy e perchè se lo elimini da problemi
                    cls.month_calendar[date_day] = copy.deepcopy(medici_occupati)  # copy.deepcopy(
        cls.medici_of_best_sol = set(cls.medici_of_best_sol)

    def test_solution_is_not_empty(self):
        self.assertGreater(len(self.best_sol.sedi), 0)

    def test_month_calendar_is_not_empty(self):
        sede: Sede
        for sede in self.best_sol.sedi:
            self.assertGreater(len(sede.month_calendar.keys()), 0)
        print('Okay conteggio month')

    def test_medici_sono_nella_loro_sede(self):
        for sede in self.best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():  # TODO Aggiungere test che siano SOLO nella loro sede
                for med in turno.turni_occupati:
                    self.assertIn(turno.data, med.disponibilita)
                    sedi_lower = [sede.lower() for sede in med.sedi]
                    self.assertIn(sede.nome.lower(), sedi_lower, msg=str(med) + ' ha le seguenti sedi: ' + str(sedi_lower))
        print('Okay medici in sede')

    def test_medici_non_fanno_piu_ore_del_previsto(self):
        for medici_occupati in self.month_calendar.values():
            for med in medici_occupati:
                if med not in self.conteggio_turni_per_medico:
                    self.conteggio_turni_per_medico[med] = 0
                else:
                    self.conteggio_turni_per_medico[med] += 1

        med: Medico
        for med, num_turni in self.conteggio_turni_per_medico.items():
            self.assertGreaterEqual(med.n_turni_max, num_turni, 'Problama turni per il medico: ' + med.nome)
        print('Okay medici ora non superate')

    def test_generici(self):
        self.assertGreaterEqual(self.best_sol.medici_soddisfatti,
                                self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti)
        # self.assertEqual(self.best_sol.medici_soddisfatti, self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti + self.best_sol.sostituti_soddisfatti)

        for medici_occupati in self.month_calendar.values():
            self.assertEqual(len(medici_occupati), len(set(medici_occupati)))
            # self.assertGreaterEqual(2, len(set(medici_occupati)))
        print('Okay test generici')

    def test_check_creazione_tutti_turni_del_mese(self):
        if self.data['year'] == 2023 and self.data['month'] == 2:
            self.assertEqual(len(Storage.calendar_turni), 44)
            print('Okay numero turni')

    def med_in_altra_sede(self, med, date_turno):
        for sede in self.best_sol.sedi:
            if med in sede.get_medici_occupati_per_turno(date_turno):
                return True
        return False

    def test_Check_medici_non_inseribili_in_ulteriori_posizioni(self):
        """Controlla per ogni medico che non possa essere inserito in nessun'altra posizione"""
        med: Medico   # self.data['medici']
        for med in self.medici_of_best_sol:
            sede: Sede
            for sede in self.best_sol.sedi:
                for date_turno, turno in sede.month_calendar.items():
                    if turno.medici_per_turno - len(turno.turni_occupati) > 0 and date_turno in med.disponibilita and sede.nome.lower() in [sede_med.lower() for sede_med in med.sedi]:
                        info = InfoCombinationTurno()
                        info.add_new_combination(sede.nome, [med])
                        res = check_if_skip([med], info, date_turno) or self.med_in_altra_sede(med, date_turno)  # 2023-02-20 20:8
                        self.assertTrue(res)
        print('Okay ultimo test')

    # TODO: Aggiungere anche un test per questione mesi Javascript


if __name__ == '__main__':
    unittest.main()
