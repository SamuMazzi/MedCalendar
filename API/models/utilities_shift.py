import datetime

def _parse_single_piece_shift(piece: str):
    h_and_m = piece.split(':')
    hours = h_and_m[0]
    minutes = '1' if (len(h_and_m) >= 2 and int(h_and_m[1]) != 0) else '0'
    return hours, minutes

def parse_shift_to_datetime(day: datetime.date, fascia: str):
    """
    Per ora si possono usare solo ore senza mezz'ore

    Idea di turno -> 2022-04-13 12:14:11
    12 -> ora inizio
    14 -> ora fine
    11 -> ogni 1 o 0 ti dice se l'ora d'inizio/fine ha la mezz'ora -> 12.30-14.30
    :param day:
    :param fascia:
    :return:
    """
    inizio_ora, inizio_minuti = _parse_single_piece_shift(fascia.split('-')[0])
    fine_ora, fine_minuti = _parse_single_piece_shift(fascia.split('-')[1])
    final_minuti = int(inizio_minuti + fine_minuti)
    return datetime.datetime(day.year, day.month, day.day, int(inizio_ora), int(fine_ora), final_minuti)