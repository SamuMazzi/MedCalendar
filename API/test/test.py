import copy
import unittest

from excel_handler import read_dati
from models.sede import Sede
from models.turno import InfoCombinationTurno
from scheduler import start
from models.medico import Medico
from test.mock_medici import dataMock
from utilities import check_if_skip


class TestFindSoluzione(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        data_to_use = dataMock
        data_to_use['medici'] = read_dati('assets/gennaio23.xlsx')
        cls.data = data_to_use
        cls.best_sol = start(dataMock)
        cls.conteggio_turni_per_medico = {}
        cls.month_calendar = {}

        for sede in cls.best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():
                if date_day in cls.month_calendar:
                    cls.month_calendar[date_day].extend(turno.turni_occupati)
                else:
                    cls.month_calendar[date_day] = copy.deepcopy(turno.turni_occupati)

    def test_solution_is_not_empty(self):
        self.assertGreater(len(self.best_sol.sedi), 0)

    def test_month_calendar_is_not_empty(self):
        sede: Sede
        for sede in self.best_sol.sedi:
            self.assertGreater(len(sede.month_calendar.keys()), 0)
        print('Okay conteggio month')

    def test_medici_sono_nella_loro_sede(self):
        for sede in self.best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():
                for med in turno.turni_occupati:
                    self.assertIn(turno.data, med.disponibilita)
                    self.assertIn(sede.nome.lower(), med.sedi, msg=str(med) + ' ha le seguenti sedi: ' + str(med.sedi))
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
            self.assertGreaterEqual(med.n_turni_max, num_turni)
        print('Okay medici ora non superate')

    def test_generici(self):
        self.assertGreaterEqual(self.best_sol.medici_soddisfatti,
                                self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti)
        # self.assertEqual(self.best_sol.medici_soddisfatti, self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti + self.best_sol.sostituti_soddisfatti)

        for medici_occupati in self.month_calendar.values():
            self.assertEqual(len(medici_occupati), len(set(medici_occupati)))
        print('Okay test generici')

    def test_Check_medici_non_inseribili_in_ulteriori_posizioni(self):  # TODO: Controllare bene questo
        """Controlla per ogni medico che non possa essere inserito in nessun'altra posizione"""
        med: Medico
        for med in self.data['medici']:
            sede: Sede
            for sede in self.best_sol.sedi:
                for date_turno, turno in sede.month_calendar.items():
                    if len(turno.turni_occupati) - turno.medici_per_turno > 0:
                        info = InfoCombinationTurno()
                        info.add_new_combination(sede.nome, [med])
                        res = check_if_skip([med], info, date_turno)
                        self.assertTrue(res)
        print('Okay ultimo test')

    #TODO: Aggiungere anche un test per questione mesi Javascript

if __name__ == '__main__':
    unittest.main()
