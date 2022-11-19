from enum import Enum


class Roles(Enum):
    SOSTITUTO = 0
    INCARICATO12 = 1
    INCARICATO24 = 2
    INCARICATO24CONMAGG = 3
    CONVENZIONATO24 = 4
    CONVENZIONATO24CONMAGG = 5


class Sedi(Enum):
    SASSUOLO = 1
    VIGNOLA = 2
    FORMIGINE = 3
    RUBBIERA = 4
