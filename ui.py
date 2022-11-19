import datetime
from tkinter import *
from tkcalendar import Calendar

from models.sede import Sede
from models.soluzione import Soluzione


def show_UI(final_sol: Soluzione):
    # Create The Gui Object
    tk = Tk(screenName='Programmazione turni GM')
    # Set the geometry of the GUI Interface
    tk.geometry("900x700")

    sede: Sede = final_sol.sedi[0]
    first_day_turn: datetime.datetime = list(sede.month_calendar.keys())[0]
    cal = Calendar(tk, selectmode='day',
                   year=first_day_turn.year, month=first_day_turn.month, day=first_day_turn.day)  # locale='it_IT'
    for sede in final_sol.sedi:
        for date_turno, turno in sede.month_calendar.items():
            cal.calevent_create(date_turno,
                                'Sede: ' + str(sede.nome) + ', ore: ' + str(date_turno.hour) + ', medici: ' + str(
                                    turno.turni_occupati), 'message')
            # print(cal.get_calevents(date_turno))

    cal.tag_config('message', background='green', foreground='white')

    cal.bind("<<CalendarSelected>>", lambda event: print(cal.parse_date(cal.get_date())))
    cal.pack(pady=20, fill="both", expand=True)


    def grad_date():
        txt = ''
        sede: Sede
        for sede in final_sol.sedi:
            meds = sede.get_medici_occupati_per_turno(
                datetime.datetime.combine(cal.parse_date(cal.get_date()), datetime.time(hour=8)))
            txt += 'Sede ' + sede.nome.name + '\tOrario: ' + str(8) + '\t Medici: ' + str(meds) + '\n'
        date.config(text="Selected Date is: " + cal.get_date() + '\n' + txt)

    # Adding the Button and Label
    Button(tk, text="Get Date", command=grad_date).pack(pady=20)

    date = Label(tk, text="")
    date.pack(pady=15)

    # Execute Tkinter
    tk.mainloop()