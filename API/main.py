import datetime

import flask
import jsonpickle
import functions_framework

from excel_handler import write_soluzione, read_dati
from models.medico import get_n_turni_per_ruolo, Medico
from models.sede import Sede, parse_turno
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
gcloud functions deploy schedule_from_data --runtime python310 --region europe-west1 --trigger-http --allow-unauthenticated
"""

"""
Prossimi step:
 - 1. Sistema cambio turni (colore rosso nei festivi)
2. Creazione turni a partire da Excel (React)
 () 3. Sistemare Python per fargli provare qualche combinazione in più
 - 4. Deploy API
"""


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
def schedule_from_data(request: flask.request):
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
        response = execute_schedule(request)
        res = flask.make_response(response[0], response[1])
        for key in headers:
            res.headers[key] = headers[key]
        return res
    except Exception as error:
        print(error)
        res = flask.make_response({'message': 'Errore interno'}, 500)
        for key in headers:
            res.headers[key] = headers[key]
        return res


DEBUG_MODE = False


def check_request(request: flask.request):
    if request.method != 'POST':
        return "Method not allowed", 405

    if not request.is_json:
        return {'message': "No JSON attached"}, 400

    if len(request.json) <= 0:
        return {'message': "Inserisci dei dati"}, 404
    real_data = request.json

    if 'year' not in real_data or 'month' not in real_data or 'sedi' not in real_data or 'medici' not in real_data:
        return {'message': "Dati male formattati"}, 400
    for med in real_data['medici']:
        if type(med['disponibilita']) != dict:
            return {'message': "Dati male formattati"}, 400

    return None


def parse_medici_from_response(data_medici: list, year: int, month: int):
    medici = []  # TODO: In initSetup c'è una funzione che fa praticamente la stessa cosa
    for medico in data_medici:  # iterate over medici
        try:
            nome = medico['nome']
            ruolo = medico['ruolo']
            turni_max = medico.get('ore_max') if medico.get('ore_max') is not None else get_n_turni_per_ruolo(ruolo)
            sedi_disp = medico['sedi']

            med: Medico = Medico(medico['id'], nome, ruolo, [], sedi_disp, n_turni_max=turni_max)
            all_disp = []
            for turno, giorni in medico['disponibilita'].items():
                for day in giorni:
                    parsed_turno = parse_turno(datetime.date(year, month, day), turno)
                    all_disp.append(parsed_turno)
            med.disponibilita = all_disp
            medici.append(med)
        except Exception as e:
            print(e)
            print(medico)
            raise e
    return medici


def execute_schedule(request: flask.request):
    if DEBUG_MODE:
        real_data = data
        real_data['month'] += 1  # compatibilità con JS
        real_data['medici'] = parse_medici_from_response(real_data['medici'], real_data['year'], real_data['month'])
        # data['medici'] = read_dati('assets/gennaio23.xlsx')
    else:
        real_data = request.json  # o request.json
        real_data['month'] += 1  # compatibilità con JS
    res_check = check_request(request)
    if res_check:
        return res_check

    sol = start(real_data)
    if len(Storage.calendar_turni) == 0:
        return {'message': 'Inserito dati sbagliati'}, 404
    string_sol = create_soluzione_response(sol)
    return string_sol, 200


# Il client che chiama la funzione scarica dal database i dati di tutti i medici, li invia all'API
# Poi sempre con quei dati può fare sostituzioni, cosi si evita un doppio download dei dati

# TODO Valutare di togliere medici per turno e data dall'oggetto Turno, sono ridondanti (magari si può aggiungere un riferimento alla classe Sede appartenente)


def create_soluzione_response(sol: Soluzione):
    format_turno = "%dT%H:%M:%S"
    data_out = {
        'sedi': {},
        'medici': {},
        'turni_occ': sol.turni_occupati,
        'tot_turni': Storage.tot_turni,
        'turni_non_riemp': Storage.turni_non_riempibili,
        'turni_posizionabili': Storage.tot_turni - Storage.tot_turni_occ_a_priori,
        'year': Storage.calendar_turni[0].year,
        'month': Storage.calendar_turni[0].month - 1  # Per questioni di compatibilità con JS
    }
    data_out_sedi = data_out['sedi']
    sede: Sede
    for sede in sol.sedi:
        data_out_sedi[sede.nome] = {
            'turni': {},
            'medici_per_turno': sede.medici_per_turno
        }
        for day, turno in sede.month_calendar.items():
            data_out_sedi[sede.nome]['turni'][day.strftime(format_turno)] = [med.uid for med in turno.turni_occupati]

    for med in Storage.original_all_medici:
        uid_med = med.uid
        tmp_dict = {k: v for k, v in med.__dict__.items() if k != 'uid'}
        tmp_dict['disponibilita'] = [turno.strftime(format_turno) for turno in tmp_dict['disponibilita']]
        data_out['medici'][uid_med] = tmp_dict

    return jsonpickle.encode(data_out, unpicklable=False)


data2 = {
    'year': 2023,
    'month': 0,
    'sedi': [
        {
            'nome': 'Formigine',
            'medici_per_turno': 2,
            'fasce_turno': {
                '20-8': "1,2,3,4,5",
                '8-20': "6,7"
            }
        },
        {
            'nome': 'Sassuolo',
            'medici_per_turno': 2,
            'fasce_turno': {
                '20-8': "1,2,3,4,5",
                '8-20': "6,7"
            }
        }
    ],
    'medici': [
        {
            'id': 1,
            'nome': 'Samuele Mazzi',
            'ruolo': 'titolare',
            'disponibilita':
                {
                    '20-8': [1, 13, 14, 15, 18],
                    '8-20': [1, 3, 4, 5, 10]
                }
            ,
            'sedi': ['Formigine']
        },
        {
            'id': 2,
            'nome': 'Medico Demo',
            'ruolo': 'Convenzionato24',
            'disponibilita':
                {
                    '20-8': [1, 2, 16, 20, 5],
                    '8-20': [2, 4, 6, 9]
                }
            ,
            'sedi': ['Formigine', 'Sassuolo']
        }
    ]
}
data = {
    "year": 2023,
    "month": 1,
    "sedi": [
        {
            "nome": "Formigine",
            "medici_per_turno": 2,
            "fasce_turno": {
                "8-15": "6,7",
                "15-20": "6,7",
                "20-8": "1,2,3,4,5,6,7"
            }
        },
        {
            "nome": "Sassuolo",
            "medici_per_turno": 2,
            "fasce_turno": {
                "8-15": "6,7",
                "15-20": "6,7",
                "20-8": "1,2,3,4,5,6,7"
            }
        }
    ],
    "medici": [
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato12",
            "nome": "Medico Demo",
            "ore_max": 6,
            "disponibilita": {
                "8-15": [
                    4
                ],
                "20-8": [
                    6,
                    9,
                    16,
                    20,
                    23,
                    27
                ],
                "15-20": [
                    11,
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 10,
            "disponibilita": {
                "20-8": [
                    2,
                    7,
                    9,
                    15,
                    16,
                    21,
                    23,
                    28
                ],
                "8-15": [
                    11,
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 5,
            "disponibilita": {
                "20-8": [
                    3,
                    4,
                    24,
                    25
                ],
                "15-20": [
                    5
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 8,
            "disponibilita": {
                "20-8": [
                    2,
                    7,
                    9,
                    14,
                    16,
                    21,
                    23,
                    28
                ],
                "15-20": [
                    5
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PALAGANO",
                "FRASSINORO",
                "PRIGNANO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 3,
            "disponibilita": {
                "20-8": [
                    24
                ],
                "15-20": [
                    25
                ],
                "8-15": [
                    26
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "PALAGANO",
                "PRIGNANO",
                "MONTEFIORINO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 10,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    3,
                    6,
                    7,
                    8,
                    9,
                    10,
                    13,
                    14,
                    15,
                    16,
                    17,
                    20,
                    21,
                    22,
                    23,
                    24,
                    27,
                    28
                ],
                "8-15": [
                    11,
                    12,
                    18,
                    19,
                    25,
                    26
                ]
            }
        },
        {
            "id": "Vitonicola.lospalluto@medici.progetto-sole.it",
            "sedi": [
                "MONTEFIORINO",
                "FRASSINORO",
                "PALAGANO",
                "PRIGNANO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "PALAGANO",
                "PRIGNANO",
                "MONTEFIORINO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato12",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "Mar.vandelli@ausl.mo.it",
            "sedi": [
                "FORMIGINE"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 8,
            "disponibilita": {
                "20-8": [
                    3,
                    4,
                    8,
                    10,
                    11,
                    15,
                    17,
                    18,
                    22,
                    24,
                    25,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    3,
                    8,
                    9,
                    22,
                    23
                ],
                "8-15": [
                    11,
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Incaricato12",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "Sassuolo",
                "Formigine"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 2,
            "disponibilita": {
                "20-8": [
                    18,
                    24,
                    25
                ],
                "15-20": [
                    19,
                    26
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "m.arletti@ausl.mo.it",
            "sedi": [
                "Sassuolo",
                "Formigine"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 2,
            "disponibilita": {
                "15-20": [
                    11,
                    18,
                    25
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "20-8": [
                    3,
                    6,
                    7,
                    16,
                    28
                ],
                "8-15": [
                    5
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PRIGNANO",
                "PALAGANO",
                "FRASSINORO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "PALAGNO",
                "PRIGNANO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 5,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    5,
                    6,
                    7,
                    8,
                    9,
                    12,
                    13,
                    14,
                    15,
                    16,
                    19,
                    20,
                    21,
                    22,
                    23,
                    26,
                    27,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PALAGANO",
                "PRIGNANO",
                "FRASSINORO"
            ],
            "ruolo": "Titolare36",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 9,
            "disponibilita": {
                "20-8": [
                    2,
                    5,
                    9,
                    12,
                    17,
                    19,
                    21,
                    23,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "15-20": [
                    5,
                    12,
                    19,
                    26
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORIO",
                "PALAGANO",
                "PRIGNANO",
                "FRASSINORO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "PRIGNANO",
                "PALAGANO",
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "20-8": [
                    3,
                    4,
                    18,
                    25
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 8,
            "disponibilita": {
                "20-8": [
                    2,
                    6,
                    7,
                    9,
                    13,
                    14,
                    16,
                    20,
                    21,
                    23,
                    27,
                    28
                ],
                "8-15": [
                    4,
                    11,
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "ore_max": 8,
            "disponibilita": {
                "20-8": [
                    2,
                    5,
                    9,
                    12,
                    17,
                    19,
                    21,
                    23,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO",
                "MONTEFIORINO",
                "FRASSINORO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "20-8": [
                    2,
                    3,
                    5,
                    6,
                    7,
                    8,
                    9,
                    10,
                    12,
                    13,
                    14,
                    15,
                    16,
                    20,
                    21,
                    23,
                    24,
                    27,
                    28
                ],
                "8-15": [
                    4
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 6,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    3,
                    4,
                    6,
                    7,
                    8,
                    9,
                    10,
                    11,
                    13,
                    14,
                    15,
                    16,
                    17,
                    20,
                    21,
                    22,
                    23,
                    24,
                    27,
                    28
                ],
                "8-15": [
                    5,
                    12,
                    18,
                    19,
                    25,
                    26
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PALAGANO",
                "PRIGNANO",
                "FRASSINORO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "PALAGANO ",
                "PRIGNANO",
                "MONTEFIORINO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "PRIGNANO",
                "PALAGANO",
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "MONTEFIORINO",
                "PALAGANO",
                "PRIGNANO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "PALAGANO",
                "PRIGNANO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PALAGANO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 5,
            "disponibilita": {
                "20-8": [
                    1,
                    7,
                    15,
                    21
                ],
                "8-15": [
                    11
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "Sassuolo",
                "Formigine"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 3,
            "disponibilita": {
                "20-8": [
                    10,
                    16,
                    21
                ],
                "15-20": [
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 3,
            "disponibilita": {
                "15-20": [
                    5,
                    12,
                    19
                ],
                "20-8": [
                    18
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 4,
            "disponibilita": {
                "20-8": [
                    1,
                    6,
                    7,
                    8,
                    9,
                    12,
                    13,
                    14,
                    15,
                    16,
                    22,
                    23,
                    26,
                    27,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO",
                "PALAGANO",
                "PRIGNANO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 9,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                    8,
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    20,
                    21,
                    22,
                    23,
                    24,
                    25,
                    26,
                    27,
                    28
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 3,
            "disponibilita": {
                "20-8": [
                    12,
                    15,
                    24
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "PRIGNANO",
                "PALAGANO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 8,
            "disponibilita": {
                "8-15": [
                    4,
                    5,
                    18,
                    19
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "MONTEFIORINO",
                "PALAGANO",
                "PALAGANO",
                "PRIGNANO"
            ],
            "ruolo": "Titolare24",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "Sassuolo",
                "Formigine"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "ore_max": 5,
            "disponibilita": {
                "20-8": [
                    3,
                    4,
                    17,
                    18,
                    24,
                    25
                ],
                "15-20": [
                    5,
                    19,
                    26
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FRASSINORO",
                "MONTEFIORINO"
            ],
            "ruolo": "Sostituto",
            "nome": "Medico Demo",
            "disponibilita": {}
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "FORMIGINE",
                "SASSUOLO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 11,
            "disponibilita": {
                "20-8": [
                    1,
                    2,
                    3,
                    6,
                    9,
                    13,
                    16,
                    20,
                    22,
                    23,
                    24,
                    27
                ],
                "15-20": [
                    4,
                    11,
                    18,
                    25
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "PRIGNANO",
                "FRASSINORO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 10,
            "disponibilita": {
                "20-8": [
                    2,
                    7,
                    9,
                    12,
                    15,
                    21,
                    28
                ],
                "15-20": [
                    11
                ]
            }
        },
        {
            "id": "redacted@example.com",
            "sedi": [
                "SASSUOLO",
                "FORMIGINE",
                "PRIGNANO",
                "FRASSINORO"
            ],
            "ruolo": "Incaricato24",
            "nome": "Medico Demo",
            "ore_max": 10,
            "disponibilita": {
                "20-8": [
                    7,
                    8,
                    9,
                    15,
                    16,
                    20,
                    21,
                    22,
                    23,
                    27,
                    28
                ],
                "8-15": [
                    11,
                    12,
                    18,
                    19,
                    25,
                    26
                ]
            }
        }
    ]
}

if __name__ == '__main__':
    # data['medici'] = read_dati('assets/gennaio23.xlsx')
    data['month'] += 1
    final_sol = start(data)
    a = create_soluzione_response(final_sol)
    print(a)
    write_soluzione(final_sol, "programmazione_feb_23")
    exit(0)

"""
{"Formigine": {"2023-01-01T20:00:00": ["17"], "2023-01-02T20:00:00": ["2", "4"], "2023-01-03T20:00:00": ["8", "9"], "2023-01-04T20:00:00": ["7", "17"], "2023-01-05T20:00:00": ["2", "4"], "2023-01-06T20:00:00": ["5", "21"], "2023-01-07T08:00:00": ["7", "11"], "2023-01-07T20:00:00": ["23"], "2023-01-08T08:00:00": ["19", "5"], "2023-01-08T20:00:00": ["29"], "2023-01-09T20:00:00": ["4", "7"], "2023-01-10T20:00:00": ["5", "6"], "2023-01-11T20:00:00": ["8", "17"], "2023-01-12T20:00:00": ["4", "6"], "2023-01-13T20:00:00": ["5", "29"], "2023-01-14T08:00:00": ["2", "6"], "2023-01-14T20:00:00": ["4", "21"], "2023-01-15T08:00:00": ["5", "13"], "2023-01-15T20:00:00": ["8", "29"], "2023-01-16T20:00:00": ["2", "6"], "2023-01-17T20:00:00": ["5", "9"], "2023-01-18T20:00:00": ["6", "16"], "2023-01-19T20:00:00": ["5", "8"], "2023-01-20T20:00:00": ["26", "27"], "2023-01-21T08:00:00": ["7", "11"], "2023-01-21T20:00:00": ["6", "21"], "2023-01-22T08:00:00": ["9", "19"], "2023-01-22T20:00:00": ["8"], "2023-01-23T20:00:00": ["5", "6"], "2023-01-24T20:00:00": ["9", "12"], "2023-01-25T20:00:00": ["5", "6"], "2023-01-26T20:00:00": ["9", "12"], "2023-01-27T20:00:00": ["5", "6"], "2023-01-28T08:00:00": ["8", "13"], "2023-01-28T20:00:00": ["21"], "2023-01-29T08:00:00": ["19", "28"], "2023-01-29T20:00:00": ["29"], "2023-01-30T20:00:00": ["16", "17"], "2023-01-31T20:00:00": ["8", "29"], "medici_per_turno": 2}, "Sassuolo": {"2023-01-02T20:00:00": ["3", "7"], "2023-01-03T20:00:00": ["10", "14"], "2023-01-04T20:00:00": ["3"], "2023-01-05T20:00:00": ["8", "10"], "2023-01-06T20:00:00": [], "2023-01-07T08:00:00": ["13"], "2023-01-07T20:00:00": [], "2023-01-08T08:00:00": ["6"], "2023-01-08T20:00:00": [], "2023-01-09T20:00:00": ["8", "10"], "2023-01-10T20:00:00": ["3", "14"], "2023-01-11T20:00:00": ["10", "18"], "2023-01-12T20:00:00": ["3", "14"], "2023-01-13T20:00:00": ["15"], "2023-01-14T08:00:00": ["26"], "2023-01-14T20:00:00": [], "2023-01-15T08:00:00": ["24"], "2023-01-15T20:00:00": ["15"], "2023-01-16T20:00:00": ["7", "10"], "2023-01-17T20:00:00": ["3", "14"], "2023-01-18T20:00:00": ["10"], "2023-01-19T20:00:00": ["3", "14"], "2023-01-20T20:00:00": ["15"], "2023-01-21T08:00:00": ["24", "28"], "2023-01-21T20:00:00": [], "2023-01-22T08:00:00": ["26"], "2023-01-22T20:00:00": ["3"], "2023-01-23T20:00:00": ["7", "10"], "2023-01-24T20:00:00": ["14", "29"], "2023-01-25T20:00:00": ["3", "7"], "2023-01-26T20:00:00": ["10", "14"], "2023-01-27T20:00:00": ["7", "29"], "2023-01-28T08:00:00": ["24", "26"], "2023-01-28T20:00:00": [], "2023-01-29T08:00:00": [], "2023-01-29T20:00:00": [], "2023-01-30T20:00:00": ["10", "14"], "2023-01-31T20:00:00": ["18", "20"], "2023-01-01T20:00:00": [], "medici_per_turno": 2}, "medici": [{"uid": "2", "nome": "DAVIDE FORNACIARI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-05T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "3", "nome": "MARCO MASSARINI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-04T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-25T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 7}, {"uid": "4", "nome": "FRANCESCA D'IMPRIMA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "5", "nome": "ALESSIA PICCININI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-07T08:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "6", "nome": "MARTINA SILINGARDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00", "2023-01-30T08:00:00", "2023-01-31T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "7", "nome": "CHIARA ANDREOLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-23T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "8", "nome": "HAJAR NAFIDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-15T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-28T20:00:00", "2023-01-31T20:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 9}, {"uid": "9", "nome": "VERONICA GIANCOLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-22T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "10", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 9}, {"uid": "11", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 2}, {"uid": "12", "nome": "FRANCESCO VITOLLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "13", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "14", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 8}, {"uid": "15", "nome": "LAURA ORLANDI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 4}, {"uid": "16", "nome": "ARIANNA DI TOMMASO", "ruolo": "sostituto", "disponibilita": ["2023-01-18T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "17", "nome": "FRANCESCO SPATAFORA", "ruolo": "sostituto", "disponibilita": ["2023-01-01T20:00:00", "2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "18", "nome": "AGNESE VITI", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}, {"uid": "19", "nome": "VALERIA PEDRINI", "ruolo": "sostituto", "disponibilita": ["2023-01-06T08:00:00", "2023-01-08T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "20", "nome": "PATRIZIA GOZDZIEWSKA", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "21", "nome": "ARBER MULLALLI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "22", "nome": "IRENE BRUSCHI", "ruolo": "sostituto", "disponibilita": [], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 2}, {"uid": "23", "nome": "GIULIA BALEGNO", "ruolo": "sostituto", "disponibilita": ["2023-01-07T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-07T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "24", "nome": "ASIA FRANCESCHIN", "ruolo": "sostituto", "disponibilita": ["2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "25", "nome": "ELENA BACHMAN", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "26", "nome": "ADDALA HAJAR", "ruolo": "sostituto", "disponibilita": ["2023-01-14T20:00:00", "2023-01-20T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "27", "nome": "BEATRICE SERRA", "ruolo": "sostituto", "disponibilita": ["2023-01-20T20:00:00", "2023-01-06T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "28", "nome": "ELENA ROSSI", "ruolo": "sostituto", "disponibilita": ["2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "29", "nome": "CHIARA FORNETTI", "ruolo": "incaricato12", "disponibilita": ["2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-17T20:00:00", "2023-01-08T20:00:00", "2023-01-13T20:00:00", "2023-01-15T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}]}
"""
