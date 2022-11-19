import copy
import datetime
from typing import List

from excel_handler import write_soluzione, read_dati
from mock_medici import create_mock_medici
from models.enums import *
from models.find_solution import FindSolution
from models.medico import Medico, real_update_sodd
from models.sede import Sede, create_calendar_turni
from models.soluzione import Soluzione
from models.storage import Storage, init_storage, get_turni_effettivi
from models.turno import Turno
from ui import show_UI


# TODO calcolo a priori se può esistere una soluzione ottimale
# TODO Calcolare un punteggio per ogni ruolo, e ogni turno aumenta il punteggio, tipo:
# Ogni turno per ruolo da 1/<Ore totali per ruolo> punti


def start():
    calendar_turni = create_calendar_turni(2022, 11)
    n_medici_necessari_tot_al_turno = 0
    all_medici = create_mock_medici(70)
    sedi = []
    s1 = Sede(Sedi.VIGNOLA, 2, copy.deepcopy(calendar_turni))
    s2 = Sede(Sedi.RUBBIERA, 1, copy.deepcopy(calendar_turni))
    s3 = Sede(Sedi.FORMIGINE, 1, copy.deepcopy(calendar_turni))
    s4 = Sede(Sedi.SASSUOLO, 2, copy.deepcopy(calendar_turni))
    sedi.extend([s1, s2, s3, s4])
    for sede in sedi:
        Sede.tot_medici_per_turno += sede.medici_per_turno

    medici_conv = list(filter(lambda med: med.ruolo == Roles.CONVENZIONATO24, all_medici))
    for sede in sedi:
        sede.set_medici_disponibili_per_mese_curr(medici_conv)
        n_medici_necessari_tot_al_turno += sede.medici_per_turno  # TODO: tot_turni non tiene conto delle festività "speciali" di ogni particolare sede
    find_soluzione = FindSolution(medici_conv, calendar_turni)
    best_sol = find_soluzione.sol
    find_soluzione.recursive_fn_convenzionati(0, best_sol.turni_occupati, best_sol.convenzionati_soddisfatti)
    best_sol.reset_best_sol_found()
    if is_calendar_full_for_sedi():
        return best_sol

    medici_inc = list(
        filter(lambda med: med.ruolo == Roles.INCARICATO12 or med.ruolo == Roles.INCARICATO24, all_medici))
    for sede in sedi:
        sede.clear_medici_disponibili()
        sede.set_medici_disponibili_per_mese_curr(medici_inc)
    find_soluzione.medici = medici_inc
    find_soluzione.recursive_fn_incaricati(0, best_sol.turni_occupati, best_sol.incaricati_soddisfatti)
    best_sol.reset_best_sol_found()
    if is_calendar_full_for_sedi():  # TODO Si può sostituire con turni_occupati == sol.turni_da_occupare (tipo)
        return best_sol

    medici_sost = list(
        filter(lambda med: med.ruolo != Roles.INCARICATO12 and med.ruolo != Roles.INCARICATO24, all_medici))
    medici_sost = list(filter(lambda med: med.ruolo != Roles.CONVENZIONATO24, medici_sost))
    for sede in sedi:
        sede.clear_medici_disponibili()
        sede.set_medici_disponibili_per_mese_curr(medici_sost)

    find_soluzione.medici = medici_sost
    find_soluzione.recursive_fn(0, best_sol.turni_occupati, best_sol.medici_soddisfatti,
                                best_sol.convenzionati_soddisfatti,
                                best_sol.incaricati_soddisfatti)
    return best_sol


def check_if_med_gia_occupato_in_sedi(med: Medico, turno: datetime.datetime):
    for sede1 in Storage.sedi:
        if med in sede1.get_medici_occupati_per_turno(turno):
            return True
    return False


def delete_turni_vuoti():
    turni_vuoti = {}
    for sede in Storage.sedi:
        delete_list = []
        for turno in sede.month_calendar.keys():
            if len(sede.get_medici_disp_per_turno(turno)) == 0:
                delete_list.append(turno)
                turni_vuoti[turno] = 1 if turni_vuoti[turno] is None else turni_vuoti[turno] + 1
        # TODO: Gestire poi comportamento nelle fn (forse già fatto)
        for key in delete_list:
            del sede.month_calendar[key]

    for turno, count in turni_vuoti.items():
        if count == len(Storage.sedi):
            Storage.calendar_turni.remove(turno)


def set_medici_disponibili():
    for sede in Storage.sedi:
        Sede.tot_medici_per_turno += sede.medici_per_turno
        sede.set_medici_disponibili_per_mese_curr(Storage.all_medici)


