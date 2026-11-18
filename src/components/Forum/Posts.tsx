import { useState, useEffect, type ChangeEvent, type MouseEvent } from 'react';
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
  Paper,
  Button
} from '@mui/material';
import type { TablePaginationActionsProps } from '@mui/material/TablePaginationActions';

import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ForumIcon from '@mui/icons-material/Forum';
import VisibilityIcon from '@mui/icons-material/Visibility';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

import { convertTimestamp, formatNumber } from '../../helper/converter';
import ForumChips from './ForumChips';
import type { ForumPost } from '../../types';

type Order = 'asc' | 'desc';
/** A post field, or 'stats' for answers, then views. */
type SortKey = keyof ForumPost | 'stats';

interface PostsProps {
  posts?: ForumPost[];
  topic?: string;
  topicId?: number | string;
  // Server-side paging: total row count, current page (0-based), page size and change handler.
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (page: number, rowsPerPage: number) => void;
}

function descendingComparator(a: ForumPost, b: ForumPost, orderBy: SortKey): number {
  let valA = (orderBy === 'stats' ? undefined : a[orderBy]) as number | string | undefined;
  let valB = (orderBy === 'stats' ? undefined : b[orderBy]) as number | string | undefined;
  if (orderBy === 'stats') {
    valA = a.answerCount;
    valB = b.answerCount;
    if (valA === valB) {
      valA = a.views;
      valB = b.views;
    }
  }
  if (valA === undefined || valB === undefined) {
    // Same order as comparing with undefined in JavaScript: never smaller, never larger.
    return 0;
  }
  if (valB < valA) {
    return -1;
  }
  if (valB > valA) {
    return 1;
  }
  return 0;
}

function getComparator(order: Order, orderBy: SortKey): (a: ForumPost, b: ForumPost) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}



function TablePaginationActions(props: TablePaginationActionsProps) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleBackButtonOpen = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonOpen = (event: MouseEvent<HTMLButtonElement>) => {
    onPageChange(event, page + 1);
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
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
    </Box>
  );
}

export default function Posts(props: PostsProps) {
  const navigate = useNavigate();
  // Newest first; the table has no sortable headers.
  const order: Order = 'desc';
  const orderBy: SortKey = 'creationDate';
  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);
  const [tableData, setTableData] = useState<ForumPost[]>([]);
  // With `total` the parent pages on the server and `posts` is already the current page.
  const serverPaged = props.total !== undefined;
  const page = serverPaged ? props.page ?? 0 : localPage;
  const rowsPerPage = serverPaged ? props.rowsPerPage ?? 10 : localRowsPerPage;

  // Sync state with incoming props
  useEffect(() => {
    if (props.posts) {
      setTableData(props.posts);
    }
  }, [props.posts]);

  const handleRowClick = (id: number) => {
    navigate(`/Forum/Post/${id}`);
  };

  const handleChangePage = (_event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    if (serverPaged) props.onPageChange?.(newPage, rowsPerPage);
    else setLocalPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const size = parseInt(event.target.value, 10);
    if (serverPaged) {
      props.onPageChange?.(0, size);
    } else {
      setLocalRowsPerPage(size);
      setLocalPage(0);
    }
  };

  const handleAdd = () => {
    navigate('/Forum/Texteditor', { state: { topicId: props.topicId } });
  };

  const totalRows = serverPaged ? props.total ?? 0 : tableData.length;
  const pageStart = serverPaged ? 0 : page * rowsPerPage;
  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - totalRows) : 0;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', bgcolor: 'background.paper', borderRadius: 2 }}>
      <TableContainer>
        <Table
          sx={{ minWidth: { xs: 300, sm: 600 } }}
          aria-labelledby="tableTitle"
          size='small'
        >
          <TableBody>
            {tableData
              .slice()
              .sort(getComparator(order, orderBy))
              .slice(pageStart, pageStart + rowsPerPage)
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
                          von: {row.creator}
                          <Box
                            component="span"
                            sx={{
                              display: 'none',
                              '@media (min-width: 450px)': { display: 'inline' },
                            }}
                          >
                            {' | '}{convertTimestamp(row.creationDate)}
                          </Box>
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ width: 180 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ForumChips
                          compact
                          items={[
                            { tooltip: "Antworten", icon: <ForumIcon />, label: formatNumber(row.answerCount ?? 0) },
                            { tooltip: "Aufrufe", icon: <VisibilityIcon />, label: formatNumber(row.views ?? 0) }
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
        count={totalRows}
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
