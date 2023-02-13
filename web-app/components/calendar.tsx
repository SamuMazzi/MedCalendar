import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import IconButton from '@mui/material/IconButton';
import EventIcon from '@mui/icons-material/Event';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { handleDisponibilita } from '../logic/redux/turni_slice'
import 'dayjs/locale/it';
import TextField from '@mui/material/TextField';

interface PropsSelectMeseCalendar {
  timestamp_mese: number | undefined,
  onChange: (arg0: dayjs.Dayjs | null) => void
  /**
   * Numero di mesi di scarto che ci possono essere. Es: 2 -> posso scegliere questo mese e i 2 dopo al max
   */
  maxDate?: number
}

export function SelectMeseCalendar(props: PropsSelectMeseCalendar) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const maxDate = props.maxDate ? dayjs(new Date()).add(props.maxDate, 'M') : undefined
  const views: any[] = maxDate?.year() === dayjs(props.timestamp_mese).year() ? ['month'] : ['year', 'month']
  
  const handleClick = (event: any) => {
    setIsOpen((isOpen) => !isOpen);
    setAnchorEl(event.currentTarget);
  }

  return (
    <LocalizationProvider adapterLocale={'it'} dateAdapter={AdapterDayjs}>
      <DatePicker
        inputFormat="YYYY MMMM"
        disableMaskedInput
        views={views}
        maxDate={maxDate}
        renderInput={(params) => !props.timestamp_mese ? <IconButton onClick={handleClick}>
          <EventIcon/>
        </IconButton> : <TextField {...params}
          onClick={handleClick}
          label="" 
          placeholder='Mese' 
          InputProps={{
            endAdornment: (
              <IconButton>
                <EventIcon />
              </IconButton>
            ),
          }}
        />}
        InputProps={{
          placeholder: "Placeholder"
        }}
        value={props.timestamp_mese ? dayjs(props.timestamp_mese) : undefined}
        onChange={props.onChange}
        PopperProps={{
          placement: "bottom-end",
          anchorEl: anchorEl
        }}
        minDate={dayjs(new Date())}
        closeOnSelect={true}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        />
    </LocalizationProvider>
  );
}

export interface PropsCalendar {
  fasciaTurno: string
  selectableDays?: number[]
  extraDays?: Date[]
}

export function PersonalCalendar(props: PropsCalendar) {
  const giorniSelezionati = useAppSelector((state) => state.turni.disponibilita[props.fasciaTurno])
  const timestamp_mese = useAppSelector((state) => state.turni.timestamp_mese)
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState<any>(null);

  const handleBugClick = async () => {
    setSelected(dayjs(timestamp_mese!))
    await new Promise(r => setTimeout(r, 1));
    setSelected(null)
  }

  const handleClick = (event: any) => {
    setIsOpen((isOpen) => !isOpen);
    setAnchorEl(event.currentTarget);
    handleBugClick()
  }

  const handleDaySelected = (newDate: Dayjs) => {
    const day: number = newDate.date();
    dispatch(handleDisponibilita({
      fasciaTurno: props.fasciaTurno,
      giorno: day
    }));
  }

  return (
    <LocalizationProvider adapterLocale='it' dateAdapter={AdapterDayjs}>
      <DatePicker
        value={selected}        
        onChange={(newValue) => {
          if(newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        PopperProps={{
          placement: "bottom-end",
          anchorEl: anchorEl
        }}
        maxDate={timestamp_mese !== undefined ? dayjs(timestamp_mese).endOf('month') : undefined}
        minDate={timestamp_mese !== undefined ? dayjs(timestamp_mese).startOf('month') : undefined}
        closeOnSelect={false}
        shouldDisableMonth={timestamp_mese !== undefined ? (date) => date.month() !== dayjs(timestamp_mese).month() : undefined}
        shouldDisableDate={(date) => !props.selectableDays?.includes(date.day()) && !props.extraDays?.some(v => dayjs(v).isSame(date, 'day'))}
        showDaysOutsideCurrentMonth={timestamp_mese === undefined}
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
        renderDay={(day, _value, DayComponentProps) => {
          const isSelected = !DayComponentProps.outsideCurrentMonth && (giorniSelezionati !== undefined && giorniSelezionati.includes(day.date()));
          //*: Fai colore select un po' sfumato (opacità?)
          return <PickersDay {...DayComponentProps} selected={isSelected}/>;
        }}
      />
    </LocalizationProvider>
  );
}

interface PropsCalendarSelectSingleDay {
  daySelected: Dayjs
  onChangeDate: (arg0: Dayjs) => void
}

export function CalendarSelectSingleDay(props: PropsCalendarSelectSingleDay) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event: any) => {
    setIsOpen((isOpen) => !isOpen);
    setAnchorEl(event.currentTarget);
  }

  const handleDaySelected = (newDate: Dayjs) => {
    props.onChangeDate(newDate)
  }

  return (
    <LocalizationProvider adapterLocale='it' dateAdapter={AdapterDayjs}>
      <DatePicker
        value={props.daySelected}        
        onChange={(newValue) => {
          if(newValue !== null) {
            handleDaySelected(newValue);
          }
        }}
        PopperProps={{
          placement: "bottom-end",
          anchorEl: anchorEl
        }}
        open={isOpen}
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
      />
    </LocalizationProvider>
  );
}