import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Switch from '@mui/material/Switch'
import TableResult from '../components/table_result';
import CircleIcon from '@mui/icons-material/Circle';
import Greetings from '../components/greetings';
import { useAppDispatch, useAppSelector } from '../logic/redux/store';
import { populateScheduler, setMeseAndAnno } from '../logic/redux/scheduler_slice';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { getDisponibilitaMeseDistretto, uploadDefConfigurazione } from '../logic/server/firestore'
import { setMessageError } from '../logic/redux/settings_slice';
import ExportExcel from '../components/excel_export'
import Head from 'next/head'
import Image from 'next/image'
import { AppFirebaseError } from '../logic/server/firebase'
import { SelectMeseCalendar } from '../components/calendar'

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

/**
 * const obj = {"Formigine": {"2023-01-01T20:00:00": ["17"], "2023-01-02T20:00:00": ["2", "4"], "2023-01-03T20:00:00": ["8", "9"], "2023-01-04T20:00:00": ["7", "17"], "2023-01-05T20:00:00": ["2", "4"], "2023-01-06T20:00:00": ["5", "21"], "2023-01-07T08:00:00": ["7", "11"], "2023-01-07T20:00:00": ["23"], "2023-01-08T08:00:00": ["19", "5"], "2023-01-08T20:00:00": ["29"], "2023-01-09T20:00:00": ["4", "7"], "2023-01-10T20:00:00": ["5", "6"], "2023-01-11T20:00:00": ["8", "17"], "2023-01-12T20:00:00": ["4", "6"], "2023-01-13T20:00:00": ["5", "29"], "2023-01-14T08:00:00": ["2", "6"], "2023-01-14T20:00:00": ["4", "21"], "2023-01-15T08:00:00": ["5", "13"], "2023-01-15T20:00:00": ["8", "29"], "2023-01-16T20:00:00": ["2", "6"], "2023-01-17T20:00:00": ["5", "9"], "2023-01-18T20:00:00": ["6", "16"], "2023-01-19T20:00:00": ["5", "8"], "2023-01-20T20:00:00": ["26", "27"], "2023-01-21T08:00:00": ["7", "11"], "2023-01-21T20:00:00": ["6", "21"], "2023-01-22T08:00:00": ["9", "19"], "2023-01-22T20:00:00": ["8"], "2023-01-23T20:00:00": ["5", "6"], "2023-01-24T20:00:00": ["9", "12"], "2023-01-25T20:00:00": ["5", "6"], "2023-01-26T20:00:00": ["9", "12"], "2023-01-27T20:00:00": ["5", "6"], "2023-01-28T08:00:00": ["8", "13"], "2023-01-28T20:00:00": ["21"], "2023-01-29T08:00:00": ["19", "28"], "2023-01-29T20:00:00": ["29"], "2023-01-30T20:00:00": ["16", "17"], "2023-01-31T20:00:00": ["8", "29"], "medici_per_turno": 2}, "Sassuolo": {"2023-01-02T20:00:00": ["3", "7"], "2023-01-03T20:00:00": ["10", "14"], "2023-01-04T20:00:00": ["3"], "2023-01-05T20:00:00": ["8", "10"], "2023-01-06T20:00:00": [], "2023-01-07T08:00:00": ["13"], "2023-01-07T20:00:00": [], "2023-01-08T08:00:00": ["6"], "2023-01-08T20:00:00": [], "2023-01-09T20:00:00": ["8", "10"], "2023-01-10T20:00:00": ["3", "14"], "2023-01-11T20:00:00": ["10", "18"], "2023-01-12T20:00:00": ["3", "14"], "2023-01-13T20:00:00": ["15"], "2023-01-14T08:00:00": ["26"], "2023-01-14T20:00:00": [], "2023-01-15T08:00:00": ["24"], "2023-01-15T20:00:00": ["15"], "2023-01-16T20:00:00": ["7", "10"], "2023-01-17T20:00:00": ["3", "14"], "2023-01-18T20:00:00": ["10"], "2023-01-19T20:00:00": ["3", "14"], "2023-01-20T20:00:00": ["15"], "2023-01-21T08:00:00": ["24", "28"], "2023-01-21T20:00:00": [], "2023-01-22T08:00:00": ["26"], "2023-01-22T20:00:00": ["3"], "2023-01-23T20:00:00": ["7", "10"], "2023-01-24T20:00:00": ["14", "29"], "2023-01-25T20:00:00": ["3", "7"], "2023-01-26T20:00:00": ["10", "14"], "2023-01-27T20:00:00": ["7", "29"], "2023-01-28T08:00:00": ["24", "26"], "2023-01-28T20:00:00": [], "2023-01-29T08:00:00": [], "2023-01-29T20:00:00": [], "2023-01-30T20:00:00": ["10", "14"], "2023-01-31T20:00:00": ["18", "20"], "2023-01-01T20:00:00": [], "medici_per_turno": 2}, "medici": [{"uid": "2", "nome": "DAVIDE FORNACIARI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-05T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "3", "nome": "MARCO MASSARINI", "ruolo": "incaricato12", "disponibilita": ["2023-01-02T20:00:00", "2023-01-04T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-25T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 7}, {"uid": "4", "nome": "FRANCESCA D'IMPRIMA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "5", "nome": "ALESSIA PICCININI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-07T08:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "6", "nome": "MARTINA SILINGARDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-08T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00", "2023-01-08T08:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00", "2023-01-30T08:00:00", "2023-01-31T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "7", "nome": "CHIARA ANDREOLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-23T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "8", "nome": "HAJAR NAFIDI", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-15T20:00:00", "2023-01-19T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-28T20:00:00", "2023-01-31T20:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 9}, {"uid": "9", "nome": "VERONICA GIANCOLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-22T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 10}, {"uid": "10", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 9}, {"uid": "11", "nome": "MARTINA BERTONCELLI", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-21T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 2}, {"uid": "12", "nome": "FRANCESCO VITOLLA", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "13", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-06T08:00:00", "2023-01-07T08:00:00", "2023-01-15T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "14", "nome": "ELENA MOCCIA", "ruolo": "incaricato24", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 8}, {"uid": "15", "nome": "LAURA ORLANDI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-20T20:00:00"], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 4}, {"uid": "16", "nome": "ARIANNA DI TOMMASO", "ruolo": "sostituto", "disponibilita": ["2023-01-18T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "17", "nome": "FRANCESCO SPATAFORA", "ruolo": "sostituto", "disponibilita": ["2023-01-01T20:00:00", "2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-23T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 5}, {"uid": "18", "nome": "AGNESE VITI", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-16T20:00:00", "2023-01-19T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}, {"uid": "19", "nome": "VALERIA PEDRINI", "ruolo": "sostituto", "disponibilita": ["2023-01-06T08:00:00", "2023-01-08T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "20", "nome": "PATRIZIA GOZDZIEWSKA", "ruolo": "sostituto", "disponibilita": ["2023-01-03T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "21", "nome": "ARBER MULLALLI", "ruolo": "sostituto", "disponibilita": ["2023-01-02T20:00:00", "2023-01-03T20:00:00", "2023-01-04T20:00:00", "2023-01-05T20:00:00", "2023-01-06T20:00:00", "2023-01-07T20:00:00", "2023-01-09T20:00:00", "2023-01-10T20:00:00", "2023-01-11T20:00:00", "2023-01-12T20:00:00", "2023-01-13T20:00:00", "2023-01-14T20:00:00", "2023-01-15T20:00:00", "2023-01-16T20:00:00", "2023-01-17T20:00:00", "2023-01-18T20:00:00", "2023-01-19T20:00:00", "2023-01-20T20:00:00", "2023-01-21T20:00:00", "2023-01-22T20:00:00", "2023-01-23T20:00:00", "2023-01-24T20:00:00", "2023-01-25T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-30T20:00:00", "2023-01-31T20:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 8}, {"uid": "22", "nome": "IRENE BRUSCHI", "ruolo": "sostituto", "disponibilita": [], "sedi": ["sassuolo"], "n_turni_per_soddisfatto": 2}, {"uid": "23", "nome": "GIULIA BALEGNO", "ruolo": "sostituto", "disponibilita": ["2023-01-07T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-07T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "24", "nome": "ASIA FRANCESCHIN", "ruolo": "sostituto", "disponibilita": ["2023-01-15T08:00:00", "2023-01-21T08:00:00", "2023-01-28T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 3}, {"uid": "25", "nome": "ELENA BACHMAN", "ruolo": "incaricato24", "disponibilita": ["2023-01-03T20:00:00", "2023-01-05T20:00:00", "2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-17T20:00:00", "2023-01-19T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2024-01-07T08:00:00", "2024-01-21T08:00:00", "2023-01-14T08:00:00"], "sedi": ["formigine"], "n_turni_per_soddisfatto": 6}, {"uid": "26", "nome": "ADDALA HAJAR", "ruolo": "sostituto", "disponibilita": ["2023-01-14T20:00:00", "2023-01-20T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-14T08:00:00", "2023-01-15T08:00:00", "2023-01-22T08:00:00", "2023-01-28T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "27", "nome": "BEATRICE SERRA", "ruolo": "sostituto", "disponibilita": ["2023-01-20T20:00:00", "2023-01-06T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "28", "nome": "ELENA ROSSI", "ruolo": "sostituto", "disponibilita": ["2023-01-21T08:00:00", "2023-01-22T08:00:00", "2023-01-29T08:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 4}, {"uid": "29", "nome": "CHIARA FORNETTI", "ruolo": "incaricato12", "disponibilita": ["2023-01-10T20:00:00", "2023-01-12T20:00:00", "2023-01-19T20:00:00", "2023-01-25T20:00:00", "2023-01-17T20:00:00", "2023-01-08T20:00:00", "2023-01-13T20:00:00", "2023-01-15T20:00:00", "2023-01-24T20:00:00", "2023-01-26T20:00:00", "2023-01-27T20:00:00", "2023-01-28T20:00:00", "2023-01-29T20:00:00", "2023-01-31T20:00:00"], "sedi": ["sassuolo", "formigine"], "n_turni_per_soddisfatto": 7}]}

 */

