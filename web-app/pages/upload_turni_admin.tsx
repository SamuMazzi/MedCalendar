import { Container, Button, Typography, Grid, CircularProgress, Checkbox, FormControlLabel } from '@mui/material'
import { getDistrettiForAdmin, getDisponibilitaMeseDistretto, getInfoSediDistretto } from '../logic/server/firestore'
import { useState, ChangeEvent } from 'react';
import Calendar from '../components/material_calendar/index' //TODO: Rimuovere se non serve più
import TableResult from '../components/table_result';
import { useAppDispatch } from '../logic/redux/store';
import { populateScheduler, clearScheduler } from '../logic/redux/scheduler_slice';

const data_to_send = {
  'year': 2023,
  'month': 1,
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
          'disponibilita': [
              {
                  '20-8': [1, 13, 14, 15, 18],
                  '8-20': [1, 3, 4, 5, 10]
              }
          ],
          'sedi': ['Formigine']
      }
  ]
}

export default function Raccolta() {
  const [ distretti, setDistretti ] = useState<string[]>([])
  const [ distrettoSel, setDistrettoSel ] = useState("")
  const [ infoDistretto, setInfoDistretto ] = useState({})
  const [ disponibilitaDistretto, setDisponibilitaDistretto ] = useState({})
  const [ loading, setLoading ] = useState(false)
  const [ loadingTurni, setLoadingTurni ] = useState(false)
  const [ file, setFile ] = useState<File | null>(null)
  const dispatch = useAppDispatch()

  const obj = {"Formigine": {"2023-01-01T20:00:00": ["17"], "2023-01-02T20:00:00": ["2", "4"], "2023-01-03T20:00:00": ["8", "9"], "2023-01-04T20:00:00": ["7", "17"], "2023-01-05T20:00:00": ["2", "4"], "2023-01-06T20:00:00": ["5", "21"], "2023-01-07T08:00:00": ["7", "11"], "2023-01-07T20:00:00": ["23"], "2023-01-08T08:00:00": ["19", "5"], "2023-01-08T20:00:00": ["29"], "2023-01-09T20:00:00": ["4", "7"], "2023-01-10T20:00:00": ["5", "6"], "2023-01-11T20:00:00": ["8", "17"], "2023-01-12T20:00:00": ["4", "6"], "2023-01-13T20:00:00": ["5", "29"], "2023-01-14T08:00:00": ["2", "6"], "2023-01-14T20:00:00": ["4", "21"], "2023-01-15T08:00:00": ["5", "13"], "2023-01-15T20:00:00": ["8", "29"], "2023-01-16T20:00:00": ["2", "6"], "2023-01-17T20:00:00": ["5", "9"], "2023-01-18T20:00:00": ["6", "16"], "2023-01-19T20:00:00": ["5", "8"], "2023-01-20T20:00:00": ["26", "27"], "2023-01-21T08:00:00": ["7", "11"], "2023-01-21T20:00:00": ["6", "21"], "2023-01-22T08:00:00": ["9", "19"], "2023-01-22T20:00:00": ["8"], "2023-01-23T20:00:00": ["5", "6"], "2023-01-24T20:00:00": ["9", "12"], "2023-01-25T20:00:00": ["5", "6"], "2023-01-26T20:00:00": ["9", "12"], "2023-01-27T20:00:00": ["5", "6"], "2023-01-28T08:00:00": ["8", "13"], "2023-01-28T20:00:00": ["21"], "2023-01-29T08:00:00": ["19", "28"], "2023-01-29T20:00:00": ["29"], "2023-01-30T20:00:00": ["16", "17"], "2023-01-31T20:00:00": ["8", "29"], "medici_per_turno": 2}, "Sassuolo": {"2023-01-02T20:00:00": ["3", "7"], "2023-01-03T20:00:00": ["10", "14"], "2023-01-04T20:00:00": ["3"], "2023-01-05T20:00:00": ["8", "10"], "2023-01-06T20:00:00": [], "2023-01-07T08:00:00": ["13"], "2023-01-07T20:00:00": [], "2023-01-08T08:00:00": ["6"], "2023-01-08T20:00:00": [], "2023-01-09T20:00:00": ["8", "10"], "2023-01-10T20:00:00": ["3", "14"], "2023-01-11T20:00:00": ["10", "18"], "2023-01-12T20:00:00": ["3", "14"], "2023-01-13T20:00:00": ["15"], "2023-01-14T08:00:00": ["26"], "2023-01-14T20:00:00": [], "2023-01-15T08:00:00": ["24"], "2023-01-15T20:00:00": ["15"], "2023-01-16T20:00:00": ["7", "10"], "2023-01-17T20:00:00": ["3", "14"], "2023-01-18T20:00:00": ["10"], "2023-01-19T20:00:00": ["3", "14"], "2023-01-20T20:00:00": ["15"], "2023-01-21T08:00:00": ["24", "28"], "2023-01-21T20:00:00": [], "2023-01-22T08:00:00": ["26"], "2023-01-22T20:00:00": ["3"], "2023-01-23T20:00:00": ["7", "10"], "2023-01-24T20:00:00": ["14", "29"], "2023-01-25T20:00:00": ["3", "7"], "2023-01-26T20:00:00": ["10", "14"], "2023-01-27T20:00:00": ["7", "29"], "2023-01-28T08:00:00": ["24", "26"], "2023-01-28T20:00:00": [], "2023-01-29T08:00:00": [], "2023-01-29T20:00:00": [], "2023-01-30T20:00:00": ["10", "14"], "2023-01-31T20:00:00": ["18", "20"], "2023-01-01T20:00:00": [], "medici_per_turno": 2}, "medici": [{"uid": "2", "nome": "DAVIDE FORNACIARI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-05T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "3", "nome": "MARCO MASSARINI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-04T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-25T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 7}, {"uid": "4", "nome": "FRANCESCA D'IMPRIMA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "5", "nome": "ALESSIA PICCININI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-07T08:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "6", "nome": "MARTINA SILINGARDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00", "2023-01-30T08:00:00", "2023-01-31T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "7", "nome": "CHIARA ANDREOLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-23T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "8", "nome": "HAJAR NAFIDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-15T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-28T20:00:00", "2023-01-31T20:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 9}, {"uid": "9", "nome": "VERONICA GIANCOLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-22T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "10", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 9}, {"uid": "11", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 2}, {"uid": "12", "nome": "FRANCESCO VITOLLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "13", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "14", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 8}, {"uid": "15", "nome": "LAURA ORLANDI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 4}, {"uid": "16", "nome": "ARIANNA DI TOMMASO", "ruolo": "sostituto", "disponibilita": ["2023-01-18T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "17", "nome": "FRANCESCO SPATAFORA", "ruolo": "sostituto", "disponibilita": ["2023-01-01T20:00:00", "2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "18", "nome": "AGNESE VITI", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}, {"uid": "19", "nome": "VALERIA PEDRINI", "ruolo": "sostituto", "disponibilita": ["2023-01-06T08:00:00", "2023-01-08T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "20", "nome": "PATRIZIA GOZDZIEWSKA", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "21", "nome": "ARBER MULLALLI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "22", "nome": "IRENE BRUSCHI", "ruolo": "sostituto", "disponibilita": [], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 2}, {"uid": "23", "nome": "GIULIA BALEGNO", "ruolo": "sostituto", "disponibilita": ["2023-01-07T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-07T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "24", "nome": "ASIA FRANCESCHIN", "ruolo": "sostituto", "disponibilita": ["2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "25", "nome": "ELENA BACHMAN", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "26", "nome": "ADDALA HAJAR", "ruolo": "sostituto", "disponibilita": ["2023-01-14T20:00:00", "2023-01-20T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "27", "nome": "BEATRICE SERRA", "ruolo": "sostituto", "disponibilita": ["2023-01-20T20:00:00", "2023-01-06T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "28", "nome": "ELENA ROSSI", "ruolo": "sostituto", "disponibilita": ["2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "29", "nome": "CHIARA FORNETTI", "ruolo": "incaricato12", "disponibilita": ["2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-17T20:00:00", "2023-01-08T20:00:00", "2023-01-13T20:00:00", "2023-01-15T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}]}

  const getDistretti = async () => {
    const tmpDistretti = await getDistrettiForAdmin("id_admin")
    setDistretti(tmpDistretti)
  }

  const handleSelDistretto = async (distretto: string) => {
    setLoading(true);
    setDistrettoSel(distretto)
    const d = new Date();
    const year = d.getFullYear()
    const month = d.getMonth()
    const dispNextMonth = await getDisponibilitaMeseDistretto(distretto, year, month)
    if (dispNextMonth === undefined) {
      setLoading(false)
      return;
    }
    const info = await getInfoSediDistretto(distretto) //! Da cambiare!!
    setInfoDistretto(info!)
    setDisponibilitaDistretto(dispNextMonth)
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      if(files.length > 1) {
        throw "Puoi caricare al massimo 1 file" //TODO: Metti Alert
      }
      setFile(files.item(0))
    }
  };

  const callApi = async () => {
    const localUrl = "http://127.0.0.1:8080"
    setLoadingTurni(true)
    try {
      const res = await fetch(localUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "Application/JSON",
            "Access-Control-Request-Method": "POST"
          },
          body: JSON.stringify(data_to_send)
        })
        if(res.status === 200) {
          dispatch(clearScheduler())
          const jsonData = await res.json()
          dispatch(populateScheduler(jsonData))
      }
    } catch(e) {
      console.log(e)
    } finally {
      setLoadingTurni(false)
    }
  }
/**
 * sx={{
          [`& .${tableCellClasses.root}`]: {
            borderBottom: "none"
          }
        }}
 */
  return (
    <Grid container
      display="flex"
      direction="column"
      alignItems="center"
      justifyContent="center"
      //sx={{minWidth: "200px"}}
    >
      <Typography variant="h3" component="h3" sx={{py: 5}}>Pagina admin!</Typography>
      {
        distretti.map((distretto) => 
          <Button key={distretto} onClick={() => handleSelDistretto(distretto)}>
            {distretto}
          </Button>
        )
      }
      {
        !loading && distrettoSel && infoDistretto && disponibilitaDistretto && 
        <Container>
          <Typography>
            {"Hai caricato tutte le info del distretto! " + infoDistretto + disponibilitaDistretto}
          </Typography>
          <Button onClick={() => "c"} disabled={loadingTurni}>
            Crea i turni
          </Button>
        </Container>
      }
      {
        loadingTurni ? <CircularProgress /> : 
        (<Button
          variant="contained"
          component="label"
          disabled={loadingTurni}
          onClick={callApi}
          sx={{m: 4}}
        >
          Crea i turni
        </Button>)
      }
      <Button
        variant="contained"
        component="label"
      >
        Carica file turni
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          hidden
          onChange={(e) => handleFileSelect(e)}
        />
      </Button>
      {
        file && <Typography>{"Hai caricato il file " + file!.name}</Typography>
      }
      <TableResult />
    </Grid>
  )
}