import * as React from 'react';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
// import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { DoctorInterface } from '../logic/server/firestore/firestore';
import { GenericAlertDialog } from './general/alert_dialog';
import { FormSingleDoctor } from '../pages/modify_doctors_admin';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useAppDispatch, useAppSelector } from '../logic/redux/store';
import { removeDoctorFromDistrictSlice, setDoctorOfDistrictSlice } from '../logic/redux/configuration_district_slice';
import AddIcon from '@mui/icons-material/AddRounded';
import { Dialog } from 'primereact/dialog';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string | string[]},
  b: { [key in Key]: number | string | string[]},
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof DoctorInterface;
  label: string;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    disablePadding: true,
    label: 'Nome',
  },
  {
    id: 'role',
    disablePadding: false,
    label: 'Ruolo',
  },
  {
    id: 'email',
    disablePadding: false,
    label: 'Email',
  }
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof DoctorInterface) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
    props;
  const createSortHandler =
    (property: keyof DoctorInterface) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'Discendente' : 'Ascendente'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  docs_selected: string[]
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const numSelected = props.docs_selected.length
  const [showModalCreateDoc, setShowModalCreateDoc] = React.useState(false)
  const dispatch = useAppDispatch()
  //TODO: In futuro aggiungi funzionalità di recupero dati locali se l'utente si è interrotto e si era registrato

  const onDelete = () => {
    for(const d of props.docs_selected) {
      dispatch(removeDoctorFromDistrictSlice(d))
    }
  }

  const handleCreateMedico = async (med: DoctorInterface) => {
    dispatch(setDoctorOfDistrictSlice(med))
    setShowModalCreateDoc(false)
  }

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected.toString() + (numSelected === 1 ? ' selezionato' : ' selezionati')} 
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Medici
        </Typography>
      )}
      {numSelected > 0 ? (
        <Tooltip title="Elimina">
          <IconButton onClick={onDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Aggiungi un medico">
            <IconButton onClick={() => setShowModalCreateDoc(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filtra">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
      <Dialog header="Aggiungi un medico" visible={showModalCreateDoc} style={{ width: '50vw' }} onHide={() => setShowModalCreateDoc(false)}>
        <FormSingleDoctor onSetDoctor={handleCreateMedico} showTitle={false}/>
      </Dialog>
    </Toolbar>
  );
}

export default function EnhancedTable() {
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<"name" | "role">('name');
  const [selected, setSelected] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const doctors = useAppSelector(state => state.configurationDistr.doctors)
  const rows = Object.keys(doctors).map(k => doctors[k])

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof DoctorInterface,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    if (property === "name" || property === "role") {
      setOrderBy(property);
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.email);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (email: string) => {  // event: React.MouseEvent<unknown>, 
    const selectedIndex = selected.indexOf(email);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, email);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (email: string) => selected.indexOf(email) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar docs_selected={selected} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {rows.slice().sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((doctor) => {
                  const isItemSelected = isSelected(doctor.email);

                  return (
                    <RowTableDoctor key={doctor.email} isSelected={isItemSelected} doc={doctor} onSelect={handleClick}/>
                  )
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

interface ParamsRowTabelDoctor {
  doc: DoctorInterface
  isSelected: boolean
  onSelect: (arg0: string) => void
}

const RowTableDoctor = (props: ParamsRowTabelDoctor) => {
  const [showModal, setShowModal] = React.useState(false)
  const dispatch = useAppDispatch()

  const editDoctor = (e: any) => {
    e.preventDefault()
    e.stopPropagation()
    setShowModal(true)
  }

  const handleDelete = async (idDoc: string) => {
    dispatch(removeDoctorFromDistrictSlice(idDoc))
    setShowModal(false)
  }

  const handleSetMedico = async (med: DoctorInterface) => {
    dispatch(setDoctorOfDistrictSlice(med))
    setShowModal(false)
  }

  return (
    <>
      <TableRow
        hover
        onClick={() => props.onSelect(props.doc.email)}
        role="checkbox"
        tabIndex={-1}
        key={'table' + props.doc.email}
        selected={props.isSelected}
      >
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            checked={props.isSelected}
          />
        </TableCell>
        <TableCell
          component="th"
          scope="row"
          padding="none"
        >
          <IconButton>
            <EditRoundedIcon onClick={editDoctor} />
          </IconButton>
          {props.doc.name}
        </TableCell>
        <TableCell align="left">{props.doc.role}</TableCell>
        <TableCell align="left">{props.doc.email}</TableCell>
      </TableRow>
      <GenericAlertDialog open={showModal} onClose={() => setShowModal(false)}
      content={
        <>
            <FormSingleDoctor 
            doctor={props.doc} 
            onDelete={handleDelete}
            onSetDoctor={handleSetMedico}/>
        </>
      }/>
    </>

  )
}