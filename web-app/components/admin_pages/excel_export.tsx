import React, { ChangeEvent, useState } from 'react'
import Button from '@mui/material/Button'
import FileSaver from 'file-saver'
import { write, utils, read } from 'xlsx' //Capire perchè non ti installa la 0.19.1
import Tooltip from '@mui/material/Tooltip'
import { getAllTurni, SchedulerState } from '../../logic/redux/scheduler_slice'
import { getGiornoSettimana } from '../../logic/local_utilities'
import Typography from '@mui/material/Typography'

export function ImportFileExcel() {
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [ resultCsv, setResultCsv ] = useState("")

    // https://stackoverflow.com/questions/8238407/how-to-parse-excel-xls-file-in-javascript-html5

    const importExcel = async (excelFile: File) => {
        setLoading(true)
        const textFile = await excelFile.text()
        const wb = read(textFile, {
            type: 'binary'
        })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const csv = utils.sheet_to_csv(ws)
        setLoading(false)
    }

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (files && files.length > 0) {
            if (files.length > 1) {
                throw "Puoi caricare al massimo 1 file" //* Metti alert
            }
            const newFile = files.item(0)
            setFile(newFile)
            importExcel(newFile!)
        }
    };
    return (
        <>
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
            {
                resultCsv && <Typography>{resultCsv}</Typography>
            }
        </>
)}

interface PropsExportExcel {
    excelData: SchedulerState,
    filename: string
}

const ExportExcel = (props: PropsExportExcel) => {
    const getTurni = () => {
        const turniOut: string[] = []
        for (const sede of Object.keys(props.excelData.turni)) {
            const turni = Object.keys(props.excelData.turni[sede])
            turni.forEach((turno: string) => turniOut.includes(turno) ? null : turniOut.push(turno))
        }
        return turniOut.sort()
    }
    const getMaxMedPerTurno = () => {
        let max = 0
        for (const sede of Object.keys(props.excelData.turni)) {
            const med_per_turno = props.excelData.med_per_turno[sede]
            if (med_per_turno > max) {
                max = med_per_turno
            }
        }
        return max
    }

    const getTextTurno = (turno: string) => {
        const numberDay = parseInt(turno.split('T')[0])
        let out = ""
        out += getGiornoSettimana((new Date(props.excelData.year, props.excelData.month)).getTime(), numberDay)
        out += ' ' + numberDay.toString()
        out += ', ' + turno.split('T')[1]
        return out
    }

    const formatDataProgrammazione = () => {
        const sedi = Object.keys(props.excelData.turni)
        const maxMedPerTurno = getMaxMedPerTurno();
        const listTurni = getTurni()
        const data: Record<string, string>[] = []
        listTurni.forEach(turno => {
            for(let i = 0; i < maxMedPerTurno; i++) {
                const tmpTurno: Record<string, string> = {
                    'Turno': getTextTurno(turno)
                }
                for(const sede of sedi) {
                    const valTurniSede = props.excelData.turni[sede]
                    if (!Object.keys(valTurniSede).includes(turno)) continue
                    if (props.excelData.med_per_turno[sede] > i) {
                        if (valTurniSede[turno].length > i) {
                            const id_med = valTurniSede[turno][i]
                            tmpTurno[sede] = props.excelData['medici_mod'][id_med].nome
                        } else {
                            tmpTurno[sede] = "Vuoto"
                        }
                    }
                }
                data.push(tmpTurno)
            }
        })
        return data
    }

    const fixedHeader = ['Nome', 'Ruolo', 'N° turni', 'Sedi', 'Disponibilità']
    const getHeader = () => {
        const allTurni = getAllTurni(props.excelData)
        const head = [...fixedHeader, ...allTurni]
        return head
    }

    const formatDataDisponibilita = () => {
        const offset = fixedHeader.length
        const out = []
        const header = getHeader()
        out.push(header)
        const allTurni = header.slice(offset)
        for (const id_med of Object.keys(props.excelData.medici_orig)) {
            const med = props.excelData.medici_orig[id_med]
            if (med.disponibilita.length === 0) {
                continue
            }
            const tmp: (string | number | null)[] = [med.nome, med.ruolo, med.n_turni_per_soddisfatto, med.sedi.join(', '), null, ...(new Array(allTurni.length).fill(null))]
            //tmp.push(med.disponibilita.map(disp => disp.replace('T', ' Turno ').replace(':00', '').replace(':', '-')).join(', ')
            allTurni.forEach((turno, index) => {
                med.disponibilita.forEach((dispMedico) => {
                    if(turno === dispMedico) {
                        tmp.splice(offset+index, 1, 'x')
                    }
                })
            })
            out.push(tmp)
        }
        return out
    }

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'
    
    function fitToColumn(arrayOfArray: any[][]) {
        // get maximum character of each column
        return arrayOfArray[0].map((a, i) => ({ wch: Math.max(...arrayOfArray.map(a2 => a2[i] ? a2[i].toString().length : 0)) }));
    }

    const exportToExcel = async () => {
        const data_programmazione = formatDataProgrammazione()
        const data_disponibilita = formatDataDisponibilita()
        const ws_program = utils.json_to_sheet(data_programmazione)
        const ws_disponibilita = utils.aoa_to_sheet(data_disponibilita)
        ws_disponibilita['!cols'] = fitToColumn(data_disponibilita);
        /**
         * const merge = [
                { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },{ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
                ];
                ws["!merges"] = merge;
            Per fare merge delle righe o colonne
         */
        const wb = { 
            Sheets: { 
                'Programmazione': ws_program, 
                'Disponibilità': ws_disponibilita 
            }, 
            SheetNames: ['Programmazione', 'Disponibilità']
        }
        
        const excelBuffer = write(wb, {bookType: 'xlsx', type: 'array'})
        const data = new Blob([excelBuffer], { type: fileType })
        FileSaver.saveAs(data, props.filename + fileExtension)
    }

    return (
        <>
            <Tooltip title="Esporta Excel">
                <Button variant="contained" onClick={exportToExcel}>
                    Scarica
                </Button>
            </Tooltip>
        </>
    )
}

export default ExportExcel