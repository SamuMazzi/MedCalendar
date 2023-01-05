from typing import List

from models.enums import *
from models.find_solution import FindSolution
from models.medico import Medico, real_update_sodd
from models.sede import Sede
from models.soluzione import Soluzione
from models.storage import Storage, init_storage, get_turni_effettivi
from models.turno import Turno

# TODO calcolo a priori se può esistere una soluzione ottimale
# TODO Implementare seconda passata che riempe i buchi vuoti anche sforando il numero di turni per medico
from utilities import is_medico_in_24_ore_prec_o_succ


def delete_turni_vuoti():
    turni_vuoti = {}
    for sede in Storage.sedi:
        delete_list = []
        for turno in sede.month_calendar.keys():
            if len(sede.get_medici_disp_per_turno(turno)) == 0:
                delete_list.append(turno)
                turni_vuoti[turno] = 1 if turni_vuoti.get(turno) is None else turni_vuoti.get(turno) + 1
        for key in delete_list:
            del sede.month_calendar[key]

    for turno, count in turni_vuoti.items():
        if count == len(Storage.sedi):
            Storage.calendar_turni.remove(turno)


def set_medici_disponibili():
    for sede in Storage.sedi:
        Sede.tot_medici_per_turno += sede.medici_per_turno
        sede.set_medici_disponibili_per_mese_curr(Storage.all_medici)


def set_default_medici():  # TODO: Aggiungere controllo massimo numero (turni?) per persona (?)
    turni_posizionati_a_prescindere = 0
    sodd = [0, 0, 0]
    for turno in Storage.calendar_turni:
        sedi_turni_liberi_per_turno = {}
        medici_gia_occupati_per_turno = []
        for i in range(len(Storage.sedi)):
            for sede in Storage.sedi:
                medici_disp = list(
                    filter(lambda med: med not in medici_gia_occupati_per_turno, sede.get_medici_disp_per_turno(turno)))
                medici_disp = list(filter(lambda med: not is_medico_in_24_ore_prec_o_succ([med], turno), medici_disp))

                # Setta medici obbligati
                if 0 < len(medici_disp) <= sede.medici_per_turno:
                    for med in medici_disp:
                        turni_posizionati_a_prescindere += setta_single_default_medico(med, sede, turno, sodd)
                    medici_gia_occupati_per_turno.extend(medici_disp)
                    sedi_turni_liberi_per_turno[sede.nome] = []
                else:
                    sedi_turni_liberi_per_turno[sede.nome] = medici_disp
        # Setta medici se il numero complessivo di questi è == fra tutte le sedi
        # e <= al numero di turni totale per quel giorno, fra le sedi
        # Se, in quel giorno, tutti possono in tutte le sedi
        # non verranno settati con l'algoritmo di prima, ma con questo si
        if len(sedi_turni_liberi_per_turno.keys()) == len(Storage.sedi) and sedi_hanno_stessi_medici_liberi_per_turno(
                sedi_turni_liberi_per_turno):
            turni_posizionati_a_prescindere += setta_default_medici_in_un_turno_fra_le_sedi(sedi_turni_liberi_per_turno,
                                                                                            turno, sodd)
    return sodd, turni_posizionati_a_prescindere


def setta_single_default_medico(med, sede, turno, sodd):
    sede.set_medico(med, turno)
    real_update_sodd(med, 'add', sodd)
    return 1


def setta_default_medici_in_un_turno_fra_le_sedi(sedi_turni_liberi_per_turno, turno, sodd):
    turni_posizionati_a_prescindere = 0
    medici_disp_per_sede = sedi_turni_liberi_per_turno.values()
    medici_disp = list(medici_disp_per_sede)[0]  # Prendo la prima lista, tanto sono tutte uguali
    i = 0
    for sede in Storage.sedi:
        for j in range(sede.medici_per_turno):
            if i >= len(medici_disp):
                break
            turni_posizionati_a_prescindere += setta_single_default_medico(medici_disp[i], sede, turno, sodd)
            i += 1
    return turni_posizionati_a_prescindere


