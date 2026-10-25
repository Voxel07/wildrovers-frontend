import { lazy, Suspense } from 'react';
import Modal from '@mui/material/Modal';

const SignIn = lazy(() => import('../../Pages/LogIn/LogIn'));

/**
 * Shown when the session ends while the user is on a page. Logging in here keeps
 * the page (and anything typed into it) instead of navigating away.
 */
const SessionExpiredDialog = ({ open, onClose }) => (
  <Modal open={open} onClose={onClose} aria-labelledby="session-expired-title">
    <div>
      <Suspense fallback={null}>
        <SignIn
          modal
          callback={onClose}
          notice="Deine Sitzung ist abgelaufen. Melde dich erneut an, um weiterzumachen – deine Eingaben bleiben erhalten."
        />
      </Suspense>
    </div>
  </Modal>
);

export default SessionExpiredDialog;
