import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector }  from '../logic/redux/store'
import { setNewAvailabilityDoctor } from '../logic/redux/turni_slice'
import { Calendar } from 'primereact/calendar';
import { Nullable } from 'primereact/ts-helpers';
import styled from 'styled-components';

interface PropsSelectMeseCalendar {
  timestamp_mese: number | undefined,
  onChange: (arg0: Nullable<Date | undefined>) => void
  /**
   * Numero di mesi di scarto che ci possono essere. Es: 2 -> posso scegliere questo mese e i 2 dopo al max
   */
  maxDate?: number
}

export function SelectMeseCalendar(props: PropsSelectMeseCalendar) {
  const maxDate = props.maxDate ? dayjs(new Date()).add(props.maxDate, 'M') : undefined
  
  const CustomCalendar = styled(Calendar)`
    .p-inputtext {
        display: none;
    }
  `;

  return (
    (<CustomCalendar
        dateFormat="MM yy"
        view="month"
        locale='it'
        showIcon
        placeholder='Mese'
        maxDate={maxDate?.toDate()}
        value={props.timestamp_mese ? dayjs(props.timestamp_mese).toDate() : undefined}
        onChange={(event) => props.onChange(event.value)}
        minDate={new Date()}
      />)
  );
}

export interface PropsCalendar {
  shift: string
  /**
   * It seems they are the selectable weekdays -> inform better about 0-7
   */
  selectableDays?: number[]
  extraDays?: Date[]
}

export function PersonalCalendar(props: PropsCalendar) {
  let tmpSelectedDays = useAppSelector((state) => state.turni.availability[props.shift])
  const selectedDays: Date[] = tmpSelectedDays !== undefined && tmpSelectedDays !== null ? tmpSelectedDays.map(v => new Date(v)) : []
  const timestamp_month = useAppSelector((state) => state.turni.timestamp_month)
  const date_month = timestamp_month !== undefined ? new Date(timestamp_month) : undefined
  const dispatch = useAppDispatch()

  const getFilteredDaysInMonth = (month: number, year: number) => {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
      if (props.selectableDays?.includes(date.getDay()) || props.extraDays?.some(v => dayjs(v).isSame(date, 'day'))) {
        days.push(new Date(date));
      }
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  const handleDaySelected = (newDates: Date[]) => {
    dispatch(setNewAvailabilityDoctor({
      shift: props.shift,
      days: newDates.map(v => v.getTime())
    }));
  }

  const CustomCalendar = styled(Calendar)`
    .p-inputtext {
        display: none;
    }
  `;

  return (
    (<CustomCalendar
        locale="it"
        value={selectedDays}
        onChange={(e) => {
          if(e.value !== undefined && e.value !== null) {
            handleDaySelected(e.value);
          }
        }}
        onClearButtonClick={() => handleDaySelected([])}
        maxDate={timestamp_month !== undefined ? dayjs(timestamp_month).endOf('month').toDate() : undefined}
        minDate={timestamp_month !== undefined ? dayjs(timestamp_month).startOf('month').toDate() : undefined}
        viewDate={date_month}
        enabledDates={date_month !== undefined ? getFilteredDaysInMonth(date_month.getMonth(), date_month.getFullYear()) : undefined}
        showOtherMonths={timestamp_month === undefined}
        showButtonBar
        selectionMode='multiple'
        showIcon
        style={{ width: '100%', borderRadius: 100, color: 'black' }}
        /*renderInput={({
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
          </div>)}*/
        />)
  );
}

interface PropsCalendarSelectSingleDay {
  daySelected: Date
  onChangeDate: (arg0: Date) => void
}

export function CalendarSelectSingleDay(props: PropsCalendarSelectSingleDay) {
  const handleDaySelected = (newDate: Date) => {
    props.onChangeDate(newDate)
  }

  return (
    (<Calendar
        locale='it'
        value={props.daySelected}
        onChange={(e) => {
          if(e.value !== undefined && e.value !== null) {
            handleDaySelected(e.value);
          }
        }}
        dateFormat="dd/mm/yy"
        showIcon
    />)
  );
}