def set_default_medici():  # TODO: Aggiungere controllo su 12 ore precedenti, (e massimo numero per persona (?))
    turni_posizionati_a_prescindere = 0
    sodd = [0, 0, 0]
    """for sede in Storage.sedi:
        for turno in sede.month_calendar.keys():
            med_disp = sede.get_medici_disp_per_turno(turno)
            # Setta medici obbligati
            if 0 < len(med_disp) <= sede.medici_per_turno:
                for med in med_disp:
                    if not check_if_med_gia_occupato_in_sedi(med, turno):
                        sede.set_medico(med, turno)
                        turni_posizionati_a_prescindere += 1
                        real_update_sodd(med, 'add', sodd)"""
    # TODO: In entrambe le versioni -> e se su 3 persone in 2 sedi da 2, 1 si occupa nella seconda sede? L'altra potrebbe essere occupata
    for turno in Storage.calendar_turni:
        sedi_turni_liberi_per_turno = {}
        medici_gia_occupati_per_turno = []
        for sede in Storage.sedi:
            medici_disp = list(filter(lambda med: med not in medici_gia_occupati_per_turno, sede.get_medici_disp_per_turno(turno)))
            # TODO: Miglioramento futuro se su 3 persone 2 possono in 2 sedi e l'altra solo in 1, conviene mettere quell'una dove può e le altre dove vogliono
            # Setta medici obbligati
            if 0 < len(medici_disp) <= sede.medici_per_turno:
                for med in medici_disp:  # TODO: Attenzione, Giancola è in 5 turni e al massimo può in 4. Probabilmente sono oggetti diversi e non contano soddisfazioni precedenti
                    sede.set_medico(med, turno)
                    turni_posizionati_a_prescindere += 1
                    real_update_sodd(med, 'add', sodd)
                    medici_gia_occupati_per_turno.append(med)
            else:
                sedi_turni_liberi_per_turno[sede.nome] = medici_disp
        if len(sedi_turni_liberi_per_turno.keys()) == len(Storage.sedi) and sedi_hanno_stessi_medici_liberi_per_turno(sedi_turni_liberi_per_turno):
            medici_disp_per_sede = sedi_turni_liberi_per_turno.values()
            medici_disp = list(medici_disp_per_sede)[0]  # Prendo la prima lista, tanto sono tutte uguali
            i = 0
            for sede in Storage.sedi:
                for j in range(sede.medici_per_turno):
                    if i >= len(medici_disp):
                        break
                    med = medici_disp[i]
                    sede.set_medico(med, turno)
                    turni_posizionati_a_prescindere += 1
                    real_update_sodd(med, 'add', sodd)
                    i += 1
    return sodd, turni_posizionati_a_prescindere

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


def handle_new_round(main_handler, best_sol, medici):  # TODO: Cambia nome
    best_sol.reset_best_sol_found()
    if best_sol.turni_occupati == Storage.tot_turni:
        return True

    main_handler.update_with_new_docs(medici)
    copy_sol_in_new_sedi(best_sol)
    return False


def start_test():
    all_medici = read_dati('input.xlsx')
    init_storage(all_medici, 2022, 12)
    main_handler = MainHandler()
    main_handler.setup()
    medici_conv = list(filter(lambda med: med.ruolo == Roles.CONVENZIONATO24, Storage.all_medici))
    medici_inc = list(
        filter(lambda med: med.ruolo == Roles.INCARICATO12 or med.ruolo == Roles.INCARICATO24, Storage.all_medici))
    medici_sost = list(filter(lambda med: med.ruolo == Roles.SOSTITUTO, Storage.all_medici))
    best_sol = main_handler.find_sol.sol
    type_medici = [medici_conv, medici_inc, medici_sost]
    mode_medici = ['convenzionati', 'incaricati', 'normale']
    for i in range(len(type_medici)):
        handle_new_round(main_handler, best_sol, type_medici[i])
        main_handler.find_sol.recursive_fn(0, mode_medici[i], best_sol.turni_occupati, best_sol.medici_soddisfatti,
                                           best_sol.convenzionati_soddisfatti, best_sol.incaricati_soddisfatti)

    return best_sol


"""
handle_new_round(main_handler, best_sol, medici_conv)
main_handler.find_sol.recursive_fn_convenzionati(0, best_sol.turni_occupati, best_sol.convenzionati_soddisfatti)
handle_new_round(main_handler, best_sol, medici_inc)
main_handler.find_sol.recursive_fn_incaricati(0, best_sol.turni_occupati, best_sol.incaricati_soddisfatti)
handle_new_round(main_handler, best_sol, medici_sost)
main_handler.find_sol.recursive_fn(0, 'normale', best_sol.turni_occupati, best_sol.medici_soddisfatti,
                                   best_sol.convenzionati_soddisfatti,
                                   best_sol.incaricati_soddisfatti)"""

final_sol = start_test()
print(final_sol)
write_soluzione(final_sol, "programmazione")
show_UI(final_sol)