def sedi_hanno_stessi_medici_liberi_per_turno(medici_per_turno_per_sede: dict):
    """Per ora controlla solo che il numero di medici totale liberi per quel turno sia minore o uguale al numero
    massimo, nel caso li posiziona, in futuro si può pensare di ampliarlo per fare in modo che possa prenderne
    solo una sotto-porzione"""
    num_medici_disp_in_sede = [len(x) for x in medici_per_turno_per_sede.values()]
    if len(num_medici_disp_in_sede) == 0 or max(num_medici_disp_in_sede) > Sede.tot_medici_per_turno:
        return False
    for medici_per_turno in medici_per_turno_per_sede.values():
        for medici_per_turno2 in medici_per_turno_per_sede.values():
            medici_per_turno.sort()
            medici_per_turno2.sort()
            if medici_per_turno != medici_per_turno2:
                return False
    return True


class MainHandler:
    def setup(self):
        set_medici_disponibili()
        delete_turni_vuoti()
        # TODO: tot_turni non tiene conto delle festività "speciali" di ogni particolare sede
        sodd, turni_posizionati_a_prescindere = set_default_medici()
        Storage.tot_turni = get_turni_effettivi()
        tmp_sol = Soluzione(inc_sodd=sodd[1], conv_sodd=sodd[0], doc_sodd=sodd[2],
                            turni_occupati=turni_posizionati_a_prescindere)
        self.find_sol = FindSolution(Storage.all_medici, sol=tmp_sol)
        return self.find_sol

    def update_with_new_docs(self, list_docs: List[Medico]):
        for sede in Storage.sedi:
            sede.clear_medici_disponibili()
            sede.set_medici_disponibili_per_mese_curr(list_docs)

        self.find_sol.medici = list_docs


def copy_sol_in_new_sedi(best_sol):  # Non dovrebbe servire ma a causa di un bug è cosi
    for best_sede in best_sol.sedi:
        for sede in Storage.sedi:
            if sede.nome == best_sede.nome:
                meds: Turno
                for turno, meds in best_sede.month_calendar.items():
                    if len(best_sede.month_calendar[turno].turni_occupati) > 0:
                        sede.month_calendar[turno].turni_occupati = meds.turni_occupati


def handle_new_round(main_handler, best_sol, medici):
    best_sol.reset_best_sol_found()
    best_sol.reset_sol_found()
    if best_sol.turni_occupati == Storage.tot_turni:
        return True

    main_handler.update_with_new_docs(medici)
    copy_sol_in_new_sedi(best_sol)
    return False


def filter_by_role(list_medici: List[Medico], roles: list):
    return [med for med in list_medici if med.ruolo in roles]


def start(data):
    data['month'] = data['month'] + 1  # Per questioni di compatibilità con JS
    init_storage(data)
    main_handler = MainHandler()
    main_handler.setup()
    medici_conv = filter_by_role(Storage.all_medici, [Roles.conv24])
    medici_inc = filter_by_role(Storage.all_medici, [Roles.inc24, Roles.inc12])
    medici_sost = filter_by_role(Storage.all_medici, [Roles.sost])
    best_sol = main_handler.find_sol.sol
    type_medici = [medici_conv, medici_inc, medici_sost]
    mode_medici = ['convenzionati', 'incaricati', 'normale']
    for i in range(len(type_medici)):
        handle_new_round(main_handler, best_sol, type_medici[i])
        if len(type_medici[i]) != 0:
            main_handler.find_sol.recursive_fn(0, mode_medici[i], best_sol.turni_occupati,
                                               doc_sodd=best_sol.medici_soddisfatti,
                                               conv_sodd=best_sol.convenzionati_soddisfatti,
                                               inc_sodd=best_sol.incaricati_soddisfatti)

    return best_sol
