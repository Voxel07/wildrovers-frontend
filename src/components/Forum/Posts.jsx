import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Checkbox,
  Tooltip,
  Stack,
  Chip,
  Switch,
  FormControlLabel,
  Paper,
  Button
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';
import { visuallyHidden } from '@mui/utils';

import { convertTimestamp, formatNumber } from '../../helper/converter';
import ForumChips from './ForumChips';
import { AlertsContext } from '../utils/AlertsManager';

function descendingComparator(a, b, orderBy) {
  let valA = a[orderBy];
  let valB = b[orderBy];
  if (orderBy === 'stats') {
    valA = a.answerCount;
    valB = b.answerCount;
    if (valA === valB) {
      valA = a.views;
      valB = b.views;
    }
  }
  if (valB < valA) {
    return -1;
  }
  if (valB > valA) {
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
    id: 'icon',
    numeric: false,
    disablePadding: true,
    label: ''
  },
  {
    id: 'title',
    numeric: false,
    disablePadding: false,
    label: 'Titel des Posts',
  },
  {
    id: 'stats',
    numeric: true,
    disablePadding: false,
    label: 'Statistik'
  }
];

function EnhancedTableHead(props) {
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, multi } = props;

  const createSortHandler = (property) => (event) => {
    if (property === 'icon') return; // Icon is not sortable
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {multi && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ 'aria-label': 'all posts' }}
            />
          </TableCell>
        )}

        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id !== 'icon' ? (
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
            ) : headCell.label}
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
  multi: PropTypes.bool.isRequired,
};

const EnhancedTableToolbar = (props) => {
  const { numSelected, handleEdit, handleAdd, handleDelete, topicTitle } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        borderRadius: '8px 8px 0 0',
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
          {numSelected} ausgewählt
        </Typography>
      ) : (
        <div></div>
      )}

      {numSelected > 0 ? (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Editieren">
            <IconButton onClick={handleEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Löschen">
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ) : (
        <div></div>
      )}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  topicTitle: PropTypes.string,
  handleAdd: PropTypes.func.isRequired,
  handleEdit: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
};

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonOpen = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonOpen = (event) => {
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
        onClick={handleBackButtonOpen}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonOpen}
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

export default function Posts(props) {
  const navigate = useNavigate();
  const alertsManagerRef = use(AlertsContext);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('creationDate');
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [dense, setDense] = useState(false);
  const [multi, setMulti] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState([]);

  // Sync state with incoming props
  useEffect(() => {
    if (props.posts) {
      setTableData(props.posts);
    }
  }, [props.posts]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = tableData.map((n) => n.title);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (event, title) => {
    event.stopPropagation();
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

  const handleRowClick = (id) => {
    if (!multi) {
      navigate(`/Forum/Post/${id}`);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    navigate('/Forum/Texteditor', { state: { topicId: props.topicId } });
  };

  const handleEdit = () => {
    alertsManagerRef.current.showAlert('info', 'Edit click');
  };

  const handleDelete = () => {
    // Delete selected items
    const updatedData = tableData.filter(entry => !selected.includes(entry.title));
    setTableData(updatedData);
    setSelected([]);
  };

  const isSelected = (title) => selected.indexOf(title) !== -1;

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: 'background.paper', borderRadius: 2 }}>
      <EnhancedTableToolbar
        numSelected={selected.length}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        topicTitle={props.topic}
      />
      <TableContainer>
        <Table
          sx={{ minWidth: { xs: 300, sm: 600 } }}
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
            multi={multi}
          />
          <TableBody>
            {tableData
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                const isItemSelected = isSelected(row.title);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    onClick={() => handleRowClick(row.id)}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.id || index}
                    selected={isItemSelected}
                    sx={{
                      cursor: 'pointer',
                      opacity: row.viewed ? 0.75 : 1,
                      backgroundColor: row.viewed ? 'rgba(255, 255, 255, 0.01)' : 'inherit',
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                  >
                    {multi && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          onClick={(event) => handleCheckboxClick(event, row.title)}
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{ 'aria-labelledby': labelId }}
                        />
                      </TableCell>
                    )}
                    <TableCell align="center" padding="none" sx={{ width: 60 }}>
                      <ForumIcon color={row.viewed ? "disabled" : "primary"} fontSize="medium" />
                    </TableCell>
                    <TableCell align="left">
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 'bold',
                            color: row.viewed ? 'text.secondary' : 'text.primary'
                          }}
                        >
                          {row.title}
                        </Typography>
                        {!dense && (
                          <Typography variant="caption" color="text.secondary">
                            von: {row.creator} | {convertTimestamp(row.creationDate)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ width: 180 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ForumChips
                          items={[
                            { tooltip: "Antworten", icon: <ForumIcon />, label: formatNumber(row.answerCount) },
                            { tooltip: "Aufrufe", icon: <VisibilityIcon />, label: formatNumber(row.views) }
                          ]}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            {emptyRows > 0 && (
              <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                <TableCell colSpan={multi ? 4 : 3} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        ActionsComponent={TablePaginationActions}
      />

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Stack direction="row" spacing={2}>
          <FormControlLabel
            control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />}
            label="Kompakte Ansicht"
          />
          <FormControlLabel
            control={<Switch checked={multi} onChange={(e) => setMulti(e.target.checked)} />}
            label="Mehrfachauswahl"
          />
        </Stack>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Beitrag hinzufügen
        </Button>
      </Stack>
    </Paper>
  );
}

Posts.propTypes = {
  posts: PropTypes.array,
  topic: PropTypes.string,
  topicId: PropTypes.number,
};
