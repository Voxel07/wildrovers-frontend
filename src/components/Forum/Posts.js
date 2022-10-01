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

import {convertTimestamp, formatNumber} from '../../helper/converter'

function createData(title, answerCount, views, creationDate, creator) {
  return {
    title,
    answerCount,
    views,
    creationDate,
    creator
  };
}

const rows = [
  createData('Cupcake', 305, 5500000000, 1664361787659, "camo"),
  createData('Donut', 452, 490, 1664361787659, "camo"),
  createData('Eclair', 262, 1000, 1664361787659, "camo"),
  createData('Frozen yoghurt', 159, 250, 1664361787659, "camo"),
  createData('Gingerbread', 356, 239, 1664361787659, "camo"),
  createData('Honeycomb', 123, 8000, 1664361787659, "camo"),
  createData('Ice cream sandwich', 237, 10001, 1664361787659, "camo"),
  createData('Jelly Bean', 375, 1500000, 1664361787659, "camo"),
  createData('KitKat', 518, 2000, 1664361787659, "camo"),
  createData('Lollipop', 392, 459, 1664361787659, "camo"),
  createData('Marshmallow', 318, 0, 1664361787659, "camo"),
  createData('Nougat', 360, 1200, 1664361787659, "camo"),
  createData('Oreo', 437, 438, 1664361787659, "camo")
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
    id: 'answerCount',
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

function MyTableBody(props){
  const { tableData, order, orderBy, page, rowsPerPage, isSelected, multi, handleClick, dense, emptyRows } =
  props;
  return(
    <TableBody>

    {tableData.slice().sort(getComparator(order, orderBy))
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row, index) => {
        const isItemSelected = isSelected(row.title);
        const labelId = `enhanced-table-checkbox-${index}`;

        return (
          <TableRow
            hover
            role="checkbox"
            aria-checked={isItemSelected}
            tabIndex={-1}
            key={row.title}
            selected={isItemSelected}
          >
          {multi?
          <TableCell padding="checkbox">
              <Checkbox
                onClick={(event) => handleClick(event, row.title)}
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
              <ListItemText primary={row.title} secondary={dense? "": "von: "+ row.creator + " am: " + convertTimestamp(row.timestamp,true)} />
            }
          </ListItem>
          </List>
      </TableCell>
      <TableCell sx={{width:20}}>
      <Stack direction="row" spacing={1}   justifyContent="flex-end"  alignItems="center">
          <Tooltip title="Antworten" placement="top-end">
              <Chip icon={<ForumIcon/>} label={formatNumber(row.answerCount)} variant="outlined" />
          </Tooltip>
      </Stack>
      </TableCell>
      <TableCell sx={{width:20}}>
        <Stack direction="row" spacing={1}   justifyContent="flex-end"  alignItems="center">
          <Tooltip title="Aufrufe" placement="top-end">
          <Chip icon={<VisibilityIcon/>} label={formatNumber(row.views)} variant="outlined" size='medium'/>
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
  )
}

MyTableBody.propTypes = {
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
  // const [tableData, setTableData] = useState(props.posts)

  console.log("props:")
  console.log(props.posts)
  console.log(tableData)

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  //This breaks is the order isn't title
  const handleSelectAllClick = (event) => {
    if (event.target.checked && selected.length < rowsPerPage) {
      const newSelected = tableData.slice(0, rowsPerPage).map((n) => n.title);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, title) => {
    const selectedIndex = selected.indexOf(title);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, title);
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
        return entry.title !== elm
      })
    })


    setTableData(newData);
    setSelected([]);

  }

  const isSelected = (title) => selected.indexOf(title) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;
    // page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.posts.length) : 0;

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
              rowCount={tableData.length}
              // rowCount={props.posts.length}
              multi={multi}
            />
            <MyTableBody
              page={page}
              rowsPerPage={rowsPerPage}
              isSelected={isSelected}
              handleClick={handleClick}
              onSelectAllClick={handleSelectAllClick}
              dense={dense}
              order={order}
              orderBy={orderBy}
              rowCount={tableData.length}
              tableData={tableData}
              emptyRows={emptyRows}
              multi={multi}
            />
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
