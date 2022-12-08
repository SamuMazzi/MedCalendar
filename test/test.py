import copy
import unittest

from main import start
from models.medico import Medico, get_n_turni_per_ruolo


class TestFindSoluzione(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.best_sol = start()
        cls.conteggio_turni_per_medico = {}
        cls.month_calendar = {}

    def setup_turni_generali(self):
        """Deve essere il primo metodo della classe"""
        for sede in self.best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():
                if date_day in self.month_calendar:
                    self.month_calendar[date_day].extend(turno.turni_occupati)
                else:
                    self.month_calendar[date_day] = copy.deepcopy(turno.turni_occupati)

    def medici_sono_nella_loro_sede(self):
        for sede in self.best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():
                for med in turno.turni_occupati:
                    self.assertIn(turno.data, med.disponibilita)
                    self.assertIn(sede.nome, med.sedi, msg=str(med) + ' ha le seguenti sedi: ' + str(med.sedi))

    def medici_non_fanno_piu_ore_del_previsto(self):
        for medici_occupati in self.month_calendar.values():
            for med in medici_occupati:
                if med not in self.conteggio_turni_per_medico:
                    self.conteggio_turni_per_medico[med] = 0
                else:
                    self.conteggio_turni_per_medico[med] += 1

        med: Medico
        for med, num_turni in self.conteggio_turni_per_medico.items():
            self.assertGreaterEqual(get_n_turni_per_ruolo(med.ruolo), num_turni)

    def test_generici(self):
        self.assertGreaterEqual(self.best_sol.medici_soddisfatti, self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti)
        # self.assertEqual(self.best_sol.medici_soddisfatti, self.best_sol.convenzionati_soddisfatti + self.best_sol.incaricati_soddisfatti + self.best_sol.sostituti_soddisfatti)

        for medici_occupati in self.month_calendar.values():
            self.assertEqual(len(medici_occupati), len(set(medici_occupati)))


if __name__ == '__main__':
    unittest.main()