interface PropsTitleOfPage {
  title: string,
  distretto: string,
  description: string,
}

function TitleOfPage(props: PropsTitleOfPage) {
  return (
    <Grid item>
      <Typography style={{ fontWeight: 900, fontSize: 52 }}>
        {props.title}
      </Typography>
      <Typography variant="h6" component="h6" style={{whiteSpace: 'pre-line'}}>
        {"DISTRETTO: " + props.distretto.toUpperCase() + '\n' + props.description}
      </Typography>
    </Grid>
  )
}

interface PropsInfoTable {
  legendaRuoli: Record<string, string>
  dettagli: boolean
  setDettagli: (arg0: boolean) => void
}

function InfoTable(props: PropsInfoTable) {
  return (
    <Grid item>
      <Grid container direction="row">
      <Grid item sx={{ mr: 2 }}>
        <Grid container direction="column" sx={{ borderRadius: 10, backgroundColor: '#EFEFEFBF', p: 4 }}>
          <Grid item>
            <Typography style={{ fontWeight: 'bold' }}>RUOLI</Typography>
          </Grid>
          {
            Object.keys(props.legendaRuoli).map((ruolo) =>
              <Grid item key={ruolo} sx={{ mt: 1 }}>
                <Grid container direction="row" alignItems="center">
                  <CircleIcon style={{ color: props.legendaRuoli[ruolo] }} sx={{ mr: 1 }} />
                  <Typography>{ruolo}</Typography>
                </Grid>
              </Grid>
            )
          }
        </Grid>
      </Grid>
      <Grid item>
        <Grid container direction="column" sx={{ borderRadius: 10, backgroundColor: '#EFEFEFBF', p: 4 }}>
          <Grid item>
            <Typography style={{ fontWeight: 'bold' }}>DETTAGLI</Typography>
          </Grid>
          <Grid item>
            <Switch
              checked={props.dettagli}
              onChange={(event) => { props.setDettagli(event.target.checked) }}
              inputProps={{ 'aria-label': 'controlled' }}
              />
          </Grid>
        </Grid>
      </Grid>
      </Grid>
    </Grid>
  )
}

