import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@mui/material/Badge';
import { IconButton } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarPickerSkeleton } from '@mui/x-date-pickers/CalendarPickerSkeleton';
import { RootState, useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { handleDisponibilita } from '../logic/redux/turni_slice'
import 'dayjs/locale/it';

export interface PropsCalendar {
  fasciaTurno: string,
  selectableDays: number[]
}

export function PersonalCalendar(props: PropsCalendar) {
  const giorniSelezionati = useAppSelector((state: RootState) => state.turni.disponibilita[props.fasciaTurno])
  //const disponibilita = useAppSelector((state: RootState) => state.turni.disponibilita)
  const mese = useAppSelector((state: RootState) => state.turni.mese)
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const getSelMese = () => {
    if(mese === undefined) {
      return undefined
    }
    return new Date(mese);
  }

  const handleClick = (event: any) => {
    setIsOpen((isOpen) => !isOpen);
    setAnchorEl(event.currentTarget);
  }

  const handleDaySelected = (newDate: Dayjs) => {
    const day: number = newDate.date();
    dispatch(handleDisponibilita({
      fasciaTurno: props.fasciaTurno,
      giorno: day
    }));
  }

  return (
    <LocalizationProvider adapterLocale={'it'} dateAdapter={AdapterDayjs}>
      <DatePicker
        value={dayjs(mese)}
        onChange={(newValue) => {
          if(newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        PopperProps={{
          placement: "bottom-end",
          anchorEl: anchorEl
        }}
        maxDate={mese !== undefined ? dayjs(mese).endOf('month') : undefined}
        minDate={mese !== undefined ? dayjs(mese).startOf('month') : undefined}
        closeOnSelect={false}
        shouldDisableMonth={mese !== undefined ? (date) => date.month() !== dayjs(mese).month() : undefined}
        shouldDisableDate={(date) => !props.selectableDays.includes(date.day())} //TODO Risolvere mini bug
        showDaysOutsideCurrentMonth={mese === undefined}
        open={isOpen}
        disableHighlightToday={true}
        onClose={() => setIsOpen(false)}
        renderInput={({
          ref,
          inputProps,
          disabled,
          onChange,
          value,
          ...other
        }) => (
          <div ref={ref} style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <IconButton onClick={handleClick}>
              <EventIcon fontSize="large"/>
            </IconButton>
          </div>)}
        renderLoading={() => <CalendarPickerSkeleton />}
        renderDay={(day, _value, DayComponentProps) => {
          const selMese = getSelMese()
          const isSelected = !DayComponentProps.outsideCurrentMonth && (giorniSelezionati !== undefined && giorniSelezionati.includes(day.date()));
          //day.month() === selMese?.getMonth() && day.year() === selMese?.getFullYear()
          return (
            <Badge
              key={day.toString()}
              overlap="circular"
              badgeContent={isSelected ? '🔵' : undefined}
            >
              <PickersDay {...DayComponentProps} />
            </Badge>
          );
        }}
      />
    </LocalizationProvider>
  );
}