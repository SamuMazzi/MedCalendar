import calendar
import datetime

from openpyxl import load_workbook, Workbook
from openpyxl.styles import PatternFill, Border, Side

from models.enums import Roles
from models.medico import Doctor
from models.soluzione import Soluzione


# ws.merge_cells('A2:D2')
from models.storage import Storage

# TODO: Il write Excel ha un bug per cui se la lista di giorni non è ordinata, ti può sbagliare posizizonam sulle righe

def is_weekend(day: datetime.datetime):
    weekday = calendar.weekday(day.year, day.month, day.day)
    if weekday is calendar.SUNDAY or weekday is calendar.SATURDAY:
        return True
    return False


def get_color_from_role(med: Doctor):
    if med.ruolo.lower() == Roles.conv24:
        return PatternFill(start_color='FFb1f4ff',
                           end_color='FFb1f4ff',
                           fill_type='solid')
    elif med.ruolo.lower() == Roles.inc24 or med.ruolo == Roles.inc12:
        return PatternFill(start_color='FFccff9b',
                           end_color='FFccff9b',
                           fill_type='solid')
    elif med.ruolo.lower() == Roles.sost:
        return PatternFill(start_color='FFffd07d',
                           end_color='FFffd07d',
                           fill_type='solid')


def write_soluzione(sol: Soluzione, filename: str):
    wb = Workbook()  # wb = load_workbook("excel.xlsx")
    ws = wb.create_sheet('Programmazione turni')
    wb.remove_sheet(wb.worksheets[0])  # Togli quello di default
    date_border = Border(right=Side(border_style="double", color='FF000000'))
    red_fill = PatternFill(start_color='FFfb5959',
                           end_color='FFfb5959',
                           fill_type='solid')

    turni = Storage.calendar_turni  # create_calendar_turni(2022, 12)
    for i in range(len(turni)):
        ws.cell(row=i + 2, column=1).value = str(turni[i])
        cell = ws.cell(row=i + 2, column=1)
        cell.border = date_border
        if is_weekend(turni[i]):
            cell.fill = red_fill

    incremental_pad = 0
    count_col = 2
    count_row = 2
    for i in range(len(sol.sedi)):
        sede = sol.sedi[i]
        ws.cell(row=1, column=2 + i + incremental_pad).value = str(sede.nome)
        incremental_pad += (sede.doctors_for_shift - 1)
        count_row = 2
        for date_turno, turno in sede.month_calendar.items():
            for j in range(len(turno.turni_occupati)):
                med: Doctor = turno.turni_occupati[j]
                med_cell = ws.cell(row=count_row, column=count_col + i + j)
                med_cell.value = med.nome
                # med_cell.fill = get_color_from_role(med)
                # A causa di un bug della libreria non si può più colorare

            count_row += 1
        count_col += 1

    turni_cell = ws.cell(row=count_row + 1, column=1)
    turni_cell.value = 'N° turni occupati'
    turni_cell = ws.cell(row=count_row + 1, column=2)
    turni_cell.value = sol.turni_occupati

    turni_cell = ws.cell(row=count_row + 2, column=1)
    turni_cell.value = 'N° turni totali'
    turni_cell = ws.cell(row=count_row + 2, column=2)
    turni_cell.value = Storage.tot_turni

    turni_cell = ws.cell(row=count_row + 3, column=1)
    turni_cell.value = 'N° turni non riempibili'
    turni_cell = ws.cell(row=count_row + 3, column=2)
    turni_cell.value = Storage.turni_non_riempibili

    turni_cell = ws.cell(row=count_row + 4, column=1)
    turni_cell.value = 'N° turni posizionabili'
    turni_cell = ws.cell(row=count_row + 4, column=2)
    turni_cell.value = Storage.tot_turni - Storage.tot_turni_occ_a_priori

    wb.save(filename + '.xlsx')
    print('Soluzione salvata sul file:', filename)


def parse_ruolo(ruolo: str):
    if ruolo.startswith('TITOLARE'):
        return Roles.conv24
    if ruolo.startswith('INCARICO 48'):
        return Roles.inc24
    if ruolo.startswith('INCARICO 24'):
        return Roles.inc24
    if ruolo.startswith('INCARICO 12'):
        return Roles.inc12
    if ruolo.startswith('SOSTITUTO'):
        return Roles.sost


def parse_sedi(sedi: str):
    list_sedi = sedi.split(',')
    out_list = []
    for sede in list_sedi:
        if sede.strip().lower() == 'sassuolo':  # TODO Must be dynamic
            out_list.append('sassuolo')
        elif sede.strip().lower() == 'formigine':
            out_list.append('formigine')
    return out_list


def read_dati(filename: str):
    wb = load_workbook(filename)
    ws = wb.active
    if ws is None:
        print("Errore nel caricamento del file")
        return

    medici = []
    for i in range(2, 1000):  # iterate over medici
        nome = ws.cell(row=i, column=2).value
        if nome is None:
            break
        cognome = ws.cell(row=i, column=3).value
        cell_role = ws.cell(row=i, column=4).value
        assert isinstance(cell_role, str)
        ruolo = parse_ruolo(cell_role)
        assert ruolo is not None
        max_shifts = ws.cell(row=i, column=6).value
        assert isinstance(max_shifts, int)
        cell_locations = ws.cell(row=i, column=7).value
        assert isinstance(cell_locations, str)
        sedi_disp = parse_sedi(cell_locations)

        assert isinstance(nome, str)
        assert isinstance(cognome, str)

        med: Doctor = Doctor(str(i), f"{nome} {cognome}", ruolo, [], sedi_disp, n_shifts_max=max_shifts)
        all_disp = []
        mode = 'night'
        for j in range(8, 47):
            el = ws.cell(row=i, column=j).value
            header_cell = ws.cell(row=1, column=j).value
            if isinstance(el, datetime.datetime):
                all_disp.append(datetime.datetime(el.year, el.month, el.day, hour=20 if mode == 'night' else 8,
                                                  minute=8 if mode == 'night' else 20))  # debug
            elif header_cell is not None and isinstance(header_cell, str) and header_cell.startswith('INDICA UNA'):
                mode = 'day'
        med.disponibilita = all_disp
        medici.append(med)
    return medici