export default function PianificazioneTurniPage() {
  const monthData = useAppSelector(state => state.scheduler.month)
  const yearData = useAppSelector(state => state.scheduler.year)
  const dateData = new Date(yearData, monthData, 3)
  const dataScheduler = useAppSelector(state => state.scheduler)
  const [ loadingTurni, setLoadingTurni ] = useState(false)
  const [ dettagli, setDettagli] = useState(false)
  const [ turniUploaded, setTurniUploaded ] = useState(false)
  const [ dataSent, setDataSent ] = useState(false)
  const [ nMedici, setNMedici ] = useState(0)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const legendaRuoli: Record<string, string> = {
    'Incaricato': '#77BA84',
    'Sostituto': '#EDC272',
    'Titolare': '#729DED'
  }
  const [ distretto, setDistretto ] = useState("")

  useEffect(() => {
    if (router.isReady) {
      const defDistretto = router.query.distretto !== undefined ? (Array.isArray(router.query.distretto) ? router.query.distretto.at(0) : router.query.distretto)! : ""
      setDistretto(defDistretto)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  const getTurniMedici = async () => {
    if(yearData === 0) return
    try {
      const dataMedici: any = await getDisponibilitaMeseDistretto(distretto, yearData, monthData)
      const listMedici = getListMediciFromData(dataMedici)
      setNMedici(listMedici ? listMedici.length : 0)
    } catch (error: unknown) {
      if(error instanceof AppFirebaseError) {
        dispatch(setMessageError(error.message))
      } else {
        dispatch(setMessageError("Errore, riprovare!"))
      }
    }
  }

  const getListMediciFromData = (data: Record<string, Record<string, string[]>>) => {
    if(!data) return
    const listOut: string[] = []
    Object.keys(data).forEach(giorno => {
      Object.keys(data[giorno]).forEach(turno => {
        data[giorno][turno].forEach(medico => listOut.includes(medico) ? null : listOut.push(medico))
      })
    })
    return listOut
  }

  const sendDataPianificazione = async () => {
    setLoadingTurni(true)
    try {
      await uploadDefConfigurazione(distretto, dataScheduler)
      setDataSent(true)
    } catch(error: unknown) {
      if (error instanceof AppFirebaseError) {
        dispatch(setMessageError(error.message))
      } else {
        dispatch(setMessageError("Errore, riprovare!"))
      }
    } finally {
      setLoadingTurni(false)
    }
  }

  const callApi = async () => {
    const debugUrlApi = "http://127.0.0.1:8080"
    const urlProductionApi ="https://europe-west1-programmazione-turni-gm.cloudfunctions.net/schedule_from_data"
    const urlApi = process.env.NODE_ENV === 'production' ? urlProductionApi : debugUrlApi
    
    setLoadingTurni(true)
    try {
      const res = await fetch(urlApi,
        {
          method: "POST",
          headers: {
            "Content-Type": "Application/JSON",
            "Access-Control-Request-Method": "POST"
          },
          body: JSON.stringify(data_to_send)
        })
        const jsonData = await res.json()
        if(res.status >= 200 && res.status < 215) {
          dispatch(populateScheduler(jsonData))
          setTurniUploaded(true)
        } else {
          dispatch(setMessageError('Errore: ' + jsonData['message']))
        }
    } catch(e) {
      console.log(e)
    } finally {
      setLoadingTurni(false)
    }
  }

  return (
    <>
    <Head>
      <title>Pianificazione turni</title>
    </Head>
    {dataSent ?
      <Grid container direction="column" justifyContent="center" alignItems="center" minHeight="calc(100vh - 225px)">
        <Grid item>
          <Greetings />
        </Grid>
        <Grid item>
          <ExportExcel excelData={dataScheduler} filename={"Programmazione_Turni_" + monthData + '-' + yearData} />
        </Grid>
      </Grid>
      :
    <Grid container sx={{ px: "11%", pt: 5 }}
        direction="column"
        minHeight="calc(100vh - 225px)"
        minWidth='100vh'
    >
      <Grid item>
        <Grid container direction="row" justifyContent="space-around">
          <Grid item>
            <TitleOfPage
              title="Pianifica i turni" 
              distretto={distretto} 
                  //* Dovrebbe dirti che c'è gente
                  description={""
                    /**!turniUploaded && yearData !== 0 ? "Per " + mesi[dateData.getMonth()+1] + " " + dateData.getFullYear() +  " hanno inserito le loro disponibilità " + nMedici + (nMedici !== 1 ? " medici" : " medico") : "" */}
            />
            <Grid item sx={{pt: 3}}>
              <Typography sx={{pb: 1}} style={{fontWeight: 'bold'}}>Seleziona il mese</Typography>
              <SelectMeseCalendar timestamp_mese={yearData === 0 ? undefined : dateData.getTime()} onChange={(newVal) => {
                if(newVal !== null && (newVal.month() !== monthData || newVal.year() !== yearData)) {
                  dispatch(setMeseAndAnno({
                    month: newVal.month(),
                    year: newVal.year()
                  }))
                  getTurniMedici()
                }
              }}/>
            </Grid>
            <Grid item sx={{pl: 2}}>
              <Grid container spacing={2} alignItems="center" sx={{mt: 4}}>
                <Button
                    variant="contained"
                    component="label"
                    disabled={loadingTurni}
                    onClick={turniUploaded ? sendDataPianificazione : callApi} 
                  >
                    {
                      turniUploaded ? "Conferma i turni" : "Pianifica i turni"
                    }
                </Button>
                {
                  loadingTurni && (
                    <>
                      <CircularProgress sx={{mx:2}}/>
                      <Typography style={{ color: '#868686'}}>Stiamo creando la tabella dei turni...</Typography>
                    </>
                  )
                }
              </Grid>
            </Grid>
          </Grid>
          {
            turniUploaded &&
            <InfoTable legendaRuoli={legendaRuoli} dettagli={dettagli} setDettagli={setDettagli}/>
          }
        </Grid>
      </Grid>
      {
        turniUploaded && <TableResult dettagli={dettagli}/>
      }
    </Grid>}
    </>
  )
}