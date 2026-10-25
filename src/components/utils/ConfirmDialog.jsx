import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

/** Yes/no question in the app's own style, replacing window.confirm(). */
const ConfirmDialog = ({ open, title, message, confirmLabel = 'Löschen', onConfirm, onCancel }) => (
  <Dialog open={open} onClose={onCancel} aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-text">
    <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
    <DialogContent>
      <DialogContentText id="confirm-dialog-text">{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel}>Abbrechen</Button>
      <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
