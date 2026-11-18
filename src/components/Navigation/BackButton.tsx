import { useCallback, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button, { type ButtonProps } from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackButtonProps extends ButtonProps {
  /** Where to go when there is no previous page in this tab. */
  fallbackPath?: string;
}

export default function BackButton({ fallbackPath = '/Forum', children = 'Zurück', ...props }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = useCallback((e: MouseEvent<HTMLButtonElement>) => {
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
