import React, { useRef, useState, useEffect, useCallback, useMemo, useImperativeHandle, use } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Box } from '@mui/material';
import api from '../../helper/api';
import { AlertsContext } from '../utils/AlertsManager';

const noModules = { toolbar: false };

const ForumQuill = React.forwardRef(({ value, onChange, placeholder, style, readOnly, height }, ref) => {
  const alertsManagerRef = use(AlertsContext);
  const quillRef = useRef(null);

  // Expose the underlying quill methods via forwarded ref
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    focus: () => quillRef.current?.focus(),
    blur: () => quillRef.current?.blur(),
  }));

  // Image resize state
  const [resizeTarget, setResizeTarget] = useState(null); // { blot, domNode } | null
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startWidth: 0 });
  const outlineRef = useRef(null);   // selection border DOM node
  const handleRef = useRef(null);    // drag handle DOM node
  const rafRef = useRef(null);

  // Keep resize-handle position in sync with the image via rAF
  const syncHandlePos = useCallback(() => {
    if (!resizeTarget || !outlineRef.current || !handleRef.current) return;
    const rect = resizeTarget.domNode.getBoundingClientRect();
    outlineRef.current.style.top = `${rect.top}px`;
    outlineRef.current.style.left = `${rect.left}px`;
    outlineRef.current.style.width = `${rect.width}px`;
    outlineRef.current.style.height = `${rect.height}px`;
    handleRef.current.style.top = `${rect.bottom - 8}px`;
    handleRef.current.style.left = `${rect.right - 8}px`;
    rafRef.current = requestAnimationFrame(syncHandlePos);
  }, [resizeTarget]);

  useEffect(() => {
    if (!resizeTarget) return;
    // Set initial position before first paint
    const rect = resizeTarget.domNode.getBoundingClientRect();
    if (outlineRef.current) {
      outlineRef.current.style.top = `${rect.top}px`;
      outlineRef.current.style.left = `${rect.left}px`;
      outlineRef.current.style.width = `${rect.width}px`;
      outlineRef.current.style.height = `${rect.height}px`;
    }
    if (handleRef.current) {
      handleRef.current.style.top = `${rect.bottom - 8}px`;
      handleRef.current.style.left = `${rect.right - 8}px`;
    }
    rafRef.current = requestAnimationFrame(syncHandlePos);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [resizeTarget, syncHandlePos]);

  // Commit image width through Quill's API so it persists in the document model
  const commitImageWidth = useCallback((pxWidth) => {
    if (!resizeTarget || !quillRef.current) return;
    const editor = quillRef.current.getEditor();
    try {
      const index = editor.getIndex(resizeTarget.blot);
      editor.formatText(index, 1, 'width', `${Math.round(Math.max(60, pxWidth))}px`);
    } catch (e) {
      console.error('Failed to format image width', e);
    }
  }, [resizeTarget]);

  // Drag handlers
  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resizeTarget) return;
    dragRef.current = {
      startX: e.clientX,
      startWidth: resizeTarget.domNode.getBoundingClientRect().width,
    };
    setIsDragging(true);
  }, [resizeTarget]);

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e) => {
      const dx = e.clientX - dragRef.current.startX;
      commitImageWidth(dragRef.current.startWidth + dx);
    };
    const handleUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, commitImageWidth]);

  // Custom image handler: upload immediately, insert URL (avoids base64 in content)
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await api.post('/forum/img/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data?.url;
        if (url && quillRef.current) {
          const editor = quillRef.current.getEditor();
          const range = editor.getSelection(true);
          editor.insertEmbed(range.index, 'image', url);
          editor.setSelection(range.index + 1);
        }
      } catch (err) {
        console.error('Image upload failed', err);
        if (alertsManagerRef?.current) {
          alertsManagerRef.current.showAlert('error', 'Bild konnte nicht hochgeladen werden');
        }
      } finally {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [alertsManagerRef]);

  // Click-to-select images for resize
  useEffect(() => {
    const quill = quillRef.current;
    if (!quill || readOnly) return;
    const editor = quill.getEditor();

    const handleClick = (e) => {
      const img = e.target.closest('img');
      if (!img) {
        setResizeTarget(null);
        return;
      }
      try {
        const blot = Quill.find(img);
        if (blot) {
          setResizeTarget({ blot, domNode: img });
          e.stopPropagation();
        }
      } catch {
        setResizeTarget(null);
      }
    };

    // Click outside any image clears selection
    const handleOutside = (e) => {
      if (!e.target.closest('img')) setResizeTarget(null);
    };

    editor.root.addEventListener('click', handleClick);
    document.addEventListener('click', handleOutside);
    return () => {
      editor.root.removeEventListener('click', handleClick);
      document.removeEventListener('click', handleOutside);
    };
  }, [readOnly]);

  const myModules = useMemo(() => {
    if (readOnly) return noModules;
    return {
      table: true, // Enables Quill's native table module
      toolbar: {
        container: [
          [{ size: ['huge', 'large', false, 'small'] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
          ['link', 'image', 'table'], // Added table tool here
          [{ align: [false, 'center', 'right'] }],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    };
  }, [readOnly, imageHandler]);

  if (readOnly) {
    return (
      <Box className="quill-viewer">
        <ReactQuill theme="snow" modules={noModules} value={value || ''} readOnly />
      </Box>
    );
  }

  const editorStyles = `
    .ql-editor img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      transition: outline 0.15s;
    }
    .ql-editor img:hover {
      outline: 2px solid rgba(255, 152, 0, 0.4);
      outline-offset: 2px;
    }
    .ql-editor.ql-blank::before {
      color: rgba(255, 255, 255, 0.55) !important;
      font-style: italic;
    }
  `;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: height || '100%', ...style }}>
      <style>{editorStyles}</style>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={myModules}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ height: '100%' }}
      />

      {/* Image resize handles — fixed-position overlay, driven by rAF */}
      {resizeTarget && (
        <>
          <Box
            ref={outlineRef}
            sx={{
              position: 'fixed',
              border: '2px solid #ff9800',
              pointerEvents: 'none',
              zIndex: 1300,
              borderRadius: '2px',
            }}
          />
          <Box
            ref={handleRef}
            onMouseDown={handleDragStart}
            sx={{
              position: 'fixed',
              width: 16,
              height: 16,
              bgcolor: '#ff9800',
              border: '2px solid #fff',
              cursor: 'nwse-resize',
              zIndex: 1301,
              boxShadow: '0 0 4px rgba(0,0,0,0.4)',
            }}
          />
        </>
      )}
    </Box>
  );
});

export default ForumQuill;
