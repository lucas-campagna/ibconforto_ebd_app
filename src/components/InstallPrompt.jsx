import React, { useEffect, useState } from 'react';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
    //   setDeferredPrompt(event);
      console.log('handleBeforeInstallPrompt')
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  console.log('InstallPrompt')


//   const showInstallButton = () => {
//     if (deferredPrompt) {
//       // Display an install button or other UI element
//       // e.g., you can show a button that calls deferredPrompt.prompt() when clicked
//       const installButton = document.getElementById('install-button');

//       installButton.addEventListener('click', () => {
//         // Trigger the install prompt
//         deferredPrompt.prompt();

//         // Wait for the user to respond to the prompt
//         deferredPrompt.userChoice.then((choiceResult) => {
//           if (choiceResult.outcome === 'accepted') {
//             console.log('User accepted the install prompt');
//           } else {
//             console.log('User dismissed the install prompt');
//           }

//           // Reset the deferredPrompt variable
//           setDeferredPrompt(null);
//         });
//       });
//     }
//   };

  return (
    <div>
      {/* <button id="install-button" onClick={showInstallButton}>
        Install App
      </button> */}
    </div>
  );
};

export default InstallPrompt;
