import unittest

from main import start
from models.medico import Medico, get_n_turni_per_ruolo


class TestFindSoluzione(unittest.TestCase):
    def test_soluzione(self):
        best_sol = start()
        self.assertGreaterEqual(best_sol.medici_soddisfatti, best_sol.convenzionati_soddisfatti + best_sol.incaricati_da_soddisfare)
        self.assertEqual(best_sol.medici_soddisfatti, best_sol.convenzionati_soddisfatti + best_sol.incaricati_da_soddisfare + best_sol.sostituti_soddisfatti)
        self.conteggio_turni_per_medico = {}
        self.month_calendar = {}
        for sede in best_sol.sedi:
            for date_day, turno in sede.month_calendar.items():
                if date_day in self.month_calendar:
                    self.month_calendar[date_day].extend(turno.turni_occupati)
                else:
                    self.month_calendar[date_day] = turno.turni_occupati

        for medici_occupati in self.month_calendar.values():
            self.assertEquals(len(medici_occupati), len(set(medici_occupati)))

        # Testa che nessun medico faccia più ore di quelle che dovrebbe
        for medici_occupati in self.month_calendar.values():
            for med in medici_occupati:
                prec_value = self.conteggio_turni_per_medico.get(med) if self.conteggio_turni_per_medico[med] is not None else 0
                self.conteggio_turni_per_medico[med] = prec_value + 1
        med: Medico
        for med, num_turni in self.conteggio_turni_per_medico.items():
            self.assertGreaterEqual(get_n_turni_per_ruolo(med.ruolo), num_turni)

        # TODO: Testare che effettivamente siano stati rispettati i turni


if __name__ == '__main__':
    unittest.main()