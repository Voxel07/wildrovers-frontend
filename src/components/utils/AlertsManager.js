
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';

const AlertsManager = forwardRef((props, ref) => {
    const [alerts, setAlerts] = useState([]);

    // Function to add an alert to the state
    const showAlert = (severity, message) => {
      setAlerts((prevAlerts) => [
        ...prevAlerts,
        { id: new Date().getTime(), severity, message },
      ]);
    };
    // Function to remove an alert from the state
    const removeAlert = (id) => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
    };
    useImperativeHandle(ref, () => ({
      showAlert,
    }));
    return (
      // Render the alerts
      <div>
        {alerts.map((alert) => (
      <Slide
        key={alert.id}
        direction="up"
        in={true}
        mountOnEnter
        unmountOnExit
        onEnter={() => {
          setTimeout(() => {
            removeAlert(alert.id);
          }, 5000);
        }}
      >
        <Alert
          severity={alert.severity}
          onClose={() => removeAlert(alert.id)}
          sx={{ mb: 1 }}
        >
          {alert.message}
        </Alert>
      </Slide>
    ))}
      </div>
    );
  });
export { AlertsManager };