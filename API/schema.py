from marshmallow import Schema, ValidationError, fields, validates, validate

data = {
    'year': 2023,
    'month': 0,
    'sedi': [
        {
            'nome': 'Formigine',
            'medici_per_turno': 2,
            "special_days": ["timestamp"],
            'fasce_turno': {
                '20-8': "1,2,3,4,5",
                '8-20': "6,7"
            }
        },
        {
            'nome': 'Sassuolo',
            'medici_per_turno': 2,
            "special_days": ["timestamp"],
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

class LocationsSchema(Schema):
    name = fields.Str()
    doctors_for_shift = fields.Int(strict=True)
    special_days = fields.List(fields.Int())
    shifts = fields.Dict(fields.Str(), fields.Str())

    @validates("shifts")
    def validate_quantity(self, value: dict[str, str]):
        for v in value.values():
            try:
                days = [int(v) for v in v.split(",")]
                if any(d < 1 or d > 7 for d in days):
                    raise ValueError("Days must be between 1 and 7")
            except Exception:
                raise ValidationError("Shifts must be a list of integers")


class DoctorsSchema(Schema):
    id = fields.Str()
    name = fields.Str()
    role = fields.Str()
    availability = fields.Dict(fields.Str(), fields.List(fields.Int()))
    locations = fields.List(fields.Str())
    # TODO: Add max hours

    @validates("availability")
    def validate_availability(self, value: dict[str, list[int]]):
        for days in value.values():
            try:
                if any(d < 1 or d > 31 for d in days):
                    raise ValueError("Days must be between 1 and 7")
            except Exception:
                raise ValidationError("Shifts must be a list of integers")


class DataRequestSchema(Schema):
    year = fields.Int(strict=True, validate=validate.Range(min=2023))
    month = fields.Int(strict=True, validate=validate.Range(min=0, max=11))  # Because months are 0-indexed in Javascript
    locations = fields.Nested(LocationsSchema, many=True)
    doctors = fields.Nested(DoctorsSchema, many=True)

    # TODO: Add check consistency between locations and doctors
    # https://marshmallow.readthedocs.io/en/stable/extending.html#schema-level-validation