import flask
import json
import jsonpickle
import functions_framework
from marshmallow import ValidationError

from models.medico import Doctor
from schema import DataRequestSchema
from excel_handler import write_soluzione
from models.sede import Sede
from models.soluzione import Soluzione
from models.storage import Storage
from scheduler import start

"""
DOCUMENTAZIONE:
Javascript handle month starting from 0 to 11, Python goes from 1 to 12, so Python will have to adapt to JS
"""

"""
functions-framework --target schedule_from_data --debug
https://europe-west1-programmazione-turni-gm.cloudfunctions.net/schedule_from_data
gcloud functions deploy schedule_from_data --region europe-west1 --allow-unauthenticated --memory 128MB --runtime python310 --timeout 90 --min-instances 0 --max-instances 1 --trigger-http 
--service-account hello-world-function-sa@for-developers-343319.iam.gserviceaccount.com

gcloud functions deploy schedule_from_data --runtime python310 --region europe-west1 --trigger-http --allow-unauthenticated --memory 128MB
"""

# TODO: Bug: -> Non vengono settati alcuni medici che potrebbero andare (aprile 23, giorno 30)
# TODO: Su client, l'excel non mostra le disponibilità giuste ma solo i giorni in cui i medici sono occupati

def handle_options_request():
    # Allows GET requests from any origin with the Content-Type
    # header and caches preflight response for an 3600s
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '3600'
    }
    res = flask.make_response('', 204)
    for key in headers:
        res.headers[key] = headers[key]
    return res


@functions_framework.http
def schedule_from_data(request: flask.Request):
    """Responds to any HTTP request.
    Args:
        request (flask.Request): HTTP request object.
    Returns:
        The response text or any set of values that can be turned into a
        Response object using
        `make_response <http://flask.pocoo.org/docs/1.0/api/#flask.Flask.make_response>`.
    """
    # Set CORS headers for the preflight request
    if request.method == 'OPTIONS':
        return handle_options_request()
    headers = {
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Origin': '*'
    }

    try:
        res_check = check_request(request)
        if res_check:
            return res_check
        assert request.json is not None
        data_request = DataRequestSchema().load(request.json)
        response = execute_schedule(data_request)
        res = flask.make_response(response[0], response[1])
        for key in headers:
            res.headers[key] = headers[key]
        return res
    except ValidationError as error:
        res = flask.make_response({'message': error.normalized_messages()}, 422)
        for key in headers:  # ?
            res.headers[key] = headers[key]
        return res
    except Exception as error:
        print(error)
        res = flask.make_response({'message': 'Internal error'}, 500)
        for key in headers:
            res.headers[key] = headers[key]
        return res


def check_request(request: flask.Request):
    if request.method != 'POST':
        return "Method not allowed", 405

    if not request.is_json:
        return {'message': "No JSON attached"}, 400

    if request.json is not None and len(request.json) <= 0:
        return {'message': "No JSON data found"}, 404

    return None

def parse_doctors_from_request(data_medici: list, year: int, month: int):
    medici = [Doctor.from_request(medico, year, month) for medico in data_medici]
    return medici


def execute_schedule(real_data: dict):
    real_data['month'] += 1  # compatibilità con JS
    real_data['doctors'] = parse_doctors_from_request(real_data['doctors'], real_data['year'], real_data['month'])

    sol = start(real_data)
    if len(Storage.calendar_turni) == 0:
        return {'message': 'Inserito dati sbagliati'}, 404, None
    string_sol = create_solution_response(sol)
    return string_sol, 200, sol  # L'ultimo parametro è per scopi di test


# Il client che chiama la funzione scarica dal database i dati di tutti i medici, li invia all'API
# Poi sempre con quei dati può fare sostituzioni, cosi si evita un doppio download dei dati
# TODO Valutare di togliere medici per turno e data dall'oggetto Turno, sono ridondanti (magari si può aggiungere un riferimento alla classe Sede appartenente)


def create_solution_response(sol: Soluzione):
    format_turno = "%dT%H:%M:%S"
    data_out = {
        'locations': {},
        'doctors': {},
        'busy_shifts': sol.turni_occupati,
        'tot_shifts': Storage.tot_turni,
        'non_fillable_shifts': Storage.turni_non_riempibili,
        'placeable_shifts': Storage.tot_turni - Storage.tot_turni_occ_a_priori,
        'year': Storage.calendar_turni[0].year,
        'month': Storage.calendar_turni[0].month - 1  # Per questioni di compatibilità con JS
    }
    data_out_sedi = data_out['locations']
    sede: Sede
    for sede in sol.sedi:
        data_out_sedi[sede.nome] = {
            'shifts': {},
            'doctors_for_shift': sede.doctors_for_shift
        }
        for day, shift in sede.month_calendar.items():
            data_out_sedi[sede.nome]['shifts'][day.strftime(format_turno)] = [med.uid for med in shift.turni_occupati]

    for med in Storage.original_all_medici:
        uid_med = med.uid
        tmp_dict = {k: v for k, v in med.__dict__.items() if k != 'uid'}
        tmp_dict['availability'] = [turno.strftime(format_turno) for turno in tmp_dict['availability']]
        data_out['doctors'][uid_med] = tmp_dict

    return jsonpickle.encode(data_out, unpicklable=False)

if __name__ == '__main__':
    with open('test/test_data.json') as f:
        data = json.load(f)
        data['month'] += 1 # compatibilità JS
        final_sol = start(data)
        a = create_solution_response(final_sol)
        # print(a)
        # print(json.dumps(a))
        write_soluzione(final_sol, "programmazione_feb_23")
        exit(0)
