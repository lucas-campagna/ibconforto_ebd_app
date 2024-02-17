import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'


const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(true);
  const [contentShow, setContentShow] = useState(true);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  function handleCancel(){
    setShow(false);
  }

  function handleInstall(){
    // Trigger the install prompt
    deferredPrompt.prompt();
    setContentShow(false)

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      setShow(false);
      if (choiceResult.outcome === 'accepted') {
        navigator.serviceWorker.register('/sw.js')
      }

      // Reset the deferredPrompt variable
      setDeferredPrompt(null);
    });
  }

  return (
    <>
    {
      deferredPrompt === null ?
        (<></>)
      : 
        (
        <Dialog open={show}>
          {
            contentShow ?
            <Stack
              direction='column'
              m={2}
              spacing={2}
            >
              <Typography maxWidth={300}>
                Instale o aplicativo para melhorar sua experiência
              </Typography>
              <Stack
                direction='row'
                justifyContent='center'
                spacing={2}
              >
                <Button size='small' onClick={handleCancel}>Não instalar</Button>
                <Button onClick={handleInstall}>Instalar</Button>
              </Stack>
            </Stack>
            :
            <></>
          }
        </Dialog>
      )
    }
    </>
  );
}

export default InstallPrompt;
