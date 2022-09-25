import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import { Table
  , TableBody
  , TableCell
  , TableContainer
  , TableHead
  , TablePagination
  , TableRow
  , TableSortLabel
  , TableFooter  } from '@mui/material';

import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ForumIcon from '@mui/icons-material/Forum';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { visuallyHidden } from '@mui/utils';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import VisibilityIcon from '@mui/icons-material/Visibility';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { orange } from '@material-ui/core/colors';

function createData(name, answers, views) {
  return {
    name,
    answers,
    views,
  };
}

const formatter = Intl.NumberFormat('en',
{
    notation:'compact'
})

const rows = [
  createData('Cupcake', 305, 5500000000),
  createData('Donut', 452, 490),
  createData('Eclair', 262, 1000),
  createData('Frozen yoghurt', 159, 250),
  createData('Gingerbread', 356, 239),
  createData('Honeycomb', 123, 8000),
  createData('Ice cream sandwich', 237, 10001),
  createData('Jelly Bean', 375, 1500000),
  createData('KitKat', 518, 2000),
  createData('Lollipop', 392, 459),
  createData('Marshmallow', 318, 0),
  createData('Nougat', 360, 1200),
  createData('Oreo', 437, 438)
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  {
    id:'read',
    numeric: false,
    disablePadding:true,
    label: 'Gelesen'
  },
  {
    id: 'name',
    numeric: false,
    disablePadding: true,
    label: 'Titel des Posts',
  },
  {
    id: 'answers',
    numeric: true,
    disablePadding: false,
    label: 'Antworten'
  },
  {
    id: 'views',
    numeric: true,
    disablePadding: false,
    label: 'Aufrufe',
  }
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, multi } =
    props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
      {
        multi ?
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={numSelected > 0 && numSelected < rowCount}
                  checked={rowCount > 0 && numSelected === rowCount}
                  onChange={onSelectAllClick}
                  inputProps={{
                    'aria-label': 'Alles auswählen',
                  }}
                />
              </TableCell>:null }

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
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
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleEdit, handleAdd, handleDelete, topicTitle } = props;

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
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          {topicTitle}
        </Typography>
      )}

      {numSelected > 0 ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Edit">
            <IconButton onClick={()=>handleEdit(props)}>
              <EditIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete">
            <IconButton onClick={()=>handleDelete(props)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Add">
          <IconButton onClick={()=>handleAdd(props)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
          <Tooltip title="Filter list">
            <IconButton>
              <FilterListIcon />
            </IconButton>
          </Tooltip>
      </Stack>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function Post(props) {
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('calories');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [multi, setMulti] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tableData, setTableData] = useState(rows)

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked && selected.length < rowsPerPage) {
      const newSelected = tableData.slice(0, rowsPerPage).map((n) => n.name);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const handleChangeMulti = (event) => {
    setMulti(event.target.checked);
  };

  function handleAdd(prop){
    console.log("handleAdd")
    console.log(prop)

  }

  function handleEdit(prop){
    console.log("handleEdit")
    console.log(prop)


  }

  function handleDelete(item){
    const filterList = item.sel;

    let newData = tableData;

    filterList.forEach(elm =>{
      newData = newData.filter(entry=>{
        return entry.name !== elm
      })
    })


    setTableData(newData);
    setSelected([]);

  }

  const isSelected = (name) => selected.indexOf(name) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
        <TableContainer>
        <EnhancedTableToolbar numSelected={selected.length} sel={selected} handleAdd={handleAdd} handleEdit={handleEdit} handleDelete={handleDelete} topicTitle={props.topic} />
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              multi={multi}
            />
            <TableBody>

              {tableData.slice().sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.name);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.name}
                      selected={isItemSelected}
                    >
                    {multi?
                    <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(event) => handleClick(event, row.name)}
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>:null
                      }
                <TableCell align="center" padding='none' width={45}>
                    <ForumIcon sx={{ color:orange[500] }}  fontSize="medium"/>
                </TableCell>
                <TableCell align="left">
                <List
                    sx={{
                     maxHeight: '40px',
                     padding: 0
                    }}>
                    <ListItem
                    sx={{
                        maxHeight: '30px',
                        padding: 0,
                    }}>
                      {
                        <ListItemText primary={row.name} secondary={dense? "": "von matze, 04.05.2022"} />
                      }
                    </ListItem>
                    </List>
                </TableCell>
                <TableCell sx={{width:20}}>
                <Stack direction="row" spacing={1}   justifyContent="flex-end"  alignItems="center">
                    <Tooltip title="Antworten" placement="top-end">
                        <Chip icon={<ForumIcon/>} label={formatter.format(row.answers)} variant="outlined" />
                    </Tooltip>
                </Stack>
                </TableCell>
                <TableCell sx={{width:20}}>
                  <Stack direction="row" spacing={1}   justifyContent="flex-end"  alignItems="center">
                    <Tooltip title="Aufrufe" placement="top-end">
                    <Chip icon={<VisibilityIcon/>} label={formatter.format(row.views)} variant="outlined" size='medium'/>
                  </Tooltip>
                </Stack>
                </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
      </Table>

                <TablePagination
                  rowsPerPageOptions={[5, 10, 15, { value: -1, label: 'Alle' }]}
                  component="div"
                  count={tableData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  ActionsComponent={TablePaginationActions}
                  pos
                />

                <FormControlLabel
                  control={<Switch checked={dense} onChange={handleChangeDense} />}
                  label="Dense padding"
                />
                <FormControlLabel
                  control={<Switch checked={multi} onChange={handleChangeMulti} />}
                  label="Block bearbeitung"
                />

      </TableContainer>

  );
}
