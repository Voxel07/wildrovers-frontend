import React, { useState, useEffect, use } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Box,
  IconButton,
  Typography,
  Tooltip,
  Stack,
  Chip,
  Paper,
  Button
} from '@mui/material';

import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

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
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('creationDate');
  const [page, setPage] = useState(0);
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

  const handleRowClick = (id) => {
    navigate(`/Forum/Post/${id}`);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: 'background.paper', borderRadius: 2 }}>
      <TableContainer>
        <Table
          sx={{ minWidth: { xs: 300, sm: 600 } }}
          aria-labelledby="tableTitle"
          size='medium'
        >
          <TableBody>
            {tableData
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => {
                return (
                  <TableRow
                    hover
                    onClick={() => handleRowClick(row.id)}
                    tabIndex={-1}
                    key={row.id || index}
                    sx={{
                      cursor: 'pointer',
                      opacity: row.viewed ? 0.75 : 1,
                      backgroundColor: row.viewed ? 'rgba(255, 255, 255, 0.01)' : 'inherit',
                      transition: 'opacity 0.2s, background-color 0.2s',
                    }}
                  >
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
                        <Typography variant="caption" color="text.secondary">
                          von: {row.creator} | {convertTimestamp(row.creationDate)}
                        </Typography>
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
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={3} />
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

      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Beitrag hinzufügen
        </Button>
      </Box>
    </Paper>
  );
}

Posts.propTypes = {
  posts: PropTypes.array,
  topic: PropTypes.string,
  topicId: PropTypes.number,
};
