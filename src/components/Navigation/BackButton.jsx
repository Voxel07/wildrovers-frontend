import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function BackButton({ fallbackPath = '/Forum', children = 'Zurück', ...props }) {
  const navigate = useNavigate();

  const handleBack = useCallback((e) => {
    if (props.onClick) {
      props.onClick(e);
      if (e.defaultPrevented) return;
    }
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  }, [navigate, fallbackPath, props.onClick]);

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      {...props}
      onClick={handleBack}
    >
      {children}
    </Button>
  );
}
