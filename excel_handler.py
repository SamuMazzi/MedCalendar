import calendar
import datetime

from openpyxl import load_workbook, Workbook
from openpyxl.styles import PatternFill, Border, Side

from models.enums import Roles, Sedi
from models.medico import Medico
from models.sede import create_calendar_turni
from models.soluzione import Soluzione


# ws.merge_cells('A2:D2')
from models.storage import Storage


def is_weekend(day: datetime.datetime):
    weekday = calendar.weekday(day.year, day.month, day.day)
    if weekday is calendar.SUNDAY or weekday is calendar.SATURDAY:
        return True
    return False


def get_color_from_role(med: Medico):
    if med.ruolo == Roles.CONVENZIONATO24:
        return PatternFill(start_color='FFb1f4ff',
                           end_color='FFb1f4ff',
                           fill_type='solid')
    elif med.ruolo == Roles.INCARICATO24 or med.ruolo == Roles.INCARICATO12:
        return PatternFill(start_color='FFccff9b',
                           end_color='FFccff9b',
                           fill_type='solid')
    elif med.ruolo == Roles.SOSTITUTO:
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

    turni = create_calendar_turni(2022, 12)
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
        incremental_pad += (sede.medici_per_turno - 1)
        count_row = 2
        for date_turno, turno in sede.month_calendar.items():
            for j in range(len(turno.turni_occupati)):
                med: Medico = turno.turni_occupati[j]
                med_cell = ws.cell(row=count_row, column=count_col + i + j)
                med_cell.value = med.nome + ' ' + med.cognome
                med_cell.fill = get_color_from_role(med)

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


def parse_ruolo(ruolo: str):
    if ruolo.startswith('TITOLARE'):
        return Roles.CONVENZIONATO24
    if ruolo.startswith('INCARICO 48'):
        return Roles.INCARICATO24
    if ruolo.startswith('INCARICO 12'):
        return Roles.INCARICATO12
    if ruolo.startswith('SOSTITUTO'):
        return Roles.SOSTITUTO


def parse_sedi(sedi: str):
    list_sedi = sedi.split(',')
    out_list = []
    for sede in list_sedi:
        if sede.strip() == 'SASSUOLO':
            out_list.append(Sedi.SASSUOLO)
        elif sede.strip() == 'FORMIGINE':
            out_list.append(Sedi.FORMIGINE)
    return out_list


def read_dati(filename: str):
    wb = load_workbook(filename)
    ws = wb.active

    medici = []

    for i in range(2, 34):
        nome = ws.cell(row=i, column=3).value
        cognome = ws.cell(row=i, column=4).value
        ruolo = parse_ruolo(ws.cell(row=i, column=5).value)
        sedi_disp = parse_sedi(ws.cell(row=i, column=6).value)

        med: Medico = Medico(i, nome, cognome, ruolo, [], sedi_disp)
        all_disp = []
        mode = 'night'
        for j in range(7, 41):
            el = ws.cell(row=i, column=j).value
            header_cell = ws.cell(row=1, column=j).value
            if type(el) is datetime.datetime:
                all_disp.append(datetime.datetime(el.year, el.month, el.day, hour=20 if mode == 'night' else 8))
            elif header_cell is not None and header_cell.startswith('INDICA UNA'):
                mode = 'day'
        med.disponibilita = all_disp
        medici.append(med)
    return medici
