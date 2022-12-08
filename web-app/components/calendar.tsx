import { useState, useContext } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import Badge from '@mui/material/Badge';
import { IconButton, Typography } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { CalendarPickerSkeleton } from '@mui/x-date-pickers/CalendarPickerSkeleton';
import { RootState, useAppDispatch, useAppSelector }  from '../logic/store'
import { handleDisponibilita } from '../logic/slice'
import 'dayjs/locale/it';

export interface PropsCalendar {
  fasciaTurno: string,
}

export function PersonalCalendar(props: PropsCalendar) {
  const giorniSelezionati = useAppSelector((state: RootState) => state.turni.disponibilita[props.fasciaTurno])
  const mese = useAppSelector((state: RootState) => state.turni.mese)
  const dispatch = useAppDispatch()
  const [value, setValue] = useState(new Date(2023,mese,1));
  const [isOpen, setIsOpen] = useState(false);

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
        value={dayjs(value)}
        onChange={(newValue) => {
          if(newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        maxDate={dayjs(value).endOf('month')}
        minDate={dayjs(value).startOf('month')}
        closeOnSelect={false}
        shouldDisableMonth={(date) => date.month() !== dayjs(value).month()}
        shouldDisableDate={(date) => props.fasciaTurno === '8-20' && date.day() !== 6 && date.day() !== 0}
        showDaysOutsideCurrentMonth={false}
        open={isOpen}
        disableHighlightToday={true}
        onClose={() => setIsOpen(false)}
        //renderInput={(params) => <TextField {...params}/>} //TODO: Da modificare https://stackoverflow.com/questions/71520368/material-ui-datepicker-custom-renderinput
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
            <Typography sx={{ my: 1 }}>
              Seleziona le tue disponibilità
            </Typography>
            <IconButton onClick={() => {setIsOpen(!isOpen)}}>
              <EventIcon />
            </IconButton>
          </div>)}
        renderLoading={() => <CalendarPickerSkeleton />}
        renderDay={(day, _value, DayComponentProps) => {
          const isSelected = !DayComponentProps.outsideCurrentMonth && (giorniSelezionati !== undefined && giorniSelezionati.includes(day.date()));

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