import copy
import datetime
from typing import List

from models.enums import Roles
from models.medico import Medico
from models.sede import Sede, create_calendar_turni_from_data, parse_turno, create_calendar_turni


def print_statistics_pre_start():
    print('Ci sono ' + str(Storage.convenzionati_da_soddisfare) + ' convenzionati')
    print('Ci sono ' + str(Storage.incaricati_da_soddisfare) + ' incaricati')
    print('Ci sono ' + str(len(Storage.all_medici) - Storage.convenzionati_da_soddisfare - Storage.incaricati_da_soddisfare) + ' sostituti')


def calculate_how_may_doctors_da_soddisfare(all_medici: List[Medico]):
    for med in all_medici:
        if med.ruolo == Roles.conv24:
            Storage.convenzionati_da_soddisfare += 1
        elif med.ruolo == Roles.inc12 or med.ruolo == Roles.inc24:
            Storage.incaricati_da_soddisfare += 1
    print_statistics_pre_start()


def get_turni_effettivi():
    """Tiene in conto anche le ore che non possono essere riempite"""
    tot_turni = 0  # non riempiti a priori
    Storage.tot_turni_occ_a_priori = 0
    # Storage.turni_non_riempibili = 0
    i = 0
    for turno in Storage.calendar_turni:
        i += 1
        medici_liberi_turno = []
        medici_occ_in_sedi = []
        for sede in Storage.sedi:
            medici_occ_in_sedi.extend(sede.get_medici_occupati_per_turno(turno))
        for sede in Storage.sedi:
            turni_occ = sede.get_medici_occupati_per_turno(turno)
            medici_liberi = list(filter(lambda med: med not in medici_liberi_turno and med not in medici_occ_in_sedi, sede.get_medici_disp_per_turno(turno)))
            if len(turni_occ) > 0:
                for med in turni_occ:
                    medici_liberi_turno.append(med)
                Storage.tot_turni_occ_a_priori += len(turni_occ)
                continue
            if len(medici_liberi) == 0:
                continue
            elif len(medici_liberi) + len(turni_occ) <= sede.medici_per_turno:
                tot_turni += sede.medici_per_turno + len(medici_liberi) - len(turni_occ)  # da testare con 18 dic-20:00
                continue  # TODO: Da capire bene questo if
            else:
                tot_turni += sede.medici_per_turno
        Storage.turni_non_riempibili = (i*4) - (tot_turni + Storage.tot_turni_occ_a_priori)  # hardcode del 4, debug

    turni_riempibili_e_riempiti = tot_turni + Storage.tot_turni_occ_a_priori
    return turni_riempibili_e_riempiti


def translate_turni(disp, year, month):
    out = []
    for fascia, giorni in disp.items():
        for day in giorni:
            d = datetime.datetime(year, month, day)
            out.append(parse_turno(d, fascia))
    return out


def init_storage(data):
    sedi = []
    total_calendar_turni = []
    for sede in data['sedi']:
        if 'fasce_turno' in sede:
            calendar_sede = create_calendar_turni_from_data(data['year'], data['month'], sede['fasce_turno'])
        else:
            calendar_sede = create_calendar_turni(data['year'], data['month'])
        s = Sede(sede['nome'], sede['medici_per_turno'], calendar_sede)
        sedi.append(s)
        total_calendar_turni.extend([turno for turno in calendar_sede if turno not in total_calendar_turni])
    Storage.calendar_turni = list(set(list(total_calendar_turni)))  # Lista con tutti i turni, ripetuti solo una volta
    if isinstance(data['medici'][0], Medico):  # debug
        all_medici = data['medici']
    else:
        all_medici = [Medico(info['id'], info['nome'], info['ruolo'], translate_turni(info['disponibilita'], data['year'], data['month']), info['sedi']) for info in data['medici']]
    Storage.calendar_turni = total_calendar_turni
    Storage.all_medici = all_medici
    Storage.original_all_medici = copy.deepcopy(all_medici)
    Storage.sedi = sedi
    calculate_how_may_doctors_da_soddisfare(Storage.all_medici)
# Storage.tot_turni = get_turni_effettivi() se lo lasci qua prima devi effettivamente settare i medici a prescindere!


class Storage:
    calendar_turni: List[datetime.datetime] = []
    all_medici: List[Medico] = []
    original_all_medici: List[Medico] = []  # Non saranno intaccati dalle modifiche durante il processo
    sedi: List[Sede] = []
    convenzionati_da_soddisfare = 0
    incaricati_da_soddisfare = 0
    tot_turni = 0
    turni_non_riempibili = 0
    tot_turni_occ_a_priori = 0
