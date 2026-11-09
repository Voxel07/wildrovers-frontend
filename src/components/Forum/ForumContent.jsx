import { useMemo } from 'react';
import DOMPurify from 'dompurify';
import { Box } from '@mui/material';
// Content styles only (lists, alignment, sizes, indents); no Quill JavaScript is loaded.
import 'react-quill-new/dist/quill.core.css';

// Links in posts open in a new tab without giving the target page access to this one.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const PURIFY_OPTIONS = {
  ADD_ATTR: ['target'],
  FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
};

/**
 * Shows stored forum HTML (posts, answers, previews) as static markup. The backend already
 * sanitises it when it is saved; DOMPurify is a second layer in the browser. Rendering the
 * markup directly replaces one read-only Quill editor per post or answer.
 */
export default function ForumContent({ html, className }) {
  const clean = useMemo(() => DOMPurify.sanitize(html || '', PURIFY_OPTIONS), [html]);
  return (
    <Box className={['quill-viewer', className].filter(Boolean).join(' ')}>
      <div className="ql-container ql-snow">
        {/* eslint-disable-next-line react/no-danger -- sanitised above with DOMPurify */}
        <div className="ql-editor" dangerouslySetInnerHTML={{ __html: clean }} />
      </div>
    </Box>
  );
}
