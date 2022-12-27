import React from 'react'
import Button from '@mui/material/Button'
import FileSaver from 'file-saver'
import { write, utils } from 'sheetjs-style'
import Tooltip from '@mui/material/Tooltip'
import { SchedulerState } from '../logic/redux/scheduler_slice'
import { getGiornoSettimana } from '../logic/local_storage'

//* Da abbellire

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

    const formatData = () => {
        const sedi = Object.keys(props.excelData.turni)
        let maxMedPerTurno = getMaxMedPerTurno();
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
        console.log(data)
        return data
    }

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    const fileExtension = '.xlsx'
    
    const exportToExcel = async () => {
        const datas = formatData()
        const ws = utils.json_to_sheet(datas)
        /**
         * const merge = [
                { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },{ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
                ];
                ws["!merges"] = merge;
            Per fare merge delle righe o colonne
         */
        const wb = { Sheets: { 'Programmazione': ws }, SheetNames: ['Programmazione']}
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